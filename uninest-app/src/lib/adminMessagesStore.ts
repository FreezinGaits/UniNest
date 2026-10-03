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

export interface PropertyAuditEvent {
  id: string;
  propertyId: string;
  propertyName: string;
  actorRole: 'ADMIN' | 'LANDLORD' | 'SYSTEM';
  actorName: string;
  action: 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'DOCUMENT_UPLOADED' | 'NOTE_POSTED' | 'AUDIT_REQUESTED';
  title: string;
  details?: string;
  timestamp: string;
}

const DEFAULT_ADMIN_MESSAGES: AdminMessage[] = [
  // PCTE Smart Student Residency (prop-pcte-1)
  {
    id: 'msg-seed-1',
    fromRole: 'ADMIN',
    fromName: 'UniNest Compliance Officer',
    toPropertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    message: 'Official Notice: Punjab Police Form-11 compliance verified & CCTV security setup acknowledged. Your listing is verified with Tier-1 priority placement.',
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-pcte-hi',
    fromRole: 'ADMIN',
    fromName: 'UniNest Admin (ADMIN)',
    toPropertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    message: 'Hi — please provide the updated fire safety certificate and inspect the electrical distribution panel in Block B.',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-pcte-reply',
    fromRole: 'LANDLORD',
    fromName: 'Vikram Singh (Landlord)',
    toPropertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    message: 'Hello Admin, our caretaker has inspected the wiring and we are procuring 4 new ABC-type fire extinguishers for each floor.',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-pcte-audit',
    fromRole: 'ADMIN',
    fromName: 'UniNest Compliance Officer',
    toPropertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    message: 'Notice regarding fire safety: Extinguishers must be refilled and certified by Ludhiana Municipal Fire Directorate before the listing badge can be reinstated.',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    read: false,
  },

  // Passi Luxury PG & Co-Living (prop-pcte-2)
  {
    id: 'msg-seed-2',
    fromRole: 'ADMIN',
    fromName: 'UniNest Verification Team',
    toPropertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    message: 'Notice regarding listing verification: Please confirm if biometric entry door lock has been installed as mentioned in amenities to maintain Gold badge status.',
    timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-passi-reply',
    fromRole: 'LANDLORD',
    fromName: 'Vikram Singh (Landlord)',
    toPropertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    message: 'Yes, the biometric fingerprint & RFID entry lock was installed on the main entrance gate yesterday. Invoice and photo uploaded to compliance vault.',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-passi-ack',
    fromRole: 'ADMIN',
    fromName: 'UniNest Verification Team',
    toPropertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    message: 'Thank you Vikram. Biometric gate setup verified by our Ludhiana ground surveyor. Gold Verification Badge awarded and live on student search.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false,
  },

  // Campus Edge Girls Hostel (prop-demo-03)
  {
    id: 'msg-seed-campusedge',
    fromRole: 'ADMIN',
    fromName: 'UniNest Safety Board',
    toPropertyId: 'prop-demo-03',
    propertyName: 'Campus Edge Girls Hostel',
    message: 'Women safety protocol audit passed. 24x7 female security guard and CCTV coverage verified. Verified badge active.',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-seed-campusedge-reply',
    fromRole: 'LANDLORD',
    fromName: 'Sunita Devi (Landlord)',
    toPropertyId: 'prop-demo-03',
    propertyName: 'Campus Edge Girls Hostel',
    message: 'Thank you. Warden registration details and Punjab Police Form-11 copies for all 8 current residents have been submitted.',
    timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    read: true,
  },
];

