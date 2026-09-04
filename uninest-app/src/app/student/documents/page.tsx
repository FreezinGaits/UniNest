'use client';

import React, { useState } from 'react';
import {
  FileText, Download, ShieldCheck, CheckCircle2, Eye, Search, Filter,
  Building2, ExternalLink, Sparkles, FolderLock
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';

interface DocumentItem {
  id: string;
  title: string;
  category: 'AGREEMENT' | 'RECEIPT' | 'KYC' | 'COLLEGE' | 'AUDIT';
  referenceNo: string;
  issueDate: string;
  fileSize: string;
  status: 'VERIFIED' | 'SIGNED' | 'ISSUED';
  issuer: string;
  downloadUrl: string;
}

const DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Student PG Rental Agreement (PCTE Smart Residency)',
    category: 'AGREEMENT',
    referenceNo: 'UN-AGR-2026-8801',
    issueDate: '15 Aug 2026',
    fileSize: '1.4 MB',
    status: 'SIGNED',
    issuer: 'Passi Residency Properties Ltd. & Rahul Sharma',
    downloadUrl: '#',
  },
  {
    id: 'doc-2',
    title: 'August 2026 Monthly Rent Receipt (₹6,000 Paid)',
    category: 'RECEIPT',
    referenceNo: 'UN-RCT-2026-0814',
    issueDate: '01 Sep 2026',
    fileSize: '340 KB',
    status: 'ISSUED',
    issuer: 'Razorpay / UniNest Automated Billing',
    downloadUrl: '#',
  },
  {
    id: 'doc-3',
    title: 'Government Aadhaar KYC Identity Verification',
    category: 'KYC',
    referenceNo: 'UN-KYC-2026-4402',
    issueDate: '10 Aug 2026',
    fileSize: '820 KB',
    status: 'VERIFIED',
    issuer: 'UIDAI / UniNest Identity Trust Engine',
    downloadUrl: '#',
  },
  {
    id: 'doc-4',
    title: 'College Residence & Local Hostel NOC Certificate',
    category: 'COLLEGE',
    referenceNo: 'PCTE-NOC-2026-092',
    issueDate: '12 Aug 2026',
    fileSize: '510 KB',
    status: 'VERIFIED',
    issuer: 'PCTE Institute Student Affairs Desk',
    downloadUrl: '#',
  },
  {
    id: 'doc-5',
    title: 'Move-In Condition & Amenities Handover Audit (Room 204)',
    category: 'AUDIT',
    referenceNo: 'UN-MIN-2026-204A',
    issueDate: '15 Aug 2026',
    fileSize: '2.1 MB',
    status: 'SIGNED',
    issuer: 'UniNest Digital Inspection Team',
    downloadUrl: '#',
  },
];

export default function MyDocumentsPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);

  const categories = ['ALL', 'AGREEMENT', 'RECEIPT', 'KYC', 'COLLEGE', 'AUDIT'];

  const filteredDocs = selectedCat === 'ALL'
    ? DOCUMENTS
    : DOCUMENTS.filter(d => d.category === selectedCat);

  const handleDownload = (title: string) => {
    setDownloadedDoc(title);
    setTimeout(() => {
      setDownloadedDoc(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Documents Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">Secure, tamper-proof repository for rental agreements, rent receipts, and KYC certificates.</p>
        </div>
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl shrink-0">
          <FolderLock className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border ${
              selectedCat === cat
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Download Toast Notification */}
      {downloadedDoc && (
        <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Downloading PDF: <strong>{downloadedDoc}</strong></span>
          </div>
          <span className="text-[11px] text-emerald-200">PDF Ready</span>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {doc.referenceNo}
                </span>
                <Badge variant={doc.status === 'VERIFIED' || doc.status === 'SIGNED' ? 'success' : 'default'} size="sm">
                  {doc.status}
                </Badge>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{doc.title}</h3>
              <p className="text-[11px] text-slate-500">Issuer: {doc.issuer}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Issued: {doc.issueDate} • {doc.fileSize}</span>
              <Button
                onClick={() => handleDownload(doc.title)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
