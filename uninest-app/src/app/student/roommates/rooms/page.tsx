'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Home, Sparkles, Building2, MapPin, CheckCircle2,
  DollarSign, BedDouble, CalendarCheck, ShieldCheck, Heart, Eye,
  Navigation, Users, Calendar, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { DemoPaymentModal } from '@/components/booking/DemoPaymentModal';
import { VisitSchedulingModal } from '@/components/booking/VisitSchedulingModal';

export default function MatchedRoommateRoomsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId') || '';
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyForPayment, setSelectedPropertyForPayment] = useState<any | null>(null);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<any | null>(null);

  useEffect(() => {
    fetchCompatibleRooms();
  }, []);

  const fetchCompatibleRooms = async () => {
    setLoading(true);
    try {
      // Call proper properties search API endpoint
      const res = await fetch('/api/properties/search?locality=Ferozepur Road');
      const data = await res.json();
      if (data.properties && data.properties.length > 0) {
        setProperties(data.properties);
      } else {
        // High-fidelity fallback properties near PCTE for demo
        setProperties(getFallbackProperties());
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setProperties(getFallbackProperties());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackProperties = () => [
    {
      id: 'prop-pcte-smart-residency-ludhiana',
      name: 'PCTE Smart Student Residency',
      address: 'Passi Nagar, Ferozepur Road, Ludhiana',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      minBaseRent: 12000,
      trueMonthlyCost: 14200,
      commuteTime: '5 mins to PCTE Campus',
      availBeds: 4,
      verificationStatus: 'VERIFIED',
      images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
      rooms: [
        { id: 'room-1', sharing: 2, rent: 12000, deposit: 12000, hasAC: true }
      ],
      wifiAvailable: true,
      foodAvailable: true,
      laundryAvailable: true,
    },
    {
      id: 'prop-campusnest-luxury-pg-ludhiana',
      name: 'CampusNest Executive PG & Hostel',
      address: 'Gurdev Nagar, Ferozepur Road, Ludhiana',
      locality: 'Ferozepur Road',
      city: 'Ludhiana',
      minBaseRent: 13000,
      trueMonthlyCost: 15200,
      commuteTime: '8 mins to PCTE Campus',
      availBeds: 6,
      verificationStatus: 'VERIFIED',
      images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
      rooms: [
        { id: 'room-2', sharing: 2, rent: 13000, deposit: 13000, hasAC: true }
      ],
      wifiAvailable: true,
      foodAvailable: true,
      laundryAvailable: true,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link href={matchId ? `/student/roommates/matches/${matchId}/chat` : '/student/roommates/my-requests'}>
            <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2 rounded-xl font-medium">
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-600" />
              Back to Roommate Chat
            </Button>
          </Link>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Joint Roommate PG Engine
          </span>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                91% Compatibility Match
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Shared PG Accommodation for Rahul & Aman
              </h1>
              <p className="text-xs md:text-sm text-emerald-100 mt-1.5 max-w-2xl leading-relaxed">
                These double-sharing PG rooms match both your budget (₹5,000–₹7,000/each), campus locality (Ferozepur Road near PCTE), AC, Wi-Fi, and study routines.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-center shrink-0 min-w-[160px]">
              <div className="text-xs text-emerald-100 font-semibold mb-0.5">50 / 50 Split Monthly Rent</div>
              <div className="text-2xl font-black text-white">₹6,000</div>
              <div className="text-[11px] text-emerald-100 mt-0.5">per student / month</div>
            </div>
          </div>
        </div>

        {/* Room Listings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Compatible Double-Sharing PG Rooms ({properties.length})
            </h2>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              📍 Near PCTE Campus
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">Finding compatible double-sharing rooms...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((prop) => {
                const totalRent = prop.minBaseRent || prop.rent || 12000;
                const splitRent = Math.round(totalRent / 2);
                const trueCost = prop.trueMonthlyCost || totalRent + 2200;
                const splitTrueCost = Math.round(trueCost / 2);

                return (
                  <div
                    key={prop.id}
                    className="bg-white border border-slate-200 hover:border-emerald-400 transition-all p-5 rounded-2xl shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative mb-4 overflow-hidden rounded-xl">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}
                          alt={prop.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prop.verificationStatus === 'VERIFIED' && (
                          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified PG
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          {prop.availBeds || 4} Beds Available
                        </div>
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                            {prop.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center mt-0.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                            {prop.locality || 'Ferozepur Road'}, {prop.city || 'Ludhiana'}
                          </p>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0">
                          {prop.commuteTime || '5 mins to PCTE'}
                        </span>
                      </div>

                      {/* Split Rent Cost Breakdown Card */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 my-4 grid grid-cols-2 gap-3 text-xs">
                        <div className="border-r border-slate-200 pr-2">
                          <span className="text-slate-500 block text-[11px] font-medium">Total Room Rent:</span>
                          <span className="text-slate-900 font-bold text-sm">₹{totalRent.toLocaleString()}/mo</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">2-Bed Double Sharing</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Your 50/50 Split Rent:</span>
                          <span className="text-emerald-700 font-black text-base">₹{splitRent.toLocaleString()}/mo</span>
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            True Cost: ~₹{splitTrueCost.toLocaleString()}/each
                          </span>
                        </div>
                      </div>

                      {/* Amenity Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">🛏️ Double Sharing</span>
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">❄️ AC Room</span>
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">📶 High-Speed Wi-Fi</span>
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium">🍱 3 Meals Included</span>
                      </div>
                    </div>

                    {/* Joint Action CTAs */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedPropertyForVisit(prop)}
                        variant="secondary"
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs py-2.5 rounded-xl font-semibold"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-600" />
                        Schedule Visit
                      </Button>

                      <Button
                        onClick={() => setSelectedPropertyForPayment(prop)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 mr-1" />
                        Reserve Bed Together
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Booking & Payment Modal */}
      {selectedPropertyForPayment && (
        <DemoPaymentModal
          isOpen={!!selectedPropertyForPayment}
          onClose={() => setSelectedPropertyForPayment(null)}
          onSuccess={() => {
            setSelectedPropertyForPayment(null);
            router.push('/student/bookings');
          }}
          property={{
            id: selectedPropertyForPayment.id,
            name: selectedPropertyForPayment.name,
          }}
          roomId={selectedPropertyForPayment.rooms?.[0]?.id || 'room-1'}
          bedId="bed-1"
        />
      )}

      {/* Interactive Visit Scheduling Modal */}
      {selectedPropertyForVisit && (
        <VisitSchedulingModal
          isOpen={!!selectedPropertyForVisit}
          onClose={() => setSelectedPropertyForVisit(null)}
          onSuccess={() => {
            setSelectedPropertyForVisit(null);
            alert('🎉 Visit scheduled! Both you and your roommate have received confirmation.');
          }}
          property={{
            id: selectedPropertyForVisit.id,
            name: selectedPropertyForVisit.name,
            locality: selectedPropertyForVisit.locality,
            city: selectedPropertyForVisit.city || 'Ludhiana',
          }}
        />
      )}
    </div>
  );
}
