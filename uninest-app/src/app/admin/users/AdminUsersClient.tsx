'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  Wrench,
  CheckCircle2,
  Search,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  Lock,
  MessageSquare,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PlatformUser } from '@/lib/usersStore';

interface UserDossierData {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'COLLEGE' | 'PROVIDER';
  phone: string;
  institution: string;
  kycStatus: string;
  createdAt: string;

  // Student-specific
  currentResidence?: {
    propertyName: string;
    roomNo: string;
    bedNo: string;
    monthlyRent: string;
    landlordName: string;
    landlordPhone: string;
    policeForm11Id: string;
    policeStation: string;
    handshakeStatus: string;
  };
  maskedAadhaar?: string;
  faceMatchScore?: string;
  enrollmentNo?: string;
  guardianName?: string;
  guardianPhone?: string;

  // Landlord-specific
  businessDetails?: {
    tradeName: string;
    registeredAddress: string;
    settlementVpa: string;
    bankAccount: string;
    totalProperties: number;
    totalBeds: number;
    occupiedBeds: number;
    disbursedEarnings: string;
    pendingEscrow: string;
    fireNocExpiry: string;
    policeCompliance: string;
  };

  // Partner / Vendor specific
  partnerDetails?: {
    organization: string;
    liaisonOfficer: string;
    coverageArea: string;
    activeJobsOrStudents: string;
    slaScore: string;
  };

  // Timeline of all platform actions
  activityTimeline: {
    title: string;
    category: 'KYC' | 'ESCROW' | 'BOOKING' | 'MAINTENANCE' | 'COMPLIANCE';
    timestamp: string;
    details: string;
  }[];
}

