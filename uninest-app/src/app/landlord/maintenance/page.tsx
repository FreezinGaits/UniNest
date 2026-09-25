import { prisma } from '@/lib/db';
import { LandlordMaintenanceClient, TicketItem } from './LandlordMaintenanceClient';

const DEMO_MAINTENANCE_TICKETS: TicketItem[] = [
  {
    id: 'm1',
    ticketNo: 'MNT-2026-089',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Bed A)',
    tenant: 'Rahul Sharma',
    issue: 'Bathroom Tap Leak',
    category: 'PLUMBING',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    vendor: 'Ludhiana Home Services',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    ticketNo: 'MNT-2026-074',
    property: 'Passi Luxury PG & Co-Living',
    room: 'Room 102 (Bed B)',
    tenant: 'Aman Verma',
    issue: 'AC Cooling Coil Dust Cleaning',
    category: 'HVAC / ELECTRICAL',
    priority: 'LOW',
    status: 'COMPLETED',
    vendor: 'CoolTech Appliances',
    createdAt: new Date().toISOString(),
  },
];

export default async function MaintenanceRequestsPage() {
  let tickets = DEMO_MAINTENANCE_TICKETS;

  try {
    const dbTickets = await prisma.maintenanceTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { property: true },
    });
    if (dbTickets && dbTickets.length > 0) {
      tickets = dbTickets.map((t: any) => ({
        id: t.id,
        ticketNo: `MNT-2026-0${t.id.slice(-2)}`,
        property: t.property?.name || 'PCTE Smart Student Residency',
        room: 'Room 204',
        tenant: 'Rahul Sharma',
        issue: t.title || t.description || 'General Repair',
        category: t.category || 'PLUMBING',
        priority: t.priority || 'MEDIUM',
        status: t.status || 'OPEN',
        vendor: 'Ludhiana Home Services',
        createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.warn('Database error in Landlord MaintenanceRequestsPage, using demo fallback tickets:', error);
  }

  return <LandlordMaintenanceClient initialTickets={tickets} />;
}
