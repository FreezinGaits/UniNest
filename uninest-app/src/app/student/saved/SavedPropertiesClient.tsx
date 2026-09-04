'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Heart, MapPin, ShieldCheck, Star, BedDouble, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { HeartSaveButton } from '@/components/property/HeartSaveButton';
import { DemoPaymentModal } from '@/components/booking/DemoPaymentModal';
import { VisitSchedulingModal } from '@/components/booking/VisitSchedulingModal';

interface SavedPropertiesClientProps {
  initialSavedItems: any[];
}

export function SavedPropertiesClient({ initialSavedItems }: SavedPropertiesClientProps) {
  const [items, setItems] = useState<any[]>(initialSavedItems);
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState<any | null>(null);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<any | null>(null);

  const handleRemove = (propertyId: string) => {
    setItems((prev) => prev.filter((item) => item.property.id !== propertyId));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800/40 mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            Shortlisted Accommodations ({items.length})
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Saved Properties</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Compare your favorite PGs, reserve beds, or schedule visits anytime.
          </p>
        </div>
        <Link
          href="/student/search"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0"
        >
          <span>Find More PGs</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ id: savedId, savedAt, property }) => {
            const rooms = property.rooms || [];
            const minRent = rooms.length > 0 ? Math.min(...rooms.map((r: any) => r.rent)) : 600000;
            const minDeposit = rooms.length > 0 ? Math.min(...rooms.map((r: any) => r.deposit)) : 1000000;
            const foodCharge = property.foodAvailable ? (property.foodCharge || 180000) : 0;
            const maintCharge = property.maintenanceCharge || 30000;
            const trueMonthlyCost = minRent + foodCharge + maintCharge;

            const allBeds = rooms.flatMap((r: any) => r.beds || []);
            const availBedsCount = allBeds.filter((b: any) => b.status === 'AVAILABLE').length;
            const isAvailable = availBedsCount > 0;
            const collegeLink = property.collegeLinks?.[0];
            const distanceText = collegeLink ? `${collegeLink.distance} km from ${collegeLink.college?.name || 'PCTE'}` : (property.commuteTime || 'Near PCTE Campus');

            const savedDateStr = new Date(savedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <Card key={savedId} className="group overflow-hidden flex flex-col hover:shadow-xl transition-all border-slate-200/80">
                {/* Property Image & Heart Button Overlay */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <HeartSaveButton
                      propertyId={property.id}
                      initialSaved={true}
                      onToggle={(saved) => {
                        if (!saved) handleRemove(property.id);
                      }}
                    />
                  </div>

                  {/* Verification Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified PG
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant={isAvailable ? 'success' : 'danger'} size="sm">
                      {isAvailable ? `Available (${availBedsCount} beds)` : 'Currently Unavailable'}
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="line-clamp-1">{property.locality || property.address}, {property.city}</span>
                    </div>

                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                      📍 {distanceText}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {(property.amenities || ['Wi-Fi', 'Food', 'AC', 'CCTV']).slice(0, 4).map((amenity: string) => (
                      <span
                        key={amenity}
                        className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Monthly Rent:</span>
                      <span className="font-bold text-slate-900">{formatINR(minRent)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Deposit:</span>
                      <span className="font-semibold text-slate-700">{formatINR(minDeposit)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-indigo-900 font-extrabold text-[11px]">
                      <span>True Monthly Cost:</span>
                      <span className="text-indigo-600">{formatINR(trueMonthlyCost)}/mo</span>
                    </div>
                  </div>

                  {/* Saved Date */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>Saved on {savedDateStr}</span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <Link
                      href={`/student/search/${property.id}`}
                      className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    <button
                      onClick={() => setSelectedPropertyForPayment(property)}
                      className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <BedDouble className="w-3.5 h-3.5" />
                      <span>Reserve ₹399</span>
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="py-16 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-100 shadow-sm">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">No saved PGs yet</h3>
              <p className="text-xs text-slate-500">
                Save PGs you like while browsing and compare them later in your personal shortlist.
              </p>
            </div>

            <Link
              href="/student/search"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md transition-all mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find a PG</span>
            </Link>
          </div>
        </Card>
      )}

      {/* Demo Payment Modal */}
      {selectedPropertyForPayment && (
        <DemoPaymentModal
          isOpen={!!selectedPropertyForPayment}
          onClose={() => setSelectedPropertyForPayment(null)}
          onSuccess={() => {
            setSelectedPropertyForPayment(null);
            window.location.href = '/student/bookings';
          }}
          property={{
            id: selectedPropertyForPayment.id,
            name: selectedPropertyForPayment.name,
          }}
        />
      )}

      {/* Visit Scheduling Modal */}
      {selectedPropertyForVisit && (
        <VisitSchedulingModal
          isOpen={!!selectedPropertyForVisit}
          onClose={() => setSelectedPropertyForVisit(null)}
          onSuccess={() => setSelectedPropertyForVisit(null)}
          property={{
            id: selectedPropertyForVisit.id,
            name: selectedPropertyForVisit.name,
            locality: selectedPropertyForVisit.locality,
            city: selectedPropertyForVisit.city,
            landlordName: selectedPropertyForVisit.landlord?.user?.name,
          }}
        />
      )}
    </div>
  );
}
