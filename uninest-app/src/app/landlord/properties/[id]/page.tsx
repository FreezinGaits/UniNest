import { getAllProperties } from '@/lib/propertiesStore';
import { formatRupees } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LandlordPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const storeProperties = await getAllProperties();
  const matched = storeProperties.find((p) => p.id === id) || storeProperties[0];

  const totalRooms = Math.max(1, Number(matched?.totalRooms || 6));
  const totalBedsTarget = Math.max(1, Number(matched?.totalBeds || totalRooms * 2));
  const bedsPerRoom = Math.max(1, Math.round(totalBedsTarget / totalRooms));
  const occupiedTarget = Number(matched?.occupiedBeds || 0);
  const rentRupees = Number(matched?.rentPerMonth || 6000);

  // Build exact room & bed structure matching the property's portfolio card
  const rooms: Array<{
    id: string;
    roomNumber: string;
    sharing: number;
    rentRupees: number;
    beds: Array<{ id: string; label: string; status: string }>;
  }> = [];

  let occupiedAssigned = 0;
  let bedsCreated = 0;
  const labels = ['A', 'B', 'C', 'D'];

  for (let r = 1; r <= totalRooms; r++) {
    const roomNumber = matched?.id === 'prop-pcte-1' ? `${200 + r}` : `${100 + r}`;
    const roomBeds: Array<{ id: string; label: string; status: string }> = [];

    for (let b = 0; b < bedsPerRoom; b++) {
      if (bedsCreated >= totalBedsTarget) break;
      bedsCreated++;

      let status = 'AVAILABLE';
      if (occupiedAssigned < occupiedTarget) {
        status = 'OCCUPIED';
        occupiedAssigned++;
      }

      roomBeds.push({
        id: `${matched?.id}-r${roomNumber}-b${b + 1}`,
        label: labels[b] || `${b + 1}`,
        status,
      });
    }

    rooms.push({
      id: `${matched?.id}-r${roomNumber}`,
      roomNumber,
      sharing: roomBeds.length || bedsPerRoom,
      rentRupees,
      beds: roomBeds,
    });
  }

  const totalBeds = rooms.reduce((a, r) => a + r.beds.length, 0);
  const occupiedBeds = rooms.reduce(
    (a, r) => a + r.beds.filter((b) => b.status === 'OCCUPIED').length,
    0
  );
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      <div>
        <Link
          href="/landlord/properties"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties
        </Link>
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">
              {matched?.name || 'PCTE Smart Student Residency'}
            </h1>
            <Badge variant={matched?.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
              {matched?.verificationStatus || 'VERIFIED'}
            </Badge>
          </div>
          <p className="text-text-secondary text-sm flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-brand-600" />
            {matched?.address}, {matched?.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/landlord/beds">
            <Button variant="outline" size="sm">
              Manage Beds
            </Button>
          </Link>
          <Link href="/landlord/properties?add=true">
            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
              Add New Property
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-text-primary">{totalBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Total Capacity ({rooms.length} Rooms)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand-600">{occupiedBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Occupied Beds</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{availableBeds}</p>
          <p className="text-xs text-text-secondary mt-1">Vacant Beds</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Room & Bed Matrix ({rooms.length} Rooms • {totalBeds} Beds)
        </h2>
        <div className="space-y-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border border-border-light rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-3"
            >
              <div>
                <span className="font-bold text-text-primary">Room {room.roomNumber}</span>
                <span className="text-xs text-text-secondary ml-2">
                  ({room.sharing}-Sharing • {formatRupees(room.rentRupees)}/mo per bed)
                </span>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {room.beds.map((b) => (
                    <span
                      key={b.id}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        b.status === 'OCCUPIED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      Bed {b.label}: {b.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
