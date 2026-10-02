export interface EmergencyDispatchRecord {
  id: string;
  dispatchNo: string;
  title: string;
  category: 'ELECTRICAL' | 'PLUMBING' | 'LOCKOUT' | 'WATER' | 'HAZARD' | 'MEDICAL' | 'SECURITY';
  property: string;
  unit: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  landlordName: string;
  landlordPhone: string;
  assignedVendor: string;
  assignedTech: string;
  techPhone: string;
  priority: 'CRITICAL_15MIN' | 'HIGH_90MIN';
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'RESOLVED';
  etaMins: number;
  reportedAt: string;
  resolvedAt?: string;
  notes?: string;
}

const INITIAL_EMERGENCIES: EmergencyDispatchRecord[] = [
  {
    id: 'emg-1',
    dispatchNo: 'EMG-2026-904',
    title: 'Main Fuse / Power Outage',
    category: 'ELECTRICAL',
    property: 'PCTE Smart Student Residency',
    unit: 'Room 204 (Bed A)',
    tenantName: 'Rahul Sharma',
    tenantPhone: '+91 98765 43210',
    tenantEmail: 'rahul@uninest.in',
    landlordName: 'Vikram Singh (Passi Residency)',
    landlordPhone: '+91 98140 12345',
    assignedVendor: 'QuickFix Services',
    assignedTech: 'Gurdeep Singh (Sr. Electrician)',
    techPhone: '+91 98765 00011',
    priority: 'CRITICAL_15MIN',
    status: 'EN_ROUTE',
    etaMins: 12,
    reportedAt: 'Today, 05:15 PM',
    notes: 'Power breaker tripped across 2nd floor corridor socket cluster.',
  },
  {
    id: 'emg-2',
    dispatchNo: 'EMG-2026-892',
    title: 'Bathroom Diverter & Tap Leakage Repair',
    category: 'PLUMBING',
    property: 'PCTE Smart Student Residency',
    unit: 'Room 204',
    tenantName: 'Rahul Sharma',
    tenantPhone: '+91 98765 43210',
    tenantEmail: 'rahul@uninest.in',
    landlordName: 'Vikram Singh (Passi Residency)',
    landlordPhone: '+91 98140 12345',
    assignedVendor: 'QuickFix Services',
    assignedTech: 'Manoj Kumar (Master Plumber)',
    techPhone: '+91 98765 00012',
    priority: 'HIGH_90MIN',
    status: 'RESOLVED',
    etaMins: 0,
    reportedAt: 'Yesterday, 02:30 PM',
    resolvedAt: 'Yesterday, 03:45 PM',
    notes: 'Replaced ceramic cartridge diverter. Water flow normalized.',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __uninest_emergencies: EmergencyDispatchRecord[] | undefined;
}

export function getEmergencyStore(): EmergencyDispatchRecord[] {
  if (!globalThis.__uninest_emergencies) {
    globalThis.__uninest_emergencies = [...INITIAL_EMERGENCIES];
  }
  return globalThis.__uninest_emergencies;
}

const TECH_CATALOG: Record<string, { tech: string; phone: string; category: EmergencyDispatchRecord['category'] }> = {
  'Main Fuse / Power Outage': { tech: 'Gurdeep Singh (Sr. Electrician)', phone: '+91 98765 00011', category: 'ELECTRICAL' },
  'Water Pipe Burst / Tank Empty': { tech: 'Manoj Kumar (Master Plumber)', phone: '+91 98765 00012', category: 'PLUMBING' },
  'Electronic Door Lock Jammed': { tech: 'Jagjit Singh (Smart Lock Lead)', phone: '+91 98765 00013', category: 'LOCKOUT' },
  'Severe Water Logging': { tech: 'Harpreet Singh (Drainage Specialist)', phone: '+91 98765 00014', category: 'WATER' },
  'Gas / Kitchen Leak': { tech: 'Rajesh Sharma (Pantry Safety Lead)', phone: '+91 98765 00015', category: 'HAZARD' },
};

export function addEmergencyDispatch(payload: {
  title: string;
  property?: string;
  unit?: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
}): EmergencyDispatchRecord {
  const store = getEmergencyStore();
  const techInfo = TECH_CATALOG[payload.title] || {
    tech: 'QuickFix Rapid Duty Tech',
    phone: '+91 98765 00010',
    category: 'PLUMBING' as const,
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  const newRecord: EmergencyDispatchRecord = {
    id: `emg-${Date.now()}`,
    dispatchNo: `EMG-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: payload.title,
    category: techInfo.category,
    property: payload.property || 'PCTE Smart Student Residency',
    unit: payload.unit || 'Room 204 (Bed A)',
    tenantName: payload.tenantName || 'Rahul Sharma',
    tenantPhone: payload.tenantPhone || '+91 98765 43210',
    tenantEmail: payload.tenantEmail || 'rahul@uninest.in',
    landlordName: 'Vikram Singh (Passi Residency)',
    landlordPhone: '+91 98140 12345',
    assignedVendor: 'QuickFix Services',
    assignedTech: techInfo.tech,
    techPhone: techInfo.phone,
    priority: 'CRITICAL_15MIN',
    status: 'DISPATCHED',
    etaMins: 15,
    reportedAt: `Today, ${timeStr} (${dateStr})`,
    notes: 'Urgent 15-Min SLA dispatch triggered via Student Safety SOS.',
  };

  store.unshift(newRecord);
  return newRecord;
}

export function updateEmergencyStatus(
  id: string,
  status: EmergencyDispatchRecord['status'],
  notes?: string
): EmergencyDispatchRecord | null {
  const store = getEmergencyStore();
  const record = store.find((r) => r.id === id || r.dispatchNo === id);
  if (!record) return null;

  record.status = status;
  if (notes) record.notes = notes;
  if (status === 'RESOLVED') {
    const now = new Date();
    record.resolvedAt = `Today, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    record.etaMins = 0;
  } else if (status === 'ON_SITE') {
    record.etaMins = 0;
  }
  return record;
}

export function getEmergenciesForRole(role: string, email?: string | null): EmergencyDispatchRecord[] {
  const store = getEmergencyStore();
  if (role === 'ADMIN' || role === 'PROVIDER') {
    return store;
  }
  if (role === 'LANDLORD') {
    return store; // In production, filter by landlord properties
  }
  if (role === 'STUDENT') {
    return store.filter((r) => !email || r.tenantEmail === email || r.tenantEmail.includes('rahul'));
  }
  return store;
}
