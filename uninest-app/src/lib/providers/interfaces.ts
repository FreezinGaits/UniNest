// Provider abstraction interfaces for future real integrations

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  method: string;
  message: string;
  timestamp: Date;
}

export interface PaymentProvider {
  processPayment(amount: number, method: string, description: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<PaymentResult>;
  getPaymentStatus(transactionId: string): Promise<string>;
}

export interface KYCResult {
  success: boolean;
  status: string;
  verificationId: string;
  message: string;
}

export interface KYCProvider {
  submitVerification(data: Record<string, string>): Promise<KYCResult>;
  checkStatus(verificationId: string): Promise<KYCResult>;
}

export interface VerificationResult {
  success: boolean;
  referenceNo: string;
  status: string;
  message: string;
}

export interface VerificationProvider {
  submitVerification(data: Record<string, string>): Promise<VerificationResult>;
  checkStatus(referenceNo: string): Promise<VerificationResult>;
}

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
}

export interface NotificationProvider {
  send(payload: NotificationPayload): Promise<boolean>;
  sendBulk(payloads: NotificationPayload[]): Promise<boolean>;
}

export interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
}

export interface MapsProvider {
  geocode(address: string): Promise<MapLocation | null>;
  getDistance(from: MapLocation, to: MapLocation): Promise<number>;
}

export interface ServiceDispatchResult {
  success: boolean;
  providerId: string;
  providerName: string;
  eta: string;
  estimatedCost: number;
}

export interface ServiceDispatchProvider {
  findProvider(category: string, location: MapLocation): Promise<ServiceDispatchResult>;
  assignJob(providerId: string, jobDetails: Record<string, string>): Promise<boolean>;
}
