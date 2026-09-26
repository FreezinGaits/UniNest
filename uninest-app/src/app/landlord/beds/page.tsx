import { getAllProperties } from '@/lib/propertiesStore';
import { BedInventoryClient, BedItem } from './BedInventoryClient';

export const dynamic = 'force-dynamic';

export default async function BedInventoryPage() {
  const properties = await getAllProperties();

  // Generate bed inventory directly from the landlord's actual portfolio properties
  // so total beds, occupied beds, and vacant beds match Dashboard and Properties!
  const beds: BedItem[] = [];
  const sampleTenants = [
    'Rahul Sharma',
    'Aman Verma',
    'Priya Sharma',
    'Karanveer Gill',
    'Simran Kaur',
    'Arjun Mehta',
    'Neha Gupta',
    'Rohan Joshi',
  ];
  let tenantIdx = 0;

  for (const prop of properties) {
    const totalRooms = Math.max(1, Number(prop.totalRooms || 4));
    const totalBeds = Math.max(1, Number(prop.totalBeds || totalRooms * 2));
    const bedsPerRoom = Math.max(1, Math.round(totalBeds / totalRooms));
    const occupiedTarget = Number(prop.occupiedBeds || 0);
    const rent = Number(prop.rentPerMonth || 6000);
    const sharingLabel =
      bedsPerRoom === 1
        ? 'Single Occupancy'
        : `${bedsPerRoom}-Sharing`;

    let occupiedAssigned = 0;
    let reservedAssigned = prop.id === 'prop-pcte-1' ? 0 : 1; // 1 reserved bed in PCTE Smart Student Residency
    const labels = ['A', 'B', 'C', 'D'];

    for (let r = 1; r <= totalRooms; r++) {
      const roomNumber = prop.id === 'prop-pcte-1' ? `${203 + r}` : `${100 + r}`;
      for (let b = 0; b < bedsPerRoom; b++) {
        if (beds.filter((x) => x.property === prop.name).length >= totalBeds) break;

        let status = 'AVAILABLE';
        let tenant = '—';

        if (occupiedAssigned < occupiedTarget) {
          status = 'OCCUPIED';
          tenant = sampleTenants[tenantIdx % sampleTenants.length];
          tenantIdx++;
          occupiedAssigned++;
        } else if (reservedAssigned === 0) {
          status = 'RESERVED';
          tenant = 'Rohit Verma (OTP Hold)';
          reservedAssigned = 1;
        }

        const labelChar = labels[b] || `${b + 1}`;
        beds.push({
          id: `${prop.id}-r${roomNumber}-${labelChar}`,
          bedLabel: `Bed ${roomNumber}-${labelChar}`,
          roomNo: `Room ${roomNumber}`,
          property: prop.name,
          sharing: sharingLabel,
          status,
          tenant,
          rent,
        });
      }
    }
  }

  return <BedInventoryClient initialBeds={beds} />;
}
