"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  ArrowUpRight,
  MapPin,
  Truck,
} from "lucide-react";
import { SparePart } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const PART_CATEGORIES = ["ALL", "Belts", "Cables", "Pulleys", "Pins", "Lubricants", "Upholstery", "Electronics"];

export default function InventoryPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Part Form
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Belts");
  const [quantity, setQuantity] = useState(5);
  const [minThreshold, setMinThreshold] = useState(2);
  const [unitCost, setUnitCost] = useState(45.0);
  const [supplier, setSupplier] = useState("");
  const [locationRack, setLocationRack] = useState("Shelf A-01");

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      if (Array.isArray(data)) setParts(data);
    } catch (err) {
      console.error("Failed to load parts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleAdjustStock = async (partId: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      // Optimistic update
      setParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, quantity: newQty } : p))
      );

      await fetch(`/api/inventory/${partId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      fetchParts();
    } catch (err) {
      console.error("Error adjusting stock:", err);
    }
  };

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku,
          category,
          quantity,
          minThreshold,
          unitCost,
          supplier,
          locationRack,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName("");
        setSku("");
        fetchParts();
      }
    } catch (err) {
      console.error("Error creating spare part:", err);
    }
  };

  const filteredParts = parts.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.supplier && p.supplier.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const lowStockParts = parts.filter((p) => p.quantity <= p.minThreshold);
  const totalInventoryValue = parts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Spare Parts & Inventory
            </h1>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {parts.length} Items Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage replacement cables, drive belts, pulleys, and lubricants with automated reorder thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Spare Part
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Inventory Valuation</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{formatCurrency(totalInventoryValue)}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Asset replacement reserves</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase">Stock Health</p>
          <p className="text-2xl font-black text-white mt-1">
            {parts.length - lowStockParts.length} / {parts.length} Optimal
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Above minimum safety threshold</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <p className="text-xs font-semibold text-slate-400 uppercase">Low Stock Alerts</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{lowStockParts.length} Items</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Requires vendor restock order</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search spare parts by name, SKU, category, or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {PART_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <button
            onClick={fetchParts}
            className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Parts Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-emerald-400">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Part Name & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Storage Location</th>
                  <th className="py-3.5 px-4">Unit Cost</th>
                  <th className="py-3.5 px-4">Current Stock</th>
                  <th className="py-3.5 px-4">Safety Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredParts.map((part) => {
                  const isOut = part.quantity === 0;
                  const isLow = part.quantity > 0 && part.quantity <= part.minThreshold;

                  return (
                    <tr key={part.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">{part.name}</p>
                        <p className="font-mono text-[11px] text-emerald-400">{part.sku}</p>
                        {part.supplier && (
                          <p className="text-[10px] text-slate-500">Supplier: {part.supplier}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {part.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {part.locationRack || "General Bin"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {formatCurrency(part.unitCost)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-black text-white">{part.quantity}</span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          (Min: {part.minThreshold})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="h-3 w-3" /> OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="h-3 w-3" /> LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAdjustStock(part.id, part.quantity, -1)}
                            disabled={part.quantity <= 0}
                            className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 disabled:opacity-30 border border-slate-700 transition"
                            title="Decrement 1 unit (used)"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleAdjustStock(part.id, part.quantity, 1)}
                            className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 border border-slate-700 transition"
                            title="Increment 1 unit (restock)"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleAdjustStock(part.id, part.quantity, 5)}
                            className="rounded-lg bg-emerald-600/20 px-2 py-1 text-[10px] font-bold text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 transition"
                            title="Add 5 units batch"
                          >
                            +5 Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Spare Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Add New Spare Part</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Register a new hardware component to inventory catalog
            </p>

            <form onSubmit={handleCreatePart} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Part Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Treadmill Motor Drive Belt 3-Ply"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    SKU / Part Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BELT-LF-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {PART_CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Qty *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value || "0", 10))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Min Threshold *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(parseInt(e.target.value || "2", 10))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Unit Cost (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value || "0"))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Supplier / OEM
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FitParts Direct OEM"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Storage Bin / Rack Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shelf A-02"
                    value={locationRack}
                    onChange={(e) => setLocationRack(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 shadow-md"
                >
                  Add Part to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
