import { Patient, TemperatureRecord, DoctorVisit } from "@/types/quarantine";
import { getLocalDateString, getPreviousDate } from "./eligibility";
import { DEFAULT_DOCTORS, DEFAULT_NURSES } from "./constants";

const INDIAN_NAMES: Array<{ name: string; gender: "Male" | "Female" }> = [
  { name: "Aarav Sharma", gender: "Male" },
  { name: "Priya Patel", gender: "Female" },
  { name: "Rajesh Verma", gender: "Male" },
  { name: "Ananya Iyer", gender: "Female" },
  { name: "Rohan Gupta", gender: "Male" },
  { name: "Sunita Rao", gender: "Female" },
  { name: "Vikram Malhotra", gender: "Male" },
  { name: "Meera Nair", gender: "Female" },
  { name: "Amit Singhania", gender: "Male" },
  { name: "Deepa Deshmukh", gender: "Female" },
  { name: "Sanjay Joshi", gender: "Male" },
  { name: "Kavita Reddy", gender: "Female" },
  { name: "Suresh Menon", gender: "Male" },
  { name: "Pooja Banerjee", gender: "Female" },
  { name: "Manoj Tiwari", gender: "Male" },
  { name: "Neha Mukherjee", gender: "Female" },
  { name: "Arjun Kapoor", gender: "Male" },
  { name: "Ritu Saxena", gender: "Female" },
  { name: "Harish Chawla", gender: "Male" },
  { name: "Shweta Kulkarni", gender: "Female" },
  { name: "Aditya Bhattacharya", gender: "Male" },
  { name: "Divya Pillai", gender: "Female" },
  { name: "Gautam Sen", gender: "Male" },
  { name: "Kritika Agarwal", gender: "Female" },
  { name: "Kunal Mehra", gender: "Male" },
  { name: "Tanvi Choudhury", gender: "Female" },
  { name: "Naveen Nambiar", gender: "Male" },
  { name: "Swati Bhosle", gender: "Female" },
  { name: "Vivek Sundaram", gender: "Male" },
  { name: "Pallavi Ghosh", gender: "Female" },
  { name: "Alok Pandey", gender: "Male" },
  { name: "Madhuri Hegde", gender: "Female" },
  { name: "Tarun Bajaj", gender: "Male" },
  { name: "Anuradha Shukla", gender: "Female" },
  { name: "Pranav Dixit", gender: "Male" },
  { name: "Sneha Kaushik", gender: "Female" },
  { name: "Ashok Singhal", gender: "Male" },
  { name: "Preeti Mishra", gender: "Female" },
  { name: "Dinesh Prabhu", gender: "Male" },
  { name: "Radha Venkatesh", gender: "Female" },
  { name: "Karthik Rajan", gender: "Male" },
  { name: "Bhavna Jain", gender: "Female" },
  { name: "Mohit Grover", gender: "Male" },
  { name: "Smita Sethi", gender: "Female" },
  { name: "Nitin Bhasin", gender: "Male" },
  { name: "Anjali Mathur", gender: "Female" },
  { name: "Prakash Dutta", gender: "Male" },
  { name: "Vidya Gokhale", gender: "Female" },
  { name: "Manish Somani", gender: "Male" },
  { name: "Rupal Vora", gender: "Female" },
  { name: "Siddharth Oberoi", gender: "Male" },
  { name: "Aparna Bhatt", gender: "Female" },
  { name: "Hemant Ahuja", gender: "Male" },
  { name: "Komal Rastogi", gender: "Female" },
  { name: "Sandeep Goel", gender: "Male" },
  { name: "Geeta Ranganathan", gender: "Female" },
  { name: "Rameshwar Dayal", gender: "Male" },
  { name: "Rashmi Tripathi", gender: "Female" },
  { name: "Ajay Natarajan", gender: "Male" },
  { name: "Isha Marwah", gender: "Female" },
  { name: "Varun Shenoy", gender: "Male" },
  { name: "Leela Kurian", gender: "Female" },
  { name: "Chetan Sodhi", gender: "Male" },
  { name: "Urmila Deol", gender: "Female" },
  { name: "Jitendra Solanki", gender: "Male" },
  { name: "Namrata Dalal", gender: "Female" },
  { name: "Anand Vasudevan", gender: "Male" },
  { name: "Shalini Dewan", gender: "Female" },
  { name: "Bhupendra Bisht", gender: "Male" },
  { name: "Sumanth Chadha", gender: "Male" },
  { name: "Deepak Srivastav", gender: "Male" },
  { name: "Kiran Mazumdar", gender: "Female" },
  { name: "Vikas Talwar", gender: "Male" },
  { name: "Jyoti Raghavan", gender: "Female" },
];

