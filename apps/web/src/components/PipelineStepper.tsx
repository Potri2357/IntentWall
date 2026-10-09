"use client";

import React from "react";
import { Sparkles, ShieldCheck, FileCode, FlaskConical, CircleCheck, Circle, LoaderCircle, CircleX } from "lucide-react";

export type StepState = "pending" | "running" | "completed" | "failed";

interface PipelineStepperProps {
  currentStage: "understanding" | "validating" | "compiling" | "simulating" | "verified" | "idle";
  failedStage?: string | null;
}

export function PipelineStepper({ currentStage, failedStage }: PipelineStepperProps) {
  const steps = [
    { id: "understanding", label: "Understanding", icon: Sparkles },
    { id: "validating", label: "Validating", icon: ShieldCheck },
    { id: "compiling", label: "Compiling", icon: FileCode },
    { id: "simulating", label: "Simulating", icon: FlaskConical },
    { id: "verified", label: "Verified", icon: CircleCheck },
  ];

  const getStatus = (stepId: string): StepState => {
    if (failedStage === stepId) return "failed";
    const order = ["understanding", "validating", "compiling", "simulating", "verified"];
    const currentIndex = order.indexOf(currentStage);
    const stepIndex = order.indexOf(stepId);

    if (currentStage === "idle") return "pending";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) {
      return currentStage === "verified" ? "completed" : "running";
    }
    return "pending";
  };

  return (
    <div className="w-full neu-raised-sm p-3.5 border border-[var(--pal-200)] flex items-center justify-between gap-2 overflow-x-auto select-none">
      {steps.map((step, idx) => {
        const status = getStatus(step.id);
        const Icon = step.icon;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  status === "completed"
                    ? "bg-[rgba(26,107,67,0.12)] text-[var(--allow)] border border-[rgba(26,107,67,0.3)]"
                    : status === "running"
                    ? "neu-inset text-[var(--ink-900)] border border-[var(--ink-500)]"
                    : status === "failed"
                    ? "bg-[rgba(179,38,30,0.12)] text-[var(--deny)] border border-[rgba(179,38,30,0.3)]"
                    : "neu-raised-sm text-[var(--ink-500)] opacity-60"
                }`}
              >
                {status === "running" ? (
                  <LoaderCircle className="w-4 h-4 animate-spin text-[var(--ink-900)]" strokeWidth={1.75} />
                ) : status === "completed" ? (
                  <CircleCheck className="w-4 h-4 text-[var(--allow)]" strokeWidth={1.75} />
                ) : status === "failed" ? (
                  <CircleX className="w-4 h-4 text-[var(--deny)]" strokeWidth={1.75} />
                ) : (
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                )}
              </div>

              <span
                className={`text-xs font-mono font-medium ${
                  status === "running"
                    ? "text-[var(--ink-900)] font-bold"
                    : status === "completed"
                    ? "text-[var(--ink-700)]"
                    : status === "failed"
                    ? "text-[var(--deny)] font-bold"
                    : "text-[var(--ink-500)]"
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 min-w-4 max-w-12 h-[1px] bg-[var(--pal-200)] mx-1" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
