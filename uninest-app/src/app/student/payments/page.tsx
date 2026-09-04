'use client';

import { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  CreditCard, Calendar, CheckCircle2, Clock, AlertTriangle, ShieldCheck,
  Zap, HelpCircle, ArrowRight, Check, X, FileText
} from 'lucide-react';

export default function RentPaymentsPage() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);
  const [rentPaid, setRentPaid] = useState(false);
  const [paymentFailMsg, setPaymentFailMsg] = useState(false);
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'GRACE' | 'PLAN' | 'FINANCE' | null>(null);
  const [difficultySubmitted, setDifficultySubmitted] = useState<string | null>(null);

  function handlePaySuccess() {
    setRentPaid(true);
    setPaymentFailMsg(false);
  }

  function handlePayFail() {
    setPaymentFailMsg(true);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rent & Payments</h1>
          <p className="text-text-secondary mt-1">Monthly rent dues, AutoPay, receipts, and payment relief options</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <CreditCard className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* AutoPay Banner */}
      <Card className="bg-gradient-to-r from-brand-900 to-brand-800 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold">UPI AutoPay Mandate</h2>
              <Badge variant={autoPayEnabled ? 'success' : 'default'} size="sm">
                {autoPayEnabled ? 'ACTIVE' : 'PAUSED'}
              </Badge>
            </div>
            <p className="text-xs text-brand-200">
              Next Deduction: <strong>5th of next month</strong> · Amount: <strong>₹6,000</strong> · Method: <strong>UPI AutoPay (XXXX-8921)</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {autoPayEnabled ? 'Pause AutoPay' : 'Enable AutoPay'}
            </button>
          </div>
        </div>
      </Card>

      {/* Current Rent Card */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3">Current Month Rent</h2>
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-secondary">July 2026 Rent</span>
                <Badge variant={rentPaid ? 'success' : 'warning'}>
                  {rentPaid ? 'PAID' : 'DUE (5th Jul)'}
                </Badge>
              </div>
              <p className="text-3xl font-extrabold text-text-primary">{formatINR(600000)}</p>
              <p className="text-xs text-text-tertiary">ABC Student Residence · Room 204-A</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!rentPaid ? (
                <>
                  <Button variant="primary" onClick={handlePaySuccess}>
                    Pay ₹6,000 via UPI
                  </Button>
                  <Button variant="outline" onClick={handlePayFail}>
                    Simulate Failed Payment
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-800 hover:bg-amber-50"
                    onClick={() => setDifficultyModalOpen(true)}
                  >
                    <HelpCircle className="w-4 h-4 mr-1 text-amber-600" /> I Can't Pay Rent
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Rent Paid · Receipt Generated (UNP-2026-8841)
                </div>
              )}
            </div>
          </div>

          {paymentFailMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center justify-between">
              <span>⚠️ Transaction failed: Insufficient balance on UPI account XXXX-8921. AutoPay retry scheduled in 24 hrs.</span>
              <button onClick={() => setPaymentFailMsg(false)} className="font-bold underline">Dismiss</button>
            </div>
          )}

          {difficultySubmitted && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center justify-between">
              <span>ℹ️ Rent difficulty request submitted: <strong>{difficultySubmitted}</strong>. Landlord status: <strong className="text-amber-700">UNDER REVIEW</strong>.</span>
            </div>
          )}
        </Card>
      </section>

      {/* RENT DIFFICULTY MODAL */}
      {difficultyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-primary rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Rent Financial Relief</h3>
                <p className="text-xs text-text-secondary">Select an option if you are facing difficulty paying this month's rent</p>
              </div>
              <button onClick={() => setDifficultyModalOpen(false)} className="text-text-tertiary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Grace Period */}
              <div
                onClick={() => setSelectedPlan('GRACE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'GRACE' ? 'border-brand-600 bg-brand-50/50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-brand-600" />
                    <span className="font-bold text-sm text-text-primary">Request 7-Day Grace Period</span>
                  </div>
                  <Badge variant="outline" size="sm">0% Late Fee</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-1">Extends due date from 5th to 12th of this month without penalty.</p>
              </div>

              {/* Option 2: Payment Plan */}
              <div
                onClick={() => setSelectedPlan('PLAN')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'PLAN' ? 'border-brand-600 bg-brand-50/50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-sm text-text-primary">Request 2-Split Payment Plan</span>
                  </div>
                  <Badge variant="outline" size="sm">50% + 50%</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-1">Pay ₹3,000 on 5th and remaining ₹3,000 on 20th.</p>
              </div>

              {/* Option 3: Financing Partner */}
              <div
                onClick={() => setSelectedPlan('FINANCE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === 'FINANCE' ? 'border-brand-600 bg-brand-50/50' : 'border-border hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm text-text-primary">Student Rent Credit (Demo Partner)</span>
                  </div>
                  <Badge variant="success" size="sm">Instant Approval</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-1">Partner credit line (Liquiloans demo) pays landlord now; repay in 3 monthly EMIs.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDifficultyModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!selectedPlan}
                onClick={() => {
                  const label = selectedPlan === 'GRACE' ? '7-Day Grace Period' : selectedPlan === 'PLAN' ? '2-Split Payment Plan' : 'Student Rent Credit';
                  setDifficultySubmitted(label);
                  setDifficultyModalOpen(false);
                }}
              >
                Submit Request to Landlord
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3">Payment Receipts</h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-tertiary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Transaction ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                <tr className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">UNP-DEMO-2026-000003</td>
                  <td className="px-4 py-3 text-text-primary">Rent payment — Aug 2026</td>
                  <td className="px-4 py-3 text-right font-bold text-text-primary">{formatINR(600000)}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">UPI AutoPay</td>
                  <td className="px-4 py-3"><Badge variant="success" size="sm">SUCCESS</Badge></td>
                </tr>
                <tr className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">UNP-DEMO-2026-000002</td>
                  <td className="px-4 py-3 text-text-primary">Rent payment — Jul 2026</td>
                  <td className="px-4 py-3 text-right font-bold text-text-primary">{formatINR(600000)}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">UPI</td>
                  <td className="px-4 py-3"><Badge variant="success" size="sm">SUCCESS</Badge></td>
                </tr>
                <tr className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">UNP-DEMO-2026-000001</td>
                  <td className="px-4 py-3 text-text-primary">Reservation fee for ABC Student Residence</td>
                  <td className="px-4 py-3 text-right font-bold text-text-primary">{formatINR(39900)}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">UPI</td>
                  <td className="px-4 py-3"><Badge variant="success" size="sm">SUCCESS</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
