'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import { downloadDocumentPDF, DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  HelpCircle,
  ArrowRight,
  Check,
  X,
  FileText,
  DollarSign,
  Sparkles,
  RefreshCcw,
  CheckCircle,
  Download,
  Eye,
} from 'lucide-react';

export default function RentPaymentsPage() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [rentPaid, setRentPaid] = useState(false);
  const [paidReceiptDoc, setPaidReceiptDoc] = useState<DocumentPDFData | null>(null);
  const [paymentFailMsg, setPaymentFailMsg] = useState(false);
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'GRACE' | 'PLAN' | 'FINANCE' | null>(null);
  const [difficultySubmitted, setDifficultySubmitted] = useState<string | null>(null);

  // Document Viewer state
  const [previewDoc, setPreviewDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  function handlePaySuccess() {
    setRentPaid(true);
    setPaymentFailMsg(false);

    const refNo = `UN-RCT-2026-07${Math.floor(10 + Math.random() * 90)}`;
    const newDoc: DocumentPDFData = {
      id: `doc-rent-${Date.now()}`,
      title: `July 2026 Monthly Rent Receipt (₹6,000 Paid)`,
      category: 'RECEIPT',
      referenceNo: refNo,
      issueDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      fileSize: '340 KB',
      status: 'ISSUED',
      issuer: 'Razorpay / UniNest Automated Billing',
      amount: '₹6,000.00',
      tenantName: 'Rahul Sharma',
      roomDetails: 'CampusNest Residence (Room 102, Bed B)',
      paymentMethod: 'UPI (HDFC Bank XXXX-8921)',
      transactionId: `pay_Pz92kL${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setPaidReceiptDoc(newDoc);

    // Call demo payment backend sync to update DB audit log & payment records
    fetch('/api/demo/payment', { method: 'POST' }).catch((err) =>
      console.warn('Background payment record sync:', err)
    );

    // Save/Upload sample invoice to local storage document store so it appears in Documents Vault
    try {
      const stored = localStorage.getItem('uninest_documents_store');
      const docsArr = stored ? JSON.parse(stored) : [];
      docsArr.unshift(newDoc);
      localStorage.setItem('uninest_documents_store', JSON.stringify(docsArr));
    } catch (e) {
      console.error('Failed to store generated invoice:', e);
    }
  }

  function handlePayFail() {
    setPaymentFailMsg(true);
  }

  function handleViewTxnPDF(title: string, refNo: string, amount: string, date: string, method: string) {
    const docData: DocumentPDFData = {
      id: `doc-txn-${refNo}`,
      title,
      category: 'RECEIPT',
      referenceNo: refNo,
      issueDate: date,
      fileSize: '320 KB',
      status: 'ISSUED',
      issuer: 'Razorpay / UniNest Automated Billing',
      amount,
      tenantName: 'Rahul Sharma',
      roomDetails: 'CampusNest Residence (Room 102, Bed B)',
      paymentMethod: method,
      transactionId: `pay_${refNo.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    };
    setPreviewDoc(docData);
    setIsViewerOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-900/60 px-3 py-1 rounded-full border border-indigo-700/50">
            <CreditCard className="w-3.5 h-3.5" />
            Financial Management & AutoPay
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Rent & Payments</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Manage monthly rent dues, AutoPay mandates, payment receipts, and financial relief options.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Current Balance</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {rentPaid ? '₹0 Dues' : '₹6,000 Due'}
            </span>
          </div>
        </div>
      </div>

      {/* AutoPay Mandate Banner */}
      <Card className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white border-none p-6 shadow-lg rounded-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-extrabold">UPI AutoPay Mandate</h2>
              <Badge variant={autoPayEnabled ? 'success' : 'outline'}>
                {autoPayEnabled ? 'ACTIVE' : 'PAUSED'}
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Next Deduction: <strong className="text-white">5th of next month</strong> · Amount:{' '}
              <strong className="text-white">₹6,000</strong> · Method:{' '}
              <strong className="text-white">UPI AutoPay (HDFC XXXX-8921)</strong>
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className="px-4 py-2.5 text-xs font-extrabold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            >
              {autoPayEnabled ? 'Pause AutoPay Mandate' : 'Enable AutoPay Mandate'}
            </button>
          </div>
        </div>
      </Card>

      {/* Current Month Rent Card */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Current Month Rent Status</span>
        </h2>

        <Card className="p-6 border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  July 2026 Monthly Rent
                </span>
                <Badge variant={rentPaid ? 'success' : 'warning'}>
                  {rentPaid ? '✓ PAID' : 'DUE (Due 5th July)'}
                </Badge>
              </div>
              <p className="text-3xl font-black text-slate-900">{formatINR(600000)}</p>
              <p className="text-xs text-slate-500 font-medium">
                CampusNest Residence · Room 102 (Bed B)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!rentPaid ? (
                <>
                  <button
                    onClick={handlePaySuccess}
                    className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pay ₹6,000 via UPI</span>
                  </button>

                  <button
                    onClick={handlePayFail}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
                  >
                    Simulate Failed Payment
                  </button>

                  <button
                    onClick={() => setDifficultyModalOpen(true)}
                    className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>I Can't Pay Rent</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl font-extrabold text-xs shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Rent Paid · Invoice Uploaded to Vault ({paidReceiptDoc?.referenceNo})</span>
                  </div>
                  {paidReceiptDoc && (
                    <button
                      onClick={() => {
                        setPreviewDoc(paidReceiptDoc);
                        setIsViewerOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View & Download Invoice</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {paymentFailMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Transaction Failed:</strong> Insufficient balance on UPI account XXXX-8921. AutoPay retry scheduled in 24 hrs.
                </span>
              </div>
              <button
                onClick={() => setPaymentFailMsg(false)}
                className="font-bold underline text-rose-700 hover:text-rose-900 shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {difficultySubmitted && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Financial Relief Request Submitted: <strong>{difficultySubmitted}</strong>. Status:{' '}
                  <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    UNDER LANDLORD REVIEW
                  </span>
                </span>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* RENT DIFFICULTY / RELIEF MODAL */}
      {difficultyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-scale-in text-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  Flexi-Rent Relief Program
                </div>
                <h3 className="text-xl font-black text-slate-900">Rent Financial Relief</h3>
                <p className="text-xs text-slate-500">
                  Select a flexible plan if you are facing difficulty paying this month's rent.
                </p>
              </div>
              <button
                onClick={() => setDifficultyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Options List */}
            <div className="space-y-3">
              {/* Option 1: Grace Period */}
              <div
                onClick={() => setSelectedPlan('GRACE')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  selectedPlan === 'GRACE'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">Request 7-Day Grace Period</span>
                  </div>
                  <Badge variant="success" size="sm">
                    0% Late Fee
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 pl-10">
                  Extends due date from 5th to 12th of this month without penalty.
                </p>
              </div>

              {/* Option 2: Payment Plan */}
              <div
                onClick={() => setSelectedPlan('PLAN')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  selectedPlan === 'PLAN'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">Request 2-Split Payment Plan</span>
                  </div>
                  <Badge variant="info" size="sm">
                    50% + 50%
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 pl-10">
                  Pay ₹3,000 on 5th and remaining ₹3,000 on 20th.
                </p>
              </div>

              {/* Option 3: Financing Partner */}
              <div
                onClick={() => setSelectedPlan('FINANCE')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  selectedPlan === 'FINANCE'
                    ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-600/30'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">Student Rent Credit (Demo Partner)</span>
                  </div>
                  <Badge variant="success" size="sm">
                    Instant Approval
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 pl-10">
                  Partner credit line (Liquiloans demo) pays landlord now; repay in 3 monthly EMIs.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDifficultyModalOpen(false)}
                className="py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPlan}
                onClick={() => {
                  const label =
                    selectedPlan === 'GRACE'
                      ? '7-Day Grace Period'
                      : selectedPlan === 'PLAN'
                      ? '2-Split Payment Plan'
                      : 'Student Rent Credit';
                  setDifficultySubmitted(label);
                  setDifficultyModalOpen(false);
                }}
                className={`py-2.5 px-5 rounded-xl font-extrabold text-xs transition-all shadow-md ${
                  selectedPlan
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Submit Request to Landlord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>Payment Receipts & Transaction History</span>
        </h2>

        <Card className="p-0 border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    View / Download PDF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paidReceiptDoc && (
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-extrabold text-emerald-700">
                      {paidReceiptDoc.referenceNo}
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">{paidReceiptDoc.title}</td>
                    <td className="px-4 py-3.5 text-right font-black text-emerald-700">₹6,000.00</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">UPI</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="success" size="sm">
                        SUCCESS
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => {
                          setPreviewDoc(paidReceiptDoc);
                          setIsViewerOpen(true);
                        }}
                        className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View / Download
                      </button>
                    </td>
                  </tr>
                )}
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-extrabold text-indigo-600">
                    UNP-DEMO-2026-000003
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">Rent payment — Aug 2026</td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900">{formatINR(600000)}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">UPI AutoPay</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="success" size="sm">
                      SUCCESS
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleViewTxnPDF('August 2026 Monthly Rent Receipt (₹6,000 Paid)', 'UNP-DEMO-2026-000003', '₹6,000.00', '01 Sep 2026', 'UPI AutoPay')}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Download
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-extrabold text-indigo-600">
                    UNP-DEMO-2026-000002
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">Rent payment — Jul 2026</td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900">{formatINR(600000)}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">UPI</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="success" size="sm">
                      SUCCESS
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleViewTxnPDF('July 2026 Monthly Rent Receipt (₹6,000 Paid)', 'UNP-DEMO-2026-000002', '₹6,000.00', '01 Aug 2026', 'UPI')}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Download
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs font-extrabold text-indigo-600">
                    UNP-DEMO-2026-000001
                  </td>
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">
                    Reservation fee for CampusNest Residence
                  </td>
                  <td className="px-4 py-3.5 text-right font-black text-slate-900">{formatINR(39900)}</td>
                  <td className="px-4 py-3.5 text-slate-600 text-xs font-semibold">UPI</td>
                  <td className="px-4 py-3.5">
                    <Badge variant="success" size="sm">
                      SUCCESS
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleViewTxnPDF('Reservation Fee Receipt (CampusNest Residence)', 'UNP-DEMO-2026-000001', '₹399.00', '15 Jul 2026', 'UPI')}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Download
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={previewDoc}
      />
    </div>
  );
}