const DOSSIERS_STORE: Record<string, UserDossierData> = {
  u1: {
    id: 'u1',
    name: 'Rahul Sharma',
    email: 'rahul@uninest.in',
    role: 'STUDENT',
    phone: '+91 98765 43210',
    institution: 'PCTE Group of Institutes',
    kycStatus: 'VERIFIED',
    createdAt: '2026-07-12T10:00:00.000Z',
    enrollmentNo: 'PCTE-CSE-2024-089 (B.Tech 3rd Yr)',
    maskedAadhaar: 'XXXX-XXXX-4821 (UIDAI Redacted)',
    faceMatchScore: '99.2% Liveness Passed',
    guardianName: 'Rajesh Sharma (Father)',
    guardianPhone: '+91 98140 12345',
    currentResidence: {
      propertyName: 'PCTE Smart Student Residency',
      roomNo: 'Room 204',
      bedNo: 'Bed A',
      monthlyRent: '₹6,000 / month',
      landlordName: 'Vikram Singh (Passi Residency)',
      landlordPhone: '+91 98989 89801',
      policeForm11Id: 'LDH-POL-F11-2026-8841',
      policeStation: 'PS Sadar Ludhiana',
      handshakeStatus: 'Stage-1 Visit PIN Verified (Active Escrow Reserve)',
    },
    activityTimeline: [
      {
        title: 'Bathroom Tap Leaking Ticket Filed',
        category: 'MAINTENANCE',
        timestamp: '28 Sep 2026, 02:15 PM',
        details: 'Ticket #MNT-2026-001 dispatched to QuickFix Services with 12-hour SLA.',
      },
      {
        title: '₹399 72-Hour Visit Hold Locked in Escrow',
        category: 'ESCROW',
        timestamp: '26 Sep 2026, 10:14 AM',
        details: 'NPCI UTR #626918402914 locked in vault (anupamrai172@oksbi).',
      },
      {
        title: '₹5,601 Balance Escrow Rent Deposited',
        category: 'ESCROW',
        timestamp: '25 Sep 2026, 05:10 PM',
        details: 'NPCI UTR #626811209483 cleared and held for Move-In OTP validation.',
      },
      {
        title: '15% Advance Session Token Paid',
        category: 'ESCROW',
        timestamp: '25 Sep 2026, 04:42 PM',
        details: 'NPCI UTR #626919884102 verified for PAU Green Avenue Scholars Hub.',
      },
      {
        title: 'Punjab Police Form-11 Dossier Sealed',
        category: 'COMPLIANCE',
        timestamp: '25 Sep 2026, 11:30 AM',
        details: 'Statutory Form-11 intimation acknowledged by PS Sadar Ludhiana.',
      },
      {
        title: 'Masked Aadhaar KYC & Biometrics Verified',
        category: 'KYC',
        timestamp: '24 Sep 2026, 11:20 AM',
        details: 'Aadhaar redacted under DPDP Act 2023 with 99.2% face match score.',
      },
    ],
  },

  u6: {
    id: 'u6',
    name: 'Aman Verma',
    email: 'aman.verma@pcte.edu.in',
    role: 'STUDENT',
    phone: '+91 98142 65109',
    institution: 'PCTE Group of Institutes',
    kycStatus: 'VERIFIED',
    createdAt: '2026-08-03T12:10:00.000Z',
    enrollmentNo: 'PCTE-MBA-2025-114 (MBA 1st Yr)',
    maskedAadhaar: 'XXXX-XXXX-9104',
    faceMatchScore: '98.7% Liveness Passed',
    guardianName: 'Harbhajan Verma',
    guardianPhone: '+91 98142 55667',
    currentResidence: {
      propertyName: 'PCTE Smart Student Residency',
      roomNo: 'Room 202',
      bedNo: 'Bed B',
      monthlyRent: '₹6,000 / month',
      landlordName: 'Vikram Singh',
      landlordPhone: '+91 98989 89801',
      policeForm11Id: 'LDH-POL-F11-2026-8894',
      policeStation: 'PS Sadar Ludhiana',
      handshakeStatus: 'STAGE-2 MOVE-IN KEY VERIFIED (Rent Disbursed to Landlord)',
    },
    activityTimeline: [
      {
        title: 'Stage-2 Move-In Key Verified — Rent Disbursed',
        category: 'ESCROW',
        timestamp: '20 Sep 2026, 03:15 PM',
        details: 'Key #641908 matched upon room handover. ₹6,000 released to Vikram Singh (UTR #626590184327).',
      },
      {
        title: 'Section 10A Tenancy Agreement Digitally E-Signed',
        category: 'BOOKING',
        timestamp: '19 Sep 2026, 04:00 PM',
        details: 'Tripartite lease executed under IT Act 2000 Section 10A with SHA-256 hash.',
      },
      {
        title: 'Stage-1 Physical Visit PIN Verified',
        category: 'BOOKING',
        timestamp: '18 Sep 2026, 11:30 AM',
        details: 'PIN #3914 matched with landlord at premises. Room accepted.',
      },
      {
        title: 'Police Form-11 Filed & Sealed',
        category: 'COMPLIANCE',
        timestamp: '20 Sep 2026, 10:00 AM',
        details: 'Dossier LDH-POL-F11-2026-8894 submitted to Saanjh Kendra Sadar.',
      },
    ],
  },

  u7: {
    id: 'u7',
    name: 'Simran Kaur',
    email: 'simran.kaur@pcte.edu.in',
    role: 'STUDENT',
    phone: '+91 98721 33490',
    institution: 'Punjab Agricultural University (PAU)',
    kycStatus: 'VERIFIED',
    createdAt: '2026-08-09T15:45:00.000Z',
    enrollmentNo: 'PAU-BSC-2024-207',
    maskedAadhaar: 'XXXX-XXXX-3318',
    faceMatchScore: '99.4% Liveness Passed',
    guardianName: 'Gurdeep Kaur',
    guardianPhone: '+91 98721 99881',
    currentResidence: {
      propertyName: 'PAU Green Avenue Scholars Hub',
      roomNo: 'Room 108',
      bedNo: 'Bed A',
      monthlyRent: '₹6,000 / month',
      landlordName: 'Vikram Singh',
      landlordPhone: '+91 98989 89801',
      policeForm11Id: 'LDH-POL-F11-2026-8912',
      policeStation: 'PS PAU Ludhiana',
      handshakeStatus: 'Stage-1 Visit PIN Verified • Move-In Pending (Escrow Locked)',
    },
    activityTimeline: [
      {
        title: 'AC Maintenance Ticket Dispatched',
        category: 'MAINTENANCE',
        timestamp: '27 Sep 2026, 11:00 AM',
        details: 'Ticket #MNT-2026-002 assigned to QuickFix Services.',
      },
      {
        title: 'Monthly Rent Escrow Locked',
        category: 'ESCROW',
        timestamp: '26 Sep 2026, 09:48 AM',
        details: '₹6,000 locked via UTR #626433098112 in Escrow Vault.',
      },
      {
        title: 'Police Form-11 Intimation Submitted',
        category: 'COMPLIANCE',
        timestamp: '26 Sep 2026, 09:00 AM',
        details: 'Awaiting officer seal at PS PAU Ludhiana.',
      },
      {
        title: 'Stage-1 Visit PIN Verified',
        category: 'BOOKING',
        timestamp: '22 Sep 2026, 02:00 PM',
        details: 'PIN #6102 matched with landlord.',
      },
    ],
  },

  u8: {
    id: 'u8',
    name: 'Karanveer Gill',
    email: 'karanveer.gill@gndec.ac.in',
    role: 'STUDENT',
    phone: '+91 98550 71234',
    institution: 'GNDEC Ludhiana',
    kycStatus: 'VERIFIED',
    createdAt: '2026-08-14T16:30:00.000Z',
    enrollmentNo: 'GNDEC-ME-2024-052',
    maskedAadhaar: 'XXXX-XXXX-7742',
    faceMatchScore: '97.9% Liveness Passed',
    guardianName: 'Jaswant Gill',
    guardianPhone: '+91 98550 33441',
    currentResidence: {
      propertyName: 'PCTE Smart Student Residency',
      roomNo: 'Room 301',
      bedNo: 'Bed A',
      monthlyRent: '₹6,000 / month',
      landlordName: 'Vikram Singh',
      landlordPhone: '+91 98989 89801',
      policeForm11Id: 'LDH-POL-F11-2026-8937',
      policeStation: 'PS Sarabha Nagar',
      handshakeStatus: 'ESCROW FROZEN (Dispute Under Arbitration)',
    },
    activityTimeline: [
      {
        title: 'Dispute #DSP-2026-009 Filed — Escrow Frozen',
        category: 'ESCROW',
        timestamp: '26 Sep 2026, 10:30 AM',
        details: 'Room AC & ventilation discrepancy flagged. ₹6,000 frozen under Indian Contract Act Section 73.',
      },
      {
        title: 'Monthly Rent Deposited in Escrow',
        category: 'ESCROW',
        timestamp: '26 Sep 2026, 11:05 AM',
        details: 'UTR #626744901288 logged in central ledger.',
      },
      {
        title: 'Police Form-11 Dossier Generated',
        category: 'COMPLIANCE',
        timestamp: '26 Sep 2026, 08:30 AM',
        details: 'Filed with PS Sarabha Nagar.',
      },
    ],
  },

  u2: {
    id: 'u2',
    name: 'Vikram Singh (Passi Residency)',
    email: 'landlord@uninest.in',
    role: 'LANDLORD',
    phone: '+91 98989 89801',
    institution: 'Passi Residency Properties',
    kycStatus: 'VERIFIED',
    createdAt: '2026-06-18T09:30:00.000Z',
    businessDetails: {
      tradeName: 'Passi Residency & Hospitality Solutions LLP',
      registeredAddress: 'Plot 42, Block B, BRS Nagar, Ferozepur Road, Ludhiana',
      settlementVpa: 'vikramsingh.passi@okicici',
      bankAccount: 'HDFC Bank (A/C: *******4912, IFSC: HDFC0001248)',
      totalProperties: 2,
      totalBeds: 28,
      occupiedBeds: 23,
      disbursedEarnings: '₹6,000 Settled (Aman Verma)',
      pendingEscrow: '₹17,601 Awaiting Move-In OTPs',
      fireNocExpiry: '14 March 2027 (Active)',
      policeCompliance: '100% Form-11 Integrated',
    },
    activityTimeline: [
      {
        title: 'Stage-2 Move-In Rent Payout Received',
        category: 'ESCROW',
        timestamp: '20 Sep 2026, 03:15 PM',
        details: '₹6,000 transferred to vikramsingh.passi@okicici post Move-In Key verification.',
      },
      {
        title: 'Stage-1 Visit Handshake Verified (Aman Verma)',
        category: 'BOOKING',
        timestamp: '18 Sep 2026, 11:30 AM',
        details: 'PIN #3914 authenticated at PCTE Smart Student Residency.',
      },
      {
        title: 'Passi Luxury PG & Co-Living Verified Badge Awarded',
        category: 'COMPLIANCE',
        timestamp: '15 Sep 2026, 04:00 PM',
        details: 'Passed physical audit, Fire NOC, and Form-11 checks.',
      },
      {
        title: 'PCTE Smart Student Residency Listing Published',
        category: 'BOOKING',
        timestamp: '01 Sep 2026, 10:00 AM',
        details: '12 Beds configured across 6 rooms.',
      },
    ],
  },

  u3: {
    id: 'u3',
    name: 'UniNest Escrow Admin',
    email: 'admin@uninest.in',
    role: 'ADMIN',
    phone: '+91 99999 00000',
    institution: 'UniNest Governance Desk',
    kycStatus: 'VERIFIED',
    createdAt: '2026-06-01T08:00:00.000Z',
    partnerDetails: {
      organization: 'UniNest Governance Desk & Escrow Vault',
      liaisonOfficer: 'Principal Governance Officer',
      coverageArea: 'All Ludhiana University Hubs',
      activeJobsOrStudents: '8 Registered Accounts / 38 Beds',
      slaScore: '99.9% Uptime',
    },
    activityTimeline: [
      {
        title: 'Dispute Arbitration Opened (DSP-2026-009)',
        category: 'ESCROW',
        timestamp: '26 Sep 2026, 10:35 AM',
        details: 'Escrow frozen on Room 301-A dispute.',
      },
      {
        title: 'Verified Badge Issued to PCTE Smart Residency',
        category: 'COMPLIANCE',
        timestamp: '04 Oct 2026, 04:53 PM',
        details: 'Compliance audit authenticated.',
      },
    ],
  },

  u4: {
    id: 'u4',
    name: 'PCTE Housing Cell',
    email: 'pcte@uninest.in',
    role: 'COLLEGE',
    phone: '+91 98888 11111',
    institution: 'PCTE Baddowal Campus',
    kycStatus: 'VERIFIED',
    createdAt: '2026-06-05T11:15:00.000Z',
    partnerDetails: {
      organization: 'PCTE Group of Institutes — Student Welfare Cell',
      liaisonOfficer: 'Dr. Gurpreet Singh (Dean Student Affairs)',
      coverageArea: 'PCTE Baddowal & Ferozepur Road Campus',
      activeJobsOrStudents: '2 Registered Students (Rahul Sharma, Aman Verma)',
      slaScore: 'Institutional Partner Active',
    },
    activityTimeline: [
      {
        title: 'Campus Housing Roster Synced',
        category: 'COMPLIANCE',
        timestamp: '25 Sep 2026, 12:00 PM',
        details: 'Verified bonafide enrollment for PCTE off-campus residents.',
      },
    ],
  },

  u5: {
    id: 'u5',
    name: 'QuickFix Services',
    email: 'provider@uninest.in',
    role: 'PROVIDER',
    phone: '+91 97777 22222',
    institution: 'Ludhiana SLA Partner Network',
    kycStatus: 'VERIFIED',
    createdAt: '2026-06-22T14:20:00.000Z',
    partnerDetails: {
      organization: 'QuickFix Ludhiana Facility Solutions',
      liaisonOfficer: 'Manpreet Singh (Field Operations Lead)',
      coverageArea: 'BRS Nagar, Ferozepur Road & PAU Gate 1',
      activeJobsOrStudents: '3 Dispatched SLA Tickets (#MNT-001, 002, 003)',
      slaScore: '100% On-Time SLA Dispatch',
    },
    activityTimeline: [
      {
        title: 'Power Socket Sparking Ticket Dispatched',
        category: 'MAINTENANCE',
        timestamp: '28 Sep 2026, 04:00 PM',
        details: 'Urgent 4h SLA electrical ticket for Room 204.',
      },
      {
        title: 'AC Cooling Ticket Dispatched',
        category: 'MAINTENANCE',
        timestamp: '27 Sep 2026, 11:15 AM',
        details: 'High 12h SLA ticket for Room 108.',
      },
      {
        title: 'Bathroom Tap Leak Ticket Accepted',
        category: 'MAINTENANCE',
        timestamp: '28 Sep 2026, 02:20 PM',
        details: 'Plumber dispatched to PCTE Smart Student Residency.',
      },
    ],
  },
};

