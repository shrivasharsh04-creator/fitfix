"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wrench,
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LayoutGrid,
  List,
  AlertOctagon,
  User,
} from "lucide-react";
import { MaintenanceTicket, TicketStatus } from "@/types";
import { getPriorityBadgeInfo, getTicketStatusBadgeInfo, formatDate, formatTimeAgo, isOverdue } from "@/lib/utils";

const STATUS_COLUMNS: { id: TicketStatus; label: string; dot: string }[] = [
  { id: "REPORTED", label: "Reported / Triage", dot: "bg-purple-500" },
  { id: "ASSIGNED", label: "Assigned", dot: "bg-blue-500" },
  { id: "IN_PROGRESS", label: "In Progress", dot: "bg-amber-500" },
  { id: "PENDING_PARTS", label: "Pending Parts", dot: "bg-orange-500" },
  { id: "COMPLETED", label: "Completed", dot: "bg-teal-500" },
  { id: "VERIFIED", label: "Verified & Closed", dot: "bg-emerald-500" },
];

export default function WorkOrdersPage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);

      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [priorityFilter]);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      // Optimistic update
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );

      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTickets();
    } catch (err) {
      console.error("Error updating ticket status:", err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.ticketNumber.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.equipment?.name.toLowerCase().includes(q) ||
      t.equipment?.qrCodeId.toLowerCase().includes(q) ||
      t.faultCategory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Work Orders & Maintenance Dispatch
            </h1>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {tickets.length} Active Tickets
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track breakdowns, assign technicians, and log parts replacement lifecycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800 p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "kanban"
                  ? "bg-slate-700 text-emerald-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition ${
                viewMode === "list"
                  ? "bg-slate-700 text-emerald-400 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link
            href="/work-orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tickets by WO#, machine name, fault category, or QR ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={fetchTickets}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map((col) => {
            const colTickets = filteredTickets.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <h3 className="font-bold text-xs text-slate-200 truncate">{col.label}</h3>
                  </div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {colTickets.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 space-y-3">
                  {colTickets.length === 0 ? (
                    <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-slate-800/80 text-[11px] text-slate-600">
                      No tickets
                    </div>
                  ) : (
                    colTickets.map((ticket) => {
                      const priorityBadge = getPriorityBadgeInfo(ticket.priority);
                      const isCritical = ticket.priority === "CRITICAL";

                      return (
                        <div
                          key={ticket.id}
                          className={`group relative flex flex-col justify-between rounded-xl border p-3.5 shadow-md backdrop-blur-md transition-all hover:shadow-xl bg-slate-900/90 ${
                            isCritical
                              ? "border-rose-500/50 glow-critical"
                              : "border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="space-y-2">
                            {/* Card Header */}
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-emerald-400">
                                {ticket.ticketNumber}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${priorityBadge.color}`}
                              >
                                {priorityBadge.label}
                              </span>
                            </div>

                            {/* Equipment Name */}
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400">
                                {ticket.equipment?.qrCodeId}
                              </span>
                              <h4 className="font-bold text-xs text-white leading-tight line-clamp-2">
                                {ticket.title}
                              </h4>
                            </div>

                            {/* Fault Category */}
                            <span className="inline-block rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                              {ticket.faultCategory}
                            </span>
                          </div>

                          {/* Footer & Technician */}
                          <div className="mt-3 border-t border-slate-800/80 pt-2.5 space-y-2 text-[10px]">
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.technician?.name.split(" ")[0] || "Unassigned"}
                              </span>
                              <span>{formatTimeAgo(ticket.createdAt)}</span>
                            </div>

                            {/* Quick Status Shift Selector */}
                            <div className="flex items-center justify-between pt-1">
                              <select
                                value={ticket.status}
                                onChange={(e) =>
                                  handleStatusChange(ticket.id, e.target.value as TicketStatus)
                                }
                                className="w-full rounded bg-slate-800 px-1.5 py-1 text-[10px] font-semibold text-slate-300 border border-slate-700 focus:outline-none"
                              >
                                <option value="REPORTED">→ Reported</option>
                                <option value="ASSIGNED">→ Assigned</option>
                                <option value="IN_PROGRESS">→ In Progress</option>
                                <option value="PENDING_PARTS">→ Pending Parts</option>
                                <option value="COMPLETED">→ Completed</option>
                                <option value="VERIFIED">→ Verified</option>
                              </select>
                            </div>

                            <Link
                              href={`/work-orders/${ticket.id}`}
                              className="block text-center rounded bg-slate-800/60 py-1 text-[10px] font-bold text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition"
                            >
                              Open Work Order →
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-4">Ticket #</th>
                  <th className="py-3 px-4">Machine & Zone</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Fault Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickets.map((ticket) => {
                  const priorityBadge = getPriorityBadgeInfo(ticket.priority);
                  const statusBadge = getTicketStatusBadgeInfo(ticket.status);

                  return (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-white truncate max-w-[180px]">
                          {ticket.equipment?.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ticket.equipment?.qrCodeId} • {ticket.equipment?.zone}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-[220px] truncate">
                        {ticket.title}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{ticket.faultCategory}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {ticket.technician?.name || <span className="text-slate-500 italic">Unassigned</span>}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/work-orders/${ticket.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        >
                          Manage
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
