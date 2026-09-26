import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getAllProperties,
  createProperty,
  normalizePropertyItem,
} from '@/lib/propertiesStore';

export async function GET() {
  try {
    // Return the landlord's portfolio from the unified propertiesStore
    // (excludes the 13 city-wide student search marketplace seed properties)
    const properties = await getAllProperties();
    return NextResponse.json({ properties: properties.map(normalizePropertyItem) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
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

    // Persist to the unified landlord propertiesStore (memory + local disk)
    const createdItem = await createProperty(data);

    // Also mirror into Prisma DB if available so Student Search can discover it once verified
    try {
      let landlord = await prisma.landlord.findFirst();
      if (!landlord) {
        const demoUser = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
        if (demoUser) {
          landlord = await prisma.landlord.findFirst({ where: { userId: demoUser.id } });
        }
      }

      if (landlord) {
        await prisma.$transaction(async (tx) => {
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
      }
    } catch (dbError) {
      console.warn('Database mirror skipped for POST /api/properties:', dbError);
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
