export interface DisputeCase {
  id: string;
  caseId: string;
  title: string;
  category: 'DAMAGE' | 'DEPOSIT' | 'ELECTRICITY' | 'MAINTENANCE' | 'RULES' | 'SERVICE' | 'LISTING' | 'SAFETY';
  status: 'OPEN' | 'IN_REVIEW' | 'SETTLEMENT_OFFERED' | 'RESOLVED' | 'ESCALATED';
  disputedAmount: number; // in rupees
  disputedAmountPaise: number; // in paise
  escrowFrozen: boolean;
  complainantName: string;
  complainantRole: 'STUDENT' | 'LANDLORD';
  complainantEmail?: string;
  respondentName: string;
  respondentRole: 'LANDLORD' | 'STUDENT' | 'PROVIDER';
  property: string;
  roomDetails?: string;
  description: string;
  evidence: string[];
  timeline: {
    date: string;
    event: string;
    author: string;
  }[];
  settlementOffer?: {
    offeredAmount: number;
    offeredBy: string;
    note: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  };
  landlordResponse?: string;
  resolution?: string | null;
  filedDate: string;
  lastUpdated: string;
}

export const INITIAL_DISPUTES: DisputeCase[] = [
  {
    id: 'dsp-1',
    caseId: 'UN-DMG-00452',
    title: 'Disputed Security Deposit Deduction for Pre-existing Door Scratch',
    category: 'DAMAGE',
    status: 'IN_REVIEW',
    disputedAmount: 1500,
    disputedAmountPaise: 150000,
    escrowFrozen: true,
    complainantName: 'Rahul Sharma (Student)',
    complainantRole: 'STUDENT',
    complainantEmail: 'rahul@uninest.in',
    respondentName: 'Vikram Singh (Passi Group Landlord)',
    respondentRole: 'LANDLORD',
    property: 'PCTE Smart Student Residency',
    roomDetails: 'Room 204 (Bed A)',
    description:
      'Landlord deducted ₹1,500 from security deposit for door scratch. However, Move-In Condition Report (DOC-MIN-2026) proves this scratch existed prior to move-in date.',
    evidence: [
      'Move_In_Photo_01.jpg',
      'Landlord_Deduction_Receipt.pdf',
      'DOC-MIN-2026_Handover_Audit.pdf',
    ],
    timeline: [
      {
        date: '10 Jul 2026, 11:30 AM',
        event: 'Dispute filed by Tenant (Rahul Sharma) — ₹1,500 Frozen in Escrow Vault',
        author: 'Rahul Sharma',
      },
      {
        date: '11 Jul 2026, 02:15 PM',
        event: 'Evidence submitted: Move-In condition inspection report DOC-MIN-2026',
        author: 'UniNest Trust Engine',
      },
      {
        date: '12 Jul 2026, 05:40 PM',
        event: 'Landlord proposed 50% mutual settlement: ₹750 refund',
        author: 'Vikram Singh',
      },
    ],
    settlementOffer: {
      offeredAmount: 750,
      offeredBy: 'Vikram Singh (Landlord)',
      note: 'The door scratch was present during initial inspection but tenant failed to polish it. Proposing 50% mutual settlement (₹750 refund).',
      status: 'PENDING',
    },
    landlordResponse:
      'The door scratch was present during initial inspection but tenant failed to polish it. Requesting 50% split (₹750 refund).',
    resolution: null,
    filedDate: '10 Jul 2026',
    lastUpdated: '12 Jul 2026',
  },
  {
    id: 'dsp-2',
    caseId: 'UN-ELE-00219',
    title: 'Sub-Meter Reading Mismatch for June 2026',
    category: 'ELECTRICITY',
    status: 'RESOLVED',
    disputedAmount: 800,
    disputedAmountPaise: 80000,
    escrowFrozen: false,
    complainantName: 'Rahul Sharma (Student)',
    complainantRole: 'STUDENT',
    complainantEmail: 'rahul@uninest.in',
    respondentName: 'Vikram Singh (Landlord)',
    respondentRole: 'LANDLORD',
    property: 'PCTE Smart Student Residency',
    roomDetails: 'Room 204 (Sub-Meter #204)',
    description:
      'June sub-meter reading logged 140 units, but meter photo shows 110 units. Disputed excess ₹800 bill.',
    evidence: ['Meter_Photo_June_30.jpg', 'PSPCL_Tariff_Calculation.pdf'],
    timeline: [
      { date: '01 Jul 2026, 09:00 AM', event: 'Dispute filed by Tenant', author: 'Rahul Sharma' },
      {
        date: '02 Jul 2026, 11:30 AM',
        event: 'Landlord verified meter photo and acknowledged typo',
        author: 'Vikram Singh',
      },
      {
        date: '02 Jul 2026, 04:00 PM',
        event: 'Case Closed: ₹800 credited to student wallet ledger',
        author: 'UniNest Automated Billing',
      },
    ],
    landlordResponse: 'Acknowledged typo during manual entry. Correct reading is 110 units.',
    resolution:
      'Case Closed: ₹800 excess charge refunded to student ledger. Sub-meter reading updated to 110 units.',
    filedDate: '01 Jul 2026',
    lastUpdated: '02 Jul 2026',
  },
  {
    id: 'dsp-3',
    caseId: 'UN-SRV-00104',
    title: 'Wi-Fi Downtime Refund Claim (3 Days Unusable)',
    category: 'SERVICE',
    status: 'RESOLVED',
    disputedAmount: 300,
    disputedAmountPaise: 30000,
    escrowFrozen: false,
    complainantName: 'Rahul Sharma (Student)',
    complainantRole: 'STUDENT',
    complainantEmail: 'rahul@uninest.in',
    respondentName: 'Ludhiana Net Services (Provider)',
    respondentRole: 'PROVIDER',
    property: 'PCTE Smart Student Residency',
    roomDetails: 'Room 204',
    description:
      'High-speed Wi-Fi boost service had 72 hours downtime during semester exams.',
    evidence: ['Speedtest_Logs.pdf', 'ISP_Ticket_Reference.txt'],
    timeline: [
      {
        date: '15 Jun 2026, 10:00 AM',
        event: 'Dispute filed against Service Provider',
        author: 'Rahul Sharma',
      },
      {
        date: '16 Jun 2026, 01:20 PM',
        event: 'SLA breach confirmed by automated fiber monitor',
        author: 'UniNest SLA Monitor',
      },
      {
        date: '17 Jun 2026, 03:00 PM',
        event: 'Pro-rata refund of ₹300 processed',
        author: 'Ludhiana Net Services',
      },
    ],
    landlordResponse: 'Fibre cut detected near campus gate. SLA credit issued automatically.',
    resolution: 'Case Closed: Pro-rata refund of ₹300 credited for 3 days outage.',
    filedDate: '15 Jun 2026',
    lastUpdated: '17 Jun 2026',
  },
  {
    id: 'dsp-4',
    caseId: 'DSP-9041',
    title: 'Late Night Music & Quiet Hours Breach in Adjacent Room 205',
    category: 'RULES',
    status: 'RESOLVED',
    disputedAmount: 0,
    disputedAmountPaise: 0,
    escrowFrozen: false,
    complainantName: 'Rahul Sharma (Student)',
    complainantRole: 'STUDENT',
    complainantEmail: 'rahul@uninest.in',
    respondentName: 'Rohit Verma (Room 205 Tenant)',
    respondentRole: 'STUDENT',
    property: 'PCTE Smart Student Residency',
    roomDetails: 'Room 204 / Room 205',
    description:
      'Excessive speaker volume after 11:30 PM during university exam preparation week.',
    evidence: ['Decibel_Meter_Log.png'],
    timeline: [
      { date: '01 Sep 2026, 08:30 AM', event: 'Noise complaint filed with landlord mediation', author: 'Rahul Sharma' },
      { date: '01 Sep 2026, 02:00 PM', event: 'Landlord addressed Room 205 occupants and issued warning', author: 'Vikram Singh' },
      { date: '01 Sep 2026, 05:00 PM', event: 'Mediation agreement signed: 10:30 PM quiet hours strictly enforced', author: 'Vikram Singh' },
    ],
    landlordResponse: 'Discussed with Room 205 tenants. Quiet hours (10:30 PM) enforced strictly.',
    resolution: 'Case Closed: Official warning issued to Room 205 occupants. Quiet hours curfew signed.',
    filedDate: '01 Sep 2026',
    lastUpdated: '01 Sep 2026',
  },
  {
    id: 'dsp-5',
    caseId: 'DSP-9048',
    title: 'AC Sub-Meter Surge Dispute for August 2026',
    category: 'ELECTRICITY',
    status: 'IN_REVIEW',
    disputedAmount: 600,
    disputedAmountPaise: 60000,
    escrowFrozen: true,
    complainantName: 'Aman Verma (Student)',
    complainantRole: 'STUDENT',
    complainantEmail: 'aman.verma@pcte.edu.in',
    respondentName: 'Vikram Singh (Landlord)',
    respondentRole: 'LANDLORD',
    property: 'PCTE Smart Student Residency',
    roomDetails: 'Room 204 (Bed B)',
    description:
      'Disputed 60 kWh surge during vacation week when student was out of town. Requesting smart meter sensor log audit.',
    evidence: ['Travel_Train_Tickets_Proof.pdf', 'Submeter_Surge_Graph.png'],
    timeline: [
      { date: '03 Sep 2026, 11:15 AM', event: 'Dispute filed by Aman Verma — ₹600 Frozen in Escrow', author: 'Aman Verma' },
      { date: '04 Sep 2026, 04:30 PM', event: 'Landlord reviewing smart meter IoT logs with PSPCL technician', author: 'Vikram Singh' },
    ],
    landlordResponse: 'Reviewing smart meter IoT logs with PSPCL technician to check for grounding leakage.',
    resolution: null,
    filedDate: '03 Sep 2026',
    lastUpdated: '04 Sep 2026',
  },
];

