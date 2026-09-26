'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  FileCheck,
  Building2,
  CheckCircle2,
  MapPin,
  Stamp,
  Clock,
} from 'lucide-react';

interface PoliceForm11Filing {
  id: string;
  acknowledgmentNo: string;
  tenantName: string;
  tenantEmail: string;
  maskedAadhaar: string;
  landlordName: string;
  propertyName: string;
  policeStation: 'PS Sadar Ludhiana' | 'PS Sarabha Nagar' | 'PS PAU';
  filedDate: string;
  status: 'SEALED_BY_COMMISSIONERATE' | 'PENDING_SEAL';
}

const INITIAL_FILINGS: PoliceForm11Filing[] = [
  {
    id: 'F11-01',
    acknowledgmentNo: 'LDH-POL-F11-2026-8841',
    tenantName: 'Rahul Sharma',
    tenantEmail: 'rahul@uninest.in',
    maskedAadhaar: 'XXXX-XXXX-4821',
    landlordName: 'Vikram Singh',
    propertyName: 'PCTE Smart Student Residency (Room 204-A)',
    policeStation: 'PS Sadar Ludhiana',
    filedDate: '25 Sep 2026',
    status: 'SEALED_BY_COMMISSIONERATE',
  },
  {
    id: 'F11-02',
    acknowledgmentNo: 'LDH-POL-F11-2026-8894',
    tenantName: 'Aman Verma',
    tenantEmail: 'aman.verma@pcte.edu.in',
    maskedAadhaar: 'XXXX-XXXX-9104',
    landlordName: 'Vikram Singh',
    propertyName: 'PCTE Smart Student Residency (Room 202-B)',
    policeStation: 'PS Sadar Ludhiana',
    filedDate: '20 Sep 2026',
    status: 'SEALED_BY_COMMISSIONERATE',
  },
  {
    id: 'F11-03',
    acknowledgmentNo: 'LDH-POL-F11-2026-8912',
    tenantName: 'Simran Kaur',
    tenantEmail: 'simran.kaur@pcte.edu.in',
    maskedAadhaar: 'XXXX-XXXX-3318',
    landlordName: 'Vikram Singh',
    propertyName: 'PAU Green Avenue Scholars Hub (Room 108-A)',
    policeStation: 'PS PAU',
    filedDate: '26 Sep 2026',
    status: 'PENDING_SEAL',
  },
  {
    id: 'F11-04',
    acknowledgmentNo: 'LDH-POL-F11-2026-8937',
    tenantName: 'Karanveer Gill',
    tenantEmail: 'karanveer.gill@gndec.ac.in',
    maskedAadhaar: 'XXXX-XXXX-7742',
    landlordName: 'Gurpreet Kaur',
    propertyName: 'Sarabha Executive Student Suites (Room 104-A)',
    policeStation: 'PS Sarabha Nagar',
    filedDate: '26 Sep 2026',
    status: 'PENDING_SEAL',
  },
];

export default function AdminTenantVerificationPage() {
  const [filings, setFilings] = useState<PoliceForm11Filing[]>(INITIAL_FILINGS);
  const [sealMessage, setSealMessage] = useState<string | null>(null);

  const handleApproveAndSeal = (id: string, ackNo: string, tenantName: string, station: string) => {
    setFilings((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: 'SEALED_BY_COMMISSIONERATE' } : f
      )
    );
    setSealMessage(
      `Form-11 Receipt #${ackNo} for ${tenantName} sealed and transmitted to ${station} (Ludhiana Police Commissionerate).`
    );
  };

  const sealedCount = filings.filter((f) => f.status === 'SEALED_BY_COMMISSIONERATE').length;
  const pendingCount = filings.filter((f) => f.status === 'PENDING_SEAL').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-text-primary">
              Punjab Police Form-11 Tenant Verification Registry
            </h1>
            <Badge variant="info" dot>
              Ludhiana Police Commissionerate
            </Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Statutory Section 188 IPC / BNS compliance — auto-populated from Masked Aadhaar KYC and Tripartite Lease Execution
          </p>
        </div>
      </div>

      {sealMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <Stamp className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{sealMessage}</span>
          </div>
          <button
            onClick={() => setSealMessage(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Form-11 Filings"
          value={filings.length}
          subtitle="Mandatory outstation student registry"
          icon={<FileCheck className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Sealed & Acknowledged"
          value={sealedCount}
          subtitle="Verified with Police Saanjh Kendra"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Awaiting Officer Seal"
          value={pendingCount}
          subtitle="Auto-triggered on Move-In Key"
          icon={<Clock className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Jurisdictions Covered"
          value="3 Stations"
          subtitle="PS Sadar, PS PAU, PS Sarabha Nagar"
          icon={<MapPin className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <Card padding="none">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-secondary/40">
          <div>
            <h2 className="text-base font-bold text-text-primary">
              Ludhiana Police Commissionerate — Tenant Intimation Dossiers
            </h2>
            <p className="text-xs text-text-secondary">
              Protects landlords and students under municipal PG registration norms
            </p>
          </div>
          <Badge variant="success">Saanjh Kendra Digital Integration</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Acknowledgment No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Landlord & Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Police Jurisdiction</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Statutory Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filings.map((f) => (
                <tr key={f.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-slate-900">{f.acknowledgmentNo}</div>
                    <div className="text-xs text-text-tertiary">Filed: {f.filedDate}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-900">{f.tenantName}</div>
                    <div className="text-xs text-text-secondary font-mono">
                      Aadhaar: {f.maskedAadhaar}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-900">{f.propertyName}</div>
                    <div className="text-xs text-text-secondary">Owner: {f.landlordName}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant="info">{f.policeStation}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    {f.status === 'SEALED_BY_COMMISSIONERATE' ? (
                      <Badge variant="success" dot>SEALED & FILED</Badge>
                    ) : (
                      <Badge variant="warning" dot>PENDING_SEAL</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {f.status === 'PENDING_SEAL' ? (
                      <button
                        onClick={() =>
                          handleApproveAndSeal(
                            f.id,
                            f.acknowledgmentNo,
                            f.tenantName,
                            f.policeStation
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        Approve & Seal Form-11 Receipt
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Form-11 Sealed
                      </span>
                    )}
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
