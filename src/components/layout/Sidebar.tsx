"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  QrCode,
  Wrench,
  CalendarCheck,
  Package,
  ScanLine,
  MapPin,
  Flame,
  LifeBuoy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentRole } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "TECHNICIAN", "STAFF"],
    },
    {
      name: "Equipment Directory",
      href: "/equipment",
      icon: Dumbbell,
      roles: ["ADMIN", "TECHNICIAN", "STAFF", "MEMBER"],
    },
    {
      name: "Work Orders",
      href: "/work-orders",
      icon: Wrench,
      badge: "3 Active",
      badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
      roles: ["ADMIN", "TECHNICIAN", "STAFF"],
    },
    {
      name: "Preventive Maintenance",
      href: "/preventive",
      icon: CalendarCheck,
      badge: "1 Overdue",
      badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      roles: ["ADMIN", "TECHNICIAN", "STAFF"],
    },
    {
      name: "Spare Parts Catalog",
      href: "/inventory",
      icon: Package,
      roles: ["ADMIN", "TECHNICIAN"],
    },
    {
      name: "QR Label Printer",
      href: "/equipment/qr-labels",
      icon: QrCode,
      roles: ["ADMIN", "STAFF"],
    },
    {
      name: "Camera QR Scanner",
      href: "/scan",
      icon: ScanLine,
      roles: ["ADMIN", "TECHNICIAN", "STAFF", "MEMBER"],
    },
  ];

  const filteredNav = navigation.filter((item) => item.roles.includes(currentRole));

  const content = (
    <div className="flex h-full flex-col justify-between border-r border-slate-800 bg-slate-950 p-4">
      <div className="space-y-6">
        {/* Active Facility Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <MapPin className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-300">Active Facility</span>
          </div>
          <p className="mt-1 text-xs font-bold text-white truncate">
            MetroFlex Flagship Club
          </p>
          <p className="text-[10px] text-slate-400">Downtown District • 8 Active Assets</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Operations & Fleet
          </p>
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Support Card */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950/40 p-3 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">FitFix Dispatch</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Emergency technician hotline active 24/7.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>v1.0.0 Production</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Sync
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">{content}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-72 h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
          <div className="flex-1" onClick={onCloseMobile} />
        </div>
      )}
    </>
  );
}
