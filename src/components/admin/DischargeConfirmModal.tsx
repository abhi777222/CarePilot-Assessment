"use client";

import React, { useState } from "react";
import { Patient } from "@/types/quarantine";
import { useQuarantine } from "@/context/QuarantineContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, ShieldCheck, BedDouble, Calendar } from "lucide-react";

interface DischargeConfirmModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DischargeConfirmModal({ patient, isOpen, onClose }: DischargeConfirmModalProps) {
  const { systemDate, getPatientEligibility, confirmDischarge } = useQuarantine();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!patient) return null;

  const eligibility = getPatientEligibility(patient.id);

  const handleConfirm = () => {
    setErrorMessage("");
    setSuccessMessage("");

    const result = confirmDischarge(patient.id);
    if (!result.success) {
      setErrorMessage(result.error || "Discharge failed.");
      return;
    }

    setSuccessMessage(`Patient ${patient.name} has been officially discharged! Bed ${patient.bedNumber} is now released.`);
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
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Confirm Administrative Discharge
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-zinc-900 dark:text-zinc-100">{patient.name}</strong> ({patient.id})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 pt-1 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Clinical Verification Card */}
          <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>3 Full Consecutive Fever-Free Days Verified</span>
            </div>
            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
              Qualifying dates:{" "}
              <strong className="text-zinc-900 dark:text-zinc-100">
                {eligibility.feverFreeDates.join(", ") || "Confirmed in log"}
              </strong>
            </div>
            <p className="text-[11px] text-zinc-500">
              Clinical rounds and daily doctor visits have certified patient convalescence.
            </p>
          </div>

          {/* Operational Impact Notice */}
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
              Operational Actions Upon Confirmation:
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>
                Patient status transitions from <em>discharge_eligible</em> to <strong>discharged (recovered)</strong>.
              </li>
              <li>
                Bed <strong>{patient.bedNumber}</strong> is immediately released back to available facility capacity.
              </li>
              <li>
                Facility recovery statistics and benchmark metrics will update dynamically.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confirm & Release Bed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