const HISTORICAL_INDIAN_NAMES: Array<{ name: string; gender: "Male" | "Female" }> = [
  { name: "Ratan Tata-Verma", gender: "Male" },
  { name: "Lata Mangeshkar-Patil", gender: "Female" },
  { name: "Vikram Sarabhai-Menon", gender: "Male" },
  { name: "Kalpana Chawla-Iyer", gender: "Female" },
  { name: "Homi Bhabha-Deshmukh", gender: "Male" },
  { name: "Sarojini Naidu-Reddy", gender: "Female" },
  { name: "Jagadish Bose-Banerjee", gender: "Male" },
  { name: "Aruna Asaf-Ali", gender: "Female" },
  { name: "Subhash Chandra-Sen", gender: "Male" },
  { name: "Kamala Das-Nair", gender: "Female" },
  { name: "Rabindra Tagore-Ghosh", gender: "Male" },
  { name: "Amrita Sher-Gil", gender: "Female" },
  { name: "Srinivasa Ramanujan", gender: "Male" },
  { name: "Tessy Thomas-Kurian", gender: "Female" },
  { name: "Verghese Kurien", gender: "Male" },
  { name: "Anandi Gopal Joshi", gender: "Female" },
  { name: "C. V. Raman", gender: "Male" },
  { name: "Janaki Ammal", gender: "Female" },
  { name: "Meghnad Saha", gender: "Male" },
  { name: "Asima Chatterjee", gender: "Female" },
  // Deceased outcomes
  { name: "Govindram Aggarwal", gender: "Male" },
  { name: "Shakuntala Devi-Gupta", gender: "Female" },
];

const DIAGNOSES = [
  "Viral Bronchopneumonitis - Moderate",
  "Acute Viral Syndrome with Pyrexia",
  "Post-Viral Convalescent Phase",
  "Viral Upper Respiratory Tract Infection",
  "Viral Malaise - Isolation & Monitoring",
  "Suspected Viral Bronchitis",
  "Quarantine Observation - Exposure Contact",
  "Viral Pharyngitis with Low-grade Pyrexia",
];

