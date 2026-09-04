import {
  PaymentProvider,
  PaymentResult,
  KYCProvider,
  KYCResult,
  VerificationProvider,
  VerificationResult,
  NotificationProvider,
  NotificationPayload,
  MapsProvider,
  MapLocation,
  ServiceDispatchProvider,
  ServiceDispatchResult,
} from './interfaces';

// ─── DEMO PAYMENT PROVIDER ──────────────────────────────────────────────────

export class DemoPaymentProvider implements PaymentProvider {
  async processPayment(amount: number, method: string, description: string): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const txId = `UNP-DEMO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
    return {
      success: true,
      transactionId: txId,
      amount,
      method,
      message: `Demo payment successful — ${description}`,
      timestamp: new Date(),
    };
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      transactionId: `${transactionId}-REFUND`,
      amount,
      method: 'REFUND',
      message: 'Demo refund processed',
      timestamp: new Date(),
    };
  }

  async getPaymentStatus(transactionId: string): Promise<string> {
    void transactionId;
    return 'SUCCESS';
  }
}

// ─── DEMO KYC PROVIDER ──────────────────────────────────────────────────────

export class DemoKYCProvider implements KYCProvider {
  async submitVerification(data: Record<string, string>): Promise<KYCResult> {
    await new Promise(resolve => setTimeout(resolve, 600));
    void data;
    return {
      success: true,
      status: 'SUBMITTED',
      verificationId: `KYC-DEMO-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      message: 'Demo KYC verification submitted — processing will be simulated',
    };
  }

  async checkStatus(verificationId: string): Promise<KYCResult> {
    void verificationId;
    return {
      success: true,
      status: 'VERIFIED',
      verificationId,
      message: 'Demo verification completed',
    };
  }
}

// ─── DEMO VERIFICATION PROVIDER ─────────────────────────────────────────────

export class DemoVerificationProvider implements VerificationProvider {
  async submitVerification(data: Record<string, string>): Promise<VerificationResult> {
    await new Promise(resolve => setTimeout(resolve, 700));
    void data;
    const refNo = `TNV-DEMO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    return {
      success: true,
      referenceNo: refNo,
      status: 'SUBMITTED',
      message: 'Demo workflow — official authority integration pending',
    };
  }

  async checkStatus(referenceNo: string): Promise<VerificationResult> {
    void referenceNo;
    return {
      success: true,
      referenceNo,
      status: 'PROCESSING',
      message: 'Demo verification in progress',
    };
  }
}

// ─── DEMO NOTIFICATION PROVIDER ─────────────────────────────────────────────

export class DemoNotificationProvider implements NotificationProvider {
  async send(payload: NotificationPayload): Promise<boolean> {
    console.log(`[DEMO NOTIFICATION] To: ${payload.userId} — ${payload.title}: ${payload.message}`);
    return true;
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<boolean> {
    payloads.forEach(p => console.log(`[DEMO NOTIFICATION] To: ${p.userId} — ${p.title}`));
    return true;
  }
}

// ─── DEMO MAPS PROVIDER ─────────────────────────────────────────────────────

const DEMO_LOCATIONS: Record<string, MapLocation> = {
  'PCTE': { lat: 30.8984, lng: 75.8564, label: 'PCTE Group of Institutes' },
  'ABC PG': { lat: 30.9010, lng: 75.8530, label: 'ABC Student Residence' },
  'Sunrise PG': { lat: 30.8950, lng: 75.8600, label: 'Sunrise PG for Girls' },
  'default': { lat: 30.9000, lng: 75.8570, label: 'Ludhiana' },
};

export class DemoMapsProvider implements MapsProvider {
  async geocode(address: string): Promise<MapLocation | null> {
    const key = Object.keys(DEMO_LOCATIONS).find(k => address.toLowerCase().includes(k.toLowerCase()));
    return DEMO_LOCATIONS[key || 'default'];
  }

  async getDistance(from: MapLocation, to: MapLocation): Promise<number> {
    // Haversine approximation
    const R = 6371;
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

// ─── DEMO SERVICE DISPATCH PROVIDER ─────────────────────────────────────────

const DEMO_PROVIDERS = [
  { id: 'prov-1', name: 'QuickFix Plumbing', eta: '30 min', cost: 50000 },
  { id: 'prov-2', name: 'Shanti Electricals', eta: '45 min', cost: 40000 },
  { id: 'prov-3', name: 'CleanHome Services', eta: '1 hour', cost: 30000 },
  { id: 'prov-4', name: 'CoolBreeze AC Repair', eta: '2 hours', cost: 80000 },
];

export class DemoServiceDispatchProvider implements ServiceDispatchProvider {
  async findProvider(category: string, location: MapLocation): Promise<ServiceDispatchResult> {
    void location;
    const provider = DEMO_PROVIDERS[Math.floor(Math.random() * DEMO_PROVIDERS.length)];
    void category;
    return {
      success: true,
      providerId: provider.id,
      providerName: provider.name,
      eta: provider.eta,
      estimatedCost: provider.cost,
    };
  }

  async assignJob(providerId: string, jobDetails: Record<string, string>): Promise<boolean> {
    void providerId;
    void jobDetails;
    return true;
  }
}

// ─── FACTORY ─────────────────────────────────────────────────────────────────

export function getPaymentProvider(): PaymentProvider {
  return new DemoPaymentProvider();
}

export function getKYCProvider(): KYCProvider {
  return new DemoKYCProvider();
}

export function getVerificationProvider(): VerificationProvider {
  return new DemoVerificationProvider();
}

export function getNotificationProvider(): NotificationProvider {
  return new DemoNotificationProvider();
}

export function getMapsProvider(): MapsProvider {
  return new DemoMapsProvider();
}

export function getServiceDispatchProvider(): ServiceDispatchProvider {
  return new DemoServiceDispatchProvider();
}
