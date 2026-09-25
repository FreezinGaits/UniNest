'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, FileCheck, Download, Eye, CheckCircle2 } from 'lucide-react';
import { downloadDocumentPDF, DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';

interface ComplianceRecord {
  id: string;
  tenantName: string;
  property: string;
  idType: string;
  policeAckNo: string;
  status: string;
  submittedAt: string;
}

const INITIAL_RECORDS: ComplianceRecord[] = [
  {
    id: 'tv-1',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204, Bed B)',
    idType: 'Aadhaar Card + Student ID',
    policeAckNo: 'POL-LDH-2026-8819',
    status: 'VERIFIED',
    submittedAt: '12 Aug 2026',
  },
  {
    id: 'tv-2',
    tenantName: 'Aman Verma',
    property: 'Passi Luxury PG & Co-Living (Room 102)',
    idType: 'Aadhaar Card + Passport',
    policeAckNo: 'POL-LDH-2026-9042',
    status: 'VERIFIED',
    submittedAt: '20 Aug 2026',
  },
  {
    id: 'tv-3',
    tenantName: 'Priya Sharma',
    property: 'Campus Edge Girls Hostel (Room 301)',
    idType: 'Voter ID Card',
    policeAckNo: 'POL-LDH-2026-9501',
    status: 'IN_REVIEW',
    submittedAt: '01 Sep 2026',
  },
];

export default function TenantVerificationPoliceClearancePage() {
  const [records] = useState<ComplianceRecord[]>(INITIAL_RECORDS);
  const [previewDoc, setPreviewDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  function handleDownloadPoliceForm(record: ComplianceRecord) {
    const docData: DocumentPDFData = {
      id: `doc-police-${record.id}`,
      title: `Punjab Police Tenant Verification Registration (Form-11)`,
      category: 'POLICE',
      referenceNo: record.policeAckNo,
      issueDate: record.submittedAt,
      fileSize: '410 KB',
      status: record.status,
      issuer: 'Punjab Police Commissionerate • Ludhiana',
      tenantName: record.tenantName,
      roomDetails: record.property,
    };
    downloadDocumentPDF(docData);
  }

  function handlePreviewPoliceForm(record: ComplianceRecord) {
    const docData: DocumentPDFData = {
      id: `doc-police-${record.id}`,
      title: `Punjab Police Tenant Verification Registration (Form-11)`,
      category: 'POLICE',
      referenceNo: record.policeAckNo,
      issueDate: record.submittedAt,
      fileSize: '410 KB',
      status: record.status,
      issuer: 'Punjab Police Commissionerate • Ludhiana',
      tenantName: record.tenantName,
      roomDetails: record.property,
    };
    setPreviewDoc(docData);
    setIsViewerOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Police Verification & Compliance</h1>
          <p className="text-text-secondary mt-1">
            Track municipal police clearance slips, download pre-filled Form-11 registration certificates, and inspect student Aadhaar e-KYC submissions.
          </p>
          <p className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mt-2 font-medium">
            ⚠️ Disclaimer: UniNest standardizes document collection & submission workflows. Official tenant background verification remains strictly with the relevant municipal or police authority.
          </p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl shrink-0">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Submitted Document</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Police Ref / Ack No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Filing Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-surface-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{r.tenantName}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{r.property}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-medium">{r.idType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-blue-700 font-semibold">{r.policeAckNo}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-tertiary text-xs">{r.submittedAt}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreviewPoliceForm(r)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
                        title="View Pre-Filled Form-11 Certificate"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPoliceForm(r)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors flex items-center gap-1 border border-blue-200"
                        title="Download Certificate PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Document Viewer Modal for Police Forms */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={previewDoc}
      />
    </div>
  );
}
