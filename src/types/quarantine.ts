export type UserRole = 'nurse' | 'doctor' | 'admin';

export type PatientStatus = 'active' | 'discharge_eligible' | 'discharged' | 'deceased';

export type PatientOutcome = 'recovered' | 'deceased' | null;

export interface Patient {
  id: string; // e.g., "P-101"
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bedNumber: string; // e.g., "B-12"
  admissionDate: string; // "YYYY-MM-DD"
  status: PatientStatus;
  outcome: PatientOutcome;
  diagnosis?: string;
  dischargeDate?: string;
  notes?: string;
}

export interface TemperatureRecord {
  id: string;
  patientId: string;
  date: string; // Calendar date "YYYY-MM-DD"
  time: string; // "HH:mm"
  temperature: number; // in Celsius (e.g. 36.8)
  nurseId: string; // e.g. "Nurse Sarah Jenkins"
  timestamp: number;
}

export interface DoctorVisit {
  id: string;
  patientId: string;
  date: string; // Calendar date "YYYY-MM-DD"
  completed: boolean;
  completedAt?: string; // "HH:mm"
  doctorName: string;
  treatmentNotes: string;
}

export interface DischargeEligibilityResult {
  isEligible: boolean;
  consecutiveFeverFreeDays: number;
  feverFreeDates: string[];
  reason: string;
  hasTodayReading: boolean;
}

export interface FacilityStats {
  totalCapacity: number; // 74
  activePatients: number;
  occupiedBeds: number;
  availableBeds: number;
  totalRecovered: number;
  totalDeceased: number;
  completedOutcomes: number;
  mortalityRate: number; // percentage (0 - 100)
  recoveryRate: number; // percentage (0 - 100)
  mortalityAlert: boolean; // true if mortalityRate > 15%
}
