'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Lock,
  KeyRound,
  FileSignature,
  Fingerprint,
  CheckCircle2,
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action:
    | 'STAGE_1_VISIT_OTP_VERIFIED'
    | 'SEC_10A_LEASE_ESIGNED'
    | 'UPI_UTR_ESCROW_LOCKED'
    | 'STAGE_2_MOVEIN_ESCROW_RELEASED'
    | 'FORM_11_POLICE_FILED'
    | 'MASKED_AADHAAR_KYC_VERIFIED';
  category: 'ESCROW' | 'HANDSHAKE' | 'COMPLIANCE' | 'KYC';
  resource: string;
  ipAddress: string;
  sha256Hash: string;
}

const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-2026-9012',
    timestamp: '26 Sep 2026, 11:42:18 IST',
    actor: 'Rahul Sharma',
    actorRole: 'STUDENT (rahul@uninest.in)',
    action: 'UPI_UTR_ESCROW_LOCKED',
    category: 'ESCROW',
    resource: 'RES-PCTE-88902 • UTR #626918402914 (₹399 Hold)',
    ipAddress: '103.154.228.19',
    sha256Hash: '0x9f84c2e1...7b31a8d4',
  },
  {
    id: 'AUD-2026-9011',
    timestamp: '25 Sep 2026, 17:14:05 IST',
    actor: 'Vikram Singh',
    actorRole: 'LANDLORD (landlord@uninest.in)',
    action: 'STAGE_1_VISIT_OTP_VERIFIED',
    category: 'HANDSHAKE',
    resource: 'RES-ADV-45019 • 4-Digit Visit PIN #5290 Matched',
    ipAddress: '117.211.94.108',
    sha256Hash: '0x4a19d8b3...e022c491',
  },
  {
    id: 'AUD-2026-9010',
    timestamp: '25 Sep 2026, 17:28:49 IST',
    actor: 'Rahul Sharma',
    actorRole: 'STUDENT (rahul@uninest.in)',
    action: 'SEC_10A_LEASE_ESIGNED',
    category: 'COMPLIANCE',
    resource: 'AGR-2026-45019 • Tripartite Lease Executed (IT Act Sec 10A)',
    ipAddress: '103.154.228.19',
    sha256Hash: '0x88c3b1f0...91a45e2c',
  },
  {
    id: 'AUD-2026-9009',
    timestamp: '25 Sep 2026, 14:10:33 IST',
    actor: 'PCTE Housing Cell',
    actorRole: 'COLLEGE (pcte@uninest.in)',
    action: 'FORM_11_POLICE_FILED',
    category: 'COMPLIANCE',
    resource: 'LDH-POL-F11-2026-8841 • PS Sadar Ludhiana Dossier',
    ipAddress: '14.139.240.55',
    sha256Hash: '0x3d77e901...5c68a112',
  },
  {
    id: 'AUD-2026-9008',
    timestamp: '24 Sep 2026, 11:22:09 IST',
    actor: 'UniNest Escrow Officer',
    actorRole: 'ADMIN (admin@uninest.in)',
    action: 'MASKED_AADHAAR_KYC_VERIFIED',
    category: 'KYC',
    resource: 'KYC-2026-401 • Aadhaar XXXX-XXXX-4821 (DPDP Act Redacted)',
    ipAddress: '122.173.44.201',
    sha256Hash: '0x7b21f409...2e99d304',
  },
  {
    id: 'AUD-2026-9007',
    timestamp: '20 Sep 2026, 15:10:44 IST',
    actor: 'Vikram Singh',
    actorRole: 'LANDLORD (landlord@uninest.in)',
    action: 'STAGE_2_MOVEIN_ESCROW_RELEASED',
    category: 'ESCROW',
    resource: 'RES-PCTE-77410 • 6-Digit Key #641908 • ₹6,000 Released',
    ipAddress: '117.211.94.108',
    sha256Hash: '0x6e08a552...1f44b890',
  },
  {
    id: 'AUD-2026-9006',
    timestamp: '19 Sep 2026, 18:05:12 IST',
    actor: 'QuickFix Services',
    actorRole: 'PROVIDER (provider@uninest.in)',
    action: 'STAGE_1_VISIT_OTP_VERIFIED',
    category: 'HANDSHAKE',
    resource: 'MNT-2026-004 • RO Filter SLA Job Sign-Off Verified',
    ipAddress: '49.36.188.92',
    sha256Hash: '0x2c91d773...8a30e115',
  },
];

export default function AdminAuditLogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredLogs =
    selectedCategory === 'ALL'
      ? AUDIT_LOGS
      : AUDIT_LOGS.filter((log) => log.category === selectedCategory);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Immutable Cryptographic Security & Escrow Audit Log
            </h1>
            <Badge variant="purple" dot>
              SHA-256 Hash Chained
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Tamper-evident ledger of Two-Stage OTP Handshakes, UPI UTR Escrow Locks, Section 10A E-Signatures, and DPDP Masked Aadhaar KYC events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'ESCROW', 'HANDSHAKE', 'COMPLIANCE', 'KYC'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cryptographic Events"
          value={AUDIT_LOGS.length}
          subtitle="Append-only immutable log"
          icon={<Shield className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="OTP Handshakes Logged"
          value="100%"
          subtitle="Stage 1 (4-digit) & Stage 2 (6-digit)"
          icon={<KeyRound className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Sec 10A Lease Hashes"
          value="Verified"
          subtitle="IT Act 2000 non-repudiation"
          icon={<FileSignature className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="DPDP Redaction Audit"
          value="Zero Leaks"
          subtitle="Masked Aadhaar enforced"
          icon={<Fingerprint className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Event ID & Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Cryptographic Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Target Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">IP & SHA-256 Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-xs text-brand-700">{log.id}</div>
                    <div className="text-xs text-text-tertiary">{log.timestamp}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{log.actor}</div>
                    <div className="text-xs text-text-secondary font-mono">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        log.category === 'ESCROW'
                          ? 'success'
                          : log.category === 'HANDSHAKE'
                          ? 'info'
                          : log.category === 'COMPLIANCE'
                          ? 'purple'
                          : 'warning'
                      }
                      dot
                    >
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">{log.resource}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-mono text-xs text-slate-800">{log.sha256Hash}</div>
                    <div className="text-[11px] text-text-tertiary font-mono">IP: {log.ipAddress}</div>
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
