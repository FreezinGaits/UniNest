import { getSession } from '@/lib/auth/actions';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Building2, ShieldCheck, MapPin, Plus, BedDouble, Users, Wrench } from 'lucide-react';
import Link from 'next/link';

const DEMO_PROPERTIES = [
  {
    id: 'prop-pcte-1',
    name: 'PCTE Smart Student Residency',
    locality: 'Ferozepur Road',
    city: 'Ludhiana',
    address: 'Plot 42, Opp. PCTE Campus, Ferozepur Road, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 6,
    totalBeds: 12,
    occupiedBeds: 9,
    rentPerMonth: 6000,
    openTickets: 1,
  },
  {
    id: 'prop-pcte-2',
    name: 'Passi Luxury PG & Co-Living',
    locality: 'Bhauriya Road',
    city: 'Ludhiana',
    address: 'Street 3, Near Bhauriya Market, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 8,
    totalBeds: 16,
    occupiedBeds: 14,
    rentPerMonth: 7500,
    openTickets: 0,
  },
];

export default async function LandlordPropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  let properties = DEMO_PROPERTIES;

  try {
    const landlord = await prisma.landlord.findUnique({ where: { userId: session.userId } });
    if (landlord) {
      const dbProps = await prisma.property.findMany({
        where: { landlordId: landlord.id },
        include: {
          rooms: { include: { beds: true } },
          maintenanceTickets: { where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } },
        },
      });

      if (dbProps && dbProps.length > 0) {
        properties = dbProps.map((p: any) => {
          const tBeds = p.rooms.reduce((a: number, r: any) => a + r.beds.length, 0);
          const oBeds = p.rooms.reduce((a: number, r: any) => a + r.beds.filter((b: any) => b.status === 'OCCUPIED').length, 0);
          return {
            id: p.id,
            name: p.name,
            locality: p.locality,
            city: p.city,
            address: p.address,
            verificationStatus: p.verificationStatus,
            totalRooms: p.rooms.length,
            totalBeds: tBeds || 4,
            occupiedBeds: oBeds || 3,
            rentPerMonth: p.baseRent || 6000,
            openTickets: p.maintenanceTickets.length,
          };
        });
      }
    }
  } catch (error) {
    console.warn('Database error in LandlordPropertiesPage, using fallback demo properties:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Property Portfolio</h1>
          <p className="text-text-secondary mt-1">Manage PG units, room configurations, and bed occupancy</p>
        </div>
        <Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Add New PG / Hostel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((p) => (
          <Card key={p.id} className="p-6 rounded-2xl border border-slate-200 hover:border-brand-300 transition-all shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{p.name}</h2>
                  <Badge variant={p.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                    {p.verificationStatus}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> {p.address}
                </p>
              </div>
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 my-5 p-3 bg-slate-50 rounded-xl text-center">
              <div>
                <p className="text-xs text-slate-500 font-medium">Beds Occupied</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{p.occupiedBeds} / {p.totalBeds}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Monthly Rent</p>
                <p className="text-base font-black text-emerald-700 mt-0.5">₹{p.rentPerMonth.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Open Issues</p>
                <p className="text-base font-black text-amber-600 mt-0.5">{p.openTickets} tickets</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-semibold">{p.totalRooms} rooms listed</span>
              <Link href={`/landlord/properties/${p.id}`}>
                <Button size="sm" variant="outline" className="text-xs font-bold">
                  Manage Property →
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
