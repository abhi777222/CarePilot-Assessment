"use client";

import React from "react";
import { useQuarantine } from "@/context/QuarantineContext";
import { UserRole } from "@/types/quarantine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Stethoscope,
  Activity,
  RotateCcw,
  Calendar,
  BedDouble,
  Building2,
} from "lucide-react";

export function HospitalHeader() {
  const { role, setRole, systemDate, stats, resetDemoData } = useQuarantine();

  const roleConfig: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; desc: string }
  > = {
    nurse: {
      label: "Nurse",
      icon: <Activity className="h-4 w-4" />,
      color: "bg-teal-600 hover:bg-teal-700 text-white",
      desc: "Daily temperature monitoring & vitals",
    },
    doctor: {
      label: "Doctor",
      icon: <Stethoscope className="h-4 w-4" />,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      desc: "Daily rounds, clinical notes & visits",
    },
    admin: {
      label: "Admin",
      icon: <ShieldAlert className="h-4 w-4" />,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
      desc: "Capacity, discharge approval & statistics",
    },
  };

  return (
    <header className="border-b border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950 sticky top-0 z-30">
      {/* Top Bar: Branding & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Facility Title */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-tight">CarePilot</span>
                  <span className="text-zinc-300 dark:text-zinc-700 font-light">|</span>
                  <span className="hidden sm:inline">Virus Quarantine & Treatment Facility</span>
                  <span className="sm:hidden">Quarantine Facility</span>
                </h1>
                <Badge variant="outline" className="text-[11px] font-medium border-indigo-300 text-indigo-700 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                  Iso-Unit A
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Infectious Disease Quarantine & Convalescence Management
              </p>
            </div>

          {/* Quick Metrics & System Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* System Date Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              <span>Today: {systemDate}</span>
            </div>

            {/* Live Bed Occupancy */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <BedDouble className="h-3.5 w-3.5 text-zinc-500" />
              <span>
                Occupancy:{" "}
                <strong className={stats.occupiedBeds >= 74 ? "text-rose-600 font-bold" : "text-zinc-900 dark:text-zinc-100"}>
                  {stats.occupiedBeds}
                </strong>
                {" / "}{stats.totalCapacity} beds
              </span>
            </div>

            {/* Reset Demo Data Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetDemoData}
              title="Reset data to initial assessment sample state"
              className="text-xs gap-1.5 h-8 border-dashed text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo
            </Button>
          </div>
        </div>

        {/* Role Switcher Toolbar */}
        <div className="py-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mr-1">
              Active Role:
            </span>
            <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {(["nurse", "doctor", "admin"] as UserRole[]).map((r) => {
                const config = roleConfig[r];
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      isActive
                        ? `${config.color} shadow-xs font-semibold`
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {config.icon}
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{roleConfig[role].desc}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
