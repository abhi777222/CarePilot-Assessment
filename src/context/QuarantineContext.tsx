"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  Patient,
  TemperatureRecord,
  DoctorVisit,
  UserRole,
  FacilityStats,
  DischargeEligibilityResult,
} from "@/types/quarantine";
import { FACILITY_CONFIG } from "@/lib/constants";
import { calculateDischargeEligibility, getLocalDateString } from "@/lib/eligibility";
import { getInitialDemoData } from "@/lib/initial-data";

interface QuarantineContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  systemDate: string;
  setSystemDate: (date: string) => void;
  patients: Patient[];
  temperatureRecords: TemperatureRecord[];
  doctorVisits: DoctorVisit[];
  stats: FacilityStats;
  availableBedsList: string[];
  // Actions
  recordTemperature: (
    patientId: string,
    temperature: number,
    nurseId: string
  ) => { success: boolean; error?: string };
  completeDoctorVisit: (
    patientId: string,
    treatmentNotes: string,
    doctorName: string
  ) => { success: boolean; error?: string };
  confirmDischarge: (patientId: string) => { success: boolean; error?: string };
  recordDeceased: (patientId: string, notes?: string) => { success: boolean; error?: string };
  admitPatient: (data: {
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    bedNumber: string;
    diagnosis?: string;
  }) => { success: boolean; error?: string };
  resetDemoData: () => void;
  getPatientEligibility: (patientId: string) => DischargeEligibilityResult;
  hasTodayTemperature: (patientId: string) => boolean;
  getTodayTemperatureRecord: (patientId: string) => TemperatureRecord | undefined;
  hasTodayDoctorVisit: (patientId: string) => boolean;
  getTodayDoctorVisit: (patientId: string) => DoctorVisit | undefined;
}

const QuarantineContext = createContext<QuarantineContextType | null>(null);

const STORAGE_KEY = "quarantine_facility_state_v2";

