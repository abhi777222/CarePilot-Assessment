"use client";

import React, { useState } from "react";
import { QuarantineProvider, useQuarantine } from "@/context/QuarantineContext";
import { HospitalHeader } from "@/components/layout/HospitalHeader";
import { NurseDashboard } from "@/components/nurse/NurseDashboard";
import { DoctorDashboard } from "@/components/doctor/DoctorDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Activity,
  ShieldAlert,
} from "lucide-react";

function MainContent() {
  const { role, stats } = useQuarantine();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950 flex flex-col font-sans">
      <HospitalHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Assessor Quick Workflow & Testing Guide Banner */}
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-zinc-950 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Carepilot Assessment Demonstration Guide & Business Rule Verification
                </h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Switch roles anytime using the top toolbar to test the complete workflow in real time.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>{showGuide ? "Hide Checklist" : "View Test Scenarios"}</span>
              {showGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>

          {showGuide && (
            <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="space-y-1.5 p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-teal-200 dark:border-teal-900/40">
                <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
                  <Activity className="h-3.5 w-3.5" />
                  <span>1. Nurse Workflow</span>
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                  <li>
                    Select <strong>Elena Rostova (P-101)</strong>: Record today&apos;s temp (e.g. 36.8°C).
                  </li>
                  <li>
                    Notice she immediately moves from Pending to Completed.
                  </li>
                  <li>
                    Try submitting a duplicate temp today: blocked with safety alert.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-blue-200 dark:border-blue-900/40">
                <div className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-300">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>2. Doctor Workflow</span>
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                  <li>
                    Notice <strong>Elena Rostova</strong> is now unlocked and ready for visit!
                  </li>
                  <li>
                    Review chronological temperature log, enter notes, and mark visit complete.
                  </li>
                  <li>
                    Completed visit disappears from pending rounds list.
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-white/70 dark:bg-zinc-900/70 border border-purple-200 dark:border-purple-900/40">
                <div className="flex items-center gap-1.5 font-bold text-purple-800 dark:text-purple-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>3. Admin & Discharge</span>
                </div>
                <ul className="space-y-1 text-[11px] text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                  <li>
                    <strong>Amara Okafor (P-103)</strong> has 3 fever-free days verified.
                  </li>
                  <li>
                    Confirm discharge: Bed is released immediately & occupancy drops.
                  </li>
                  <li>
                    Test admission: 74-bed capacity is strictly enforced.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Role Content View */}
        {role === "nurse" && <NurseDashboard />}
        {role === "doctor" && <DoctorDashboard />}
        {role === "admin" && <AdminDashboard />}
      </main>

      {/* Hospital Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <span>Carepilot — Virus Quarantine & Treatment Facility (Assessment MVP)</span>
          <div className="flex items-center gap-3">
            <span>Capacity Limit: <strong>74 Active Beds</strong></span>
            <span>•</span>
            <span>Fever Threshold: <strong>37.5°C</strong> (Demo Assumption)</span>
            <span>•</span>
            <span>Mortality Ceiling: <strong>15%</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <QuarantineProvider>
      <MainContent />
    </QuarantineProvider>
  );
}