export function AdminUsersClient({ initialUsers }: { initialUsers: PlatformUser[] }) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STUDENT' | 'LANDLORD' | 'PARTNERS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDossierData | null>(null);

  const studentCount = initialUsers.filter((u) => u.role === 'STUDENT').length;
  const landlordCount = initialUsers.filter((u) => u.role === 'LANDLORD').length;
  const partnerCount = initialUsers.filter((u) => u.role === 'PROVIDER' || u.role === 'COLLEGE').length;

  const filteredUsers = initialUsers.filter((u) => {
    if (activeFilter === 'STUDENT' && u.role !== 'STUDENT') return false;
    if (activeFilter === 'LANDLORD' && u.role !== 'LANDLORD') return false;
    if (activeFilter === 'PARTNERS' && u.role !== 'PROVIDER' && u.role !== 'COLLEGE' && u.role !== 'ADMIN') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.institution.toLowerCase().includes(q) ||
        u.phone.includes(q)
      );
    }
    return true;
  });

  const handleRowClick = (u: PlatformUser) => {
    const detailed = DOSSIERS_STORE[u.id] || {
      ...u,
      activityTimeline: [
        {
          title: 'Account Onboarded',
          category: 'KYC',
          timestamp: new Date(u.createdAt).toLocaleDateString('en-IN'),
          details: 'Verified identity and credentials.',
        },
      ],
    };
    setSelectedUser(detailed);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">Identity & Role Governance</h1>
            <Badge variant="success" dot>DPDP Act 2023 Compliant</Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Verified directory of students, property owners, campus housing cells, and SLA service vendors ({initialUsers.length} active accounts). Click any row to inspect complete user data, current residence & activity history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Accounts"
          value={initialUsers.length}
          subtitle="100% Aadhaar / Institutional verified"
          icon={<Users className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Verified Students"
          value={studentCount}
          subtitle="PCTE, PAU & GNDEC cohorts"
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Escrow Landlords"
          value={landlordCount}
          subtitle="UPI settlement bank linked"
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Campus & SLA Partners"
          value={partnerCount}
          subtitle="QuickFix Services & PCTE Cell"
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Filter Tabs and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All Accounts (${initialUsers.length})` },
              { id: 'STUDENT', label: `Students (${studentCount})` },
              { id: 'LANDLORD', label: `Landlords (${landlordCount})` },
              { id: 'PARTNERS', label: `Partners & Admin (${initialUsers.length - studentCount - landlordCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </Card>

      {/* Interactive Accounts Table */}
      <Card padding="none" className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Account Holder</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Official Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Affiliation / Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">KYC Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => handleRowClick(u)}
                  className="hover:bg-brand-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 group-hover:text-brand-700 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-text-secondary text-xs font-mono">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        u.role === 'STUDENT'
                          ? 'info'
                          : u.role === 'LANDLORD'
                          ? 'success'
                          : u.role === 'ADMIN'
                          ? 'purple'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium text-xs">{u.institution}</td>
                  <td className="px-4 py-3.5 text-text-secondary text-xs">{u.phone}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> VERIFIED
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs font-bold text-brand-600 group-hover:text-brand-700"
                    >
                      View Dossier →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comprehensive User Governance Dossier Modal */}
      {selectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUser(null)}
          title={`User Governance Dossier — ${selectedUser.name}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Header Identity Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-lg font-black text-white shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    {selectedUser.name}
                    <Badge variant="success" size="sm">DPDP Compliant</Badge>
                  </h3>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedUser.email}</p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Role</span>
                <p className="text-sm font-black text-brand-300">{selectedUser.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedUser.institution}</p>
              </div>
            </div>

            {/* If Student: Current Living Location & Accommodation */}
            {selectedUser.role === 'STUDENT' && selectedUser.currentResidence && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    Current Living Accommodation & Unit
                  </h4>
                  <Badge variant="success" size="sm">Active Tenancy</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Residency: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.propertyName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Room & Bed: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.roomNo} ({selectedUser.currentResidence.bedNo})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Monthly Rent: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.monthlyRent}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Landlord: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.landlordName} ({selectedUser.currentResidence.landlordPhone})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Police Form-11 Dossier: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.policeForm11Id}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Police Jurisdiction: </span>
                    <strong className="text-slate-900">{selectedUser.currentResidence.policeStation}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Status: {selectedUser.currentResidence.handshakeStatus}
                </div>
              </div>
            )}

            {/* If Landlord: Portfolio & Payouts */}
            {selectedUser.role === 'LANDLORD' && selectedUser.businessDetails && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    Landlord Portfolio & Settlement Credentials
                  </h4>
                  <Badge variant="success" size="sm">Bank Verified</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Trade Name: </span>
                    <strong className="text-slate-900">{selectedUser.businessDetails.tradeName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">UPI Settlement VPA: </span>
                    <strong className="text-slate-900 font-mono">{selectedUser.businessDetails.settlementVpa}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Bank Account: </span>
                    <strong className="text-slate-900">{selectedUser.businessDetails.bankAccount}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Portfolio Scale: </span>
                    <strong className="text-slate-900">
                      {selectedUser.businessDetails.totalProperties} PGs • {selectedUser.businessDetails.occupiedBeds}/{selectedUser.businessDetails.totalBeds} Beds Occupied
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Disbursed Earnings: </span>
                    <strong className="text-emerald-700 font-bold">{selectedUser.businessDetails.disbursedEarnings}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Pending Escrow: </span>
                    <strong className="text-purple-700 font-bold">{selectedUser.businessDetails.pendingEscrow}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Fire Safety NOC: </span>
                    <strong className="text-slate-900">{selectedUser.businessDetails.fireNocExpiry}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Form-11 Compliance: </span>
                    <strong className="text-slate-900">{selectedUser.businessDetails.policeCompliance}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* If Partner or Vendor: Organization Details */}
            {selectedUser.partnerDetails && (
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-3">
                <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-purple-700" />
                  Institutional & SLA Vendor Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Organization: </span>
                    <strong className="text-slate-900">{selectedUser.partnerDetails.organization}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Liaison Officer: </span>
                    <strong className="text-slate-900">{selectedUser.partnerDetails.liaisonOfficer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Coverage: </span>
                    <strong className="text-slate-900">{selectedUser.partnerDetails.coverageArea}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Active Load: </span>
                    <strong className="text-slate-900">{selectedUser.partnerDetails.activeJobsOrStudents}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Activity & Timeline History */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                Complete Activity & Governance Timeline (What They Have Done)
              </h4>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedUser.activityTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <Badge variant="outline" size="sm" className="text-[10px]">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600">{item.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Controls */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <Link href="/admin/verification" className="text-xs text-brand-600 font-bold hover:underline">
                Inspect Compliance Audit →
              </Link>
              <Button onClick={() => setSelectedUser(null)} variant="primary" size="sm">
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
