import fs from 'fs';
import path from 'path';

export interface ElectricityReadingItem {
  id: string;
  property: string;
  room: string;
  tenant: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnit: number;
  totalBill: number;
  status: string;
  month: string;
  createdAt?: string;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const ELECTRICITY_FILE = path.join(DATA_DIR, 'electricity.json');

export const DEFAULT_DEMO_READINGS: ElectricityReadingItem[] = [
  {
    id: 'el-1',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Sub-Meter #204)',
    tenant: 'Rahul Sharma',
    previousReading: 1420,
    currentReading: 1560,
    unitsConsumed: 140,
    ratePerUnit: 9.5,
    totalBill: 1330,
    status: 'PAID',
    month: 'September 2026',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'el-2',
    property: 'Passi Luxury PG & Co-Living',
    room: 'Room 102 (Sub-Meter #102)',
    tenant: 'Aman Verma',
    previousReading: 2100,
    currentReading: 2310,
    unitsConsumed: 210,
    ratePerUnit: 9.5,
    totalBill: 1995,
    status: 'UNPAID',
    month: 'September 2026',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
];

const globalForElectricityStore = globalThis as unknown as {
  uninestElectricityMemory?: ElectricityReadingItem[];
};

export function normalizeElectricityItem(raw: any): ElectricityReadingItem {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_DEMO_READINGS[0];
  }

  const previousReading = Number(raw.previousReading ?? raw.prevReading ?? 1200) || 0;
  const currentReading = Number(raw.currentReading ?? raw.currReading ?? 1300) || 0;
  const ratePerUnit = Number(raw.ratePerUnit ?? 9.5) || 9.5;
  const unitsConsumed =
    raw.unitsConsumed !== undefined && raw.unitsConsumed !== null
      ? Number(raw.unitsConsumed)
      : Math.max(0, currentReading - previousReading);

  let rawBill =
    raw.totalBill ??
    (raw.totalAmount !== undefined ? Number(raw.totalAmount) / 100 : undefined) ??
    Math.round(unitsConsumed * ratePerUnit);
  rawBill = Number(rawBill) || Math.round(unitsConsumed * ratePerUnit);

  return {
    id: String(raw.id || `el-${Date.now()}`),
    property: String(raw.property || 'PCTE Smart Student Residency'),
    room: String(raw.room || 'Room 204 (Sub-Meter #204)'),
    tenant: String(raw.tenant || 'Rahul Sharma'),
    previousReading,
    currentReading,
    unitsConsumed,
    ratePerUnit,
    totalBill: rawBill,
    status: String(raw.status || (raw.isPaid ? 'PAID' : 'UNPAID')),
    month: String(raw.month || 'September 2026'),
    createdAt: raw.createdAt
      ? typeof raw.createdAt === 'string'
        ? raw.createdAt
        : new Date(raw.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

function readReadingsFromDisk(): ElectricityReadingItem[] {
  try {
    if (fs.existsSync(ELECTRICITY_FILE)) {
      const raw = fs.readFileSync(ELECTRICITY_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeElectricityItem);
    }
  } catch {
    // Ignore fs errors on serverless
  }
  return [];
}

function writeReadingsToDisk(readings: ElectricityReadingItem[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ELECTRICITY_FILE, JSON.stringify(readings, null, 2), 'utf-8');
  } catch {
    // Ignore fs errors on serverless
  }
}

export async function getAllElectricityReadings(): Promise<ElectricityReadingItem[]> {
  const disk = readReadingsFromDisk();
  const mem = globalForElectricityStore.uninestElectricityMemory || [];
  const mergedMap = new Map<string, ElectricityReadingItem>();

  for (const item of [...mem, ...disk, ...DEFAULT_DEMO_READINGS]) {
    const norm = normalizeElectricityItem(item);
    if (!mergedMap.has(norm.id)) {
      mergedMap.set(norm.id, norm);
    }
  }

  const result = Array.from(mergedMap.values());
  globalForElectricityStore.uninestElectricityMemory = result;
  return result;
}

export async function createElectricityReading(data: {
  property: string;
  room: string;
  tenant?: string;
  previousReading: number;
  currentReading: number;
  ratePerUnit: number;
  month?: string;
}): Promise<ElectricityReadingItem> {
  const unitsConsumed = Math.max(0, Number(data.currentReading) - Number(data.previousReading));
  const totalBill = Math.round(unitsConsumed * Number(data.ratePerUnit || 9.5));

  const newReading: ElectricityReadingItem = normalizeElectricityItem({
    id: `el-new-${Date.now()}`,
    property: data.property || 'PCTE Smart Student Residency',
    room: data.room || 'Room 101',
    tenant: data.tenant || 'Unassigned Tenant',
    previousReading: Number(data.previousReading),
    currentReading: Number(data.currentReading),
    unitsConsumed,
    ratePerUnit: Number(data.ratePerUnit || 9.5),
    totalBill,
    status: 'UNPAID',
    month: data.month || 'September 2026',
    createdAt: new Date().toISOString(),
  });

  const existing = await getAllElectricityReadings();
  const updated = [newReading, ...existing.filter((r) => r.id !== newReading.id)];
  globalForElectricityStore.uninestElectricityMemory = updated;
  writeReadingsToDisk(updated);

  return newReading;
}
