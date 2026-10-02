'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Home,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BedDouble,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { UniNestMessagesModal } from '@/components/booking/UniNestMessagesModal';

export interface TenantRecord {
  id: string;
  name: string;
  college: string;
  course: string;
  property: string;
  roomNumber: string;
  bedLabel: string;
  sharingType: 'Single' | 'Double Sharing' | 'Triple Sharing';
  rent: number; // in paise
  electricitySplitShare: number; // in rupees
  subMeterNo: string;
  phone: string;
  email: string;
  kycStatus: 'VERIFIED' | 'PENDING';
  rentStatus: 'PAID' | 'OVERDUE' | 'ESCROW_LOCKED';
  leaseStart: string;
  leaseEnd: string;
  bookingId: string;
}

export const UNIFIED_DEMO_TENANTS: TenantRecord[] = [
  {
    id: 't-rahul',
    name: 'Rahul Sharma',
    college: 'PCTE Institute of Technology',
    course: 'B.Tech CSE (2nd Year)',
    property: 'PCTE Smart Student Residency',
    roomNumber: 'Room 204',
    bedLabel: 'Bed A',
    sharingType: 'Double Sharing',
    rent: 600000,
    electricitySplitShare: 665,
    subMeterNo: 'Sub-Meter #204',
    phone: '+91 98765 43210',
    email: 'rahul@uninest.in',
    kycStatus: 'VERIFIED',
    rentStatus: 'PAID',
    leaseStart: '15 Aug 2026',
    leaseEnd: '15 Aug 2027',
    bookingId: 'bkg-pcte-2026-demo',
  },
  {
    id: 't-aman',
    name: 'Aman Verma',
    college: 'PCTE Institute of Technology',
    course: 'B.Tech CSE (2nd Year)',
    property: 'PCTE Smart Student Residency',
    roomNumber: 'Room 204',
    bedLabel: 'Bed B',
    sharingType: 'Double Sharing',
    rent: 600000,
    electricitySplitShare: 665,
    subMeterNo: 'Sub-Meter #204',
    phone: '+91 97890 12345',
    email: 'aman.verma@pcte.edu.in',
    kycStatus: 'VERIFIED',
    rentStatus: 'PAID',
    leaseStart: '01 Jul 2026',
    leaseEnd: '30 Jun 2027',
    bookingId: 'bkg-aman-room204',
  },
  {
    id: 't-rohit',
    name: 'Rohit Verma',
    college: 'PCTE Institute of Management',
    course: 'MBA (1st Year)',
    property: 'PCTE Smart Student Residency',
    roomNumber: 'Room 205',
    bedLabel: 'Bed A (Private)',
    sharingType: 'Single',
    rent: 900000,
    electricitySplitShare: 1378,
    subMeterNo: 'Sub-Meter #205',
    phone: '+91 98112 34567',
    email: 'rohit.verma@pcte.edu.in',
    kycStatus: 'VERIFIED',
    rentStatus: 'PAID',
    leaseStart: '01 Jan 2026',
    leaseEnd: '31 Dec 2027',
    bookingId: 'bkg-rohit-room205',
  },
  {
    id: 't-karan',
    name: 'Karanveer Gill',
    college: 'PCTE Institute of Technology',
    course: 'B.Pharm (3rd Year)',
    property: 'Passi Luxury PG & Co-Living',
    roomNumber: 'Room 105',
    bedLabel: 'Bed B',
    sharingType: 'Double Sharing',
    rent: 600000,
    electricitySplitShare: 1995,
    subMeterNo: 'Sub-Meter #105',
    phone: '+91 98555 44321',
    email: 'karan.gill@pcte.edu.in',
    kycStatus: 'VERIFIED',
    rentStatus: 'OVERDUE',
    leaseStart: '01 Nov 2026',
    leaseEnd: '01 Nov 2027',
    bookingId: 'bkg-karan-room105',
  },
  {
    id: 't-priya',
    name: 'Priya Sharma',
    college: 'PCTE College of Pharmacy',
    course: 'M.Pharm (1st Year)',
    property: 'Campus Edge Girls Hostel',
    roomNumber: 'Room 301',
    bedLabel: 'Bed A',
    sharingType: 'Double Sharing',
    rent: 650000,
    electricitySplitShare: 950,
    subMeterNo: 'Sub-Meter #301',
    phone: '+91 98443 21098',
    email: 'priya.sharma@pcte.edu.in',
    kycStatus: 'VERIFIED',
    rentStatus: 'OVERDUE',
    leaseStart: '01 Jun 2026',
    leaseEnd: '31 May 2027',
    bookingId: 'bkg-priya-room301',
  },
];

interface TenantDirectoryClientProps {
  initialTenants: TenantRecord[];
  isDemoUser: boolean;
  landlordName: string;
}

