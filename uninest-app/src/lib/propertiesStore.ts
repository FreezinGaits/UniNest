import fs from 'fs';
import path from 'path';

export interface PropertyItem {
  id: string;
  name: string;
  type?: string;
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
  createdAt?: string;
  description?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

export const DEFAULT_DEMO_PROPERTIES: PropertyItem[] = [
  {
    id: 'prop-pcte-1',
    name: 'PCTE Smart Student Residency',
    type: 'HOSTEL',
    locality: 'Ferozepur Road',
    city: 'Ludhiana',
    address: 'Plot 42, Opp. PCTE Campus, Ferozepur Road, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 6,
    totalBeds: 12,
    occupiedBeds: 9,
    rentPerMonth: 6000,
    openTickets: 1,
    ownerName: 'Vikram Singh (Passi Group)',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'prop-pcte-2',
    name: 'Passi Luxury PG & Co-Living',
    type: 'PG',
    locality: 'Bhauriya Road',
    city: 'Ludhiana',
    address: 'Street 3, Near Bhauriya Market, Ludhiana',
    verificationStatus: 'VERIFIED',
    totalRooms: 8,
    totalBeds: 16,
    occupiedBeds: 14,
    rentPerMonth: 7500,
    openTickets: 0,
    ownerName: 'Vikram Singh',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'prop-demo-03',
    name: 'Campus Edge Girls Hostel',
    type: 'HOSTEL',
    locality: 'BRS Nagar',
    city: 'Ludhiana',
    address: 'Street No 3, BRS Nagar, Near Market',
    verificationStatus: 'VERIFIED',
    totalRooms: 5,
    totalBeds: 10,
    occupiedBeds: 8,
    rentPerMonth: 6500,
    openTickets: 0,
    ownerName: 'Sunita Devi',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
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

  const statusRaw = String(raw.verificationStatus || raw.status || 'VERIFIED').toUpperCase();
  const verificationStatus =
    statusRaw === 'APPROVED' ? 'VERIFIED' : statusRaw;

  return {
    id: String(raw.id || `prop-${Date.now()}`),
    name: String(raw.name || 'UniNest Student Residency'),
    type: String(raw.type || 'PG'),
    locality: String(raw.locality || 'Ferozepur Road'),
    city: String(raw.city || 'Ludhiana'),
    address: String(raw.address || 'Ferozepur Road, Ludhiana'),
    verificationStatus,
    totalRooms,
    totalBeds,
    occupiedBeds,
    rentPerMonth,
    openTickets,
    ownerName: raw.ownerName || raw.landlord?.user?.name || 'Vikram Singh',
    createdAt: raw.createdAt
      ? typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(raw.createdAt).toISOString()
      : new Date().toISOString(),
    description: String(raw.description || ''),
  };
}

function readPropertiesFromDisk(): PropertyItem[] {
  try {
    if (fs.existsSync(PROPERTIES_FILE)) {
      const raw = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizePropertyItem);
      }
    }
  } catch {
    // Ignore fs errors in serverless environments
  }
  return [];
}

function writePropertiesToDisk(properties: PropertyItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch {
    // Ignore fs errors on read-only serverless filesystems
  }
}

export async function getAllProperties(): Promise<PropertyItem[]> {
  const diskItems = readPropertiesFromDisk();
  const memItems = globalForPropertiesStore.uninestPropertiesMemory || [];

  const mergedMap = new Map<string, PropertyItem>();
  for (const item of [...memItems, ...diskItems, ...DEFAULT_DEMO_PROPERTIES]) {
    const norm = normalizePropertyItem(item);
    if (!mergedMap.has(norm.id)) {
      mergedMap.set(norm.id, norm);
    }
  }

  const result = Array.from(mergedMap.values());
  globalForPropertiesStore.uninestPropertiesMemory = result;
  return result;
}

export async function createProperty(data: {
  name: string;
  locality: string;
  city: string;
  address: string;
  type?: string;
  totalRooms: number;
  bedsPerRoom: number;
  rentPerMonth: number;
  gender?: string;
  description?: string;
  ownerName?: string;
}): Promise<PropertyItem> {
  const propId = `prop-new-${Date.now()}`;
  const totalBeds = Number(data.totalRooms || 4) * Number(data.bedsPerRoom || 2);

  const newProperty: PropertyItem = normalizePropertyItem({
    id: propId,
    name: data.name,
    type: data.type || 'PG',
    locality: data.locality || 'Ferozepur Road',
    city: data.city || 'Ludhiana',
    address: data.address,
    verificationStatus: 'UNDER_REVIEW',
    totalRooms: Number(data.totalRooms || 4),
    totalBeds,
    occupiedBeds: 0,
    rentPerMonth: Number(data.rentPerMonth || 6000),
    openTickets: 0,
    ownerName: data.ownerName || 'Vikram Singh (Landlord)',
    createdAt: new Date().toISOString(),
    description: data.description || '',
  });

  const existing = await getAllProperties();
  const updated = [newProperty, ...existing.filter((p) => p.id !== newProperty.id)];
  globalForPropertiesStore.uninestPropertiesMemory = updated;
  writePropertiesToDisk(updated);

  return newProperty;
}

export async function verifyProperty(
  propertyId: string,
  status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW'
): Promise<boolean> {
  const all = await getAllProperties();
  let found = false;

  const updated = all.map((p) => {
    if (p.id === propertyId) {
      found = true;
      return { ...p, verificationStatus: status };
    }
    return p;
  });

  if (found) {
    globalForPropertiesStore.uninestPropertiesMemory = updated;
    writePropertiesToDisk(updated);
    return true;
  }

  return false;
}
