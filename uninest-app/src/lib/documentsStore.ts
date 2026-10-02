export interface DocumentItem {
  id: string;
  title: string;
  category: 'AGREEMENT' | 'RECEIPT' | 'KYC' | 'COLLEGE' | 'AUDIT' | 'POLICE' | 'PROPERTY';
  referenceNo: string;
  issueDate: string;
  fileSize: string;
  status: 'SIGNED' | 'ISSUED' | 'VERIFIED' | 'ACTIVE' | 'ARCHIVED';
  issuer: string;
  tenantName?: string;
  property: string;
  amount?: string;
  roomDetails?: string;
  paymentMethod?: string;
  transactionId?: string;
  isPlatformLocked: boolean; // True for system contracts/receipts (cannot be deleted)
  sharedWithTenant: boolean;  // True = visible in Student Documents Vault
  sharedScope: 'ALL_TENANTS' | 'SPECIFIC_TENANT' | 'PRIVATE_LANDLORD';
  uploadedByRole: 'PLATFORM' | 'LANDLORD' | 'STUDENT';
}

export const INITIAL_SHARED_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Student PG Rental Agreement (PCTE Smart Residency)',
    category: 'AGREEMENT',
    referenceNo: 'UN-AGR-2026-8801',
    issueDate: '15 Aug 2026',
    fileSize: '1.4 MB',
    status: 'SIGNED',
    issuer: 'Passi Residency Properties Ltd. & Rahul Sharma',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    roomDetails: 'Room 204 (Bed A)',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-2',
    title: 'August 2026 Monthly Rent Receipt (₹6,000 Paid)',
    category: 'RECEIPT',
    referenceNo: 'UN-RCT-2026-0814',
    issueDate: '01 Sep 2026',
    fileSize: '340 KB',
    status: 'ISSUED',
    issuer: 'Razorpay / UniNest Automated Billing',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    roomDetails: 'Room 204 (Bed A)',
    amount: '₹6,000.00',
    paymentMethod: 'UPI (Google Pay)',
    transactionId: 'TXN-GPI-99201',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-3',
    title: 'Security Deposit Escrow Receipt (₹12,000 Locked)',
    category: 'RECEIPT',
    referenceNo: 'UN-DEP-2026-1029',
    issueDate: '15 Aug 2026',
    fileSize: '450 KB',
    status: 'ACTIVE',
    issuer: 'UniNest Tri-Party Escrow Trust & Passi Residency',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    roomDetails: 'Room 204 (Bed A)',
    amount: '₹12,000.00',
    paymentMethod: 'HDFC Escrow Vault Transfer',
    transactionId: 'ESCROW-LOCK-77120',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-4',
    title: 'Government Aadhaar KYC Identity Verification',
    category: 'KYC',
    referenceNo: 'UN-KYC-2026-4402',
    issueDate: '10 Aug 2026',
    fileSize: '820 KB',
    status: 'VERIFIED',
    issuer: 'UIDAI / UniNest Identity Trust Engine',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-5',
    title: 'College Residence & Local Hostel NOC Certificate',
    category: 'COLLEGE',
    referenceNo: 'PCTE-NOC-2026-092',
    issueDate: '12 Aug 2026',
    fileSize: '510 KB',
    status: 'VERIFIED',
    issuer: 'PCTE Institute Student Affairs Desk',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Group of Institutes, Ludhiana',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-6',
    title: 'Move-In Condition & Amenities Handover Audit (Room 204)',
    category: 'AUDIT',
    referenceNo: 'UN-MIN-2026-204A',
    issueDate: '15 Aug 2026',
    fileSize: '2.1 MB',
    status: 'SIGNED',
    issuer: 'UniNest Digital Inspection Team',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    roomDetails: 'Room 204 (Bed A)',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-7',
    title: 'Police Clearance & Tenant Verification Acknowledgement',
    category: 'POLICE',
    referenceNo: 'POL-LDH-2026-8819',
    issueDate: '12 Aug 2026',
    fileSize: '620 KB',
    status: 'VERIFIED',
    issuer: 'Punjab Police Division No. 5 (Ludhiana)',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency',
    isPlatformLocked: true,
    sharedWithTenant: true,
    sharedScope: 'SPECIFIC_TENANT',
    uploadedByRole: 'PLATFORM',
  },
  {
    id: 'doc-8',
    title: 'PG Property Registration Certificate & Municipal Fire NOC',
    category: 'PROPERTY',
    referenceNo: 'LIC-LDH-2026-0041',
    issueDate: '01 Jan 2026',
    fileSize: '2.8 MB',
    status: 'VERIFIED',
    issuer: 'Ludhiana Municipal Corporation & Fire Dept',
    tenantName: 'Vikram Singh (Passi Group)',
    property: 'PCTE Smart Student Residency & Passi Luxury PG',
    isPlatformLocked: false,
    sharedWithTenant: true,
    sharedScope: 'ALL_TENANTS',
    uploadedByRole: 'LANDLORD',
  },
  {
    id: 'doc-9',
    title: '1st_year_merged (Hostel Code of Conduct & Sub-meter Rules)',
    category: 'PROPERTY',
    referenceNo: 'LND-DOC-2026-01',
    issueDate: '02 Oct 2026',
    fileSize: '399 KB',
    status: 'VERIFIED',
    issuer: 'Vikram Singh (PG Management)',
    tenantName: 'Vikram Singh',
    property: 'PCTE Smart Student Residency',
    isPlatformLocked: false,
    sharedWithTenant: true,
    sharedScope: 'ALL_TENANTS',
    uploadedByRole: 'LANDLORD',
  },
];

