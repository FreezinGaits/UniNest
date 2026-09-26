'use client';

import React, { useState, useMemo } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  GraduationCap,
  Search,
  Filter,
  ShieldCheck,
  Phone,
  Building2,
  UserCheck,
  Clock,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Mail,
} from 'lucide-react';

interface EnrolledStudent {
  id: string;
  rollNo: string;
  name: string;
  email: string;
  phone: string;
  department: 'B.Tech CSE' | 'MBA' | 'B.Pharm' | 'BBA' | 'BCA';
  programLabel: string;
  pgAllocation: string;
  landlord: string;
  monthlyRentPaise: number;
  parentContact: string;
  status: 'KYC & FORM-11 VERIFIED' | 'PENDING_PARENT_CONSENT';
  curfewCheck: 'In-Residency' | 'Late Pass Approved';
  verifiedAt?: string;
}

const INITIAL_STUDENTS: EnrolledStudent[] = [
  {
    id: 'stu-1',
    rollNo: 'PCTE-CSE-2024-089',
    name: 'Rahul Sharma',
    email: 'rahul@uninest.in',
    phone: '+91 98765 43210',
    department: 'B.Tech CSE',
    programLabel: 'B.Tech CSE (Yr 2)',
    pgAllocation: 'PCTE Smart Student Residency — Room 204, Bed A',
    landlord: 'Vikram Singh',
    monthlyRentPaise: 600000,
    parentContact: '+91 98123 45678 (Ramesh Sharma)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'In-Residency',
    verifiedAt: '12 Aug 2026',
  },
  {
    id: 'stu-2',
    rollNo: 'PCTE-CSE-2024-112',
    name: 'Aman Verma',
    email: 'aman.verma@pcte.edu.in',
    phone: '+91 97890 12345',
    department: 'B.Tech CSE',
    programLabel: 'B.Tech CSE (Yr 2)',
    pgAllocation: 'PCTE Smart Student Residency — Room 204, Bed B',
    landlord: 'Vikram Singh',
    monthlyRentPaise: 600000,
    parentContact: '+91 98111 22334 (Suresh Verma)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'In-Residency',
    verifiedAt: '14 Aug 2026',
  },
  {
    id: 'stu-3',
    rollNo: 'PCTE-MBA-2025-034',
    name: 'Simran Kaur',
    email: 'simran.kaur@pcte.edu.in',
    phone: '+91 98722 11098',
    department: 'MBA',
    programLabel: 'MBA Finance (Yr 1)',
    pgAllocation: 'Sarabha Link Girls Enclave — Room 102, Bed A',
    landlord: 'Gurpreet Kaur',
    monthlyRentPaise: 650000,
    parentContact: '+91 98142 55667 (Harbhajan Singh)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'In-Residency',
    verifiedAt: '15 Aug 2026',
  },
  {
    id: 'stu-4',
    rollNo: 'PCTE-BPH-2024-019',
    name: 'Karanveer Gill',
    email: 'karan.gill@pcte.edu.in',
    phone: '+91 98555 44321',
    department: 'B.Pharm',
    programLabel: 'B.Pharm (Yr 3)',
    pgAllocation: 'Passi Nagar Scholars Nest — Room 105, Bed B',
    landlord: 'Vikram Singh',
    monthlyRentPaise: 580000,
    parentContact: '+91 98150 99887 (Major J.S. Gill)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'Late Pass Approved',
    verifiedAt: '10 Aug 2026',
  },
  {
    id: 'stu-5',
    rollNo: 'PCTE-BBA-2025-076',
    name: 'Sneha Arora',
    email: 'sneha.arora@pcte.edu.in',
    phone: '+91 98761 23450',
    department: 'BBA',
    programLabel: 'BBA (Yr 1)',
    pgAllocation: 'BRS Nagar Student Villa — Room 301, Bed A',
    landlord: 'Harजिंदर Sidhu',
    monthlyRentPaise: 620000,
    parentContact: '+91 94170 33211 (Rajesh Arora)',
    status: 'PENDING_PARENT_CONSENT',
    curfewCheck: 'In-Residency',
  },
  {
    id: 'stu-6',
    rollNo: 'PCTE-BCA-2024-052',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@pcte.edu.in',
    phone: '+91 98882 77654',
    department: 'BCA',
    programLabel: 'BCA (Yr 2)',
    pgAllocation: 'PCTE Smart Student Residency — Room 108, Bed A',
    landlord: 'Vikram Singh',
    monthlyRentPaise: 550000,
    parentContact: '+91 98140 88776 (Vinod Mehta)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'In-Residency',
    verifiedAt: '16 Aug 2026',
  },
  {
    id: 'stu-7',
    rollNo: 'PCTE-MBA-2024-061',
    name: 'Navjot Brar',
    email: 'navjot.brar@pcte.edu.in',
    phone: '+91 98154 66789',
    department: 'MBA',
    programLabel: 'MBA Marketing (Yr 2)',
    pgAllocation: 'Baddowal Green View Boys Hostel — Room 201, Bed A',
    landlord: 'Balwinder Grewal',
    monthlyRentPaise: 540000,
    parentContact: '+91 98152 44320 (Sukhdev Brar)',
    status: 'PENDING_PARENT_CONSENT',
    curfewCheck: 'In-Residency',
  },
  {
    id: 'stu-8',
    rollNo: 'PCTE-BPH-2025-044',
    name: 'Jaspreet Sandhu',
    email: 'jaspreet.sandhu@pcte.edu.in',
    phone: '+91 98780 55432',
    department: 'B.Pharm',
    programLabel: 'B.Pharm (Yr 1)',
    pgAllocation: 'Sarabha Link Girls Enclave — Room 205, Bed B',
    landlord: 'Gurpreet Kaur',
    monthlyRentPaise: 650000,
    parentContact: '+91 98720 11998 (Kulwant Sandhu)',
    status: 'KYC & FORM-11 VERIFIED',
    curfewCheck: 'In-Residency',
    verifiedAt: '19 Aug 2026',
  },
];

