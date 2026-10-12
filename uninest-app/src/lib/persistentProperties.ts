import fs from 'fs';
import path from 'path';
import { PropertyItem, normalizePropertyItem } from './propertiesStore';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'custom_properties.json');

const CLIENT_STORAGE_KEY = 'uninest_custom_properties_v2';

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data directory:', err);
  }
}

export function readServerProperties(): PropertyItem[] {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePropertyItem);
  } catch (err) {
    console.warn('Error reading server properties file:', err);
    return [];
  }
}

export function writeServerProperties(properties: PropertyItem[]): boolean {
  try {
    ensureDataDirectory();
    const dataToWrite = JSON.stringify(properties, null, 2);
    fs.writeFileSync(DATA_FILE, dataToWrite, 'utf-8');
    return true;
  } catch (err) {
    console.warn('Error writing server properties file:', err);
    return false;
  }
}

export function saveServerProperty(prop: PropertyItem): PropertyItem[] {
  const current = readServerProperties();
  const existingIdx = current.findIndex((p) => p.id === prop.id);
  let updated: PropertyItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...prop };
  } else {
    updated = [prop, ...current];
  }
  writeServerProperties(updated);
  return updated;
}

export function deleteServerProperty(id: string): PropertyItem[] {
  const current = readServerProperties();
  const updated = current.filter((p) => p.id !== id);
  writeServerProperties(updated);
  return updated;
}

// Client-side LocalStorage Helpers
export function getClientProperties(): PropertyItem[] {
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

export function saveClientProperty(prop: PropertyItem): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClientProperties();
    const existingIdx = current.findIndex((p) => p.id === prop.id);
    let updated: PropertyItem[];
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

export function saveClientPropertiesBatch(props: PropertyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getClientProperties();
    const map = new Map<string, PropertyItem>();
    current.forEach((p) => map.set(p.id, p));
    props.forEach((p) => map.set(p.id, p));
    localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
  } catch (err) {
    console.warn('Error batch saving client properties:', err);
  }
}
