# 🏢 UniNest Landlord Portal — Comprehensive Operational Guide

> **Target Audience:** Property Owners, PG Managers, Hostel Operators, and Real Estate Caretakers.  
> **Platform Version:** UniNest 2.0 (Post-Escrow & Two-Stage Handshake Architecture)

---

## 📌 Executive Overview: Why UniNest for Landlords?

Traditional student housing in Indian campus towns (like Ludhiana around PCTE and PAU) suffers from three major pain points for property owners:
1. **Uncertain Rent Collection & Ghosting:** Students leaving mid-semester without notice or delaying monthly dues.
2. **Sub-Meter Electricity Disputes:** Constant bickering over AC and geyser consumption among room occupants.
3. **Vacancy Losses & Middleman Brokerage:** Paying hefty broker fees or relying on informal WhatsApp groups with high cancellation rates.

**UniNest solves these challenges by providing an end-to-end digital property operating system:**
- Guaranteed security deposit custody via digital escrow.
- Automated bed-level inventory tracking and digital check-in/out.
- Sub-meter utility computation that divides power units accurately with photo evidence.
- Two-stage physical arrival verification preventing non-arrival claims.
- Integrated dispatch to QuickFix Services for plumbing, electrical, and AC maintenance.

---

## 🗺️ System Architecture & Workflow Diagrams

### 1. Landlord Property Lifecycle: From Listing to Live Student Marketplace

```mermaid
flowchart TD
    classDef startNode fill:#4F46E5,stroke:#3730A3,color:#ffffff,stroke-width:2px;
    classDef reviewNode fill:#F59E0B,stroke:#D97706,color:#ffffff,stroke-width:2px;
    classDef liveNode fill:#10B981,stroke:#059669,color:#ffffff,stroke-width:2px;
    classDef actionNode fill:#3B82F6,stroke:#2563EB,color:#ffffff,stroke-width:1px;
    classDef rejectedNode fill:#EF4444,stroke:#DC2626,color:#ffffff,stroke-width:2px;

    A["🏠 Landlord Lists Property<br/>(Name, Address, Rent, Rooms, Amenities)"]:::startNode --> B["⚙️ Room & Bed Inventory Setup<br/>(Sharing Ratio, Bed Labels A/B/C)"]:::actionNode
    B --> C["📋 Initial Status: UNDER_REVIEW<br/>(Mirrored to Prisma DB & PropertiesStore)"]:::reviewNode
    C --> D{"🛡️ UniNest Admin Safety Audit"}:::reviewNode
    
    D -- "Document / Safety Issues Flagged" --> E["❌ Status: REJECTED / SUSPENDED<br/>(Official Notice Sent to Landlord)"]:::rejectedNode
    E --> F["✏️ Landlord Edits Details / Re-submits Proof"]:::actionNode
    F --> C
    
    D -- "Approved by Admin" --> G["✅ Status: VERIFIED<br/>(Badge Awarded & Search Visibility Enabled)"]:::liveNode
    G --> H["🎓 Live on Student Marketplace<br/>(Discovered by College Students within Radius)"]:::liveNode
    H --> I["🔒 Student Pays ₹399 Bed Reservation<br/>(Bed Marked RESERVED, Contact Unlocked)"]:::actionNode
```

---

### 2. Two-Stage Move-In Security & Escrow Release Handshake

```mermaid
sequenceDiagram
    autonumber
    actor L as 👨‍💼 Landlord
    actor S as 🎓 Student Tenant
    participant APP as 📱 UniNest Engine
    participant ESC as 🏦 Escrow Vault

    Note over L,S: Stage 1: Physical Visit Proof (Pre-Move-In)
    S->>L: Arrives on property for physical inspection
    L->>APP: Generates 4-Digit Visit OTP (Valid for 72 hrs)
    L-->>S: Verbally shares Visit OTP during on-site visit
    S->>APP: Enters Visit OTP to confirm physical walk-through
    APP-->>L: Visit verified! Student unlocked for official booking

    Note over L,S: Stage 2: Genuine GPS Arrival & Move-In Handshake
    S->>APP: Moves in luggage & triggers On-Site Arrival
    APP->>APP: Validates Student GPS within 250m Geofence (Accuracy <150m)
    APP->>S: Requires Check-in Checklist (Key, Inventory, Cleanliness)
    S->>APP: Submits completed checklist
    APP->>S: Reveals Secret 6-Digit Move-In Handshake PIN
    S-->>L: Hands over 6-Digit Move-In PIN to Landlord
    L->>APP: Inputs 6-Digit Move-In PIN in Landlord Portal
    APP->>APP: Validates PIN match & executes atomic move-in transition
    APP->>ESC: Releases Security Deposit & Rent to Landlord Ledger
    APP-->>L: 🎉 Bed status updated to OCCUPIED! Tenancy active!
```

---

### 3. Sub-Meter Electricity Metering & Fair Split Computation

