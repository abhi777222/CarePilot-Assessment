"use client";

import React, { useState, useMemo } from "react";
import { useQuarantine } from "@/context/QuarantineContext";
import { Patient } from "@/types/quarantine";
import { FACILITY_CONFIG } from "@/lib/constants";
import { AdmissionModal } from "./AdmissionModal";
import { DischargeConfirmModal } from "./DischargeConfirmModal";
import { DeceasedModal } from "./DeceasedModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  BedDouble,
  Activity,
  HeartPulse,
  Search,
  Check,
  TrendingUp,
  Percent,
  CalendarCheck,
  Building,
} from "lucide-react";

export function AdminDashboard() {
  const { patients, stats, getPatientEligibility } = useQuarantine();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"eligible" | "active" | "all_outcomes">("eligible");
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [selectedForDischarge, setSelectedForDischarge] = useState<Patient | null>(null);
  const [selectedForDeceased, setSelectedForDeceased] = useState<Patient | null>(null);

  // Active / in-bed patients
  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status === "active" || p.status === "discharge_eligible");
  }, [patients]);

  // Patients who have satisfied the 3 consecutive fever-free days
  const eligiblePatients = useMemo(() => {
    return activePatients.filter((p) => {
      const elig = getPatientEligibility(p.id);
      return elig.isEligible || p.status === "discharge_eligible";
    });
  }, [activePatients, getPatientEligibility]);

  // Completed outcomes (Recovered and Deceased)
  const completedPatients = useMemo(() => {
    return patients.filter((p) => p.status === "discharged" || p.status === "deceased");
  }, [patients]);

  // Filtered patients according to active tab
  const displayedPatients = useMemo(() => {
    let list: Patient[] = [];
    if (activeTab === "eligible") list = eligiblePatients;
    else if (activeTab === "active") list = activePatients;
    else list = completedPatients;

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
  }, [eligiblePatients, activePatients, completedPatients, activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Role Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-transparent p-4 rounded-xl border border-purple-200/60 dark:border-purple-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Facility Administration — Occupancy, Discharges & Benchmarks
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Monitor maximum 74-bed capacity, authorize patient discharges after 3 consecutive fever-free days, and review public health statistics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={() => setIsAdmissionOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 shadow-xs text-xs h-8"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Admit Patient
          </Button>
        </div>
      </div>

      {/* Critical Benchmark Warning Banner (if mortality > 15%) */}
      {stats.mortalityAlert && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-400 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              CRITICAL BENCHMARK ALERT: MORTALITY RATE EXCEEDS {FACILITY_CONFIG.MORTALITY_BENCHMARK_PERCENT}% THRESHOLD
            </h3>
            <p className="text-xs">
              Current facility mortality rate is <strong>{stats.mortalityRate}%</strong> ({stats.totalDeceased} deceased out of {stats.completedOutcomes} completed outcomes), which violates the acceptable quarantine safety ceiling of {FACILITY_CONFIG.MORTALITY_BENCHMARK_PERCENT}%. Immediate clinical review and infection control intervention are required.
            </p>
          </div>
        </div>
      )}

      {/* Primary KPI Grid: Occupancy & Health Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bed Capacity Card */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Facility Bed Capacity</span>
              <BedDouble className="h-4 w-4 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stats.occupiedBeds}{" "}
              <span className="text-sm font-normal text-zinc-500">
                / {stats.totalCapacity} Beds
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {/* Progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden my-2">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.occupiedBeds >= 70
                    ? "bg-rose-600"
                    : stats.occupiedBeds >= 50
                    ? "bg-amber-500"
                    : "bg-purple-600"
                }`}
                style={{
                  width: `${(stats.occupiedBeds / stats.totalCapacity) * 100}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>{stats.availableBeds} beds available</span>
              <span>{stats.occupiedBeds >= 74 ? "Full Capacity" : "Accepting"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Discharge-Eligible Patients Card */}
        <Card className="border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span>Eligible for Discharge</span>
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {eligiblePatients.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
            <span>Met 3 full consecutive fever-free days</span>
            <div className="mt-2 text-zinc-500">Awaiting Admin sign-off to free beds</div>
          </CardContent>
        </Card>

        {/* Recovery Rate vs 85% Benchmark */}
        <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Recovery Rate (Target: ≥{FACILITY_CONFIG.RECOVERY_BENCHMARK_PERCENT}%)</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <span>{stats.recoveryRate}%</span>
              {stats.completedOutcomes > 0 && stats.recoveryRate >= FACILITY_CONFIG.RECOVERY_BENCHMARK_PERCENT && (
                <Badge className="bg-emerald-600 text-white text-[10px] h-5">Target Met</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-zinc-500">
            <span>
              {stats.totalRecovered} recovered of {stats.completedOutcomes} completed
            </span>
            <div className="mt-1 text-zinc-400">Excludes {stats.activePatients} currently active</div>
          </CardContent>
        </Card>

        {/* Mortality Rate vs 15% Benchmark */}
        <Card
          className={`shadow-xs ${
            stats.mortalityAlert
              ? "border-rose-400 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/30"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
              <span>Mortality Rate (Ceiling: ≤{FACILITY_CONFIG.MORTALITY_BENCHMARK_PERCENT}%)</span>
              <HeartPulse
                className={`h-4 w-4 ${
                  stats.mortalityAlert ? "text-rose-600" : "text-zinc-500"
                }`}
              />
            </div>
            <CardTitle
              className={`text-2xl font-bold flex items-center gap-2 ${
                stats.mortalityAlert ? "text-rose-700 dark:text-rose-300" : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              <span>{stats.mortalityRate}%</span>
              {stats.mortalityAlert ? (
                <Badge variant="destructive" className="text-[10px] h-5">Exceeds 15%</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] h-5 border-emerald-300 text-emerald-700 bg-emerald-50">
                  Within Bounds
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-[11px] text-zinc-500">
            <span>
              {stats.totalDeceased} deceased of {stats.completedOutcomes} completed
            </span>
            <div className="mt-1 text-zinc-400">Denominator: Recovered + Deceased</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "eligible"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Discharge Ready (3 Days Fever-Free)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/40">
              {eligiblePatients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "active"
                ? "bg-purple-600 text-white shadow-xs font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>All Active in Beds</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/40">
              {activePatients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all_outcomes")}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "all_outcomes"
                ? "bg-zinc-800 text-white shadow-xs dark:bg-zinc-700 font-semibold"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            }`}
          >
            <span>Completed Outcomes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-500/40">
              {completedPatients.length}
            </span>
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <Input
            placeholder="Search patient, ID or bed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/70 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Bed</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4">Discharge Eligibility Audit</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    {activeTab === "eligible"
                      ? "No patients are currently eligible for discharge. Patients require 3 full consecutive fever-free days."
                      : "No records found matching criteria."}
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => {
                  const eligibility = getPatientEligibility(patient.id);
                  const isEligible = eligibility.isEligible || patient.status === "discharge_eligible";
                  const isDischarged = patient.status === "discharged";
                  const isDeceased = patient.status === "deceased";

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
                        {isDischarged || isDeceased ? (
                          <span className="text-zinc-400 text-xs italic">
                            Released ({patient.bedNumber})
                          </span>
                        ) : (
                          <Badge variant="outline" className="font-mono text-xs">
                            {patient.bedNumber}
                          </Badge>
                        )}
                      </td>

                      {/* Admission Date */}
                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {patient.admissionDate}
                      </td>

                      {/* Eligibility Audit / Supporting Dates */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {isDischarged ? (
                          <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                            Discharged on {patient.dischargeDate} (Recovered)
                          </span>
                        ) : isDeceased ? (
                          <span className="text-rose-700 dark:text-rose-300 font-medium">
                            Deceased on {patient.dischargeDate}
                          </span>
                        ) : isEligible ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              3 Consecutive Fever-Free Days
                            </span>
                            <p className="text-[11px] text-zinc-500">
                              Dates: {eligibility.feverFreeDates.join(", ") || "Verified"}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-amber-700 dark:text-amber-300 font-medium">
                              {eligibility.consecutiveFeverFreeDays} / {FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS} Fever-Free Days
                            </span>
                            <p className="text-[11px] text-zinc-500 line-clamp-2">
                              {eligibility.reason}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {patient.status === "discharged" ? (
                          <Badge className="bg-emerald-600 text-white">Discharged (Recovered)</Badge>
                        ) : patient.status === "deceased" ? (
                          <Badge variant="destructive">Deceased</Badge>
                        ) : isEligible ? (
                          <Badge className="bg-emerald-600 text-white animate-pulse">
                            Discharge Eligible
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Active Quarantine</Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {!isDischarged && !isDeceased && (
                          <div className="inline-flex items-center gap-2">
                            {isEligible ? (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5 shadow-xs"
                                onClick={() => setSelectedForDischarge(patient)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Confirm Discharge
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-8 text-xs opacity-50 cursor-not-allowed"
                                title="Patient must meet 3 consecutive fever-free days"
                              >
                                Not Eligible
                              </Button>
                            )}

                            {/* Option to record mortality if critical event occurs */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                              onClick={() => setSelectedForDeceased(patient)}
                              title="Record mortality event"
                            >
                              Deceased
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
      />

      {/* Discharge Confirmation Modal */}
      <DischargeConfirmModal
        patient={selectedForDischarge}
        isOpen={!!selectedForDischarge}
        onClose={() => setSelectedForDischarge(null)}
      />

      {/* Deceased Modal */}
      <DeceasedModal
        patient={selectedForDeceased}
        isOpen={!!selectedForDeceased}
        onClose={() => setSelectedForDeceased(null)}
      />
    </div>
  );
}