const DEFAULT_AUDIT_EVENTS: PropertyAuditEvent[] = [
  // PCTE Smart Student Residency
  {
    id: 'evt-1',
    propertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    actorRole: 'LANDLORD',
    actorName: 'Vikram Singh',
    action: 'SUBMITTED',
    title: 'Property Listing Registered & Submitted',
    details: 'Initial submission of 6 rooms, 12 beds with photo gallery and amenitites.',
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'evt-2',
    propertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    actorRole: 'ADMIN',
    actorName: 'UniNest Compliance Officer',
    action: 'VERIFIED',
    title: 'Form-11 & Police Verification Approved',
    details: 'Tenant registration records matching Ludhiana Police requirements.',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'evt-3',
    propertyId: 'prop-pcte-1',
    propertyName: 'PCTE Smart Student Residency',
    actorRole: 'ADMIN',
    actorName: 'UniNest Admin',
    action: 'REJECTED',
    title: 'Verification Status Updated: REJECTED',
    details: 'Reason: Fire safety non-compliant. Extinguishers overdue for municipal inspection.',
    timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
  },

  // Passi Luxury PG & Co-Living
  {
    id: 'evt-4',
    propertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    actorRole: 'LANDLORD',
    actorName: 'Vikram Singh',
    action: 'SUBMITTED',
    title: 'Property Listing Registered & Submitted',
    details: 'Submission of 8 rooms, 16 beds with attached baths and high-speed Wi-Fi.',
    timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'evt-5',
    propertyId: 'prop-pcte-2',
    propertyName: 'Passi Luxury PG & Co-Living',
    actorRole: 'ADMIN',
    actorName: 'UniNest Verification Team',
    action: 'VERIFIED',
    title: 'Listing Approved & Verified',
    details: 'Physical verification audit completed. Biometric security verified.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },

  // Campus Edge Girls Hostel
  {
    id: 'evt-6',
    propertyId: 'prop-demo-03',
    propertyName: 'Campus Edge Girls Hostel',
    actorRole: 'LANDLORD',
    actorName: 'Sunita Devi',
    action: 'SUBMITTED',
    title: 'Property Listing Registered & Submitted',
    details: '5 rooms, 10 beds girls hostel near BRS Nagar market.',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'evt-7',
    propertyId: 'prop-demo-03',
    propertyName: 'Campus Edge Girls Hostel',
    actorRole: 'ADMIN',
    actorName: 'UniNest Safety Board',
    action: 'VERIFIED',
    title: 'Women Safety & Security Protocol Certified',
    details: 'Full verification completed. Verified badge live.',
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

const globalMessagesStore = globalThis as unknown as {
  __uninest_admin_messages?: AdminMessage[];
  __uninest_property_audit_events?: PropertyAuditEvent[];
};

export function initAdminMessagesStore(): AdminMessage[] {
  if (!globalMessagesStore.__uninest_admin_messages || globalMessagesStore.__uninest_admin_messages.length === 0) {
    globalMessagesStore.__uninest_admin_messages = [...DEFAULT_ADMIN_MESSAGES];
  }
  return globalMessagesStore.__uninest_admin_messages;
}

export function initAuditEventsStore(): PropertyAuditEvent[] {
  if (!globalMessagesStore.__uninest_property_audit_events || globalMessagesStore.__uninest_property_audit_events.length === 0) {
    globalMessagesStore.__uninest_property_audit_events = [...DEFAULT_AUDIT_EVENTS];
  }
  return globalMessagesStore.__uninest_property_audit_events;
}

export function getAdminMessages(propertyId?: string): AdminMessage[] {
  const store = initAdminMessagesStore();
  if (!propertyId) return [...store].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return store
    .filter((m) => m.toPropertyId === propertyId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function mergeAdminMessages(incoming: AdminMessage[]): AdminMessage[] {
  const store = initAdminMessagesStore();
  const existingMap = new Map<string, AdminMessage>();
  store.forEach((m) => existingMap.set(m.id, m));

  incoming.forEach((msg) => {
    if (!existingMap.has(msg.id)) {
      existingMap.set(msg.id, msg);
    }
  });

  const merged = Array.from(existingMap.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  globalMessagesStore.__uninest_admin_messages = merged;
  return merged;
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

  // Automatically record this communication in the property audit trail
  addPropertyAuditEvent({
    propertyId: data.toPropertyId,
    propertyName: data.propertyName || 'Property',
    actorRole: data.fromRole,
    actorName: data.fromName,
    action: 'NOTE_POSTED',
    title: `Official Note from ${data.fromRole === 'ADMIN' ? 'UniNest Admin' : 'Landlord'}`,
    details: data.message,
  });

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

export function getPropertyAuditTrail(propertyId?: string): PropertyAuditEvent[] {
  const events = initAuditEventsStore();
  if (!propertyId) return [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events
    .filter((e) => e.propertyId === propertyId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addPropertyAuditEvent(data: {
  propertyId: string;
  propertyName: string;
  actorRole: 'ADMIN' | 'LANDLORD' | 'SYSTEM';
  actorName: string;
  action: PropertyAuditEvent['action'];
  title: string;
  details?: string;
}): PropertyAuditEvent {
  const events = initAuditEventsStore();
  const newEvt: PropertyAuditEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    propertyId: data.propertyId,
    propertyName: data.propertyName,
    actorRole: data.actorRole,
    actorName: data.actorName,
    action: data.action,
    title: data.title,
    details: data.details,
    timestamp: new Date().toISOString(),
  };

  events.unshift(newEvt);
  return newEvt;
}
