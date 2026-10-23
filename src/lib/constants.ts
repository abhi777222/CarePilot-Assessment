/**
 * Clinical and Facility Configuration Constants
 *
 * NOTE: The clinical fever threshold is isolated here as a configurable constant
 * per the assessment guidelines. The default 37.5°C is a demo assumption until
 * confirmed by the clinical assessment team.
 */
export const FACILITY_CONFIG = {
  // Maximum active patient capacity
  MAX_BED_CAPACITY: 74,

  // Clinical fever threshold in Celsius (>= threshold is fever, < threshold is fever-free)
  FEVER_THRESHOLD_CELSIUS: 37.5,

  // Required consecutive full calendar days without fever for discharge eligibility
  REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS: 3,

  // Public health benchmarks for treatment facility evaluation
  MORTALITY_BENCHMARK_PERCENT: 15.0, // Alert triggered if mortality exceeds this
  RECOVERY_BENCHMARK_PERCENT: 85.0,  // Target success rate

  // Realistic input range validation for human body temperature in Celsius
  VALID_TEMP_MIN: 34.0,
  VALID_TEMP_MAX: 43.0,
} as const;

export const DEFAULT_NURSES = [
  "Nurse Anjali Sharma, RN",
  "Nurse Deepak Patel, BSN",
  "Nurse Lakshmi Nair, RN",
  "Nurse Rahul Verma, GNM",
];

export const DEFAULT_DOCTORS = [
  "Dr. Rajiv Menon, MD (Infectious Disease)",
  "Dr. Sunita Kulkarni, MD (Pulmonology)",
  "Dr. Aditi Bhargava, MD (Critical Care)",
];
