'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Scale,
  FileText,
  Lock,
  Building2,
  ArrowLeft,
  Printer,
  CheckCircle2,
  Gavel,
  BookOpen,
  FileCheck2,
} from 'lucide-react';

function LegalCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDoc = searchParams.get('doc') || 'escrow';
  const [activeTab, setActiveTab] = useState<'escrow' | 'lease' | 'privacy' | 'terms'>(
    (['escrow', 'lease', 'privacy', 'terms'].includes(initialDoc) ? initialDoc : 'escrow') as any
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-700 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                UniNest Legal & Statutory Compliance Center
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/50">
            <Gavel className="w-3.5 h-3.5" />
            Indian Contract Act, 1872 • IT Act, 2000 • DPDP Act, 2023 Compliant
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Master Legal Agreements & Escrow Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Binding legal framework governing all student bed reservations, two-stage OTP escrow handshakes,
            11-month tripartite leave & license agreements, and statutory KYC compliance across Punjab.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              id: 'escrow',
              label: '1. Escrow & Refund Policy',
              sub: 'Two-Stage OTP & Cancellation',
              icon: ShieldCheck,
            },
            {
              id: 'lease',
              label: '2. Tripartite 11-Month Lease',
              sub: 'Leave & License Master Deed',
              icon: FileCheck2,
            },
            {
              id: 'privacy',
              label: '3. Privacy & DPDP Act 2023',
              sub: 'Aadhaar KYC & Police Form-11',
              icon: Lock,
            },
            {
              id: 'terms',
              label: '4. Platform Terms of Use',
              sub: 'E-Commerce Rules & Grievance',
              icon: BookOpen,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-3 rounded-xl text-left transition-all flex items-start gap-2.5 ${
                  active
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-emerald-200' : 'text-emerald-700'}`} />
                <div>
                  <div className="text-xs font-extrabold leading-tight">{tab.label}</div>
                  <div className={`text-[10px] mt-0.5 ${active ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Document Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-slate-700">
          {/* ═══════════════════════════════════════════════════════════════════
              DOCUMENT 1: ALGORITHMIC ESCROW, REFUND & CANCELLATION POLICY
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'escrow' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Document Ref: UN-LGL-ESC-2026-V4
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    UniNest Algorithmic Escrow, Two-Stage OTP Handshake & Refund Policy
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Effective Date: September 1, 2026 • Governed by Sections 73 & 74 of the Indian Contract Act, 1872
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Legally Binding Schedule
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Clause 1: Appointment of UniNest Housing as Escrow Custodian
                </h3>
                <p>
                  By initiating a bed reservation or rent deposit on UniNest, both the Student (&ldquo;Licensee&rdquo;)
                  and the Property Owner (&ldquo;Licensor / Landlord&rdquo;) irrevocably appoint{' '}
                  <strong>UniNest Housing</strong> (Official UPI Escrow Account: <code>anupamrai172@oksbi</code>) as
                  the neutral escrow custodian. Funds deposited into the UniNest Escrow Vault are held in trust and
                  disbursed strictly upon cryptographic verification of the platform&apos;s Two-Stage OTP Handshakes.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Clause 2: Stage 1 — Immediate Visit Commitment Token (₹399) & 72-Hour Bed Lock
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                  <li>
                    <strong>72-Hour Exclusive Lock:</strong> Payment of the ₹399 Commitment Token places an immediate
                    72-hour exclusive hold (`RESERVED`) on the selected bed and unlocks exact property coordinates,
                    house number, and direct scheduling with the verified Landlord.
                  </li>
                  <li>
                    <strong>4-Digit Physical Visit OTP Handshake:</strong> Upon physically visiting the property within
                    72 hours, the Landlord is obligated to generate and provide a 4-digit Visit OTP from their Landlord
                    Portal. Entering this 4-digit OTP in the Student Portal constitutes conclusive legal proof of
                    physical attendance.
                  </li>
                  <li>
                    <strong>Post-Visit Option A (Room Accepted — 100% Rent Credit):</strong> If the Student accepts the
                    room after verifying the Visit OTP, 100% of the ₹399 token is credited towards the first
                    month&apos;s rent (e.g., for a ₹6,000/month room, the Student only deposits the remaining ₹5,601
                    into the Escrow Vault).
                  </li>
                  <li>
                    <strong>Post-Visit Option B (Room Rejected — 100% Instant Refund):</strong> If the Student visits
                    the property, verifies the 4-digit Visit OTP, and chooses not to proceed for any reason, UniNest
                    initiates a 100% refund of ₹399 to the Student&apos;s source UPI ID and immediately unlocks the bed
                    to `AVAILABLE`. To prevent inventory hoarding, each Student is entitled to up to{' '}
                    <strong>three (3) free rejected-visit refunds per academic semester</strong>.
                  </li>
                  <li>
                    <strong>Pre-Visit Emergency Waiver (Compassionate Refund):</strong> In the event of a genuine
                    medical emergency, hospitalization, family bereavement, or cancellation of college admission prior
                    to visiting, the Student may invoke a 1-Click Emergency Waiver (capped at{' '}
                    <strong>two (2) waivers per semester</strong>) for a 100% refund of ₹399 without requiring a
                    physical visit.
                  </li>
                  <li>
                    <strong>72-Hour Unexplained No-Show Forfeiture:</strong> If the Student fails to visit the property
                    or invoke an Emergency Waiver within 72 hours of reservation, the ₹399 token is forfeited as
                    liquidated damages under Section 74 of the Indian Contract Act, 1872, and split as follows:{' '}
                    <strong>₹200 credited to the Landlord&apos;s Vacancy Compensation Ledger</strong> and{' '}
                    <strong>₹199 retained by UniNest</strong> towards platform verification and operating overhead.
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Clause 3: Advance Semester Reservations (15–45 Days Ahead) & Tiered Cancellation
                </h3>
                <p>
                  Students reserving accommodation 15 to 45 days prior to their scheduled Move-In Date shall deposit a{' '}
                  <strong>15% Advance Holding Token</strong> (e.g., ₹900 on a ₹6,000 monthly rent) instead of locking
                  full rent upfront. The remaining 85% balance (e.g., ₹5,100) is payable into the UniNest Escrow Vault
                  48 hours prior to the scheduled Move-In Date. Cancellations of Advance Reservations are governed by
                  the following statutory tiered refund schedule:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="p-3 text-left">Cancellation Notice Window</th>
                        <th className="p-3 text-left">Student UPI Refund</th>
                        <th className="p-3 text-left">Landlord Vacancy Payout</th>
                        <th className="p-3 text-left">Platform Escrow Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-emerald-50/50">
                        <td className="p-3 font-bold text-slate-900">More than 30 Days before Move-In</td>
                        <td className="p-3 font-extrabold text-emerald-700">85% of Advance Token</td>
                        <td className="p-3">0% (Ample Relisting Window)</td>
                        <td className="p-3">15% Processing Buffer</td>
                      </tr>
                      <tr className="bg-amber-50/50">
                        <td className="p-3 font-bold text-slate-900">15 to 30 Days before Move-In</td>
                        <td className="p-3 font-extrabold text-amber-700">50% of Advance Token</td>
                        <td className="p-3 font-bold text-slate-900">50% of Advance Token</td>
                        <td className="p-3">0%</td>
                      </tr>
                      <tr className="bg-rose-50/50">
                        <td className="p-3 font-bold text-slate-900">Less than 7 Days before Move-In</td>
                        <td className="p-3 font-extrabold text-rose-700">0% Refund</td>
                        <td className="p-3 font-bold text-slate-900">100% of Advance Token</td>
                        <td className="p-3">0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Clause 4: Stage 2 — Full Rent Escrow Lock, 6-Digit Move-In Key & 7-Day Grace Window
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
                  <li>
                    <strong>6-Digit Move-In Key Release:</strong> First month&apos;s rent (e.g., ₹6,000) is held locked
                    in the UniNest Escrow Vault (`ESCROW_LOCKED`). On the scheduled Move-In Date, after inspecting the
                    room and receiving physical keys, the Student provides their 6-digit Move-In Key (`XXX-XXX`) to the
                    Landlord. Entry of this key into the Landlord Portal immediately releases 100% of the escrowed rent
                    to the Landlord&apos;s registered account and activates the 11-Month Tripartite Lease.
                  </li>
                  <li>
                    <strong>Declared Late Arrival (Zero Penalty):</strong> Because the first month&apos;s rent is
                    already funded in Escrow, a Student who declares a delayed arrival (1 to 7 days) via the
                    &ldquo;Arriving Late&rdquo; control incurs <strong>₹0 penalty</strong>. The room remains reserved
                    exclusively for the Student.
                  </li>
                  <li>
                    <strong>7-Day Automated Grace Protocol & 14-Day Pro-Rata Ghosting Settlement:</strong> If a Student
                    fails to check in on the scheduled Move-In Date and remains completely unreachable across Day 1
                    (Automated Notification), Day 3, Day 5 (Outbound Verification Calls), and Day 7, UniNest does{' '}
                    <strong>not</strong> forfeit the entire month&apos;s rent. Instead, on Day 7 at 11:59 PM, the
                    Escrow executes a fair pro-rata settlement under Section 73 of the Indian Contract Act, 1872:
                    <ul className="list-circle pl-5 mt-1 space-y-1">
                      <li>
                        <strong>Landlord Pro-Rata Vacancy Compensation:</strong> 14 Days of Rent (7 days held + 7 days
                        relisting buffer = <strong>₹2,800</strong> on a ₹6,000/month room).
                      </li>
                      <li>
                        <strong>Student Balance Refund:</strong> Remaining 16 Days of Rent (<strong>₹3,200</strong> on
                        a ₹6,000/month room) refunded automatically to the Student&apos;s UPI ID.
                      </li>
                      <li>
                        <strong>Inventory Release:</strong> The bed is immediately restored to `AVAILABLE`.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Property Misrepresentation / Discrepancy Freeze (100% Student Protection):</strong> If upon
                    arrival on Move-In Day the Student discovers a material discrepancy between the verified listing
                    and physical reality (including missing AC when listed as AC, uninhabitable hygiene, broken
                    washroom, or overcrowded sharing), the Student may file a <strong>Room Discrepancy Freeze</strong>{' '}
                    prior to sharing the Move-In Key. UniNest immediately freezes 100% of the Escrow (`DISPUTE_FROZEN`),
                    disburses <strong>₹0 to the Landlord</strong>, refunds <strong>100% of all monies paid</strong>{' '}
                    (₹6,000 including the ₹399 token) to the Student, and suspends the listing pending physical audit.
                  </li>
                </ul>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              DOCUMENT 2: 11-MONTH TRIPARTITE LEAVE & LICENSE AGREEMENT
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'lease' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Document Ref: UN-LGL-LLA-2026-STD
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">
                    Standard 11-Month Tripartite Leave & License Agreement
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Governed by Section 52 of the Indian Easements Act, 1882 & Section 10A of the Information
                    Technology Act, 2000
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  Digital E-Sign Ready
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="font-extrabold text-slate-900 uppercase tracking-wider">Parties to this Tripartite Deed:</div>
                <p>
                  <strong>1. Licensor (Landlord):</strong> The verified owner/operator of the residential PG/Hostel
                  premises listed on UniNest.
                </p>
                <p>
                  <strong>2. Licensee (Student Tenant):</strong> The KYC-verified student booking the designated Room
                  and Bed on UniNest.
                </p>
                <p>
                  <strong>3. Escrow & Digital Facilitator:</strong> UniNest Housing, Ludhiana, Punjab (UPI Escrow Vault:
                  <code> anupamrai172@oksbi</code>).
                </p>
              </div>

              <section className="space-y-3 text-xs sm:text-sm">
                <h3 className="text-base font-extrabold text-slate-900">1. Grant of Revocable License (11 Months)</h3>
                <p>
                  The Licensor hereby grants to the Licensee a non-exclusive, revocable license to occupy the assigned
                  Bed and shared common amenities for a term of <strong>eleven (11) months</strong> commencing from the
                  verified Stage 2 Move-In Handshake Date. This Agreement creates a permissive Leave & License under
                  Section 52 of the Indian Easements Act, 1882, and does not create any tenancy, sub-tenancy, or
                  transferable interest in immovable property.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  2. Monthly License Fee, Electricity Sub-Metering & Security Deposit
                </h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Monthly License Fee (Rent):</strong> Payable on or before the <strong>5th day</strong> of
                    each calendar month via UniNest UPI / AutoPay. No arbitrary mid-tenure rent escalation is permitted
                    during the 11-month lock-in period.
                  </li>
                  <li>
                    <strong>Transparent Electricity Billing:</strong> Electricity charges for AC/geyser usage shall be
                    billed strictly on actual sub-meter kWh consumption multiplied by the pre-disclosed per-unit tariff
                    (verified via photo meter readings uploaded on UniNest).
                  </li>
                  <li>
                    <strong>Refundable Security Deposit:</strong> Held against verifiable physical damages beyond fair
                    wear and tear, and refundable within 7 working days of Move-Out clearance.
                  </li>
                </ul>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  3. Notice Period & Lock-In Protections
                </h3>
                <p>
                  Either Party may terminate this License after the initial 1-month settlement period by serving a{' '}
                  <strong>thirty (30) days digital notice</strong> via the UniNest Stay Workspace. Landlords are
                  strictly prohibited from executing overnight evictions without due notice except in cases of proven
                  criminal misconduct or violation of statutory police directives.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  4. Punjab Police Form-11 C-Plan Verification & House Rules
                </h3>
                <p>
                  The Licensee consents to mandatory identity verification via Aadhaar KYC and College ID for the
                  generation of the statutory <strong>Punjab Police Form-11 Tenant Verification Certificate</strong>.
                  Possession of illegal substances, unauthorized overnight guests in gender-restricted blocks, or
                  tampering with fire/electrical safety equipment constitutes a material breach.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  5. Validity of Electronic Execution (Section 10A, IT Act 2000)
                </h3>
                <p>
                  Execution of this Agreement via the Student&apos;s Electronic Signature and Stage 2 6-Digit Move-In
                  OTP Handshake on UniNest carries full legal validity and enforceability under Section 10A of the
                  Information Technology Act, 2000.
                </p>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              DOCUMENT 3: PRIVACY POLICY & DPDP ACT 2023 COMPLIANCE
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Document Ref: UN-LGL-PRV-DPDP-2026
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Privacy Notice & Digital Personal Data Protection (DPDP) Act, 2023 Policy
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Compliant with the Digital Personal Data Protection Act, 2023 & UIDAI Data Minimization Guidelines
                </p>
              </div>

              <section className="space-y-3 text-xs sm:text-sm">
                <h3 className="text-base font-extrabold text-slate-900">1. Purpose-Limited Collection of Personal Data</h3>
                <p>
                  As a Data Fiduciary under the Digital Personal Data Protection Act, 2023, UniNest collects only the
                  minimum personal data necessary to execute student housing reservations, escrow settlements, and
                  statutory police compliance:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Identity & Academic Credentials:</strong> Full legal name, phone number, college enrollment
                    number, and emergency parent/guardian contact details.
                  </li>
                  <li>
                    <strong>Masked Aadhaar KYC:</strong> Aadhaar numbers are stored in masked format (`XXXX-XXXX-1234`)
                    solely for identity attestation and statutory local police tenant verification (Form-11).
                  </li>
                  <li>
                    <strong>Financial Transaction Metadata:</strong> 12-digit UPI UTR reference numbers and VPA handles
                    used exclusively for escrow reconciliation and refund processing.
                  </li>
                </ul>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  2. Anti-Spam Contact & Coordinate Masking
                </h3>
                <p>
                  Student phone numbers are never sold to third-party brokers or marketing agencies. Exact property
                  street addresses and landlord phone numbers remain masked behind our ₹399 Reservation Escrow wall to
                  protect residential security and female PG privacy.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  3. Data Principal Rights & Erasure
                </h3>
                <p>
                  Students and Landlords have the right to access, correct, download their complete document vault, or
                  request erasure of personal data following the conclusion of their tenancy and statutory audit
                  retention period (180 days post move-out).
                </p>
              </section>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              DOCUMENT 4: PLATFORM TERMS OF SERVICE & GRIEVANCE REDRESSAL
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Document Ref: UN-LGL-TOS-2026
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Platform Terms of Use & Consumer Grievance Redressal Mechanism
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Published pursuant to the Consumer Protection (E-Commerce) Rules, 2020 & IT Rules, 2021
                </p>
              </div>

              <section className="space-y-3 text-xs sm:text-sm">
                <h3 className="text-base font-extrabold text-slate-900">
                  1. Anti-Circumvention & Off-Platform Payment Prohibition
                </h3>
                <p>
                  To preserve escrow protection, neither Students nor Landlords may solicit or accept off-platform cash
                  or direct personal bank transfers prior to completing the Stage 2 Move-In OTP Handshake. Any payment
                  made outside the official UniNest Escrow Gateway waives the platform&apos;s 100% Refund Guarantee.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  2. Landlord Listing Accuracy Warranty
                </h3>
                <p>
                  Every Landlord listing a property on UniNest warrants that all uploaded room photographs, sharing
                  capacities, AC/amenity tags, and sub-meter electricity rates are accurate and truthful. Material
                  misrepresentation triggers an immediate Escrow Freeze (`DISPUTE_FROZEN`), 100% refund to the Student,
                  and suspension of the property&apos;s Verified Badge.
                </p>

                <h3 className="text-base font-extrabold text-slate-900 pt-2">
                  3. Exclusive Jurisdiction & Dispute Resolution
                </h3>
                <p>
                  All disputes arising out of reservations, escrow splits, or leave & license agreements shall first be
                  referred to the UniNest Algorithmic Dispute Desk (SLA: 24 Hours for Escrow Freezes, 48 Hours for
                  Deposit Audits), failing which the courts at <strong>Ludhiana, Punjab</strong> shall have exclusive
                  jurisdiction.
                </p>

                <div className="bg-slate-900 text-white rounded-2xl p-5 mt-4 space-y-1.5 text-xs">
                  <div className="font-extrabold text-emerald-400 uppercase tracking-wider">
                    Statutory Grievance Redressal Officer (Consumer Protection Rules, 2020)
                  </div>
                  <p>
                    <strong>Entity Name:</strong> UniNest Housing & Student Escrow Services
                  </p>
                  <p>
                    <strong>Operating Jurisdiction:</strong> Ferozepur Road / BRS Nagar, Ludhiana, Punjab – 141012
                  </p>
                  <p>
                    <strong>Official Escrow UPI Handle:</strong> <code>anupamrai172@oksbi</code> (UniNest Housing)
                  </p>
                  <p>
                    <strong>Resolution SLA:</strong> Acknowledgement within 24 hours; final disposal within 7 business
                    days.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LegalCenterPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-slate-500">Loading Legal Center...</div>}>
      <LegalCenterContent />
    </Suspense>
  );
}
