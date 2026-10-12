import { readServerProperties, saveServerProperty, deleteServerProperty } from './persistentProperties';

export interface PropertyItem {
  id: string;
  name: string;
  type?: string;
  gender?: string;
  locality: string;
  city: string;
  address: string;
  verificationStatus: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  rentPerMonth: number;
  openTickets: number;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  images?: string[];
  rejectionReason?: string;
  editPendingVerification?: boolean;
  lastEditedAt?: string;
}

export function isDemoLandlordEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith('@uninest.demo') ||
    clean === 'landlord@uninest.in' ||
    clean === 'vikram@passiresidency.in' ||
    clean === 'admin@uninest.in' ||
    clean === 'rahul@uninest.in' ||
    clean === 'rahul.sharma@pcte.edu.in' ||
    clean === 'pcte@uninest.in' ||
    clean === 'provider@uninest.in'
  );
}

export const DEFAULT_DEMO_PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-pcte-1',
    name: 'PCTE Smart Student Residency',
    type: 'HOSTEL',
    gender: 'MALE',
    locality: 'Ferozepur Road (PCTE Vicinity)',
    city: 'Ludhiana',
    address: 'Plot 42, Opp. PCTE Campus, Ferozepur Road, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 6,
    totalBeds: 12,
    occupiedBeds: 9,
    rentPerMonth: 6000,
    openTickets: 1,
    ownerName: 'Vikram Singh (Passi Group)',
    ownerEmail: 'landlord@uninest.in',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'prop-pcte-2',
    name: 'Passi Luxury PG & Co-Living',
    type: 'PG',
    gender: 'ANY',
    locality: 'BRS Nagar (PAU Vicinity)',
    city: 'Ludhiana',
    address: 'Street 3, Near Bhauriya Market, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 8,
    totalBeds: 16,
    occupiedBeds: 14,
    rentPerMonth: 7500,
    openTickets: 0,
    ownerName: 'Vikram Singh',
    ownerEmail: 'landlord@uninest.in',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    ],
  },
  {
    id: 'prop-demo-03',
    name: 'Campus Edge Girls Hostel',
    type: 'HOSTEL',
    gender: 'FEMALE',
    locality: 'BRS Nagar (PAU Vicinity)',
    city: 'Ludhiana',
    address: 'Street No 3, BRS Nagar, Near Market',
    verificationStatus: 'VERIFIED',
    totalRooms: 5,
    totalBeds: 10,
    occupiedBeds: 8,
    rentPerMonth: 6500,
    openTickets: 0,
    ownerName: 'Sunita Devi',
    ownerEmail: 'landlord@uninest.in',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    ],
  },
];

const globalForPropertiesStore = globalThis as unknown as {
  uninestPropertiesMemory?: PropertyItem[];
};

export function normalizePropertyItem(raw: any): PropertyItem {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_DEMO_PROPERTIES[0];
  }

  const rooms = Array.isArray(raw.rooms) ? raw.rooms : [];
  const totalRooms = Number(
    raw.totalRooms ?? (rooms.length > 0 ? rooms.length : 6)
  ) || 6;

  const bedsFromRooms = rooms.reduce(
    (acc: number, r: any) => acc + (Array.isArray(r.beds) ? r.beds.length : Number(r.sharing || 2)),
    0
  );
  const occupiedFromRooms = rooms.reduce(
    (acc: number, r: any) =>
      acc +
      (Array.isArray(r.beds)
        ? r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length
        : 0),
    0
  );

  const totalBeds =
    Number(
      raw.totalBeds ??
        (bedsFromRooms > 0 ? bedsFromRooms : totalRooms * Number(raw.bedsPerRoom || 2))
    ) || 12;

  const occupiedBeds =
    raw.occupiedBeds !== undefined && raw.occupiedBeds !== null
      ? Number(raw.occupiedBeds)
      : bedsFromRooms > 0
      ? occupiedFromRooms
      : Math.min(totalBeds, Math.max(0, Math.floor(totalBeds * 0.75)));

  // Normalize rentPerMonth: handle values in paise (> 100,000) vs rupees
  let rawRent =
    raw.rentPerMonth ??
    (rooms[0]?.rent ? Number(rooms[0].rent) : undefined) ??
    6000;
  rawRent = Number(rawRent) || 6000;
  const rentPerMonth = rawRent >= 100000 ? Math.round(rawRent / 100) : rawRent;

  const openTickets =
    raw.openTickets !== undefined && raw.openTickets !== null
      ? Number(raw.openTickets)
      : Array.isArray(raw.maintenanceTickets)
      ? raw.maintenanceTickets.filter((t: any) => t?.status !== 'RESOLVED').length
      : 0;

  const statusRaw = String(raw.verificationStatus || raw.status || 'UNDER_REVIEW').toUpperCase();
  const verificationStatus =
    statusRaw === 'APPROVED' ? 'VERIFIED' : statusRaw;

  // Never auto-inject fake images if the user supplied an empty array or no images!
  // Only use default images for the 3 built-in demo properties
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images;
  } else {
    const demoMatch = DEFAULT_DEMO_PROPERTIES.find((d) => d.id === raw.id);
    if (demoMatch && demoMatch.images) {
      images = demoMatch.images;
    }
  }

  return {
    id: String(raw.id || `prop-${Date.now()}`),
    name: String(raw.name || 'UniNest Student Residency'),
    type: String(raw.type || 'PG'),
    gender: String(raw.gender || 'ANY'),
    locality: String(raw.locality || 'Ferozepur Road (PCTE Vicinity)'),
    city: String(raw.city || 'Ludhiana'),
    address: String(raw.address || 'Ferozepur Road, Ludhiana'),
    verificationStatus,
    totalRooms,
    totalBeds,
    occupiedBeds,
    rentPerMonth,
    openTickets,
    ownerName: raw.ownerName || raw.landlord?.user?.name || 'Vikram Singh',
    ownerEmail: raw.ownerEmail || raw.landlord?.user?.email || 'landlord@uninest.in',
    createdAt: raw.createdAt
      ? typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(raw.createdAt).toISOString()
      : new Date().toISOString(),
    updatedAt: raw.updatedAt || undefined,
    description: String(raw.description || ''),
    images,
    rejectionReason: raw.rejectionReason || (raw.verificationStatus === 'SUSPENDED' ? raw.verificationNotes : undefined),
    editPendingVerification: Boolean(raw.editPendingVerification),
    lastEditedAt: raw.lastEditedAt || undefined,
  };
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  const serverSaved = readServerProperties();
  const memItems = globalForPropertiesStore.uninestPropertiesMemory || [];

  const mergedMap = new Map<string, PropertyItem>();

  // 1. Initial defaults
  for (const item of DEFAULT_DEMO_PROPERTIES) {
    const norm = normalizePropertyItem(item);
    mergedMap.set(norm.id, norm);
  }

  // 2. Server file persistent storage (guaranteed survival across reloads)
  for (const item of serverSaved) {
    const norm = normalizePropertyItem(item);
    mergedMap.set(norm.id, norm);
  }

  // 3. Memory store
  for (const item of memItems) {
    const norm = normalizePropertyItem(item);
    mergedMap.set(norm.id, norm);
  }

  const result = Array.from(mergedMap.values());
  globalForPropertiesStore.uninestPropertiesMemory = result;
  return result;
}

