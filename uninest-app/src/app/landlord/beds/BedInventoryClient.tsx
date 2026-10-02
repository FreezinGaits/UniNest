'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { BedDouble, Plus, CheckCircle, Lock, CheckCircle2, Search, Filter } from 'lucide-react';
import { formatRupees } from '@/lib/utils';

export interface BedItem {
  id: string;
  bedLabel: string;
  roomNo: string;
  property: string;
  sharing: string;
  status: string;
  tenant: string;
  rent: number;
}

interface BedInventoryClientProps {
  initialBeds: BedItem[];
}

export function BedInventoryClient({ initialBeds }: BedInventoryClientProps) {
  const [beds, setBeds] = useState<BedItem[]>(initialBeds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'RESERVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const propertyOptions = Array.from(new Set(beds.map((b) => b.property))).map((p) => ({
    value: p,
    label: p,
  }));

  const defaultProperty = propertyOptions[0]?.value || 'PCTE Smart Student Residency';

  const [formData, setFormData] = useState({
    property: defaultProperty,
    roomNo: '101',
    bedLabelLetter: 'A',
    sharing: '2-Sharing',
    rent: 6000,
    status: 'AVAILABLE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newBed: BedItem = {
      id: `bed-new-${Date.now()}`,
      bedLabel: `Bed ${formData.roomNo}-${formData.bedLabelLetter}`,
      roomNo: `Room ${formData.roomNo}`,
      property: formData.property,
      sharing: formData.sharing,
      status: formData.status,
      tenant: formData.status === 'OCCUPIED' ? 'New Tenant' : '—',
      rent: Number(formData.rent),
    };

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to save bed');
      }

      setBeds([newBed, ...beds]);
      setIsSubmitting(false);
      setIsModalOpen(false);
      setShowSuccessToast(true);
      setFormData({
        property: defaultProperty,
        roomNo: '101',
        bedLabelLetter: 'A',
        sharing: '2-Sharing',
        rent: 6000,
        status: 'AVAILABLE',
      });

      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      alert('Failed to save bed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length;
  const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;

  const filteredBeds = beds.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bedLabel.toLowerCase().includes(q) ||
        b.property.toLowerCase().includes(q) ||
        b.roomNo.toLowerCase().includes(q) ||
        b.tenant.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            New Bed unit added to inventory matrix! Real-time metrics updated.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bed Inventory & Real-Time Matrix</h1>
          <p className="text-text-secondary mt-1">Granular room-by-room bed allocation, reservations, and live vacant bed index</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
            <Plus className="w-4 h-4 mr-2" /> Add Bed Unit
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Tracked Beds</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{beds.length} beds</p>
        </Card>
        <Card className="bg-blue-50/60 border border-blue-200">
          <p className="text-xs font-bold text-blue-800 uppercase">Occupied & Reserved</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{occupiedCount} occupied</p>
        </Card>
        <Card className="bg-emerald-50/60 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 uppercase">Vacant / Bookable</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{availableCount} available</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
          {[
            { key: 'ALL', label: `All Beds (${beds.length})` },
            { key: 'OCCUPIED', label: `Occupied (${beds.filter((b) => b.status === 'OCCUPIED').length})` },
            { key: 'AVAILABLE', label: `Vacant (${availableCount})` },
            { key: 'RESERVED', label: `Reserved (${beds.filter((b) => b.status === 'RESERVED').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key as any)}
              className={`px-3.5 py-2 rounded-xl border transition-all whitespace-nowrap ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search bed, room, tenant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Bed Identifier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">PG Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Room Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Current Occupant</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Rent / mo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredBeds.map((b) => (
                <tr key={b.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{b.bedLabel}</div>
                    <div className="text-xs text-slate-400">{b.roomNo}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{b.property}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-xs">{b.sharing}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs font-medium">{b.tenant}</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-700">{formatRupees(b.rent)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={b.status === 'OCCUPIED' ? 'default' : b.status === 'AVAILABLE' ? 'success' : 'warning'} size="sm">
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Bed Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Bed Unit to Inventory"
        description="Register a new bookable bed in your room configuration"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Property *"
            value={formData.property}
            onChange={(e) => setFormData({ ...formData, property: e.target.value })}
            options={propertyOptions.length > 0 ? propertyOptions : [
              { value: 'PCTE Smart Student Residency', label: 'PCTE Smart Student Residency' },
              { value: 'Passi Luxury PG & Co-Living', label: 'Passi Luxury PG & Co-Living' },
              { value: 'Campus Edge Girls Hostel', label: 'Campus Edge Girls Hostel' },
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room Number *"
              placeholder="e.g. 101"
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              required
            />
            <Input
              label="Bed Label *"
              placeholder="A, B, or C"
              value={formData.bedLabelLetter}
              onChange={(e) => setFormData({ ...formData, bedLabelLetter: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Room Sharing Tier"
              value={formData.sharing}
              onChange={(e) => setFormData({ ...formData, sharing: e.target.value })}
              options={[
                { value: 'Single Occupancy', label: 'Single Occupancy (Private)' },
                { value: '2-Sharing', label: 'Double Sharing (2 Beds)' },
                { value: '3-Sharing', label: 'Triple Sharing (3 Beds)' },
                { value: '4-Sharing', label: '4-Bed Dormitory' },
              ]}
            />
            <Input
              label="Monthly Rent (₹) *"
              type="number"
              value={formData.rent}
              onChange={(e) => setFormData({ ...formData, rent: Number(e.target.value) })}
              required
            />
          </div>

          <Select
            label="Initial Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'AVAILABLE', label: 'Available (Bookable on Student App)' },
              { value: 'OCCUPIED', label: 'Occupied (Current Tenant Active)' },
              { value: 'RESERVED', label: 'Reserved (Pending Move-In OTP)' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              {isSubmitting ? 'Adding Bed...' : 'Save Bed Unit'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
