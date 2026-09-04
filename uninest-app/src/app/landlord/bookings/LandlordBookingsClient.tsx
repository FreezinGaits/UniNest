'use me';
'use client';

import React, { useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, XCircle, RefreshCw, MessageSquare, User, Building2, ShieldCheck, MapPin } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface LandlordBookingsClientProps {
  bookings: any[];
  visits: any[];
}

export function LandlordBookingsClient({ bookings: initialBookings, visits: initialVisits }: LandlordBookingsClientProps) {
  const [visits, setVisits] = useState(initialVisits);
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Counter proposal state
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterSlot, setCounterSlot] = useState('06:00 PM – 07:00 PM');
  const [counterReason, setCounterReason] = useState('Earlier slot is occupied. Proposed evening slot.');

  const handleRespondVisit = async (visitId: string, action: 'ACCEPT' | 'COUNTER_PROPOSE' | 'DECLINE') => {
    setLoadingId(visitId);
    try {
      const res = await fetch('/api/visits/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId,
          action,
          counterSlot: action === 'COUNTER_PROPOSE' ? counterSlot : undefined,
          counterReason: action === 'COUNTER_PROPOSE' ? counterReason : undefined,
        }),
      });

      const data = await res.json();
      setLoadingId(null);

      if (data.success && data.visit) {
        setVisits((prev) =>
          prev.map((v) => (v.id === visitId ? { ...v, status: data.visit.status, counterSlot: data.visit.counterSlot } : v))
        );
        setCounterId(null);
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      setLoadingId(null);
      alert('Failed to respond to visit request');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Landlord Booking & Visit Control</h1>
          <p className="text-xs text-slate-600 mt-1">
            Manage ₹399 bed reservations, property visit scheduling requests, and student communications.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CalendarCheck className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      {/* SECTION 1: VISITS MANAGEMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Property Visit Appointments ({visits.length})
          </h2>
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
            Real-time Slot Control
          </span>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            No visit appointments scheduled yet.
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:bg-white transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {v.student?.name?.[0] || 'S'}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{v.student?.name || 'Rahul Sharma'}</h4>
                      <p className="text-xs text-slate-500 font-medium">{v.property?.name || 'CampusNest Residency'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      📅 {new Date(v.scheduledDate).toLocaleDateString('en-IN')} ({v.timeSlot})
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      v.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      v.status === 'COUNTER_PROPOSED' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      v.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>

                {v.notes && (
                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    "{v.notes}"
                  </p>
                )}

                {/* Landlord Action Controls */}
                {v.status === 'REQUESTED' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => handleRespondVisit(v.id, 'DECLINE')}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => setCounterId(counterId === v.id ? null : v.id)}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Suggest Another Time
                    </button>
                    <button
                      disabled={loadingId === v.id}
                      onClick={() => handleRespondVisit(v.id, 'ACCEPT')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept Visit
                    </button>
                  </div>
                )}

                {/* Counter Proposal Form */}
                {counterId === v.id && (
                  <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl space-y-2 text-xs">
                    <span className="font-bold text-amber-900 block">Propose Alternative Time Slot to Student</span>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={counterSlot}
                        onChange={(e) => setCounterSlot(e.target.value)}
                        className="bg-white border border-amber-300 rounded-lg p-2 font-semibold text-slate-900"
                      >
                        <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                        <option value="02:00 PM – 03:00 PM">02:00 PM – 03:00 PM</option>
                        <option value="06:00 PM – 07:00 PM">06:00 PM – 07:00 PM</option>
                        <option value="07:00 PM – 08:00 PM">07:00 PM – 08:00 PM</option>
                      </select>
                      <input
                        type="text"
                        value={counterReason}
                        onChange={(e) => setCounterReason(e.target.value)}
                        placeholder="Reason for change..."
                        className="bg-white border border-amber-300 rounded-lg p-2 text-slate-900"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setCounterId(null)}
                        className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRespondVisit(v.id, 'COUNTER_PROPOSE')}
                        className="px-3 py-1 rounded bg-amber-600 text-white font-bold"
                      >
                        Send Counter Proposal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: BED RESERVATIONS & BOOKINGS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Bed Reservations & Tenant Bookings ({bookings.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 text-left">Property & Room</th>
                <th className="px-4 py-3 text-left">Token Fee</th>
                <th className="px-4 py-3 text-left">Booking Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    {b.user?.name || 'Rahul Sharma'}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {b.property?.name} • Room {b.bed?.room?.roomNumber || '204'} Bed {b.bed?.label || 'A'}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-700">
                    ₹399 (Paid)
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                      b.status === 'CONFIRMED' || b.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'RESERVED' ? 'bg-teal-100 text-teal-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {new Date(b.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
