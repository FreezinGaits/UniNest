'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import {
  BedDouble,
  Plus,
  CheckCircle2,
  Search,
  Filter,
  UserCheck,
  LogOut,
  Wrench,
  Phone,
  Building,
  Sparkles,
  Home,
} from 'lucide-react';
import { formatRupees } from '@/lib/utils';
import { getClientProperties } from '@/lib/clientProperties';
import {
  getPropertyRooms,
  checkInTenant,
  checkOutTenant,
  toggleBedStatus,
  addBedToRoom,
} from '@/lib/roomBedStore';

export interface BedItem {
  id: string;
  bedLabel: string;
  roomNo: string;
  property: string;
  propertyId?: string;
  roomId?: string;
  sharing: string;
  status: string;
  tenant: string;
  tenantPhone?: string;
  rent: number;
  isCustomProperty?: boolean;
}

interface BedInventoryClientProps {
  initialBeds: BedItem[];
}

export function BedInventoryClient({ initialBeds }: BedInventoryClientProps) {
  const searchParams = useSearchParams();
  const queryProperty = searchParams?.get('property');

  const [beds, setBeds] = useState<BedItem[]>(initialBeds);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'ALL' | 'OCCUPIED' | 'AVAILABLE' | 'RESERVED' | 'MAINTENANCE'
  >('ALL');
  const [filterProperty, setFilterProperty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Check-In modal state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [activeBed, setActiveBed] = useState<BedItem | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentRent, setStudentRent] = useState<number>(6000);

  // Check-Out modal state
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Rebuild bed inventory from client storage so custom properties (e.g. Meri kothi) appear seamlessly
  const reloadBedsFromStorage = () => {
    if (typeof window === 'undefined') return;
    try {
      const clientProps = getClientProperties();
      const customBedsList: BedItem[] = [];

      for (const prop of clientProps) {
        const rooms = getPropertyRooms(prop);
        for (const room of rooms) {
          for (const bed of room.beds) {
            customBedsList.push({
              id: bed.id,
              bedLabel: bed.bedLabel,
              roomNo: `Room ${room.roomNumber}`,
              property: prop.name,
              propertyId: prop.id,
              roomId: room.id,
              sharing: `${room.sharing || room.beds.length}-Sharing`,
              status: bed.status,
              tenant: bed.tenant || '—',
              tenantPhone: bed.tenantPhone || '',
              rent: bed.rent || room.rentRupees,
              isCustomProperty: true,
            });
          }
        }
      }

      // Merge: custom properties take precedence, followed by demo properties
      const demoBeds = initialBeds.filter(
        (b) => !clientProps.some((cp) => cp.name.toLowerCase() === b.property.toLowerCase())
      );
      const combined = [...customBedsList, ...demoBeds];

      if (combined.length > 0) {
        setBeds(combined);
      }

      // Default filter selection:
      // 1. If URL has ?property=..., select that
      // 2. Else if user created custom properties, default to the FIRST custom property ("Meri kothi")!
      if (queryProperty) {
        const matched = combined.find(
          (b) =>
            b.property.toLowerCase() === queryProperty.toLowerCase() ||
            b.propertyId === queryProperty
        );
        if (matched) {
          setFilterProperty(matched.property);
        }
      } else if (clientProps.length > 0) {
        setFilterProperty(clientProps[0].name);
      }
    } catch (err) {
      console.warn('Error loading beds from storage:', err);
    }
  };

  useEffect(() => {
    reloadBedsFromStorage();
  }, [queryProperty]);

  const uniqueProperties = Array.from(new Set(beds.map((b) => b.property)));
  const clientProps = typeof window !== 'undefined' ? getClientProperties() : [];
  const customPropNames = new Set(clientProps.map((p) => p.name));

  const defaultProperty = uniqueProperties[0] || 'Meri kothi';

  const [formData, setFormData] = useState({
    property: defaultProperty,
    roomNo: '101',
    bedLabelLetter: 'A',
    sharing: '3-Sharing',
    rent: 8000,
    status: 'AVAILABLE',
  });

  // Action: Add Bed Modal Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetProp = (typeof window !== 'undefined' ? getClientProperties() : []).find(
      (p) => p.name === formData.property
    );

    const newBed: BedItem = {
      id: `bed-new-${Date.now()}`,
      bedLabel: `Bed ${formData.roomNo}-${formData.bedLabelLetter}`,
      roomNo: `Room ${formData.roomNo}`,
      property: formData.property,
      propertyId: targetProp?.id,
      sharing: formData.sharing,
      status: formData.status,
      tenant: formData.status === 'OCCUPIED' ? 'New Tenant' : '—',
      rent: Number(formData.rent),
      isCustomProperty: true,
    };

    if (targetProp) {
      const rooms = getPropertyRooms(targetProp);
      const targetRoom = rooms.find((r) => r.roomNumber === formData.roomNo);
      if (targetRoom) {
        addBedToRoom(targetProp.id, targetRoom.id);
      }
    }

    setBeds((prev) => [newBed, ...prev]);
    setIsSubmitting(false);
    setIsModalOpen(false);
    showToast(`Added ${newBed.bedLabel} to ${newBed.property}!`);
  };

  // Action: Open Check-In
  const handleOpenCheckIn = (bed: BedItem) => {
    setActiveBed(bed);
    setStudentName('');
    setStudentPhone('');
    setStudentRent(bed.rent || 8000);
    setIsCheckInOpen(true);
  };

  // Action: Confirm Check-In
  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBed || !studentName.trim()) return;

    if (activeBed.propertyId && activeBed.roomId) {
      checkInTenant(activeBed.propertyId, activeBed.roomId, activeBed.id, {
        name: studentName.trim(),
        phone: studentPhone.trim() || '+91 98765-XXXXX',
        rent: studentRent,
      });
      reloadBedsFromStorage();
    } else {
      setBeds((prev) =>
        prev.map((b) =>
          b.id === activeBed.id
            ? { ...b, status: 'OCCUPIED', tenant: studentName.trim(), rent: studentRent }
            : b
        )
      );
    }

    setIsCheckInOpen(false);
    showToast(`Checked in ${studentName.trim()} to ${activeBed.bedLabel}!`);
  };

  // Action: Open Check-Out
  const handleOpenCheckOut = (bed: BedItem) => {
    setActiveBed(bed);
    setIsCheckOutOpen(true);
  };

  // Action: Confirm Check-Out
  const handleConfirmCheckOut = () => {
    if (!activeBed) return;

    if (activeBed.propertyId && activeBed.roomId) {
      checkOutTenant(activeBed.propertyId, activeBed.roomId, activeBed.id);
      reloadBedsFromStorage();
    } else {
      setBeds((prev) =>
        prev.map((b) => (b.id === activeBed.id ? { ...b, status: 'AVAILABLE', tenant: '—' } : b))
      );
    }

    setIsCheckOutOpen(false);
    showToast(`Checked out tenant from ${activeBed.bedLabel}. Bed is now vacant.`);
  };

  // Action: Toggle Maintenance
  const handleToggleMaintenance = (bed: BedItem) => {
    const nextStatus = bed.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';

    if (bed.propertyId && bed.roomId) {
      toggleBedStatus(bed.propertyId, bed.roomId, bed.id, nextStatus as any);
      reloadBedsFromStorage();
    } else {
      setBeds((prev) =>
        prev.map((b) => (b.id === bed.id ? { ...b, status: nextStatus, tenant: '—' } : b))
      );
    }
    showToast(`Status updated to ${nextStatus}.`);
  };

  // Beds scoped to the currently selected property (for metrics and calculations)
  const propertyScopedBeds =
    filterProperty === 'ALL' ? beds : beds.filter((b) => b.property === filterProperty);

  const totalTrackedBeds = propertyScopedBeds.length;
  const occupiedCount = propertyScopedBeds.filter(
    (b) => b.status === 'OCCUPIED' || b.status === 'RESERVED'
  ).length;
  const availableCount = propertyScopedBeds.filter((b) => b.status === 'AVAILABLE').length;

  const filteredBeds = propertyScopedBeds.filter((b) => {
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

  const isCurrentFilterCustom = customPropNames.has(filterProperty);

  return (
    <div className="space-y-6 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-slide-down border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Bed Inventory & Real-Time Matrix
            </h1>
            {isCurrentFilterCustom && (
              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                ✓ Your Active Listing
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time room-by-room bed allocation, offline student check-in, and instant availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Bed Unit
          </Button>
        </div>
      </div>

      {/* Property Selector Tabs / Switcher */}
      <div className="bg-slate-100/80 p-2 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-2">
            Selected Property:
          </span>

          {uniqueProperties.map((p) => {
            const isCustom = customPropNames.has(p);
            const isSelected = filterProperty === p;
            const propBedsCount = beds.filter((b) => b.property === p).length;

            return (
              <button
                key={p}
                onClick={() => setFilterProperty(p)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {isCustom ? (
                  <Home className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                ) : (
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{p}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {propBedsCount} Beds
                </span>
                {isCustom && (
                  <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded font-black">
                    MINE
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={() => setFilterProperty('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterProperty === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All Properties ({beds.length} Total)
          </button>
        </div>

        {filterProperty !== 'ALL' && (
          <div className="text-xs text-slate-600 px-2 font-medium">
            Viewing beds for: <strong className="text-slate-900">{filterProperty}</strong>
          </div>
        )}
      </div>

      {/* Dynamic Metric Cards (Accurately Scoped to Selected Property!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase">
            {filterProperty === 'ALL' ? 'Total Tracked Beds' : `Total Beds in ${filterProperty}`}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {totalTrackedBeds} beds
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isCurrentFilterCustom
              ? 'Configured exactly per your room registration'
              : `Across ${uniqueProperties.length} listings`}
          </p>
        </Card>

        <Card className="bg-blue-50/70 border border-blue-200">
          <p className="text-xs font-bold text-blue-800 uppercase">Occupied Beds</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
            {occupiedCount} occupied
          </p>
          <p className="text-[11px] text-blue-600 mt-0.5">
            {occupiedCount === 0
              ? 'No tenants yet — ready for first student booking'
              : 'Active tenant residents'}
          </p>
        </Card>

        <Card className="bg-emerald-50/70 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 uppercase">Vacant / Bookable</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {availableCount} available
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">
            Open for instant student booking or direct walk-in
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            {[
              { key: 'ALL', label: `All (${propertyScopedBeds.length})` },
              {
                key: 'AVAILABLE',
                label: `Vacant (${propertyScopedBeds.filter((b) => b.status === 'AVAILABLE').length})`,
              },
              {
                key: 'OCCUPIED',
                label: `Occupied (${propertyScopedBeds.filter((b) => b.status === 'OCCUPIED').length})`,
              },
              {
                key: 'RESERVED',
                label: `Reserved (${propertyScopedBeds.filter((b) => b.status === 'RESERVED').length})`,
              },
              {
                key: 'MAINTENANCE',
                label: `Maintenance (${propertyScopedBeds.filter((b) => b.status === 'MAINTENANCE').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap text-xs ${
                  filterStatus === tab.key
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search bed, room, tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Bed Identifier</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">PG Property</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Room Type</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Current Occupant</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">Monthly Rent</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBeds.map((b) => {
                const isOccupied = b.status === 'OCCUPIED' || b.status === 'RESERVED';
                const isMaint = b.status === 'MAINTENANCE';

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-slate-900">
                      <div>{b.bedLabel}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{b.roomNo}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span>{b.property}</span>
                        {b.isCustomProperty && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded">
                            YOUR PG
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        {b.sharing}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {isOccupied ? (
                        <div>
                          <span className="font-bold text-slate-900">👤 {b.tenant}</span>
                          {b.tenantPhone && (
                            <span className="text-[10px] text-slate-400 block">{b.tenantPhone}</span>
                          )}
                        </div>
                      ) : isMaint ? (
                        <span className="text-amber-700 text-[11px]">Under Maintenance</span>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-semibold">
                          ✓ Vacant — Ready for Booking
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-700">
                      {formatRupees(b.rent)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={isOccupied ? 'default' : b.status === 'AVAILABLE' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isOccupied ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenCheckOut(b)}
                            className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 border-rose-200 py-0.5 px-2.5 h-auto"
                          >
                            <LogOut className="w-3 h-3 mr-1" /> Check-Out
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleOpenCheckIn(b)}
                              className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-0.5 px-2.5 h-auto"
                            >
                              <UserCheck className="w-3 h-3 mr-1" /> Check-In
                            </Button>
                            <button
                              onClick={() => handleToggleMaintenance(b)}
                              title={isMaint ? 'Mark Available' : 'Set Maintenance'}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                            >
                              <Wrench className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================= MODAL: ADD BED UNIT ================= */}
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
            options={uniqueProperties.map((p) => ({ value: p, label: p }))}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
            >
              {isSubmitting ? 'Adding Bed...' : 'Save Bed Unit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: DIRECT CHECK-IN ================= */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title={`Check-In Student (${activeBed?.bedLabel || 'Bed'})`}
        description={`Property: ${activeBed?.property}`}
        size="md"
      >
        <form onSubmit={handleConfirmCheckIn} className="space-y-4">
          <Input
            label="Student Full Name *"
            placeholder="e.g. Gurpreet Singh"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Phone Number *"
            placeholder="e.g. +91 98765-43210"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />

          <Input
            label="Agreed Monthly Rent (₹) *"
            type="number"
            value={studentRent}
            onChange={(e) => setStudentRent(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: DIRECT CHECK-OUT ================= */}
      <Modal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        title={`Check-Out Tenant from ${activeBed?.bedLabel}`}
        description={`Current Occupant: ${activeBed?.tenant}`}
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Checking out this tenant will free up <strong>{activeBed?.bedLabel}</strong> at{' '}
            <strong>{activeBed?.property}</strong>, marking it as Available for student bookings.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckOutOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmCheckOut}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Release & Vacate Bed
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
