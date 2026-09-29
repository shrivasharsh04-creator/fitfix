"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Equipment } from "@/types";
import { Printer, Download, Sparkles } from "lucide-react";

interface QRLabelGeneratorProps {
  equipmentList: Equipment[];
  facilityName?: string;
}

export function QRLabelGenerator({
  equipmentList,
  facilityName = "MetroFlex Flagship Club",
}: QRLabelGeneratorProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            Equipment QR Asset Labels
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Print high-contrast labels to affix directly on gym machines for staff & member scanning
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
        >
          <Printer className="h-4 w-4" />
          Print Label Sheet ({equipmentList.length} Labels)
        </button>
      </div>

      {/* Printable Sheet Grid */}
      <div id="printable-qr-sheet" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipmentList.map((item) => {
          const scanUrl = typeof window !== "undefined" 
            ? `${window.location.origin}/scan/${item.qrCodeId}`
            : `https://fitfix.metroflex.com/scan/${item.qrCodeId}`;

          return (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-xl border-2 border-slate-300 bg-white p-4 text-slate-900 shadow-md flex flex-col justify-between"
              style={{ minHeight: "260px", pageBreakInside: "avoid" }}
            >
              {/* Top Banner */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-5 w-5 rounded bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
                    F
                  </div>
                  <span className="font-black tracking-tight text-sm text-slate-900">
                    FITFIX ASSET
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  {facilityName}
                </span>
              </div>

              {/* Main Content: QR Code & Machine Details */}
              <div className="flex items-center gap-4 my-3">
                <div className="rounded-lg border-2 border-slate-900 p-2 bg-white flex-shrink-0">
                  <QRCodeSVG
                    value={scanUrl}
                    size={96}
                    level="H"
                    includeMargin={false}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="inline-block rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-black text-white">
                    {item.qrCodeId}
                  </span>
                  <h4 className="font-bold text-xs leading-snug line-clamp-2 text-slate-900">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    <span className="font-semibold">Brand:</span> {item.brand}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate">
                    <span className="font-semibold">S/N:</span> {item.serialNumber}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded inline-block">
                    Zone: {item.zone}
                  </p>
                </div>
              </div>

              {/* Footer Scan Callout */}
              <div className="rounded bg-slate-100 p-2 text-center border border-slate-300">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-800">
                  📱 SCAN WITH PHONE CAMERA
                </p>
                <p className="text-[9px] text-slate-600">
                  Instant machine specs, health status & out-of-order reporting
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
