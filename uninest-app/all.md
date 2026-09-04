# UniNest — Complete Platform Documentation (`all.md`)

> **Student Housing, Without the Headache.**
> UniNest is an all-in-one student accommodation operating system connecting **Students, Landlords, Admin Command Center, Colleges/Universities, and Service Providers** into a unified, digital-first rental lifecycle platform.

---

## 📋 Table of Contents
1. [Executive Summary & Platform Vision](#1-executive-summary--platform-vision)
2. [Funder Readiness & Investment Upgrade Overview](#2-funder-readiness--investment-upgrade-overview)
3. [Technology Stack & System Architecture](#3-technology-stack--system-architecture)
4. [Database Schema & Entity Relationship](#4-database-schema--entity-relationship)
5. [Multi-Role Ecosystem Breakdown (5 Roles)](#5-multi-role-ecosystem-breakdown-5-roles)
6. [Investor & Demo Suite (`/investor`, `/demo`, `/investor/questions`)](#6-investor--demo-suite)
7. [Feature Audit & Status Matrix](#7-feature-audit--status-matrix)
8. [Complete Page & Route Directory (57+ Active Routes)](#8-complete-page--route-directory)
9. [Authentication, Security & RBAC Framework](#9-authentication-security--rbac-framework)
10. [Provider Integration Layer (Mocks & Drivers)](#10-provider-integration-layer)
11. [Quickstart & Local Environment Setup (Port 3001)](#11-quickstart--local-environment-setup)
12. [Demo Accounts & Investor Presentation Script](#12-demo-accounts--investor-presentation-script)
13. [Future Engineering Roadmap](#13-future-engineering-roadmap)

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

## 2. Funder Readiness & Investment Upgrade Overview

UniNest has been upgraded from a functional prototype into a **High-Confidence Funder-Ready & Investor Demonstration Platform**. The platform addresses the core strategic questions potential funders ask:

1. **Value Proposition (`/`):** Explains the full 8-stage rental lifecycle (Find → Verify → Book → Live → Pay → Manage → Earn → Repeat).
2. **Landlord Retention Thesis:** Demonstrates why landlords stay on UniNest even after their PG is 100% full (UniNest acts as their daily operating layer for rent collection, sub-meters, maintenance, compliance, and service commissions).
3. **Competitive Positioning:** Direct matrix comparison against WhatsApp groups, NoBroker, and traditional PG listing portals.
4. **Interactive Unit Economics (`/investor`):** Live configurable financial calculator for booking fees, success fees, SaaS subscriptions, payment gateway margin, and vendor commissions.
5. **₹1 Lakh Pilot Funding Plan:** Granular breakdown of pre-seed allocation across PG onboarding, student acquisition, trust/safety verification, and operational buffer.
6. **15-Question Investor Q&A (`/investor/questions`):** Comprehensive defense covering off-platform leakage, seasonality, competition, deposit disputes, and unit economics.
7. **1-Click Demo Hub (`/demo`):** Instant role switcher allowing judges to jump directly into live Student, Landlord, Admin, College, or Provider dashboards.

---

## 3. Technology Stack & System Architecture

```
[ Frontend: Next.js 15 App Router + React 19 + Vanilla Tailwind CSS Tokens ]
                                │
[ Middleware: Next.js JWT Session Auth & Role-Based Access Guard (RBAC) ]
                                │
[ Backend: Server Components & Next.js API Routes (Node.js/TypeScript) ]
                                │
[ Abstracted Provider Services (Payment, KYC, Police Verification, Maps, Dispatch) ]
                                │
[ ORM: Prisma ORM v6 with Client Generation ]
                                │
[ Database: PostgreSQL 17 (Running locally on Port 5432) ]
```

| Layer | Technology Used | Rationale |
|-------|-----------------|-----------|
| **Framework** | Next.js 15 (App Router, Server Components) | Fast SSR, built-in API routes, optimal SEO & dynamic client state. |
| **Language** | TypeScript | Full end-to-end type safety across DB schemas, API responses, and UI props. |
| **Database** | PostgreSQL 17 | Enterprise relational DB supporting transactions, foreign keys, and complex indexing. |
| **ORM** | Prisma ORM v6 | Idempotent migrations, type-safe query builder, seed execution engine. |
| **Authentication** | Custom JWT + HTTP-Only Cookies | Stateless, lightweight session management with role claims. |
| **Port Config** | Localhost Port 3001 (`next dev -p 3001`) | Prevents port collisions with other local dev projects running on port 3000. |
| **Styling & UI** | Vanilla CSS Tokens + Tailwind | Modern glassmorphism design system with responsive layouts and dark/light accents. |
| **Icons & Visuals** | Lucide React | Clean, modern vector icons for unified UI aesthetics. |

---

## 4. Database Schema & Entity Relationship

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

## 5. Multi-Role Ecosystem Breakdown (5 Roles)

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
- **Ancillary Rewards:** Earn platform rewards and commissions on tenant service bookings.

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

## 6. Investor & Demo Suite (`/investor`, `/demo`, `/investor/questions`)

### 📈 Investor Pitch Dashboard (`/investor`)
- **Executive Summary:** Core thesis, market size, and pilot parameters (Ludhiana / PCTE Campus).
- **Interactive Unit Economics Calculator:** Real-time adjustment of average rent (₹6,000), booking fee (₹399), landlord success fee (₹500), SaaS subscription (₹499/mo), and vendor commissions.
- **Scaling Scenarios:** Financial model progression from 1 PG (30 beds) up to 100 PGs (3,000 beds).
- **₹1 Lakh Pilot Funding Plan:** Interactive visual breakdown of fund deployment:
  - Landlord Acquisition & Onboarding (40%)
  - Student Acquisition (30%)
  - Trust & Legal Infrastructure (15%)
  - Operational Reserve (15%)
- **Risk Audit & Mitigation Matrix:** Transparent evaluation of off-platform leakage, landlord churn, payment defaults, and regulatory risks.

### ❓ Investor Q&A Portal (`/investor/questions`)
- **15 Defensible Answers** addressing key judge questions:
  1. *How do you prevent students and landlords from bypassing UniNest after the first contact?*
  2. *Why will a landlord continue using UniNest after their PG is 100% full?*
  3. *How do you handle student housing seasonality (vacations vs. semester starts)?*
  4. *What prevents a major competitor like NoBroker or MagicBricks from copying this?*
  5. *What is your unit economics model per bed?*
  6. *How do you solve security deposit disputes at move-out?*
  7. *Why start in Ludhiana instead of Tier-1 hubs like Bengaluru or Kota?*
  8. *How does electricity metering work in independent PGs with single meters?*
  9. *What is the college's incentive to adopt UniNest?*
  10. *How do you ensure service providers (cleaners/electricians) show up on time?*
  11. *What happens if a student defaults on monthly rent?*
  12. *How is tenant police verification handled?*
  13. *What is the payback period on your ₹1 Lakh funding request?*
  14. *What are the key success metrics for the initial pilot?*
  15. *What is the long-term defensible moat of UniNest?*

### 🎮 Product Demo Hub (`/demo`)
- **1-Click Role Switcher Bar:** Instantly log in as Student, Landlord, Admin, College, or Provider with zero password entry.
- **Guided 5-Minute Walkthrough (10 Steps):** Direct launch buttons for:
  - Step 1: Student Finds PG (`/student/properties`)
  - Step 2: Student Books Bed (`/student/bookings`)
  - Step 3: KYC & Agreement (`/student/agreements`)
  - Step 4: Tenant Verification (`/landlord/verification`)
  - Step 5: Move-In Condition (`/student/move-in`)
  - Step 6: Rent & AutoPay (`/student/payments`)
  - Step 7: Electricity & Maintenance (`/student/maintenance`)
  - Step 8: Ancillary Service Purchase (`/student/services`)
  - Step 9: Landlord Rewards (`/landlord/rewards`)
  - Step 10: Admin Audit Trail (`/admin/audit`)

---

## 7. Feature Audit & Status Matrix

| Module / Feature | Functional Status | Data Source | Notes / Integration Level |
|------------------|-------------------|-------------|---------------------------|
| **User Authentication** | ✅ **Working Perfectly** | Live DB + JWT | Multi-role JWT auth with HTTP-only cookies and instant demo login switcher. |
| **RBAC Middleware** | ✅ **Working Perfectly** | Next.js Middleware | Prevents unauthorized role access across all routes; permits public access to `/investor` & `/demo`. |
| **1-Click Role Switcher** | ✅ **Working Perfectly** | Server Action | Instant token issue for Student, Landlord, Admin, College, and Provider. |
| **Student PG Search** | ✅ **Working Perfectly** | Live DB Query | Full filter support (Rent, Gender, Sharing, Verified) + Sort + Layout toggle. |
| **Property Detail Page** | ✅ **Working Perfectly** | Live DB Query | Displays rooms, beds, true-cost calculations, rules, reviews, and landlord card. |
| **Bed Booking Flow** | ✅ **Working Perfectly** | Live DB + Demo API | Instant bed selection and token payment simulation. |
| **Investor Deck & Calculator** | ✅ **Working Perfectly** | Interactive Client State | Configurable unit economics and funding plan visualizations. |
| **Investor Q&A Page** | ✅ **Working Perfectly** | Dynamic Search Filter | 15 detailed judge Q&As with category tagging. |
| **Student Dashboard** | ✅ **Working Perfectly** | Live DB Query | Live metrics, active stay summary, pending rent alert, notifications. |
| **Landlord Dashboard** | ✅ **Working Perfectly** | Live DB Query | Portfolio occupancy %, bed inventory breakdown, alerts, recent bookings. |
| **Admin Dashboard** | ✅ **Working Perfectly** | Live DB Query | Platform health stats, revenue summary, audit log feed. |
| **College Dashboard** | ✅ **Working Perfectly** | Live DB Query | Off-campus student housing statistics. |
| **Provider Dashboard** | ✅ **Working Perfectly** | Live DB Query | Job queue and earnings tracking. |
| **Subpage Directory (57+ Pages)** | ✅ **Working Perfectly** | Live DB Query | Rendered with styled data tables and active route navigation. |
| **Payment Gateway** | 🟡 **Simulated Demo** | Demo Provider Driver | Returns simulated success response with reference ID (`PAY_DEMO_...`). |
| **KYC / Aadhaar Verification** | 🟡 **Simulated Demo** | Demo Provider Driver | Simulates instant Aadhaar / Student ID OCR verification. |
| **Police Verification** | 🟡 **Simulated Demo** | Demo Provider Driver | Simulates submission to local police portal. |
| **Maps & Distance Calculation** | 🟡 **Simulated Demo** | Demo Provider Driver | Computes distance from college using coordinates. |
| **SMS / WhatsApp Alerts** | 🟡 **Simulated Demo** | Demo Provider Driver | Console logs dispatched notification alerts. |

---

## 8. Complete Page & Route Directory

The application features **57 active routes**, ensuring zero broken links or 404s:

### 🌐 Core Public Routes
- `/` — Funder-First Landing Page
- `/investor` — Investor Deck & Financial Operating Model
- `/investor/questions` — 15 Investor Q&As
- `/demo` — Interactive Guided Demo Hub & Role Switcher
- `/login` — Multi-Role Demo Login Page
- `/register` — Account Registration

### 🎓 Student Module (`/student/*`)
- `/student/dashboard` — Student Portal Overview & Quick Actions
- `/student/search` — PG Search & Filter (Location, Budget, Gender, Amenities)
- `/student/search/[id]` — Property Details, Room/Bed Matrix, True-Cost Breakdown
- `/student/bookings` — Active & Past Bed Bookings (₹399 Reservation Fee)
- `/student/documents` — KYC & Digital 11-Month Rental Agreements
- `/student/stay` — Current Stay Details, Bed Status & Roommate Info
- `/student/payments` — Rent Due, Payment History & UPI AutoPay Toggle
- `/student/electricity` — Sub-Meter Reading Log & Utility Split
- `/student/maintenance` — Maintenance Ticket Creation & Status Tracking
- `/student/services` — Ancillary Service Booking (Cleaning, Laundry, Food)
- `/student/disputes` — Dispute Filing & Evidence Upload
- `/student/emergency` — Official Emergency Helplines (112, 108, 100, 101, 1091) & Urgent Property Service Dispatch

### 🏠 Landlord Module (`/landlord/*`)
- `/landlord/dashboard` — Landlord Control Center (Occupancy %, Revenue, Actions)
- `/landlord/properties` — Property Portfolio Inventory
- `/landlord/properties/[id]` — Property Editor & Room/Bed Configuration
- `/landlord/occupancy` — Real-Time Bed Matrix & Availability Tracker
- `/landlord/rent` — Monthly Rent Collection Tracker & Overdue Invoices
- `/landlord/electricity` — Sub-Meter Reading Entry & Bill Calculator
- `/landlord/maintenance` — Maintenance Requests Queue & Service Dispatch
- `/landlord/services` — Ancillary Service Offerings Catalog
- `/landlord/earnings` — Earnings & Ancillary Service Rewards Breakdown (Wi-Fi, Food, Laundry, Gym)
- `/landlord/compliance` — Tenant Verification Workflow & Compliance Status

### 🛡️ Admin Module (`/admin/*`)
- `/admin/dashboard` — System-wide Command Center & Revenue Overview
- `/admin/listings` — Property Verification Queue & Approval Actions
- `/admin/users` — User Directory & Role Management
- `/admin/kyc` — Student KYC Audit & Document Verification
- `/admin/tenant-verification` — Tenant Verification Tracking
- `/admin/disputes` — Dispute Resolution Center & Evidence Viewer
- `/admin/services` — Service Provider Catalog & Commission Rates
- `/admin/analytics` — Platform Revenue & Operational Metrics
- `/admin/audit-log` — Immutable System Audit Log
- `/admin/demo-control` — Demo Control Panel (15 Live Simulation Buttons & Instant Re-seed)

### 🏛️ College Module (`/college/*`)
- `/college/dashboard` — College Housing Oversight Overview
- `/college/students` — Student Directory & Off-Campus Housing Status
- `/college/housing` — Campus Vicinity Off-Campus Housing Matrix
- `/college/verified-pgs` — Verified PGs Near Campus (UniNest Verified)
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

## 9. Authentication, Security & RBAC Framework

### Token & Session Strategy
- Authentication is handled via **JSON Web Tokens (JWT)** stored in `HTTP-Only`, `SameSite=Lax` cookies named `session`.
- Tokens contain payload data: `{ userId, email, name, role }`.

### Middleware Guard Logic (`src/middleware.ts`)
- Whitelists public routes: `/`, `/login`, `/register`, `/investor`, `/demo`.
- Protects role paths: `/student/*`, `/landlord/*`, `/admin/*`, `/college/*`, `/provider/*`.
- Unauthenticated users attempting to access protected paths are automatically redirected to `/login`.
- Hydration warnings from browser plugins are suppressed (`suppressHydrationWarning`), ensuring clean overlay-free execution.

---

## 10. Provider Integration Layer

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

## 11. Quickstart & Local Environment Setup

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL 17 server running locally on port 5432

### 1. Database Initialization
```powershell
# Set database connection string in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uninest?schema=public"

# Run Prisma schema push & client generation
npm run db:push

# Populate database with comprehensive demo seed data
npm run db:seed
```

### 2. Run Development Server (Configured for Port 3001)
```powershell
npm run dev
# Server automatically runs on http://localhost:3001
```

---

## 12. Demo Accounts & Investor Presentation Script

### 🔑 Pre-Configured Demo Credentials (Password: `demo123`)

| Role | Name | Email | Primary Use Case |
|------|------|-------|------------------|
| **Student** | Rahul Sharma | `rahul@uninest.demo` | Search PG, view stay, check rent due, raise maintenance ticket. |
| **Landlord** | Vikram Singh | `landlord@uninest.demo` | Manage properties, track occupancy, log electricity, view earnings & rewards. |
| **Admin** | UniNest Admin | `admin@uninest.demo` | Monitor platform health, audit log, verify landlord listings. |
| **College** | PCTE Admin | `pcte@uninest.demo` | View off-campus student housing statistics and hostel overflow. |
| **Service Provider** | QuickFix Services | `provider@uninest.demo` | View plumbing/cleaning job orders and earnings. |

### 🎬 Recommended 5-Minute Investor Walkthrough
1. **Step 1 — Platform Overview (`http://localhost:3001/`):** Point out the value proposition, 8-step lifecycle, and competitive matrix vs WhatsApp/NoBroker.
2. **Step 2 — Investor Deck (`http://localhost:3001/investor`):** Demo the interactive Unit Economics Calculator and ₹1 Lakh Funding Allocation plan.
3. **Step 3 — Investor Q&A (`http://localhost:3001/investor/questions`):** Highlight defensible answers regarding off-platform leakage and landlord retention.
4. **Step 4 — Product Demo Hub (`http://localhost:3001/demo`):** Click **Student (Rahul Sharma)** on the 1-Click Role Switcher to enter the live student experience.
5. **Step 5 — Student Journey:**
   - View Student Dashboard (Active stay at *ABC Student Residence*, ₹6,000 rent due).
   - Click **Find PG** to demonstrate verified filters and true monthly cost calculator.
   - Click property card to show bed matrix and instant ₹399 booking reservation.
6. **Step 6 — Landlord Operating Layer:** Click **Switch Role** → select **Landlord**.
   - Show portfolio occupancy (58%), room/bed inventory, sub-meter log, and ancillary service rewards.
7. **Step 7 — Admin Audit Trail:** Click **Switch Role** → select **Admin**.
   - Inspect total platform revenue, verification queue, and immutable audit logs.

---

## 13. Future Engineering Roadmap

1. **Production Payment Gateway Integration:**
   - Plug Razorpay / Cashfree SDKs into `src/lib/providers/razorpay.ts`.
2. **Real-time Chat & WebSockets:**
   - Integrate Socket.io or Supabase Realtime for instant messaging between Students and Landlords.
3. **IoT Smart Meter Integration:**
   - Connect smart electricity meters via MQTT APIs to auto-log sub-meter readings without manual landlord entry.
4. **Native Mobile App (React Native / Expo):**
   - Share TypeScript types and API routes with iOS/Android mobile clients.
