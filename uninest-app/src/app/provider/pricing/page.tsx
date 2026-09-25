'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, Wrench, Zap, Wind, Sparkles, Key, Paintbrush, Info } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const rateCard = [
  { id: 1, service: 'Plumbing Repair', rate: '₹350 base + ₹150/hr', type: 'variable', icon: Wrench },
  { id: 2, service: 'Electrical Wiring', rate: '₹400 base + ₹200/hr', type: 'variable', icon: Zap },
  { id: 3, service: 'AC Service/Gas Refill', rate: '₹800 flat', type: 'flat', icon: Wind },
  { id: 4, service: 'Deep Cleaning (1 Room)', rate: '₹500 flat', type: 'flat', icon: Sparkles },
  { id: 5, service: 'Deep Cleaning (Full PG)', rate: '₹2,500 flat', type: 'flat', icon: Sparkles },
  { id: 6, service: 'Lock Replacement', rate: '₹450 flat', type: 'flat', icon: Key },
  { id: 7, service: 'Painting (per wall)', rate: '₹1,200', type: 'flat', icon: Paintbrush },
];

export default function PricingCommissionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Service Rate Card & Pricing</h1>
          <p className="text-text-secondary mt-1">Manage your standard service rates and base charges</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      <Card className="bg-blue-50/50 border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Material Charges Policy</h3>
            <p className="text-sm text-blue-700 mt-1">
              Extra materials billed at MRP + 10% handling. Material costs must be approved by the customer before starting work.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rateCard.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:border-brand-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-surface-secondary rounded-lg">
                    <Icon className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{item.service}</h3>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-brand-600">{item.rate}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={item.type === 'flat' ? 'success' : 'warning'} size="sm">
                  {item.type === 'flat' ? 'Fixed Rate' : 'Variable'}
                </Badge>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}
