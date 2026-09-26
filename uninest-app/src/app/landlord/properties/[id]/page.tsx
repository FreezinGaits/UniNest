import { prisma } from '@/lib/db';
import { getAllProperties } from '@/lib/propertiesStore';
import { formatINR } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

const DEFAULT_ROOMS = [
  {
    id: 'r204',
    roomNumber: '204',
    sharing: 2,
    rent: 600000,
    beds: [
      { id: 'b1', label: 'A', status: 'OCCUPIED' },
      { id: 'b2', label: 'B', status: 'RESERVED' },
    ],
  },
  {
    id: 'r205',
    roomNumber: '205',
    sharing: 2,
    rent: 600000,
    beds: [
      { id: 'b3', label: 'A', status: 'AVAILABLE' },
      { id: 'b4', label: 'B', status: 'AVAILABLE' },
    ],
  },
];

export default async function LandlordPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let property: any = null;

  try {
    property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: { include: { beds: true } },
        maintenanceTickets: true,
        collegeLinks: { include: { college: true } },
      },
    });
  } catch (error) {
    console.warn(`Database error fetching property ${id}, using fallback property data:`, error);
  }

  if (!property) {
    const storeProperties = await getAllProperties();
    const matched = storeProperties.find((p) => p.id === id) || storeProperties[0];
    const rentPaise = (matched?.rentPerMonth || 6000) >= 100000
      ? matched.rentPerMonth
      : (matched?.rentPerMonth || 6000) * 100;

    property = {
      id: matched?.id || id,
      name: matched?.name || 'PCTE Smart Student Residency',
      city: matched?.city || 'Ludhiana',
      address: matched?.address || 'Plot 42, Opp. PCTE Campus, Ferozepur Road',
      verificationStatus: matched?.verificationStatus || 'VERIFIED',
      rooms: DEFAULT_ROOMS.map((r) => ({ ...r, rent: rentPaise })),
    };
  }

  const rooms = Array.isArray(property.rooms) && property.rooms.length > 0 ? property.rooms : DEFAULT_ROOMS;
  const totalBeds = rooms.reduce((a: number, r: any) => a + (Array.isArray(r.beds) ? r.beds.length : 0), 0);
  const occupiedBeds = rooms.reduce(
    (a: number, r: any) => a + (Array.isArray(r.beds) ? r.beds.filter((b: any) => b.status === 'OCCUPIED').length : 0),
    0
  );
  const availableBeds = rooms.reduce(
    (a: number, r: any) => a + (Array.isArray(r.beds) ? r.beds.filter((b: any) => b.status === 'AVAILABLE').length : 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <div>
        <Link href="/landlord/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">{property.name}</h1>
            <Badge variant={property.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
              {property.verificationStatus || 'VERIFIED'}
            </Badge>
          </div>
          <p className="text-text-secondary text-sm flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-brand-600" />
            {property.address}, {property.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/landlord/beds">
            <Button variant="outline" size="sm">Manage Beds</Button>
          </Link>
          <Link href="/landlord/properties?add=true">
            <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add Room / Unit</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-text-primary">{totalBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Total Capacity</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600">{occupiedBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Occupied Beds</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-amber-600">{availableBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Vacant Beds</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Room & Bed Details</h2>
        <div className="space-y-3">
          {rooms.map((room: any) => {
            const rentPaise = Number(room.rent || 600000) < 50000 ? Number(room.rent || 6000) * 100 : Number(room.rent || 600000);
            return (
              <div key={room.id} className="border border-border-light rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="font-bold text-text-primary">Room {room.roomNumber}</span>
                  <span className="text-xs text-text-secondary ml-2">
                    ({room.sharing || 2}-Sharing • {formatINR(rentPaise)}/mo)
                  </span>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {(room.beds || []).map((b: any) => (
                      <span
                        key={b.id}
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          b.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Bed {b.label}: {b.status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
