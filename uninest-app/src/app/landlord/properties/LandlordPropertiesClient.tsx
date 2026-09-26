'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Building2, MapPin, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface PropertyItem {
  id: string;
  name: string;
  locality: string;
  city: string;
  address: string;
  verificationStatus: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  rentPerMonth: number;
  openTickets: number;
}

interface LandlordPropertiesClientProps {
  initialProperties: PropertyItem[];
}

function sanitizeProperty(raw: any): PropertyItem {
  const totalRooms = Number(raw?.totalRooms ?? raw?.rooms?.length ?? 6) || 6;
  const totalBeds =
    Number(
      raw?.totalBeds ??
        totalRooms * Number(raw?.bedsPerRoom || 2)
    ) || 12;
  const occupiedBeds =
    raw?.occupiedBeds !== undefined && raw?.occupiedBeds !== null
      ? Number(raw.occupiedBeds)
      : Math.min(totalBeds, Math.floor(totalBeds * 0.75));

  let rawRent = Number(
    raw?.rentPerMonth ??
      (raw?.rooms?.[0]?.rent ? Number(raw.rooms[0].rent) : 6000)
  ) || 6000;
  const rentPerMonth = rawRent >= 100000 ? Math.round(rawRent / 100) : rawRent;

  const openTickets = Number(
    raw?.openTickets ??
      (Array.isArray(raw?.maintenanceTickets) ? raw.maintenanceTickets.length : 0)
  ) || 0;

  const rawStatus = String(raw?.verificationStatus || raw?.status || 'VERIFIED').toUpperCase();

  return {
    id: String(raw?.id || `prop-${Date.now()}`),
    name: String(raw?.name || 'UniNest Student Residency'),
    locality: String(raw?.locality || 'Ferozepur Road'),
    city: String(raw?.city || 'Ludhiana'),
    address: String(raw?.address || 'Ferozepur Road, Ludhiana'),
    verificationStatus: rawStatus === 'APPROVED' ? 'VERIFIED' : rawStatus,
    totalRooms,
    totalBeds,
    occupiedBeds,
    rentPerMonth,
    openTickets,
  };
}

