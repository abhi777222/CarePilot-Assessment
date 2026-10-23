import { Patient, TemperatureRecord, DoctorVisit } from "@/types/quarantine";
import { getLocalDateString, getPreviousDate } from "./eligibility";

export function getInitialDemoData(baseDate: string = "2026-10-23") {
  const today = baseDate;
  const dMinus1 = getPreviousDate(today, 1);
  const dMinus2 = getPreviousDate(today, 2);
  const dMinus3 = getPreviousDate(today, 3);
  const dMinus4 = getPreviousDate(today, 4);
  const dMinus5 = getPreviousDate(today, 5);

  const initialPatients: Patient[] = [
    {
      id: "P-101",
      name: "Elena Rostova",
      age: 34,
      gender: "Female",
      bedNumber: "B-01",
      admissionDate: dMinus4,
      status: "active",
      outcome: null,
      diagnosis: "Acute Viral Syndrome - Mild",
    },
    {
      id: "P-102",
      name: "Liam Gallagher",
      age: 42,
      gender: "Male",
      bedNumber: "B-02",
      admissionDate: dMinus3,
      status: "active",
      outcome: null,
      diagnosis: "Viral Pneumonitis - Moderate",
    },
    {
      id: "P-103",
      name: "Amara Okafor",
      age: 29,
      gender: "Female",
      bedNumber: "B-03",
      admissionDate: dMinus5,
      status: "discharge_eligible",
      outcome: null,
      diagnosis: "Post-Viral Convalescence",
    },
    {
      id: "P-104",
      name: "Chen Wei",
      age: 51,
      gender: "Male",
      bedNumber: "B-04",
      admissionDate: dMinus4,
      status: "active",
      outcome: null,
      diagnosis: "Viral Bronchitis with Pyrexia",
    },
    {
      id: "P-105",
      name: "Sofia Martinez",
      age: 38,
      gender: "Female",
      bedNumber: "B-05",
      admissionDate: dMinus4,
      status: "active",
      outcome: null,
      diagnosis: "Viral Upper Respiratory Infection",
    },
    {
      id: "P-106",
      name: "Marcus Sterling",
      age: 63,
      gender: "Male",
      bedNumber: "B-06",
      admissionDate: dMinus3,
      status: "active",
      outcome: null,
      diagnosis: "Viral Malaise - Monitoring",
    },
    {
      id: "P-107",
      name: "Fatima Al-Mansoor",
      age: 26,
      gender: "Female",
      bedNumber: "B-07",
      admissionDate: today,
      status: "active",
      outcome: null,
      diagnosis: "New Intake - Exposure Quarantine",
    },
    {
      id: "P-108",
      name: "Daniel Kim",
      age: 47,
      gender: "Male",
      bedNumber: "B-08",
      admissionDate: dMinus5,
      status: "discharge_eligible",
      outcome: null,
      diagnosis: "Resolved Viral Infection",
    },
    // Completed Outcomes (Historical Discharged & Deceased)
    {
      id: "P-090",
      name: "Hannah Schmidt",
      age: 31,
      gender: "Female",
      bedNumber: "B-09",
      admissionDate: dMinus5,
      dischargeDate: dMinus1,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Viral Convalescence",
    },
    {
      id: "P-091",
      name: "Arthur Pendelton",
      age: 72,
      gender: "Male",
      bedNumber: "B-10",
      admissionDate: dMinus5,
      dischargeDate: dMinus2,
      status: "deceased",
      outcome: "deceased",
      diagnosis: "Severe Acute Respiratory Distress",
    },
    {
      id: "P-092",
      name: "Grace Hopper",
      age: 45,
      gender: "Female",
      bedNumber: "B-11",
      admissionDate: dMinus5,
      dischargeDate: dMinus2,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Mild Viral Syndrome",
    },
    {
      id: "P-093",
      name: "Noah Jackson",
      age: 23,
      gender: "Male",
      bedNumber: "B-12",
      admissionDate: dMinus5,
      dischargeDate: dMinus3,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Viral Exposure Convalescence",
    },
    {
      id: "P-094",
      name: "Chloe Bennett",
      age: 39,
      gender: "Female",
      bedNumber: "B-13",
      admissionDate: dMinus5,
      dischargeDate: dMinus1,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Illness",
    },
    {
      id: "P-095",
      name: "Tariq Morales",
      age: 50,
      gender: "Male",
      bedNumber: "B-14",
      admissionDate: dMinus5,
      dischargeDate: dMinus2,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Infection",
    },
    {
      id: "P-096",
      name: "Zoe Patel",
      age: 35,
      gender: "Female",
      bedNumber: "B-15",
      admissionDate: dMinus5,
      dischargeDate: dMinus1,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Illness",
    },
    {
      id: "P-097",
      name: "Klaus Wagner",
      age: 41,
      gender: "Male",
      bedNumber: "B-16",
      admissionDate: dMinus5,
      dischargeDate: dMinus3,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Illness",
    },
    {
      id: "P-098",
      name: "Beatrice Webb",
      age: 28,
      gender: "Female",
      bedNumber: "B-17",
      admissionDate: dMinus5,
      dischargeDate: dMinus2,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Infection",
    },
    {
      id: "P-099",
      name: "Ethan Wright",
      age: 55,
      gender: "Male",
      bedNumber: "B-18",
      admissionDate: dMinus5,
      dischargeDate: dMinus1,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Illness",
    },
  ];

  // Temperature Records
  const initialTempRecords: TemperatureRecord[] = [
    // P-101: Pending today (no reading for today). Previous days fever-free.
    {
      id: "TR-101-1",
      patientId: "P-101",
      date: dMinus2,
      time: "08:15",
      temperature: 36.6,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 172800000,
    },
    {
      id: "TR-101-2",
      patientId: "P-101",
      date: dMinus1,
      time: "08:30",
      temperature: 36.8,
      nurseId: "Nurse David Chen, BSN",
      timestamp: Date.now() - 86400000,
    },

    // P-102: Temperature recorded today! Ready for Doctor visit.
    {
      id: "TR-102-1",
      patientId: "P-102",
      date: dMinus2,
      time: "08:45",
      temperature: 37.0,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 172800000,
    },
    {
      id: "TR-102-2",
      patientId: "P-102",
      date: dMinus1,
      time: "09:00",
      temperature: 36.9,
      nurseId: "Nurse Maria Rodriguez, RN",
      timestamp: Date.now() - 86400000,
    },
    {
      id: "TR-102-3",
      patientId: "P-102",
      date: today,
      time: "08:10",
      temperature: 36.7,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 18000000,
    },

    // P-103: 3 full consecutive fever-free days recorded! Eligible for discharge.
    {
      id: "TR-103-1",
      patientId: "P-103",
      date: dMinus3,
      time: "08:00",
      temperature: 37.8, // Fever on dMinus3
      nurseId: "Nurse David Chen, BSN",
      timestamp: Date.now() - 259200000,
    },
    {
      id: "TR-103-2",
      patientId: "P-103",
      date: dMinus2,
      time: "08:30",
      temperature: 36.6, // Fever-free day 1
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 172800000,
    },
    {
      id: "TR-103-3",
      patientId: "P-103",
      date: dMinus1,
      time: "08:30",
      temperature: 36.5, // Fever-free day 2
      nurseId: "Nurse Maria Rodriguez, RN",
      timestamp: Date.now() - 86400000,
    },
    {
      id: "TR-103-4",
      patientId: "P-103",
      date: today,
      time: "08:00",
      temperature: 36.4, // Fever-free day 3!
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 18000000,
    },

    // P-104: Had fever yesterday (38.4°C). Today temp recorded (37.2°C). Streak = 1.
    {
      id: "TR-104-1",
      patientId: "P-104",
      date: dMinus2,
      time: "09:15",
      temperature: 37.1,
      nurseId: "Nurse David Chen, BSN",
      timestamp: Date.now() - 172800000,
    },
    {
      id: "TR-104-2",
      patientId: "P-104",
      date: dMinus1,
      time: "09:30",
      temperature: 38.4, // Fever!
      nurseId: "Nurse Alex Thompson, LPN",
      timestamp: Date.now() - 86400000,
    },
    {
      id: "TR-104-3",
      patientId: "P-104",
      date: today,
      time: "08:45",
      temperature: 37.2,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 15000000,
    },

    // P-105: Missing check yesterday. Streak broken by missing reading.
    {
      id: "TR-105-1",
      patientId: "P-105",
      date: dMinus2,
      time: "10:00",
      temperature: 36.7,
      nurseId: "Nurse Maria Rodriguez, RN",
      timestamp: Date.now() - 172800000,
    },
    // No reading for dMinus1 (gap)
    {
      id: "TR-105-2",
      patientId: "P-105",
      date: today,
      time: "09:00",
      temperature: 36.6,
      nurseId: "Nurse David Chen, BSN",
      timestamp: Date.now() - 12000000,
    },

    // P-106: 2 consecutive fever-free days (yesterday, today). Needs 1 more day.
    {
      id: "TR-106-1",
      patientId: "P-106",
      date: dMinus1,
      time: "08:15",
      temperature: 36.7,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 86400000,
    },
    {
      id: "TR-106-2",
      patientId: "P-106",
      date: today,
      time: "08:20",
      temperature: 36.8,
      nurseId: "Nurse Alex Thompson, LPN",
      timestamp: Date.now() - 18000000,
    },

    // P-107: New admission today, no temperature check yet.

    // P-108: 3 consecutive fever-free days recorded (dMinus2, dMinus1, today). Eligible!
    {
      id: "TR-108-1",
      patientId: "P-108",
      date: dMinus2,
      time: "07:45",
      temperature: 36.5,
      nurseId: "Nurse David Chen, BSN",
      timestamp: Date.now() - 172800000,
    },
    {
      id: "TR-108-2",
      patientId: "P-108",
      date: dMinus1,
      time: "08:00",
      temperature: 36.6,
      nurseId: "Nurse Maria Rodriguez, RN",
      timestamp: Date.now() - 86400000,
    },
    {
      id: "TR-108-3",
      patientId: "P-108",
      date: today,
      time: "08:05",
      temperature: 36.4,
      nurseId: "Nurse Sarah Jenkins, RN",
      timestamp: Date.now() - 18000000,
    },
  ];

  // Doctor Visits
  const initialDoctorVisits: DoctorVisit[] = [
    // P-101: Yesterday visit was complete. Today visit pending (and temp is pending too).
    {
      id: "DV-101-1",
      patientId: "P-101",
      date: dMinus1,
      completed: true,
      completedAt: "11:30",
      doctorName: "Dr. Evelyn Vance, MD (Infectious Disease)",
      treatmentNotes: "Patient resting comfortably. Vitals stable.",
    },

    // P-102: Today's visit is PENDING (temperature recorded this morning). Ready for doctor!
    {
      id: "DV-102-1",
      patientId: "P-102",
      date: dMinus1,
      completed: true,
      completedAt: "12:15",
      doctorName: "Dr. Marcus Brody, MD (Pulmonology)",
      treatmentNotes: "Bilateral lung sounds improved. Continuing supportive care.",
    },

    // P-103: Today's visit is COMPLETED.
    {
      id: "DV-103-1",
      patientId: "P-103",
      date: today,
      completed: true,
      completedAt: "10:00",
      doctorName: "Dr. Evelyn Vance, MD (Infectious Disease)",
      treatmentNotes: "Patient asymptomatic for 72+ hours. Ready for administrative discharge.",
    },

    // P-104: Today's visit is PENDING (temp recorded this morning).
    {
      id: "DV-104-1",
      patientId: "P-104",
      date: dMinus1,
      completed: true,
      completedAt: "14:00",
      doctorName: "Dr. Anita Sharma, MD (Internal Medicine)",
      treatmentNotes: "Fever spike noted (38.4°C). Administered antipyretics and fluids.",
    },

    // P-106: Today's visit is PENDING.
    {
      id: "DV-106-1",
      patientId: "P-106",
      date: dMinus1,
      completed: true,
      completedAt: "11:00",
      doctorName: "Dr. Evelyn Vance, MD (Infectious Disease)",
      treatmentNotes: "Stable condition.",
    },

    // P-108: Today's visit COMPLETED.
    {
      id: "DV-108-1",
      patientId: "P-108",
      date: today,
      completed: true,
      completedAt: "09:30",
      doctorName: "Dr. Anita Sharma, MD (Internal Medicine)",
      treatmentNotes: "No fever, clear lungs. Concurs with discharge readiness.",
    },
  ];

  return { initialPatients, initialTempRecords, initialDoctorVisits };
}
