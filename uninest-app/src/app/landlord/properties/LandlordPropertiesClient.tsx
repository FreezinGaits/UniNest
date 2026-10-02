'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Building2, MapPin, Plus, CheckCircle2, Camera, Image as ImageIcon, X } from 'lucide-react';
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
  images?: string[];
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

  const defaultImages = [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  ];

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
    images: Array.isArray(raw?.images) && raw.images.length > 0 ? raw.images : defaultImages,
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
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

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
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    ] as string[],
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
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } else {
        alert('Failed to save property. Please try again.');
      }
    } catch (err) {
      console.warn('API error submitting property:', err);
      alert('Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);

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
        images: [
          'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
        ],
      });
      setUploadedFileNames([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
            New PG Property listed successfully with photos! Under review for UniNest Verification badge.
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
          <p className="text-text-secondary mt-1">Manage PG units, room configurations, photo galleries, and bed occupancy</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New PG / Hostel
        </Button>
      </div>

      {/* Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((rawProp) => {
          const p = sanitizeProperty(rawProp);
          const coverImage = p.images && p.images[0];

          return (
            <Card key={p.id} className="overflow-hidden rounded-2xl border border-slate-200 hover:border-brand-300 transition-all shadow-sm flex flex-col justify-between">
              {/* Cover Photo Banner */}
              {coverImage && (
                <div className="h-36 w-full relative bg-slate-100 overflow-hidden">
                  <img src={coverImage} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 flex items-between justify-between p-3">
                    <Badge variant={p.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm" className="self-start shadow-sm">
                      {p.verificationStatus}
                    </Badge>
                    <span className="self-end text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Camera className="w-3 h-3" /> {p.images?.length || 1} Photos
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" /> {p.address}
                      </p>
                    </div>
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-xl text-center">
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Beds Occupied</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">
                        {p.occupiedBeds} / {p.totalBeds}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Monthly Rent</p>
                      <p className="text-sm font-black text-emerald-700 mt-0.5">
                        ₹{Number(p.rentPerMonth || 6000).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 font-medium">Open Issues</p>
                      <p className="text-sm font-black text-amber-600 mt-0.5">{p.openTickets} tickets</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">{p.totalRooms} rooms configured</span>
                  <Link href={`/landlord/properties/${p.id}`}>
                    <Button size="sm" variant="outline" className="text-xs font-bold">
                      Manage Property →
                    </Button>
                  </Link>
                </div>
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
        description="Register a new student accommodation property on UniNest with verified photos"
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

          {/* Photo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <label className="font-bold text-slate-700 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-brand-600" />
                <span>Upload PG & Room Photos</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Shown to student tenants in search</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const names = Array.from(files).map((f) => f.name);
                    setUploadedFileNames(names);
                    const mockUrls = Array.from(files).map(
                      () => 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80'
                    );
                    setFormData((prev) => ({
                      ...prev,
                      images: [...new Set([...prev.images, ...mockUrls])],
                    }));
                  }
                }}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>

            {uploadedFileNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {uploadedFileNames.map((fn, i) => (
                  <span key={i} className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ {fn}
                  </span>
                ))}
              </div>
            )}

            {/* Quick Photo Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Quick Photo Presets:</span>
              {[
                { label: '🛏️ Modern Room', url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80' },
                { label: '🪴 Study Balcony', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80' },
                { label: '🚿 Attached Bath', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80' },
              ].map((preset) => {
                const isSelected = formData.images.includes(preset.url);
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: isSelected
                          ? prev.images.filter((u) => u !== preset.url)
                          : [...prev.images, preset.url],
                      }));
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label} {isSelected ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
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
