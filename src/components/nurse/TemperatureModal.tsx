"use client";

import React, { useState } from "react";
import { Patient } from "@/types/quarantine";
import { useQuarantine } from "@/context/QuarantineContext";
import { DEFAULT_NURSES, FACILITY_CONFIG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Thermometer } from "lucide-react";

interface TemperatureModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TemperatureModal({ patient, isOpen, onClose }: TemperatureModalProps) {
  const { systemDate, recordTemperature, hasTodayTemperature, getTodayTemperatureRecord } = useQuarantine();
  const [temperature, setTemperature] = useState<string>("36.8");
  const [nurseId, setNurseId] = useState<string>(DEFAULT_NURSES[0]);
  const [customNurse, setCustomNurse] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  if (!patient) return null;

  const alreadyRecorded = hasTodayTemperature(patient.id);
  const existingRecord = getTodayTemperatureRecord(patient.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const numericTemp = parseFloat(temperature);
    if (isNaN(numericTemp)) {
      setErrorMessage("Please enter a valid numeric temperature.");
      return;
    }

    const effectiveNurse = customNurse.trim() || nurseId;
    const result = recordTemperature(patient.id, numericTemp, effectiveNurse);

    if (!result.success) {
      setErrorMessage(result.error || "Failed to record temperature.");
      return;
    }

    setSuccessMessage(`Recorded ${numericTemp.toFixed(1)}°C successfully for ${patient.name}.`);
    setTimeout(() => {
      onClose();
      setSuccessMessage("");
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Thermometer className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Record Daily Temperature
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-zinc-900 dark:text-zinc-100">{patient.name}</strong> ({patient.id}) • Bed:{" "}
                <strong>{patient.bedNumber}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {alreadyRecorded && existingRecord ? (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Temperature Already Recorded for Today</span>
            </div>
            <p className="text-xs">
              A reading of <strong>{existingRecord.temperature.toFixed(1)}°C</strong> was recorded today at{" "}
              <strong>{existingRecord.time}</strong> by <em>{existingRecord.nurseId}</em>.
            </p>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Per facility safety guidelines, duplicate daily entries are prohibited to prevent clinical confusion.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMessage && (
              <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="text-zinc-500">Calendar Date:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{systemDate}</p>
              </div>
              <div>
                <span className="text-zinc-500">Fever Threshold:</span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  ≥ {FACILITY_CONFIG.FEVER_THRESHOLD_CELSIUS}°C
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Body Temperature (°C) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min={FACILITY_CONFIG.VALID_TEMP_MIN}
                  max={FACILITY_CONFIG.VALID_TEMP_MAX}
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="e.g. 36.8"
                  required
                  className="pr-12 text-base font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  °C
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Acceptable clinical range: {FACILITY_CONFIG.VALID_TEMP_MIN}°C – {FACILITY_CONFIG.VALID_TEMP_MAX}°C
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Attending Nurse <span className="text-rose-500">*</span>
              </label>
              <select
                value={nurseId}
                onChange={(e) => {
                  setNurseId(e.target.value);
                  if (e.target.value !== "other") setCustomNurse("");
                }}
                className="w-full text-xs rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {DEFAULT_NURSES.map((nurse) => (
                  <option key={nurse} value={nurse}>
                    {nurse}
                  </option>
                ))}
                <option value="other">Other / Custom Name</option>
              </select>
              {nurseId === "other" && (
                <Input
                  placeholder="Enter nurse name and credentials..."
                  value={customNurse}
                  onChange={(e) => setCustomNurse(e.target.value)}
                  className="mt-1.5 text-xs"
                  required
                />
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Save Temperature Record
              </Button>
            </DialogFooter>
          </form>
        )}

        {alreadyRecorded && (
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
