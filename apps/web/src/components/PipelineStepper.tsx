"use client";

import React from "react";
import { Sparkles, ShieldCheck, FileCode, FlaskConical, CheckCircle2, Loader2, Check } from "lucide-react";

export type StepStage = "understanding" | "validating" | "compiling" | "simulating" | "verified" | "idle";
export type StepState = "pending" | "running" | "completed" | "failed";

interface PipelineStepperProps {
  currentStage: StepStage;
  failedStage?: string | null;
  onSelectStep?: (stage: StepStage) => void;
}

export function PipelineStepper({ currentStage, failedStage, onSelectStep }: PipelineStepperProps) {
  const steps: { id: StepStage; label: string; tooltip: string; icon: any }[] = [
    {
      id: "understanding",
      label: "Intent Intake",
      tooltip: "Step 1: Parse natural language intent into structured Intermediate Representation (IR)",
      icon: Sparkles,
    },
    {
      id: "validating",
      label: "Lockout Check",
      tooltip: "Step 2: Verify safety invariants and prevent port 22 / management SSH lockout",
      icon: ShieldCheck,
    },
    {
      id: "compiling",
      label: "Rule Synthesis",
      tooltip: "Step 3: Compile validated IR into deterministic Linux nftables and iptables rules",
      icon: FileCode,
    },
    {
      id: "simulating",
      label: "Sandbox Probes",
      tooltip: "Step 4: Execute 7 automated traffic probes in isolated network namespace sandbox",
      icon: FlaskConical,
    },
    {
      id: "verified",
      label: "Evidence Verified",
      tooltip: "Step 5: Review packet journeys, drop counters, and zero-collateral proof",
      icon: CheckCircle2,
    },
  ];

  const getStatus = (stepId: StepStage): StepState => {
    if (failedStage === stepId) return "failed";
    const order: StepStage[] = ["understanding", "validating", "compiling", "simulating", "verified"];
    const currentIndex = order.indexOf(currentStage);
    const stepIndex = order.indexOf(stepId);

    if (currentStage === "idle") {
      return "pending";
    }
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) {
      return currentStage === "verified" ? "completed" : "running";
    }
    return "pending";
  };

  return (
    <div className="w-full bg-[var(--surface-card)] text-[var(--ink-900)] p-2.5 sm:p-3 rounded-2xl border border-[var(--border)] shadow-sm flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto select-none transition-colors">
      {steps.map((step, idx) => {
        const status = getStatus(step.id);
        const Icon = step.icon;
        const isLast = idx === steps.length - 1;
        const isCurrent = currentStage === step.id;

        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => onSelectStep && onSelectStep(step.id)}
              title={step.tooltip}
              aria-label={step.label}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 text-left ${
                isCurrent
                  ? "bg-[var(--surface-well)] ring-1 ring-[var(--border-strong)] shadow-xs"
                  : "hover:bg-[var(--surface-well)] hover:ring-1 hover:ring-[var(--border)]"
              }`}
            >
              {/* Badge Icon matching swatch design */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  status === "completed"
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                    : status === "running"
                    ? "bg-[var(--ink-900)] text-[var(--bg)] shadow-md ring-2 ring-[var(--ink-900)]/20"
                    : "bg-[var(--surface-well)] text-[var(--ink-400)] border border-[var(--border)]"
                }`}
              >
                {status === "running" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === "completed" ? (
                  <Check className="w-4 h-4 stroke-[2.75]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Label */}
              <div>
                <span
                  className={`text-xs font-mono tracking-tight block whitespace-nowrap transition-colors ${
                    status === "completed"
                      ? "text-[var(--ink-700)] group-hover:text-[var(--ink-900)] font-medium"
                      : status === "running"
                      ? "text-[var(--ink-900)] font-bold"
                      : "text-[var(--ink-500)] group-hover:text-[var(--ink-700)]"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[9px] font-mono block uppercase tracking-wider text-[var(--ink-400)]">
                  {status === "completed" ? "Done" : status === "running" ? "Active" : "Ready"}
                </span>
              </div>
            </button>

            {/* Connecting line */}
            {!isLast && (
              <div className="flex-1 min-w-4 max-w-10 h-[1px] bg-[var(--border)] mx-1 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
