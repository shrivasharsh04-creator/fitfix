"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ArrowLeft,
  AlertTriangle,
  Camera,
  ShieldAlert,
  User,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Equipment, User as UserType } from "@/types";
import { useAuth } from "@/lib/auth-context";

const FAULT_CATEGORIES = [
  "Motor Failure",
  "Snapped Cable",
  "Display Dead / Power Issue",
  "Worn Belt / Deck Friction",
  "Squeaking / Grinding Noise",
  "Structural / Frame / Weld",
  "Sensors / Heart Rate / Speedometer",
  "Selector Pin / Weight Stack Sticking",
  "Upholstery / Pad Tear",
  "Other",
];

function NewWorkOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEquipmentId = searchParams.get("equipmentId") || "";
  const { currentUser } = useAuth();

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(initialEquipmentId);
  const [faultCategory, setFaultCategory] = useState(FAULT_CATEGORIES[0]);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/equipment")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEquipmentList(data);
          if (!selectedEquipmentId && data.length > 0) {
            setSelectedEquipmentId(data[0].id);
          }
        }
      })
      .catch((err) => console.error("Error loading equipment", err));
  }, [selectedEquipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: selectedEquipmentId,
          reportedById: currentUser.id,
          technicianId: technicianId || null,
          priority,
          faultCategory,
          title,
          description,
        }),
      });

      if (res.ok) {
        const ticket = await res.json();
        router.push(`/work-orders/${ticket.id}`);
      }
    } catch (err) {
      console.error("Error creating work order:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEquipment = equipmentList.find((e) => e.id === selectedEquipmentId);

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/work-orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel & Back
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Log Maintenance Work Order
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch technicians to fix broken gym machines, worn cables, or motor errors
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Equipment Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select Gym Equipment *
            </label>
            <select
              required
              value={selectedEquipmentId}
              onChange={(e) => setSelectedEquipmentId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.qrCodeId} — {eq.name} ({eq.zone})
                </option>
              ))}
            </select>
            {selectedEquipment && (
              <p className="mt-1 text-[11px] text-emerald-400 font-medium">
                Selected: {selectedEquipment.brand} • {selectedEquipment.model} ({selectedEquipment.zone})
              </p>
            )}
          </div>

          {/* Fault Category */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Fault Category *
            </label>
            <select
              value={faultCategory}
              onChange={(e) => setFaultCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              {FAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Priority & SLA Matrix *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: "LOW", label: "Low", desc: "72h SLA (Cosmetic)", color: "border-blue-500/40 text-blue-400" },
                { level: "MEDIUM", label: "Medium", desc: "48h SLA (Degraded)", color: "border-amber-500/40 text-amber-400" },
                { level: "HIGH", label: "High", desc: "24h SLA (High Traffic)", color: "border-orange-500/40 text-orange-400" },
                { level: "CRITICAL", label: "Critical", desc: "12h SLA (Safety Hazard)", color: "border-rose-500/40 text-rose-400" },
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level as any)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                      isSelected
                        ? "bg-slate-800 font-bold border-emerald-400 shadow-md text-white ring-1 ring-emerald-400"
                        : "bg-slate-950/40 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <span className={`text-xs font-black ${p.color}`}>{p.label}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Issue Summary Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Left pulley cable fraying at top swivel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Detailed Description & Member Observations *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe symptoms, strange noises, error codes on display, or safety risks observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Assign Technician */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Assign Lead Technician
            </label>
            <select
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Leave unassigned (Open Triage Pool)</option>
              <option value="usr_tech_01">Alex Rivera (Lead Tech)</option>
              <option value="usr_tech_02">Sam Chen (Field Tech)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/work-orders"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {submitting ? "Dispatching Work Order..." : "Create & Dispatch Work Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewWorkOrderPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-emerald-400">Loading form...</div>}>
      <NewWorkOrderForm />
    </Suspense>
  );
}
