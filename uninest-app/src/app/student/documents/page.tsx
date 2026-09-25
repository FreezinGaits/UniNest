'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Download, ShieldCheck, CheckCircle2, Eye, Search, Filter,
  Building2, ExternalLink, Sparkles, FolderLock, PlusCircle
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { downloadDocumentPDF, DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';

const INITIAL_DOCUMENTS: DocumentPDFData[] = [
  {
    id: 'doc-1',
    title: 'Student PG Rental Agreement (PCTE Smart Residency)',
    category: 'AGREEMENT',
    referenceNo: 'UN-AGR-2026-8801',
    issueDate: '15 Aug 2026',
    fileSize: '1.4 MB',
    status: 'SIGNED',
    issuer: 'Passi Residency Properties Ltd. & Rahul Sharma',
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
    amount: '₹6,000.00',
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
  },
];

export default function MyDocumentsPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [documents, setDocuments] = useState<DocumentPDFData[]>(INITIAL_DOCUMENTS);
  const [selectedDoc, setSelectedDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);

  useEffect(() => {
    // Load dynamically added invoice receipts from payment activity
    try {
      const stored = localStorage.getItem('uninest_documents_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique stored docs with initial docs
          const existingIds = new Set(INITIAL_DOCUMENTS.map(d => d.id));
          const newDocs = parsed.filter((d: DocumentPDFData) => !existingIds.has(d.id));
          setDocuments([...newDocs, ...INITIAL_DOCUMENTS]);
        }
      }
    } catch (e) {
      console.error('Error loading stored documents:', e);
    }
  }, []);

  const categories = ['ALL', 'AGREEMENT', 'RECEIPT', 'KYC', 'COLLEGE', 'AUDIT'];

  const filteredDocs = selectedCat === 'ALL'
    ? documents
    : documents.filter(d => d.category === selectedCat);

  const handleOpenViewer = (doc: DocumentPDFData) => {
    setSelectedDoc(doc);
    setIsViewerOpen(true);
  };

  const handleDirectDownload = (e: React.MouseEvent, doc: DocumentPDFData) => {
    e.stopPropagation();
    setDownloadedDoc(doc.title);
    downloadDocumentPDF(doc);
    setTimeout(() => {
      setDownloadedDoc(null);
    }, 3000);
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
            <span>Generating & Downloading Official PDF: <strong>{downloadedDoc}</strong></span>
          </div>
          <span className="text-[11px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">PDF Ready & Saved</span>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleOpenViewer(doc)}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {doc.referenceNo}
                </span>
                <Badge variant={doc.status === 'VERIFIED' || doc.status === 'SIGNED' ? 'success' : 'default'} size="sm">
                  {doc.status}
                </Badge>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-500">Issuer: {doc.issuer}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Issued: {doc.issueDate} • {doc.fileSize || '350 KB'}</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenViewer(doc);
                  }}
                  variant="outline"
                  className="border-slate-200 hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  View
                </Button>
                <Button
                  onClick={(e) => handleDirectDownload(e, doc)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={selectedDoc}
      />
    </div>
  );
}


