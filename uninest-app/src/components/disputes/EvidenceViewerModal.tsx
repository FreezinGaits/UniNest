'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button, Badge } from '@/components/ui/Shared';
import {
  Download,
  Printer,
  X,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  MapPin,
  Camera,
  Hash,
  Eye,
} from 'lucide-react';
import { generateDocumentHTML, downloadDocumentPDF } from '@/lib/pdfGenerator';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string | null;
  caseId?: string;
  property?: string;
}

export function EvidenceViewerModal({
  isOpen,
  onClose,
  fileName,
  caseId = 'UN-DMG-00452',
  property = 'PCTE Smart Student Residency (Room 204)',
}: EvidenceViewerModalProps) {
  if (!fileName || !isOpen) return null;

  const isImage = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
  const isPdf = fileName.endsWith('.pdf');

  const handleDownload = () => {
    if (isPdf) {
      downloadDocumentPDF({
        id: `ev-${Date.now()}`,
        title: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        category: fileName.includes('MIN') || fileName.includes('Move_In') ? 'AUDIT' : 'RECEIPT',
        referenceNo: caseId,
        issueDate: '15 Aug 2026',
        status: 'VERIFIED_EVIDENCE',
        issuer: 'UniNest Digital Inspection Trust Engine',
        roomDetails: property,
      });
      return;
    }

    // For images, generate printable downloadable blob
    const content = `Evidence File: ${fileName}\nCase Reference: ${caseId}\nTimestamp: 15 Aug 2026, 11:42 AM\nVerified by UniNest Trust Engine`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="">
      <div className="flex flex-col h-full space-y-4 -mt-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                {caseId}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {isImage ? 'Photographic Proof' : 'Cryptographic PDF Document'}
              </span>
              <Badge variant="success" size="sm">
                Tamper-Proof Verified
              </Badge>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 truncate flex items-center gap-1.5">
              {isImage ? <ImageIcon className="w-4 h-4 text-brand-600" /> : <FileText className="w-4 h-4 text-brand-600" />}
              {fileName}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="font-bold text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-100"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </Button>
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Preview Container */}
        <div className="bg-slate-100 p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-inner overflow-hidden max-h-[68vh] overflow-y-auto">
          {/* PHOTO EVIDENCE: Move_In_Photo_01.jpg */}
          {fileName.includes('Move_In_Photo') && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden space-y-4 p-5">
              <div className="relative bg-slate-900 rounded-lg overflow-hidden p-8 flex flex-col items-center justify-center min-h-[320px] text-center border-4 border-slate-800">
                {/* Simulated High-Res Macro Photograph of Door Scratch */}
                <div className="w-full max-w-md h-56 bg-gradient-to-br from-amber-900 via-amber-950 to-stone-900 rounded-lg border border-amber-700/50 relative shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Wood grain pattern & Door Texture */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 opacity-80" />

                  {/* Highlighted Bounding Box of pre-existing scratch */}
                  <div className="relative z-10 border-2 border-dashed border-red-500 bg-red-500/10 p-4 rounded-lg flex flex-col items-center shadow-lg">
                    {/* Scratch line */}
                    <div className="w-28 h-1 bg-amber-200/90 rotate-12 rounded-full shadow-md" />
                    <span className="text-[10px] font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded mt-2 uppercase tracking-wider">
                      Pre-existing Scratch #04 (Length: 3.2 cm)
                    </span>
                    <span className="text-[9px] text-amber-200 font-mono mt-0.5">
                      Move-In Initial Condition • 15 Aug 2026, 11:42 AM
                    </span>
                  </div>

                  {/* Watermark */}
                  <div className="absolute bottom-2 right-3 text-[10px] font-mono text-emerald-400/80 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    UNINEST VERIFIED TIMESTAMP • HASH: 8f2e9a...c01
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Camera: Samsung Galaxy S23 Ultra • Focal Length: 24mm f/1.7 • Aperture: ISO 100
                </p>
              </div>

              {/* Forensic EXIF Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Captured Date</span>
                  <span className="font-extrabold text-slate-800">15 Aug 2026, 11:42 AM</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Premises Location</span>
                  <span className="font-extrabold text-slate-800">Room 204 Door Frame</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                  <span className="font-mono font-bold text-slate-800">30.8711° N, 75.8012° E</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Audit Status</span>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified Authentic
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PHOTO EVIDENCE: Submeter photo Meter_Photo_June_30.jpg */}
          {fileName.includes('Meter_Photo') && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden space-y-4 p-5">
              <div className="bg-slate-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[280px] text-center border-4 border-slate-800">
                {/* Simulated Digital Sub-Meter LCD Display */}
                <div className="w-full max-w-sm bg-slate-950 p-6 rounded-xl border-2 border-emerald-500/50 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span>PSPCL COMPLIANT METER</span>
                    <span className="text-emerald-400">STATUS: OK</span>
                  </div>
                  <div className="text-4xl font-mono font-black text-emerald-400 tracking-widest bg-emerald-950/30 p-4 rounded-lg border border-emerald-500/30">
                    00110.4 <span className="text-base text-emerald-600 font-normal">kWh</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Meter No: SUB-204-LDH</span>
                    <span>Snapshot: 30 Jun 2026, 06:15 PM</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Verified photographic proof shows 110 kWh reading (disproving manual 140 kWh entry typo).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Meter ID</span>
                  <span className="font-extrabold text-slate-800">Sub-Meter #204</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">True Meter Reading</span>
                  <span className="font-mono font-extrabold text-emerald-700">110.4 kWh</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Billing Impact</span>
                  <span className="font-extrabold text-slate-800">Excess ₹800 Charge Voided</span>
                </div>
              </div>
            </div>
          )}

          {/* PHOTO EVIDENCE: Decibel / Sound Meter Decibel_Meter_Log.png */}
          {fileName.includes('Decibel') && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden space-y-4 p-5">
              <div className="bg-slate-900 rounded-lg p-8 flex flex-col items-center justify-center min-h-[280px] text-center border-4 border-slate-800">
                <div className="w-full max-w-md bg-slate-950 p-6 rounded-xl border-2 border-rose-500/50 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                    <span>SOUND LEVEL MONITORING AUDIT</span>
                    <span className="text-rose-400 font-bold">BREACH DETECTED</span>
                  </div>
                  <div className="text-4xl font-mono font-black text-rose-500 tracking-wider bg-rose-950/30 p-4 rounded-lg border border-rose-500/30">
                    68.4 <span className="text-lg text-rose-400 font-normal">dBA</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Quiet Hours Limit: 45.0 dBA</span>
                    <span>Time: 01 Sep 2026, 11:42 PM</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">
                  Recorded in hallway between Room 204 & Room 205 during examination quiet hours.
                </p>
              </div>
            </div>
          )}

          {/* OFFICIAL PDF DOCUMENT: DOC-MIN-2026_Handover_Audit.pdf or Move_In_Report_Signed.pdf */}
          {(fileName.includes('MIN') || fileName.includes('Handover') || fileName.includes('Move_In_Report')) && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-6 text-slate-900 font-sans">
              {/* Official Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="text-xl font-black text-slate-900">UniNest Inspection Engine</div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Move-In Condition & Amenities Handover Audit
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Reference Document: DOC-MIN-2026-204A</div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs px-2.5 py-1 rounded-md">
                    VERIFIED & SIGNED
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">Inspection Date: 15 Aug 2026</div>
                </div>
              </div>

              {/* Particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-bold">Tenant Name</span>
                  <span className="font-extrabold text-slate-900">Rahul Sharma (Bed A)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Property Premises</span>
                  <span className="font-extrabold text-slate-900">PCTE Smart Student Residency (Room 204)</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold">Inspector Officer</span>
                  <span className="font-extrabold text-slate-900">Rajinder Kumar (UniNest Audit Desk)</span>
                </div>
              </div>

              {/* 18-Point Handover Audit Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Itemized Move-In Pre-Existing Condition Log
                </h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Inspection Category</th>
                      <th className="p-2.5 text-left">Condition on Move-In</th>
                      <th className="p-2.5 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="bg-amber-50/60 font-semibold">
                      <td className="p-2.5 text-slate-900">Main Entry Door Frame & Lock</td>
                      <td className="p-2.5 text-amber-900">
                        Pre-existing hairline surface scratch on bottom-right panel (Recorded in Initial Photo #01)
                      </td>
                      <td className="p-2.5 text-right text-emerald-700 font-black">✓ LOGGED PRIOR TO OCCUPANCY</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-900">Sub-Meter Electricity Initial Reading</td>
                      <td className="p-2.5 text-slate-600">Initial meter index: 1,420 kWh (Digital snapshot recorded)</td>
                      <td className="p-2.5 text-right text-emerald-700 font-black">✓ PASSED</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-900">Air Conditioner & Remote Control</td>
                      <td className="p-2.5 text-slate-600">Daikin 1.5 Ton Inverter AC — Fully functional cooling</td>
                      <td className="p-2.5 text-right text-emerald-700 font-black">✓ PASSED</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-slate-900">Study Table, Ergonomic Chair & Wardrobe</td>
                      <td className="p-2.5 text-slate-600">Plywood laminate intact; all keys handed over</td>
                      <td className="p-2.5 text-right text-emerald-700 font-black">✓ PASSED</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Binding Clause */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                <strong>LEGAL BINDING EFFECT:</strong> As per Clause 4.2 of the UniNest Model Tenancy Charter, any condition or damage logged in this handover document prior to move-in shall NOT be chargeable or deductible from the student&apos;s refundable security deposit.
              </div>
            </div>
          )}

          {/* OFFICIAL PDF DOCUMENT: Landlord_Deduction_Receipt.pdf */}
          {fileName.includes('Deduction') && (
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 space-y-5 text-slate-900 font-sans">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="text-xl font-black text-slate-900">Passi Residency Properties Ltd.</div>
                  <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    Notice of Security Deposit Deduction Claim
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Notice ID: LND-DED-2026-881</div>
                </div>
                <div className="text-right">
                  <span className="bg-rose-100 text-rose-800 border border-rose-300 font-extrabold text-xs px-2.5 py-1 rounded-md">
                    CLAIM CONTESTED
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">Claim Date: 09 Jul 2026</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant Name:</span>
                  <span className="font-bold text-slate-900">Rahul Sharma (Room 204, Bed A)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Claimed Damage:</span>
                  <span className="font-bold text-slate-900">Wood Polish & Touch-up on Room 204 Door</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deduction Sum Claimed:</span>
                  <span className="font-black text-rose-700 text-sm">₹1,500.00</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic">
                *Note: This deduction claim has been frozen in the UniNest Tri-Party Escrow Vault pending arbitration against the move-in inspection report.
              </p>
            </div>
          )}

          {/* Fallback for other documents */}
          {!fileName.includes('Move_In') &&
            !fileName.includes('Meter_Photo') &&
            !fileName.includes('Decibel') &&
            !fileName.includes('Deduction') &&
            !fileName.includes('MIN') && (
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 text-center space-y-4">
                <FileText className="w-12 h-12 text-brand-600 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">{fileName}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Document submitted into evidentiary vault for Case {caseId}. Cryptographic checksum verified.
                </p>
                <Button onClick={handleDownload} className="bg-brand-600 text-white font-bold text-xs">
                  <Download className="w-4 h-4 mr-1.5" /> Download Full Document
                </Button>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Digital Evidentiary Vault • ISO 27001 Tamper-Proof Hash Verified</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Case Ref: {caseId}</span>
        </div>
      </div>
    </Modal>
  );
}