```mermaid
flowchart LR
    classDef inputNode fill:#6366F1,stroke:#4338CA,color:#ffffff,stroke-width:2px;
    classDef calcNode fill:#0EA5E9,stroke:#0284C7,color:#ffffff,stroke-width:2px;
    classDef outputNode fill:#10B981,stroke:#059669,color:#ffffff,stroke-width:2px;

    M["⚡ Landlord Enters Monthly Meter Reading<br/>(e.g., Previous: 1240 kWh | Current: 1540 kWh)"]:::inputNode --> U["🔢 Net Consumption: 300 Units<br/>@ ₹9.00 / kWh = ₹2,700 Total Bill"]:::calcNode
    U --> R["👥 Bed Occupancy in Room<br/>(e.g., 3 Occupants in Room 102)"]:::calcNode
    R --> S["💳 Per-Student Split: ₹900<br/>(Billed directly to Tenant Portal)"]:::outputNode
    S --> P["📱 Digital Payment Receipt Generated<br/>(Full Audit History & Meter Photo Proof)"]:::outputNode
```

---

## 🔍 Feature-by-Feature Deep Dive for Landlords

### 1. Property & Room Configurator (`/landlord/properties`)
- **Custom Localities & Landmarks:** Landlords can list in standard zones (BRS Nagar, Model Town) or specify custom landmarks like *"abra ka dabra"*, *"Kali Sadak"*, or specific campus gates.
- **Bed-Level Granularity:** Define rooms (e.g. 101, 102, 201), sharing capacity (Single, Double, Triple), and bed labels (`Bed A (Window View)`, `Bed B (Desk Side)`).
- **Amenities Checklist:** Tag Wi-Fi fiber speeds, 4-time meal plans, CCTV, air conditioning, and power backup.
- **Admin Audit Trail:** Edits to pricing or core safety parameters automatically transition to `UNDER_REVIEW` until certified by UniNest Compliance to prevent bait-and-switch listings.

### 2. Bed Inventory & Tenancy History Ledger (`/landlord/beds` & `/landlord/tenants`)
- **Real-Time Status Tracking:** Every bed in your property displays one of four distinct states:
  - 🟢 `AVAILABLE`: Ready for student booking.
  - 🟡 `RESERVED`: A student has locked the bed with ₹399 holding deposit.
  - 🔵 `OCCUPIED`: Checked-in tenant with active legal agreement.
  - 🟠 `MAINTENANCE`: Bed offline for painting, deep cleaning, or repair.
- **Permanent Tenancy Dossier:** Clicking a tenant's profile displays their complete historical record:
  - Dates of move-in and room assignments.
  - Historical rent payment records and timestamped transaction IDs.
  - Electricity bill split shares and payment clearances.
  - Logged maintenance tickets and resolution proofs.
  - Documented conduct notes and official checkout clearance.

### 3. Rent Collection & Digital Ledgers (`/landlord/rent`)
- **Automated Due Date Schedules:** Automatically logs monthly rent due on the 1st or 5th of each calendar month.
- **Digital Payment Receipts:** Instant generation of GST-compliant rental receipts for both landlord records and tenant income tax HRA submission.
- **Overdue Reminders:** One-click WhatsApp and in-app automated SMS reminders sent to students without awkward personal calls.

### 4. Sub-Meter Electricity Split (`/landlord/electricity`)
- **Eliminates Roommate Arguments:** Room-level sub-meter inputs ensure tenants only pay for their exact room's air conditioner, heater, and appliance usage.
- **Standardized Tariffs:** Calculates bills based on Punjab State Electricity Board (PSPCL) commercial/residential slabs (configurable, default ₹9.00/unit).
- **Audit Photo Evidence:** Landlords upload a photo of the sub-meter dial during billing, eliminating all billing mistrust.

### 5. Maintenance Dispatch & QuickFix Services (`/landlord/maintenance`)
- **Incoming Tenant Grievances:** Review tenant tickets with attached photos of leaks, electrical short-circuits, or broken furniture.
- **One-Click Dispatch to QuickFix:** Dispatch trusted, background-verified technicians directly from your portal without looking for local handymen.
- **Real-Time Job Tracking:** Track when the technician is en route, job completion photo proof, and landlord approval before invoice release.

---

## 💡 Strategic Advice & Best Practices for Landlords

> [!TIP]
> **Keep Property Coordinates Accurate:** When listing your property, ensure your street address and landmark are pin-pointed accurately. UniNest's genuine GPS geofence checks that students are within 250m before releasing the Move-In Handshake PIN.

> [!IMPORTANT]
> **Use the 4-Digit Visit OTP Correctly:** Never share the 4-digit Visit OTP over the phone or WhatsApp prior to the student arriving at your gate. The OTP is designed specifically to certify that a genuine physical walk-through occurred, preventing frivolous booking cancellations.

> [!NOTE]
> **Indoor Fallback Code:** If a student's smartphone has poor indoor GPS reception in basements or high-density concrete rooms, you can provide the **Landlord In-Person Fallback Verification Code** located in your physical arrival dashboard to validate check-in securely.

> [!TIP]
> **Log Sub-Meters on the 1st of Every Month:** Consistent billing cycles increase on-time student rent payment rates by **94%**. Always attach the meter dial photo in the portal.
