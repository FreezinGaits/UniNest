import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Phone, AlertTriangle, Flame, HeartPulse, ShieldAlert, Wrench,
  Droplets, Zap, KeyRound, Wind, Building2
} from 'lucide-react';

const officialEmergencies = [
  { label: 'National Emergency', number: '112', icon: ShieldAlert, color: 'bg-red-600', desc: 'Police, Fire, Ambulance — unified helpline' },
  { label: 'Ambulance', number: '108', icon: HeartPulse, color: 'bg-red-500', desc: 'Medical emergency transport' },
  { label: 'Police', number: '100', icon: ShieldAlert, color: 'bg-blue-600', desc: 'Law enforcement' },
  { label: 'Fire', number: '101', icon: Flame, color: 'bg-orange-600', desc: 'Fire brigade' },
  { label: 'Women Helpline', number: '1091', icon: Phone, color: 'bg-purple-600', desc: 'Women safety helpline' },
];

const propertyEmergencies = [
  { label: 'Plumber', category: 'Plumbing', icon: Droplets, desc: 'Burst pipe, tap leak, drainage block', color: 'bg-blue-100 text-blue-700' },
  { label: 'Electrician', category: 'Electrical', icon: Zap, desc: 'Power outage, sparking, circuit trip', color: 'bg-amber-100 text-amber-700' },
  { label: 'Locksmith', category: 'Lockout', icon: KeyRound, desc: 'Locked out of room, broken lock', color: 'bg-gray-100 text-gray-700' },
  { label: 'Water Supply', category: 'Water', icon: Droplets, desc: 'No water, tank overflow, pump failure', color: 'bg-cyan-100 text-cyan-700' },
  { label: 'AC / Cooler', category: 'HVAC', icon: Wind, desc: 'AC not working, cooler breakdown', color: 'bg-emerald-100 text-emerald-700' },
];

export default async function EmergencyPage() {
  const session = await getSession();

  let landlordPhone = '—';
  let propertyName = '—';
  if (session) {
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
      landlordPhone = tenancy.bed.room.property.landlord?.user?.phone || '—';
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Emergency & Safety</h1>
          <p className="text-text-secondary mt-1">Quick access to emergency contacts and urgent property services</p>
        </div>
        <div className="p-2.5 bg-red-50 rounded-xl">
          <Phone className="w-6 h-6 text-red-600" />
        </div>
      </div>

      {/* IMPORTANT DISCLAIMER */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">For life-threatening emergencies, call official helplines directly.</p>
          <p className="text-xs text-red-700 mt-1">UniNest is not an emergency authority. These are official government helpline numbers.</p>
        </div>
      </div>

      {/* Official Emergency Numbers */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" /> Official Emergency Helplines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {officialEmergencies.map(e => (
            <Card key={e.number}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${e.color} rounded-xl flex items-center justify-center`}>
                  <e.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{e.label}</p>
                  <p className="text-xs text-text-tertiary">{e.desc}</p>
                </div>
                <a href={`tel:${e.number}`} className="text-2xl font-bold text-red-600 hover:underline">{e.number}</a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Property Contact */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-600" /> Your Property Contact
        </h2>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">{propertyName}</p>
              <p className="text-xs text-text-secondary">Landlord / Warden</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-brand-700">{landlordPhone}</p>
              <Badge variant="outline" size="sm">Direct Contact</Badge>
            </div>
          </div>
        </Card>
      </section>

      {/* Property Emergencies — Demo Provider Dispatch */}
      <section>
        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-600" /> Urgent Property Services
          <Badge variant="outline" size="sm">Demo Dispatch</Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {propertyEmergencies.map(e => (
            <Card key={e.label}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 ${e.color} rounded-lg flex items-center justify-center`}>
                  <e.icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{e.label}</p>
                  <p className="text-[11px] text-text-tertiary">{e.desc}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-light">
                <span className="text-xs text-text-secondary">ETA: 15–45 min</span>
                <Badge variant="warning" size="sm">Demo Partner</Badge>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-3 text-center">
          Service dispatch is simulated in this demo environment. In production, verified vendors are auto-dispatched.
        </p>
      </section>
    </div>
  );
}
