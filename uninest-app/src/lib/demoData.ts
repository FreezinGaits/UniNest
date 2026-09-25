/**
 * UniNest — Shared Central Demo Constants
 * Single source of truth for fallback data across all client & server components.
 */

export const DEMO_STUDENT = {
  id: 'usr-student-demo',
  userId: 'usr-student-demo',
  name: 'Rahul Sharma',
  email: 'rahul@uninest.demo',
  phone: '+91 98765 43210',
  collegeName: 'PCTE Institute of Management, Baddowal',
  enrollmentNo: 'PCTE-BTECH-2024-042',
  course: 'B.Tech Computer Science (3rd Year)',
  roomAssignment: 'Room 204, Bed B',
  propertyName: 'PCTE Smart Student Residency',
  guardianName: 'Rajesh Sharma',
  guardianPhone: '+91 98140 12345',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
};

export const DEMO_LANDLORD = {
  id: 'usr-landlord-demo',
  userId: 'usr-landlord-demo',
  name: 'Vikram Singh',
  email: 'landlord@uninest.demo',
  phone: '+91 98989 89801',
  businessName: 'Passi Residency Management Desk',
  address: 'Plot 42, Block B, BRS Nagar, Ferozepur Road, Ludhiana',
  responseRate: 98,
  avgResponseTime: '< 15 mins',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
};

export const DEMO_COLLEGE = {
  id: 'pcte-ludhiana',
  name: 'PCTE Institute',
  collegeName: 'PCTE Institute of Management',
  city: 'Ludhiana',
  state: 'Punjab',
  latitude: 30.8984,
  longitude: 75.8564,
  contactPerson: 'Dr. Gurpreet Singh (Dean Student Affairs)',
  housingCoordinator: 'Prof. Simranjit Kaur',
};

export const DEMO_PROPERTY_PRIMARY = {
  id: 'prop-demo-01',
  name: 'PCTE Smart Student Residency',
  type: 'PG',
  address: 'Plot 42, Block B, BRS Nagar, Ferozepur Road',
  locality: 'BRS Nagar',
  city: 'Ludhiana',
  state: 'Punjab',
  pincode: '141012',
  gender: 'MALE',
  latitude: 30.8995,
  longitude: 75.8570,
  minBaseRent: 6000,
  minDeposit: 12000,
  trueMonthlyCost: 8500,
  totalBeds: 12,
  availBeds: 4,
  rating: 4.9,
  reviewCount: 28,
  verificationStatus: 'VERIFIED',
  electricityRate: 9.5, // ₹9.50/unit
  images: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
  ],
};
