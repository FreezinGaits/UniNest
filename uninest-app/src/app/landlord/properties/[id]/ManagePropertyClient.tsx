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
  updateRoom,
  deleteRoom,
  removeBedFromRoom,
  distributeRoomsByFloors,
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
  Layers,
  Trash2,
  Info,
  SlidersHorizontal,
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
  const [property, setProperty] = useState<PropertyItem | null>(() => {
    if (typeof window !== 'undefined') {
      const clientProps = getClientProperties();
      const matched = clientProps.find((p) => p.id === id);
      if (matched) return matched;
    }
    return initialProperty;
  });
  const [rooms, setRooms] = useState<RoomData[]>(() => {
    if (typeof window !== 'undefined') {
      const clientProps = getClientProperties();
      const matched = clientProps.find((p) => p.id === id) || initialProperty;
      if (matched) return getPropertyRooms(matched);
    }
    return [];
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state: Check-In
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
  const [studentRent, setStudentRent] = useState<number>(8000);

  // Modals state: Check-Out
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutBed, setCheckOutBed] = useState<{
    roomId: string;
    bedId: string;
    bedLabel: string;
    tenant: string;
  } | null>(null);

  // Modals state: Add Room
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1');
  const [newRoomSharing, setNewRoomSharing] = useState('3');
  const [newRoomRent, setNewRoomRent] = useState(8000);

  // Modals state: Edit Room
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editRoomFloor, setEditRoomFloor] = useState('1');
  const [editRoomSharing, setEditRoomSharing] = useState('3');
  const [editRoomRent, setEditRoomRent] = useState(8000);
  const [editRoomAC, setEditRoomAC] = useState(true);
  const [editRoomBath, setEditRoomBath] = useState(true);

  // Modals state: Floor Distribution
  const [isFloorDistributeOpen, setIsFloorDistributeOpen] = useState(false);
  const [distributeFloorsCount, setDistributeFloorsCount] = useState('2');

  // Modals state: Delete Room Confirm
  const [isDeleteRoomConfirmOpen, setIsDeleteRoomConfirmOpen] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState<RoomData | null>(null);

  // Modals state: Edit Property
  const [isEditPropOpen, setIsEditPropOpen] = useState(false);
  const [editPropName, setEditPropName] = useState('');
  const [editPropCity, setEditPropCity] = useState('');
  const [editPropAddress, setEditPropAddress] = useState('');
  const [editPropRent, setEditPropRent] = useState(8000);
  const [editPropDescription, setEditPropDescription] = useState('');

  // Hydrate property and rooms
  useEffect(() => {
    let resolvedProp = property;
    if (typeof window !== 'undefined') {
      const clientProps = getClientProperties();
      const matched = clientProps.find((p) => p.id === id);
      if (matched) {
        resolvedProp = matched;
        setProperty(matched);
      } else {
        fetch('/api/properties')
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            const serverProp = data?.properties?.find((p: any) => p.id === id);
            if (serverProp) {
              setProperty(serverProp);
              saveClientProperty(serverProp);
              setRooms(getPropertyRooms(serverProp));
            }
          })
          .catch(() => {});
      }
    }

    if (resolvedProp) {
      setEditPropName(resolvedProp.name);
      setEditPropCity(resolvedProp.city);
      setEditPropAddress(resolvedProp.address);
      setEditPropRent(Number(resolvedProp.rentPerMonth || 8000));
      setEditPropDescription(resolvedProp.description || '');
      setStudentRent(Number(resolvedProp.rentPerMonth || 8000));
      setNewRoomRent(Number(resolvedProp.rentPerMonth || 8000));

      const loadedRooms = getPropertyRooms(resolvedProp);
      setRooms(loadedRooms);
    }
  }, [id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Property Loading...</h2>
        <p className="text-sm text-slate-500 mt-1">Retrieving room & bed allocations from property store.</p>
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
  const rentRupees = Number(property.rentPerMonth || 8000);
  const currentMonthlyRevenue = occupiedBeds * rentRupees;
  const potentialMonthlyRevenue = totalBeds * rentRupees;

  // Handler: Open Check-In Modal
  const handleOpenCheckIn = (roomId?: string, bedId?: string, bedLabel?: string) => {
    if (roomId && bedId && bedLabel) {
      setCheckInBed({ roomId, bedId, bedLabel, rent: rentRupees });
    } else {
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

  // Handler: Open Edit Room
  const handleOpenEditRoom = (room: RoomData) => {
    setEditingRoom(room);
    setEditRoomNumber(room.roomNumber);
    setEditRoomFloor(String(room.floor || Math.floor(parseInt(room.roomNumber, 10) / 100) || 1));
    setEditRoomSharing(String(room.beds.length || room.sharing || 3));
    setEditRoomRent(room.rentRupees || rentRupees);
    setEditRoomAC(Boolean(room.hasAC));
    setEditRoomBath(Boolean(room.hasAttBath));
    setIsEditRoomOpen(true);
  };

  // Handler: Save Edit Room
  const handleSaveEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editRoomNumber.trim()) return;

    const updatedRooms = updateRoom(property.id, editingRoom.id, {
      roomNumber: editRoomNumber.trim(),
      floor: Number(editRoomFloor),
      sharing: Number(editRoomSharing),
      rentRupees: Number(editRoomRent),
      hasAC: editRoomAC,
      hasAttBath: editRoomBath,
    });

    setRooms(updatedRooms);
    setIsEditRoomOpen(false);
    showToast(`Room ${editRoomNumber.trim()} updated with ${editRoomSharing} beds!`);
  };

  // Handler: Open Delete Room
  const handleOpenDeleteRoom = (room: RoomData) => {
    setDeletingRoom(room);
    setIsDeleteRoomConfirmOpen(true);
  };

  // Handler: Confirm Delete Room
  const handleConfirmDeleteRoom = () => {
    if (!deletingRoom) return;
    const updatedRooms = deleteRoom(property.id, deletingRoom.id);
    setRooms(updatedRooms);
    setIsDeleteRoomConfirmOpen(false);
    showToast(`Room ${deletingRoom.roomNumber} deleted successfully.`);
  };

  // Handler: Remove Bed from Room
  const handleRemoveBed = (roomId: string, bedId: string, bedLabel: string) => {
    const updatedRooms = removeBedFromRoom(property.id, roomId, bedId);
    setRooms(updatedRooms);
    showToast(`Removed ${bedLabel} from room.`);
  };

  // Handler: Quick Add Bed to existing room
  const handleAddBedToRoom = (roomId: string, roomNumber: string) => {
    const updatedRooms = addBedToRoom(property.id, roomId);
    setRooms(updatedRooms);
    showToast(`Added a new bed to Room ${roomNumber}!`);
  };

  // Handler: Distribute by Floors
  const handleApplyFloorDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const floors = Number(distributeFloorsCount || 2);
    const updatedRooms = distributeRoomsByFloors(property.id, floors);
    setRooms(updatedRooms);
    setIsFloorDistributeOpen(false);
    showToast(`Rooms successfully organized across ${floors} floors!`);
  };

  // Handler: Add Room
  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;

    const updatedRooms = addRoomToProperty(property.id, {
      roomNumber: newRoomNumber.trim(),
      floor: Number(newRoomFloor),
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
            onClick={() => setIsFloorDistributeOpen(true)}
            className="text-xs font-bold border-slate-300 text-slate-700"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
            Organize Floors
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
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
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

      {/* Helpful Floor & Room Numbering Guide Callout */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200 rounded-2xl p-4 flex items-start gap-3.5 text-xs shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-extrabold text-blue-950 text-sm">
              💡 How Floor & Room Numbering Works in UniNest
            </h4>
            <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-2 py-0.5 rounded-full">
              Standard Hospitality Format
            </span>
          </div>
          <p className="text-blue-900 leading-relaxed">
            Rooms in student housing are standardly numbered by <strong>Floor + Room</strong> so students, parents, and cleaners instantly know which floor a room is located on:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-semibold text-[11px]">
            <span className="bg-white/90 border border-blue-200 px-2.5 py-1 rounded-xl text-blue-900 shadow-2xs">
              <strong>100 Series (101, 102, 103...)</strong> = Floor 1 (Ground)
            </span>
            <span className="bg-white/90 border border-blue-200 px-2.5 py-1 rounded-xl text-blue-900 shadow-2xs">
              <strong>200 Series (201, 202, 203...)</strong> = Floor 2 (First Floor)
            </span>
            <span className="bg-white/90 border border-blue-200 px-2.5 py-1 rounded-xl text-blue-900 shadow-2xs">
              <strong>300 Series (301, 302, 303...)</strong> = Floor 3
            </span>
          </div>
          <p className="text-blue-800 text-[11px] pt-1">
            <strong>Full Flexibility:</strong> You don&apos;t have to delete your property to fix rooms! Click <strong>&quot;Edit Room&quot;</strong> on any room to rename it (e.g., change 105 to 201), change its bed capacity (e.g., 2-sharing or 3-sharing), or click <strong>&quot;Organize Floors&quot;</strong> to auto-distribute all rooms across 2, 3, or 4 floors.
          </p>
        </div>
      </div>

      {/* Room & Bed Interactive Matrix */}
      <Card className="p-6 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Interactive Room & Bed Matrix ({rooms.length} Rooms • {totalBeds} Beds)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit individual room numbers, change bed sharing tiers, register walk-in tenants, or organize floors
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFloorDistributeOpen(true)}
              className="text-xs font-bold text-slate-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-brand-600" /> Auto-Distribute Floors
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNewRoomFloor('1');
                setNewRoomNumber(`10${rooms.length + 1}`);
                setIsAddRoomOpen(true);
              }}
              className="text-xs font-bold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Room
            </Button>
            <Link href={`/landlord/beds?property=${encodeURIComponent(property.name)}`}>
              <Button size="sm" variant="outline" className="text-xs font-bold text-slate-700">
                View in Bed Table →
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
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      Floor {room.floor || Math.floor(parseInt(room.roomNumber, 10) / 100) || 1}
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
                      onClick={() => handleOpenEditRoom(room)}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-amber-600" /> Edit Room
                    </button>
                    <button
                      onClick={() => handleAddBedToRoom(room.id, room.roomNumber)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Bed
                    </button>
                    <button
                      onClick={() => handleOpenDeleteRoom(room)}
                      title="Delete this room"
                      className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                          <div className="flex items-center gap-1">
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
                            {!isOccupied && room.beds.length > 1 && (
                              <button
                                onClick={() => handleRemoveBed(room.id, b.id, b.bedLabel)}
                                title="Remove this bed"
                                className="text-slate-300 hover:text-rose-500 p-0.5 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
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

      {/* ================= MODAL: EDIT ROOM ================= */}
      <Modal
        isOpen={isEditRoomOpen}
        onClose={() => setIsEditRoomOpen(false)}
        title={`Edit Room ${editingRoom?.roomNumber || ''}`}
        description="Change room number, floor assignment, bed capacity, and amenities"
        size="md"
      >
        <form onSubmit={handleSaveEditRoom} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Room Number *"
                placeholder="e.g. 101, 201"
                value={editRoomNumber}
                onChange={(e) => setEditRoomNumber(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Tip: 100 series for Floor 1, 200 for Floor 2
              </p>
            </div>
            <Select
              label="Floor Assignment"
              value={editRoomFloor}
              onChange={(e) => {
                const nextFloor = e.target.value;
                setEditRoomFloor(nextFloor);
                // Auto-suggest matching room number if keeping standard format
                const num = parseInt(editRoomNumber, 10);
                if (!isNaN(num)) {
                  const roomIdx = num % 100;
                  setEditRoomNumber(`${parseInt(nextFloor, 10) * 100 + roomIdx}`);
                }
              }}
              options={[
                { value: '1', label: 'Floor 1 (Ground Floor)' },
                { value: '2', label: 'Floor 2 (First Floor)' },
                { value: '3', label: 'Floor 3 (Second Floor)' },
                { value: '4', label: 'Floor 4 (Third Floor)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Beds in this Room (Sharing)"
              value={editRoomSharing}
              onChange={(e) => setEditRoomSharing(e.target.value)}
              options={[
                { value: '1', label: '1 Bed (Single Occupancy)' },
                { value: '2', label: '2 Beds (Double Sharing)' },
                { value: '3', label: '3 Beds (Triple Sharing)' },
                { value: '4', label: '4 Beds (Dormitory)' },
              ]}
            />
            <Input
              label="Rent per Bed (₹) *"
              type="number"
              value={editRoomRent}
              onChange={(e) => setEditRoomRent(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editRoomAC}
                onChange={(e) => setEditRoomAC(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Air Conditioned (AC)
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={editRoomBath}
                onChange={(e) => setEditRoomBath(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              Attached Bathroom
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditRoomOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              Save Room Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: AUTO-DISTRIBUTE BY FLOORS ================= */}
      <Modal
        isOpen={isFloorDistributeOpen}
        onClose={() => setIsFloorDistributeOpen(false)}
        title="Organize Rooms Across Building Floors"
        description="Automatically re-number rooms by floor (e.g. Floor 1: 101–104, Floor 2: 201–204)"
        size="md"
      >
        <form onSubmit={handleApplyFloorDistribution} className="space-y-4">
          <Select
            label="How many floors does this building have?"
            value={distributeFloorsCount}
            onChange={(e) => setDistributeFloorsCount(e.target.value)}
            options={[
              { value: '1', label: '1 Floor (Ground Only — Rooms 101 to 108)' },
              { value: '2', label: '2 Floors (Ground + 1 — Rooms 101–104 & 201–204)' },
              { value: '3', label: '3 Floors (Rooms 101+, 201+, 301+)' },
              { value: '4', label: '4 Floors (Rooms 101+, 201+, 301+, 401+)' },
            ]}
          />

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 leading-relaxed">
            <p className="font-bold text-slate-900">Preview of Room Distribution:</p>
            {distributeFloorsCount === '2' && (
              <p>
                • <strong>Floor 1:</strong> Rooms 101, 102, 103, 104<br />
                • <strong>Floor 2:</strong> Rooms 201, 202, 203, 204
              </p>
            )}
            {distributeFloorsCount === '3' && (
              <p>
                • <strong>Floor 1:</strong> Rooms 101, 102, 103<br />
                • <strong>Floor 2:</strong> Rooms 201, 202, 203<br />
                • <strong>Floor 3:</strong> Rooms 301, 302
              </p>
            )}
            {distributeFloorsCount === '4' && (
              <p>
                • <strong>Floor 1:</strong> Rooms 101, 102<br />
                • <strong>Floor 2:</strong> Rooms 201, 202<br />
                • <strong>Floor 3:</strong> Rooms 301, 302<br />
                • <strong>Floor 4:</strong> Rooms 401, 402
              </p>
            )}
            {distributeFloorsCount === '1' && (
              <p>• <strong>Floor 1:</strong> All {rooms.length} rooms (101 to {100 + rooms.length})</p>
            )}
            <p className="text-[11px] text-slate-500 pt-1">
              Existing occupant assignments and bed statuses are completely preserved.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFloorDistributeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-brand-600 hover:bg-brand-700 text-white font-bold">
              Apply Floor Numbering
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: DELETE ROOM CONFIRM ================= */}
      <Modal
        isOpen={isDeleteRoomConfirmOpen}
        onClose={() => setIsDeleteRoomConfirmOpen(false)}
        title={`Delete Room ${deletingRoom?.roomNumber}`}
        description="Remove this room and its beds from your property"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700">
            Are you sure you want to remove <strong>Room {deletingRoom?.roomNumber}</strong>?
            This will reduce your total property capacity by {deletingRoom?.beds.length || 0} beds.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteRoomConfirmOpen(false)}>
              Keep Room
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmDeleteRoom}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Delete Room
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Room Number *"
                placeholder="e.g. 109, 201, 301"
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                required
                autoFocus
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Floor 1: 100s, Floor 2: 200s, Floor 3: 300s
              </p>
            </div>
            <Select
              label="Floor Assignment"
              value={newRoomFloor}
              onChange={(e) => {
                const floor = e.target.value;
                setNewRoomFloor(floor);
                if (!newRoomNumber || newRoomNumber.startsWith('10') || newRoomNumber.startsWith('20')) {
                  const existingOnFloor = rooms.filter((r) => r.floor === Number(floor)).length;
                  setNewRoomNumber(`${Number(floor) * 100 + existingOnFloor + 1}`);
                }
              }}
              options={[
                { value: '1', label: 'Floor 1 (Ground Floor)' },
                { value: '2', label: 'Floor 2 (First Floor)' },
                { value: '3', label: 'Floor 3 (Second Floor)' },
                { value: '4', label: 'Floor 4 (Third Floor)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

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
    </div>
  );
}