export function TenantDirectoryClient({
  initialTenants,
  isDemoUser,
  landlordName,
}: TenantDirectoryClientProps) {
  const [tenants] = useState<TenantRecord[]>(
    initialTenants.length > 0 ? initialTenants : isDemoUser ? UNIFIED_DEMO_TENANTS : []
  );
  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'ROOM_GROUPED'>('ROOM_GROUPED');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'OVERDUE'>('ALL');

  // In-app messaging state
  const [activeChatTenant, setActiveChatTenant] = useState<TenantRecord | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = (tenant: TenantRecord) => {
    setActiveChatTenant(tenant);
    setIsChatOpen(true);
  };

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.college.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PAID'
        ? t.rentStatus === 'PAID'
        : t.rentStatus === 'OVERDUE';

    return matchesSearch && matchesStatus;
  });

  // Group tenants by Property + Room
  const roomGroups = React.useMemo(() => {
    const groups: Record<
      string,
      {
        property: string;
        roomNumber: string;
        sharingType: string;
        subMeterNo: string;
        tenants: TenantRecord[];
        totalRentPaise: number;
        totalElectricityBill: number;
      }
    > = {};

    filteredTenants.forEach((t) => {
      const key = `${t.property}___${t.roomNumber}`;
      if (!groups[key]) {
        groups[key] = {
          property: t.property,
          roomNumber: t.roomNumber,
          sharingType: t.sharingType,
          subMeterNo: t.subMeterNo,
          tenants: [],
          totalRentPaise: 0,
          totalElectricityBill: 0,
        };
      }
      groups[key].tenants.push(t);
      groups[key].totalRentPaise += t.rent;
      groups[key].totalElectricityBill += t.electricitySplitShare;
    });

    return Object.values(groups);
  }, [filteredTenants]);

  const totalMonthlyRentPaise = tenants.reduce((sum, t) => sum + t.rent, 0);
  const totalOccupants = tenants.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Tenant Roster & Co-Living Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage individual student tenancies, shared room co-occupants, sub-meter splits, and secure in-app messaging.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('ROOM_GROUPED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                viewMode === 'ROOM_GROUPED'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-brand-600" /> Group by Room (Co-Living)
            </button>
            <button
              onClick={() => setViewMode('INDIVIDUAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                viewMode === 'INDIVIDUAL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" /> Individual List
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tenants</div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalOccupants} Students</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% KYC Verified</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly Rent</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatINR(totalMonthlyRentPaise)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across managed rooms</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rooms Occupied</div>
          <div className="text-xl font-black text-slate-900 mt-1">4 Rooms</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">5 Beds filled • 1 Bed open</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Messaging Medium</div>
          <div className="text-xl font-black text-purple-700 mt-1">In-App Chat</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Anti-leakage protected</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tenant, room, or PG..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
          {(['ALL', 'PAID', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW MODE 1: GROUP BY ROOM (CO-LIVING) */}
      {viewMode === 'ROOM_GROUPED' ? (
        <div className="space-y-4">
          {roomGroups.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl text-sm text-slate-500">
              No matching rooms or occupants found.
            </div>
          ) : (
            roomGroups.map((group, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Room Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-slate-900">
                          {group.roomNumber}
                        </h3>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {group.sharingType}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          {group.tenants.length} Occupant{group.tenants.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{group.property}</p>
                    </div>
                  </div>

                  {/* Room Totals & Sub-Meter */}
                  <div className="flex items-center gap-3 text-right">
                    <div className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-600" /> {group.subMeterNo}
                      </div>
                      <div className="text-xs font-black text-amber-900 mt-0.5">
                        ₹{group.totalElectricityBill} total utility
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-[10px] uppercase font-bold text-emerald-800">Total Room Rent</div>
                      <div className="text-xs font-black text-emerald-700 mt-0.5">
                        {formatINR(group.totalRentPaise)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Occupants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.tenants.map((t) => (
                    <div
                      key={t.id}
                      className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-900">{t.name}</span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {t.bedLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{t.college} • {t.course}</p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" /> {t.phone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {t.email}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <Badge variant={t.rentStatus === 'PAID' ? 'success' : 'danger'} size="sm">
                            {t.rentStatus === 'PAID' ? 'Rent Paid' : 'Rent Overdue'}
                          </Badge>
                          <div className="text-xs font-black text-slate-900 mt-1.5">
                            {formatINR(t.rent)}<span className="text-[10px] font-normal text-slate-400">/mo</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-[11px] text-amber-800 font-semibold">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>50% Sub-meter: ₹{t.electricitySplitShare}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">Lease to {t.leaseEnd}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenChat(t)}
                            className="text-xs py-1 px-2.5 bg-white border-slate-300 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 font-bold flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty Bed Indicator if Double Sharing has only 1 Occupant */}
                  {group.sharingType === 'Double Sharing' && group.tenants.length === 1 && (
                    <div className="border border-dashed border-slate-300 bg-slate-50/40 rounded-xl p-3.5 flex flex-col items-center justify-center text-center space-y-1">
                      <BedDouble className="w-6 h-6 text-slate-400" />
                      <div className="text-xs font-bold text-slate-700">Bed B is Available</div>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Listed in Roommate Search. When another student books, the ₹{group.totalElectricityBill} sub-meter will automatically split 50/50.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* VIEW MODE 2: INDIVIDUAL TENANT TABLE */
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tenant Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Institution & Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Room & Bed Allocation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sub-meter Share</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">KYC</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rent Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{t.name}</div>
                      <div className="text-[11px] text-slate-400">Lease: {t.leaseEnd}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">{t.college}</div>
                      <div className="text-slate-400">{t.course}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-slate-800">{t.property}</div>
                      <div className="text-brand-700 font-bold">{t.roomNumber} ({t.bedLabel})</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>{t.phone}</div>
                      <div className="text-slate-400 text-[11px]">{t.email}</div>
                    </td>
                    <td className="px-4 py-3 font-black text-emerald-700">
                      {formatINR(t.rent)}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-amber-800">
                      ₹{t.electricitySplitShare}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success" size="sm">
                        {t.kycStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={t.rentStatus === 'PAID' ? 'success' : 'danger'} size="sm">
                        {t.rentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenChat(t)}
                        className="text-xs py-1 px-2.5 font-bold hover:bg-brand-50 hover:text-brand-700 border-slate-300"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1 text-brand-600" /> Chat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* In-App Encrypted Chat Modal */}
      {activeChatTenant && (
        <UniNestMessagesModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          propertyName={activeChatTenant.property}
          landlordName={landlordName || 'Vikram Singh (Landlord)'}
          bookingId={activeChatTenant.bookingId}
        />
      )}
    </div>
  );
}
