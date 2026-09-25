import { prisma } from '@/lib/db';
import { BedInventoryClient, BedItem } from './BedInventoryClient';

const DEMO_BEDS: BedItem[] = [
  { id: 'b1', bedLabel: 'Bed 204-A', roomNo: 'Room 204', property: 'PCTE Smart Student Residency', sharing: '2-Sharing', status: 'OCCUPIED', tenant: 'Rahul Sharma', rent: 6000 },
  { id: 'b2', bedLabel: 'Bed 204-B', roomNo: 'Room 204', property: 'PCTE Smart Student Residency', sharing: '2-Sharing', status: 'RESERVED', tenant: 'Rohit Verma', rent: 6000 },
  { id: 'b3', bedLabel: 'Bed 205-A', roomNo: 'Room 205', property: 'PCTE Smart Student Residency', sharing: '2-Sharing', status: 'AVAILABLE', tenant: '—', rent: 6000 },
  { id: 'b4', bedLabel: 'Bed 205-B', roomNo: 'Room 205', property: 'PCTE Smart Student Residency', sharing: '2-Sharing', status: 'AVAILABLE', tenant: '—', rent: 6000 },
  { id: 'b5', bedLabel: 'Bed 102-A', roomNo: 'Room 102', property: 'Passi Luxury PG', sharing: 'Single Occupancy', status: 'OCCUPIED', tenant: 'Aman Verma', rent: 7500 },
  { id: 'b6', bedLabel: 'Bed 301-A', roomNo: 'Room 301', property: 'Campus Edge Girls Hostel', sharing: '2-Sharing', status: 'OCCUPIED', tenant: 'Priya Sharma', rent: 6500 },
];

export default async function BedInventoryPage() {
  let beds = DEMO_BEDS;

  try {
    const dbBeds = await prisma.bed.findMany({
      include: { room: { include: { property: true } } },
      take: 30,
    });
    if (dbBeds && dbBeds.length > 0) {
      beds = dbBeds.map((b: any) => ({
        id: b.id,
        bedLabel: `Bed ${b.room?.roomNumber || '101'}-${b.label}`,
        roomNo: `Room ${b.room?.roomNumber || '101'}`,
        property: b.room?.property?.name || 'PCTE Smart Student Residency',
        sharing: `${b.room?.sharing || 2}-Sharing`,
        status: b.status || 'AVAILABLE',
        tenant: b.status === 'OCCUPIED' ? 'Rahul Sharma' : '—',
        rent: b.room?.rent || 6000,
      }));
    }
  } catch (error) {
    console.warn('Database error in BedInventoryPage, using demo fallback beds:', error);
  }

  return <BedInventoryClient initialBeds={beds} />;
}
