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

// ─── File-based persistence ─────────────────────────────────────────────────
// We write to a JSON file on disk so data survives server restarts, HMR reloads,
// and Next.js re-imports — unlike globalThis which is wiped in dev mode.

const DATA_DIR = path.join(process.cwd(), '.data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readPropertiesFromDisk(): PropertyItem[] {
  try {
    ensureDataDir();
    if (fs.existsSync(PROPERTIES_FILE)) {
      const raw = fs.readFileSync(PROPERTIES_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to read properties file, returning empty array:', err);
  }
  return [];
}

function writePropertiesToDisk(properties: PropertyItem[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write properties file:', err);
  }
}

// ─── Demo seed properties ───────────────────────────────────────────────────

const DEFAULT_DEMO_PROPERTIES: PropertyItem[] = [
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

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getAllProperties(): Promise<PropertyItem[]> {
  const saved = readPropertiesFromDisk();

  // Merge: saved (user-added) properties first, then demo properties that
  // are not already overridden in saved list
  const savedIds = new Set(saved.map((p) => p.id));
  const demos = DEFAULT_DEMO_PROPERTIES.filter((d) => !savedIds.has(d.id));

  return [...saved, ...demos];
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
  const totalBeds = Number(data.totalRooms) * Number(data.bedsPerRoom);

  const newProperty: PropertyItem = {
    id: propId,
    name: data.name,
    type: data.type || 'PG',
    locality: data.locality || 'Ferozepur Road',
    city: data.city || 'Ludhiana',
    address: data.address,
    verificationStatus: 'UNDER_REVIEW',
    totalRooms: Number(data.totalRooms),
    totalBeds,
    occupiedBeds: 0,
    rentPerMonth: Number(data.rentPerMonth),
    openTickets: 0,
    ownerName: data.ownerName || 'Vikram Singh (Landlord)',
    createdAt: new Date().toISOString(),
    description: data.description || '',
  };

  // Read existing, prepend new, write back
  const existing = readPropertiesFromDisk();
  existing.unshift(newProperty);
  writePropertiesToDisk(existing);

  return newProperty;
}

export async function verifyProperty(
  propertyId: string,
  status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW'
): Promise<boolean> {
  const saved = readPropertiesFromDisk();
  let found = false;

  // Update in saved properties
  for (const p of saved) {
    if (p.id === propertyId) {
      p.verificationStatus = status;
      found = true;
      break;
    }
  }

  if (found) {
    writePropertiesToDisk(saved);
    return true;
  }

  // If it's a demo property being verified, copy it into the saved file so
  // the status override persists across reloads
  const demo = DEFAULT_DEMO_PROPERTIES.find((d) => d.id === propertyId);
  if (demo) {
    const copy: PropertyItem = { ...demo, verificationStatus: status };
    saved.push(copy);
    writePropertiesToDisk(saved);
    return true;
  }

  return false;
}