const DEPARTMENTS = ['ALL', 'B.Tech CSE', 'MBA', 'B.Pharm', 'BBA', 'BCA'] as const;
const KYC_FILTERS = ['ALL', 'VERIFIED', 'PENDING_PARENT_CONSENT'] as const;

export default function StudentRosterPage() {
  const [students, setStudents] = useState<EnrolledStudent[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<(typeof DEPARTMENTS)[number]>('ALL');
  const [selectedKyc, setSelectedKyc] = useState<(typeof KYC_FILTERS)[number]>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleVerifyParentConsent = (studentId: string, studentName: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              status: 'KYC & FORM-11 VERIFIED',
              verifiedAt: 'Just now • PCTE Housing Cell',
            }
          : s
      )
    );
    setToastMessage(`Parent consent OTP & Form-11 verified for ${studentName}. Student record updated.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pgAllocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.landlord.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;

      const matchesKyc =
        selectedKyc === 'ALL' ||
        (selectedKyc === 'VERIFIED' && s.status === 'KYC & FORM-11 VERIFIED') ||
        (selectedKyc === 'PENDING_PARENT_CONSENT' && s.status === 'PENDING_PARENT_CONSENT');

      return matchesSearch && matchesDept && matchesKyc;
    });
  }, [students, searchQuery, selectedDept, selectedKyc]);

  const verifiedCount = students.filter((s) => s.status === 'KYC & FORM-11 VERIFIED').length;
  const pendingCount = students.filter((s) => s.status === 'PENDING_PARENT_CONSENT').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="success" size="sm">
              Ludhiana Police Form-11 Synced
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Off-Campus Enrolled Student Directory
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology • 1,800 Off-Campus Students • Form-11 &amp; Parent Consent Registry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-brand-600" />
            <div>
              <p className="text-xs text-brand-700 font-medium">Biometric Night Roster</p>
              <p className="text-sm font-bold text-brand-900">98.6% In-Residency</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Off-Campus Students"
          value="1,800"
          subtitle="Campus-1 & Campus-2 (Baddowal)"
          icon={<GraduationCap className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="KYC & Form-11 Verified"
          value={`${verifiedCount} / ${students.length} Active Cohort`}
          subtitle="1,695 total institutional filings"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Pending Parent Consent"
          value={pendingCount}
          subtitle="Awaiting guardian tele-verification"
          icon={<AlertCircle className="w-5 h-5" />}
          color={pendingCount > 0 ? 'amber' : 'brand'}
        />
        <StatCard
          title="Biometric Curfew Compliance"
          value="100%"
          subtitle="7 In-Residency • 1 Approved Late Pass"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filters & Search Bar */}
      <Card padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, PCTE Roll No, PG name, or landlord..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-text-primary"
            />
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-text-secondary mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Dept:
            </span>
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedDept === dept
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* KYC Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-text-secondary mr-1">KYC Status:</span>
            {KYC_FILTERS.map((kyc) => (
              <button
                key={kyc}
                onClick={() => setSelectedKyc(kyc)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedKyc === kyc
                    ? 'bg-purple-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {kyc === 'ALL'
                  ? 'All Records'
                  : kyc === 'VERIFIED'
                  ? 'Verified'
                  : 'Pending Parent Consent'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Verified PG Student Safety &amp; Consent Roster ({filteredStudents.length})
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Live synchronization with partner PG biometric gates and Ludhiana Police Form-11 portal
            </p>
          </div>
          <Badge variant="info" size="sm">
            Academic Session 2026–27
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Student &amp; Roll No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Verified PG &amp; Landlord
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Parent / Guardian Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Curfew Check
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  KYC &amp; Form-11 Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-text-primary">{student.name}</div>
                    <div className="text-xs font-mono text-brand-600 mt-0.5">{student.rollNo}</div>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {student.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {student.phone}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge variant="outline" size="sm">
                      {student.programLabel}
                    </Badge>
                    <div className="text-xs text-text-tertiary mt-1.5">
                      Escrow Rent: <span className="font-medium text-text-secondary">{formatINR(student.monthlyRentPaise)}/mo</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium text-text-primary flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{student.pgAllocation}</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Landlord: <span className="font-medium">{student.landlord}</span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-xs font-medium text-text-primary flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{student.parentContact}</span>
                    </div>
                    <div className="text-xs text-text-tertiary mt-1">
                      Emergency SMS Alerts: Enabled
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      variant={student.curfewCheck === 'In-Residency' ? 'success' : 'info'}
                      size="sm"
                      dot
                    >
                      {student.curfewCheck}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    {student.status === 'KYC & FORM-11 VERIFIED' ? (
                      <div className="space-y-1">
                        <Badge variant="success" size="sm" dot>
                          KYC &amp; FORM-11 VERIFIED
                        </Badge>
                        {student.verifiedAt && (
                          <div className="text-[11px] text-text-tertiary flex items-center gap-1">
                            <FileCheck2 className="w-3 h-3 text-emerald-600" />
                            {student.verifiedAt}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="warning" size="sm" dot>
                          PENDING_PARENT_CONSENT
                        </Badge>
                        <div>
                          <button
                            onClick={() => handleVerifyParentConsent(student.id, student.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Verify Parent Consent &amp; Approve
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-secondary">
                    No enrolled PCTE students match your current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