export function QuarantineProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("nurse");
  const [systemDate, setSystemDate] = useState<string>("2026-10-23");
  const [isInitialized, setIsInitialized] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [temperatureRecords, setTemperatureRecords] = useState<TemperatureRecord[]>([]);
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>([]);

  // Load from localStorage or initialize with demo data on mount
  useEffect(() => {
    const today = getLocalDateString();
    setSystemDate(today);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.patients && parsed.temperatureRecords && parsed.doctorVisits) {
          setPatients(parsed.patients);
          setTemperatureRecords(parsed.temperatureRecords);
          setDoctorVisits(parsed.doctorVisits);
          if (parsed.role) setRole(parsed.role);
          setIsInitialized(true);
          return;
        }
      }
    } catch {
      // Fallback if parsing fails
    }

    // Initialize with demo data
    const initial = getInitialDemoData(today);
    setPatients(initial.initialPatients);
    setTemperatureRecords(initial.initialTempRecords);
    setDoctorVisits(initial.initialDoctorVisits);
    setIsInitialized(true);
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          patients,
          temperatureRecords,
          doctorVisits,
          role,
        })
      );
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  }, [patients, temperatureRecords, doctorVisits, role, isInitialized]);

  // Recalculate discharge eligibility on patients when temperature records change
  useEffect(() => {
    if (!isInitialized || patients.length === 0) return;

    let hasChange = false;
    const updated = patients.map((p) => {
      if (p.status !== "active" && p.status !== "discharge_eligible") {
        return p;
      }
      const elig = calculateDischargeEligibility(p.id, temperatureRecords, systemDate);
      if (elig.isEligible && p.status === "active") {
        hasChange = true;
        return { ...p, status: "discharge_eligible" as const };
      }
      if (!elig.isEligible && p.status === "discharge_eligible") {
        hasChange = true;
        return { ...p, status: "active" as const };
      }
      return p;
    });

    if (hasChange) {
      setPatients(updated);
    }
  }, [temperatureRecords, systemDate, isInitialized]);

  // Query helpers
  const getPatientEligibility = useCallback(
    (patientId: string): DischargeEligibilityResult => {
      return calculateDischargeEligibility(patientId, temperatureRecords, systemDate);
    },
    [temperatureRecords, systemDate]
  );

  const getTodayTemperatureRecord = useCallback(
    (patientId: string): TemperatureRecord | undefined => {
      return temperatureRecords.find(
        (r) => r.patientId === patientId && r.date === systemDate
      );
    },
    [temperatureRecords, systemDate]
  );

  const hasTodayTemperature = useCallback(
    (patientId: string): boolean => {
      return !!getTodayTemperatureRecord(patientId);
    },
    [getTodayTemperatureRecord]
  );

  const getTodayDoctorVisit = useCallback(
    (patientId: string): DoctorVisit | undefined => {
      return doctorVisits.find(
        (v) => v.patientId === patientId && v.date === systemDate && v.completed
      );
    },
    [doctorVisits, systemDate]
  );

  const hasTodayDoctorVisit = useCallback(
    (patientId: string): boolean => {
      return !!getTodayDoctorVisit(patientId);
    },
    [getTodayDoctorVisit]
  );

  // Compute facility statistics
  const stats = useMemo<FacilityStats>(() => {
    const active = patients.filter(
      (p) => p.status === "active" || p.status === "discharge_eligible"
    );
    const occupied = active.length;
    const available = Math.max(0, FACILITY_CONFIG.MAX_BED_CAPACITY - occupied);

    const recovered = patients.filter((p) => p.outcome === "recovered").length;
    const deceased = patients.filter((p) => p.outcome === "deceased").length;
    const completed = recovered + deceased;

    const mortalityRate =
      completed > 0 ? Number(((deceased / completed) * 100).toFixed(1)) : 0;
    const recoveryRate =
      completed > 0 ? Number(((recovered / completed) * 100).toFixed(1)) : 0;

    const mortalityAlert = mortalityRate > FACILITY_CONFIG.MORTALITY_BENCHMARK_PERCENT;

    return {
      totalCapacity: FACILITY_CONFIG.MAX_BED_CAPACITY,
      activePatients: occupied,
      occupiedBeds: occupied,
      availableBeds: available,
      totalRecovered: recovered,
      totalDeceased: deceased,
      completedOutcomes: completed,
      mortalityRate,
      recoveryRate,
      mortalityAlert,
    };
  }, [patients]);

  // Available beds list out of 74
  const availableBedsList = useMemo(() => {
    const activeBedNumbers = new Set(
      patients
        .filter((p) => p.status === "active" || p.status === "discharge_eligible")
        .map((p) => p.bedNumber)
    );
    const list: string[] = [];
    for (let i = 1; i <= FACILITY_CONFIG.MAX_BED_CAPACITY; i++) {
      const bedId = `B-${String(i).padStart(2, "0")}`;
      if (!activeBedNumbers.has(bedId)) {
        list.push(bedId);
      }
    }
    return list;
  }, [patients]);

  // Action: Record Temperature (with duplicate check & range validation)
  const recordTemperature = useCallback(
    (
      patientId: string,
      temperature: number,
      nurseId: string
    ): { success: boolean; error?: string } => {
      // 1. Validate temperature range
      if (
        isNaN(temperature) ||
        temperature < FACILITY_CONFIG.VALID_TEMP_MIN ||
        temperature > FACILITY_CONFIG.VALID_TEMP_MAX
      ) {
        return {
          success: false,
          error: `Invalid temperature. Please enter a valid body temperature between ${FACILITY_CONFIG.VALID_TEMP_MIN}°C and ${FACILITY_CONFIG.VALID_TEMP_MAX}°C.`,
        };
      }

      // 2. Prevent accidental duplicate on same calendar day
      const existing = temperatureRecords.find(
        (r) => r.patientId === patientId && r.date === systemDate
      );
      if (existing) {
        return {
          success: false,
          error: `A temperature (${existing.temperature.toFixed(1)}°C) has already been recorded for this patient on ${systemDate}. Duplicate daily entries are strictly prevented.`,
        };
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const newRecord: TemperatureRecord = {
        id: `TR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patientId,
        date: systemDate,
        time: timeStr,
        temperature: Number(temperature.toFixed(1)),
        nurseId,
        timestamp: Date.now(),
      };

      setTemperatureRecords((prev) => [...prev, newRecord]);
      return { success: true };
    },
    [temperatureRecords, systemDate]
  );

  // Action: Complete Doctor Visit (must follow today's temperature check)
  const completeDoctorVisit = useCallback(
    (
      patientId: string,
      treatmentNotes: string,
      doctorName: string
    ): { success: boolean; error?: string } => {
      // 1. Verify that today's temperature has been recorded
      const hasTempToday = temperatureRecords.some(
        (r) => r.patientId === patientId && r.date === systemDate
      );
      if (!hasTempToday) {
        return {
          success: false,
          error: "Prerequisite not met: A doctor visit cannot be completed before today's temperature check has been recorded by a nurse.",
        };
      }

      // 2. Prevent duplicate completed visit today
      const existingVisit = doctorVisits.find(
        (v) => v.patientId === patientId && v.date === systemDate && v.completed
      );
      if (existingVisit) {
        return {
          success: false,
          error: `Doctor visit was already marked completed for this patient today (${existingVisit.completedAt} by ${existingVisit.doctorName}).`,
        };
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const newVisit: DoctorVisit = {
        id: `DV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        patientId,
        date: systemDate,
        completed: true,
        completedAt: timeStr,
        doctorName,
        treatmentNotes: treatmentNotes.trim() || "Daily rounds complete. Vitals reviewed.",
      };

      setDoctorVisits((prev) => [...prev, newVisit]);
      return { success: true };
    },
    [temperatureRecords, doctorVisits, systemDate]
  );

  // Action: Confirm Discharge (Admin only)
  const confirmDischarge = useCallback(
    (patientId: string): { success: boolean; error?: string } => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) {
        return { success: false, error: "Patient not found." };
      }

      const elig = calculateDischargeEligibility(patientId, temperatureRecords, systemDate);
      if (!elig.isEligible && patient.status !== "discharge_eligible") {
        return {
          success: false,
          error: `Cannot discharge: Patient has not completed 3 consecutive fever-free days (${elig.reason}).`,
        };
      }

      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === patientId) {
            return {
              ...p,
              status: "discharged",
              outcome: "recovered",
              dischargeDate: systemDate,
            };
          }
          return p;
        })
      );

      return { success: true };
    },
    [patients, temperatureRecords, systemDate]
  );

  // Action: Record Deceased (Admin action)
  const recordDeceased = useCallback(
    (patientId: string, notes?: string): { success: boolean; error?: string } => {
      const patient = patients.find((p) => p.id === patientId);
      if (!patient) {
        return { success: false, error: "Patient not found." };
      }

      setPatients((prev) =>
        prev.map((p) => {
          if (p.id === patientId) {
            return {
              ...p,
              status: "deceased",
              outcome: "deceased",
              dischargeDate: systemDate,
              notes: notes || p.notes,
            };
          }
          return p;
        })
      );

      return { success: true };
    },
    [patients, systemDate]
  );

  // Action: Admit Patient (strict 74-bed capacity enforcement)
  const admitPatient = useCallback(
    (data: {
      name: string;
      age: number;
      gender: "Male" | "Female" | "Other";
      bedNumber: string;
      diagnosis?: string;
    }): { success: boolean; error?: string } => {
      const activeCount = patients.filter(
        (p) => p.status === "active" || p.status === "discharge_eligible"
      ).length;

      if (activeCount >= FACILITY_CONFIG.MAX_BED_CAPACITY) {
        return {
          success: false,
          error: `Admissions blocked: Facility has reached its maximum capacity of ${FACILITY_CONFIG.MAX_BED_CAPACITY} active patients. All beds are occupied.`,
        };
      }

      // Check if selected bed is occupied
      const bedOccupied = patients.some(
        (p) =>
          (p.status === "active" || p.status === "discharge_eligible") &&
          p.bedNumber === data.bedNumber
      );
      if (bedOccupied) {
        return {
          success: false,
          error: `Bed ${data.bedNumber} is already occupied by an active patient.`,
        };
      }

      const newId = `P-${String(patients.length + 101).padStart(3, "0")}`;
      const newPatient: Patient = {
        id: newId,
        name: data.name.trim(),
        age: Number(data.age),
        gender: data.gender,
        bedNumber: data.bedNumber,
        admissionDate: systemDate,
        status: "active",
        outcome: null,
        diagnosis: data.diagnosis?.trim() || "Quarantine Intake",
      };

      setPatients((prev) => [newPatient, ...prev]);
      return { success: true };
    },
    [patients, systemDate]
  );

  // Action: Reset Demo Data
  const resetDemoData = useCallback(() => {
    const today = getLocalDateString();
    const initial = getInitialDemoData(today);
    setPatients(initial.initialPatients);
    setTemperatureRecords(initial.initialTempRecords);
    setDoctorVisits(initial.initialDoctorVisits);
    setSystemDate(today);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <QuarantineContext.Provider
      value={{
        role,
        setRole,
        systemDate,
        setSystemDate,
        patients,
        temperatureRecords,
        doctorVisits,
        stats,
        availableBedsList,
        recordTemperature,
        completeDoctorVisit,
        confirmDischarge,
        recordDeceased,
        admitPatient,
        resetDemoData,
        getPatientEligibility,
        hasTodayTemperature,
        getTodayTemperatureRecord,
        hasTodayDoctorVisit,
        getTodayDoctorVisit,
      }}
    >
      {children}
    </QuarantineContext.Provider>
  );
}

export function useQuarantine() {
  const ctx = useContext(QuarantineContext);
  if (!ctx) {
    throw new Error("useQuarantine must be used within a QuarantineProvider");
  }
  return ctx;
}
