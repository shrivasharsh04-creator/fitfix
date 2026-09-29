"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  Clock,
  DollarSign,
  TrendingUp,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Package,
  Dumbbell,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { HealthGauge } from "@/components/ui/HealthGauge";
import { formatCurrency, getPriorityBadgeInfo, getStatusBadgeInfo, getTicketStatusBadgeInfo } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ticketsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/tickets"),
      ]);

      const analyticsData = await analyticsRes.json();
      const ticketsData = await ticketsRes.json();

      setData(analyticsData);
      setRecentTickets(ticketsData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="font-semibold text-sm">Loading Live Gym Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Executive Maintenance Dashboard
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Live Fleet
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time equipment uptime, MTTR metrics, maintenance expenditure & dispatch queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Link
            href="/work-orders/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
          >
            <Wrench className="h-3.5 w-3.5" />
            Create Work Order
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Equipment Uptime Rate"
          value={`${data.uptimePercentage}%`}
          subtitle={`${data.operationalEquipment} of ${data.totalEquipment} machines online`}
          icon={Activity}
          colorScheme="emerald"
          trend={{ value: "+2.4% this month", isPositive: true }}
        />

        <StatCard
          title="Mean Time To Repair (MTTR)"
          value={`${data.mttrHours} hrs`}
          subtitle="Average ticket lifecycle"
          icon={Clock}
          colorScheme="blue"
          trend={{ value: "-45 min vs last quarter", isPositive: true }}
        />

        <StatCard
          title="Active Work Orders"
          value={data.activeTickets}
          subtitle={`${data.criticalTickets} critical priority breakdown`}
          icon={AlertOctagon}
          colorScheme={data.criticalTickets > 0 ? "rose" : "amber"}
          badge={data.criticalTickets > 0 ? "Action Required" : "Normal"}
        />

        <StatCard
          title="Total Maintenance Spend"
          value={formatCurrency(data.totalMaintenanceSpend)}
          subtitle="Parts & Labor (YTD)"
          icon={DollarSign}
          colorScheme="purple"
        />
      </div>

      {/* Second Row: Health Score & Overdue PM summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Fleet Health Meter */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Overall Fleet Health</h3>
              <span className="text-[11px] font-semibold text-slate-400">8 Monitored Units</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Aggregated across wear cycles, sensor data, and open work orders
            </p>
          </div>

          <div className="my-6 flex items-center justify-around">
            <HealthGauge score={data.avgHealthScore} size="lg" showLabel={true} />
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Operational: {data.operationalEquipment}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-300">Under Maint: {data.underMaintenanceEquipment}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">Out of Order: {data.outOfOrderEquipment}</span>
              </div>
            </div>
          </div>

          <Link
            href="/equipment"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            Inspect Machine Passports
            <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
          </Link>
        </div>

        {/* Preventive Maintenance & Parts Alert Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Preventive & Inventory Status</h3>
            <p className="text-xs text-slate-400 mt-1">Automated compliance tracking</p>
          </div>

          <div className="my-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <div>
                  <p className="text-xs font-bold text-white">Overdue PM Inspections</p>
                  <p className="text-[11px] text-amber-300/80">Dual Cable Cross 2 days overdue</p>
                </div>
              </div>
              <Link
                href="/preventive"
                className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
              >
                Run PM
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 p-3.5">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-xs font-bold text-white">Low Stock Spare Parts</p>
                  <p className="text-[11px] text-orange-300/80">
                    {data.lowStockCount} items below safety threshold
                  </p>
                </div>
              </div>
              <Link
                href="/inventory"
                className="rounded-lg bg-orange-500/20 px-2.5 py-1 text-xs font-bold text-orange-300 hover:bg-orange-500/30 transition"
              >
                Restock
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            Next scheduled inspection: Tomorrow 08:00 AM (Cardio Deck)
          </p>
        </div>

        {/* Machine Status Distribution Donut */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Status Distribution</h3>
            <p className="text-xs text-slate-400 mt-1">Real-time floor readiness</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            {data.statusDistribution.map((s: any) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Charts for Cost Trend & Breakdown categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spend Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Maintenance Spend Trend (₹)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Corrective Repairs vs Preventive PM</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400">Past 6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyCostTrend}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spend"
                  name="Corrective Repairs (₹)"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="preventive"
                  name="Preventive Maintenance (₹)"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#pmGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fault Category Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-sm">Failure Frequency by Category</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most common root causes</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Total Work Orders</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.failureBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Incidents" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Work Order Dispatch Queue */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">Active Maintenance Dispatch Queue</h3>
            <p className="text-xs text-slate-400">Live work order status and technician assignment</p>
          </div>
          <Link
            href="/work-orders"
            className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            View Kanban Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400">
              <tr>
                <th className="py-3 px-3">Ticket #</th>
                <th className="py-3 px-3">Equipment</th>
                <th className="py-3 px-3">Issue Title</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Tech</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentTickets.map((ticket) => {
                const priorityBadge = getPriorityBadgeInfo(ticket.priority);
                const statusBadge = getTicketStatusBadgeInfo(ticket.status);

                return (
                  <tr key={ticket.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white truncate max-w-[180px]">
                        {ticket.equipment?.name || "Equipment"}
                      </p>
                      <p className="text-[10px] text-slate-400">{ticket.equipment?.qrCodeId}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[200px]">
                      {ticket.title}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${priorityBadge.color}`}>
                        {priorityBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {ticket.technician ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center">
                            {ticket.technician.name.charAt(0)}
                          </div>
                          <span className="truncate max-w-[120px]">{ticket.technician.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/work-orders/${ticket.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-emerald-400 hover:bg-slate-700 transition"
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
    </div>
  );
}
