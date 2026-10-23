"use client";

import React, { useState } from "react";
import { Patient } from "@/types/quarantine";
import { useQuarantine } from "@/context/QuarantineContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface DeceasedModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeceasedModal({ patient, isOpen, onClose }: DeceasedModalProps) {
  const { recordDeceased } = useQuarantine();
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!patient) return null;

  const handleConfirm = () => {
    setErrorMessage("");
    setSuccessMessage("");

    const result = recordDeceased(patient.id, notes);
    if (!result.success) {
      setErrorMessage(result.error || "Failed to update record.");
      return;
    }

    setSuccessMessage(`Patient ${patient.name} recorded as deceased. Bed ${patient.bedNumber} has been released.`);
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
            <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Record Patient Mortality
              </DialogTitle>
              <DialogDescription className="text-xs">
                Patient: <strong className="text-zinc-900 dark:text-zinc-100">{patient.name}</strong> ({patient.id}) • Bed:{" "}
                <strong>{patient.bedNumber}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-1 text-xs">
          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs">
            <p>
              Please confirm recording of mortality for <strong>{patient.name}</strong>. This outcome will be incorporated into the facility&apos;s mortality benchmark calculation, and Bed <strong>{patient.bedNumber}</strong> will be released.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Clinical Cause / Mortality Notes (Optional)
            </label>
            <Textarea
              placeholder="e.g. Acute respiratory failure secondary to viral storm..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[70px]"
            />
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
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            Confirm Mortality
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
