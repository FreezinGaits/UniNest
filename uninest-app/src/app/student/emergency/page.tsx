import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Phone, AlertTriangle, Flame, HeartPulse, ShieldAlert, Wrench,
  Droplets, Zap, KeyRound, Wind, Building2, ExternalLink
} from 'lucide-react';

const officialEmergencies = [
  { label: 'National Emergency', number: '112', icon: ShieldAlert, color: 'bg-red-600', desc: 'Police, Fire, Ambulance — unified helpline' },
  { label: 'Ambulance', number: '108', icon: HeartPulse, color: 'bg-red-500', desc: 'Medical emergency transport' },
  { label: 'Police Control Room', number: '100', icon: ShieldAlert, color: 'bg-blue-600', desc: 'Law enforcement & student safety' },
  { label: 'Fire Brigade', number: '101', icon: Flame, color: 'bg-orange-600', desc: 'Fire & rescue department' },
  { label: 'Women Safety Helpline', number: '1091', icon: Phone, color: 'bg-purple-600', desc: '24/7 Women safety helpline' },
];

const propertyEmergencies = [
  { label: 'Plumber', category: 'Plumbing', icon: Droplets, desc: 'Burst pipe, tap leak, drainage block', color: 'bg-blue-100 text-blue-700' },
  { label: 'Electrician', category: 'Electrical', icon: Zap, desc: 'Power outage, failure, circuit trip', color: 'bg-amber-100 text-amber-700' },
  { label: 'Locksmith', category: 'Lockout', icon: KeyRound, desc: 'Locked out of room, broken lock', color: 'bg-slate-100 text-slate-700' },
  { label: 'Water Supply', category: 'Water', icon: Droplets, desc: 'No water, tank overflow, pump issue', color: 'bg-cyan-100 text-cyan-700' },
  { label: 'AC / Cooler', category: 'HVAC', icon: Wind, desc: 'AC breakdown, cooling failure', color: 'bg-emerald-100 text-emerald-700' },
];

export default async function EmergencyPage() {
  let landlordPhone = '+91 98140 12345';
  let propertyName = 'PCTE Smart Student Residency';
  let wardenPhone = '+91 98765 11223';

  try {
    const session = await getSession();
    if (session?.userId) {
      const student = await prisma.student.findUnique({
        where: { userId: session.userId },
        include: {
          tenancies: {
            where: { isActive: true },
            include: { bed: { include: { room: { include: { property: { include: { landlord: { include: { user: true } } } } } } } } },
            take: 1,
          },
        },
      });
      const tenancy = student?.tenancies?.[0];
      if (tenancy?.bed?.room?.property) {
        propertyName = tenancy.bed.room.property.name;
        landlordPhone = tenancy.bed.room.property.landlord?.user?.phone || '+91 98140 12345';
      }
    }
  } catch (e) {
    console.warn('Prisma DB query fallback in Emergency Page:', e);
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Emergency & Student Safety SOS</h1>
          <p className="text-xs text-slate-500 mt-0.5">Instant one-tap emergency helplines, hostel warden, and urgent property services.</p>
        </div>
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
          <Phone className="w-6 h-6 text-rose-600 animate-pulse" />
        </div>
      </div>

      {/* Critical Disclaimer Notice */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-900">For immediate life-threatening emergencies, call 112 or 108 directly.</p>
          <p className="text-xs text-rose-700 mt-0.5">
            UniNest connects you directly to official government emergency services and on-campus hostel security.
          </p>
        </div>
      </div>

      {/* Official Government Helplines */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          Official Emergency Helplines (24x7)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {officialEmergencies.map((e) => (
            <div key={e.number} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${e.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <e.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{e.label}</p>
                  <p className="text-[11px] text-slate-500">{e.desc}</p>
                </div>
              </div>
              <a
                href={`tel:${e.number}`}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm px-3.5 py-2 rounded-xl shadow-sm transition-colors shrink-0 ml-2"
              >
                {e.number}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Hostel & Landlord Emergency Contacts */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Your Accommodation SOS Contacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block">
                Property Landlord / Owner
              </span>
              <p className="text-sm font-extrabold text-slate-900">{propertyName}</p>
              <p className="text-xs text-slate-500 mt-0.5">Rajesh Kumar (Owner)</p>
            </div>
            <a
              href={`tel:${landlordPhone}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              Call {landlordPhone}
            </a>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1 inline-block">
                Campus Security / Warden
              </span>
              <p className="text-sm font-extrabold text-slate-900">PCTE Campus Security Desk</p>
              <p className="text-xs text-slate-500 mt-0.5">Chief Security Officer (Main Gate)</p>
            </div>
            <a
              href={`tel:${wardenPhone}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-colors"
            >
              Call {wardenPhone}
            </a>
          </div>

        </div>
      </section>

      {/* Urgent On-Demand Property Services */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" />
          Urgent 15-Min Property Emergency Dispatch
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyEmergencies.map((e) => (
            <div key={e.label} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 ${e.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <e.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{e.label}</p>
                  <p className="text-[11px] text-slate-500">{e.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-500 font-medium">ETA: ~15-30 Mins</span>
                <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                  Auto Dispatch
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
