'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Textarea } from '@/components/ui/Input';
import { AlertTriangle, CheckCircle2, MessageSquare } from 'lucide-react';

export interface DisputeItem {
  id: string;
  caseId: string;
  tenantName: string;
  property: string;
  category: string;
  subject: string;
  status: string;
  date: string;
  responseNote?: string;
}

interface TenantDisputesClientProps {
  initialDisputes: DisputeItem[];
}

export function TenantDisputesClient({ initialDisputes }: TenantDisputesClientProps) {
  const [disputes, setDisputes] = useState<DisputeItem[]>(initialDisputes);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [responseNote, setResponseNote] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('IN_REVIEW');

  const handleOpenMediation = (dispute: DisputeItem) => {
    setSelectedDispute(dispute);
    setResponseNote(dispute.responseNote || '');
    setUpdatedStatus(dispute.status === 'OPEN' ? 'IN_REVIEW' : dispute.status);
  };

  const handleSaveMediation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setDisputes(
        disputes.map((d) =>
          d.id === selectedDispute.id
            ? { ...d, status: updatedStatus, responseNote: responseNote }
            : d
        )
      );
      setIsSubmitting(false);
      setSelectedDispute(null);
      setShowSuccessToast(true);

      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            Dispute mediation response saved! Status updated and notification dispatched.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tenant Disputes & Mediation</h1>
          <p className="text-text-secondary mt-1">Review tenant grievances, room conflicts, and security deposit queries</p>
        </div>
        <div className="p-2.5 bg-amber-50 rounded-xl">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      {/* Disputes Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Case ID & Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Complainant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{d.subject}</div>
                    <div className="text-xs font-mono text-slate-400">{d.caseId}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-medium">{d.tenantName}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{d.property}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-xs">{d.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'RESOLVED' ? 'success' : d.status === 'IN_REVIEW' ? 'warning' : 'danger'} size="sm">
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => handleOpenMediation(d)} className="text-xs font-bold">
                      Open Mediation →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mediation Modal */}
      {selectedDispute && (
        <Modal
          isOpen={!!selectedDispute}
          onClose={() => setSelectedDispute(null)}
          title={`Dispute Mediation Case ${selectedDispute.caseId}`}
          description={`Complainant: ${selectedDispute.tenantName} • ${selectedDispute.property}`}
          size="lg"
        >
          <form onSubmit={handleSaveMediation} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Issue Subject</p>
                  <p className="text-base font-bold text-slate-900">{selectedDispute.subject}</p>
                </div>
                <Badge variant="warning" size="sm">{selectedDispute.category}</Badge>
              </div>
              <p className="text-xs text-slate-600">Filed on: {selectedDispute.date}</p>
            </div>

            <Select
              label="Mediation Status"
              value={updatedStatus}
              onChange={(e) => setUpdatedStatus(e.target.value)}
              options={[
                { value: 'OPEN', label: 'OPEN (Awaiting Action)' },
                { value: 'IN_REVIEW', label: 'IN_REVIEW (Under Active Mediation)' },
                { value: 'RESOLVED', label: 'RESOLVED (Case Closed)' },
              ]}
            />

            <Textarea
              label="Official Landlord Response / Settlement Action *"
              placeholder="Provide clear notes on room inspection, tenant discussion, or deposit resolution..."
              value={responseNote}
              onChange={(e) => setResponseNote(e.target.value)}
              rows={4}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setSelectedDispute(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
                {isSubmitting ? 'Saving Resolution...' : 'Submit Official Response'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
