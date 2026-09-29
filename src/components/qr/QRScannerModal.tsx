"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Camera, X, ArrowRight, Zap, Search } from "lucide-react";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_QUICK_SCANS = [
  { id: "FF-EQ-1001", name: "LifeFitness Treadmill #1", zone: "Cardio Deck", status: "OPERATIONAL" },
  { id: "FF-EQ-1002", name: "LifeFitness Treadmill #2", zone: "Cardio Deck", status: "OUT_OF_ORDER" },
  { id: "FF-EQ-1003", name: "Hammer Strength Cable Cross", zone: "Functional Turf", status: "UNDER_MAINTENANCE" },
  { id: "FF-EQ-1006", name: "Concept2 RowErg Rower", zone: "HIIT Bay", status: "DEGRADED" },
];

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCameraActive(false);
      setCameraError(null);
      setManualCode("");
    }
  }, [isOpen]);

  const handleScanSuccess = (code: string) => {
    onClose();
    router.push(`/scan/${code.trim().toUpperCase()}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScanSuccess(manualCode.trim());
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      setCameraActive(true);
      // Simulate/request camera feed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      }
    } catch {
      setCameraError("Camera access unavailable or denied. Use manual code or quick test links.");
      setCameraActive(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100">Scan Machine QR Code</h3>
              <p className="text-xs text-slate-400">Point camera at the equipment QR sticker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scanner Viewport / Camera Simulator */}
        <div className="p-6">
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/80 p-8 min-h-[220px]">
            {/* Viewfinder brackets */}
            <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-emerald-500" />
            <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-emerald-500" />
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-emerald-500" />
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-emerald-500" />

            {/* Scan beam animation */}
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />

            <Camera className="h-10 w-10 text-emerald-400/80 mb-3 animate-bounce" />
            <p className="text-center text-sm font-medium text-slate-300">
              {cameraActive ? "Scanning for QR Code..." : "Ready to scan equipment badge"}
            </p>
            <p className="mt-1 text-center text-xs text-slate-500">
              Supports all standard FitFix machine QR codes
            </p>

            {!cameraActive && (
              <button
                onClick={startCamera}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
              >
                <Camera className="h-4 w-4" />
                Activate Camera
              </button>
            )}

            {cameraError && (
              <p className="mt-2 text-center text-xs text-amber-400">{cameraError}</p>
            )}
          </div>

          {/* Manual Code Input */}
          <form onSubmit={handleManualSubmit} className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Or Enter Machine Code / QR ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. FF-EQ-1001"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                disabled={!manualCode.trim()}
              >
                Lookup
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="mt-5 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" />
                Quick Test Machines
              </span>
              <span className="text-[10px] text-slate-500">Click to test instant scan</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_QUICK_SCANS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScanSuccess(item.id)}
                  className="flex flex-col items-start rounded-lg border border-slate-800 bg-slate-800/50 p-2.5 text-left text-xs transition hover:border-emerald-500/50 hover:bg-slate-800"
                >
                  <span className="font-mono font-bold text-emerald-400">{item.id}</span>
                  <span className="truncate text-slate-300 w-full mt-0.5">{item.name}</span>
                  <span className="text-[10px] text-slate-500">{item.zone}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