export function getInitialDemoData(baseDate: string = "2026-10-23") {
  const today = baseDate;
  const dMinus1 = getPreviousDate(today, 1);
  const dMinus2 = getPreviousDate(today, 2);
  const dMinus3 = getPreviousDate(today, 3);
  const dMinus4 = getPreviousDate(today, 4);
  const dMinus5 = getPreviousDate(today, 5);

  const initialPatients: Patient[] = [];
  const initialTempRecords: TemperatureRecord[] = [];
  const initialDoctorVisits: DoctorVisit[] = [];

  // 1. Create exactly 74 active patients occupying beds B-01 to B-74 (FULL CAPACITY)
  for (let i = 0; i < 74; i++) {
    const bedNum = `B-${String(i + 1).padStart(2, "0")}`;
    const pId = `P-${String(i + 101).padStart(3, "0")}`;
    const person = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const age = 20 + ((i * 7) % 60);
    const diagnosis = DIAGNOSES[i % DIAGNOSES.length];

    // Admission dates spread across last 3-5 days
    const admissionOffset = 2 + (i % 4);
    const admissionDate = getPreviousDate(today, admissionOffset);

    // Grouping by clinical workflow status:
    // Beds B-01 to B-18 (18 patients): Pending Temperature Check today (Nurse Dashboard pending)
    // Beds B-19 to B-45 (27 patients): Temperature recorded today, Doctor Visit Pending (Doctor Dashboard ready)
    // Beds B-46 to B-55 (10 patients): 3 full consecutive fever-free days recorded -> DISCHARGE ELIGIBLE (Admin Dashboard eligible)
    // Beds B-56 to B-74 (19 patients): Temperature recorded today, Doctor Visit Completed today
    const isDischargeEligible = i >= 45 && i <= 54; // B-46 to B-55 (10 patients)
    const status = isDischargeEligible ? "discharge_eligible" : "active";

    initialPatients.push({
      id: pId,
      name: person.name,
      age,
      gender: person.gender,
      bedNumber: bedNum,
      admissionDate,
      status,
      outcome: null,
      diagnosis,
    });

    // Generate historical temperature records:
    // dMinus2 reading
    const tempD2 = isDischargeEligible ? 36.4 + ((i % 5) * 0.1) : 36.5 + ((i % 10) * 0.1);
    initialTempRecords.push({
      id: `TR-${pId}-d2`,
      patientId: pId,
      date: dMinus2,
      time: "08:15",
      temperature: Number(tempD2.toFixed(1)),
      nurseId: DEFAULT_NURSES[i % DEFAULT_NURSES.length],
      timestamp: Date.now() - 172800000 + i * 1000,
    });

    // dMinus1 reading (fever demonstration on B-15 and B-30)
    const isFeverYesterday = i === 14 || i === 29;
    const tempD1 = isFeverYesterday
      ? 38.4
      : isDischargeEligible
      ? 36.5 + ((i % 4) * 0.1)
      : 36.6 + ((i % 8) * 0.1);

    initialTempRecords.push({
      id: `TR-${pId}-d1`,
      patientId: pId,
      date: dMinus1,
      time: "08:30",
      temperature: Number(tempD1.toFixed(1)),
      nurseId: DEFAULT_NURSES[(i + 1) % DEFAULT_NURSES.length],
      timestamp: Date.now() - 86400000 + i * 1000,
    });

    // Yesterday's doctor visit completed for all patients admitted prior to today
    initialDoctorVisits.push({
      id: `DV-${pId}-d1`,
      patientId: pId,
      date: dMinus1,
      completed: true,
      completedAt: "11:30",
      doctorName: DEFAULT_DOCTORS[i % DEFAULT_DOCTORS.length],
      treatmentNotes: isFeverYesterday
        ? "Febrile spike observed (38.4°C). Prescribed paracetamol and oral rehydration."
        : "Vitals stable, chest clear on auscultation. Continuing routine monitoring.",
    });

    // Today's temperature and doctor visits:
    const hasTempToday = i >= 18; // Beds B-19 to B-74 have temperature checked today
    if (hasTempToday) {
      const todayTemp = 36.4 + ((i % 6) * 0.1);
      initialTempRecords.push({
        id: `TR-${pId}-today`,
        patientId: pId,
        date: today,
        time: "08:10",
        temperature: Number(todayTemp.toFixed(1)),
        nurseId: DEFAULT_NURSES[i % DEFAULT_NURSES.length],
        timestamp: Date.now() - 18000000 + i * 1000,
      });

      // Today's doctor visit:
      // Beds B-46 to B-74 have completed visit today
      const hasVisitToday = i >= 45;
      if (hasVisitToday) {
        initialDoctorVisits.push({
          id: `DV-${pId}-today`,
          patientId: pId,
          date: today,
          completed: true,
          completedAt: "10:15",
          doctorName: DEFAULT_DOCTORS[i % DEFAULT_DOCTORS.length],
          treatmentNotes: isDischargeEligible
            ? "Completed 72+ hours afebrile. Vitals excellent, lungs clear. Recommended for administrative discharge."
            : "Patient alert, afebrile today. Stable clinical progression.",
        });
      }
    }
  }

  // 2. Historical Completed Outcomes (Recovered & Deceased) for benchmark calculations
  // 20 Recovered patients
  for (let j = 0; j < 20; j++) {
    const person = HISTORICAL_INDIAN_NAMES[j];
    const pId = `P-${String(j + 1).padStart(3, "0")}`;
    initialPatients.push({
      id: pId,
      name: person.name,
      age: 24 + ((j * 5) % 50),
      gender: person.gender,
      bedNumber: `B-${String((j % 74) + 1).padStart(2, "0")}`,
      admissionDate: dMinus5,
      dischargeDate: dMinus1,
      status: "discharged",
      outcome: "recovered",
      diagnosis: "Resolved Viral Infection",
      notes: "Successfully quarantined and recovered after 3 consecutive fever-free days.",
    });
  }

  // 2 Deceased patients
  for (let k = 20; k < 22; k++) {
    const person = HISTORICAL_INDIAN_NAMES[k];
    const pId = `P-${String(k + 1).padStart(3, "0")}`;
    initialPatients.push({
      id: pId,
      name: person.name,
      age: 68 + (k % 10),
      gender: person.gender,
      bedNumber: `B-${String((k % 74) + 1).padStart(2, "0")}`,
      admissionDate: dMinus5,
      dischargeDate: dMinus2,
      status: "deceased",
      outcome: "deceased",
      diagnosis: "Severe Acute Respiratory Distress",
      notes: "Viral pneumonia complicated by pre-existing cardiovascular comorbidities.",
    });
  }

  return { initialPatients, initialTempRecords, initialDoctorVisits };
}
