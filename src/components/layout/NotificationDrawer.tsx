"use client";

import React, { useState } from "react";
import { Bell, X, AlertTriangle, AlertOctagon, CheckCircle2, Clock, Wrench } from "lucide-react";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: "critical_breakdown" | "low_stock" | "pm_overdue" | "ticket_assigned";
  title: string;
  message: string;
  time: string;
  href: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "critical_breakdown",
    title: "CRITICAL: Treadmill #2 Motor Breakdown",
    message: "Motor overheated at 8.5mph with error E-04. Immediate technician inspection required.",
    time: "12m ago",
    href: "/work-orders",
    unread: true,
  },
  {
    id: "n2",
    type: "low_stock",
    title: "Low Inventory: Aircraft Steel Cable 1/4\"",
    message: "Stock dropped to 1 unit (Minimum threshold: 3). Reorder needed.",
    time: "45m ago",
    href: "/inventory",
    unread: true,
  },
  {
    id: "n3",
    type: "pm_overdue",
    title: "PM Overdue: Dual Cable Crossover",
    message: "Bi-Weekly Cable & Weight Stack Safety Inspection is 2 days overdue.",
    time: "2h ago",
    href: "/preventive",
    unread: true,
  },
  {
    id: "n4",
    type: "ticket_assigned",
    title: "Work Order Assigned: Concept2 Rower",
    message: "Rower chain friction ticket assigned to Alex Rivera.",
    time: "5h ago",
    href: "/work-orders",
    unread: false,
  },
];

export function NotificationDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical_breakdown":
        return <AlertOctagon className="h-4 w-4 text-rose-400" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "pm_overdue":
        return <Clock className="h-4 w-4 text-orange-400" />;
      case "ticket_assigned":
        return <Wrench className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative rounded-lg border border-slate-700 bg-slate-800/80 p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm shadow-rose-600/50">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Bell className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Live Maintenance Alerts</h3>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    setNotifications(
                      notifications.map((n) =>
                        n.id === item.id ? { ...n, unread: false } : n
                      )
                    );
                    setIsOpen(false);
                  }}
                  className={`block rounded-xl border p-4 transition ${
                    item.unread
                      ? "border-slate-700 bg-slate-800/80 shadow-md"
                      : "border-slate-800/60 bg-slate-900/40 opacity-75 hover:opacity-100"
                  } hover:border-emerald-500/50`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-slate-800 p-2 border border-slate-700">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                        <span className="text-[10px] text-slate-500">{item.time}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 text-center">
              <p className="text-xs text-slate-500">
                Connected to MetroFlex IoT & Maintenance Dispatch
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
