"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Dumbbell,
  ArrowLeft,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  CalendarCheck,
  ShieldAlert,
  Printer,
  History,
  Info,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Equipment } from "@/types";
import { HealthGauge } from "@/components/ui/HealthGauge";
import { formatDate, formatCurrency, getStatusBadgeInfo, getPriorityBadgeInfo, getTicketStatusBadgeInfo } from "@/lib/utils";

export default function EquipmentPassportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"history" | "pm" | "specs" | "manuals">("history");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchEquipmentDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/equipment/${id}`);
      const data = await res.json();
      if (data && !data.error) {
        setEquipment(data);
      }
    } catch (err) {
      console.error("Failed to load equipment details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchEquipmentDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!equipment) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/equipment/${equipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchEquipmentDetails();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setStatusUpdating(false);
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <Dumbbell className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Equipment Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">
          Could not find an asset with ID or QR code &quot;{id}&quot;
        </p>
        <Link
          href="/equipment"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadgeInfo(equipment.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment List
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/scan/${equipment.qrCodeId}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Public Member View
          </Link>
          <Link
            href={`/work-orders/new?equipmentId=${equipment.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-rose-500 transition"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Main Hero Card: Digital Passport Header */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Machine Photo & Core Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex-shrink-0 shadow-md">
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500">
                  <Dumbbell className="h-10 w-10" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-black text-emerald-400 border border-emerald-500/30">
                  {equipment.qrCodeId}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusBadge.color}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                  {statusBadge.label}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                {equipment.name}
              </h1>

              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">{equipment.brand}</span> • {equipment.model} • Located in <strong className="text-white">{equipment.zone}</strong>
              </p>

              <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                <span>Facility: <strong>{equipment.facility?.name || "Flagship"}</strong></span>
                <span>•</span>
                <span>S/N: <strong className="font-mono">{equipment.serialNumber}</strong></span>
              </div>
            </div>
          </div>

          {/* Health Gauge & QR Code Tag */}
          <div className="flex items-center gap-6 self-center lg:self-auto border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-8">
            <HealthGauge score={equipment.healthScore} size="lg" showLabel={true} />

            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white text-slate-900 border-2 border-slate-300 shadow-inner">
              <QRCodeSVG
                value={typeof window !== "undefined" ? `${window.location.origin}/scan/${equipment.qrCodeId}` : `https://fitfix.metroflex.com/scan/${equipment.qrCodeId}`}
                size={70}
                level="M"
              />
              <span className="mt-1 font-mono text-[9px] font-black">{equipment.qrCodeId}</span>
            </div>
          </div>
        </div>

        {/* Quick Status Override Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            Override Machine State:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { status: "OPERATIONAL", label: "Operational", color: "hover:bg-emerald-500/20 text-emerald-400" },
              { status: "DEGRADED", label: "Degraded", color: "hover:bg-amber-500/20 text-amber-400" },
              { status: "UNDER_MAINTENANCE", label: "Under Maintenance", color: "hover:bg-blue-500/20 text-blue-400" },
              { status: "OUT_OF_ORDER", label: "Out of Order", color: "hover:bg-rose-500/20 text-rose-400" },
            ].map((btn) => (
              <button
                key={btn.status}
                disabled={statusUpdating || equipment.status === btn.status}
                onClick={() => handleUpdateStatus(btn.status)}
                className={`rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold transition ${
                  equipment.status === btn.status
                    ? "bg-slate-700 text-white font-bold border-emerald-500/50"
                    : btn.color
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs transition ${
            activeTab === "history"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <History className="h-4 w-4" />
          Maintenance History ({equipment.tickets?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("pm")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs transition ${
            activeTab === "pm"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CalendarCheck className="h-4 w-4" />
          Preventive Schedules ({equipment.pmSchedules?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs transition ${
            activeTab === "specs"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Info className="h-4 w-4" />
          Technical Specs & Asset Lifecycle
        </button>
      </div>

      {/* Tab 1: Maintenance History & Work Orders */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Service & Repair Logs</h3>
            <Link
              href={`/work-orders/new?equipmentId=${equipment.id}`}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              + Log New Work Order
            </Link>
          </div>

          {!equipment.tickets || equipment.tickets.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
              No historical work orders recorded for this asset. Machine running smoothly.
            </div>
          ) : (
            <div className="space-y-3">
              {equipment.tickets.map((ticket) => {
                const priorityBadge = getPriorityBadgeInfo(ticket.priority);
                const ticketStatusBadge = getTicketStatusBadgeInfo(ticket.status);

                return (
                  <div
                    key={ticket.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md space-y-3 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          {ticket.ticketNumber}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${ticketStatusBadge.color}`}>
                          {ticketStatusBadge.label}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          • {ticket.faultCategory}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {formatDate(ticket.createdAt, "MMM d, yyyy h:mm a")}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{ticket.title}</h4>
                      <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>

                    {/* Technician Logs & Actions Taken */}
                    {ticket.logs && ticket.logs.length > 0 && (
                      <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 space-y-2">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Technician Resolution History:
                        </p>
                        {ticket.logs.map((log) => (
                          <div key={log.id} className="text-xs text-slate-300 space-y-1">
                            <p className="font-medium text-emerald-400">
                              ✓ {log.actionTaken} ({log.laborMinutes} mins labor)
                            </p>
                            {log.notes && (
                              <p className="text-[11px] text-slate-400 italic pl-3">
                                &quot;{log.notes}&quot; — {log.technician?.name || "Technician"}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Reported By: <strong>{ticket.reportedBy?.name || ticket.reporterName || "Staff"}</strong></span>
                      <Link
                        href={`/work-orders/${ticket.id}`}
                        className="text-emerald-400 font-semibold hover:underline"
                      >
                        View Full Work Order →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Preventive Maintenance Schedules */}
      {activeTab === "pm" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Scheduled Maintenance Checklists</h3>
            <Link
              href="/preventive"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Open PM Calendar →
            </Link>
          </div>

          {!equipment.pmSchedules || equipment.pmSchedules.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
              No PM schedules configured. Add one from the Preventive Maintenance module.
            </div>
          ) : (
            <div className="space-y-3">
              {equipment.pmSchedules.map((schedule) => {
                let checklist = [];
                try {
                  checklist = JSON.parse(schedule.checklistSchema);
                } catch {}

                return (
                  <div
                    key={schedule.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                          {schedule.frequency}
                        </span>
                        <h4 className="text-xs font-bold text-white">{schedule.title}</h4>
                      </div>
                      <Link
                        href={`/preventive/execute/${schedule.id}`}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition"
                      >
                        Run Checklist Now
                      </Link>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                        Checklist Steps ({checklist.length} Tasks):
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {checklist.map((item: any) => (
                          <li key={item.id} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>{item.task}</span>
                            {item.required && (
                              <span className="text-[9px] text-amber-400 uppercase font-semibold">
                                [Required]
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Last Done: <strong>{formatDate(schedule.lastCompletedAt)}</strong></span>
                      <span>Next Due: <strong className="text-emerald-400">{formatDate(schedule.nextDueDate)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Technical Specs & Asset Lifecycle */}
      {activeTab === "specs" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-4">Commercial Asset Lifecycle Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Category</p>
              <p className="text-white font-semibold text-sm">{equipment.category}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Manufacturer & Brand</p>
              <p className="text-white font-semibold text-sm">{equipment.brand}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Model Name / Number</p>
              <p className="text-white font-semibold text-sm">{equipment.model}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Serial Number</p>
              <p className="font-mono text-emerald-400 font-bold text-sm">{equipment.serialNumber}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Floor Location Zone</p>
              <p className="text-white font-semibold text-sm">{equipment.zone}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Original Purchase Cost</p>
              <p className="text-white font-semibold text-sm">{formatCurrency(equipment.purchaseCost)}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Purchase Date</p>
              <p className="text-white font-semibold text-sm">{formatDate(equipment.purchaseDate)}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Warranty Expiration</p>
              <p className="text-emerald-400 font-semibold text-sm">{formatDate(equipment.warrantyExpiry)}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold">Asset Registration Date</p>
              <p className="text-white font-semibold text-sm">{formatDate(equipment.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
