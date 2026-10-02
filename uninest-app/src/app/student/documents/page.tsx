'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Download, ShieldCheck, CheckCircle2, Eye, Search, Filter,
  Building2, ExternalLink, Sparkles, FolderLock, PlusCircle, Lock, Users
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { downloadDocumentPDF, DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

export default function MyDocumentsPage() {
  const { userEmail: ctxEmail, isDemoUser: ctxIsDemo } = useDashboardUser();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [documents, setDocuments] = useState<DocumentPDFData[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [downloadedDoc, setDownloadedDoc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocuments() {
      setLoading(true);
      try {
        const res = await fetch('/api/demo/documents?role=STUDENT');
        if (res.ok) {
          const data = await res.json();
          if (data.documents && Array.isArray(data.documents)) {
            setDocuments(data.documents);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching student documents from API:', err);
      }

      // Fallback if API fails
      setDocuments([]);
      setLoading(false);
    }

    loadDocuments();
  }, [ctxEmail]);

  const categories = [
    { key: 'ALL', label: 'All Documents' },
    { key: 'AGREEMENT', label: 'Leases & Agreements' },
    { key: 'RECEIPT', label: 'Rent & Deposits' },
    { key: 'KYC', label: 'Identity & KYC' },
    { key: 'COLLEGE', label: 'College NOC' },
    { key: 'AUDIT', label: 'Move-In Audits' },
    { key: 'PROPERTY', label: 'Landlord Notices & Rules' },
  ];

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
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-proof repository for rental agreements, escrow deposit receipts, KYC audits, and landlord notices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            Blockchain / Hash Verified
          </span>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl shrink-0">
            <FolderLock className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCat(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border ${
              selectedCat === cat.key
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
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
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading verified student documents...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
          <p className="text-sm text-slate-500">No documents found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc: any) => (
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
                  <div className="flex items-center gap-1.5">
                    {doc.uploadedByRole === 'LANDLORD' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                        <Users className="w-3 h-3" /> Shared by Landlord
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                        <Lock className="w-3 h-3 text-emerald-600" /> Platform Verified
                      </span>
                    )}
                    <Badge variant={doc.status === 'VERIFIED' || doc.status === 'SIGNED' || doc.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                      {doc.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Issuer: <span className="font-semibold text-slate-700">{doc.issuer}</span>
                  {doc.property && <span className="ml-1 text-slate-400">({doc.property})</span>}
                </p>
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
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={selectedDoc}
      />
    </div>
  );
}
