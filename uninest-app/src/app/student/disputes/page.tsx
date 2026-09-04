'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  AlertTriangle, Shield, Clock, FileText, CheckCircle2, MessageSquare,
  ChevronRight, Plus, ArrowUpRight, UploadCloud, X
} from 'lucide-react';

interface DisputeItem {
  id: string;
  caseId: string;
  category: string;
  title: string;
  amount: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';
  reporter: string;
  respondent: string;
  description: string;
  evidence: string[];
  timeline: { date: string; event: string }[];
  otherPartyResponse: string;
  resolution: string | null;
}

const DEMO_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp-1',
    caseId: 'UN-DMG-00452',
    category: 'DAMAGE',
    title: 'Disputed Security Deposit Deduction for Pre-existing Door Scratch',
    amount: 150000, // ₹1,500
    status: 'UNDER_REVIEW',
    reporter: 'Rahul Sharma (Student)',
    respondent: 'Vikram Singh (Landlord)',
    description: 'Landlord deducted ₹1,500 from security deposit for door scratch. However, Move-in Condition Report (DOC-MIN-2026) proves this scratch existed prior to move-in date.',
    evidence: ['Move_In_Photo_01.jpg', 'Landlord_Deduction_Receipt.pdf', 'Move_In_Report_Signed.pdf'],
    timeline: [
      { date: '10 Jul 2026', event: 'Dispute filed by Tenant (Rahul Sharma)' },
      { date: '11 Jul 2026', event: 'Evidence submitted: Move-in condition report DOC-MIN-2026' },
      { date: '12 Jul 2026', event: 'Landlord responded: "Scratch appeared larger during move-out"' },
      { date: '13 Jul 2026', event: 'Escalated to UniNest Independent Arbitrator' },
    ],
    otherPartyResponse: '"The door scratch was present during initial inspection but tenant failed to polish it. Requesting 50% split."',
    resolution: null,
  },
  {
    id: 'dsp-2',
    caseId: 'UN-ELE-00219',
    category: 'ELECTRICITY',
    title: 'Sub-Meter Reading Mismatch for June 2026',
    amount: 80000, // ₹800
    status: 'RESOLVED',
    reporter: 'Rahul Sharma (Student)',
    respondent: 'Vikram Singh (Landlord)',
    description: 'June sub-meter reading logged 140 units, but meter photo shows 110 units. Disputed excess ₹800 bill.',
    evidence: ['Meter_Photo_June_30.jpg'],
    timeline: [
      { date: '01 Jul 2026', event: 'Dispute filed by Tenant' },
      { date: '02 Jul 2026', event: 'Landlord verified meter photo and acknowledged typo' },
      { date: '02 Jul 2026', event: 'Resolution issued: ₹800 credited to student wallet' },
    ],
    otherPartyResponse: '"Acknowledged typo during manual entry. Correct reading is 110 units."',
    resolution: 'Case Closed: ₹800 excess charge refunded to student ledger. Sub-meter reading updated to 110 units.',
  },
  {
    id: 'dsp-3',
    caseId: 'UN-SRV-00104',
    category: 'SERVICE',
    title: 'Wi-Fi Downtime Refund Claim (3 Days Unusable)',
    amount: 30000, // ₹300
    status: 'RESOLVED',
    reporter: 'Rahul Sharma (Student)',
    respondent: 'Airtel Broadband (Provider)',
    description: 'High-speed Wi-Fi boost service had 72 hours downtime during semester exams.',
    evidence: ['Speedtest_Logs.pdf', 'ISP_Ticket_Reference.txt'],
    timeline: [
      { date: '15 Jun 2026', event: 'Dispute filed against Service Provider' },
      { date: '16 Jun 2026', event: 'SLA breach confirmed by ISP automated monitor' },
      { date: '17 Jun 2026', event: 'Pro-rata refund processed' },
    ],
    otherPartyResponse: '"Fibre cut detected near campus gate. SLA credit issued automatically."',
    resolution: 'Case Closed: Pro-rata refund of ₹300 credited for 3 days outage.',
  },
];

