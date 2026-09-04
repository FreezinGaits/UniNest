'use me';
'use client';

import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, CheckCircle2, X, ArrowRight, MessageSquare, Loader2, Sparkles, Building2 } from 'lucide-react';

interface VisitSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (visit: any) => void;
  property: {
    id: string;
    name: string;
    locality?: string;
    city: string;
    landlordName?: string;
  };
  bookingId?: string;
}

const TIME_SLOTS = [
  '10:00 AM – 11:00 AM',
  '11:30 AM – 12:30 PM',
  '02:00 PM – 03:00 PM',
  '04:00 PM – 05:00 PM',
  '05:30 PM – 06:30 PM',
  '06:30 PM – 07:30 PM',
];

export function VisitSchedulingModal({
  isOpen,
  onClose,
  onSuccess,
  property,
  bookingId,
}: VisitSchedulingModalProps) {
  const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState('04:00 PM – 05:00 PM');
  const [alternativeSlot, setAlternativeSlot] = useState('06:30 PM – 07:30 PM');
  const [visitorCount, setVisitorCount] = useState(1);
  const [notes, setNotes] = useState('Visiting with parents to check room and mess facility.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/visits/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          bookingId,
          scheduledDate,
          timeSlot,
          alternativeSlot,
          visitorCount,
          notes,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess(data.visit);
          onClose();
        }, 1800);
      } else {
        alert(data.error || 'Failed to submit visit request');
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('Server error requesting visit');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 space-y-0">
        {!isSuccess ? (
          <>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-300 bg-indigo-900/50 px-2.5 py-0.5 rounded-full border border-indigo-700/50 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                UniNest Visit Scheduler
              </div>
              <h3 className="text-xl font-extrabold">Schedule Property Visit</h3>
              <p className="text-xs text-slate-300">
                Choose a time slot to visit <span className="font-bold text-white">{property.name}</span>
              </p>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Landlord Availability Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center gap-2.5 text-xs text-indigo-950">
                <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Landlord <strong>{property.landlordName || 'Vikram Singh'}</strong> is available Mon–Sat (10 AM – 7:30 PM). Counter-proposals supported.
                </span>
              </div>

              {/* Date & Visitor Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Number of Visitors</label>
                  <select
                    value={visitorCount}
                    onChange={(e) => setVisitorCount(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={1}>1 Person (Student only)</option>
                    <option value={2}>2 Persons (With parent/friend)</option>
                    <option value={3}>3+ Persons (Family visit)</option>
                  </select>
                </div>
              </div>

              {/* Time Slot Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Primary Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        timeSlot === slot
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alternative Time Slot */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alternative Time Slot (Optional Backup)</label>
                <select
                  value={alternativeSlot}
                  onChange={(e) => setAlternativeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Note for Landlord (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention any specific requests (e.g., check room 204, inspect mess, etc.)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Visit Appointment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Visit Request Sent!</h3>
            <p className="text-xs text-slate-600">
              Your visit request for <strong>{scheduledDate} ({timeSlot})</strong> has been dispatched to the landlord. You will receive an in-app notification upon confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
