import { PropertyItem } from './propertiesTypes';

function getFs() {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return eval('require')('fs');
  } catch {
    return null;
  }
}

function getPath() {
  if (typeof window !== 'undefined') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return eval('require')('path');
  } catch {
    return null;
  }
}

function getStoragePath(): string | null {
  const path = getPath();
  if (!path) return null;
  // On Vercel or serverless lambdas, cwd is read-only; /tmp is writable
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'custom_properties.json');
  }
  return path.join(process.cwd(), 'data', 'custom_properties.json');
}

function ensureParentDir(filePath: string) {
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return;
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Read-only filesystem or permissions
  }
}

export function readServerProperties(): PropertyItem[] {
  const fs = getFs();
  const path = getPath();
  if (!fs || !path) return [];

  try {
    const filePath = getStoragePath();
    if (!filePath || !fs.existsSync(filePath)) {
      // Also check local data directory if we are running in /tmp mode
      const localDataFile = path.join(process.cwd(), 'data', 'custom_properties.json');
      if (filePath !== localDataFile && fs.existsSync(localDataFile)) {
        const rawLocal = fs.readFileSync(localDataFile, 'utf-8');
        if (rawLocal.trim()) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed)) return parsed;
        }
      }
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading server properties file:', err);
    return [];
  }
}

export function writeServerProperties(properties: PropertyItem[]): boolean {
  const fs = getFs();
  if (!fs) return false;

  try {
    const filePath = getStoragePath();
    if (!filePath) return false;
    ensureParentDir(filePath);
    const dataToWrite = JSON.stringify(properties, null, 2);
    fs.writeFileSync(filePath, dataToWrite, 'utf-8');
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