const globalForDisputes = globalThis as unknown as {
  uninestDisputesMemory?: DisputeCase[];
};

export function getDisputesStore(): DisputeCase[] {
  if (!globalForDisputes.uninestDisputesMemory) {
    globalForDisputes.uninestDisputesMemory = [...INITIAL_DISPUTES];
  }
  return globalForDisputes.uninestDisputesMemory;
}

export function getDisputesForRole(role: string, email?: string | null): DisputeCase[] {
  const all = getDisputesStore();
  if (role === 'LANDLORD' || role === 'ADMIN') {
    return all;
  }

  // Student view
  if (!email || email.includes('rahul') || email.includes('demo')) {
    return all.filter((d) => d.complainantEmail === 'rahul@uninest.in' || d.complainantName.includes('Rahul'));
  }

  // Specific real user
  return all.filter((d) => d.complainantEmail === email || d.complainantName.toLowerCase().includes(email.toLowerCase()));
}

export function addDisputeCase(item: Partial<DisputeCase>): DisputeCase {
  const all = getDisputesStore();
  const caseNum = Math.floor(1000 + Math.random() * 9000);
  const prefix = item.category === 'DAMAGE' ? 'UN-DMG' : item.category === 'ELECTRICITY' ? 'UN-ELE' : item.category === 'DEPOSIT' ? 'UN-DEP' : 'DSP';
  const newCaseId = item.caseId || `${prefix}-${caseNum}`;
  const amount = Number(item.disputedAmount) || 0;

  const nowStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const newCase: DisputeCase = {
    id: `dsp-${Date.now()}`,
    caseId: newCaseId,
    title: item.title || `${item.category || 'Tenant'} Dispute Case`,
    category: item.category || 'DAMAGE',
    status: 'IN_REVIEW',
    disputedAmount: amount,
    disputedAmountPaise: amount * 100,
    escrowFrozen: amount > 0,
    complainantName: item.complainantName || 'Verified Student',
    complainantRole: 'STUDENT',
    complainantEmail: item.complainantEmail || '',
    respondentName: item.respondentName || 'Vikram Singh (Landlord)',
    respondentRole: 'LANDLORD',
    property: item.property || 'PCTE Smart Student Residency',
    roomDetails: item.roomDetails || 'Room 204',
    description: item.description || 'Dispute submitted for digital mediation.',
    evidence: item.evidence && item.evidence.length > 0 ? item.evidence : ['Initial_Declaration_Evidence.pdf'],
    timeline: [
      {
        date: `${nowStr}, ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        event: `Dispute filed by ${item.complainantName || 'Student'}${amount > 0 ? ` — ₹${amount.toLocaleString('en-IN')} Frozen in Escrow Vault` : ''}`,
        author: item.complainantName || 'Student',
      },
    ],
    landlordResponse: undefined,
    resolution: null,
    filedDate: nowStr,
    lastUpdated: nowStr,
  };

  all.unshift(newCase);
  globalForDisputes.uninestDisputesMemory = all;
  return newCase;
}

export function updateDisputeCase(id: string, patch: Partial<DisputeCase>): DisputeCase | null {
  const all = getDisputesStore();
  const idx = all.findIndex((d) => d.id === id || d.caseId === id);
  if (idx === -1) return null;

  const updated: DisputeCase = {
    ...all[idx],
    ...patch,
    lastUpdated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  all[idx] = updated;
  globalForDisputes.uninestDisputesMemory = all;
  return updated;
}
