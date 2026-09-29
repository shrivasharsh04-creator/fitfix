"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  ArrowLeft,
  Clock,
  Package,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  Send,
  Plus,
  Trash2,
  DollarSign,
  Camera,
  RefreshCw,
} from "lucide-react";
import { MaintenanceTicket, SparePart, TicketStatus, Priority } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { getPriorityBadgeInfo, getTicketStatusBadgeInfo, formatDate, formatCurrency, formatTimeAgo } from "@/lib/utils";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { currentUser } = useAuth();

  const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingLog, setSubmittingLog] = useState(false);

  // New Work Log Form
  const [actionTaken, setActionTaken] = useState("");
  const [laborMinutes, setLaborMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [markCompleted, setMarkCompleted] = useState(false);
  const [selectedParts, setSelectedParts] = useState<{ partId: string; quantity: number }[]>([]);

  const fetchTicketAndParts = async () => {
    setLoading(true);
    try {
      const [ticketRes, partsRes] = await Promise.all([
        fetch(`/api/tickets/${id}`),
        fetch("/api/inventory"),
      ]);

      const ticketData = await ticketRes.json();
      const partsData = await partsRes.json();

      if (ticketData && !ticketData.error) setTicket(ticketData);
      if (Array.isArray(partsData)) setAvailableParts(partsData);
    } catch (err) {
      console.error("Failed to load work order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicketAndParts();
  }, [id]);

  const handleAddPartToLog = (partId: string) => {
    if (!partId) return;
    if (selectedParts.some((p) => p.partId === partId)) return;
    setSelectedParts([...selectedParts, { partId, quantity: 1 }]);
  };

  const handleUpdatePartQty = (partId: string, delta: number) => {
    setSelectedParts(
      selectedParts
        .map((p) => (p.partId === partId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(selectedParts.filter((p) => p.partId !== partId));
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTicketAndParts();
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const handleSubmitWorkLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    setSubmittingLog(true);

    const partsUsedPayload = selectedParts.map((sp) => {
      const partObj = availableParts.find((p) => p.id === sp.partId);
      return {
        partId: sp.partId,
        name: partObj?.name || "Spare Part",
        quantity: sp.quantity,
        unitCost: partObj?.unitCost || 0,
      };
    });

    try {
      const res = await fetch(`/api/tickets/${ticket.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicianId: currentUser.id,
          actionTaken,
          laborMinutes,
          notes,
          partsUsed: partsUsedPayload,
          markCompleted,
        }),
      });

      if (res.ok) {
        setActionTaken("");
        setNotes("");
        setSelectedParts([]);
        setMarkCompleted(false);
        fetchTicketAndParts();
      }
    } catch (err) {
      console.error("Error submitting work log:", err);
    } finally {
      setSubmittingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-emerald-400">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
        <Wrench className="h-12 w-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Work Order Not Found</h2>
        <Link
          href="/work-orders"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </Link>
      </div>
    );
  }

  const priorityBadge = getPriorityBadgeInfo(ticket.priority);
  const statusBadge = getTicketStatusBadgeInfo(ticket.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </button>

        <Link
          href={`/equipment/${ticket.equipmentId}`}
          className="text-xs font-semibold text-emerald-400 hover:underline"
        >
          View Equipment Passport →
        </Link>
      </div>

      {/* Main Ticket Summary Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-black text-emerald-400">
                {ticket.ticketNumber}
              </span>
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-black uppercase ${priorityBadge.color}`}>
                {priorityBadge.label}
              </span>
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-black text-white">{ticket.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Category: <strong className="text-slate-300">{ticket.faultCategory}</strong> • Reported {formatTimeAgo(ticket.createdAt)}
            </p>
          </div>

          {/* Status Switcher Selector */}
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Update Ticket Phase:
            </span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none shadow-md"
            >
              <option value="REPORTED">1. Reported / Triage</option>
              <option value="ASSIGNED">2. Assigned</option>
              <option value="IN_PROGRESS">3. In Progress</option>
              <option value="PENDING_PARTS">4. Pending Spare Parts</option>
              <option value="COMPLETED">5. Completed</option>
              <option value="VERIFIED">6. Verified & Closed</option>
            </select>
          </div>
        </div>

        {/* Machine & SLA Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-slate-500 uppercase font-bold text-[10px]">Equipment</p>
            <p className="font-bold text-white text-sm truncate">{ticket.equipment?.name}</p>
            <p className="text-slate-400 text-[11px]">
              {ticket.equipment?.qrCodeId} • Zone: {ticket.equipment?.zone}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-slate-500 uppercase font-bold text-[10px]">Assigned Technician</p>
            <p className="font-bold text-white text-sm">
              {ticket.technician?.name || "Unassigned"}
            </p>
            <p className="text-slate-400 text-[11px]">
              {ticket.technician?.phone || "No phone listed"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-slate-500 uppercase font-bold text-[10px]">SLA Target Due Date</p>
            <p className="font-bold text-emerald-400 text-sm">{formatDate(ticket.slaDueDate, "MMM d, h:mm a")}</p>
            <p className="text-slate-400 text-[11px]">
              {ticket.resolvedAt ? `Resolved on ${formatDate(ticket.resolvedAt)}` : "Open ticket"}
            </p>
          </div>
        </div>

        {/* Problem Description */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <p className="text-[10px] uppercase font-bold text-slate-400">Detailed Issue Report:</p>
          <p className="text-xs text-slate-300 leading-relaxed">{ticket.description}</p>
          <p className="text-[11px] text-slate-500 pt-1">
            Reported by: <strong className="text-slate-400">{ticket.reportedBy?.name || ticket.reporterName || "Gym Staff"}</strong>
          </p>
        </div>
      </div>

      {/* Two Column Layout: Technician Work Logger & Historical Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Log Technician Labor & Parts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wrench className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Technician Work Action Logger</h3>
          </div>

          <form onSubmit={handleSubmitWorkLog} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Action Taken / Diagnosis *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Replaced worn drive belt, calibrated motor speed sensor, lubricated deck."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Labor Time (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={laborMinutes}
                  onChange={(e) => setLaborMinutes(parseInt(e.target.value || "0", 10))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Technician Active
                </label>
                <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-emerald-400 font-semibold">
                  {currentUser.name}
                </div>
              </div>
            </div>

            {/* Spare Parts Replacement Picker */}
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <label className="block text-slate-300 font-semibold">
                Spare Parts Replaced / Deducted
              </label>

              <div className="flex gap-2">
                <select
                  id="part-select"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select a part from inventory...</option>
                  {availableParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity}, {formatCurrency(p.unitCost)})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById("part-select") as HTMLSelectElement;
                    if (sel && sel.value) handleAddPartToLog(sel.value);
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-2 font-bold text-emerald-400 hover:bg-slate-700 border border-slate-700 transition"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>

              {/* Selected Parts List */}
              {selectedParts.length > 0 && (
                <div className="space-y-2 mt-2">
                  {selectedParts.map((sp) => {
                    const partObj = availableParts.find((p) => p.id === sp.partId);
                    return (
                      <div
                        key={sp.partId}
                        className="flex items-center justify-between rounded-lg bg-slate-950/80 p-2.5 border border-slate-800"
                      >
                        <div>
                          <p className="font-semibold text-white">{partObj?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatCurrency(partObj?.unitCost)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdatePartQty(sp.partId, -1)}
                            className="h-6 w-6 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                          >
                            -
                          </button>
                          <span className="font-bold text-white px-1">{sp.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdatePartQty(sp.partId, 1)}
                            className="h-6 w-6 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePart(sp.partId)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Post-Repair Notes & Testing Findings
              </label>
              <input
                type="text"
                placeholder="e.g. Belt tracking adjusted. Tested up to 10mph for 5 minutes."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Mark Completed Checkbox */}
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 border border-emerald-500/30">
              <input
                type="checkbox"
                id="mark-done"
                checked={markCompleted}
                onChange={(e) => setMarkCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="mark-done" className="font-bold text-emerald-300 cursor-pointer">
                Mark work order as COMPLETED and return machine to service
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingLog || !actionTaken.trim()}
              className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {submittingLog ? "Submitting Log..." : "Submit Maintenance Log"}
            </button>
          </form>
        </div>

        {/* Column 2: Historical Work Order Logs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">Resolution Timeline & Labor Logs</h3>
          </div>

          {!ticket.logs || ticket.logs.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-8 text-center text-xs text-slate-500">
              No technician logs submitted yet for this ticket.
            </div>
          ) : (
            <div className="space-y-3">
              {ticket.logs.map((log) => {
                let parts: any[] = [];
                try {
                  if (log.partsUsed) parts = JSON.parse(log.partsUsed);
                } catch {}

                return (
                  <div
                    key={log.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-400">
                        {log.technician?.name || "Technician"}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        {formatDate(log.loggedAt, "MMM d, h:mm a")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">{log.actionTaken}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>Labor: <strong>{log.laborMinutes} minutes</strong></span>
                      {log.totalPartCost > 0 && (
                        <span>Parts Cost: <strong>{formatCurrency(log.totalPartCost)}</strong></span>
                      )}
                    </div>

                    {parts.length > 0 && (
                      <div className="rounded bg-slate-900 p-2 text-[10px] text-slate-300 space-y-1">
                        <p className="font-bold text-slate-400 uppercase">Parts Installed:</p>
                        {parts.map((p, i) => (
                          <p key={i}>
                            • {p.name} (x{p.quantity}) - {formatCurrency(p.unitCost * p.quantity)}
                          </p>
                        ))}
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
