# UniNest — Complete Platform Documentation (`all.md`)

> **Student Housing, Without the Headache.**
> UniNest is an all-in-one student accommodation operating system connecting **Students, Landlords, Admin Command Center, Colleges/Universities, and Service Providers** into a unified, digital-first rental lifecycle platform.

---

## 📋 Table of Contents
1. [Executive Summary & Platform Vision](#1-executive-summary--platform-vision)
2. [Funder Readiness & Investment Upgrade Overview](#2-funder-readiness--investment-upgrade-overview)
3. [Technology Stack & System Architecture](#3-technology-stack--system-architecture)
4. [Database Schema & Entity Relationship](#4-database-schema--entity-relationship)
5. [System Resilience & The "Demo-Fluent" Fallback Architecture](#5-system-resilience--the-demo-fluent-fallback-architecture)
6. [Comprehensive Feature Matrix & Data Status (Working vs Empty)](#6-comprehensive-feature-matrix--data-status-working-vs-empty)
7. [Multi-Role Ecosystem Breakdown (5 Roles + Onboarding Suite)](#7-multi-role-ecosystem-breakdown-5-roles--onboarding-suite)
   - 7.1 [Student Operating System (21 Active Routes)](#71-student-operating-system-21-active-routes)
   - 7.2 [Landlord Operating System (14 Active Routes)](#72-landlord-operating-system-14-active-routes)
   - 7.3 [Admin Command Center (10 Active Routes)](#73-admin-command-center-10-active-routes)
   - 7.4 [College Welfare & Safety Portal (7 Active Routes)](#74-college-welfare--safety-portal-7-active-routes)
   - 7.5 [Service Provider Dispatch Hub (9 Active Routes)](#75-service-provider-dispatch-hub-9-active-routes)
   - 7.6 [Multi-Role Onboarding Suite (4 Active Routes)](#76-multi-role-onboarding-suite-4-active-routes)
8. [Investor Suite, Financial Model & Defense Manual](#8-investor-suite-financial-model--defense-manual)
9. [Geospatial Search Engine & Ludhiana Campus Dataset](#9-geospatial-search-engine--ludhiana-campus-dataset)
10. [Complete Page & Route Directory (71 Active Routes)](#10-complete-page--route-directory-71-active-routes)
11. [Authentication, Security & Moderated Chat Safety](#11-authentication-security--moderated-chat-safety)
12. [API Simulation Layer & Demo Control Panel](#12-api-simulation-layer--demo-control-panel)
13. [Quickstart, Local Setup & 5-Minute Presentation Script](#13-quickstart-local-setup--5-minute-presentation-script)
14. [Future Engineering Roadmap](#14-future-engineering-roadmap)

---

## 1. Executive Summary & Platform Vision

### 🎯 The Problem
Student housing in India and emerging markets is deeply fragmented, insecure, and manual:
- **For Students:** Unverified PG listings, hidden utility charges, lost security deposits, unsafe accommodations, lack of complaint resolution, and contact leakage.
- **For Landlords:** Rent collection delays, manual electricity sub-meter calculations, tenant verification headaches, high vacant bed rates, and maintenance overhead.
- **For Colleges:** Lack of oversight on off-campus student safety, hostel overflow challenges, and zero visibility into housing conditions.
- **For Service Providers:** Inconsistent job dispatch, delayed payouts, and lack of direct student/landlord reach.

### 🚀 The UniNest Solution
UniNest bridges these gaps by digitizing the entire rental lifecycle across **8 core stages**:
`Find → Verify → Book → Live → Pay → Manage → Earn → Repeat`

1. **Verified PG Listings:** On-ground & video verified properties with True Cost Calculators (`Base Rent + Food + Wi-Fi + Electricity estimates`).
2. **Digital 11-Month Lease Agreements & Bed-Level Booking:** Book specific beds with token payment (₹399).
3. **Automated Rent & Utility Metering:** Sub-meter electricity split, monthly automated rent invoices, and automated payment tracking.
4. **On-Demand Ancillary Services:** Integrated cleaning, plumbing, laundry, and food subscriptions with 3-way revenue split (85% Vendor, 10% UniNest, 5% Landlord).
5. **Multi-Role Safety & Welfare:** College oversight, tenant police verification tracking, emergency SOS, and formal dispute resolution.

---

## 2. Funder Readiness & Investment Upgrade Overview

UniNest is configured as a **High-Confidence Funder-Ready & Investor Demonstration Suite**. The platform addresses key investor metrics:

1. **Value Proposition (`/`):** Explains the full 8-stage rental lifecycle.
2. **Landlord Retention Thesis (`/landlord/earnings`):** Demonstrates why landlords stay on UniNest even after their PG is 100% full (UniNest acts as their daily operating layer for rent collection, sub-meters, maintenance, compliance, and service commissions).
3. **Competitive Positioning:** Direct matrix comparison against WhatsApp groups, NoBroker, and traditional PG listing portals.
4. **Interactive Unit Economics (`/investor`):** Live configurable financial calculator for booking fees, success fees, SaaS subscriptions, payment gateway margin, and vendor commissions.
5. **₹1 Lakh Pilot Funding Plan:** Granular breakdown of pre-seed allocation across PG onboarding, student acquisition, trust/safety verification, and operational buffer.
6. **17-Question Investor Q&A (`/investor/questions`):** Comprehensive defense covering off-platform leakage, seasonality, competition, deposit disputes, intentional damage, and unit economics.
7. **Demo Control Panel (`/admin/demo-control`):** Centralized simulation hub with 15 API triggers (Booking, KYC, AutoPay, Maintenance, Commission, Dispute, Deposit Refund, Re-seed).

---

## 3. Technology Stack & System Architecture

```
[ Frontend: Next.js 15 App Router + React 19 + Vanilla Tailwind CSS Tokens ]
                                │
[ Middleware: Next.js JWT Session Auth & Role-Based Access Guard (RBAC) ]
                                │
[ Backend: Server Components & Next.js API Routes (Node.js/TypeScript) ]
                                │
[ Fallback Architecture Layer: DB Query Guard + High-Fidelity Demo Personas ]
                                │
[ Simulation API Layer: /api/demo/* (Stateful Demo Action Triggers) ]
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
| **Language** | TypeScript | Full end-to-end type safety across DB schemas, API responses, and UI props (`npx tsc --noEmit` verified 0 errors). |
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
1. **Core Auth & User Directory:** `User`, `Student`, `Landlord`, `College`, `ServiceProvider`
2. **Property & Inventory:** `Property`, `Room`, `Bed`
3. **Bookings & Visit Scheduling:** `Booking`, `VisitAppointment`, `Message`, `Tenancy`, `RentRecord`
4. **Roommate Matching Engine:** `RoommateRequest`, `RoommateMatch`, `RoommateInterest`, `RoommateMessage`, `RoommateReport`
5. **Metering & Utilities:** `MeterReading`, `UtilityBill`
6. **Services & Maintenance:** `MaintenanceTicket`, `ServiceCatalog`, `ServiceOrder`
7. **Safety & Verification:** `KYCRecord`, `TenantVerification`, `Dispute`, `SavedProperty`, `AuditLog`

---

## 5. System Resilience & The "Demo-Fluent" Fallback Architecture

To ensure 100% continuous uptime during high-stakes presentations, UniNest implements a **Dual-Layer Data Resilience Architecture**:

```
[ Database Call (prisma.*) ]
        │
   ┌────┴────┐
   │ Success │ ───► Render Live Database Data
   └────┬────┘
        │ (DB Error / Unreachable / Offline)
   ┌────▼────┐
   │  Catch  │ ───► Inject High-Fidelity "Demo Persona" Dataset
   └─────────┘
```

1. **Guarded DB Execution:** Every server component and API route wraps `prisma.*` calls inside `try...catch` blocks.
2. **Graceful Fallback Execution:** If PostgreSQL is unreachable or a table is empty, the UI dynamically renders rich, fully populated **Demo Datasets** (e.g., *Rahul Sharma*, *PCTE Smart Student Residency*, *Passi Luxury PG*).
3. **Zero Crash Guarantee:** Prevents `PrismaClientInitializationError` crashes completely across all 71 active routes.

---

## 6. Comprehensive Feature Matrix & Data Status (Working vs Empty)

The following table explicitly documents the status of every feature in the application, indicating whether it is **Fully Working with Data**, **Stateful Simulated**, or **Intentionally Deferred**:

| Feature / Module | Functional Status | Data Source & State | Detailed Working Description |
|------------------|-------------------|---------------------|------------------------------|
| **Multi-Role Login & Switcher** | ✅ **Working Perfectly** | Live JWT Cookie + Demo Switcher | 1-click role login (`/login` & top banner) for Student, Landlord, Admin, College, Provider without entering passwords. |
| **Geospatial PG Search** | ✅ **Working Perfectly** | Live DB + Ludhiana Dataset | Filter by Location (Ludhiana/PCTE), Radius (0.5km–10km), Rent, Gender, Sharing, Verified Badge & True Cost. |
| **True Monthly Cost Calculator** | ✅ **Working Perfectly** | Dynamic Formula Engine | Auto-computes `Base Rent + Food + Wi-Fi + Maintenance + Sub-meter Electricity (₹400/mo)`. |
| **Interactive Map View** | ✅ **Working Perfectly** | Custom SVG Canvas | Renders property pins relative to PCTE campus coordinates with distance callouts. |
| **Bed Matrix & Booking** | ✅ **Working Perfectly** | Live DB + State API | Room-by-room bed selection (Bed 204-A, 204-B), status badge (`AVAILABLE`, `OCCUPIED`, `RESERVED`), ₹399 token payment. |
| **Gated Address & Visit Scheduler** | ✅ **Working Perfectly** | Stateful Component | Exact street address remains hidden until booking/visit appointment is scheduled. Landlord counter-proposal approval included. |
| **Roommate Matching Engine** | ✅ **Working Perfectly** | 9-Factor Algorithm | Evaluates Budget, Location, Sleep, Noise, Cleanliness, Study, Sharing, Smoking, Food. Shows 87% match scores and insights. |
| **Moderated In-App Safety Chat** | ✅ **Working Perfectly** | Regex Safety Guard (`chatSafety.ts`) | Real-time chat protection that automatically masks phone numbers, emails, and external payment links. |
| **Saved Properties Shortlist** | ✅ **Working Perfectly** | Live DB + State Sync | Heart toggle persistence on cards and detail pages with a dedicated `/student/saved` shortlist view. |
| **Accidental Micro-Damage Guarantee** | ✅ **Working Perfectly** | Interactive Component | ₹5,000 protection policy with 5 interactive test cases (Wall Paint, Fixtures, Lock, Window, Key Loss). |
| **"I Can't Pay Rent" Relief Modal** | ✅ **Working Perfectly** | Interactive Modal | 3 relief options: 7-Day Grace Period (0% fee), 2-Split Payment Plan (50%+50%), and Student Rent Credit Line. |
| **Landlord Occupancy Matrix** | ✅ **Working Perfectly** | Fallback Demo + DB | Real-time vacant vs occupied bed count across portfolio properties (*PCTE Residency*, *Passi Luxury PG*). |
| **Sub-meter Electricity Billing** | ✅ **Working Perfectly** | Calculation Engine | Log sub-meter kWh readings, calculate PSPCL unit rates (₹9.50/kWh), and auto-split utility bills per bed. |
| **Landlord Rent Collection Tracker** | ✅ **Working Perfectly** | Ledger State | Rent dues table, UPI transaction IDs, collection efficiency rate, and overdue payment reminder triggers. |
| **Landlord Passive Service Earnings** | ✅ **Working Perfectly** | Commission Engine | Displays 5% landlord share on student vendor orders (Wi-Fi, Tiffin, Laundry). |
| **Police Verification & Compliance** | ✅ **Working Perfectly** | Verified Table | Tracks student Aadhaar e-KYC submissions and police acknowledgement reference numbers (`POL-LDH-2026-8819`). |
| **Rental Document Vault** | ✅ **Working Perfectly** | Document Matrix | Digital 11-month lease deeds, security deposit receipts, and PDF download triggers. |
| **Landlord Portfolio Analytics** | ✅ **Working Perfectly** | Chart & Yield Matrix | Portfolio occupancy rate (82%), gross monthly revenue (₹1,68,000), and gross yield percentage (9.4%). |
| **Admin Listing Approval Queue** | ✅ **Working Perfectly** | Verification State | Admin review queue for landlord listings with 1-click **UniNest Verified** badge approval. |
| **Admin System Audit Log** | ✅ **Working Perfectly** | Audit Table | Immutable security log tracking user logins, property edits, and payment transactions. |
| **Demo Control Panel (15 Triggers)** | ✅ **Working Perfectly** | Next.js API Routes (`/api/demo/*`) | 15 simulation triggers (Booking, KYC, AutoPay, Maintenance, Dispute, Reset DB) for live presentations. |
| **College Off-Campus Oversight** | ✅ **Working Perfectly** | College Portal | Track off-campus student housing statistics, hostel overflow allocation, and safety alerts. |
| **Provider Work Order Dispatch** | ✅ **Working Perfectly** | Vendor Portal | Service job queue, technician availability, rate card pricing, customer reviews, and 85% vendor payout tracking. |
| **Multi-Role Onboarding Wizards** | ✅ **Working Perfectly** | 4 Onboarding Routes | 4-to-5 step onboarding forms for Student, Landlord, College, and Provider with completion progress meters. |
| **Investor Unit Economics Calculator** | ✅ **Working Perfectly** | Dynamic Slider Model | Configurable parameters for rent, booking fee, success fee, SaaS subscription, and scaling (1 to 100 PGs). |
| **Live WebSocket Push Notifications** | ⏳ *Simulated via Polling/API* | Mock State Triggers | Real-time push updates are simulated via stateful API calls rather than a persistent WebSocket server. |
| **Razorpay Production Webhook** | ⏳ *Simulated via Demo API* | Test Payment Mode | Payment transactions execute in high-fidelity sandbox mode without requiring live production bank keys. |
| **State Police API Live Sync** | ⏳ *Simulated via Document Filing* | Local Ref Filing | Municipal police verification is tracked via digital reference filing rather than direct government API. |

---

## 7. Multi-Role Ecosystem Breakdown (5 Roles + Onboarding Suite)

### 7.1 Student Operating System (21 Active Routes)
1. `/student/dashboard`: Active stay overview, rent countdown, sub-meter summary, quick action bar.
2. `/student/search`: PG search with budget sliders, distance radius filter, sharing type, gender preference, and True Cost breakdown.
3. `/student/search/[id]`: Property detail page with bed selection matrix (Bed 204-A, 204-B) and ₹399 token reservation button.
4. `/student/bookings`: Active & past bed booking history with status badges (`RESERVED`, `CONFIRMED`).
5. `/student/bookings/[bookingId]`: Interactive student workspace featuring 7-step progress timeline, unlocked street address, turn-by-turn navigation, landlord counter-proposal approval, and in-app chat.
6. `/student/saved`: Saved properties shortlist featuring heart toggle persistence and True Monthly Cost comparison.
7. `/student/stay`: Active stay hub displaying room details, bed assignment, **87% Roommate Compatibility Engine**, and **₹5,000 Micro-Damage Protection**.
8. `/student/payments`: Monthly rent ledger, payment receipts, UPI AutoPay mandate toggle, and **"I Can't Pay Rent"** relief modal.
9. `/student/electricity`: Sub-meter reading log and unit split breakdown.
10. `/student/maintenance`: Maintenance ticket creation form with photo attachment and vendor dispatch status.
11. `/student/services`: 20 on-demand ancillary services (Wi-Fi, Tiffin meals, Laundry, Cooler rental, Gym pass) with 3-way commission triggers.
12. `/student/documents`: Digital 11-month lease agreement viewer and Aadhaar KYC status.
13. `/student/disputes`: 11-category dispute resolution portal with evidence upload, case timeline, and tribunal verdicts.
14. `/student/emergency`: Official emergency helplines (112, 108, 100, 101, 1091) and instant landlord dispatch.
15. `/student/profile`: Editable student profile (Personal, College, Guardian, Emergency contacts).
16. `/student/roommates`: Roommate discovery portal ranking student profiles by compatibility score.
17. `/student/roommates/create`: 6-step roommate preference onboarding questionnaire.
18. `/student/roommates/[requestId]`: Roommate profile detail viewer with compatibility insights.
19. `/student/roommates/rooms`: Joint PG room finder for matched roommates with split rent calculations.
20. `/student/roommates/my-requests`: Roommate request management dashboard.
21. `/student/roommates/matches/[matchId]/chat`: In-app moderated safety chat with real-time phone/email masking.

### 7.2 Landlord Operating System (14 Active Routes)
1. `/landlord/dashboard`: Landlord command center showing occupancy %, gross rent, maintenance queue, and quick actions.
2. `/landlord/properties`: Property portfolio overview with property cards and room counts.
3. `/landlord/properties/[id]`: Property editor and room/bed configuration panel.
4. `/landlord/tenants`: Student tenant directory listing active occupants, rooms, KYC status, and contact actions.
5. `/landlord/rent`: Rent collection ledger displaying monthly payments, UPI transaction IDs, and overdue rent reminders.
6. `/landlord/electricity`: Sub-meter reading entry page with automated PSPCL bill split calculation per room.
7. `/landlord/maintenance`: Maintenance ticket dispatch queue with status toggles (`OPEN`, `ASSIGNED`, `RESOLVED`).
8. `/landlord/services`: Partner ancillary service dispatch and vendor schedule tracking.
9. `/landlord/earnings`: Earnings dashboard showing rent collected, sub-meter revenue, and passive 5% service commissions.
10. `/landlord/compliance`: Tenant verification portal for submitting police verification forms and tracking clearings.
11. `/landlord/documents`: Rental agreements and document vault for property licenses and deposit receipts.
12. `/landlord/beds`: Bed inventory matrix tracking occupied, reserved, and vacant beds.
13. `/landlord/analytics`: Portfolio analytics dashboard displaying occupancy rates, gross revenue, and annual yield.
14. `/landlord/profile`: Editable landlord account and bank payout profile.

### 7.3 Admin Command Center (10 Active Routes)
1. `/admin/dashboard`: System-wide command center displaying platform GMV, active listings, dispute tribunal, and server health.
2. `/admin/listings`: Property listing verification queue for inspecting and granting the **UniNest Verified** badge.
3. `/admin/users`: User account directory across all 5 platform roles with role modification options.
4. `/admin/kyc`: Student KYC audit log for reviewing Aadhaar and college ID uploads.
5. `/admin/tenant-verification`: Tenant police verification tracking matrix across all landlord properties.
6. `/admin/disputes`: Platform dispute resolution tribunal for arbitrating student-landlord grievances.
7. `/admin/services`: Service catalog manager for setting provider rates and platform commission splits.
8. `/admin/analytics`: Financial performance metrics, booking conversion rates, and revenue breakdown.
9. `/admin/audit-log`: Immutable system security log recording all logins, edits, and financial events.
10. `/admin/demo-control`: Centralized simulation hub with 15 API triggers and 1-click baseline database re-seed (`POST /api/demo/reset`).

### 7.4 College Welfare & Safety Portal (7 Active Routes)
1. `/college/dashboard`: Campus housing oversight dashboard showing off-campus student distribution and safety metrics.
2. `/college/students`: Off-campus student directory tracking verified living arrangements and emergency contacts.
3. `/college/housing`: Vicinity housing matrix displaying verified PGs within campus radius.
4. `/college/verified-pgs`: Verified PG partner directory with safety rating scores and lady warden indicators.
5. `/college/overflow`: Hostel overflow management tool for directing unhoused students to verified off-campus PGs.
6. `/college/issues`: Housing safety issue tracker for receiving student safety alerts.
7. `/college/analytics`: Student welfare and off-campus housing trend analytics.

### 7.5 Service Provider Dispatch Hub (9 Active Routes)
1. `/provider/dashboard`: Service provider operational dashboard showing active work orders and daily revenue.
2. `/provider/jobs`: Service job queue for accepting, updating, and completing maintenance and cleaning requests.
3. `/provider/customers`: Client directory listing student and landlord service customers.
4. `/provider/availability`: Technician scheduling matrix for setting working hours and service zones.
5. `/provider/services-list`: Provider service catalog for managing service offerings.
6. `/provider/pricing`: Service rate card manager for setting base pricing and extra material charges.
7. `/provider/earnings`: Payouts dashboard showing gross job earnings and 85% net vendor payouts.
8. `/provider/ratings`: Customer reviews and star ratings summary.
9. `/provider/profile`: Service business profile, trade license, and emergency service contact details.

### 7.6 Multi-Role Onboarding Suite (4 Active Routes)
1. `/onboarding/student`: 5-step student registration wizard capturing personal info, academic details, room sharing, budget range, and lifestyle preferences.
2. `/onboarding/landlord`: 5-step landlord onboarding wizard capturing property details, business registration, bank account, and utility rules.
3. `/onboarding/college`: 4-step college portal setup wizard capturing institution details, housing coordinator info, and overflow capacity.
4. `/onboarding/provider`: 4-step vendor registration wizard capturing service categories, coverage radius, and rate cards.

---

## 8. Investor Suite, Financial Model & Defense Manual

### 📈 Investor Pitch Dashboard (`/investor`)
- **Executive Summary:** Core thesis, market size, and pilot parameters (Ludhiana / PCTE Campus).
- **Interactive Unit Economics Calculator:** Configurable parameters for average rent (₹6,000), booking fee (₹399), landlord success fee (₹500), SaaS subscription (₹499/mo), and vendor commissions.
- **Scaling Scenarios:** Financial model progression from 1 PG (30 beds) up to 100 PGs (3,000 beds).
- **₹1 Lakh Pilot Funding Plan:** Visual breakdown of fund deployment across PG onboarding, student acquisition, trust/legal infra, and operational buffer.

### ⚖️ 17-Question Investor Q&A (`/investor/questions`)
Comprehensive defense responses covering:
- Off-platform contact leakage prevention.
- Differentiation from NoBroker and MagicBricks.
- Landlord retention post-100% occupancy.
- Handling non-payment of rent.
- Accidental micro-damage guarantee coverage.
- Pilot funding deployment and unit economics.

---

## 9. Geospatial Search Engine & Ludhiana Campus Dataset

UniNest features a production-grade demo dataset built for live investor demonstrations in **Ludhiana, Punjab, India** (Primary Campus: **PCTE Institute** — `30.8984° N, 75.8564° E`).

### 📍 10 Geolocated PGs in Ludhiana
1. **CampusNest Residency** (*Boys PG*, 0.8 km from PCTE) — ₹6,000/mo, 200 Mbps Fiber, 4-time meals.
2. **Green View Student Homes** (*Girls PG*, 1.2 km from PCTE) — ₹6,500/mo, lady warden, 3-tier security.
3. **Urban Scholars PG** (*Co-living PG*, 1.8 km from PCTE) — ₹5,800/mo, self-cooking kitchen.
4. **Model Town Student House** (*Boys PG*, 2.3 km from PCTE) — ₹5,500/mo, near Model Town market.
5. **PCTE Residency** (*Co-ed Hostel*, 0.5 km from PCTE) — ₹6,200/mo, Gate 2 proximity, gaming lounge.
6. **Student Square PG** (*Girls PG*, 1.5 km from PCTE) — ₹6,000/mo, Sarabha Nagar cafe area.
7. **Prime Campus Homes** (*Boys PG*, 3.1 km from PCTE) — ₹7,500/mo, private balcony rooms.
8. **Lake View Student PG** (*Girls PG*, 2.7 km from PCTE) — ₹5,800/mo, garden view, hot water geysers.
9. **Scholar's Haven Co-Living** (*Flat*, 4.2 km from PCTE) — ₹7,000/mo, 3BHK furnished student flat.
10. **City Edge Student Living** (*Boys PG*, 4.8 km from PCTE) — ₹4,200/mo, budget-friendly accommodation.

---

## 10. Complete Page & Route Directory (71 Active Routes)

### 🌐 Core Public & Investor Routes (6)
- `/` — Funder-First Landing Page
- `/login` — Multi-Role Demo Login Page
- `/register` — Account Registration
- `/demo` — Interactive Guided Demo Hub & Role Switcher
- `/investor` — Investor Deck & Financial Model
- `/investor/questions` — 17 Investor Q&A Defense Manual

### 🎓 Student Module (21)
- `/student/dashboard`
- `/student/search`
- `/student/search/[id]`
- `/student/bookings`
- `/student/bookings/[bookingId]`
- `/student/saved`
- `/student/stay`
- `/student/payments`
- `/student/electricity`
- `/student/maintenance`
- `/student/services`
- `/student/documents`
- `/student/disputes`
- `/student/emergency`
- `/student/profile`
- `/student/roommates`
- `/student/roommates/create`
- `/student/roommates/[requestId]`
- `/student/roommates/rooms`
- `/student/roommates/my-requests`
- `/student/roommates/matches/[matchId]/chat`

### 🏠 Landlord Module (14)
- `/landlord/dashboard`
- `/landlord/properties`
- `/landlord/properties/[id]`
- `/landlord/tenants`
- `/landlord/rent`
- `/landlord/electricity`
- `/landlord/maintenance`
- `/landlord/services`
- `/landlord/earnings`
- `/landlord/compliance`
- `/landlord/documents`
- `/landlord/beds`
- `/landlord/analytics`
- `/landlord/profile`

### 🛡️ Admin Module (10)
- `/admin/dashboard`
- `/admin/listings`
- `/admin/users`
- `/admin/kyc`
- `/admin/tenant-verification`
- `/admin/disputes`
- `/admin/services`
- `/admin/analytics`
- `/admin/audit-log`
- `/admin/demo-control`

### 🏛️ College Module (7)
- `/college/dashboard`
- `/college/students`
- `/college/housing`
- `/college/verified-pgs`
- `/college/overflow`
- `/college/issues`
- `/college/analytics`

### 🧰 Service Provider Module (9)
- `/provider/dashboard`
- `/provider/jobs`
- `/provider/customers`
- `/provider/availability`
- `/provider/services-list`
- `/provider/pricing`
- `/provider/earnings`
- `/provider/ratings`
- `/provider/profile`

### 📋 Multi-Role Onboarding Suite (4)
- `/onboarding/student`
- `/onboarding/landlord`
- `/onboarding/college`
- `/onboarding/provider`

---

## 11. Authentication, Security & Moderated Chat Safety

### JWT Token & Cookie Architecture
- Session authentication uses JSON Web Tokens (JWT) stored in `HTTP-Only`, `SameSite=Lax` cookies named `session`.
- Token payload contains `{ userId, email, name, role }`.

### Middleware Guard Logic (`src/middleware.ts`)
- Whitelists public routes: `/`, `/login`, `/register`, `/investor`, `/investor/questions`, `/demo`.
- Protects role paths: `/student/*`, `/landlord/*`, `/admin/*`, `/college/*`, `/provider/*`.
- Automatically redirects unauthenticated requests to `/login`.

### Moderated Chat Safety Engine (`src/lib/chatSafety.ts`)
- Protects in-app messaging between students and potential roommates.
- Regex inspects messages in real-time to mask phone numbers, email addresses, external links, and off-platform payment attempts to prevent contact leakage.

---

## 12. API Simulation Layer & Demo Control Panel

UniNest provides stateful API handlers (`src/app/api/demo/*`) for live demonstrations:

1. `POST /api/demo/booking`: Simulates bed reservation & updates status to `RESERVED`.
2. `POST /api/demo/kyc`: Simulates instant Aadhaar OCR document verification.
3. `POST /api/demo/payment`: Simulates rent payment success & generates e-receipt.
4. `POST /api/demo/service`: Simulates ancillary service ordering.
5. `POST /api/demo/commission`: Dispatches 3-way revenue split (85% Vendor, 10% UniNest, 5% Landlord).
6. `POST /api/demo/reset`: Baseline database re-seed in 1 second.

---

## 13. Quickstart, Local Setup & 5-Minute Presentation Script

### Prerequisites
- Node.js v18+ or v20+
- PostgreSQL 17 server running locally on port 5432

### 1. Database Initialization
```powershell
# Set database connection string in .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/uninest?schema=public"

# Run Prisma schema push & client generation
npm run db:push

# Populate database with demo seed data
npm run db:seed
```

### 2. Run Development Server (Port 3001)
```powershell
npm run dev
# Server runs on http://localhost:3001
```

### 🔑 Pre-Configured Demo Credentials (Password: `demo123`)

| Role | Name | Email | Primary Use Case |
|------|------|-------|------------------|
| **Student** | Rahul Sharma | `rahul@uninest.demo` | Search PG, view stay, check rent due, raise maintenance ticket. |
| **Landlord** | Vikram Singh | `landlord@uninest.demo` | Manage properties, track occupancy, log electricity, view earnings. |
| **Admin** | UniNest Admin | `admin@uninest.demo` | Monitor platform health, audit log, verify landlord listings. |
| **College** | PCTE Admin | `pcte@uninest.demo` | View off-campus student housing statistics and hostel overflow. |
| **Service Provider** | QuickFix Services | `provider@uninest.demo` | View plumbing/cleaning job orders and earnings. |

### 🎬 5-Minute Step-by-Step Presentation Script
1. **00:00 - 00:30 (Problem):** Open `http://localhost:3001/` — Explain $12B fragmented market & 8-step rental lifecycle.
2. **00:30 - 01:00 (Search & True Cost):** Open `/student/search` — Filter PGs near PCTE Campus & view True Cost Calculator.
3. **01:00 - 01:30 (Booking & Roommates):** Open `/student/search/prop-demo-01` — Pay ₹399 token & show 87% Roommate Compatibility on `/student/stay`.
4. **01:30 - 02:00 (Lease & Verification):** Open `/student/documents` — Show 11-month e-signed lease & police verification.
5. **02:00 - 02:30 (Rent & Relief):** Open `/student/payments` — Toggle UPI AutoPay & trigger "I Can't Pay Rent" relief options.
6. **02:30 - 03:00 (Sub-Meter & Maintenance):** Open `/student/electricity` & `/student/maintenance` — Show sub-meter unit split & photo ticket dispatch.
7. **03:00 - 03:30 (Ancillary Services):** Open `/student/services` — Order service & trigger 3-way commission split.
8. **03:30 - 04:00 (Landlord Retention):** Open `/landlord/earnings` — Show sub-meters & passive 5% service commissions.
9. **04:00 - 04:30 (Disputes & Micro-Damage):** Open `/student/stay` & `/student/disputes` — Show ₹5,000 damage protection & 11-category tribunal.
10. **04:30 - 05:00 (Funding Ask):** Open `/investor` — Present unit economics & ₹1 Lakh pilot allocation plan.

---

## 14. Future Engineering Roadmap

1. **Persistent WebSocket Server:** Replace client polling with Socket.io/Pusher for real-time notification push across all roles.
2. **Production Razorpay Webhook Integration:** Enable live bank Webhook events for production payment processing.
3. **Municipal Police API Integration:** Direct API integration with Punjab Police digital portal for automatic background clearance filing.
