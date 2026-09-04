'use me';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2, MapPin, ShieldCheck, Wifi, UtensilsCrossed, Shirt, Car,
  Zap, CheckCircle2, User, Star, AlertCircle, CalendarCheck, Phone, Check, ArrowLeft,
  Lock, Unlock, Navigation, MessageSquare, Clock, ShieldAlert, ChevronRight, Eye
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { ReservationConfirmationModal } from '@/components/booking/ReservationConfirmationModal';
import { ReservationTermsModal } from '@/components/booking/ReservationTermsModal';
import { DemoPaymentModal } from '@/components/booking/DemoPaymentModal';
import { VisitSchedulingModal } from '@/components/booking/VisitSchedulingModal';
import { UniNestMessagesModal } from '@/components/booking/UniNestMessagesModal';
import { HeartSaveButton } from '@/components/property/HeartSaveButton';

interface PropertyDetailClientProps {
  property: any;
  initialBooking?: any;
  initialVisit?: any;
}

export function PropertyDetailClient({ property, initialBooking, initialVisit }: PropertyDetailClientProps) {
  // State machine
  const [booking, setBooking] = useState(initialBooking);
  const [visit, setVisit] = useState(initialVisit);

  const isReserved = !!booking && ['RESERVED', 'VISIT_REQUESTED', 'VISIT_CONFIRMED', 'VISITED', 'CONFIRMED'].includes(booking.status);

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // Selected Room/Bed for reservation
  const selectedRoom = property.rooms?.[0] || { roomNumber: '204', rent: 600000, deposit: 1000000 };
  const selectedBedLabel = 'A';

  const minRent = property.rooms?.length > 0 ? Math.min(...property.rooms.map((r: any) => r.rent)) / 100 : 6000;
  const minDeposit = property.rooms?.length > 0 ? Math.min(...property.rooms.map((r: any) => r.deposit)) / 100 : 10000;
  const totalBeds = property.rooms?.reduce((acc: number, r: any) => acc + r.beds.length, 0) || 12;
  const availableBeds = property.rooms?.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0) || 4;
  const avgRating = property.reviews?.length > 0
    ? property.reviews.reduce((acc: number, r: any) => acc + r.overall, 0) / property.reviews.length
    : 4.8;

  // Unlocked vs Protected Address details
  const displayAddress = isReserved
    ? `${property.address}, ${property.city}, ${property.state} - ${property.pincode}`
    : `${property.locality || 'Model Town'}, ${property.city} (🔒 Street Address & House # Locked Until ₹399 Bed Reservation)`;

  const landlordName = property.landlord?.user?.name || 'Vikram Singh';
  const landlordPhone = isReserved
    ? (property.landlord?.user?.phone || '+91 9898989801')
    : '🔒 Unlocked after ₹399 reservation';

  // Handle successful ₹399 payment
  const handlePaymentSuccess = (data: { transactionId: string; address: string; landlordPhone: string }) => {
    setBooking({
      id: `bk-${Date.now()}`,
      status: 'RESERVED',
      reservationFee: 39900,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button */}
      <div>
        <Link href="/student/search" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to PG Search
        </Link>
      </div>

      {/* Reservation Status Banner */}
      {isReserved ? (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-lg shadow-emerald-700/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Unlock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase tracking-wide bg-white/25 px-2.5 py-0.5 rounded-full text-white text-[10px]">
                  ✓ Bed Reserved & Location Unlocked
                </span>
                <span className="text-xs text-emerald-100 font-semibold">Hold Expiry: 72 Hours</span>
              </div>
              <h3 className="font-bold text-base mt-0.5">Exact Property Address & Landlord Visit Activated</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowVisitModal(true)}
              className="flex-1 md:flex-none py-2 px-3.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              {visit ? `Visit: ${visit.status}` : 'Schedule Visit'}
            </button>
            <button
              onClick={() => setShowChatModal(true)}
              className="flex-1 md:flex-none py-2 px-3.5 bg-emerald-950/40 border border-emerald-300/40 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" />
              Message Landlord
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200/80 text-amber-900 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold block text-slate-900">Privacy Protection Mode Active:</strong>
              <span>Exact property location, house number, and direct landlord contact details are hidden until a ₹399 bed reservation is placed.</span>
            </div>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-3.5 rounded-xl transition-colors shadow-sm"
          >
            Reserve Bed (₹399)
          </button>
        </div>
      )}

      {/* Property Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{property.name}</h1>
              {property.verificationStatus === 'VERIFIED' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  UniNest Verified
                </span>
              )}
              <div className="ml-auto md:ml-0">
                <HeartSaveButton propertyId={property.id} variant="button" size="sm" />
              </div>
            </div>
            <p className="text-slate-600 flex items-start gap-1.5 text-xs font-medium">
              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isReserved ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span>{displayAddress}</span>
            </p>
            {property.collegeLinks?.length > 0 && (
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                {property.collegeLinks[0].distance?.toFixed(1) || '0.8'} km from {property.collegeLinks[0].college.collegeName}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col items-end justify-center min-w-[200px]">
            <span className="text-xs text-slate-500 font-semibold">Starting Rent</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-emerald-700">{formatINR(minRent)}</span>
              <span className="text-xs text-slate-500 font-medium">/month</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">Deposit: {formatINR(minDeposit)}</span>
          </div>
        </div>
      </div>

      {/* Property Photos */}
      {property.images && property.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-72 rounded-2xl overflow-hidden shadow-sm">
          <div className="md:col-span-2 h-full">
            <img src={property.images[0]} alt={property.name} className="w-full h-full object-cover" />
          </div>
          <div className="hidden md:flex flex-col gap-3 h-full">
            {property.images[1] ? (
              <img src={property.images[1]} alt={property.name} className="w-full h-[138px] object-cover" />
            ) : (
              <div className="w-full h-[138px] bg-slate-100 flex items-center justify-center text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
            )}
            {property.images[2] ? (
              <img src={property.images[2]} alt={property.name} className="w-full h-[138px] object-cover" />
            ) : (
              <div className="w-full h-[138px] bg-slate-100 flex items-center justify-center text-slate-400">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Layout Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h2 className="text-base font-extrabold text-slate-900">About this Property</h2>
            <p className="text-slate-600 text-xs leading-relaxed">{property.description || 'No description provided.'}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Gender</span>
                <span className="font-bold text-xs text-slate-900 mt-0.5 block">{property.gender}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Capacity</span>
                <span className="font-bold text-xs text-slate-900 mt-0.5 block">{totalBeds} Beds</span>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-semibold block">Available</span>
                <span className="font-extrabold text-xs text-emerald-700 mt-0.5 block">{availableBeds} Beds</span>
              </div>
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-semibold block">Rating</span>
                <span className="font-extrabold text-xs text-amber-700 mt-0.5 flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Privacy Map Indicator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Location & Map Access
              </h2>
              {isReserved ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" /> Exact Location Unlocked
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Approximate Radius View
                </span>
              )}
            </div>

            {/* Map Placeholder Graphic */}
            <div className="relative h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800"
                alt="Map Background"
                className={`w-full h-full object-cover ${!isReserved ? 'blur-[3px] opacity-60' : 'opacity-85'}`}
              />

              {!isReserved ? (
                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center p-4 text-center text-white">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mb-2 animate-pulse">
                    <Lock className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="font-extrabold text-sm">Approximate 200m Locality Area</h4>
                  <p className="text-xs text-slate-300 max-w-sm mt-1">
                    Exact building pin and Google Maps directions unlock instantly after reserving your bed (₹399).
                  </p>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-colors"
                  >
                    Unlock Exact Location (₹399)
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-900/20 flex flex-col items-center justify-center p-4 text-center text-white">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1 shadow-lg animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="bg-slate-900/80 px-3 py-1 rounded-lg text-xs font-bold text-white border border-slate-700">
                    {property.address}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(property.address || 'Model Town Ludhiana')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Open Directions in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Rooms & Bed Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Available Rooms & Beds</h2>
              <p className="text-xs text-slate-500">Select a bed to place your 72-hour ₹399 reservation hold.</p>
            </div>

            <div className="space-y-4">
              {property.rooms?.map((room: any) => (
                <div key={room.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">Room {room.roomNumber}</span>
                        <Badge variant="outline" size="sm">{room.sharing}-Sharing</Badge>
                        {room.hasAC && <Badge variant="info" size="sm">AC</Badge>}
                        {room.hasAttBath && <Badge variant="success" size="sm">Attached Bath</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Floor {room.floor}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">{formatINR(room.rent / 100)}</span>
                      <span className="text-xs text-slate-500">/mo</span>
                    </div>
                  </div>

                  {/* Bed Grid */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-700 mb-2">Beds in this Room:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {room.beds.map((bed: any) => {
                        const isAvailable = bed.status === 'AVAILABLE';
                        return (
                          <div
                            key={bed.id}
                            onClick={() => {
                              if (isAvailable && !isReserved) setShowConfirmModal(true);
                            }}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isAvailable
                                ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/50 cursor-pointer shadow-2xs'
                                : 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-900 block">Bed {bed.label}</span>
                            <span className={`text-[10px] font-extrabold uppercase mt-1 inline-block px-2 py-0.5 rounded-md ${
                              isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {bed.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">Bed Reservation</h3>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ₹399 Token
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Holds bed for 72 hours & unlocks exact visit coordinates.</p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Reservation Fee:</span>
                <span className="font-extrabold text-emerald-700">₹399 (Fully Refundable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Monthly Rent:</span>
                <span className="font-bold text-slate-900">From {formatINR(minRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Bed Hold Period:</span>
                <span className="font-bold text-slate-900">72 Hours</span>
              </div>
            </div>

            {!isReserved ? (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Reserve Bed Now (₹399)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{visit ? `Visit: ${visit.status}` : 'Schedule Property Visit'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowChatModal(true)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Landlord (In-App)</span>
                </button>
              </div>
            )}

            {/* Landlord Contact Info */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">Property Landlord</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center font-extrabold text-white text-sm">
                  {landlordName[0]}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{landlordName}</p>
                  <p className="text-xs text-slate-500 font-medium">{landlordPhone}</p>
                </div>
              </div>

              {!isReserved && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Landlord Rating:</span>
                    <span className="font-bold text-slate-900">4.8 ★</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Response Rate:</span>
                    <span className="font-bold text-slate-900">98%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-bold text-slate-900">&lt; 15 mins</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ALL MODALS */}
      <ReservationConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirmPayment={() => {
          setShowConfirmModal(false);
          setShowPaymentModal(true);
        }}
        onOpenTerms={() => setShowTermsModal(true)}
        property={{
          id: property.id,
          name: property.name,
          locality: property.locality,
          city: property.city,
        }}
        room={{
          roomNumber: selectedRoom.roomNumber,
          rent: selectedRoom.rent,
          deposit: selectedRoom.deposit,
        }}
        bedLabel={selectedBedLabel}
      />

      <ReservationTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        propertyName={property.name}
      />

      <DemoPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        property={{
          id: property.id,
          name: property.name,
        }}
      />

      <VisitSchedulingModal
        isOpen={showVisitModal}
        onClose={() => setShowVisitModal(false)}
        onSuccess={(v) => setVisit(v)}
        property={{
          id: property.id,
          name: property.name,
          locality: property.locality,
          city: property.city,
          landlordName: property.landlord?.user?.name,
        }}
        bookingId={booking?.id}
      />

      <UniNestMessagesModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        propertyName={property.name}
        landlordName={landlordName}
        bookingId={booking?.id}
        visitId={visit?.id}
      />
    </div>
  );
}
