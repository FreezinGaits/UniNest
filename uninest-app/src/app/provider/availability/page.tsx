'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle2, Zap, MapPin, Users, Calendar, Save, Check } from 'lucide-react';

interface DaySchedule {
  day: string;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  activeTechs: number;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', morning: true, afternoon: true, evening: true, activeTechs: 4 },
  { day: 'Tuesday', morning: true, afternoon: true, evening: true, activeTechs: 4 },
  { day: 'Wednesday', morning: true, afternoon: true, evening: true, activeTechs: 4 },
  { day: 'Thursday', morning: true, afternoon: true, evening: true, activeTechs: 4 },
  { day: 'Friday', morning: true, afternoon: true, evening: true, activeTechs: 4 },
  { day: 'Saturday', morning: true, afternoon: true, evening: true, activeTechs: 3 },
  { day: 'Sunday', morning: true, afternoon: false, evening: true, activeTechs: 2 },
];

export default function ProviderAvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [emergency24x7, setEmergency24x7] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const toggleSlot = (idx: number, slot: 'morning' | 'afternoon' | 'evening') => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [slot]: !item[slot] } : item))
    );
  };

  const handleSaveSchedule = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Weekly Dispatch Schedule & SLA Availability
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure daily service time slots, technician shift capacity, and 24x7 emergency PG response windows.
          </p>
        </div>

        <button
          onClick={handleSaveSchedule}
          className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Availability Roster</span>
        </button>
      </div>

      {savedToast && (
        <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-md flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Weekly slot roster updated and synced with Student & Landlord booking calendars!</span>
        </div>
      )}

      {/* 24x7 Emergency Rapid Response Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-none rounded-3xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-extrabold">
                24x7 Emergency Rapid Response SLA (Electrical & Plumbing)
              </h2>
              <Badge variant={emergency24x7 ? 'success' : 'warning'}>
                {emergency24x7 ? 'ACTIVE (90-Min SLA)' : 'PAUSED'}
              </Badge>
            </div>
            <p className="text-xs text-slate-300">
              Guarantees under-90-minute technician dispatch for urgent power outages, sparking sockets, or burst water pipes across PCTE & PAU partner PGs.
            </p>
          </div>
          <button
            onClick={() => setEmergency24x7(!emergency24x7)}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs shrink-0 transition-all"
          >
            {emergency24x7 ? 'Pause Emergency Standby' : 'Enable 24x7 Standby'}
          </button>
        </div>
      </Card>

      {/* Weekly Slot Matrix */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Interactive Weekly Slot Matrix (Click any slot to toggle)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">IST (Ludhiana Hub)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-500 uppercase">Day of Week</th>
                <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-500 uppercase">
                  Morning Slot (09:00 AM – 01:00 PM)
                </th>
                <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-500 uppercase">
                  Afternoon Slot (01:00 PM – 05:00 PM)
                </th>
                <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-500 uppercase">
                  Evening Slot (05:00 PM – 08:00 PM)
                </th>
                <th className="px-4 py-3 text-center text-xs font-extrabold text-slate-500 uppercase">
                  On-Duty Techs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((row, idx) => (
                <tr key={row.day} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{row.day}</td>
                  {(['morning', 'afternoon', 'evening'] as const).map((slotKey) => {
                    const isOpen = row[slotKey];
                    return (
                      <td key={slotKey} className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSlot(idx, slotKey)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all inline-flex items-center gap-1.5 ${
                            isOpen
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{isOpen ? 'Available' : 'Off-Duty'}</span>
                        </button>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      <Users className="w-3.5 h-3.5" /> {row.activeTechs} Techs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
