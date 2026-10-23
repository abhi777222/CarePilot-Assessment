"use client";

import React from "react";
import { Patient } from "@/types/quarantine";
import { useQuarantine } from "@/context/QuarantineContext";
import { FACILITY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { History, Thermometer, ShieldCheck } from "lucide-react";

interface TempHistoryModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TempHistoryModal({ patient, isOpen, onClose }: TempHistoryModalProps) {
  const { temperatureRecords, getPatientEligibility } = useQuarantine();

  if (!patient) return null;

  const records = temperatureRecords
    .filter((r) => r.patientId === patient.id)
    .sort((a, b) => b.timestamp - a.timestamp || b.date.localeCompare(a.date));

  const eligibility = getPatientEligibility(patient.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <History className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Temperature Log & Vitals History
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-zinc-900 dark:text-zinc-100">{patient.name}</strong> ({patient.id}) • Bed:{" "}
                <strong>{patient.bedNumber}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current Eligibility Status Banner */}
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              Discharge Readiness Status:
            </span>
            {eligibility.isEligible ? (
              <Badge className="bg-emerald-600 text-white">Eligible (3 Days Fever-Free)</Badge>
            ) : (
              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300">
                {eligibility.consecutiveFeverFreeDays} / {FACILITY_CONFIG.REQUIRED_CONSECUTIVE_FEVER_FREE_DAYS} Fever-Free Days
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {eligibility.reason}
          </p>
        </div>

        {/* Chronological Log Table */}
        <div className="flex-1 overflow-y-auto pr-1">
          {records.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No temperature records found for this patient yet.
            </div>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Temperature</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {records.map((r) => {
                    const isFever = r.temperature >= FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS;
                    return (
                      <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100">
                          {r.date}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-500">{r.time}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className={isFever ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                            {r.temperature.toFixed(1)}°C
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {isFever ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              Fever (≥{FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS}°C)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Fever-Free
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 truncate max-w-[140px]">
                          {r.nurseId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full">
            Close History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
