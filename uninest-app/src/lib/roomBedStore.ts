'use client';

import { PropertyItem } from './propertiesTypes';
import { getClientProperties, saveClientProperty } from './clientProperties';

export interface BedData {
  id: string;
  label: string; // e.g. "A", "B", "C"
  bedLabel: string; // e.g. "Bed 101-A"
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  tenant?: string;
  tenantPhone?: string;
  rent?: number;
  checkInDate?: string;
}

export interface RoomData {
  id: string;
  roomNumber: string;
  sharing: number;
  rentRupees: number;
  hasAC?: boolean;
  hasAttBath?: boolean;
  beds: BedData[];
}

const STORAGE_KEY_PREFIX = 'uninest_property_rooms_v2_';

function getStorageKey(propertyId: string): string {
  return `${STORAGE_KEY_PREFIX}${propertyId}`;
}

export function getPropertyRooms(prop: PropertyItem): RoomData[] {
  if (typeof window === 'undefined') return [];

  const key = getStorageKey(prop.id);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to generate
  }

  // Generate initial rooms for this property
  const totalRooms = Math.max(1, Number(prop.totalRooms || 4));
  const totalBedsTarget = Math.max(1, Number(prop.totalBeds || totalRooms * 2));
  const bedsPerRoom = Math.max(1, Math.round(totalBedsTarget / totalRooms));
  const rentRupees = Number(prop.rentPerMonth || 6000);

  // For demo properties, use preset occupancy; for custom properties (newly added by landlord), 0 occupied!
  const isDemo = prop.id === 'prop-pcte-1' || prop.id === 'prop-pcte-2' || prop.id === 'prop-demo-03';
  const occupiedTarget = isDemo ? Number(prop.occupiedBeds || 0) : 0;

  const sampleTenants = [
    { name: 'Rahul Sharma', phone: '+91 98765-43210' },
    { name: 'Aman Verma', phone: '+91 98765-43211' },
    { name: 'Priya Sharma', phone: '+91 98765-43212' },
    { name: 'Karanveer Gill', phone: '+91 98765-43213' },
    { name: 'Simran Kaur', phone: '+91 98765-43214' },
    { name: 'Arjun Mehta', phone: '+91 98765-43215' },
    { name: 'Neha Gupta', phone: '+91 98765-43216' },
    { name: 'Rohan Joshi', phone: '+91 98765-43217' },
  ];

  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rooms: RoomData[] = [];
  let occupiedAssigned = 0;
  let tenantIdx = 0;

  for (let r = 1; r <= totalRooms; r++) {
    const roomNumber = prop.id === 'prop-pcte-1' ? `${200 + r}` : `${100 + r}`;
    const beds: BedData[] = [];

    for (let b = 0; b < bedsPerRoom; b++) {
      const labelChar = labels[b] || `${b + 1}`;
      let status: BedData['status'] = 'AVAILABLE';
      let tenant = '—';
      let tenantPhone = '';

      if (occupiedAssigned < occupiedTarget) {
        status = 'OCCUPIED';
        const st = sampleTenants[tenantIdx % sampleTenants.length];
        tenant = st.name;
        tenantPhone = st.phone;
        tenantIdx++;
        occupiedAssigned++;
      }

      beds.push({
        id: `${prop.id}-r${roomNumber}-b${labelChar}`,
        label: labelChar,
        bedLabel: `Bed ${roomNumber}-${labelChar}`,
        status,
        tenant,
        tenantPhone,
        rent: rentRupees,
      });
    }

    rooms.push({
      id: `${prop.id}-r${roomNumber}`,
      roomNumber,
      sharing: beds.length,
      rentRupees,
      hasAC: true,
      hasAttBath: true,
      beds,
    });
  }

  savePropertyRooms(prop.id, rooms);
  return rooms;
}

