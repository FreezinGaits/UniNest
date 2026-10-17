'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, Badge } from '@/components/ui/Shared';
import { Download, Printer, X, ShieldCheck } from 'lucide-react';
import { DocumentPDFData, downloadDocumentPDF, generateDocumentHTML } from '@/lib/pdfGenerator';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: DocumentPDFData | null;
}

export function DocumentViewerModal({ isOpen, onClose, doc }: DocumentViewerModalProps) {
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
      <div className="flex flex-col h-full space-y-3 -mt-2 w-full max-w-full min-w-0">
        {/* Modal Top Bar: Badges on left, Close ('X') pinned at top right */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md truncate max-w-[200px]">
              {doc.referenceNo}
            </span>
            <Badge variant="success" size="sm">
              {doc.status}
            </Badge>
          </div>

          {/* Guaranteed visible Top-Right Close Button */}
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Close document modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-snug break-words">
            {doc.title}
          </h2>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial font-bold text-xs flex items-center justify-center gap-1.5 border-slate-300 hover:bg-slate-100 px-3 py-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm px-3.5 py-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Live Document Preview Frame (100% Mobile Responsive Container) */}
        <div className="bg-slate-100 p-1 sm:p-3 rounded-2xl border border-slate-200 shadow-inner overflow-hidden w-full max-w-full min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[58vh] sm:h-[65vh] w-full max-w-full min-w-0 relative">
            <iframe
              srcDoc={htmlPreview}
              title={doc.title}
              className="w-full h-full border-0 block"
              style={{
                width: '100%',
                minWidth: '100%',
                maxWidth: '100%',
                height: '100%',
                border: 'none',
              }}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* Clean Footer Info with New Tab Fallback */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Encrypted e-Signed Document • UniNest Trust Engine</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-[11px]">
            <button
              onClick={handleOpenNewTab}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Open in New Window ↗
            </button>
            <span className="text-slate-400 font-mono">ID: {doc.id}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

