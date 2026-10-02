export interface AdminMessage {
  id: string;
  fromRole: 'ADMIN' | 'LANDLORD' | 'SYSTEM';
  fromName: string;
  toPropertyId: string;
  propertyName?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const DEFAULT_ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: 'msg-seed-1',
    fromRole: 'ADMIN',
    fromName: 'UniNest Compliance Officer',
    toPropertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    message: 'Official Notice: Punjab Police Form-11 compliance verified & CCTV security setup acknowledged. Your listing is verified with Tier-1 priority placement.',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-2',
    fromRole: 'ADMIN',
    fromName: 'UniNest Verification Team',
    toPropertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    message: 'Notice regarding listing verification: Please confirm if biometric entry door lock has been installed as mentioned in amenities to maintain Gold badge status.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false,
  },
];

const globalMessagesStore = globalThis as unknown as {
  __uninest_admin_messages?: AdminMessage[];
};

export function initAdminMessagesStore(): AdminMessage[] {
  if (!globalMessagesStore.__uninest_admin_messages || globalMessagesStore.__uninest_admin_messages.length === 0) {
    globalMessagesStore.__uninest_admin_messages = [...DEFAULT_ADMIN_MESSAGES];
  }
  return globalMessagesStore.__uninest_admin_messages;
}

export function getAdminMessages(propertyId?: string): AdminMessage[] {
  const store = initAdminMessagesStore();
  if (!propertyId) return [...store].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return store
    .filter((m) => m.toPropertyId === propertyId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function addAdminMessage(data: {
  fromRole: 'ADMIN' | 'LANDLORD' | 'SYSTEM';
  fromName: string;
  toPropertyId: string;
  propertyName?: string;
  message: string;
}): AdminMessage {
  const store = initAdminMessagesStore();
  const newMsg: AdminMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromRole: data.fromRole,
    fromName: data.fromName,
    toPropertyId: data.toPropertyId,
    propertyName: data.propertyName || 'Property',
    message: data.message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  store.push(newMsg);
  return newMsg;
}

export function markAdminMessagesAsRead(propertyId: string): void {
  const store = initAdminMessagesStore();
  store.forEach((m) => {
    if (m.toPropertyId === propertyId) {
      m.read = true;
    }
  });
}

export function getLatestAdminMessage(): AdminMessage | null {
  const store = initAdminMessagesStore();
  if (store.length === 0) return null;
  const sorted = [...store].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return sorted[0];
}
