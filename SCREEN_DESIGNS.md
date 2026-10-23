# Carepilot — UI Screen Designs & Wireframes

This document provides visual screen designs, layout wireframes, and clinical workflow specifications for the **Carepilot Virus Quarantine & Treatment Facility** application (Q2 Technical Assessment requirement).

---

## 1. 🩺 Nurse Dashboard — Daily Temperature & Vitals Station

### Screen Design Preview
![Carepilot Nurse Dashboard](/screenshots/carepilot_nurse_screen_1792761834068.jpg)

### Layout & Component Architecture
```
+-----------------------------------------------------------------------------------------+
| [Logo] Carepilot | Virus Quarantine Facility     Today: YYYY-MM-DD   Occupancy: 74/74   |
| [Nurse] [Doctor] [Admin]                        Demo: Daily temperature & vitals        |
+-----------------------------------------------------------------------------------------+
| Metric Cards:                                                                           |
| [ Active: 74 Patients ]   [ Pending Check Today: 18 ]   [ Completed Checks: 56 ]        |
+-----------------------------------------------------------------------------------------+
| Status Tabs: [All Active (74)]  [Pending Check (18)]  [Completed (56)]   [Search input] |
|-----------------------------------------------------------------------------------------|
| Patient Name       | Bed  | Admission  | Today's Temp Status        | Action            |
|--------------------+------+------------+----------------------------+-------------------|
| Aarav Sharma       | B-01 | 2026-10-19 | [Clock] Pending Check      | [Record Temp]     |
| Priya Patel        | B-02 | 2026-10-20 | [Clock] Pending Check      | [Record Temp]     |
| Rajesh Verma       | B-03 | 2026-10-18 | [Check] 36.6°C (08:10)     | [View Reading]    |
| Ananya Iyer        | B-04 | 2026-10-19 | [Check] 36.8°C (08:15)     | [View Reading]    |
+-----------------------------------------------------------------------------------------+
```

### Key Functional Specifications
- **Real-Time Active Patient List**: All 74 patients in beds B-01 to B-74 with Indian patient identities.
- **Pending vs Completed Indicators**: Clear badges showing who needs vitals today.
- **Validated Recording Modal**: Numeric input in Celsius (34.0°C – 43.0°C) with assigned nurse selector.
- **Accidental Duplicate Guard**: Strictly prevents multiple entries on the same calendar date for the same patient.
- **Chronological History Dialog**: Full historical audit log with fever classification (<37.5°C vs ≥37.5°C).

---

## 2. 👨‍⚕️ Doctor Dashboard — Clinical Rounds & Assessment

### Screen Design Preview
![Carepilot Doctor Dashboard](/screenshots/carepilot_doctor_screen_1792761869507.jpg)

### Layout & Component Architecture
```
+-----------------------------------------------------------------------------------------+
| [Logo] Carepilot | Virus Quarantine Facility     Today: YYYY-MM-DD   Occupancy: 74/74   |
| [Nurse] [Doctor] [Admin]                        Demo: Daily rounds, clinical notes      |
+-----------------------------------------------------------------------------------------+
| Metric Cards:                                                                           |
| [ Ready for Visit: 27 ]   [ Awaiting Nurse Temp: 18 ]   [ Completed Today: 29 ]         |
+-----------------------------------------------------------------------------------------+
| Status Tabs: [Ready for Visit (27)]  [Awaiting Nurse Temp (18)]  [Completed Today (29)] |
|-----------------------------------------------------------------------------------------|
| Patient Name       | Bed  | Today's Temp | Daily Visit Status       | Action            |
|--------------------+------+--------------+--------------------------+-------------------|
| Rajesh Verma       | B-03 | 36.6°C       | [Clock] Ready for Visit  | [Conduct Visit]   |
| Ananya Iyer        | B-04 | 36.8°C       | [Clock] Ready for Visit  | [Conduct Visit]   |
| Aarav Sharma       | B-01 | Missing      | [Alert] Temp Required    | [Disabled]        |
| Vikram Malhotra    | B-46 | 36.4°C       | [Check] Completed (10:15)| [View Notes]      |
+-----------------------------------------------------------------------------------------+
```

### Key Functional Specifications
- **Prerequisite Enforcement**: A doctor visit cannot be recorded before today's temperature is completed.
- **Dedicated Work Queues**: Clear separation between patients awaiting nurse check and patients ready for physician rounds.
- **Interactive Rounds Modal**: Displays patient vitals trend, temperature history table, and structured treatment notes textarea.
- **Visit Certification**: Marking complete immediately updates shared state and drops the patient off the pending rounds queue. Duplicate visits on the same day are blocked.

---

## 3. 🛡️ Admin Dashboard — Occupancy, Discharges & Benchmarks

### Screen Design Preview
![Carepilot Admin Dashboard](/screenshots/carepilot_admin_screen_1792761890016.jpg)

### Layout & Component Architecture
```
+-----------------------------------------------------------------------------------------+
| [Logo] Carepilot | Virus Quarantine Facility     Today: YYYY-MM-DD   Occupancy: 74/74   |
| [Nurse] [Doctor] [Admin]                        Demo: Capacity & benchmark governance   |
+-----------------------------------------------------------------------------------------+
| KPI Metrics Grid:                                                                       |
| [ Bed Occupancy ]      [ Discharge Ready ]    [ Recovery Rate ]    [ Mortality Rate ]   |
|   74 / 74 (100%)         10 Patients            90.9% (Target ≥85%)  9.1% (Within ≤15%) |
|   [Progress Bar: Full]   3 Days Fever-Free      20 Recovered         2 Deceased         |
+-----------------------------------------------------------------------------------------+
| Tabs: [Discharge Ready (10)]   [All Active (74)]   [Completed Outcomes (22)]            |
|-----------------------------------------------------------------------------------------|
| Patient Name       | Bed  | Admission  | 3-Day Fever-Free Audit     | Action            |
|--------------------+------+------------+----------------------------+-------------------|
| Vikram Malhotra    | B-46 | 2026-10-18 | 3 Fever-Free Days Verified | [Confirm Discharge|
| Sunita Rao         | B-47 | 2026-10-18 | 3 Fever-Free Days Verified | [Confirm Discharge|
| Kavita Reddy       | B-48 | 2026-10-18 | 3 Fever-Free Days Verified | [Confirm Discharge|
| Suresh Menon       | B-49 | 2026-10-18 | 3 Fever-Free Days Verified | [Confirm Discharge|
+-----------------------------------------------------------------------------------------+
```

### Key Functional Specifications
- **74-Bed Capacity Governance**:
  - Live progress gauge tracking active bed occupancy.
  - Admission modal blocks new intake when capacity reaches 74/74.
- **Discharge Eligibility Engine**:
  - Calculates consecutive fever-free days using `FEVER_THRESHOLD_CELSIUS = 37.5°C`.
  - Incomplete current days or missing daily checks never count as fever-free.
  - Fevers reset the streak to 0.
- **Administrative Confirmation**:
  - Eligibility does not automatically discharge patients.
  - Admin clicks "Confirm Discharge", which transitions patient to `discharged (recovered)`, frees bed B-46, and updates facility occupancy.
- **Public Health Benchmarks**:
  - Computed using only completed outcomes (20 recovered + 2 deceased = 22 total).
  - Recovery Rate = 90.9% (exceeds 85% target).
  - Mortality Rate = 9.1% (within 15% ceiling; alert triggers if mortality > 15%).
  - Safe zero-division handling (`0%`, no `NaN` or `Infinity`).
