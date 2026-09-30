import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { getPropertiesForLandlord, isDemoLandlordEmail } from '@/lib/propertiesStore';
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
  const session = await getSession();
  const isDemoUser = isDemoLandlordEmail(session?.email);
  let tickets: TicketItem[] = isDemoUser ? DEMO_MAINTENANCE_TICKETS : [];

  try {
    const landlordProps = await getPropertiesForLandlord(session?.email);
    if (isDemoUser || landlordProps.length > 0) {
      const dbTickets = await prisma.maintenanceTicket.findMany({
        where: isDemoUser ? undefined : { propertyId: { in: landlordProps.map((p) => p.id) } },
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
    }
  } catch (error) {
    console.warn('Database error in Landlord MaintenanceRequestsPage, using fallback tickets:', error);
  }

  return <LandlordMaintenanceClient initialTickets={tickets} />;
}
