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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="">
      <div className="flex flex-col h-full space-y-4 -mt-2">
        {/* Modal Header Bar with Actions & Top-Right Close Button */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                {doc.referenceNo}
              </span>
              <Badge variant="success" size="sm">
                {doc.status}
              </Badge>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 leading-snug truncate">{doc.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </Button>
            {/* Top Right Close Button */}
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label="Close document modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Document Preview Frame (Single Clean Scrollbar / No Nested Overflow) */}
        <div className="bg-slate-100 p-2 sm:p-4 rounded-2xl border border-slate-200 shadow-inner overflow-hidden">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden h-[62vh]">
            <iframe
              srcDoc={htmlPreview}
              title={doc.title}
              className="w-full h-full border-none overflow-auto"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>

        {/* Clean Footer Info without 'Close Preview' button */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted e-Signed Document • Verified by UniNest Trust Engine</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">ID: {doc.id}</span>
        </div>
      </div>
    </Modal>
  );
}

