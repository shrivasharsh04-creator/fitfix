"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  LayoutDashboard,
  Wrench,
  CalendarCheck,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { QRScannerModal } from "@/components/qr/QRScannerModal";

export default function HomePage() {
  const { currentUser, currentRole } = useAuth();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [stats, setStats] = useState({
    uptime: "94.8%",
    activeTickets: 3,
    criticalBreakdowns: 1,
    overduePMs: 1,
    totalAssets: 8,
  });

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setStats({
            uptime: `${data.uptimePercentage}%`,
            activeTickets: data.activeTickets,
            criticalBreakdowns: data.criticalTickets,
            overduePMs: data.overduePMSchedules,
            totalAssets: data.totalEquipment,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial Gym Asset & Maintenance Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Keep Your Gym Floor <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              100% Operational & Safe
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome back, <strong className="text-white">{currentUser.name}</strong> ({currentRole}). 
            Monitor machine health, resolve work orders in real time with mobile QR scanning, 
            and automate preventive maintenance cycles across your fitness facility.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition active:scale-95"
            >
              <QrCode className="h-4 w-4" />
              Scan Machine QR Code
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-200 shadow-md hover:bg-slate-700 hover:text-white transition"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              Executive Dashboard
            </Link>

            <Link
              href="/work-orders/new"
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/20 transition"
            >
              <AlertTriangle className="h-4 w-4" />
              Report Broken Machine
            </Link>
          </div>
        </div>
      </div>

      {/* Live Floor Status Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Fleet Uptime
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.uptime}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{stats.totalAssets} Total Gym Machines</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Tickets
          </p>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.activeTickets}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">In Progress or Assigned</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Critical Breakdowns
          </p>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.criticalBreakdowns}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Treadmill #2 (Motor E-04)</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overdue PMs
          </p>
          <p className="text-2xl font-black text-orange-400 mt-1">{stats.overduePMs}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cable Cross Inspection</p>
        </div>
      </div>

      {/* Feature Navigation Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Operations Hub</h2>
            <p className="text-xs text-slate-400">Access core management modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Equipment Directory */}
          <Link
            href="/equipment"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-emerald-400 transition">
              Equipment Directory & Passports
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Track serial numbers, warranties, user manuals, and digital service history for all gym assets.
            </p>
          </Link>

          {/* Card 2: Work Orders & Kanban */}
          <Link
            href="/work-orders"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition">
                <Wrench className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-amber-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-amber-400 transition">
              Work Order Ticketing
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Kanban dispatch lifecycle from Reported to Assigned, In Progress, Parts Needed, and Completed.
            </p>
          </Link>

          {/* Card 3: Preventive Maintenance */}
          <Link
            href="/preventive"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-blue-400 transition">
              Preventive Maintenance (PM)
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Automated recurring schedules, digital technician checklists, and compliance audit logs.
            </p>
          </Link>

          {/* Card 4: Spare Parts Inventory */}
          <Link
            href="/inventory"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-purple-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition">
                <Package className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-purple-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-purple-400 transition">
              Spare Parts Catalog
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Track belts, cables, pulleys, and lubricants with minimum threshold warnings and cost tracking.
            </p>
          </Link>

          {/* Card 5: QR Label Generator */}
          <Link
            href="/equipment/qr-labels"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400 border border-teal-500/20 group-hover:scale-110 transition">
                <QrCode className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-teal-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-teal-400 transition">
              Printable QR Code Labels
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Batch generate and print branded QR stickers for every machine on your gym floor.
            </p>
          </Link>

          {/* Card 6: Executive Analytics */}
          <Link
            href="/dashboard"
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition">
                <Activity className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white group-hover:text-emerald-400 transition">
              Analytics & MTTR Metrics
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              View equipment downtime trends, mean-time-to-repair, parts spend, and breakdown categories.
            </p>
          </Link>
        </div>
      </div>

      <QRScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
