"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Search,
  Filter,
  Plus,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { Equipment } from "@/types";
import { HealthGauge } from "@/components/ui/HealthGauge";
import { getStatusBadgeInfo, formatDate } from "@/lib/utils";

const CATEGORIES = ["ALL", "Cardio", "Strength", "Cables", "Free Weights"];
const STATUSES = ["ALL", "OPERATIONAL", "DEGRADED", "UNDER_MAINTENANCE", "OUT_OF_ORDER"];
const ZONES = ["ALL", "Cardio Deck North", "Cardio Deck South", "Functional Turf Area", "Heavy Free Weights Zone", "HIIT & Rowing Bay"];

export default function EquipmentDirectoryPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedZone, setSelectedZone] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Equipment Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Cardio",
    brand: "",
    model: "",
    serialNumber: "",
    zone: "Cardio Deck North",
    purchaseCost: "",
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "ALL") params.append("category", selectedCategory);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (selectedZone !== "ALL") params.append("zone", selectedZone);
      if (search) params.append("search", search);

      const res = await fetch(`/api/equipment?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEquipmentList(data);
      }
    } catch (err) {
      console.error("Failed to load equipment", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory, selectedStatus, selectedZone, search]);

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          category: "Cardio",
          brand: "",
          model: "",
          serialNumber: "",
          zone: "Cardio Deck North",
          purchaseCost: "",
        });
        fetchEquipment();
      }
    } catch (err) {
      console.error("Error creating equipment:", err);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Equipment Asset Directory
            </h1>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {equipmentList.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse machine health passports, warranty lifecycles, and QR code tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/equipment/qr-labels"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-400" />
            Print QR Labels
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Machine
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, model, serial #, or QR code (e.g. FF-EQ-1001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchEquipment}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
            <SlidersHorizontal className="h-3 w-3" /> Filters:
          </span>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Zone Dropdown */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                Zone: {z}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <Dumbbell className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Equipment Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipmentList.map((item) => {
            const statusBadge = getStatusBadgeInfo(item.status);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-emerald-500/50 hover:bg-slate-900/90 hover:shadow-xl"
              >
                <div>
                  {/* Top Row: QR Code Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                      {item.qrCodeId}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusBadge.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Machine Image & Info */}
                  <div className="mt-4 flex items-start gap-3.5">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-700 bg-slate-800 flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-500 flex-shrink-0">
                        <Dumbbell className="h-7 w-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {item.brand} • {item.category}
                      </p>
                      <h3 className="font-bold text-white text-sm leading-snug truncate mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        Zone: <span className="text-slate-300 font-medium">{item.zone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Specs & Health Gauge Row */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3">
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        Serial Number
                      </p>
                      <p className="font-mono text-slate-300 text-xs truncate">
                        {item.serialNumber}
                      </p>

                      <p className="text-[10px] text-slate-500 uppercase font-semibold mt-2">
                        Warranty Thru
                      </p>
                      <p className="text-slate-300 text-xs">
                        {formatDate(item.warrantyExpiry)}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center border-l border-slate-800 pl-2">
                      <HealthGauge score={item.healthScore} size="sm" showLabel={true} />
                    </div>
                  </div>
                </div>

                {/* Footer Action Link */}
                <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {item.tickets?.length || 0} Maintenance Logs
                  </span>
                  <Link
                    href={`/equipment/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    View Digital Passport
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Register New Gym Equipment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adds machine to inventory and assigns a unique QR tracking code
            </p>

            <form onSubmit={handleCreateEquipment} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LifeFitness Discover SE3 HD Treadmill #5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Cables">Cables</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Recovery">Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Manufacturer / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LifeFitness, Hammer Strength"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Integrity Platinum SE3"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LF-TM-2026-0099"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gym Floor Zone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cardio Deck North"
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
                >
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
