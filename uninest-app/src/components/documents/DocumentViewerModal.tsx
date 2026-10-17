'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, Badge } from '@/components/ui/Shared';
import { Download, Printer, X, ShieldCheck, FileText, Smartphone, ExternalLink, CheckCircle2 } from 'lucide-react';
import { DocumentPDFData, downloadDocumentPDF, generateDocumentHTML } from '@/lib/pdfGenerator';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: DocumentPDFData | null;
}

export function DocumentViewerModal({ isOpen, onClose, doc }: DocumentViewerModalProps) {
  const [viewMode, setViewMode] = useState<'CARD' | 'PDF'>('CARD');

  if (!doc) return null;

  const handleDownload = () => {
    downloadDocumentPDF(doc);
  };

  const handlePrint = () => {
    const htmlContent = generateDocumentHTML(doc);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const htmlPreview = generateDocumentHTML(doc);

  const handleOpenNewTab = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlPreview);
      newWindow.document.close();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="">
      <div className="flex flex-col h-full space-y-3 -mt-2 w-full max-w-full min-w-0 overflow-x-hidden">
        {/* Modal Top Bar: Badges on left, Close ('X') pinned at top right */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md truncate max-w-[180px]">
              {doc.referenceNo}
            </span>
            <Badge variant="success" size="sm">
              {doc.status}
            </Badge>
          </div>

          {/* Guaranteed visible Top-Right Close Button with high touch-target */}
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 active:scale-95"
            aria-label="Close document modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug break-words">
            {doc.title}
          </h2>
        </div>

        {/* View Mode Switcher Pills (Mobile Optimized) */}
        <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('CARD')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === 'CARD'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mobile View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('PDF')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                viewMode === 'PDF'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official e-Stamp PDF</span>
            </button>
          </div>

          {/* Action buttons (Print & Download) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1 border-slate-300 hover:bg-white px-2.5 py-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm px-3 py-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'CARD' ? (
          /* Native High-Performance Mobile Card (Zero Iframe Overflow Risk) */
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-5 space-y-3.5 overflow-y-auto max-h-[58vh] sm:max-h-[64vh] min-w-0">
            {/* Amount & Status Card */}
            {doc.amount && (
              <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Amount Settled</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">{doc.amount}</span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    PAID & ISSUED
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{doc.issueDate}</span>
                </div>
              </div>
            )}

            {/* Key Information Grid */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Tenant Full Name:</span>
                  <span className="font-extrabold text-slate-900">{doc.tenantName || 'Rahul Sharma'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Assigned Property & Room:</span>
                  <span className="font-extrabold text-slate-900">{doc.roomDetails || 'PCTE Smart Residency (Room 204)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Issuing Authority / Desk:</span>
                  <span className="font-extrabold text-slate-900">{doc.issuer}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Issue Date:</span>
                  <span className="font-extrabold text-slate-900">{doc.issueDate}</span>
                </div>
                {doc.paymentMethod && (
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Payment Method:</span>
                    <span className="font-bold text-slate-800">{doc.paymentMethod}</span>
                  </div>
                )}
                {doc.transactionId && (
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Gateway Txn / UTR:</span>
                    <span className="font-mono text-indigo-700 font-bold break-all">{doc.transactionId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Official e-Sign Guarantee Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Legally Binding Digital Document (Indian IT Act 2000)</span>
              </div>
              <p className="text-emerald-700 leading-relaxed text-[10px]">
                This record has been authenticated and cryptographically hashed with UniNest Escrow Engine.
              </p>
            </div>

            {/* Mobile Actions in Card View */}
            <div className="flex sm:hidden items-center gap-2 pt-1">
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="flex-1 font-bold text-xs flex items-center justify-center gap-1.5 border-slate-300 hover:bg-slate-100 py-2 rounded-xl"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </Button>
              <Button
                onClick={handleDownload}
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm py-2 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Official e-Stamp PDF View (Constrained Iframe with 0 Horizontal Overflow) */
          <div className="bg-slate-100 p-1 sm:p-2 rounded-2xl border border-slate-200 shadow-inner overflow-hidden w-full max-w-full min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[54vh] sm:h-[62vh] w-full max-w-full min-w-0 relative">
              <iframe
                srcDoc={htmlPreview}
                title={doc.title}
                className="w-full h-full border-0 block"
                style={{
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  height: '100%',
                  border: 'none',
                }}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          </div>
        )}

        {/* Footer Info with One-Tap Fullscreen View */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate text-[11px]">UniNest ISO 27001 Document Vault</span>
          </div>
          <button
            onClick={handleOpenNewTab}
            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline text-[11px] flex items-center gap-1 shrink-0 ml-2"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </Modal>
  );
}

