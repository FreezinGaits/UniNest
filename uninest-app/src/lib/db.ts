import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  rawPrisma: PrismaClient | undefined;
  prisma: PrismaClient | undefined;
  dbOfflineUntil: number | undefined;
};

const rawPrisma =
  globalForPrisma.rawPrisma ??
  new PrismaClient({
    log: [],
  });

// If DATABASE_URL is missing or points to the default unseeded localhost:5432 placeholder
// (unless UNINEST_LIVE_DB="true" is explicitly set), trip the circuit breaker immediately
// so Prisma never blocks requests for 2-5 seconds attempting dead TCP retries.
const dbUrl = process.env.DATABASE_URL || '';
const isDefaultLocalPlaceholder =
  !dbUrl ||
  ((dbUrl.includes('localhost:5432') || dbUrl.includes('127.0.0.1:5432')) &&
    process.env.UNINEST_LIVE_DB !== 'true');

if (isDefaultLocalPlaceholder && !globalForPrisma.dbOfflineUntil) {
  globalForPrisma.dbOfflineUntil = Number.MAX_SAFE_INTEGER;
}

const DB_TIMEOUT_MS = 200;
const CIRCUIT_COOLDOWN_MS = 300_000; // 5 minutes fast-fail cooldown when DB is unreachable

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err.name || '');
  return (
    err.name === 'PrismaClientInitializationError' ||
    err.code === 'P1001' ||
    err.code === 'P1002' ||
    err.code === 'P1003' ||
    msg.includes("Can't reach database server") ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('DB_TIMEOUT') ||
    msg.includes('DB_CIRCUIT_OPEN')
  );
}

function wrapAsyncOperation(fn: (...args: any[]) => any, context: any) {
  return (...args: any[]) => {
    const now = Date.now();
    if (globalForPrisma.dbOfflineUntil && now < globalForPrisma.dbOfflineUntil) {
      return Promise.reject(new Error('DB_CIRCUIT_OPEN'));
    }

    try {
      const result = fn.apply(context, args);
      if (result && typeof result.then === 'function') {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const timeoutPromise = new Promise((_, reject) => {
          timer = setTimeout(() => {
            globalForPrisma.dbOfflineUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
            reject(new Error('DB_TIMEOUT'));
          }, DB_TIMEOUT_MS);
        });

        return Promise.race([result, timeoutPromise])
          .then((val) => {
            if (timer) clearTimeout(timer);
            globalForPrisma.dbOfflineUntil = 0;
            return val;
          })
          .catch((err) => {
            if (timer) clearTimeout(timer);
            if (isConnectionError(err)) {
              globalForPrisma.dbOfflineUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
            }
            throw err;
          });
      }
      return result;
    } catch (err) {
      if (isConnectionError(err)) {
        globalForPrisma.dbOfflineUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      }
      throw err;
    }
  };
}

function createFastFailPrismaProxy(client: PrismaClient): PrismaClient {
  const modelProxyCache = new Map<string | symbol, any>();

  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof prop === 'symbol' || prop === 'then') {
        return value;
      }

      if (typeof value === 'function') {
        return wrapAsyncOperation(value, target);
      }

      if (value && typeof value === 'object') {
        if (modelProxyCache.has(prop)) {
          return modelProxyCache.get(prop);
        }
        const modelProxy = new Proxy(value, {
          get(modelTarget, modelProp, modelReceiver) {
            const method = Reflect.get(modelTarget, modelProp, modelReceiver);
            if (typeof method === 'function') {
              return wrapAsyncOperation(method, modelTarget);
            }
            return method;
          },
        });
        modelProxyCache.set(prop, modelProxy);
        return modelProxy;
      }

      return value;
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createFastFailPrismaProxy(rawPrisma);

globalForPrisma.rawPrisma = rawPrisma;
globalForPrisma.prisma = prisma;

