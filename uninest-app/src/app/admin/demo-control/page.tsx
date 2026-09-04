'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  RotateCcw, Play, CreditCard, ShieldCheck, UserCheck, Zap,
  Wrench, Phone, ShoppingBag, DollarSign, AlertTriangle, LogOut,
  Loader2, CheckCircle2, XCircle, CalendarCheck
} from 'lucide-react';

const actions = [
  { id: 'reset', label: 'Reset Demo', desc: 'Restore all data to original seeded state', icon: RotateCcw, color: 'bg-red-50 text-red-600 border-red-200', endpoint: '/api/demo/reset' },
  { id: 'booking', label: 'Simulate Booking', desc: 'Create a new bed reservation for demo student', icon: CalendarCheck, color: 'bg-blue-50 text-blue-600 border-blue-200', endpoint: '/api/demo/booking' },
  { id: 'kyc', label: 'Simulate KYC', desc: 'Run demo KYC verification for student', icon: ShieldCheck, color: 'bg-purple-50 text-purple-600 border-purple-200', endpoint: '/api/demo/kyc' },
  { id: 'verification', label: 'Simulate Tenant Verification', desc: 'Submit demo tenant verification form', icon: UserCheck, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', endpoint: '/api/demo/verification' },
  { id: 'payment', label: 'Simulate Payment', desc: 'Process a demo rent payment (success)', icon: CreditCard, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', endpoint: '/api/demo/payment' },
  { id: 'failed-payment', label: 'Simulate Failed Payment', desc: 'Process a demo payment that fails', icon: XCircle, color: 'bg-red-50 text-red-600 border-red-200', endpoint: '/api/demo/payment-fail' },
  { id: 'autopay', label: 'Simulate AutoPay', desc: 'Trigger automatic rent deduction', icon: Play, color: 'bg-brand-50 text-brand-600 border-brand-200', endpoint: '/api/demo/autopay' },
  { id: 'electricity', label: 'Simulate Electricity', desc: 'Log a new meter reading and generate bill', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-200', endpoint: '/api/demo/electricity' },
  { id: 'maintenance', label: 'Simulate Maintenance', desc: 'Create a new maintenance ticket', icon: Wrench, color: 'bg-orange-50 text-orange-600 border-orange-200', endpoint: '/api/demo/maintenance' },
  { id: 'emergency', label: 'Simulate Emergency', desc: 'Log an emergency incident', icon: Phone, color: 'bg-red-50 text-red-600 border-red-200', endpoint: '/api/demo/emergency' },
  { id: 'service', label: 'Simulate Service Purchase', desc: 'Book an ancillary service (cleaning/laundry)', icon: ShoppingBag, color: 'bg-cyan-50 text-cyan-600 border-cyan-200', endpoint: '/api/demo/service' },
  { id: 'commission', label: 'Simulate Commission', desc: 'Generate vendor commission split', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', endpoint: '/api/demo/commission' },
  { id: 'reward', label: 'Simulate Landlord Reward', desc: 'Create landlord ancillary earning', icon: DollarSign, color: 'bg-purple-50 text-purple-600 border-purple-200', endpoint: '/api/demo/reward' },
  { id: 'dispute', label: 'Simulate Dispute', desc: 'File a demo dispute with evidence', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 border-amber-200', endpoint: '/api/demo/dispute' },
  { id: 'moveout', label: 'Simulate Move-out', desc: 'End tenancy and release bed', icon: LogOut, color: 'bg-gray-50 text-gray-600 border-gray-200', endpoint: '/api/demo/moveout' },
];

export default function DemoControlPanel() {
  const router = useRouter();
  const [results, setResults] = useState<Record<string, { status: string; message: string }>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function runAction(action: typeof actions[0]) {
    setLoading(action.id);
    try {
      const res = await fetch(action.endpoint, { method: 'POST' });
      const data = await res.json();
      setResults(prev => ({ ...prev, [action.id]: { status: res.ok ? 'success' : 'error', message: data.message || (res.ok ? 'Completed' : 'Failed') } }));
      if (action.id === 'reset') {
        router.refresh();
      }
    } catch (e: any) {
      setResults(prev => ({ ...prev, [action.id]: { status: 'error', message: e.message || 'Network error' } }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Demo Control Panel</h1>
          <p className="text-text-secondary mt-1">Simulate platform events for live demonstration</p>
        </div>
        <Badge variant="warning">Admin Only</Badge>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-medium">
        ⚠️ These actions modify the demo database. Use <strong>Reset Demo</strong> to restore original state.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map(action => {
          const result = results[action.id];
          const isLoading = loading === action.id;
          return (
            <button
              key={action.id}
              onClick={() => runAction(action)}
              disabled={loading !== null}
              className={`border rounded-xl p-4 text-left transition-all hover:shadow-md disabled:opacity-50 ${action.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <action.icon className="w-5 h-5" />
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {result && !isLoading && (
                  result.status === 'success' 
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <XCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <h3 className="font-bold text-sm">{action.label}</h3>
              <p className="text-[11px] mt-1 opacity-80">{action.desc}</p>
              {result && !isLoading && (
                <p className={`text-[10px] mt-2 font-medium ${result.status === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
