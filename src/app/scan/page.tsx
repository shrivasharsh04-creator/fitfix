"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Camera,
  Search,
  ArrowRight,
  Zap,
  Dumbbell,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const DEMO_MACHINES = [
  { id: "FF-EQ-1001", name: "LifeFitness Discover SE3 Treadmill #1", zone: "Cardio Deck North", status: "OPERATIONAL" },
  { id: "FF-EQ-1002", name: "LifeFitness Discover SE3 Treadmill #2", zone: "Cardio Deck North", status: "OUT_OF_ORDER" },
  { id: "FF-EQ-1003", name: "Hammer Strength Dual Cable Cross", zone: "Functional Turf Area", status: "UNDER_MAINTENANCE" },
  { id: "FF-EQ-1004", name: "Precor 885 Adaptive Motion Trainer", zone: "Cardio Deck South", status: "OPERATIONAL" },
  { id: "FF-EQ-1005", name: "Rogue Monster Olympic Power Rack", zone: "Heavy Free Weights", status: "OPERATIONAL" },
  { id: "FF-EQ-1006", name: "Concept2 RowErg Model D", zone: "HIIT & Rowing Bay", status: "DEGRADED" },
];

export default function ScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleLookup = (code: string) => {
    if (!code) return;
    router.push(`/scan/${code.trim().toUpperCase()}`);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      }
    } catch {
      setCameraError("Camera permission denied or camera unavailable in this environment.");
      setCameraActive(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hub
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Instant Equipment QR Scanner
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scan physical machine labels or enter equipment code to view live health status or report breakdowns
          </p>
        </div>

        {/* Camera Viewport */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/80 p-8 min-h-[260px]">
          {/* Viewfinder brackets */}
          <div className="absolute top-5 left-5 h-8 w-8 border-t-2 border-l-2 border-emerald-500" />
          <div className="absolute top-5 right-5 h-8 w-8 border-t-2 border-r-2 border-emerald-500" />
          <div className="absolute bottom-5 left-5 h-8 w-8 border-b-2 border-l-2 border-emerald-500" />
          <div className="absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2 border-emerald-500" />

          {/* Scan laser */}
          <div className="absolute inset-x-12 top-1/2 h-0.5 bg-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse" />

          <Camera className="h-12 w-12 text-emerald-400/80 mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-slate-200 text-center">
            {cameraActive ? "Scanning camera feed for QR Code..." : "Ready to scan equipment badge"}
          </p>
          <p className="text-xs text-slate-500 mt-1 text-center">
            Center the FitFix QR code sticker in your camera frame
          </p>

          {!cameraActive && (
            <button
              onClick={startCamera}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
            >
              <Camera className="h-4 w-4" />
              Activate Camera Feed
            </button>
          )}

          {cameraError && (
            <p className="mt-2 text-xs text-amber-400 text-center">{cameraError}</p>
          )}
        </div>

        {/* Manual Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookup(manualCode);
          }}
          className="space-y-2"
        >
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Manual Equipment Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. FF-EQ-1001"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
            >
              Inspect
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Quick Demo Simulator Buttons */}
        <div className="border-t border-slate-800 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Simulate Scan on Live Gym Machines
            </span>
            <span className="text-[10px] text-slate-500">1-click test</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_MACHINES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleLookup(m.id)}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left transition hover:border-emerald-500/50 hover:bg-slate-800/80"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{m.id}</span>
                  <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                    {m.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{m.zone}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
