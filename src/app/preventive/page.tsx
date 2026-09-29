"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Dumbbell,
  ShieldCheck,
} from "lucide-react";
import { PMSchedule, PMFrequency } from "@/types";
import { formatDate, isOverdue } from "@/lib/utils";

const FREQUENCIES = ["ALL", "DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "BIANNUAL", "ANNUAL"];

export default function PreventiveMaintenancePage() {
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New PM Schedule Form
  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [newEqId, setNewEqId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState<PMFrequency>("MONTHLY");
  const [newChecklist, setNewChecklist] = useState<string>([
    "Check safety stop mechanism and emergency shutoff lanyard",
    "Inspect moving belts and cables for wear or fraying",
    "Apply silicone lubricant to guide rods and tracks",
    "Verify electronic display readings and sensor accuracy",
  ].join("\n"));

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/preventive");
      const data = await res.json();
      if (Array.isArray(data)) setSchedules(data);

      const eqRes = await fetch("/api/equipment");
      const eqData = await eqRes.json();
      if (Array.isArray(eqData)) {
        setEquipmentList(eqData);
        if (eqData.length > 0) setNewEqId(eqData[0].id);
      }
    } catch (err) {
      console.error("Failed to load PM schedules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const tasks = newChecklist
      .split("\n")
      .map((t, idx) => ({ id: `c_${idx + 1}`, task: t.trim(), required: true }))
      .filter((t) => t.task.length > 0);

    try {
      const res = await fetch("/api/preventive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: newEqId,
          title: newTitle,
          frequency: newFrequency,
          checklist: tasks,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTitle("");
        fetchSchedules();
      }
    } catch (err) {
      console.error("Error creating PM schedule:", err);
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    if (frequencyFilter === "ALL") return true;
    return s.frequency === frequencyFilter;
  });

  const overdueCount = schedules.filter((s) => isOverdue(s.nextDueDate)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Preventive Maintenance (PM) Schedules
            </h1>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {schedules.length} Active Routines
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automate recurring inspection checklists to prevent downtime and extend machine lifespans
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            New PM Routine
          </button>
        </div>
      </div>

      {/* Overdue Warning Callout */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white">
                {overdueCount} Preventive Maintenance Routine{overdueCount > 1 ? "s are" : " is"} Past Due
              </p>
              <p className="text-[11px] text-amber-300/80">
                Execute inspections immediately to prevent premature mechanical wear and warranty voiding.
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
            Overdue
          </span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <span className="text-slate-400 font-semibold uppercase text-[11px] mr-1">
          Frequency:
        </span>
        {FREQUENCIES.map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequencyFilter(freq)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              frequencyFilter === freq
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {freq}
          </button>
        ))}
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-500">
          No preventive maintenance routines found for this frequency.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchedules.map((schedule) => {
            const overdue = isOverdue(schedule.nextDueDate);
            let checklist: any[] = [];
            try {
              checklist = JSON.parse(schedule.checklistSchema);
            } catch {}

            return (
              <div
                key={schedule.id}
                className={`flex flex-col justify-between rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-md shadow-lg transition-all hover:shadow-xl ${
                  overdue ? "border-amber-500/50 bg-amber-950/10" : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Top Row: Frequency Badge & Overdue status */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-400 border border-blue-500/30">
                      {schedule.frequency}
                    </span>
                    {overdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 animate-pulse">
                        <Clock className="h-3 w-3" /> OVERDUE
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-400">
                        On Schedule
                      </span>
                    )}
                  </div>

                  {/* Title & Machine Name */}
                  <div className="mt-3 space-y-1">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {schedule.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target: <strong className="text-slate-200">{schedule.equipment?.name}</strong> ({schedule.equipment?.qrCodeId})
                    </p>
                  </div>

                  {/* Checklist Preview Box */}
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Digital Checklist ({checklist.length} Tasks):
                    </p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {checklist.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                          <span className="truncate">{item.task}</span>
                        </li>
                      ))}
                      {checklist.length > 3 && (
                        <li className="text-[10px] text-slate-500 italic pl-3">
                          + {checklist.length - 3} more inspection items
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Dates Row */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Last Completed</p>
                      <p className="text-slate-300 font-medium">
                        {formatDate(schedule.lastCompletedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Next Due Date</p>
                      <p className={`font-bold ${overdue ? "text-amber-400" : "text-emerald-400"}`}>
                        {formatDate(schedule.nextDueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-5 border-t border-slate-800/80 pt-3">
                  <Link
                    href={`/preventive/execute/${schedule.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Launch Digital Checklist Runner
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New PM Schedule Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Create Preventive Maintenance Routine</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Set automated recurring inspections and checklists for equipment
            </p>

            <form onSubmit={handleCreateSchedule} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Routine Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Treadmill Belt Tensioning & Deck Lubrication"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Equipment *
                  </label>
                  <select
                    value={newEqId}
                    onChange={(e) => setNewEqId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.qrCodeId} - {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as PMFrequency)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Bi-Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="BIANNUAL">Bi-Annual</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Checklist Tasks (One task per line)
                </label>
                <textarea
                  rows={5}
                  value={newChecklist}
                  onChange={(e) => setNewChecklist(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 shadow-md"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
