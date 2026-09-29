"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/types";
import { Shield, Wrench, UserCheck, Users, ChevronDown, Check } from "lucide-react";

export function RoleSwitcher() {
  const { currentUser, setCurrentUser, availableUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4 text-emerald-400" />;
      case "TECHNICIAN":
        return <Wrench className="h-4 w-4 text-amber-400" />;
      case "STAFF":
        return <UserCheck className="h-4 w-4 text-blue-400" />;
      case "MEMBER":
        return <Users className="h-4 w-4 text-purple-400" />;
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "TECHNICIAN":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "STAFF":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "MEMBER":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:border-slate-600 focus:outline-none"
      >
        <div className="flex items-center gap-1.5">
          {getRoleIcon(currentUser.role)}
          <span className="hidden sm:inline font-semibold">{currentUser.name}</span>
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider ${getRoleBadge(
              currentUser.role
            )}`}
          >
            {currentUser.role}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-2 border-b border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Switch User Persona / Role
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Test views & permissions as different staff members
            </p>
          </div>

          <div className="mt-1 space-y-1">
            {availableUsers.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-emerald-500/15 text-emerald-300 font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-md bg-slate-800 p-1.5 border border-slate-700">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400">{user.email}</p>
                    </div>
                  </div>

                  {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
