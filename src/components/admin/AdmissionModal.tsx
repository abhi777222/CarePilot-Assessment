"use client";

import React, { useState } from "react";
import { useQuarantine } from "@/context/QuarantineContext";
import { FACILITY_CONFIG } from "@/lib/constants";
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
import { UserPlus, AlertCircle, CheckCircle2, BedDouble } from "lucide-react";

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdmissionModal({ isOpen, onClose }: AdmissionModalProps) {
  const { stats, availableBedsList, admitPatient } = useQuarantine();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bedNumber, setBedNumber] = useState(availableBedsList[0] || "");
  const [diagnosis, setDiagnosis] = useState("Suspected Viral Syndrome - Intake");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isAtCapacity = stats.activePatients >= FACILITY_CONFIG.MAX_BED_CAPACITY;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (isAtCapacity) {
      setErrorMessage(`Cannot admit patient. Facility is at maximum capacity (${FACILITY_CONFIG.MAX_BED_CAPACITY}/74 beds occupied).`);
      return;
    }

    const numericAge = parseInt(age, 10);
    if (isNaN(numericAge) || numericAge <= 0 || numericAge > 120) {
      setErrorMessage("Please enter a valid age.");
      return;
    }

    if (!bedNumber) {
      setErrorMessage("Please select an available bed.");
      return;
    }

    const result = admitPatient({
      name,
      age: numericAge,
      gender,
      bedNumber,
      diagnosis,
    });

    if (!result.success) {
      setErrorMessage(result.error || "Admission failed.");
      return;
    }

    setSuccessMessage(`Patient ${name} successfully admitted to bed ${bedNumber}.`);
    setTimeout(() => {
      onClose();
      setName("");
      setAge("");
      setSuccessMessage("");
    }, 1200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Admit New Quarantine Patient
              </DialogTitle>
              <DialogDescription className="text-xs">
                Capacity: <strong>{stats.occupiedBeds} / {FACILITY_CONFIG.MAX_BED_CAPACITY}</strong> beds occupied ({stats.availableBeds} available)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isAtCapacity ? (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>Facility at Maximum Bed Capacity (74/74)</span>
            </div>
            <p>
              Under strict viral containment protocols, no further patients can be admitted until an existing patient completes their 3-day fever-free quarantine and is discharged by an Administrator.
            </p>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
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
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Johnathan Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Age <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 45"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:ring-2 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Assign Bed (74 Max Capacity) <span className="text-rose-500">*</span>
              </label>
              <select
                value={bedNumber || availableBedsList[0] || ""}
                onChange={(e) => setBedNumber(e.target.value)}
                required
                className="w-full text-xs font-mono font-semibold rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-xs focus:ring-2 focus:ring-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {availableBedsList.map((bed) => (
                  <option key={bed} value={bed}>
                    Bed {bed} (Available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Initial Clinical Diagnosis / Intake Reason
              </label>
              <Input
                placeholder="e.g. Moderate Viral Pneumonia"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              >
                Confirm Admission
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
