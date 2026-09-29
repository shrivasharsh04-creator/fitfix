"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  ArrowLeft,
  Wrench,
  Clock,
  Sparkles,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { Equipment } from "@/types";
import { HealthGauge } from "@/components/ui/HealthGauge";
import { getStatusBadgeInfo, formatDate } from "@/lib/utils";

const FAULT_OPTIONS = [
  "Display / Screen is Black / Unresponsive",
  "Snapped Cable or Frayed Wire",
  "Squeaking, Grinding, or Scraping Noise",
  "Motor Overheating / Burning Odor",
  "Treadmill Belt Slipping or Misaligned",
  "Weight Stack Pin Sticking / Missing",
  "Seat / Pad / Upholstery Damaged",
  "Other Floor Hazard",
];

export default function MachinePublicScanPage() {
  const params = useParams();
  const router = useRouter();
  const qrCodeId = params?.qrCodeId as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Form State
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [selectedFault, setSelectedFault] = useState(FAULT_OPTIONS[0]);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMachine = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/equipment/${qrCodeId}`);
      const data = await res.json();
      if (data && !data.error) setEquipment(data);
    } catch (err) {
      console.error("Error loading scanned machine:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qrCodeId) fetchMachine();
  }, [qrCodeId]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equipmentId: equipment.id,
          reporterName: reporterName || "Gym Member (QR Scan)",
          reporterEmail: reporterEmail || null,
          priority: "HIGH",
          faultCategory: selectedFault,
          title: `[QR Scan Report] ${selectedFault}`,
          description: description || `Reported via QR code scan on machine ${equipment.qrCodeId}.`,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        fetchMachine();
      }
    } catch (err) {
      console.error("Error reporting issue:", err);
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

  if (!equipment) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center backdrop-blur-md">
        <Dumbbell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Machine Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">
          No equipment registered with QR ID &quot;{qrCodeId}&quot;
        </p>
        <Link
          href="/scan"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" /> Scan Another Machine
        </Link>
      </div>
    );
  }

  const isOutOfOrder = equipment.status === "OUT_OF_ORDER";
  const isUnderMaint = equipment.status === "UNDER_MAINTENANCE";
  const isOperational = equipment.status === "OPERATIONAL";
  const statusBadge = getStatusBadgeInfo(equipment.status);

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/scan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Scanner
        </Link>

        <Link
          href={`/equipment/${equipment.id}`}
          className="text-xs font-bold text-emerald-400 hover:underline"
        >
          Staff Passport View →
        </Link>
      </div>

      {/* Main Machine Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md space-y-5">
        {/* Status Callout Banner */}
        {isOutOfOrder ? (
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-rose-300">
            <AlertOctagon className="h-7 w-7 text-rose-400 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wide">
                Machine Out of Order
              </p>
              <p className="text-xs text-rose-300/80">
                A maintenance technician has been dispatched. Please do not use this machine.
              </p>
            </div>
          </div>
        ) : isUnderMaint ? (
          <div className="flex items-center gap-3 rounded-xl border border-blue-500/50 bg-blue-950/40 p-4 text-blue-300">
            <Wrench className="h-7 w-7 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wide">
                Under Active Maintenance
              </p>
              <p className="text-xs text-blue-300/80">
                Scheduled inspection or repair in progress.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 text-emerald-300">
            <ShieldCheck className="h-7 w-7 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-black text-white uppercase tracking-wide">
                Certified Operational & Safe
              </p>
              <p className="text-xs text-emerald-300/80">
                All safety inspections and preventive routines up to date.
              </p>
            </div>
          </div>
        )}

        {/* Machine Identity & Image */}
        <div className="flex items-start gap-4">
          {equipment.imageUrl && (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="h-20 w-20 rounded-xl object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400 border border-slate-700">
              {equipment.qrCodeId}
            </span>
            <h1 className="text-base font-black text-white leading-snug">
              {equipment.name}
            </h1>
            <p className="text-xs text-slate-400">
              {equipment.brand} • {equipment.category}
            </p>
            <p className="text-[11px] text-slate-400">
              Zone: <strong className="text-white">{equipment.zone}</strong>
            </p>
          </div>
        </div>

        {/* Health Score and Details */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
          <div className="rounded-xl bg-slate-950/60 p-3 flex flex-col items-center justify-center">
            <HealthGauge score={equipment.healthScore} size="sm" showLabel={true} />
          </div>

          <div className="rounded-xl bg-slate-950/60 p-3 flex flex-col justify-center text-xs space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Facility</p>
            <p className="text-white font-medium truncate">{equipment.facility?.name || "Flagship"}</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Status</p>
            <p className="text-emerald-400 font-bold">{statusBadge.label}</p>
          </div>
        </div>

        {/* Report Button / Form Section */}
        {!reportSuccess ? (
          !showReportForm ? (
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowReportForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition"
              >
                <AlertTriangle className="h-4 w-4" />
                Report Machine Broken or Malfunctioning
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="border-t border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  Report An Issue
                </span>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  What is the issue? *
                </label>
                <select
                  value={selectedFault}
                  onChange={(e) => setSelectedFault(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  {FAULT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Details / Observations
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened (e.g. cable snapped at top, belt slipped during run)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex M."
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">
                    Email for Updates (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-rose-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-rose-500 transition disabled:opacity-50"
              >
                {submitting ? "Sending Report to Maintenance..." : "Submit Breakdown Report"}
              </button>
            </form>
          )
        ) : (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center space-y-2 border-t border-slate-800">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">Issue Report Received!</h4>
            <p className="text-xs text-slate-300">
              Our gym maintenance team has been notified and a work order has been created. Thank you for helping keep MetroFlex safe!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
