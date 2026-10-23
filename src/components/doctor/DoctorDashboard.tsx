"use client";

import React, { useState, useMemo } from "react";
import { useQuarantine } from "@/context/QuarantineContext";
import { Patient } from "@/types/quarantine";
import { DoctorVisitModal } from "./DoctorVisitModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Thermometer,
  FileText,
  UserCheck,
} from "lucide-react";

export function DoctorDashboard() {
  const {
    patients,
    systemDate,
    hasTodayTemperature,
    getTodayTemperatureRecord,
    hasTodayDoctorVisit,
    getTodayDoctorVisit,
  } = useQuarantine();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<Patient | null>(null);
  const [tab, setTab] = useState<"ready" | "awaiting_temp" | "completed">("ready");

  // Only currently active or eligible patients
  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status === "active" || p.status === "discharge_eligible");
  }, [patients]);

  // Group 1: Ready for doctor visit (today's temp is recorded, but visit is pending)
  const readyForVisit = useMemo(() => {
    return activePatients.filter(
      (p) => hasTodayTemperature(p.id) && !hasTodayDoctorVisit(p.id)
    );
  }, [activePatients, hasTodayTemperature, hasTodayDoctorVisit]);

  // Group 2: Awaiting nurse temperature check (visit cannot happen yet)
  const awaitingNurseCheck = useMemo(() => {
    return activePatients.filter((p) => !hasTodayTemperature(p.id));
  }, [activePatients, hasTodayTemperature]);

  // Group 3: Visits completed today
  const visitsCompletedToday = useMemo(() => {
    return activePatients.filter((p) => hasTodayDoctorVisit(p.id));
  }, [activePatients, hasTodayDoctorVisit]);

  // Filtered by active tab and search query
  const displayedPatients = useMemo(() => {
    let list = readyForVisit;
    if (tab === "awaiting_temp") list = awaitingNurseCheck;
    if (tab === "completed") list = visitsCompletedToday;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.bedNumber.toLowerCase().includes(q)
      );
    }

    return list;
  }, [readyForVisit, awaitingNurseCheck, visitsCompletedToday, tab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Physician Rounds — Clinical Assessments & Daily Visits
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Review daily temperature history, examine patients, enter clinical notes, and certify completed visits.
            </p>
          </div>
        </div>

        {readyForVisit.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-semibold self-start sm:self-auto">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>{readyForVisit.length} patient(s) ready for daily rounds</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Ready for Doctor Visit (Temp Done)
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-1">
                {readyForVisit.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Awaiting Nurse Temperature Check
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                {awaitingNurseCheck.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Visits Completed Today
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                {visitsCompletedToday.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setTab("ready")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "ready"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Ready for Visit</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/40">
              {readyForVisit.length}
            </span>
          </button>
          <button
            onClick={() => setTab("awaiting_temp")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "awaiting_temp"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Awaiting Temp Check</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/40">
              {awaitingNurseCheck.length}
            </span>
          </button>
          <button
            onClick={() => setTab("completed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "completed"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Visits Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/40">
              {visitsCompletedToday.length}
            </span>
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Search by name, ID or bed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Bed</th>
                <th className="py-3 px-4">Today&apos;s Temperature ({systemDate})</th>
                <th className="py-3 px-4">Daily Visit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    {tab === "ready"
                      ? "No patients are currently awaiting doctor visits. All temperature-checked patients have been visited!"
                      : tab === "awaiting_temp"
                      ? "No patients are awaiting nurse temperature check. All active patients have recorded vitals!"
                      : "No visits completed yet today."}
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => {
                  const hasTemp = hasTodayTemperature(patient.id);
                  const todayTemp = getTodayTemperatureRecord(patient.id);
                  const hasVisit = hasTodayDoctorVisit(patient.id);
                  const todayVisit = getTodayDoctorVisit(patient.id);

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* Patient Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {patient.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                          <span>{patient.id}</span>
                          <span>•</span>
                          <span>{patient.age}y / {patient.gender}</span>
                          <span>•</span>
                          <span className="italic">{patient.diagnosis}</span>
                        </div>
                      </td>

                      {/* Bed Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        <Badge variant="outline" className="font-mono text-xs">
                          {patient.bedNumber}
                        </Badge>
                      </td>

                      {/* Today's Temperature */}
                      <td className="py-3.5 px-4">
                        {hasTemp && todayTemp ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <Thermometer className="h-3.5 w-3.5" />
                              {todayTemp.temperature.toFixed(1)}°C
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              at {todayTemp.time}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <AlertCircle className="h-3 w-3" />
                            Awaiting Nurse Temp
                          </span>
                        )}
                      </td>

                      {/* Visit Status */}
                      <td className="py-3.5 px-4">
                        {hasVisit && todayVisit ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Visit Completed ({todayVisit.completedAt})
                            </span>
                            <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                              {todayVisit.treatmentNotes}
                            </p>
                          </div>
                        ) : hasTemp ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <Clock className="h-3 w-3" />
                            Ready for Visit
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-400 italic">
                            Temp required first
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={hasVisit ? "outline" : "default"}
                          disabled={!hasTemp}
                          className={
                            hasVisit
                              ? "h-8 text-xs text-zinc-600 dark:text-zinc-400"
                              : hasTemp
                              ? "bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs gap-1.5 shadow-xs"
                              : "h-8 text-xs opacity-50 cursor-not-allowed"
                          }
                          onClick={() => setSelectedPatientForVisit(patient)}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {hasVisit ? "View Notes" : "Conduct Visit"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Visit Modal */}
      <DoctorVisitModal
        patient={selectedPatientForVisit}
        isOpen={!!selectedPatientForVisit}
        onClose={() => setSelectedPatientForVisit(null)}
      />
    </div>
  );
}
