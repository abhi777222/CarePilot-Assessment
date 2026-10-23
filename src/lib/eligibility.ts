import { TemperatureRecord, DischargeEligibilityResult } from "@/types/quarantine";
import { FACILITY_CONFIG } from "./constants";

/**
 * Helper to get the previous calendar day in "YYYY-MM-DD" format.
 */
export function getPreviousDate(dateStr: string, daysAgo: number = 1): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

/**
 * Helper to get today's calendar date in local timezone "YYYY-MM-DD".
 */
export function getLocalDateString(d?: Date): string {
  const dateObj = d ?? new Date();
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Calculates whether a patient is eligible for discharge based on the requirement:
 * "A patient becomes eligible for discharge after three full consecutive fever-free days."
 *
 * Clinical Rules Implemented:
 * 1. Fever Threshold: Readings >= FEVER_THRESHOLD_CELSIUS (default 37.5°C) count as fever.
 * 2. Missing readings DO NOT count as fever-free days.
 * 3. Any fever reading immediately resets the consecutive count to 0.
 * 4. Only full calendar days with valid recorded temperature < 37.5°C count.
 * 5. Isolated logic to allow clinical re-interpretation if needed.
 *
 * @param patientId The unique patient identifier
 * @param records All temperature records in the facility
 * @param referenceDate The date of evaluation
 */
export function calculateDischargeEligibility(
  patientId: string,
  records: TemperatureRecord[],
  referenceDate: string = "2026-10-23"
): DischargeEligibilityResult {
  const patientRecords = records.filter((r) => r.patientId === patientId);

  // Group readings by calendar date
  const recordsByDate = new Map<string, number[]>();
  for (const r of patientRecords) {
    const list = recordsByDate.get(r.date) || [];
    list.push(r.temperature);
    recordsByDate.set(r.date, list);
  }

  const hasTodayReading = recordsByDate.has(referenceDate);

  // Check if today has a reading and if it has a fever
  if (hasTodayReading) {
    const todayTemps = recordsByDate.get(referenceDate)!;
    const hasTodayFever = todayTemps.some(
      (t) => t >= FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS
    );
    if (hasTodayFever) {
      return {
        isEligible: false,
        consecutiveFeverFreeDays: 0,
        feverFreeDates: [],
        reason: `Fever detected today (${Math.max(...todayTemps).toFixed(1)}°C ≥ ${FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS}°C). Consecutive streak reset to 0.`,
        hasTodayReading: true,
      };
    }
  }

  // To determine consecutive fever-free calendar days:
  // We trace backwards day-by-day starting from either:
  // - referenceDate (if today already has a recorded temperature)
  // - or referenceDate - 1 day (if today's reading is pending)
  const startDay = hasTodayReading ? referenceDate : getPreviousDate(referenceDate, 1);

  const qualifyingDates: string[] = [];
  let currentDate = startDay;
  let brokenReason = "";

  for (let i = 0; i < 30; i++) {
    // Check if currentDate has records
    const dayTemps = recordsByDate.get(currentDate);

    if (!dayTemps || dayTemps.length === 0) {
      // Day is missing a recorded temperature
      if (qualifyingDates.length === 0) {
        brokenReason = hasTodayReading
          ? `Missing temperature check on ${currentDate}.`
          : `Today's temperature check is pending, and ${currentDate} was missing.`;
      } else {
        brokenReason = `Gap in records: No temperature recorded on ${currentDate}.`;
      }
      break;
    }

    const maxTempOnDay = Math.max(...dayTemps);
    if (maxTempOnDay >= FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS) {
      // Fever occurred on this day -> resets streak
      brokenReason = `Fever detected on ${currentDate} (${maxTempOnDay.toFixed(1)}°C). Streak broken.`;
      break;
    }

    // Day is confirmed fever-free
    qualifyingDates.push(currentDate);
    currentDate = getPreviousDate(currentDate, 1);

    // If we've reached or exceeded the required consecutive days, we can stop tracing
    if (qualifyingDates.length >= FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS) {
      break;
    }
  }

  const consecutiveCount = qualifyingDates.length;
  const isEligible =
    consecutiveCount >= FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS;

  let reason = "";
  if (isEligible) {
    reason = `Qualified: ${consecutiveCount} consecutive fever-free days recorded (${qualifyingDates
      .slice(0, 3)
      .reverse()
      .join(", ")}).`;
  } else {
    reason =
      brokenReason ||
      `Only ${consecutiveCount}/${FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS} fever-free days recorded. Needs ${
        FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS - consecutiveCount
      } more consecutive fever-free day(s).`;
  }

  return {
    isEligible,
    consecutiveFeverFreeDays: consecutiveCount,
    feverFreeDates: qualifyingDates.slice(0, FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS).reverse(),
    reason,
    hasTodayReading,
  };
}
