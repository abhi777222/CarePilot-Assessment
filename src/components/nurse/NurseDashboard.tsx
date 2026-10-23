"use client";

import React, { useState, useMemo } from "react";
import { useQuarantine } from "@/context/QuarantineContext";
import { Patient } from "@/types/quarantine";
import { TemperatureModal } from "./TemperatureModal";
import { TempHistoryModal } from "./TempHistoryModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  CheckCircle2,
  Clock,
  Search,
  Thermometer,
  History,
  AlertTriangle,
  User,
} from "lucide-react";

export function NurseDashboard() {
  const {
    patients,
    systemDate,
    hasTodayTemperature,
    getTodayTemperatureRecord,
  } = useQuarantine();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "completed">("all");
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<Patient | null>(null);
  const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<Patient | null>(null);

  // Filter only currently active / eligible patients (in beds)
  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status === "active" || p.status === "discharge_eligible");
  }, [patients]);

  const pendingPatients = useMemo(() => {
    return activePatients.filter((p) => !hasTodayTemperature(p.id));
  }, [activePatients, hasTodayTemperature]);

  const completedPatients = useMemo(() => {
    return activePatients.filter((p) => hasTodayTemperature(p.id));
  }, [activePatients, hasTodayTemperature]);

  const displayedPatients = useMemo(() => {
    let list = activePatients;
    if (filterTab === "pending") list = pendingPatients;
    if (filterTab === "completed") list = completedPatients;

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
  }, [activePatients, pendingPatients, completedPatients, filterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent p-4 rounded-xl border border-teal-200/60 dark:border-teal-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Nurse Station — Daily Temperature Tracking
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Record mandatory daily temperature checks for all active patients. Completed entries automatically unlock Doctor rounds.
            </p>
          </div>
        </div>

        {pendingPatients.length > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold self-start sm:self-auto">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{pendingPatients.length} patient(s) pending check today</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">Active Patients in Quarantine</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                {activePatients.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Pending Temperature Checks
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                {pendingPatients.length}
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
                Completed Checks Today
              </p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                {completedPatients.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Status Filters */}
        <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              filterTab === "all"
                ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            All Active ({activePatients.length})
          </button>
          <button
            onClick={() => setFilterTab("pending")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "pending"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Pending Check</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/30">
              {pendingPatients.length}
            </span>
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === "completed"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/30">
              {completedPatients.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
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

      {/* Patient Table / Cards */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Bed</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4">Today&apos;s Temperature Status ({systemDate})</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    No patients match the selected filter or search criteria.
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => {
                  const hasReading = hasTodayTemperature(patient.id);
                  const todayRecord = getTodayTemperatureRecord(patient.id);

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
                        </div>
                      </td>

                      {/* Bed Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        <Badge variant="outline" className="font-mono text-xs">
                          {patient.bedNumber}
                        </Badge>
                      </td>

                      {/* Admission Date */}
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {patient.admissionDate}
                      </td>

                      {/* Today's Temperature Status */}
                      <td className="py-3.5 px-4">
                        {hasReading && todayRecord ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {todayRecord.temperature.toFixed(1)}°C
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              at {todayRecord.time} ({todayRecord.nurseId.split(",")[0]})
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            Pending Temperature Check
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={hasReading ? "outline" : "default"}
                            className={
                              hasReading
                                ? "text-zinc-600 dark:text-zinc-400 h-8 text-xs"
                                : "bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs gap-1.5 shadow-xs"
                            }
                            onClick={() => setSelectedPatientForRecord(patient)}
                          >
                            <Thermometer className="h-3.5 w-3.5" />
                            {hasReading ? "View Reading" : "Record Temp"}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                            onClick={() => setSelectedPatientForHistory(patient)}
                            title="View temperature history"
                          >
                            <History className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline ml-1">History</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Temperature Modal */}
      <TemperatureModal
        patient={selectedPatientForRecord}
        isOpen={!!selectedPatientForRecord}
        onClose={() => setSelectedPatientForRecord(null)}
      />

      {/* Temperature History Modal */}
      <TempHistoryModal
        patient={selectedPatientForHistory}
        isOpen={!!selectedPatientForHistory}
        onClose={() => setSelectedPatientForHistory(null)}
      />
    </div>
  );
}
