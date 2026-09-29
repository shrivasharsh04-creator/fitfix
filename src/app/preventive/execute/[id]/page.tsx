"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  Dumbbell,
} from "lucide-react";
import { PMSchedule } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/utils";

interface ChecklistItemState {
  id: string;
  task: string;
  required: boolean;
  passed: boolean;
  notes: string;
}

export default function ChecklistRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser } = useAuth();

  const [schedule, setSchedule] = useState<PMSchedule | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItemState[]>([]);
  const [overallNotes, setOverallNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/preventive")
      .then((res) => res.json())
      .then((data: PMSchedule[]) => {
        if (Array.isArray(data)) {
          const found = data.find((s) => s.id === id);
          if (found) {
            setSchedule(found);
            let parsedTasks: any[] = [];
            try {
              parsedTasks = JSON.parse(found.checklistSchema);
            } catch {}

            setChecklist(
              parsedTasks.map((t, idx) => ({
                id: t.id || `item_${idx}`,
                task: t.task,
                required: t.required ?? true,
                passed: true, // default to pass
                notes: "",
              }))
            );
          }
        }
      })
      .catch((err) => console.error("Error fetching schedule:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleItemPass = (index: number, value: boolean) => {
    setChecklist((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, passed: value } : item))
    );
  };

  const updateItemNotes = (index: number, notes: string) => {
    setChecklist((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, notes } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/preventive/${schedule.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: currentUser.id,
          results: checklist,
          notes: overallNotes,
        }),
      });

      if (res.ok) {
        setCompletedSuccess(true);
        setTimeout(() => {
          router.push("/preventive");
        }, 1800);
      }
    } catch (err) {
      console.error("Error submitting checklist execution:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-emerald-400">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <CalendarCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">PM Routine Not Found</h2>
        <Link
          href="/preventive"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PM Schedules
        </Link>
      </div>
    );
  }

  const allPassed = checklist.every((c) => c.passed);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/preventive"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel Inspection
        </Link>
      </div>

      {completedSuccess ? (
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-10 text-center backdrop-blur-md animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-white">
            Preventive Inspection Recorded!
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Inspection logs saved to asset passport and next inspection schedule advanced automatically.
          </p>
          <p className="text-xs text-emerald-400 font-semibold mt-4">
            Redirecting to schedules dashboard...
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs font-black uppercase text-blue-400 border border-blue-500/30">
                  {schedule.frequency}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Inspecting Technician: <strong className="text-emerald-400">{currentUser.name}</strong>
                </span>
              </div>
              <h1 className="mt-2 text-xl sm:text-2xl font-black text-white">
                {schedule.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Target Machine: <strong className="text-white">{schedule.equipment?.name}</strong> ({schedule.equipment?.qrCodeId}) • Zone: {schedule.equipment?.zone}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`rounded-xl border p-3 text-center ${allPassed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-amber-500/30 bg-amber-500/10 text-amber-400"}`}>
                <p className="text-[10px] uppercase font-bold">Status</p>
                <p className="font-black text-xs mt-0.5">{allPassed ? "ALL PASSING" : "ATTENTION"}</p>
              </div>
            </div>
          </div>

          {/* Interactive Checklist Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              Step-By-Step Inspection Tasks:
            </p>

            <div className="space-y-3">
              {checklist.map((item, index) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all ${
                    item.passed
                      ? "border-slate-800 bg-slate-950/60"
                      : "border-rose-500/40 bg-rose-950/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 font-mono text-xs font-bold text-slate-300 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white text-xs">{item.task}</p>
                        {item.required && (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            Required safety check
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pass / Fail Toggle Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleItemPass(index, true)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                          item.passed
                            ? "bg-emerald-600 text-white shadow-md"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Pass
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleItemPass(index, false)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
                          !item.passed
                            ? "bg-rose-600 text-white shadow-md"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Fail / Issue
                      </button>
                    </div>
                  </div>

                  {/* Notes / Observation field */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <input
                      type="text"
                      placeholder="Add observation or measurement notes (e.g. tension calibrated, cleaned track)..."
                      value={item.notes}
                      onChange={(e) => updateItemNotes(index, e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Inspection Summary & Notes */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <label className="block font-semibold text-slate-300">
                Overall Technician Verdict & Inspection Notes
              </label>
              <textarea
                rows={3}
                placeholder="Summary of machine mechanical condition, recommended upcoming repairs, or notes for next shift..."
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link
                href="/preventive"
                className="rounded-xl border border-slate-700 px-4 py-2.5 font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-lg hover:bg-emerald-500 transition disabled:opacity-50"
              >
                {submitting ? "Saving PM Execution..." : "Complete & Certify PM Inspection"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
