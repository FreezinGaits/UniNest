'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  UserCheck,
  FileWarning,
  CheckCircle2,
  RefreshCw,
  Fingerprint,
  GraduationCap,
} from 'lucide-react';

interface StudentKycRecord {
  id: string;
  studentName: string;
  email: string;
  collegeRollNo: string;
  institution: string;
  maskedAadhaar: string;
  faceMatchScore: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'REUPLOAD_REQUESTED';
  submittedAt: string;
}

const INITIAL_KYC_RECORDS: StudentKycRecord[] = [
  {
    id: 'KYC-2026-401',
    studentName: 'Rahul Sharma',
    email: 'rahul@uninest.in',
    collegeRollNo: 'PCTE-CSE-2024-089',
    institution: 'PCTE Group of Institutes',
    maskedAadhaar: 'XXXX-XXXX-4821',
    faceMatchScore: '99.2%',
    status: 'VERIFIED',
    submittedAt: '24 Sep 2026, 11:20 AM',
  },
  {
    id: 'KYC-2026-402',
    studentName: 'Aman Verma',
    email: 'aman.verma@pcte.edu.in',
    collegeRollNo: 'PCTE-MBA-2025-114',
    institution: 'PCTE Group of Institutes',
    maskedAadhaar: 'XXXX-XXXX-9104',
    faceMatchScore: '98.7%',
    status: 'VERIFIED',
    submittedAt: '25 Sep 2026, 02:15 PM',
  },
  {
    id: 'KYC-2026-403',
    studentName: 'Simran Kaur',
    email: 'simran.kaur@pcte.edu.in',
    collegeRollNo: 'PAU-BSC-2024-207',
    institution: 'Punjab Agricultural University (PAU)',
    maskedAadhaar: 'XXXX-XXXX-3318',
    faceMatchScore: '99.4%',
    status: 'PENDING_REVIEW',
    submittedAt: '26 Sep 2026, 09:40 AM',
  },
  {
    id: 'KYC-2026-404',
    studentName: 'Karanveer Gill',
    email: 'karanveer.gill@gndec.ac.in',
    collegeRollNo: 'GNDEC-ME-2024-052',
    institution: 'GNDEC Ludhiana',
    maskedAadhaar: 'XXXX-XXXX-7742',
    faceMatchScore: '97.9%',
    status: 'PENDING_REVIEW',
    submittedAt: '26 Sep 2026, 10:55 AM',
  },
];

export default function AdminKycPage() {
  const [records, setRecords] = useState<StudentKycRecord[]>(INITIAL_KYC_RECORDS);
  const [banner, setBanner] = useState<string | null>(null);

  const handleApprove = (id: string, name: string, aadhaar: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'VERIFIED' } : r))
    );
    setBanner(
      `KYC Approved for ${name} (Masked Aadhaar ${aadhaar}). First 8 Aadhaar digits remain permanently redacted per DPDP Act, 2023.`
    );
  };

  const handleRequestReupload = (id: string, name: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REUPLOAD_REQUESTED' } : r))
    );
    setBanner(`Re-upload notification dispatched to ${name} for fresh College ID & Masked Aadhaar XML.`);
  };

  const verifiedCount = records.filter((r) => r.status === 'VERIFIED').length;
  const pendingCount = records.filter((r) => r.status === 'PENDING_REVIEW').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Student Masked Aadhaar KYC & College ID Verification Queue
            </h1>
            <Badge variant="success" dot>
              DPDP Act, 2023 Compliant
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Zero-plaintext Aadhaar storage — first 8 digits are cryptographically masked (`XXXX-XXXX-1234`) prior to database persistence
          </p>
        </div>
      </div>

      {banner && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-blue-900 text-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="font-medium">{banner}</span>
          </div>
          <button
            onClick={() => setBanner(null)}
            className="text-xs font-semibold text-blue-700 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="KYC Verified Students"
          value={verifiedCount}
          subtitle="Eligible for Sec 10A E-Sign"
          icon={<UserCheck className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Pending Officer Review"
          value={pendingCount}
          subtitle="SLA target: < 15 minutes"
          icon={<FileWarning className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Aadhaar Redaction Rate"
          value="100%"
          subtitle="UIDAI Masked Aadhaar Standard"
          icon={<Fingerprint className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Campus Roll Nos Synced"
          value={records.length}
          subtitle="PCTE, PAU & GNDEC Registrars"
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Student Identity & Institutional Bonafide Queue
            </h2>
            <p className="text-xs text-text-secondary">
              Required before unlocking Stage 2 Move-In OTP and Punjab Police Form-11 auto-generation
            </p>
          </div>
          <Badge variant="purple">Data Fiduciary: UniNest Governance Cell</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">College Roll No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Masked Aadhaar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Face Match Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{rec.studentName}</div>
                    <div className="text-xs text-text-secondary font-mono">{rec.email}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-semibold text-slate-800">{rec.collegeRollNo}</div>
                    <div className="text-xs text-text-tertiary">{rec.institution}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {rec.maskedAadhaar}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-emerald-700">{rec.faceMatchScore}</span>
                    <div className="text-[11px] text-text-tertiary">Liveness Passed</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {rec.status === 'VERIFIED' ? (
                      <Badge variant="success" dot>VERIFIED</Badge>
                    ) : rec.status === 'PENDING_REVIEW' ? (
                      <Badge variant="warning" dot>PENDING_REVIEW</Badge>
                    ) : (
                      <Badge variant="danger" dot>REUPLOAD_REQUESTED</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {rec.status !== 'VERIFIED' && (
                        <button
                          onClick={() => handleApprove(rec.id, rec.studentName, rec.maskedAadhaar)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve KYC
                        </button>
                      )}
                      <button
                        onClick={() => handleRequestReupload(rec.id, rec.studentName)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-white text-slate-700 text-xs font-semibold hover:bg-surface-secondary transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Request Re-Upload
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