export default function DisputesComplaintsPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>(DEMO_DISPUTES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(DEMO_DISPUTES[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('DEPOSIT');
  const [newTitle, setNewTitle] = useState('');

  const categories = ['ALL', 'PAYMENT', 'DEPOSIT', 'DAMAGE', 'ELECTRICITY', 'MAINTENANCE', 'LISTING', 'BOOKING', 'AGREEMENT', 'RULES', 'SAFETY', 'SERVICE'];

  const filteredDisputes = selectedCategory === 'ALL'
    ? disputes
    : disputes.filter(d => d.category === selectedCategory);

  function handleFileDispute() {
    if (!newTitle) return;
    const newCase: DisputeItem = {
      id: `dsp-${Date.now()}`,
      caseId: `UN-${newCategory.slice(0, 3)}-${Math.floor(10000 + Math.random() * 90000)}`,
      category: newCategory,
      title: newTitle,
      amount: 50000,
      status: 'OPEN',
      reporter: 'Rahul Sharma (Student)',
      respondent: 'Landlord / Service Vendor',
      description: `New dispute logged under ${newCategory} category for review by UniNest tribunal.`,
      evidence: ['Student_Evidence_Statement.pdf'],
      timeline: [{ date: 'Today', event: 'Dispute submitted by Tenant' }],
      otherPartyResponse: 'Pending response from respondent (24 hr SLA)',
      resolution: null,
    };

    setDisputes([newCase, ...disputes]);
    setSelectedDispute(newCase);
    setModalOpen(false);
    setNewTitle('');
  }

  function handleEscalate(caseId: string) {
    setDisputes(disputes.map(d => d.caseId === caseId ? { ...d, status: 'ESCALATED' } : d));
    if (selectedDispute && selectedDispute.caseId === caseId) {
      setSelectedDispute({ ...selectedDispute, status: 'ESCALATED' });
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dispute Resolution Portal</h1>
          <p className="text-text-secondary mt-1">Formal deposit, maintenance, rent & service dispute arbitration center</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> File Formal Dispute
        </Button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
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
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">Active & Past Cases</h2>

          {filteredDisputes.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedDispute(item)}
              className="cursor-pointer"
            >
              <Card
                className={`p-4 transition-all ${
                  selectedDispute?.id === item.id ? 'border-brand-600 ring-1 ring-brand-600 bg-brand-50/20' : 'hover:border-brand-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-700">{item.caseId}</span>
                    <Badge variant={
                      item.status === 'RESOLVED' ? 'success' :
                      item.status === 'ESCALATED' ? 'danger' : 'warning'
                    } size="sm">
                      {item.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-xs text-text-primary line-clamp-2">{item.title}</h3>

                  <div className="flex items-center justify-between text-[11px] text-text-tertiary pt-1 border-t border-border">
                    <span>Category: <strong>{item.category}</strong></span>
                    <span className="font-semibold text-text-primary">{formatINR(item.amount)}</span>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Right Column: Case Details Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {selectedDispute ? (
            <Card className="space-y-6">
              {/* Header */}
              <div className="border-b border-border pb-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-brand-700">{selectedDispute.caseId}</span>
                    <Badge variant="outline">{selectedDispute.category}</Badge>
                    <Badge variant={
                      selectedDispute.status === 'RESOLVED' ? 'success' :
                      selectedDispute.status === 'ESCALATED' ? 'danger' : 'warning'
                    }>
                      {selectedDispute.status}
                    </Badge>
                  </div>

                  {selectedDispute.status !== 'RESOLVED' && selectedDispute.status !== 'ESCALATED' && (
                    <Button variant="outline" size="sm" onClick={() => handleEscalate(selectedDispute.caseId)}>
                      Escalate to Tribunal
                    </Button>
                  )}
                </div>

                <h2 className="text-lg font-bold text-text-primary">{selectedDispute.title}</h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-1">
                  <span>Disputed Amount: <strong className="text-text-primary font-bold">{formatINR(selectedDispute.amount)}</strong></span>
                  <span>Reporter: <strong>{selectedDispute.reporter}</strong></span>
                  <span>Respondent: <strong>{selectedDispute.respondent}</strong></span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Case Description</h3>
                <p className="text-text-secondary bg-surface-secondary p-3 rounded-xl border border-border">
                  {selectedDispute.description}
                </p>
              </div>

              {/* Evidence Attachments */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Submitted Evidence</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDispute.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg text-brand-800 font-medium text-xs">
                      <FileText className="w-4 h-4 text-brand-600" /> {ev}
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Party Response */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Respondent Official Reply</h3>
                <p className="text-text-secondary italic bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                  {selectedDispute.otherPartyResponse}
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
              <div className="space-y-3 text-xs border-t border-border pt-4">
                <h3 className="font-bold text-text-primary uppercase tracking-wider text-[11px]">Case Audit Timeline</h3>
                <div className="space-y-2">
                  {selectedDispute.timeline.map((tl, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-1" />
                      <div>
                        <span className="font-semibold text-text-primary mr-2">{tl.date}:</span>
                        <span className="text-text-secondary">{tl.event}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Shield className="w-8 h-8 text-brand-600 mb-2" />
              <h3 className="font-bold text-text-primary">Select a dispute case</h3>
              <p className="text-xs text-text-secondary mt-1">Select a dispute from the left to view evidence, replies, and resolution verdicts.</p>
            </Card>
          )}
        </div>
      </div>

      {/* FILE DISPUTE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface-primary rounded-2xl max-w-lg w-full p-6 space-y-4 animate-scale-in border border-border">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-text-primary">File New Dispute Claim</h3>
              <button onClick={() => setModalOpen(false)} className="text-text-tertiary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-text-primary block mb-1">Dispute Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface-secondary text-text-primary"
                >
                  {categories.filter(c => c !== 'ALL').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-text-primary block mb-1">Dispute Subject / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unjustified deposit deduction for room painting"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-surface-secondary text-text-primary"
                />
              </div>

              <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Demo Evidence file attached: <strong>Student_Claim_Photos_Receipts.pdf</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" disabled={!newTitle} onClick={handleFileDispute}>
                Submit to Arbitrator
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
