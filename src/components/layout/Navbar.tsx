"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QrCode, Search, Dumbbell, Menu, X, ShieldAlert, Sparkles } from "lucide-react";
import { RoleSwitcher } from "@/components/layout/RoleSwitcher";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { QRScannerModal } from "@/components/qr/QRScannerModal";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
                <Dumbbell className="h-5 w-5 font-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">FITFIX</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold uppercase text-emerald-400 border border-emerald-500/30">
                    Pro
                  </span>
                </div>
                <p className="hidden text-[10px] text-slate-400 sm:block">
                  Gym Asset & Work Order Ops
                </p>
              </div>
            </Link>
          </div>

          {/* Center / Action: Quick Scan Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
            >
              <QrCode className="h-4 w-4" />
              <span className="hidden sm:inline">Scan Equipment QR</span>
              <span className="sm:hidden">Scan</span>
            </button>
          </div>

          {/* Right: Notifications & Role Switcher */}
          <div className="flex items-center gap-3">
            <NotificationDrawer />
            <RoleSwitcher />
          </div>
        </div>
      </header>

      {/* Global QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
      />
    </>
  );
}
