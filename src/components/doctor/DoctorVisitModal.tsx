"use client";

import React, { useState } from "react";
import { Patient } from "@/types/quarantine";
import { useQuarantine } from "@/context/QuarantineContext";
import { DEFAULT_DOCTORS, FACILITY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Calendar,
  History,
  Clock,
} from "lucide-react";

interface DoctorVisitModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorVisitModal({ patient, isOpen, onClose }: DoctorVisitModalProps) {
  const {
    systemDate,
    temperatureRecords,
    doctorVisits,
    hasTodayTemperature,
    getTodayTemperatureRecord,
    hasTodayDoctorVisit,
    getTodayDoctorVisit,
    completeDoctorVisit,
  } = useQuarantine();

  const [doctorName, setDoctorName] = useState<string>(DEFAULT_DOCTORS[0]);
  const [treatmentNotes, setTreatmentNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  if (!patient) return null;

  const hasTempToday = hasTodayTemperature(patient.id);
  const todayTempRecord = getTodayTemperatureRecord(patient.id);
  const isVisitCompletedToday = hasTodayDoctorVisit(patient.id);
  const todayVisit = getTodayDoctorVisit(patient.id);

  // Patient's chronological temp history
  const patientTemps = temperatureRecords
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => b.timestamp - a.timestamp || b.date.localeCompare(a.date));

  // Previous doctor visits
  const pastVisits = doctorVisits
    .filter((v) => v.patientId === patient.id && v.date !== systemDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleCompleteVisit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const result = completeDoctorVisit(patient.id, treatmentNotes, doctorName);
    if (!result.success) {
      setErrorMessage(result.error || "Failed to complete doctor visit.");
      return;
    }

    setSuccessMessage(`Doctor visit marked complete for ${patient.name}.`);
    setTimeout(() => {
      onClose();
      setSuccessMessage("");
      setTreatmentNotes("");
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Daily Doctor Visit & Clinical Rounds
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-zinc-900 dark:text-zinc-100">{patient.name}</strong> ({patient.id}) • Bed:{" "}
                <strong>{patient.bedNumber}</strong> • Diagnosis: <em>{patient.diagnosis || "Quarantine Monitoring"}</em>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Prerequisite Check Banner */}
          {!hasTempToday ? (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Visit Blocked: Temperature Check Pending</span>
              </div>
              <p>
                Per clinical protocol, a doctor visit cannot be recorded before today&apos;s daily temperature check is completed by the attending nurse.
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">Today&apos;s Temperature Recorded: </span>
                  <span className="font-mono font-bold text-sm">
                    {todayTempRecord?.temperature.toFixed(1)}°C
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-300 ml-1.5">
                    ({todayTempRecord?.time} by {todayTempRecord?.nurseId.split(",")[0]})
                  </span>
                </div>
              </div>
              {todayTempRecord && todayTempRecord.temperature >= FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS ? (
                <Badge variant="destructive" className="text-[10px]">
                  Fever (≥{FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS}°C)
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white text-[10px]">Fever-Free</Badge>
              )}
            </div>
          )}

          {/* Already Completed Notice */}
          {isVisitCompletedToday && todayVisit && (
            <div className="p-3.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  Today&apos;s Visit Completed ({todayVisit.completedAt})
                </span>
                <Badge className="bg-blue-600 text-white text-[10px]">Visit Complete</Badge>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">
                Attending: <strong>{todayVisit.doctorName}</strong>
              </p>
              <div className="p-2.5 rounded bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-900/50">
                <span className="text-zinc-400 font-semibold block text-[10px] uppercase">
                  Treatment Notes:
                </span>
                <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">{todayVisit.treatmentNotes}</p>
              </div>
            </div>
          )}

          {/* Chronological Temperature History Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-zinc-500" />
                Temperature History (Chronological)
              </span>
              <span className="text-[11px] text-zinc-500">
                {patientTemps.length} recorded reading(s)
              </span>
            </div>

            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 uppercase text-[10px] sticky top-0 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Temp</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Nurse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {patientTemps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-400 text-xs">
                        No previous temperature logs found.
                      </td>
                    </tr>
                  ) : (
                    patientTemps.map((t) => {
                      const isFever = t.temperature >= FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS;
                      return (
                        <tr key={t.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40">
                          <td className="py-1.5 px-3 font-medium">{t.date}</td>
                          <td className="py-1.5 px-3 text-zinc-500">{t.time}</td>
                          <td className="py-1.5 px-3 font-mono font-semibold">
                            <span className={isFever ? "text-rose-600" : "text-emerald-600"}>
                              {t.temperature.toFixed(1)}°C
                            </span>
                          </td>
                          <td className="py-1.5 px-3">
                            {isFever ? (
                              <span className="text-[10px] text-rose-600 font-medium">Fever</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-medium">Fever-free</span>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-zinc-500 truncate max-w-[120px]">
                            {t.nurseId.split(",")[0]}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Visit Form (Only if today's visit is not yet completed) */}
          {!isVisitCompletedToday && (
            <form onSubmit={handleCompleteVisit} className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Record Daily Rounds & Treatment Notes
              </h4>

              {errorMessage && (
                <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Attending Physician
                </label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full text-xs rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {DEFAULT_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Daily Treatment Notes & Observations <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  placeholder="Record patient assessment, symptom status, lung sounds, supportive care plan..."
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  className="text-xs min-h-[80px]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!hasTempToday}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Mark Daily Visit Complete
                </Button>
              </div>
            </form>
          )}

          {/* Past Doctor Visits Summary */}
          {pastVisits.length > 0 && (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Previous Visit Notes
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {pastVisits.map((v) => (
                  <div
                    key={v.id}
                    className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px]"
                  >
                    <div className="flex items-center justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>{v.date} ({v.completedAt})</span>
                      <span className="text-zinc-500">{v.doctorName.split(",")[0]}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">{v.treatmentNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isVisitCompletedToday && (
          <DialogFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