const globalForDocs = globalThis as unknown as {
  uninestDocumentsMemory?: DocumentItem[];
};

export function getDocumentsStore(): DocumentItem[] {
  if (!globalForDocs.uninestDocumentsMemory) {
    globalForDocs.uninestDocumentsMemory = [...INITIAL_SHARED_DOCUMENTS];
  }
  return globalForDocs.uninestDocumentsMemory;
}

export function getDocumentsForStudent(studentEmail?: string | null): DocumentItem[] {
  const all = getDocumentsStore();
  return all.filter((d) => d.sharedWithTenant && d.status !== 'ARCHIVED');
}

export function getDocumentsForLandlord(landlordEmail?: string | null): DocumentItem[] {
  const all = getDocumentsStore();
  return all.filter((d) => d.status !== 'ARCHIVED');
}

export function addDocument(doc: Partial<DocumentItem>): DocumentItem {
  const all = getDocumentsStore();
  const newDoc: DocumentItem = {
    id: doc.id || `doc-up-${Date.now()}`,
    title: doc.title || 'Property Document',
    category: doc.category || 'PROPERTY',
    referenceNo: doc.referenceNo || `UN-DOC-${Date.now().toString().slice(-4)}`,
    issueDate:
      doc.issueDate ||
      new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    fileSize: doc.fileSize || '450 KB',
    status: doc.status || 'VERIFIED',
    issuer: doc.issuer || 'Property Management',
    tenantName: doc.tenantName || 'All PG Tenants',
    property: doc.property || 'PCTE Smart Student Residency',
    roomDetails: doc.roomDetails,
    amount: doc.amount,
    paymentMethod: doc.paymentMethod,
    transactionId: doc.transactionId,
    isPlatformLocked: doc.isPlatformLocked ?? false,
    sharedWithTenant: doc.sharedWithTenant ?? true,
    sharedScope: doc.sharedScope || 'ALL_TENANTS',
    uploadedByRole: doc.uploadedByRole || 'LANDLORD',
  };

  const existingIdx = all.findIndex((d) => d.id === newDoc.id);
  if (existingIdx !== -1) {
    all[existingIdx] = newDoc;
  } else {
    all.unshift(newDoc);
  }

  globalForDocs.uninestDocumentsMemory = all;
  return newDoc;
}

export function updateDocument(id: string, patch: Partial<DocumentItem>): DocumentItem | null {
  const all = getDocumentsStore();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;

  // Protect platform-locked legal contracts from unauthorized mutation
  if (all[idx].isPlatformLocked && (patch.title || patch.status === 'ARCHIVED')) {
    return all[idx]; // cannot mutate immutable legal contracts
  }

  all[idx] = { ...all[idx], ...patch };
  globalForDocs.uninestDocumentsMemory = all;
  return all[idx];
}

export function archiveDocument(id: string): boolean {
  const all = getDocumentsStore();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  if (all[idx].isPlatformLocked) return false; // cannot delete platform contracts

  all[idx].status = 'ARCHIVED';
  all[idx].sharedWithTenant = false;
  globalForDocs.uninestDocumentsMemory = all;
  return true;
}
