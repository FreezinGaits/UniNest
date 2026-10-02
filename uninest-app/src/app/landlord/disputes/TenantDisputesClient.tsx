'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Scale,
  FileText,
  Clock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Split,
  Undo2,
  Eye,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { DisputeCase } from '@/lib/disputesStore';
import { EvidenceViewerModal } from '@/components/disputes/EvidenceViewerModal';

interface TenantDisputesClientProps {
  initialDisputes: DisputeCase[];
  landlordName?: string;
}

export function TenantDisputesClient({
  initialDisputes,
  landlordName = 'Vikram Singh (Landlord)',
}: TenantDisputesClientProps) {
  const [disputes, setDisputes] = useState<DisputeCase[]>(initialDisputes);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEvidence, setViewingEvidence] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PROPOSE_SETTLEMENT' | 'ACCEPT_FULL' | 'OFFICIAL_REPLY' | 'ESCALATE'>('PROPOSE_SETTLEMENT');

  // Form states
  const [settlementAmount, setSettlementAmount] = useState<number>(750);
  const [responseNote, setResponseNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenMediation = (d: DisputeCase) => {
    setSelectedDispute(d);
    setSettlementAmount(d.settlementOffer?.offeredAmount || Math.round(d.disputedAmount / 2) || 500);
    setResponseNote(d.landlordResponse || '');
    setIsModalOpen(true);
  };

  const handleAction = async (action: 'PROPOSE_SETTLEMENT' | 'ACCEPT_FULL' | 'OFFICIAL_REPLY' | 'ESCALATE_TRIBUNAL') => {
    if (!selectedDispute) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/demo/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: selectedDispute.id,
          action,
          settlementAmount: action === 'PROPOSE_SETTLEMENT' ? settlementAmount : undefined,
          responseNote: responseNote.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dispute) {
          setDisputes((prev) =>
            prev.map((d) => (d.id === selectedDispute.id ? { ...d, ...data.dispute } : d))
          );
          setSelectedDispute(data.dispute);
          showToast(
            action === 'ACCEPT_FULL'
              ? 'Dispute settled! Full refund released from Escrow to tenant.'
              : action === 'PROPOSE_SETTLEMENT'
              ? `Mutual settlement offer of ₹${settlementAmount} dispatched to student.`
              : action === 'ESCALATE_TRIBUNAL'
              ? 'Case escalated to UniNest Neutral Dispute Tribunal.'
              : 'Official landlord response logged.'
          );
          setIsModalOpen(false);
        }
      } else {
        alert('Failed to update dispute. Please try again.');
      }
    } catch (err) {
      console.error('Mediation error:', err);
      alert('Network error while processing mediation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalFrozenEscrow = disputes
    .filter((d) => d.escrowFrozen && d.status !== 'RESOLVED')
    .reduce((sum, d) => sum + d.disputedAmount, 0);

  const activeCasesCount = disputes.filter((d) => d.status !== 'RESOLVED').length;
  const resolvedCount = disputes.filter((d) => d.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
          <span className="text-[11px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">
            Real-Time Synced
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tenant Disputes & Mediation Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Arbitration center for security deposit deductions, sub-meter billing queries, and quiet hour rules.
          </p>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
          <Scale className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Disputes</div>
          <div className="text-xl font-black text-slate-900 mt-1">{activeCasesCount} Cases</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-0.5">Require Mediation</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-600" /> Escrow Frozen
          </div>
          <div className="text-xl font-black text-rose-700 mt-1">₹{totalFrozenEscrow.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-0.5">Protected Funds</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Cases</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{resolvedCount} Cases</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Settled Amicably</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Arbitration SLA</div>
          <div className="text-xl font-black text-purple-700 mt-1">48 Hours</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">UniNest Legal Standard</div>
        </div>
      </div>

      {/* Disputes Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Case ID & Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Complainant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Property Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Disputed Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Escrow Protection</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Mediation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-extrabold text-slate-900">{d.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <span>{d.caseId}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">{d.category}</span>
                      <span>•</span>
                      <span>Filed {d.filedDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-bold text-slate-800">{d.complainantName}</div>
                    <div className="text-slate-400 text-[11px]">{d.roomDetails || 'Room 204'}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="font-medium text-slate-800">{d.property}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-black text-slate-900">
                    {d.disputedAmount > 0 ? `₹${d.disputedAmount.toLocaleString('en-IN')}` : 'Rule / Behavioral'}
                  </td>
                  <td className="px-4 py-3">
                    {d.escrowFrozen && d.status !== 'RESOLVED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
                        <Lock className="w-3 h-3 text-rose-600" /> ₹{d.disputedAmount} Frozen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        d.status === 'RESOLVED'
                          ? 'success'
                          : d.status === 'ESCALATED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenMediation(d)}
                      className="text-xs py-1 px-2.5 font-bold border-brand-300 text-brand-700 hover:bg-brand-50"
                    >
                      Open Mediation →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Advanced Mediation Modal (Comparative Digital Resolution Center) */}
      {selectedDispute && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Dispute Mediation Case ${selectedDispute.caseId}`}
          size="lg"
        >
          <div className="space-y-4 pt-2">
            {/* Case Meta Banner */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-extrabold text-sm text-slate-900">{selectedDispute.title}</span>
                <Badge variant={selectedDispute.status === 'RESOLVED' ? 'success' : 'warning'} size="sm">
                  {selectedDispute.status}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                <span>Complainant: <strong className="text-slate-800">{selectedDispute.complainantName}</strong></span>
                <span>•</span>
                <span>Premises: <strong className="text-slate-800">{selectedDispute.property} ({selectedDispute.roomDetails})</strong></span>
                <span>•</span>
                <span>Disputed Sum: <strong className="text-emerald-700 font-bold">₹{selectedDispute.disputedAmount}</strong></span>
              </div>
            </div>

            {/* Escrow Protection Notice */}
            {selectedDispute.escrowFrozen && selectedDispute.status !== 'RESOLVED' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Escrow Lock Active:</strong> ₹{selectedDispute.disputedAmount.toLocaleString('en-IN')} is frozen in the UniNest Tri-Party Vault. Funds cannot be released until mutual agreement or tribunal ruling.
                </span>
              </div>
            )}

            {/* Student Statement & Description */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tenant Stated Grievance
              </label>
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                {selectedDispute.description}
              </div>
            </div>

            {/* Evidence Submitted by Student */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Evidentiary Files
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedDispute.evidence.map((ev, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setViewingEvidence(ev)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100/70 rounded-lg text-blue-900 text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer text-left"
                    title={`Click to inspect and preview ${ev}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span className="underline-offset-2 group-hover:underline">{ev}</span>
                    <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-blue-700 bg-blue-200/60 px-1.5 py-0.5 rounded font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Eye className="w-2.5 h-2.5" /> View
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mediation Action Tabs */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Choose Mediation & Settlement Action
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PROPOSE_SETTLEMENT')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    activeTab === 'PROPOSE_SETTLEMENT'
                      ? 'border-brand-600 bg-brand-50/40 text-brand-900 ring-1 ring-brand-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-brand-600" />
                    <span>Propose 50% Settlement</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Offer mutual split (e.g. ₹750)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ACCEPT_FULL')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    activeTab === 'ACCEPT_FULL'
                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Accept 100% Claim</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Refund ₹{selectedDispute.disputedAmount} from Escrow</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ESCALATE')}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    activeTab === 'ESCALATE'
                      ? 'border-purple-600 bg-purple-50/40 text-purple-900 ring-1 ring-purple-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-600" />
                    <span>Escalate to Tribunal</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Request binding arbitrator verdict</p>
                </button>
              </div>

              {/* Action Form Content */}
              {activeTab === 'PROPOSE_SETTLEMENT' && (
                <div className="p-3 bg-brand-50/30 border border-brand-200 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Offer Refund Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900 bg-white"
                      placeholder="e.g. 750"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Settlement Proposal Note to Tenant *
                    </label>
                    <textarea
                      value={responseNote}
                      onChange={(e) => setResponseNote(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium text-slate-800 bg-white"
                      placeholder="Explain the compromise offer (e.g. The scratch was present but unpolished; offering 50% split refund)."
                    />
                  </div>

                  <Button
                    onClick={() => handleAction('PROPOSE_SETTLEMENT')}
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    {isSubmitting ? 'Dispatching...' : `Send Settlement Offer of ₹${settlementAmount} to Student`}
                  </Button>
                </div>
              )}

              {activeTab === 'ACCEPT_FULL' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs text-emerald-900">
                    <strong>Release 100% Escrow Funds:</strong> By accepting, you agree to refund the full{' '}
                    <strong>₹{selectedDispute.disputedAmount.toLocaleString('en-IN')}</strong> back to the student.
                    The case will be closed immediately with a verified settlement certificate.
                  </div>
                  <Button
                    onClick={() => handleAction('ACCEPT_FULL')}
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    {isSubmitting ? 'Releasing Funds...' : `Approve & Release ₹${selectedDispute.disputedAmount} to Tenant`}
                  </Button>
                </div>
              )}

              {activeTab === 'ESCALATE' && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                  <div className="text-xs text-purple-900">
                    <strong>UniNest Dispute Tribunal:</strong> If you believe the tenant&apos;s claim is invalid, the case will be escalated to an independent neutral arbitrator. Both parties will be asked to abide by the digital move-in photographic inspection report.
                  </div>
                  <Button
                    onClick={() => handleAction('ESCALATE_TRIBUNAL')}
                    disabled={isSubmitting}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                  >
                    {isSubmitting ? 'Escalating...' : 'Submit to UniNest Neutral Tribunal'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Tamper-Proof Evidence Inspection & PDF Viewer Modal */}
      <EvidenceViewerModal
        isOpen={Boolean(viewingEvidence)}
        onClose={() => setViewingEvidence(null)}
        fileName={viewingEvidence}
        caseId={selectedDispute?.caseId}
        property={selectedDispute?.property}
      />
    </div>
  );
}
