"use client";

import React, { useState } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en" className="dark">
      <head>
        <title>FitFix | Gym Equipment Maintenance & Asset Management</title>
        <meta
          name="description"
          content="Commercial gym equipment maintenance, work order resolution, preventive maintenance scheduling, and QR asset tracking."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar
                mobileOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
              />
              <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
