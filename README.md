# Carepilot — Virus Quarantine & Treatment Facility Management

A frontend-only React / Next.js application built for the **Carepilot Technical Assessment**. It manages the daily clinical monitoring, physician rounds, discharge eligibility, and operational capacity of an infectious disease quarantine unit.

---

## 🏥 Key Features by Role

### 1. Nurse Dashboard
- **Active Patient Monitoring**: Real-time view of all patients currently occupying isolation beds.
- **Pending vs Completed Checks**: Clear badges and status filters distinguishing patients who require daily temperature monitoring.
- **Accidental Duplicate Prevention**: Strict calendar-day checking ensures only one daily temperature entry is recorded per patient.
- **Range & Clinical Validation**: Temperature inputs validated between 34.0°C and 43.0°C.
- **Historical Log**: Chronological audit log with dates, times, attending nurse, and fever classification.

### 2. Doctor Dashboard
- **Sequenced Clinical Rounds**: Patients only become ready for doctor rounds **after** their daily temperature has been recorded by a nurse.
- **Ready vs Awaiting Distinction**: Dedicated tabs for patients awaiting nurse check vs those ready for rounds.
- **Daily Treatment Notes**: Doctors review chronological temperature charts and input clinical observations.
- **Visit Certification**: Certified completed visits immediately update shared state and drop off the pending rounds queue. Duplicate daily visits are blocked.

### 3. Admin Dashboard
- **74-Bed Maximum Capacity**: Live visual gauge tracking occupancy. Admissions are blocked when capacity reaches 74/74 beds.
- **Patient Admission**: Direct bed assignment selecting only from available beds.
- **3-Day Fever-Free Discharge Engine**: Displays patients qualified for discharge along with supporting calendar dates.
- **Administrative Confirmation**: Discharging a patient frees their bed immediately and updates occupancy and statistics.
- **Benchmark & Outcome Metrics**:
  - **Recovery Rate**: (Recovered / Completed Outcomes) × 100 compared against **85% benchmark**.
  - **Mortality Rate**: (Deceased / Completed Outcomes) × 100 compared against **15% benchmark ceiling**.
  - **Critical Alert Banner**: Flashing alert triggered if mortality exceeds 15%.
  - Zero-division safety: displays 0% when no completed outcomes exist (no `NaN` or `Infinity`).

---

## 🔬 Clinical Business Rules & Assumptions

1. **Capacity Ceiling**: Exactly 74 active quarantine beds (B-01 through B-74).
2. **Fever Threshold**: `37.5°C` (Isolated in `src/lib/constants.ts` as a configurable demo assumption: `< 37.5°C` is fever-free, `≥ 37.5°C` is fever).
3. **Discharge Eligibility**: Requires **3 full consecutive fever-free calendar days**.
   - Missing readings never count as fever-free.
   - Any fever reading resets the streak to 0.
   - Incomplete current days do not count as full fever-free days.
4. **Discharge Separation**: Eligibility does not automatically discharge patients. Administrative confirmation is required to release the bed.
5. **Shared State & Persistence**: Single source of truth via React Context synchronized with `localStorage`. Demo reset button provided for assessment testing.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v25)
- npm 9+

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Verification

```bash
# Verify TypeScript and create production build
npm run build
```

---

## 🧪 Demonstration & Test Scenarios

Use the **Assessment Demonstration Guide** banner at the top of the app or switch roles to test:

1. **Nurse Flow**:
   - Locate **Elena Rostova (P-101)** (Pending Temperature Check).
   - Click **Record Temp**, enter `36.6°C`, and save.
   - Notice status changes to completed and duplicate entry is blocked if attempted again.
2. **Doctor Flow**:
   - Switch to **Doctor** role.
   - Elena Rostova is now unlocked in the **Ready for Visit** tab.
   - Open patient detail, enter notes, and mark visit complete.
3. **Admin Flow**:
   - Switch to **Admin** role.
   - Locate **Amara Okafor (P-103)** in **Discharge Ready**.
   - Confirm discharge: her bed is released, active patient count decreases, and recovery rate updates.
4. **Capacity Enforcement**:
   - Click **Admit Patient** to assign beds. 74-bed capacity is strictly enforced.
