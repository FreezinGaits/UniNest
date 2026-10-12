'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyItem } from '@/lib/propertiesTypes';
import { getClientProperties, saveClientProperty } from '@/lib/clientProperties';
import {
  RoomData,
  BedData,
  getPropertyRooms,
  checkInTenant,
  checkOutTenant,
  toggleBedStatus,
  addRoomToProperty,
  addBedToRoom,
} from '@/lib/roomBedStore';
import { AdminMessage } from '@/lib/adminMessagesStore';
import { PropertyNotesThread } from './PropertyNotesThread';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { formatRupees } from '@/lib/utils';
import {
  MapPin,
  ArrowLeft,
  Plus,
  XCircle,
  CheckCircle2,
  Users,
  BedDouble,
  Phone,
  UserCheck,
  LogOut,
  Wrench,
  Edit3,
  Building,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ManagePropertyClientProps {
  id: string;
  initialProperty: PropertyItem | null;
  adminNotes: AdminMessage[];
}

export function ManagePropertyClient({
  id,
  initialProperty,
  adminNotes,
}: ManagePropertyClientProps) {
  // Reconcile property from client storage on mount
  const [property, setProperty] = useState<PropertyItem | null>(initialProperty);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInBed, setCheckInBed] = useState<{
    roomId: string;
    bedId: string;
    bedLabel: string;
    rent: number;
  } | null>(null);
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentCollege, setStudentCollege] = useState('PCTE Group of Institutes');
  const [studentRent, setStudentRent] = useState<number>(6000);

  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutBed, setCheckOutBed] = useState<{
    roomId: string;
    bedId: string;
    bedLabel: string;
    tenant: string;
  } | null>(null);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomSharing, setNewRoomSharing] = useState('2');
  const [newRoomRent, setNewRoomRent] = useState(6000);

  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [editPropName, setEditPropName] = useState('');
  const [editPropCity, setEditPropCity] = useState('');
  const [editPropAddress, setEditPropAddress] = useState('');
  const [editPropRent, setEditPropRent] = useState(6000);
  const [editPropDescription, setEditPropDescription] = useState('');

  // Hydrate property and rooms
  useEffect(() => {
    let resolvedProp = initialProperty;
    if (typeof window !== 'undefined') {
      const clientProps = getClientProperties();
      const matched = clientProps.find((p) => p.id === id);
      if (matched) {
        resolvedProp = matched;
        setProperty(matched);
      }
    }

    if (resolvedProp) {
      setEditPropName(resolvedProp.name);
      setEditPropCity(resolvedProp.city);
      setEditPropAddress(resolvedProp.address);
      setEditPropRent(Number(resolvedProp.rentPerMonth || 6000));
      setEditPropDescription(resolvedProp.description || '');
      setStudentRent(Number(resolvedProp.rentPerMonth || 6000));
      setNewRoomRent(Number(resolvedProp.rentPerMonth || 6000));

      const loadedRooms = getPropertyRooms(resolvedProp);
      setRooms(loadedRooms);
    }
  }, [id, initialProperty]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">This property listing does not exist or was deleted.</p>
        <Link href="/landlord/properties" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  // Calculate live dynamic metrics from actual room & bed matrix
  const totalBeds = rooms.reduce((acc, r) => acc + r.beds.length, 0);
  const occupiedBeds = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length,
    0
  );
  const availableBeds = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => b.status === 'AVAILABLE').length,
    0
  );
  const maintenanceBeds = rooms.reduce(
    (acc, r) => acc + r.beds.filter((b) => b.status === 'MAINTENANCE').length,
    0
  );
  const rentRupees = Number(property.rentPerMonth || 6000);
  const currentMonthlyRevenue = occupiedBeds * rentRupees;
  const potentialMonthlyRevenue = totalBeds * rentRupees;

  // Handler: Open Check-In Modal
  const handleOpenCheckIn = (roomId?: string, bedId?: string, bedLabel?: string) => {
    if (roomId && bedId && bedLabel) {
      setCheckInBed({ roomId, bedId, bedLabel, rent: rentRupees });
    } else {
      // Pick first available bed
      for (const r of rooms) {
        const avail = r.beds.find((b) => b.status === 'AVAILABLE');
        if (avail) {
          setCheckInBed({ roomId: r.id, bedId: avail.id, bedLabel: avail.bedLabel, rent: r.rentRupees });
          break;
        }
      }
    }
    setStudentName('');
    setStudentPhone('');
    setIsCheckInOpen(true);
  };

  // Handler: Confirm Check-In
  const handleConfirmCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInBed || !studentName.trim()) return;

    const updatedRooms = checkInTenant(property.id, checkInBed.roomId, checkInBed.bedId, {
      name: studentName.trim(),
      phone: studentPhone.trim() || '+91 98765-XXXXX',
      rent: studentRent,
    });

    setRooms(updatedRooms);
    setIsCheckInOpen(false);
    showToast(`Checked in ${studentName.trim()} to ${checkInBed.bedLabel}!`);
  };

  // Handler: Open Check-Out Modal
  const handleOpenCheckOut = (roomId: string, bedId: string, bedLabel: string, tenant: string) => {
    setCheckOutBed({ roomId, bedId, bedLabel, tenant });
    setIsCheckOutOpen(true);
  };

  // Handler: Confirm Check-Out
  const handleConfirmCheckOut = () => {
    if (!checkOutBed) return;
    const updatedRooms = checkOutTenant(property.id, checkOutBed.roomId, checkOutBed.bedId);
    setRooms(updatedRooms);
    setIsCheckOutOpen(false);
    showToast(`Checked out ${checkOutBed.tenant}. ${checkOutBed.bedLabel} is now vacant!`);
  };

  // Handler: Toggle Maintenance
  const handleToggleMaintenance = (roomId: string, bedId: string, currentStatus: BedData['status']) => {
    const nextStatus = currentStatus === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
    const updatedRooms = toggleBedStatus(property.id, roomId, bedId, nextStatus);
    setRooms(updatedRooms);
    showToast(`Bed status updated to ${nextStatus}.`);
  };

  // Handler: Add Room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    const updatedRooms = addRoomToProperty(property.id, {
      roomNumber: newRoomNumber.trim(),
      sharing: Number(newRoomSharing),
      rentRupees: Number(newRoomRent),
      hasAC: true,
      hasAttBath: true,
    });

    setRooms(updatedRooms);
    setIsAddRoomOpen(false);
    setNewRoomNumber('');
    showToast(`Room ${newRoomNumber.trim()} added with ${newRoomSharing} beds!`);
  };

  // Handler: Quick Add Bed to existing room
  const handleAddBedToRoom = (roomId: string, roomNumber: string) => {
    const updatedRooms = addBedToRoom(property.id, roomId);
    setRooms(updatedRooms);
    showToast(`Added a new bed to Room ${roomNumber}!`);
  };

  // Handler: Save Property Edits
  const handleSavePropertyEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPropName.trim()) return;

    const updatedProp: PropertyItem = {
      ...property,
      name: editPropName.trim(),
      city: editPropCity.trim() || property.city,
      address: editPropAddress.trim() || property.address,
      rentPerMonth: Number(editPropRent),
      description: editPropDescription.trim(),
    };

    saveClientProperty(updatedProp);
    setProperty(updatedProp);
    setIsEditPropOpen(false);
    showToast(`Property "${updatedProp.name}" updated successfully!`);
  };

  const images = property.images && property.images.length > 0 ? property.images : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-slide-down border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Navigation */}
      <div>
        <Link
          href="/landlord/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Properties Portfolio
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {property.name}
            </h1>
            <Badge
              variant={
                property.verificationStatus === 'VERIFIED'
                  ? 'success'
                  : property.verificationStatus === 'REJECTED' || property.verificationStatus === 'SUSPENDED'
                  ? 'danger'
                  : 'warning'
              }
              className="text-xs px-2.5 py-0.5 font-bold"
            >
              {property.verificationStatus === 'VERIFIED'
                ? '✓ VERIFIED BY UNINEST'
                : property.verificationStatus === 'REJECTED'
                ? '❌ SUSPENDED / REJECTED'
                : '⏳ PENDING ADMIN VERIFICATION'}
            </Badge>
          </div>

          <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              {property.address ? `${property.address}, ` : ''}
              <strong className="text-slate-700">{property.city}</strong>, Punjab
            </span>
          </p>

          <p className="text-xs text-slate-600 max-w-2xl line-clamp-2">
            {property.description || 'Modern student accommodation with furnished rooms, Wi-Fi, and security.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Button
            size="sm"
            onClick={() => handleOpenCheckIn()}
            disabled={availableBeds === 0}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            Check-In Student
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddRoomOpen(true)}
            className="text-xs font-bold border-slate-300"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Room
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditPropOpen(true)}
            className="text-xs font-bold border-slate-300 text-slate-700"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Edit Info
          </Button>
        </div>
      </div>

      {/* Property Images Showcase (Uploaded by Landlord) */}
      {images.length > 0 && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
            <ImageIcon className="w-4 h-4 text-brand-600" />
            <span>Uploaded Property Photos ({images.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-200"
              >
                <img
                  src={imgUrl}
                  alt={`${property.name} photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rejection Alert Box */}
      {(property.verificationStatus === 'REJECTED' || property.verificationStatus === 'SUSPENDED') && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-xs space-y-1.5 shadow-xs animate-slide-down">
          <div className="flex items-center gap-2 font-extrabold text-rose-800 text-sm">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            Property Listing Suspended / Rejected by UniNest Admin
          </div>
          <p className="text-slate-800 text-xs">
            <strong className="text-rose-900 font-bold">Reason Provided:</strong>{' '}
            {property.rejectionReason || 'Building compliance or safety verification standards not met.'}
          </p>
          <p className="text-slate-600 text-[11px]">
            Please review the compliance audit notes below, address the requirements, and reply to request a re-inspection.
          </p>
        </div>
      )}

      {/* Real-time Dynamic Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="text-center p-4 bg-white border-slate-200">
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalBeds}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase mt-1">
            Total Capacity ({rooms.length} Rooms)
          </p>
        </Card>

        <Card className="text-center p-4 bg-blue-50/70 border-blue-200">
          <p className="text-2xl sm:text-3xl font-black text-blue-700">{occupiedBeds}</p>
          <p className="text-[11px] font-bold text-blue-800 uppercase mt-1">
            Occupied Beds
          </p>
        </Card>

        <Card className="text-center p-4 bg-emerald-50/70 border-emerald-200">
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{availableBeds}</p>
          <p className="text-[11px] font-bold text-emerald-800 uppercase mt-1">
            Vacant / Bookable
          </p>
        </Card>

        <Card className="text-center p-4 bg-purple-50/70 border-purple-200">
          <p className="text-2xl sm:text-3xl font-black text-purple-700">{formatRupees(currentMonthlyRevenue)}</p>
          <p className="text-[11px] font-bold text-purple-800 uppercase mt-1">
            Live Monthly Revenue
          </p>
          <p className="text-[9px] text-purple-600 mt-0.5">Potential: {formatRupees(potentialMonthlyRevenue)}</p>
        </Card>
      </div>

      {/* Room & Bed Interactive Matrix */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Interactive Room & Bed Matrix ({rooms.length} Rooms • {totalBeds} Beds)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any bed to register walk-in tenants, check out students, or mark maintenance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddRoomOpen(true)}
              className="text-xs font-bold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Room
            </Button>
            <Link href={`/landlord/beds`}>
              <Button size="sm" variant="outline" className="text-xs font-bold text-slate-700">
                View in Bed Table
              </Button>
            </Link>
          </div>
        </div>

        {rooms.length > 0 ? (
          <div className="space-y-4 mt-5">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                {/* Room Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      Room {room.roomNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {room.beds.length}-Sharing • {formatRupees(room.rentRupees)}/mo per bed
                    </span>
                    {room.hasAC && (
                      <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        AC
                      </span>
                    )}
                    {room.hasAttBath && (
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Attached Bath
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddBedToRoom(room.id, room.roomNumber)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Add Bed to Room
                    </button>
                  </div>
                </div>

                {/* Beds Pills Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  {room.beds.map((b) => {
                    const isOccupied = b.status === 'OCCUPIED' || b.status === 'RESERVED';
                    const isMaint = b.status === 'MAINTENANCE';

                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2.5 ${
                          isOccupied
                            ? 'bg-blue-50/80 border-blue-200'
                            : isMaint
                            ? 'bg-amber-50/80 border-amber-200'
                            : 'bg-white border-emerald-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                            <BedDouble className="w-4 h-4 text-slate-500" />
                            <span>{b.bedLabel}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isOccupied
                                ? 'bg-blue-200 text-blue-900'
                                : isMaint
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        {/* Occupant Info */}
                        <div className="space-y-0.5">
                          {isOccupied ? (
                            <>
                              <p className="font-bold text-slate-900 text-xs truncate">
                                👤 {b.tenant}
                              </p>
                              {b.tenantPhone && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {b.tenantPhone}
                                </p>
                              )}
                              <p className="text-[10px] text-slate-400">
                                Rent: {formatRupees(b.rent || room.rentRupees)}/mo
                              </p>
                            </>
                          ) : isMaint ? (
                            <p className="text-amber-800 font-medium text-[11px]">
                              ⚠️ Bed under maintenance / repair
                            </p>
                          ) : (
                            <p className="text-emerald-700 font-medium text-[11px]">
                              ✓ Vacant — Ready for Student
                            </p>
                          )}
                        </div>

                        {/* Interactive Landlord Actions for this Bed */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
                          {isOccupied ? (
                            <button
                              onClick={() =>
                                handleOpenCheckOut(room.id, b.id, b.bedLabel, b.tenant || 'Tenant')
                              }
                              className="w-full py-1 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <LogOut className="w-3 h-3" /> Check-Out
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenCheckIn(room.id, b.id, b.bedLabel)}
                                className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <UserCheck className="w-3 h-3" /> Check-In
                              </button>
                              <button
                                onClick={() => handleToggleMaintenance(room.id, b.id, b.status)}
                                title={isMaint ? 'Mark Available' : 'Set Maintenance'}
                                className="p-1 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 space-y-2">
            <BedDouble className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">No rooms configured yet</p>
            <p className="text-xs">Click &quot;Add Room&quot; above to set up rooms and bed capacity.</p>
          </div>
        )}
      </Card>

      {/* Admin Notes & Communication Thread */}
      <PropertyNotesThread
        propertyId={property.id}
        propertyName={property.name}
        initialMessages={adminNotes}
      />

      {/* ================= MODAL: CHECK-IN STUDENT ================= */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title={`Check-In Walk-In Tenant (${checkInBed?.bedLabel || 'Bed'})`}
        description="Register an offline/walk-in student occupant for this bed"
        size="md"
      >
        <form onSubmit={handleConfirmCheckIn} className="space-y-4">
          <Input
            label="Student Full Name *"
            placeholder="e.g. Gurpreet Singh"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Phone Number *"
            placeholder="e.g. +91 98765-43210"
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            required
          />

          <Input
            label="College / Institute"
            placeholder="e.g. PCTE, PAU, GNDEC"
            value={studentCollege}
            onChange={(e) => setStudentCollege(e.target.value)}
          />

          <Input
            label="Agreed Monthly Rent (₹) *"
            type="number"
            value={studentRent}
            onChange={(e) => setStudentRent(Number(e.target.value))}
            required
          />

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Operational Notice:</p>
            <p>
              Assigning this student marks {checkInBed?.bedLabel} as <strong>OCCUPIED</strong> in both
              your portfolio metrics and the public bed booking matrix.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Confirm Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: CHECK-OUT STUDENT ================= */}
      <Modal
        isOpen={isCheckOutOpen}
        onClose={() => setIsCheckOutOpen(false)}
        title={`Check-Out Tenant from ${checkOutBed?.bedLabel}`}
        description="Release this bed back to vacant inventory"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 space-y-1">
            <p className="font-bold">Are you sure you want to check out this student?</p>
            <p>
              Occupant: <strong>{checkOutBed?.tenant}</strong>
            </p>
            <p className="text-amber-800 text-[11px]">
              This bed will immediately be marked as <strong>AVAILABLE</strong> and open for student bookings.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckOutOpen(false)}>
              Keep Occupied
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmCheckOut}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Release & Vacate Bed
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: ADD ROOM ================= */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Add Room to Property"
        description="Expand capacity by adding a new room with beds"
        size="md"
      >
        <form onSubmit={handleAddRoom} className="space-y-4">
          <Input
            label="Room Number *"
            placeholder="e.g. 109, 201"
            value={newRoomNumber}
            onChange={(e) => setNewRoomNumber(e.target.value)}
            required
            autoFocus
          />

          <Select
            label="Bed Sharing Tier"
            value={newRoomSharing}
            onChange={(e) => setNewRoomSharing(e.target.value)}
            options={[
              { value: '1', label: 'Single Occupancy (1 Bed)' },
              { value: '2', label: 'Double Sharing (2 Beds)' },
              { value: '3', label: 'Triple Sharing (3 Beds)' },
              { value: '4', label: '4-Bed Dormitory (4 Beds)' },
            ]}
          />

          <Input
            label="Monthly Rent per Bed (₹) *"
            type="number"
            value={newRoomRent}
            onChange={(e) => setNewRoomRent(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRoomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              Create Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EDIT PROPERTY ================= */}
      <Modal
        isOpen={isEditPropOpen}
        onClose={() => setIsEditPropOpen(false)}
        title="Edit Property Information"
        description="Update listing name, location address, and base rent"
        size="md"
      >
        <form onSubmit={handleSavePropertyEdits} className="space-y-4">
          <Input
            label="Property Title *"
            value={editPropName}
            onChange={(e) => setEditPropName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={editPropCity}
              onChange={(e) => setEditPropCity(e.target.value)}
              required
            />
            <Input
              label="Base Rent / mo (₹)"
              type="number"
              value={editPropRent}
              onChange={(e) => setEditPropRent(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Full Address"
            value={editPropAddress}
            onChange={(e) => setEditPropAddress(e.target.value)}
          />

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              rows={3}
              value={editPropDescription}
              onChange={(e) => setEditPropDescription(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditPropOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
