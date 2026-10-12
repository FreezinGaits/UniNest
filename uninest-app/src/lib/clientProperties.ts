'use client';

export interface ClientPropertyItem {
  id: string;
  name: string;
  locality: string;
  city: string;
  address: string;
  verificationStatus: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  rentPerMonth: number;
  openTickets: number;
  images?: string[];
  rejectionReason?: string;
  editPendingVerification?: boolean;
  type?: string;
  gender?: string;
  description?: string;
  lastEditedAt?: string;
}

const CLIENT_STORAGE_KEY = 'uninest_custom_properties_v2';

export function getClientProperties(): ClientPropertyItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CLIENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveClientProperty(prop: ClientPropertyItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClientProperties();
    const existingIdx = current.findIndex((p) => p.id === prop.id);
    let updated: ClientPropertyItem[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...current[existingIdx], ...prop };
    } else {
      updated = [prop, ...current];
    }
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving to client localStorage:', err);
  }
}

export function saveClientPropertiesBatch(props: ClientPropertyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClientProperties();
    const map = new Map<string, ClientPropertyItem>();
    current.forEach((p) => map.set(p.id, p));
    props.forEach((p) => map.set(p.id, p));
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
  } catch (err) {
    console.warn('Error batch saving client properties:', err);
  }
}