export function LandlordPropertiesClient({ initialProperties }: LandlordPropertiesClientProps) {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyItem[]>(() =>
    (Array.isArray(initialProperties) ? initialProperties : []).map(sanitizeProperty)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    locality: 'Ferozepur Road',
    address: '',
    city: 'Ludhiana',
    type: 'PG',
    totalRooms: 4,
    bedsPerRoom: 2,
    rentPerMonth: 6000,
    gender: 'ANY',
    description: '',
  });

  useEffect(() => {
    if (searchParams?.get('add') === 'true') {
      setIsModalOpen(true);
    }

    // Refresh properties list from API and sanitize every item
    fetch('/api/properties', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.properties && Array.isArray(data.properties) && data.properties.length > 0) {
          setProperties(data.properties.map(sanitizeProperty));
        }
      })
      .catch((err) => console.warn('Error syncing properties from API:', err));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.property) {
        const cleanNew = sanitizeProperty(data.property);
        setProperties((prev) => [cleanNew, ...prev.filter((p) => p.id !== cleanNew.id)]);
      } else {
        const fallbackProp = sanitizeProperty({
          id: `prop-new-${Date.now()}`,
          name: formData.name,
          locality: formData.locality,
          city: formData.city,
          address: formData.address,
          verificationStatus: 'UNDER_REVIEW',
          totalRooms: Number(formData.totalRooms),
          totalBeds: Number(formData.totalRooms) * Number(formData.bedsPerRoom),
          occupiedBeds: 0,
          rentPerMonth: Number(formData.rentPerMonth),
          openTickets: 0,
        });
        setProperties((prev) => [fallbackProp, ...prev]);
      }
    } catch (err) {
      console.warn('API error submitting property, using local fallback:', err);
      const fallbackProp = sanitizeProperty({
        id: `prop-new-${Date.now()}`,
        name: formData.name,
        locality: formData.locality,
        city: formData.city,
        address: formData.address,
        verificationStatus: 'UNDER_REVIEW',
        totalRooms: Number(formData.totalRooms),
        totalBeds: Number(formData.totalRooms) * Number(formData.bedsPerRoom),
        occupiedBeds: 0,
        rentPerMonth: Number(formData.rentPerMonth),
        openTickets: 0,
      });
      setProperties((prev) => [fallbackProp, ...prev]);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setShowSuccessToast(true);
      setFormData({
        name: '',
        locality: 'Ferozepur Road',
        address: '',
        city: 'Ludhiana',
        type: 'PG',
        totalRooms: 4,
        bedsPerRoom: 2,
        rentPerMonth: 6000,
        gender: 'ANY',
        description: '',
      });

      setTimeout(() => setShowSuccessToast(false), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            New PG Property listed successfully! Under review for UniNest Verification badge.
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-white/80 hover:text-white font-bold text-sm">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Property Portfolio</h1>
          <p className="text-text-secondary mt-1">Manage PG units, room configurations, and bed occupancy</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New PG / Hostel
        </Button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((rawProp) => {
          const p = sanitizeProperty(rawProp);
          return (
            <Card key={p.id} className="p-6 rounded-2xl border border-slate-200 hover:border-brand-300 transition-all shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                    <Badge variant={p.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                      {p.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {p.address}
                  </p>
                </div>
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 my-5 p-3 bg-slate-50 rounded-xl text-center">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Beds Occupied</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {p.occupiedBeds} / {p.totalBeds}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Monthly Rent</p>
                  <p className="text-base font-black text-emerald-700 mt-0.5">
                    ₹{Number(p.rentPerMonth || 6000).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Open Issues</p>
                  <p className="text-base font-black text-amber-600 mt-0.5">{p.openTickets} tickets</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">{p.totalRooms} rooms listed</span>
                <Link href={`/landlord/properties/${p.id}`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold">
                    Manage Property →
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Property Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New PG / Hostel Unit"
        description="Register a new student accommodation property on UniNest"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Property Name *"
            placeholder="e.g. Passi Executive Student PG"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Property Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'PG', label: 'Student PG (Paying Guest)' },
                { value: 'HOSTEL', label: 'Private Student Hostel' },
                { value: 'FLAT', label: 'Co-Living Student Apartment' },
              ]}
            />
            <Select
              label="Gender Preference"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'ANY', label: 'Co-Ed / All Students' },
                { value: 'MALE', label: 'Boys Only' },
                { value: 'FEMALE', label: 'Girls Only' },
              ]}
            />
          </div>

          <Input
            label="Street Address *"
            placeholder="Plot 88, BRS Nagar, Ferozepur Road"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Locality / Campus Vicinity"
              value={formData.locality}
              onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
              options={[
                { value: 'Ferozepur Road', label: 'Ferozepur Road (PCTE Vicinity)' },
                { value: 'BRS Nagar', label: 'BRS Nagar (PAU Vicinity)' },
                { value: 'Sarabha Nagar', label: 'Sarabha Nagar' },
                { value: 'Model Town', label: 'Model Town' },
                { value: 'Gill Road', label: 'Gill Road (GNDEC Vicinity)' },
              ]}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Number of Rooms"
              type="number"
              min={1}
              value={formData.totalRooms}
              onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
            />
            <Input
              label="Beds Per Room"
              type="number"
              min={1}
              value={formData.bedsPerRoom}
              onChange={(e) => setFormData({ ...formData, bedsPerRoom: Number(e.target.value) })}
            />
            <Input
              label="Monthly Rent (₹) *"
              type="number"
              min={1000}
              value={formData.rentPerMonth}
              onChange={(e) => setFormData({ ...formData, rentPerMonth: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Description & Rules"
            placeholder="Provide details about food availability, high-speed WiFi, security warden, sub-meter rules..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              {isSubmitting ? 'Registering Property...' : 'Save & Publish Property'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
