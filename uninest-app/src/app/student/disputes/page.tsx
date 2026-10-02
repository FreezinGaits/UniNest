'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/utils';
import {
  AlertTriangle,
  Shield,
  Clock,
  FileText,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Plus,
  ArrowUpRight,
  UploadCloud,
  X,
  Lock,
  Scale,
  Split,
  Eye,
  Image as ImageIcon,
  FileCheck,
  ShieldCheck,
  Paperclip,
} from 'lucide-react';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';
import { DisputeCase } from '@/lib/disputesStore';
import { EvidenceViewerModal } from '@/components/disputes/EvidenceViewerModal';

export default function DisputesComplaintsPage() {
  const { userEmail: ctxEmail, userName: ctxName, isDemoUser: ctxIsDemo } = useDashboardUser();
  const [isDemo, setIsDemo] = useState<boolean>(ctxIsDemo);
  const [userEmail, setUserEmail] = useState(ctxEmail || '');
  const [userName, setUserName] = useState(ctxName || 'Student');
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingEvidence, setViewingEvidence] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [newDispute, setNewDispute] = useState({
    category: 'DAMAGE',
    title: '',
    amount: '1500',
    description: '',
    priority: 'HIGH',
  });
  const [attachedFiles, setAttachedFiles] = useState<string[]>([
    'DOC-MIN-2026_Handover_Audit.pdf',
    'Move_In_Photo_01.jpg',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setAttachedFiles((prev) => Array.from(new Set([...prev, ...names])));
    }
  };

  const fetchDisputes = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demo/dispute?role=STUDENT&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.disputes && Array.isArray(data.disputes)) {
          setDisputes(data.disputes);
          setSelectedDispute(data.disputes[0] || null);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load disputes from API:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const email = ctxEmail || 'rahul@uninest.in';
    const name = ctxName || 'Rahul Sharma';
    setUserEmail(email);
    setUserName(name);
    fetchDisputes(email);
  }, [ctxEmail, ctxName]);

  const categories = [
    'ALL',
    'DAMAGE',
    'DEPOSIT',
    'ELECTRICITY',
    'MAINTENANCE',
    'RULES',
    'SERVICE',
    'LISTING',
    'SAFETY',
  ];

  const filteredDisputes =
    selectedCategory === 'ALL'
      ? disputes
      : disputes.filter((d) => d.category === selectedCategory);

  async function handleCreateDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!newDispute.title.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/demo/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newDispute.category,
          title: newDispute.title.trim(),
          amount: Number(newDispute.amount) || 0,
          description: newDispute.description.trim(),
          reporter: userName,
          property: 'PCTE Smart Student Residency',
          roomDetails: 'Room 204 (Bed A)',
          evidence: attachedFiles,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dispute) {
          setDisputes([data.dispute, ...disputes]);
          setSelectedDispute(data.dispute);
          setModalOpen(false);
          setNewDispute({
            category: 'DAMAGE',
            title: '',
            amount: '1500',
            description: '',
            priority: 'HIGH',
          });
          setAttachedFiles([
            'DOC-MIN-2026_Handover_Audit.pdf',
            'Move_In_Photo_01.jpg',
          ]);
        }
      } else {
        alert('Failed to submit dispute.');
      }
    } catch (err) {
      console.error('Error creating dispute:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAcceptSettlementOffer(caseId: string) {
    try {
      const res = await fetch('/api/demo/dispute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: caseId,
          action: 'ACCEPT_OFFER',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dispute) {
          setDisputes(disputes.map((d) => (d.caseId === caseId ? data.dispute : d)));
          setSelectedDispute(data.dispute);
        }
      }
    } catch (err) {
      console.error('Accept offer error:', err);
    }
  }

  async function handleEscalate(caseId: string) {
    try {
      const res = await fetch('/api/demo/dispute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId: caseId,
          action: 'ESCALATE_TRIBUNAL',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.dispute) {
          setDisputes(disputes.map((d) => (d.caseId === caseId ? data.dispute : d)));
          setSelectedDispute(data.dispute);
        }
      }
    } catch (err) {
      console.error('Escalate dispute error:', err);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dispute Resolution Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formal deposit, sub-meter, maintenance & rent arbitration center backed by Escrow Protection.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4 mr-1" /> File Formal Dispute
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dispute List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active & Past Cases
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading dispute records...</div>
          ) : filteredDisputes.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-xs">
              <p className="text-xs text-slate-500">No disputes filed in this category.</p>
            </div>
          ) : (
            filteredDisputes.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedDispute(item)}
                className="cursor-pointer"
              >
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    selectedDispute?.id === item.id
                      ? 'border-brand-600 bg-brand-50/20 shadow-xs ring-1 ring-brand-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-700">
                        {item.caseId}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {item.escrowFrozen && item.status !== 'RESOLVED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                            <Lock className="w-2.5 h-2.5" /> Frozen
                          </span>
                        )}
                        <Badge
                          variant={
                            item.status === 'RESOLVED'
                              ? 'success'
                              : item.status === 'ESCALATED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-xs text-slate-900 line-clamp-2">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>
                        Category: <strong className="text-slate-700">{item.category}</strong>
                      </span>
                      <span className="font-black text-slate-900">
                        {item.disputedAmount > 0 ? `₹${item.disputedAmount.toLocaleString('en-IN')}` : 'Rule / Notice'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Case Details Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDispute ? (
            <Card className="space-y-6 p-6">
              {/* Header */}
              <div className="border-b border-slate-200 pb-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-brand-700">
                      {selectedDispute.caseId}
                    </span>
                    <Badge variant="outline">{selectedDispute.category}</Badge>
                    <Badge
                      variant={
                        selectedDispute.status === 'RESOLVED'
                          ? 'success'
                          : selectedDispute.status === 'ESCALATED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {selectedDispute.status}
                    </Badge>
                  </div>

                  {selectedDispute.status !== 'RESOLVED' &&
                    selectedDispute.status !== 'ESCALATED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEscalate(selectedDispute.caseId)}
                        className="text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Scale className="w-3.5 h-3.5 mr-1" /> Escalate to Tribunal
                      </Button>
                    )}
                </div>

                <h2 className="text-lg font-black text-slate-900 leading-snug">
                  {selectedDispute.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span>
                    Disputed Sum:{' '}
                    <strong className="text-emerald-700 font-bold">
                      ₹{selectedDispute.disputedAmount.toLocaleString('en-IN')}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Reporter: <strong>{selectedDispute.complainantName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Respondent: <strong>{selectedDispute.respondentName}</strong>
                  </span>
                </div>
              </div>

              {/* Escrow Freeze Notice */}
              {selectedDispute.escrowFrozen && selectedDispute.status !== 'RESOLVED' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-900 font-medium">
                  <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Escrow Protection Active:</strong> ₹{selectedDispute.disputedAmount.toLocaleString('en-IN')} is locked in the UniNest Tri-Party Vault. The landlord cannot withdraw this sum until resolution.
                  </span>
                </div>
              )}

              {/* Settlement Offer Banner if Landlord proposed a compromise */}
              {selectedDispute.settlementOffer &&
                selectedDispute.settlementOffer.status === 'PENDING' &&
                selectedDispute.status !== 'RESOLVED' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2.5 animate-slide-down">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-black text-xs text-emerald-950 flex items-center gap-1.5">
                        <Split className="w-4 h-4 text-emerald-600" />
                        Mutual Settlement Offer from Landlord
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        ₹{selectedDispute.settlementOffer.offeredAmount} Refund
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 italic bg-white/70 p-2.5 rounded-lg border border-emerald-200">
                      &quot;{selectedDispute.settlementOffer.note}&quot;
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptSettlementOffer(selectedDispute.caseId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs"
                      >
                        Accept ₹{selectedDispute.settlementOffer.offeredAmount} Refund & Settle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(selectedDispute.caseId)}
                        className="border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                      >
                        Reject & Escalate to Tribunal
                      </Button>
                    </div>
                  </div>
                )}

              {/* Case Description */}
              <div className="space-y-1.5 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Case Description
                </h3>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedDispute.description}
                </p>
              </div>

              {/* Submitted Evidence */}
              <div className="space-y-1.5 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Submitted Evidence
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDispute.evidence.map((ev, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setViewingEvidence(ev)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 hover:border-blue-400 hover:bg-blue-100/70 rounded-lg text-blue-900 font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer text-left"
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

              {/* Respondent Official Reply */}
              <div className="space-y-1.5 text-xs">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Respondent Official Reply
                </h3>
                <p className="text-slate-700 italic bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                  {selectedDispute.landlordResponse || 'Awaiting landlord mediation response (48 hr SLA active).'}
                </p>
              </div>

              {/* Resolution Verdict */}
              {selectedDispute.resolution && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Arbitrator Final Resolution
                  </div>
                  <p className="text-emerald-800">{selectedDispute.resolution}</p>
                </div>
              )}

              {/* Audit Timeline */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-200">
                <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  Case Audit Timeline
                </h3>
                <div className="space-y-2">
                  {selectedDispute.timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div>
                        <div className="text-slate-800 font-semibold">{item.event}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.date} • {item.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-400">
              Select a case from the left to view details and mediation options.
            </div>
          )}
        </div>
      </div>

      {/* File Formal Dispute Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="File Formal Tenancy Dispute"
        size="md"
      >
        <form onSubmit={handleCreateDispute} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={newDispute.category}
                onChange={(e) => setNewDispute({ ...newDispute, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium text-slate-900"
              >
                <option value="DAMAGE">Security Deposit / Damage</option>
                <option value="ELECTRICITY">Sub-Meter Electricity</option>
                <option value="MAINTENANCE">Maintenance SLA Breach</option>
                <option value="RULES">Quiet Hours / Co-Living Rules</option>
                <option value="SERVICE">Vendor Service Quality</option>
                <option value="SAFETY">Safety & Door Lock</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Disputed Amount (₹)
              </label>
              <input
                type="number"
                value={newDispute.amount}
                onChange={(e) => setNewDispute({ ...newDispute, amount: e.target.value })}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Case Subject *
            </label>
            <input
              type="text"
              value={newDispute.title}
              onChange={(e) => setNewDispute({ ...newDispute, title: e.target.value })}
              placeholder="e.g., Unfair deposit deduction for pre-existing door scratch"
              required
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Stated Grievance *
            </label>
            <textarea
              value={newDispute.description}
              onChange={(e) => setNewDispute({ ...newDispute, description: e.target.value })}
              rows={3}
              placeholder="Explain the background, why this charge or issue is disputed, and references to your Move-In Inspection Report..."
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>

          {/* Evidentiary Files & Photographic Proof Attachment */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evidentiary Files & Photographic Proof
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tamper-Proof Chain
              </span>
            </div>

            {/* Platform Auto-Attached Notice */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Move-In Handover Audit (DOC-MIN-2026)</span>
                  <p className="text-[11px] text-slate-500">Auto-linked from check-in agreement signed on 15 Aug 2026</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            {/* Uploaded / Attached Pills */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {attachedFiles.map((fileName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-xs font-semibold"
                  >
                    {fileName.endsWith('.jpg') || fileName.endsWith('.png') ? (
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => setViewingEvidence(fileName)}
                      className="underline-offset-2 hover:underline text-left truncate max-w-[180px]"
                      title="Click to inspect this evidence"
                    >
                      {fileName}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                      className="text-blue-400 hover:text-rose-600 p-0.5 rounded ml-1 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Trigger & Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs">
                <UploadCloud className="w-3.5 h-3.5 text-brand-600" />
                <span>Upload Photos / Documents</span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (!attachedFiles.includes('Meter_Photo_June_30.jpg')) {
                    setAttachedFiles([...attachedFiles, 'Meter_Photo_June_30.jpg']);
                  }
                }}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                + Meter_Photo_June_30.jpg
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!attachedFiles.includes('WhatsApp_Chat_Screenshot.png')) {
                    setAttachedFiles([...attachedFiles, 'WhatsApp_Chat_Screenshot.png']);
                  }
                }}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                + WhatsApp_Chat_Log.png
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-700" /> Automatic Escrow Freeze
            </span>
            <p className="text-[11px] text-blue-800">
              If an amount is disputed, that sum is immediately frozen in the Escrow vault. The landlord will have 48 hours to negotiate or offer a mutual compromise.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
            >
              {isSubmitting ? 'Submitting...' : 'File Dispute & Freeze Funds'}
            </Button>
          </div>
        </form>
      </Modal>

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
