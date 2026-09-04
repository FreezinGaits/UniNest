# UniNest — Complete Platform Documentation (`all.md`)

> **Student Housing, Without the Headache.**
> UniNest is an all-in-one student accommodation operating system connecting **Students, Landlords, Admin Command Center, Colleges/Universities, and Service Providers** into a unified, digital-first rental lifecycle platform.

---

## 📋 Table of Contents
1. [Executive Summary & Platform Vision](#1-executive-summary--platform-vision)
2. [Technology Stack & System Architecture](#2-technology-stack--system-architecture)
3. [Database Schema & Entity Relationship](#3-database-schema--entity-relationship)
4. [Multi-Role Ecosystem Breakdown (5 Roles)](#4-multi-role-ecosystem-breakdown-5-roles)
5. [Feature Audit & Status Matrix (What's Working vs Simulated vs Pending)](#5-feature-audit--status-matrix)
6. [Complete Page & Route Directory (54+ Active Routes)](#6-complete-page--route-directory)
7. [Authentication, Security & RBAC Framework](#7-authentication-security--rbac-framework)
8. [Provider Integration Layer (Mocks & Drivers)](#8-provider-integration-layer)
9. [Quickstart & Local Environment Setup](#9-quickstart--local-environment-setup)
10. [Demo Accounts & Investor Presentation Script](#10-demo-accounts--investor-presentation-script)
11. [Future Engineering Roadmap](#11-future-engineering-roadmap)

---

## 1. Executive Summary & Platform Vision

### 🎯 The Problem
Student housing in India and emerging markets is deeply fragmented, insecure, and manual:
- **For Students:** Unverified PG listings, surprise utility charges, lost security deposits, unsafe accommodations, and lack of complaint resolution.
- **For Landlords:** Rent collection delays, manual electricity meter calculations, tenant verification headaches, high vacant bed rates, and maintenance overhead.
- **For Colleges:** Lack of oversight on off-campus student safety, hostel overflow challenges, and zero visibility into housing conditions.
- **For Service Providers:** Inconsistent job dispatch, delayed payouts, and lack of direct student/landlord reach.

### 🚀 The UniNest Solution
UniNest bridges these gaps by digitizing the entire rental lifecycle:
1. **Verified PG Listings:** On-ground & video verified properties with true cost calculators (Rent + Food + Wi-Fi + Electricity estimates).
2. **Digital 11-Month Lease Agreements & Bed-Level Booking:** Book specific beds with token payment (₹399).
3. **Automated Rent & Utility Metering:** Sub-meter electricity split, monthly automated rent invoices, and automated payment tracking.
4. **On-Demand Ancillary Services:** Integrated cleaning, plumbing, laundry, and food subscriptions.
5. **Multi-Role Safety & Welfare:** College oversight, tenant police verification tracking, emergency SOS, and formal dispute resolution.

---

## 2. Technology Stack & System Architecture

```
[ Frontend: Next.js 14 App Router + React 18 + Vanilla Tailwind Design Tokens ]
                                │
[ Middleware: Next.js JWT Session Auth & Role-Based Access Control Guard (RBAC) ]
                                │
[ Backend: Server Components & Next.js API Routes (Node.js/TypeScript) ]
                                │
[ Abstracted Provider Services (Payment, KYC, Police Verification, Maps, Dispatch) ]
                                │
[ ORM: Prisma ORM v6 with Client Generation ]
                                │
[ Database: PostgreSQL 17 (Custom Local Data Directory) ]
```

| Layer | Technology Used | Rationale |
|-------|-----------------|-----------|
| **Framework** | Next.js 15 (App Router, Server Components) | Fast SSR, built-in API routes, optimal SEO & dynamic client state. |
| **Language** | TypeScript | Full end-to-end type safety across DB schemas, API responses, and UI props. |
| **Database** | PostgreSQL 17 | Enterprise relational DB supporting transactions, foreign keys, and complex indexing. |
| **ORM** | Prisma ORM | Idempotent migrations, type-safe query builder, seed execution engine. |
| **Authentication** | Custom JWT + HTTP-Only Cookies | Stateless, lightweight session management with role claims. |
| **Styling & UI** | Vanilla CSS Tokens + Tailwind Utility | Modern glassmorphism design system with responsive layouts and dark/light accents. |
| **Icons & Visuals** | Lucide React | Clean, modern vector icons for unified UI aesthetics. |

---

## 3. Database Schema & Entity Relationship

The database schema (`prisma/schema.prisma`) comprises **40+ models** capturing every interaction in the rental ecosystem:

### Key Model Modules:
1. **Core Auth & User Directory:**
   - `User` (Role: `STUDENT`, `LANDLORD`, `ADMIN`, `COLLEGE`, `PROVIDER`)
   - `StudentProfile`, `LandlordProfile`, `CollegeProfile`, `ServiceProviderProfile`
2. **Property & Inventory:**
   - `Property` (Address, Amenities, Verification Status, True-Cost Rules)
   - `Room` (Sharing Type, AC/Cooler, Rent, Deposit, Attached Bath)
   - `Bed` (Bed Label, Status: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `NOTICE_PERIOD`, `MAINTENANCE_HOLD`)
3. **Bookings & Tenancies:**
   - `Booking` (Token Amount, Booking Status, Agreement Sign Date)
   - `Tenancy` (Start Date, End Date, Monthly Rent, Lock-in Period)
   - `RentRecord` (DueDate, AmountDue, AmountPaid, Status: `DUE`, `PAID`, `OVERDUE`)
4. **Metering & Utilities:**
   - `MeterReading` (Previous Reading, Current Reading, Units Consumed, Rate per Unit)
   - `UtilityBill` (Calculated Split per Bed)
5. **Services & Maintenance:**
   - `MaintenanceTicket` (Category, Priority, Photo Upload, Status: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`)
   - `ServiceCatalog`, `ServiceOrder` (Cleaning, Laundry, Meal Subscription)
6. **Safety & Verification:**
   - `KYCRecord` (Aadhaar, Student ID, College Verification)
   - `TenantVerification` (Police Verification Form, Status: `PENDING`, `SUBMITTED`, `VERIFIED`)
   - `Dispute` (Reason, Evidence Photos, Settlement Status)
   - `AuditLog` (Immutable Activity Trail for Security)

---

## 4. Multi-Role Ecosystem Breakdown (5 Roles)

### 👨‍🎓 1. Student Operating System (`/student/*`)
- **Dashboard:** Current stay summary, rent due countdown, active bookings, notifications.
- **Find PG Search:** Real-time search with price sliders, sharing filters, gender preferences, verified badge filter, and true monthly cost calculator.
- **PG Detail View:** Room matrix, bed availability labels, included amenities, house rules, student reviews, and instant ₹399 token reservation.
- **My Stay:** Bed assignment, roommate details, Wi-Fi passwords, landlord contacts.
- **Payments:** Instant UPI/Card payment simulation for monthly rent and deposit.
- **Electricity:** Sub-meter reading breakdown and split bill transparency.
- **Maintenance:** Submit tickets with issue categories and track resolution progress.
- **Services:** Book room cleaning, laundry, and daily meal plans.
- **Disputes & Emergency:** File formal complaints with evidence or click 1-Tap SOS helpline.

### 🏠 2. Landlord Operating System (`/landlord/*`)
- **Dashboard:** Portfolio occupancy rate (%), bed inventory status (Occupied vs Vacant vs Notice), collected rent vs expected rent, ancillary earnings.
- **Property Management:** List properties, add rooms, set bed prices, manage amenities.
- **Bed Inventory:** Room-by-room bed availability toggle (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE_HOLD`).
- **Rent Collection:** Real-time collection tracker, overdue rent reminders.
- **Electricity Metering:** Log monthly sub-meter readings and auto-calculate tenant bills.
- **Compliance & Police Verification:** Submit tenant forms for police clearance.
- **Maintenance Dispatch:** Review maintenance tickets and assign vendor workers.

### 🛡️ 3. Admin Command Center (`/admin/*`)
- **Overview:** Platform-wide metrics (Total Users, Properties, Occupancy Rate, Total Revenue, Active Bookings, Open Disputes).
- **User Directory:** View and manage all registered students, landlords, colleges, and vendors.
- **Property Verification Queue:** Review landlord submissions, verify physical/video proof, and grant the **UniNest Verified** badge.
- **Audit Log:** Immutable security log tracking all user actions, logins, property updates, and payment events.
- **Financial Records:** Revenue tracking, payment transaction logs, platform commission splits.

### 🎓 4. College Welfare & Safety Dashboard (`/college/*`)
- **Overview:** Off-campus student housing adoption rate, verified PG coverage around campus.
- **Student Roster:** List of enrolled students living in off-campus accommodations.
- **Hostel Overflow Management:** Direct unhoused or waitlisted hostel applicants to verified off-campus PGs.
- **Safety & Issues Oversight:** Track complaints or safety incidents reported near campus.

### 🧰 5. Service Provider Dispatch Hub (`/provider/*`)
- **Dashboard:** Job queue, completed tasks, weekly earnings, customer ratings.
- **Service Catalog & Pricing:** Set rate cards for plumbing, electrical, room deep cleaning, and laundry.
- **Availability:** Toggle operating schedule and dispatch availability.

---

## 5. Feature Audit & Status Matrix

| Module / Feature | Functional Status | Data Source | Notes / Integration Level |
|------------------|-------------------|-------------|---------------------------|
| **User Authentication** | ✅ **Working Perfectly** | Live DB + JWT | Multi-role JWT auth with HTTP-only cookies and instant demo login switcher. |
| **RBAC Middleware** | ✅ **Working Perfectly** | Next.js Middleware | Prevents unauthorized role access across all routes. |
| **Student PG Search** | ✅ **Working Perfectly** | Live DB Query | Full filter support (Rent, Gender, Sharing, Verified) + Sort + Layout toggle. |
| **Property Detail Page** | ✅ **Working Perfectly** | Live DB Query | Displays rooms, beds, true-cost calculations, rules, reviews, and landlord card. |
| **Bed Booking Flow** | ✅ **Working Perfectly** | Live DB + Demo API | Instant bed selection and token payment simulation. |
| **Student Dashboard** | ✅ **Working Perfectly** | Live DB Query | Live metrics, active stay summary, pending rent alert, notifications. |
| **Landlord Dashboard** | ✅ **Working Perfectly** | Live DB Query | Portfolio occupancy %, bed inventory breakdown, alerts, recent bookings. |
| **Admin Dashboard** | ✅ **Working Perfectly** | Live DB Query | Platform health stats, revenue summary, audit log feed. |
| **College Dashboard** | ✅ **Working Perfectly** | Live DB Query | Off-campus student housing statistics. |
| **Provider Dashboard** | ✅ **Working Perfectly** | Live DB Query | Job queue and earnings tracking. |
| **Subpage Directory (50+ Pages)** | ✅ **Working Perfectly** | Live DB Query | Rendered with styled data tables and active route navigation. |
| **Payment Gateway** | 🟡 **Simulated Demo** | Demo Provider Driver | Returns simulated success response with reference ID (`PAY_DEMO_...`). |
| **KYC / Aadhaar Verification** | 🟡 **Simulated Demo** | Demo Provider Driver | Simulates instant Aadhaar / Student ID OCR verification. |
| **Police Verification** | 🟡 **Simulated Demo** | Demo Provider Driver | Simulates submission to local police portal. |
| **Maps & Distance Calculation** | 🟡 **Simulated Demo** | Demo Provider Driver | Computes distance from college using coordinates. |
| **SMS / WhatsApp Alerts** | 🟡 **Simulated Demo** | Demo Provider Driver | Console logs dispatched notification alerts. |

---

## 6. Complete Page & Route Directory

The application features **54 active routes**, ensuring zero broken links or 404s:

### 🌐 Core Public Routes
- `/` — Homepage & Landing Page
- `/login` — Multi-Role Demo Login Page
- `/register` — Account Registration

### 👨‍🎓 Student Module (`/student/*`)
- `/student/dashboard` — Student Dashboard Overview
- `/student/search` — PG Search & Filter Engine
- `/student/search/[id]` — Detailed Property Page & Bed Booking
- `/student/saved` — Shortlisted PGs
- `/student/bookings` — Booking History & Reservations
- `/student/stay` — Current Stay & Roommate Details
- `/student/payments` — Rent Payments & Invoices
- `/student/electricity` — Utility Metering & Bills
- `/student/maintenance` — Raise & Track Maintenance Tickets
- `/student/services` — Order Cleaning, Laundry, Meals
- `/student/documents` — Lease Agreements & Receipts
- `/student/disputes` — Dispute Resolution Portal
- `/student/emergency` — SOS & Helpline Contacts
- `/student/profile` — Student Account Profile

### 🏠 Landlord Module (`/landlord/*`)
- `/landlord/dashboard` — Landlord Control Center
- `/landlord/properties` — Property List & Add Wizard
- `/landlord/properties/[id]` — Individual Property Room Management
- `/landlord/beds` — Bed Availability Inventory Matrix
- `/landlord/bookings` — Tenant Booking Approvals
- `/landlord/tenants` — Tenant Directory & Leases
- `/landlord/rent` — Rent Collection & Reminders
- `/landlord/electricity` — Sub-Meter Readings Log
- `/landlord/maintenance` — Tenant Maintenance Requests
- `/landlord/compliance` — Police Clearance Forms
- `/landlord/disputes` — Tenant Dispute Management
- `/landlord/services` — Property Service Dispatch
- `/landlord/earnings` — Financial Earnings & Payouts
- `/landlord/analytics` — Occupancy & Revenue Analytics
- `/landlord/documents` — Lease Agreements Archive
- `/landlord/profile` — Landlord Business Profile

### 🛡️ Admin Module (`/admin/*`)
- `/admin/dashboard` — Platform Overview & Health
- `/admin/users` — User Directory Management
- `/admin/properties` — Platform Property Listings
- `/admin/verification` — Landlord Verification Queue
- `/admin/bookings` — Global Bookings Audit
- `/admin/payments` — Global Financial Transactions
- `/admin/kyc` — Student Identity Verification Queue
- `/admin/tenant-verification` — Police Verification Tracking
- `/admin/maintenance` — Global Maintenance Operations
- `/admin/disputes` — Escalated Dispute Hearings
- `/admin/vendors` — Registered Service Vendor Roster
- `/admin/services` — Service Orders & Commission Logs
- `/admin/analytics` — Platform Business Intelligence
- `/admin/audit-log` — Immutable Audit Log Trail

### 🎓 College Module (`/college/*`)
- `/college/dashboard` — Student Housing Overview
- `/college/students` — Enrolled Off-Campus Student Roster
- `/college/housing` — Campus Vicinity Accommodations
- `/college/verified-pgs` — College-Approved Partner PGs
- `/college/overflow` — Hostel Overflow Allocation
- `/college/issues` — Student Safety & Housing Issues
- `/college/analytics` — Student Welfare Analytics

### 🧰 Provider Module (`/provider/*`)
- `/provider/dashboard` — Vendor Work Orders Overview
- `/provider/jobs` — Active Service Jobs
- `/provider/customers` — Client Directory
- `/provider/availability` — Technician Working Schedule
- `/provider/services-list` — Service Offerings Catalog
- `/provider/pricing` — Rate Cards & Pricing Rules
- `/provider/earnings` — Vendor Payouts & Commission
- `/provider/ratings` — Customer Reviews & Rating Summary
- `/provider/profile` — Service Company Profile

---

## 7. Authentication, Security & RBAC Framework

### Token & Session Strategy
- Authentication is handled via **JSON Web Tokens (JWT)** stored in `HTTP-Only`, `SameSite=Lax` cookies named `uninest_session`.
- Tokens contain payload data: `{ userId, email, name, role }`.

### Middleware Guard Logic (`src/middleware.ts`)
- Protects role paths: `/student/*`, `/landlord/*`, `/admin/*`, `/college/*`, `/provider/*`.
- Unauthenticated users attempting to access protected paths are immediately redirected to `/login?redirect=...`.
- If a user with role `STUDENT` attempts to navigate to `/admin/*`, the middleware blocks access and redirects them to their respective role dashboard.

### Demo Instant Switcher
- The UI includes a **"Switch Role"** component allowing judges/investors to toggle between all 5 roles instantly without manually re-typing credentials.

---

## 8. Provider Integration Layer

To ensure UniNest functions reliably in both demo environments and production deployments, all external services are abstracted behind provider interfaces (`src/lib/providers/`):

1. **Payment Provider (`PaymentProvider`):**
   - Implements payment creation, verification, and refund.
   - Standard Driver: `DemoPaymentProvider` (simulates UPI, Cards, NetBanking).
2. **KYC Provider (`KYCProvider`):**
   - Implements identity verification for Aadhaar / PAN / College ID.
   - Standard Driver: `DemoKYCProvider`.
3. **Tenant Verification Provider (`TenantVerificationProvider`):**
   - Handles police clearance form generation and tracking.
   - Standard Driver: `DemoTenantVerificationProvider`.
4. **Maps & Distance Provider (`MapsProvider`):**
   - Calculates distance to nearby universities and colleges.
   - Standard Driver: `DemoMapsProvider`.
5. **Service Dispatch Provider (`ServiceDispatchProvider`):**
   - Auto-assigns nearest verified vendor to maintenance tickets.

---

## 9. Quickstart & Local Environment Setup

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL 17 server running locally (or remote connection string)

### 1. Database Initialization
```powershell
# Set database connection string in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uninest?schema=public"

# Run Prisma schema push & client generation
npm run db:push

# Populate database with comprehensive demo seed data
npm run db:seed
```

### 2. Run Development Server
```powershell
npm run dev
# Server will launch at http://localhost:3000
```

---

## 10. Demo Accounts & Investor Presentation Script

### 🔑 Pre-Configured Demo Credentials (Password: `demo123`)

| Role | Name | Email | Primary Use Case |
|------|------|-------|------------------|
| **Student** | Rahul Sharma | `rahul@uninest.demo` | Search PG, view stay, check rent due, raise maintenance ticket. |
| **Landlord** | Vikram Singh | `landlord@uninest.demo` | Manage properties, track 58% occupancy, log electricity, view earnings. |
| **Admin** | UniNest Admin | `admin@uninest.demo` | Monitor platform health, audit log, verify landlord listings. |
| **College** | PCTE Admin | `pcte@uninest.demo` | View off-campus student housing statistics and hostel overflow. |
| **Service Provider** | QuickFix Services | `provider@uninest.demo` | View plumbing/cleaning job orders and earnings. |

### 🎬 Recommended Live Demo Sequence for Investors/Judges
1. **Step 1 — Login:** Navigate to `http://localhost:3000/login`. Point out the 5 pre-configured demo account tiles.
2. **Step 2 — Student Experience:** Click **Rahul Sharma (Student)**.
   - View the Student Dashboard showing active stay at *ABC Student Residence (Room 204, Bed A)* and ₹6,000 rent due.
   - Click **Find PG**. Show filters (Rent Range, Sharing, Gender, UniNest Verified badge).
   - Click any property card (e.g. *ABC Student Residence*) to open the **Property Detail Page**. Show room matrix, bed selection, true monthly cost breakdown, and the **Reserve Bed (₹399)** button.
3. **Step 3 — Landlord Experience:** Click **Switch Role** in the sidebar → select **Landlord**.
   - Show the Landlord Dashboard with **58% Occupancy**, Bed Inventory chart (18 Occupied, 12 Available), open maintenance alerts, and property list.
   - Click **Properties** or an individual property to inspect room and bed allocation.
4. **Step 4 — Admin Oversight:** Click **Switch Role** → select **Admin**.
   - View total revenue (₹12,399+), occupancy rates, platform health bars, and the real-time **Audit Log**.
5. **Step 5 — Subpage Auditing:** Click through sidebar items (**Bookings**, **Payments**, **KYC**, **Disputes**, **Services**) to demonstrate that every section resolves with live database tables.

---

## 11. Future Engineering Roadmap

1. **Production Payment Gateway Integration:**
   - Plug Razorpay / Cashfree SDKs into `src/lib/providers/razorpay.ts`.
2. **Real-time Chat & WebSockets:**
   - Integrate Socket.io or Supabase Realtime for instant messaging between Students and Landlords.
3. **IoT Smart Meter Integration:**
   - Connect smart electricity meters via MQTT APIs to auto-log sub-meter readings without manual landlord entry.
4. **Native Mobile App (React Native / Expo):**
   - Share TypeScript types and API routes with iOS/Android mobile clients.
