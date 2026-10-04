'use client';

import React, { useState, useEffect } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/Shared';
import {
  Building2,
  BedDouble,
  Search,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  DollarSign,
  TrendingUp,
  Sliders,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { PropertyItem } from '@/lib/propertiesStore';
import {
  getLocalOverrides,
  saveLocalOverride,
  getLocalMessages,
  saveLocalMessage,
  getLocalAuditEvents,
  saveLocalAuditEvent,
} from '@/lib/messagesStorage';

interface AdminPropertiesDirectoryProps {
  initialProperties: PropertyItem[];
}

export function AdminPropertiesDirectoryClient({ initialProperties }: AdminPropertiesDirectoryProps) {
  const [properties, setProperties] = useState<PropertyItem[]>(() => {
    const list = initialProperties || [];
    if (typeof window !== 'undefined') {
      const overrides = getLocalOverrides();
      return list.map((p) => {
        const o = overrides[p.id];
        return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
      });
    }
    return list;
  });

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIVE' | 'DELISTED' | 'FULL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropForInventory, setSelectedPropForInventory] = useState<PropertyItem | null>(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delist / Publish toggles
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>({
    'prop-pcte-1': false, // currently rejected/suspended from live search
    'prop-pcte-2': true,
    'prop-demo-03': true,
  });

  useEffect(() => {
    const overrides = getLocalOverrides();
    fetch('/api/properties', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.properties && Array.isArray(data.properties) && data.properties.length > 0) {
          const merged = data.properties.map((p: any) => {
            const o = overrides[p.id];
            return o ? { ...p, verificationStatus: o.verificationStatus, rejectionReason: o.rejectionReason } : p;
          });
          setProperties(merged);
        }
      })
      .catch(() => {});
  }, []);

  // Compute Platform KPIs
  const totalAccommodations = properties.length;
  const totalBeds = properties.reduce((acc, p) => acc + (p.totalBeds || 12), 0);
  const totalOccupied = properties.reduce((acc, p) => acc + (p.occupiedBeds || 0), 0);
  const overallOccupancyPct = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;
  const totalRentalVolume = properties.reduce(
    (acc, p) => acc + (p.totalBeds || 12) * (p.rentPerMonth || 6000),
    0
  );
  const totalOpenTickets = properties.reduce((acc, p) => acc + (p.openTickets || 0), 0);

  const toggleVisibility = (propertyId: string) => {
    setVisibilityMap((prev) => {
      const next = !prev[propertyId];
      const target = properties.find((p) => p.id === propertyId);
      const name = target?.name || 'Property';

      setToastMessage(next ? `${name} is now LIVE on student search!` : `${name} has been delisted from student search.`);
      setTimeout(() => setToastMessage(null), 3500);

      // Log in audit storage
      saveLocalAuditEvent({
        id: `evt-${Date.now()}`,
        propertyId,
        propertyName: name,
        actorRole: 'ADMIN',
        actorName: 'UniNest Admin',
        action: next ? 'VERIFIED' : 'REJECTED',
        title: next ? 'Listing Search Visibility Enabled' : 'Listing Search Visibility Paused/Delisted',
        timestamp: new Date().toISOString(),
      });

      return { ...prev, [propertyId]: next };
    });
  };

  const filteredProperties = properties.filter((p) => {
    const isLive = visibilityMap[p.id] !== false && p.verificationStatus === 'VERIFIED';
    const isFull = (p.occupiedBeds || 0) >= (p.totalBeds || 12);

    if (activeFilter === 'LIVE' && !isLive) return false;
    if (activeFilter === 'DELISTED' && isLive) return false;
    if (activeFilter === 'FULL' && !isFull) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        (p.ownerName || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm animate-slide-down">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Property Portfolio & Accommodation Directory
          </h1>
          <p className="text-text-secondary mt-1">
            Manage student accommodation units, room configurations, bed occupancy, live search visibility, and rental operations.
          </p>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Properties"
          value={totalAccommodations}
          subtitle="3 accommodation hubs"
          icon={<Building2 className="w-5 h-5 text-brand-600" />}
          color="brand"
        />
        <StatCard
          title="Total Bed Capacity"
          value={totalBeds}
          subtitle={`${totalOccupied} occupied • ${totalBeds - totalOccupied} vacant`}
          icon={<BedDouble className="w-5 h-5 text-indigo-600" />}
          color="blue"
        />
        <StatCard
          title="Overall Occupancy"
          value={`${overallOccupancyPct}%`}
          subtitle={`${totalOccupied} of ${totalBeds} total beds`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          color="blue"
        />
        <StatCard
          title="Monthly Rental Flow"
          value={`₹${(totalRentalVolume / 1000).toFixed(0)}k/mo`}
          subtitle="Direct escrow billing"
          icon={<DollarSign className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="Maintenance Tickets"
          value={totalOpenTickets}
          subtitle="Active property issues"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          color="red"
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: `All Accommodations (${properties.length})` },
              { id: 'LIVE', label: 'Live on Student Search (2)' },
              { id: 'DELISTED', label: 'Delisted / Suspended (1)' },
              { id: 'FULL', label: '100% Full Occupancy (1)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PG name, locality, landlord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </Card>

      {/* Inventory & Operations Table */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider">
                <th className="py-3.5 px-4">Accommodation & Location</th>
                <th className="py-3.5 px-4">Landlord / Operator</th>
                <th className="py-3.5 px-4">Inventory & Occupancy</th>
                <th className="py-3.5 px-4">Pricing & Escrow</th>
                <th className="py-3.5 px-4">Search Visibility</th>
                <th className="py-3.5 px-4 text-right">Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.map((p) => {
                const isLive = visibilityMap[p.id] !== false && p.verificationStatus === 'VERIFIED';
                const bedsTarget = p.totalBeds || 12;
                const occTarget = p.occupiedBeds || 0;
                const occPct = Math.round((occTarget / bedsTarget) * 100);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Accommodation Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Building2 className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                            {p.name}
                          </div>
                          <p className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                            {p.address}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full border border-slate-200">
                              {p.type || 'PG'} • Co-Ed
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {p.totalRooms || 6} Rooms Configured
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Landlord Contact */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {p.ownerName || 'Vikram Singh'}
                        </div>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {p.ownerEmail || 'landlord@uninest.in'}
                        </p>
                        <p className="text-slate-500 text-[11px] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          +91 98765-43210
                        </p>
                      </div>
                    </td>

                    {/* Inventory & Bed Occupancy */}
                    <td className="py-4 px-4 min-w-[160px]">
                      <div className="space-y-1.5 min-w-[150px]">
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-slate-900">
                            {occTarget} / {bedsTarget} Beds
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                              occPct >= 100
                                ? 'bg-indigo-100 text-indigo-800'
                                : occPct >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {occPct}% Full
                          </span>
                        </div>
                        <ProgressBar value={occPct} size="sm" color={occPct >= 100 ? 'blue' : 'brand'} showPercent={false} />
                        <span className="text-[10px] text-slate-500 block pt-0.5 font-medium">
                          {bedsTarget - occTarget > 0
                            ? `✓ ${bedsTarget - occTarget} vacancies available`
                            : '⚡ Zero vacancies (Waitlist active)'}
                        </span>
                      </div>
                    </td>

                    {/* Pricing & Escrow */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-emerald-700 text-sm">
                          ₹{Number(p.rentPerMonth || 6000).toLocaleString('en-IN')}/mo
                        </div>
                        <p className="text-slate-500 text-[10px]">
                          Security: ₹{(Number(p.rentPerMonth || 6000) * 2).toLocaleString('en-IN')} (Escrow)
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          Utility: Sub-metered (₹9/unit)
                        </p>
                      </div>
                    </td>

                    {/* Search Visibility Toggle */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleVisibility(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                        >
                          {isLive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {isLive ? 'Active in Search' : 'Delisted'}
                        </button>
                        <span className="text-[10px] text-slate-400 block">
                          {isLive ? 'Visible to all students' : 'Hidden from search results'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedPropForInventory(p);
                            setInventoryModalOpen(true);
                          }}
                          className="text-xs font-bold border-slate-300 hover:bg-slate-100"
                        >
                          <Layers className="w-3.5 h-3.5 mr-1 text-brand-600" />
                          View Rooms & Beds
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Room & Bed Inventory Inspection Modal */}
      <Modal
        isOpen={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        title={`Room & Bed Matrix — ${selectedPropForInventory?.name || 'Property'}`}
        size="lg"
      >
        {selectedPropForInventory && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 text-sm">{selectedPropForInventory.name}</span>
                <p className="text-slate-500 text-xs mt-0.5">{selectedPropForInventory.address}</p>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-brand-700 text-sm">
                  {selectedPropForInventory.occupiedBeds || 0} / {selectedPropForInventory.totalBeds || 12} Beds Occupied
                </span>
                <span className="text-[11px] text-slate-400 block">
                  ₹{Number(selectedPropForInventory.rentPerMonth || 6000).toLocaleString('en-IN')}/mo per bed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {[1, 2, 3, 4, 5, 6].map((roomNum) => {
                const roomStr = selectedPropForInventory.id === 'prop-pcte-1' ? `20${roomNum}` : `10${roomNum}`;
                const isRoomFull = roomNum <= 4;

                return (
                  <div key={roomNum} className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Room {roomStr} (Double Sharing)</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                          isRoomFull ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isRoomFull ? 'Fully Occupied' : '1 Bed Available'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold">
                        Bed A: OCCUPIED (Rahul Sharma)
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          isRoomFull
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        Bed B: {isRoomFull ? 'OCCUPIED' : 'VACANT'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <Button size="sm" onClick={() => setInventoryModalOpen(false)} className="bg-brand-600 text-white font-bold">
                Close Inventory Matrix
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
