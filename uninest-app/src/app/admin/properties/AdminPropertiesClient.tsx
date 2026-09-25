'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Building2, ShieldCheck, CheckCircle2, XCircle, Clock, MapPin, Search, Eye } from 'lucide-react';
import { PropertyItem } from '@/lib/propertiesStore';

interface AdminPropertiesClientProps {
  initialProperties: PropertyItem[];
}

export function AdminPropertiesClient({ initialProperties }: AdminPropertiesClientProps) {
  const [properties, setProperties] = useState<PropertyItem[]>(initialProperties);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNDER_REVIEW' | 'VERIFIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const underReviewCount = properties.filter(
    (p) => p.verificationStatus === 'UNDER_REVIEW' || p.verificationStatus === 'PENDING' || p.verificationStatus === 'SUBMITTED'
  ).length;

  const handleStatusChange = async (propertyId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setActionLoadingId(propertyId);
    try {
      const res = await fetch('/api/admin/properties/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, status: newStatus }),
      });

      if (res.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, verificationStatus: newStatus } : p))
        );
        setToastMessage(
          newStatus === 'VERIFIED'
            ? 'Property verified successfully! It is now published live for student booking.'
            : 'Property listing has been marked as Rejected.'
        );
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error('Failed to update verification status:', err);
      alert('Error updating status.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const isUnderReview = p.verificationStatus === 'UNDER_REVIEW' || p.verificationStatus === 'PENDING' || p.verificationStatus === 'SUBMITTED';
    const isVerified = p.verificationStatus === 'VERIFIED';

    if (activeTab === 'UNDER_REVIEW' && !isUnderReview) return false;
    if (activeTab === 'VERIFIED' && !isVerified) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5" />
            {toastMessage}
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-bold text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Property Management & Verification</h1>
          <p className="text-slate-500 text-sm mt-1">
            Review landlord property submissions, verify safety & compliance, and publish listings live.
          </p>
        </div>

        {underReviewCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{underReviewCount} property submission(s) pending review</span>
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Listings ({properties.length})
          </button>

          <button
            onClick={() => setActiveTab('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'UNDER_REVIEW'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pending Review ({underReviewCount})
          </button>

          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'VERIFIED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified ({properties.filter((p) => p.verificationStatus === 'VERIFIED').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by PG name or owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Property Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Property Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Owner / Landlord</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Location & Rent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((p) => {
                  const isUnderReview =
                    p.verificationStatus === 'UNDER_REVIEW' ||
                    p.verificationStatus === 'PENDING' ||
                    p.verificationStatus === 'SUBMITTED';
                  const isVerified = p.verificationStatus === 'VERIFIED';
                  const isRejected = p.verificationStatus === 'REJECTED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-brand-600 shrink-0" />
                          {p.name}
                        </div>
                        {p.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{p.description}</p>}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <span className="font-semibold text-slate-900">{p.ownerName || 'Landlord Partner'}</span>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        <p className="flex items-center gap-1 font-medium text-slate-900">
                          <MapPin className="w-3.5 h-3.5 text-brand-600" /> {p.locality}, {p.city}
                        </p>
                        <p className="text-emerald-700 font-bold mt-0.5">₹{p.rentPerMonth.toLocaleString()}/mo</p>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <span className="font-bold text-slate-900">{p.totalBeds || (p.totalRooms * 2)} beds</span>
                        <span className="text-slate-500 block text-[11px]">{p.totalRooms} rooms</span>
                      </td>

                      <td className="px-4 py-4">
                        {isVerified && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                          </span>
                        )}
                        {isUnderReview && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> UNDER REVIEW
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnderReview ? (
                            <>
                              <Button
                                size="sm"
                                disabled={actionLoadingId === p.id}
                                onClick={() => handleStatusChange(p.id, 'VERIFIED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Approve & Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === p.id}
                                onClick={() => handleStatusChange(p.id, 'REJECTED')}
                                className="text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
                              >
                                Reject
                              </Button>
                            </>
                          ) : isVerified ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(p.id, 'REJECTED')}
                              className="text-slate-500 hover:text-red-600 text-xs"
                            >
                              Revoke Badge
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(p.id, 'VERIFIED')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No properties found</p>
                    <p className="text-xs text-slate-400">Try changing your tab or search term.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
