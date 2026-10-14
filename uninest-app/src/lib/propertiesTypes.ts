export interface PropertyItem {
  id: string;
  name: string;
  locality: string;
  city: string;
  address: string;
  verificationStatus: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  rentPerMonth: number;
  openTickets: number;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  images?: string[];
  rejectionReason?: string;
  editPendingVerification?: boolean;
  lastEditedAt?: string;
  type?: string;
  gender?: string;
  latitude?: number | null;
  longitude?: number | null;
}
