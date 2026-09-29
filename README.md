# FitFix - Gym Equipment Maintenance & Asset Management Platform 🏋️‍♂️🔧

FitFix is an equipment lifecycle, work order, and preventive maintenance management system designed for commercial gyms, fitness clubs, and multi-location franchises.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**:
   - **Gym Admin / Owner**: Manage inventory, facilities, vendor contracts, view executive uptime and MTTR analytics.
   - **Maintenance Technician**: Receive work orders, track labor minutes, pick replacement spare parts from inventory, submit resolution photos and notes.
   - **Floor Staff**: Log equipment issues with instant priority assignment.
   - **Gym Member**: Scan QR code to view live status or report out-of-order machines with zero login required.

2. **Digital Equipment Passports & QR Code System**:
   - Unique QR code tags for every machine (`FF-EQ-1001`, `FF-EQ-1002`, etc.).
   - Printable high-resolution QR label sheets with gym branding.
   - Live Camera QR Scanner built directly into the web interface.
   - Digital Passport tracking purchase costs, warranties, specs, and complete maintenance history.

3. **Work Order Lifecycle & Kanban Dispatch**:
   - Interactive Kanban board: `Reported` ➔ `Assigned` ➔ `In Progress` ➔ `Pending Parts` ➔ `Completed` ➔ `Verified & Closed`.
   - Priority and SLA tracking: Low (72h), Medium (48h), High (24h), Critical (12h).
   - Real-time technician labor logging and automatic spare parts inventory deduction.

4. **Preventive Maintenance (PM) & Digital Checklists**:
   - Automated recurring inspection schedules (Daily, Weekly, Monthly, Quarterly, Bi-Annual).
   - Digital step-by-step checklist runner for technicians with pass/fail verification.
   - Overdue inspection alerts and automated next-due-date progression.

5. **Spare Parts & Inventory Management**:
   - Replacement belts, cables, pulleys, pins, and lubricants tracking.
   - Automatic low-stock warnings when safety stock drops below minimum thresholds.
   - Total inventory valuation and usage cost tracking.

6. **Executive Dashboard & KPIs**:
   - Fleet Uptime percentage.
   - Mean Time to Repair (MTTR) in hours.
   - Maintenance spend trend (Corrective vs Preventive spend).
   - Failure frequency distribution by fault category.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
cd fitfix
npm install
```

### 3. Database Setup (Prisma & SQLite)
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router, React 19, TypeScript), Tailwind CSS, Lucide Icons
- **Database**: SQLite (via Prisma ORM, 100% compatible with PostgreSQL/Supabase)
- **Charts**: Recharts
- **QR Engine**: `qrcode.react` (SVG Generation) & HTML5 Camera Video Stream
