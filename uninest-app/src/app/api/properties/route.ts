import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getAllProperties,
  createProperty,
  normalizePropertyItem,
  PropertyItem,
} from '@/lib/propertiesStore';

export async function GET() {
  try {
    const storeProperties = await getAllProperties();
    let dbProperties: PropertyItem[] = [];

    try {
      const rawDbProps = await prisma.property.findMany({
        include: {
          rooms: {
            include: {
              beds: true,
            },
          },
          maintenanceTickets: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (Array.isArray(rawDbProps) && rawDbProps.length > 0) {
        dbProperties = rawDbProps.map(normalizePropertyItem);
      }
    } catch (dbError) {
      console.warn('Database fallback used for GET /api/properties:', dbError);
    }

    // Merge DB properties with store properties without duplicates (by id or name)
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const merged: PropertyItem[] = [];

    for (const item of [...storeProperties, ...dbProperties]) {
      const norm = normalizePropertyItem(item);
      const nameKey = norm.name.trim().toLowerCase();
      if (!seenIds.has(norm.id) && !seenNames.has(nameKey)) {
        seenIds.add(norm.id);
        seenNames.add(nameKey);
        merged.push(norm);
      }
    }

    return NextResponse.json({ properties: merged });
  } catch (error: any) {
    const fallback = await getAllProperties();
    return NextResponse.json({ properties: fallback });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: 'Property Name and Address are required.' },
        { status: 400 }
      );
    }

    const data = {
      name: String(body.name).trim(),
      locality: String(body.locality || 'Ferozepur Road').trim(),
      city: String(body.city || 'Ludhiana').trim(),
      address: String(body.address).trim(),
      type: String(body.type || 'PG'),
      totalRooms: Number(body.totalRooms || 4),
      bedsPerRoom: Number(body.bedsPerRoom || 2),
      rentPerMonth: Number(body.rentPerMonth || 6000),
      gender: String(body.gender || 'ANY'),
      description: String(body.description || ''),
    };

    // Always persist to the unified propertiesStore (memory + local disk fallback)
    let createdItem = await createProperty(data);

    try {
      let landlord = await prisma.landlord.findFirst();
      if (!landlord) {
        const demoUser = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
        if (demoUser) {
          landlord = await prisma.landlord.findFirst({ where: { userId: demoUser.id } });
        }
      }

      if (landlord) {
        const dbProp = await prisma.$transaction(async (tx) => {
          const prop = await tx.property.create({
            data: {
              name: data.name,
              locality: data.locality,
              city: data.city,
              address: data.address,
              state: body.state || 'Punjab',
              pincode: body.pincode || '141012',
              type: data.type,
              gender: data.gender as any,
              description: data.description,
              landlordId: landlord.id,
              verificationStatus: 'UNDER_REVIEW',
              images: [
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80',
                'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
              ],
            },
          });

          const totalRooms = data.totalRooms || 4;
          const bedsPerRoom = data.bedsPerRoom || 2;
          const rentPaise = data.rentPerMonth * 100;
          const labels = ['A', 'B', 'C', 'D'];

          for (let r = 1; r <= totalRooms; r++) {
            const room = await tx.room.create({
              data: {
                propertyId: prop.id,
                roomNumber: `${100 + r}`,
                sharing: bedsPerRoom,
                rent: rentPaise,
                deposit: rentPaise * 2,
                hasAC: true,
                hasAttBath: true,
              },
            });

            for (let b = 0; b < bedsPerRoom; b++) {
              await tx.bed.create({
                data: {
                  roomId: room.id,
                  label: labels[b] || `${b + 1}`,
                  status: 'AVAILABLE',
                },
              });
            }
          }

          return prop;
        });

        createdItem = normalizePropertyItem({
          ...createdItem,
          id: dbProp.id,
        });
      }
    } catch (dbError) {
      console.warn('Database fallback used for POST /api/properties:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Property created successfully and sent to Admin for review.',
      property: createdItem,
    });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}
