'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UserCheck,
  Phone,
  Mail,
  Calendar,
  Building2,
  Zap,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  FileText,
  Receipt,
  ExternalLink,
  LogOut,
  AlertTriangle,
  History,
  GraduationCap,
  Layers,
  ArrowRight,
  Shield,
  CreditCard,
  Hash,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';

export interface TenantDossierData {
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  college?: string;
  course?: string;
  rollId?: string;
  propertyName: string;
  roomNumber: string;
  bedLabel: string;
  floor?: number | string;
  sharingType?: string;
  rentRupees: number;
  depositRupees?: number;
  moveInDate?: string;
  leaseEndDate?: string;
  subMeterNo?: string;
}

interface TenantDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TenantDossierData | null;
  onInitiateCheckOut?: (tenantName: string, roomNumber: string, bedLabel: string) => void;
}

export function TenantDossierModal({
  isOpen,
  onClose,
  data,
  onInitiateCheckOut,
}: TenantDossierModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rent' | 'electricity' | 'maintenance' | 'timeline'>('overview');
  const [viewingReceiptDoc, setViewingReceiptDoc] = useState<DocumentPDFData | null>(null);

  if (!data) return null;

  const phone = data.tenantPhone || '+91 98765-43210';
  const email = data.tenantEmail || `${data.tenantName.toLowerCase().replace(/\s+/g, '.')}@uninest.in`;
  const college = data.college || 'PCTE Institute of Technology';
  const course = data.course || 'B.Tech CSE (2nd Year)';
  const rollId = data.rollId || 'STD-2026-992';
  const moveInDate = data.moveInDate || '15 Aug 2026';
  const leaseEndDate = data.leaseEndDate || '14 Jul 2027';
  const deposit = data.depositRupees || 12000;
  const subMeter = data.subMeterNo || `Sub-Meter #${data.roomNumber}`;

  // Sample Rent Records tailored to this tenant
  const rentRecords = [
    {
      id: 'rent-oct',
      month: 'October 2026',
      amount: data.rentRupees,
      dueDate: '05 Oct 2026',
      paidDate: '04 Oct 2026, 09:20 AM',
      method: 'Razorpay UPI (HDFC Bank AutoPay)',
      txnId: 'PAY_OCT_992182741',
      status: 'PAID ON-TIME',
      docRef: 'UNP-REC-2026-1044',
    },
    {
      id: 'rent-sep',
      month: 'September 2026',
      amount: data.rentRupees,
      dueDate: '05 Sep 2026',
      paidDate: '03 Sep 2026, 11:15 AM',
      method: 'Direct UPI (Google Pay)',
      txnId: 'PAY_SEP_440192837',
      status: 'PAID ON-TIME',
      docRef: 'UNP-REC-2026-0932',
    },
    {
      id: 'rent-aug',
      month: 'August 2026',
      amount: data.rentRupees,
      dueDate: '05 Aug 2026',
      paidDate: '05 Aug 2026, 06:45 PM',
      method: 'NPCI UPI AutoPay',
      txnId: 'PAY_AUG_119283746',
      status: 'PAID ON-TIME',
      docRef: 'UNP-REC-2026-0819',
    },
    {
      id: 'rent-token',
      month: 'Booking Commitment Token',
      amount: 2000,
      dueDate: '10 Aug 2026',
      paidDate: '10 Aug 2026, 06:12 PM',
      method: 'UniNest Escrow Vault',
      txnId: 'PAY_ESCROW_TKN_2026',
      status: 'ESCROW RELEASED ON ARRIVAL',
      docRef: 'UNP-TKN-2026-0042',
    },
  ];

  // Sample Electricity Split History
  const electricityRecords = [
    {
      month: 'September 2026',
      units: '190 kWh',
      readingSpan: '1,230 → 1,420 kWh',
      totalBill: 1330,
      studentShare: 665,
      splitRatio: '50% Split (Double Sharing)',
      status: 'SETTLED',
      utr: '426819203810',
      paidDate: '28 Sep 2026',
    },
    {
      month: 'August 2026',
      units: '210 kWh',
      readingSpan: '1,020 → 1,230 kWh',
      totalBill: 1470,
      studentShare: 735,
      splitRatio: '50% Split (Double Sharing)',
      status: 'SETTLED',
      utr: '426819203799',
      paidDate: '28 Aug 2026',
    },
  ];

  // Sample Maintenance & Micro-damage Claims
  const maintenanceRecords = [
    {
      id: 'clm-081',
      ticketNo: 'CLM-2026-081',
      type: 'Accidental Micro-Damage Protection',
      title: 'Bathroom Tap Diverter Strain',
      description: 'Hairline stress fracture on diverter cartridge. Covered 100% by UniNest Escrow Micro-Damage Fund (₹0 deposit deduction).',
      cost: 700,
      status: 'RESOLVED',
      date: '12 Oct 2026',
      coverageStatus: '100% ESCROW REIMBURSED',
    },
    {
      id: 'mnt-012',
      ticketNo: 'MNT-2026-012',
      type: 'Routine Maintenance',
      title: 'Split AC Filter Deep Clean & Pressure Test',
      description: 'Quarterly routine sanitization by Ludhiana Home Services. Signed off by tenant.',
      cost: 450,
      status: 'COMPLETED',
      date: '20 Aug 2026',
      coverageStatus: 'LANDLORD COVERED',
    },
  ];

  // Comprehensive Activity & Audit Timeline from room entry
  const timelineEvents = [
    {
      date: '14 Oct 2026, 10:30 AM',
      category: 'ACTIVITY',
      title: 'Roommate Harmony Score Logged',
      desc: 'Active tenancy session verified; 91% compatibility index logged with room occupant.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      date: '12 Oct 2026, 02:15 PM',
      category: 'DAMAGE_CLAIM',
      title: 'Accidental Micro-Damage Claim Approved',
      desc: 'Filed tap strain repair (₹700). Approved under UniNest ₹5,000 Zero-Copay policy with zero deposit deduction.',
      icon: ShieldCheck,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
    },
    {
      date: '04 Oct 2026, 09:20 AM',
      category: 'PAYMENT',
      title: 'October 2026 Rent Auto-Settled',
      desc: `₹${data.rentRupees.toLocaleString('en-IN')} paid on-time via Razorpay UPI AutoPay. Official tax invoice e-signed.`,
      icon: Receipt,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      date: '28 Sep 2026, 05:40 PM',
      category: 'ELECTRICITY',
      title: 'September 2026 Sub-Meter Split Paid',
      desc: 'Settled ₹665.00 via direct UPI (UTR: 426819203810) for 190 kWh sub-meter cycle.',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      date: '03 Sep 2026, 11:15 AM',
      category: 'PAYMENT',
      title: 'September 2026 Rent Settled',
      desc: `₹${data.rentRupees.toLocaleString('en-IN')} paid on-time via Direct UPI. Status: Verified.`,
      icon: Receipt,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      date: '16 Aug 2026, 10:00 AM',
      category: 'STATUTORY',
      title: 'Punjab Police Form-11 Filed & Verified',
      desc: 'Tenant identification dossier submitted under Section 144 CrPC to Sarabha Nagar Police Station.',
      icon: Shield,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      date: '15 Aug 2026, 02:45 PM',
      category: 'HANDOVER',
      title: 'Move-in Condition Inspection Signed',
      desc: '18-point checklist verified (AC remote, study desk, sub-meter reading 1,020 kWh recorded).',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      date: '15 Aug 2026, 02:15 PM',
      category: 'ARRIVAL_ESCROW',
      title: 'Stage 2 GPS Geofence & Handshake Arrival PIN Verified',
      desc: 'Student confirmed on-site within 250m geofence. 6-digit Handshake PIN exchanged; ₹2,000 escrow token released to landlord.',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      date: '14 Aug 2026, 04:30 PM',
      category: 'LEGAL',
      title: '11-Month Tripartite Digital Lease Deed Executed',
      desc: 'Legally binding e-stamped Leave & License deed executed under Indian Contract Act, 1872.',
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      date: '12 Aug 2026, 11:00 AM',
      category: 'VISIT_OTP',
      title: 'Stage 1 Physical Visit Proof OTP Verified',
      desc: 'Student visited PG in-person. Landlord generated Visit OTP verified on-site by UniNest Trust Engine.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      date: '10 Aug 2026, 06:12 PM',
      category: 'BOOKING',
      title: 'Online Bed Reservation Confirmed',
      desc: `Reserved ${data.roomNumber} (${data.bedLabel}) with ₹2,000 commitment token held safely in UniNest Escrow.`,
      icon: CreditCard,
      color: 'text-slate-600 bg-slate-100 border-slate-200',
    },
  ];

  const handleOpenReceipt = (rec: any) => {
    const docData: DocumentPDFData = {
      id: rec.id,
      title: `${rec.month} Rent Receipt (${rec.status})`,
      category: 'RECEIPT',
      referenceNo: rec.docRef,
      issueDate: rec.paidDate.split(',')[0],
      status: 'ISSUED',
      issuer: 'UniNest Escrow Automated Trust Engine',
      amount: `₹${rec.amount.toLocaleString('en-IN')}.00`,
      tenantName: data.tenantName,
      roomDetails: `${data.propertyName} (${data.roomNumber}, ${data.bedLabel})`,
      paymentMethod: rec.method,
      transactionId: rec.txnId,
    };
    setViewingReceiptDoc(docData);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" title="">
        <div className="flex flex-col h-full space-y-4 -mt-2">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                {data.tenantName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-slate-900">{data.tenantName}</h2>
                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {rollId}
                  </span>
                  <Badge variant="success" size="sm" className="font-bold text-[10px]">
                    ACTIVE TENANT
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {college} • {course}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5 flex-wrap">
                  <span className="font-semibold text-brand-700">
                    {data.propertyName} • {data.roomNumber} ({data.bedLabel})
                  </span>
                  <span>•</span>
                  <span>Rent: ₹{data.rentRupees.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span>Call</span>
              </a>
              {onInitiateCheckOut && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onInitiateCheckOut(data.tenantName, data.roomNumber, data.bedLabel);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Check-Out</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Rent Ledger</span>
              <div className="text-xs sm:text-sm font-black text-emerald-950">PAID ON-TIME</div>
              <p className="text-[10px] text-emerald-700 font-medium">0 Overdue Dues</p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Sub-Meter Electricity</span>
              <div className="text-xs sm:text-sm font-black text-amber-950">₹665 Settled</div>
              <p className="text-[10px] text-amber-700 font-medium">{subMeter} • 50% Split</p>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Damage Protection</span>
              <div className="text-xs sm:text-sm font-black text-blue-950">₹5,000 Active</div>
              <p className="text-[10px] text-blue-700 font-medium">₹700 Used • ₹4,300 Left</p>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Trust &amp; KYC</span>
              <div className="text-xs sm:text-sm font-black text-purple-950">100% VERIFIED</div>
              <p className="text-[10px] text-purple-700 font-medium">Aadhaar + Police Form-11</p>
            </div>
          </div>

          {/* Dossier Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            {[
              { id: 'overview', label: '1. Identity & Compliance', icon: UserCheck },
              { id: 'rent', label: '2. Rent Payments', icon: Receipt },
              { id: 'electricity', label: '3. Electricity Splits', icon: Zap },
              { id: 'maintenance', label: '4. Maintenance & Claims', icon: Wrench },
              { id: 'timeline', label: '5. Complete Room Entry Log', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview & Identity */}
          {activeTab === 'overview' && (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Tenancy & Allocation Details */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-brand-600" />
                    <span>Tenancy &amp; Allocation Contract</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>Property:</span>
                      <strong className="text-slate-900">{data.propertyName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Room &amp; Bed:</span>
                      <strong className="text-slate-900">
                        {data.roomNumber} ({data.bedLabel})
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Move-In Date:</span>
                      <strong className="text-slate-900">{moveInDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Lease Expiry:</span>
                      <strong className="text-slate-900">{leaseEndDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <strong className="text-emerald-700">₹{deposit.toLocaleString('en-IN')} (Escrow Held)</strong>
                    </div>
                  </div>
                </div>

                {/* Statutory Verification Status */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Verification Credentials</span>
                  </h4>
                  <div className="space-y-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>UIDAI Aadhaar KYC:</span>
                      <Badge variant="success" size="sm" className="font-bold">
                        VERIFIED (VID #8892)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Punjab Police Form-11:</span>
                      <Badge variant="success" size="sm" className="font-bold">
                        REGISTERED &amp; FILED
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tripartite Lease Deed:</span>
                      <Badge variant="success" size="sm" className="font-bold">
                        E-STAMPED ORIGINAL
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Emergency Guardian:</span>
                      <strong className="text-slate-900">Ramesh Sharma (Father)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact info bar */}
              <div className="p-3.5 bg-slate-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-slate-500" /> {phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-700 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {email}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">UniNest Trust Engine Verified Resident</span>
              </div>
            </div>
          )}

          {/* Tab 2: Rent Payment History */}
          {activeTab === 'rent' && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-slate-700">Official Rent Settlement History (Every Month Recorded)</span>
                <span className="text-slate-500">Base Rent: ₹{data.rentRupees.toLocaleString('en-IN')}/mo</span>
              </div>

              <div className="space-y-2">
                {rentRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{rec.month}</strong>
                        <Badge
                          variant={rec.status.includes('PAID') ? 'success' : 'outline'}
                          size="sm"
                          className="font-bold text-[10px]"
                        >
                          {rec.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        Paid on <strong>{rec.paidDate}</strong> via {rec.method}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">Ref: {rec.txnId}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{rec.amount.toLocaleString('en-IN')}.00
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold">Verified Receipt</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenReceipt(rec)}
                        className="text-xs font-bold flex items-center gap-1 border-slate-300 hover:bg-slate-50"
                      >
                        <Receipt className="w-3.5 h-3.5 text-brand-600" />
                        <span>Receipt</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Electricity Sub-Meter Split History */}
          {activeTab === 'electricity' && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-amber-950 block">Dedicated Sub-Meter: {subMeter}</strong>
                  <span className="text-amber-800 text-[11px]">
                    Automatic 50/50 split applied based on room occupancy. Zero manual calculation needed.
                  </span>
                </div>
                <div className="font-black text-amber-900 text-right">
                  Pending Dues: <span className="text-emerald-700">₹0.00</span>
                </div>
              </div>

              <div className="space-y-2">
                {electricityRecords.map((e, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm">{e.month}</strong>
                        <Badge variant="success" size="sm" className="font-bold text-[10px]">
                          {e.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Consumption: <strong>{e.units}</strong> ({e.readingSpan}) • Room Total: ₹{e.totalBill}
                      </p>
                      <p className="text-slate-400 text-[10px] font-mono">
                        Bank UTR: {e.utr} • Settled on {e.paidDate}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="font-black text-amber-900 text-sm">
                        ₹{e.studentShare.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{e.splitRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Maintenance & Damage Claims */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <strong className="text-brand-950 block">₹5,000 Accidental Micro-Damage Protection Pool</strong>
                  <span className="text-brand-800 text-[11px]">
                    Covers unintentional fixture cracks, tap strains, or wall scuffs with zero student co-pay.
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">Used: ₹700 / ₹5,000</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Remaining: ₹4,300</div>
                </div>
              </div>

              <div className="space-y-2">
                {maintenanceRecords.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {m.ticketNo}
                        </span>
                        <strong className="text-slate-900">{m.title}</strong>
                        <span className="text-slate-400">• {m.type}</span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge variant="success" size="sm" className="font-bold text-[10px]">
                          {m.status}
                        </Badge>
                        <span className="font-black text-slate-900">₹{m.cost}</span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-[11px] leading-relaxed">{m.description}</p>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-800 font-bold">✓ {m.coverageStatus}</span>
                      <span className="text-slate-400">{m.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Complete Chronological Activity & Audit Log from Room Entry */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-slate-700">
                  Full Chronological History from Day 1 Entry to Present
                </span>
                <span className="text-slate-500">{timelineEvents.length} Verified Events</span>
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineEvents.map((evt, idx) => {
                  const Icon = evt.icon;
                  return (
                    <div key={idx} className="relative text-xs space-y-1">
                      {/* Timeline Dot */}
                      <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-slate-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900 text-xs">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{evt.date}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{evt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Immutable cryptographic tenant record verified by UniNest Trust Engine</span>
            </div>
            <Button size="sm" variant="outline" onClick={onClose} className="font-bold text-xs self-end sm:self-auto">
              Close Dossier
            </Button>
          </div>
        </div>
      </Modal>

      {/* Embedded Document Receipt Viewer */}
      {viewingReceiptDoc && (
        <DocumentViewerModal
          isOpen={Boolean(viewingReceiptDoc)}
          onClose={() => setViewingReceiptDoc(null)}
          doc={viewingReceiptDoc}
        />
      )}
    </>
  );
}
