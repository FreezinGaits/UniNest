'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Plus, CheckCircle2 } from 'lucide-react';
import { formatRupees } from '@/lib/utils';

export interface ElectricityReadingItem {
  id: string;
  property: string;
  room: string;
  tenant: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnit: number;
  totalBill: number;
  status: string;
  month: string;
}

interface ElectricityMeteringClientProps {
  initialReadings: ElectricityReadingItem[];
}

function sanitizeReading(raw: any): ElectricityReadingItem {
  const previousReading = Number(raw?.previousReading ?? 1200) || 0;
  const currentReading = Number(raw?.currentReading ?? 1300) || 0;
  const ratePerUnit = Number(raw?.ratePerUnit ?? 9.5) || 9.5;
  const unitsConsumed =
    raw?.unitsConsumed !== undefined && raw?.unitsConsumed !== null
      ? Number(raw.unitsConsumed)
      : Math.max(0, currentReading - previousReading);
  const totalBill =
    raw?.totalBill !== undefined && raw?.totalBill !== null
      ? Number(raw.totalBill)
      : raw?.totalAmount !== undefined
      ? Math.round(Number(raw.totalAmount) / 100)
      : Math.round(unitsConsumed * ratePerUnit);

  return {
    id: String(raw?.id || `el-${Date.now()}`),
    property: String(raw?.property || 'PCTE Smart Student Residency'),
    room: String(raw?.room || 'Room 204 (Sub-Meter #204)'),
    tenant: String(raw?.tenant || 'Rahul Sharma'),
    previousReading,
    currentReading,
    unitsConsumed,
    ratePerUnit,
    totalBill,
    status: String(raw?.status || 'UNPAID'),
    month: String(raw?.month || 'September 2026'),
  };
}

export function ElectricityMeteringClient({ initialReadings }: ElectricityMeteringClientProps) {
  const [readings, setReadings] = useState<ElectricityReadingItem[]>(() =>
    (Array.isArray(initialReadings) ? initialReadings : []).map(sanitizeReading)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [formData, setFormData] = useState({
    property: 'PCTE Smart Student Residency',
    room: 'Room 205 (Sub-Meter #205)',
    tenant: 'Rohit Verma',
    previousReading: 1100,
    currentReading: 1245,
    ratePerUnit: 10,
  });

  useEffect(() => {
    fetch('/api/electricity', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.readings && Array.isArray(data.readings) && data.readings.length > 0) {
          setReadings(data.readings.map(sanitizeReading));
        }
      })
      .catch((err) => console.warn('Error syncing electricity readings from API:', err));
  }, []);

  const unitsConsumed = Math.max(0, Number(formData.currentReading) - Number(formData.previousReading));
  const calculatedBill = Math.round(unitsConsumed * Number(formData.ratePerUnit));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/electricity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property: formData.property,
          room: formData.room,
          tenant: formData.tenant,
          previousReading: formData.previousReading,
          currentReading: formData.currentReading,
          ratePerUnit: formData.ratePerUnit,
          month: 'September 2026',
        }),
      });

      const data = await res.json();
      if (res.ok && data.reading) {
        const cleanReading = sanitizeReading(data.reading);
        setReadings((prev) => [cleanReading, ...prev.filter((r) => r.id !== cleanReading.id)]);
        setIsModalOpen(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } else {
        alert(data.error || 'Failed to save electricity reading');
      }
    } catch (err) {
      console.error('Error submitting electricity reading:', err);
      alert('Network error while saving electricity reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalUnits = readings.reduce((sum, r) => sum + Number(r.unitsConsumed || 0), 0);
  const totalBilled = readings.reduce((sum, r) => sum + Number(r.totalBill || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            Sub-meter reading logged! Invoice created and dispatched to tenant app.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sub-meter Electricity Billing</h1>
          <p className="text-text-secondary mt-1">Log room sub-meter kWh readings, automated bill splitting, and PSPCL rate calculation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Log Meter Reading
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-50/60 border border-amber-200">
          <p className="text-xs font-bold text-amber-800 uppercase">Tariff Rate</p>
          <p className="text-2xl font-black text-amber-700 mt-1">₹9.50 / kWh</p>
        </Card>
        <Card className="bg-emerald-50/60 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 uppercase">Total Units Consumed</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{totalUnits} kWh</p>
        </Card>
        <Card className="bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase">Total Utility Billed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatRupees(totalBilled)}</p>
        </Card>
      </div>

      {/* Readings Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Sub-meter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Prev / Curr Reading</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Units (kWh)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Bill Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {readings.map((rawEl) => {
                const el = sanitizeReading(rawEl);
                return (
                  <tr key={el.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{el.property}</div>
                      <div className="text-xs text-amber-700 font-medium">{el.room}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-medium">{el.tenant}</td>
                    <td className="px-4 py-3 text-right text-xs font-mono text-slate-600">
                      {el.previousReading} → {el.currentReading}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{el.unitsConsumed} kWh</td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">{formatRupees(el.totalBill)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={el.status === 'PAID' ? 'success' : 'warning'} size="sm">
                        {el.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Meter Reading Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Sub-Meter Reading"
        description="Enter room sub-meter kWh reading to generate automated tenant utility bill"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Property Unit *"
            value={formData.property}
            onChange={(e) => setFormData({ ...formData, property: e.target.value })}
            options={[
              { value: 'PCTE Smart Student Residency', label: 'PCTE Smart Student Residency' },
              { value: 'Passi Luxury PG & Co-Living', label: 'Passi Luxury PG & Co-Living' },
              { value: 'Campus Edge Girls Hostel', label: 'Campus Edge Girls Hostel' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room & Sub-Meter No. *"
              placeholder="e.g. Room 205 (Sub-Meter #205)"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
            <Input
              label="Tenant Name"
              placeholder="e.g. Rahul Sharma"
              value={formData.tenant}
              onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Previous kWh *"
              type="number"
              value={formData.previousReading}
              onChange={(e) => setFormData({ ...formData, previousReading: Number(e.target.value) })}
              required
            />
            <Input
              label="Current kWh *"
              type="number"
              value={formData.currentReading}
              onChange={(e) => setFormData({ ...formData, currentReading: Number(e.target.value) })}
              required
            />
            <Input
              label="State Tariff Rate (₹/kWh)"
              type="number"
              step="0.1"
              value={formData.ratePerUnit}
              onChange={(e) => setFormData({ ...formData, ratePerUnit: Number(e.target.value) })}
            />
          </div>

          {/* Real-time calculation summary card */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-800 font-bold uppercase">Calculated Consumption</p>
              <p className="text-lg font-black text-amber-900 mt-0.5">{unitsConsumed} kWh units</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-800 font-bold uppercase">Net Utility Charge</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{formatRupees(calculatedBill)}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              {isSubmitting ? 'Logging Reading...' : 'Generate Utility Invoice'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