export async function getPropertiesForLandlord(email?: string | null): Promise<PropertyItem[]> {
  const all = await getAllProperties();
  if (isDemoLandlordEmail(email)) {
    return all;
  }
  if (!email) return [];
  const cleanEmail = email.trim().toLowerCase();
  return all.filter((p) => p.ownerEmail && p.ownerEmail.trim().toLowerCase() === cleanEmail);
}

export async function createProperty(data: {
  name: string;
  locality: string;
  city: string;
  address: string;
  type?: string;
  gender?: string;
  totalRooms: number;
  bedsPerRoom: number;
  rentPerMonth: number;
  description?: string;
  ownerName?: string;
  ownerEmail?: string;
  images?: string[];
}): Promise<PropertyItem> {
  const propId = `prop-custom-${Date.now()}`;
  const totalBeds = Number(data.totalRooms || 4) * Number(data.bedsPerRoom || 2);

  const newProperty: PropertyItem = normalizePropertyItem({
    id: propId,
    name: data.name,
    type: data.type || 'PG',
    gender: data.gender || 'ANY',
    locality: data.locality || 'Ferozepur Road (PCTE Vicinity)',
    city: data.city || 'Ludhiana',
    address: data.address,
    verificationStatus: 'UNDER_REVIEW',
    totalRooms: Number(data.totalRooms || 4),
    totalBeds,
    occupiedBeds: 0,
    rentPerMonth: Number(data.rentPerMonth || 6000),
    openTickets: 0,
    ownerName: data.ownerName || 'Vikram Singh (Landlord)',
    ownerEmail: data.ownerEmail || 'landlord@uninest.in',
    createdAt: new Date().toISOString(),
    description: data.description || '',
    images: Array.isArray(data.images) ? data.images : [],
  });

  // Persist permanently to disk
  saveServerProperty(newProperty);

  const existing = await getAllProperties();
  const updated = [newProperty, ...existing.filter((p) => p.id !== newProperty.id)];
  globalForPropertiesStore.uninestPropertiesMemory = updated;

  return newProperty;
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyItem> & { isLandlordEdit?: boolean }
): Promise<PropertyItem | null> {
  const all = await getAllProperties();
  const existing = all.find((p) => p.id === id);
  if (!existing) return null;

  const totalRooms = Number(data.totalRooms ?? existing.totalRooms) || 4;
  const totalBeds = Number(data.totalBeds ?? existing.totalBeds) || totalRooms * 2;

  const isLandlord = data.isLandlordEdit !== false;

  const updated: PropertyItem = {
    ...existing,
    ...data,
    totalRooms,
    totalBeds,
    rentPerMonth: Number(data.rentPerMonth ?? existing.rentPerMonth) || 6000,
    images: Array.isArray(data.images) ? data.images : existing.images || [],
    // If landlord edited, require UniNest admin verification
    verificationStatus: isLandlord ? 'UNDER_REVIEW' : (data.verificationStatus || existing.verificationStatus),
    editPendingVerification: isLandlord ? true : Boolean(data.editPendingVerification),
    lastEditedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Persist to server disk
  saveServerProperty(updated);

  const newAll = all.map((p) => (p.id === id ? updated : p));
  globalForPropertiesStore.uninestPropertiesMemory = newAll;

  return updated;
}

export async function verifyProperty(
  propertyId: string,
  status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW',
  reason?: string
): Promise<boolean> {
  const all = await getAllProperties();
  const target = all.find((p) => p.id === propertyId);
  if (!target) return false;

  const updated: PropertyItem = {
    ...target,
    verificationStatus: status,
    rejectionReason: status === 'VERIFIED' ? undefined : reason,
    editPendingVerification: false,
    updatedAt: new Date().toISOString(),
  };

  // Persist to disk
  saveServerProperty(updated);

  const newAll = all.map((p) => (p.id === propertyId ? updated : p));
  globalForPropertiesStore.uninestPropertiesMemory = newAll;

  return true;
}