export function savePropertyRooms(propertyId: string, rooms: RoomData[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(propertyId);
    localStorage.setItem(key, JSON.stringify(rooms));

    // Also update occupiedBeds count in client properties store
    const occupiedCount = rooms.reduce(
      (sum, r) => sum + r.beds.filter((b) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length,
      0
    );
    const totalCount = rooms.reduce((sum, r) => sum + r.beds.length, 0);

    const clientProps = getClientProperties();
    const target = clientProps.find((p) => p.id === propertyId);
    if (target) {
      saveClientProperty({
        ...target,
        occupiedBeds: occupiedCount,
        totalBeds: totalCount,
        totalRooms: rooms.length,
      });
    }
  } catch (err) {
    console.warn('Error saving property rooms:', err);
  }
}

export function checkInTenant(
  propertyId: string,
  roomId: string,
  bedId: string,
  tenantData: { name: string; phone: string; rent?: number }
): RoomData[] {
  const currentRooms = getPropertyRooms({ id: propertyId } as any);
  const updated = currentRooms.map((room) => {
    if (room.id !== roomId && !room.beds.some((b) => b.id === bedId)) return room;
    return {
      ...room,
      beds: room.beds.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: 'OCCUPIED' as const,
          tenant: tenantData.name.trim(),
          tenantPhone: tenantData.phone.trim(),
          rent: tenantData.rent || room.rentRupees,
          checkInDate: new Date().toISOString(),
        };
      }),
    };
  });
  savePropertyRooms(propertyId, updated);
  return updated;
}

export function checkOutTenant(propertyId: string, roomId: string, bedId: string): RoomData[] {
  const currentRooms = getPropertyRooms({ id: propertyId } as any);
  const updated = currentRooms.map((room) => {
    if (room.id !== roomId && !room.beds.some((b) => b.id === bedId)) return room;
    return {
      ...room,
      beds: room.beds.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: 'AVAILABLE' as const,
          tenant: '—',
          tenantPhone: '',
          checkInDate: undefined,
        };
      }),
    };
  });
  savePropertyRooms(propertyId, updated);
  return updated;
}

export function toggleBedStatus(
  propertyId: string,
  roomId: string,
  bedId: string,
  newStatus: BedData['status']
): RoomData[] {
  const currentRooms = getPropertyRooms({ id: propertyId } as any);
  const updated = currentRooms.map((room) => {
    if (room.id !== roomId && !room.beds.some((b) => b.id === bedId)) return room;
    return {
      ...room,
      beds: room.beds.map((bed) => {
        if (bed.id !== bedId) return bed;
        return {
          ...bed,
          status: newStatus,
          tenant: newStatus === 'OCCUPIED' ? bed.tenant || 'Tenant' : '—',
        };
      }),
    };
  });
  savePropertyRooms(propertyId, updated);
  return updated;
}

export function addRoomToProperty(
  propertyId: string,
  roomData: { roomNumber: string; sharing: number; rentRupees: number; hasAC?: boolean; hasAttBath?: boolean }
): RoomData[] {
  const currentRooms = getPropertyRooms({ id: propertyId } as any);
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const beds: BedData[] = [];
  const sharing = Math.max(1, Number(roomData.sharing || 2));
  const rentRupees = Number(roomData.rentRupees || 6000);

  for (let b = 0; b < sharing; b++) {
    const labelChar = labels[b] || `${b + 1}`;
    beds.push({
      id: `${propertyId}-r${roomData.roomNumber}-b${labelChar}`,
      label: labelChar,
      bedLabel: `Bed ${roomData.roomNumber}-${labelChar}`,
      status: 'AVAILABLE',
      tenant: '—',
      rent: rentRupees,
    });
  }

  const newRoom: RoomData = {
    id: `${propertyId}-r${roomData.roomNumber}`,
    roomNumber: roomData.roomNumber,
    sharing,
    rentRupees,
    hasAC: Boolean(roomData.hasAC),
    hasAttBath: Boolean(roomData.hasAttBath),
    beds,
  };

  const updated = [...currentRooms, newRoom];
  savePropertyRooms(propertyId, updated);
  return updated;
}

export function addBedToRoom(propertyId: string, roomId: string): RoomData[] {
  const currentRooms = getPropertyRooms({ id: propertyId } as any);
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const updated = currentRooms.map((room) => {
    if (room.id !== roomId) return room;
    const nextIndex = room.beds.length;
    const labelChar = labels[nextIndex] || `${nextIndex + 1}`;
    const newBed: BedData = {
      id: `${propertyId}-r${room.roomNumber}-b${labelChar}`,
      label: labelChar,
      bedLabel: `Bed ${room.roomNumber}-${labelChar}`,
      status: 'AVAILABLE',
      tenant: '—',
      rent: room.rentRupees,
    };
    return {
      ...room,
      sharing: room.beds.length + 1,
      beds: [...room.beds, newBed],
    };
  });

  savePropertyRooms(propertyId, updated);
  return updated;
}
