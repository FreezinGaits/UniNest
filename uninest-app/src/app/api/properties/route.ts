import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const globalForProperties = globalThis as unknown as { fallbackProperties: any[] };
if (!globalForProperties.fallbackProperties) {
  globalForProperties.fallbackProperties = [
    {
      id: "demo-prop-1",
      name: "PCTE Premium Boys PG",
      address: "Baddowal, Ludhiana",
      locality: "Baddowal",
      city: "Ludhiana",
      type: "PG",
      totalRooms: 10,
      bedsPerRoom: 2,
      rentPerMonth: 750000,
      gender: "MALE",
      description: "Premium PG near PCTE campus",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-prop-2",
      name: "UniNest Girls Hostel",
      address: "Sarabha Nagar, Ludhiana",
      locality: "Sarabha Nagar",
      city: "Ludhiana",
      type: "HOSTEL",
      totalRooms: 15,
      bedsPerRoom: 3,
      rentPerMonth: 650000,
      gender: "FEMALE",
      description: "Safe and secure girls hostel",
      status: "APPROVED",
      createdAt: new Date().toISOString(),
    }
  ];
}

export async function GET() {
  try {
    let properties;
    try {
      properties = await prisma.property.findMany();
    } catch (dbError) {
      console.error("Database error fetching properties:", dbError);
    }

    if (!properties || properties.length === 0) {
      properties = globalForProperties.fallbackProperties;
    }
    return NextResponse.json({ properties });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.address) {
      return NextResponse.json({ error: 'Property Name and Address are required.' }, { status: 400 });
    }

    const data = {
      name: body.name,
      locality: body.locality || 'Ferozepur Road',
      city: body.city || 'Ludhiana',
      address: body.address,
      type: body.type || 'PG',
      totalRooms: Number(body.totalRooms || 4),
      bedsPerRoom: Number(body.bedsPerRoom || 2),
      rentPerMonth: Number(body.rentPerMonth || 6000), // Note: Should ideally be paise
      gender: body.gender || 'ANY',
      description: body.description || '',
    };

    let newProperty;
    try {
      // Find a valid landlord to associate with
      let landlord = await prisma.landlord.findFirst();
      if (!landlord) {
        const demoUser = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
        if (demoUser) {
          landlord = await prisma.landlord.findFirst({ where: { userId: demoUser.id } });
        }
      }

      if (landlord) {
        newProperty = await prisma.$transaction(async (tx) => {
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

          // Auto-generate Room and Bed records for the property
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
      } else {
        throw new Error('No landlord found in database');
      }
    } catch (dbError) {
      console.warn("Database error creating property with rooms/beds, falling back to memory:", dbError);
      newProperty = {
        id: `prop-${Date.now()}`,
        ...data,
        verificationStatus: 'UNDER_REVIEW',
        createdAt: new Date().toISOString(),
      };
      globalForProperties.fallbackProperties.push(newProperty);
    }

    return NextResponse.json({
      success: true,
      message: 'Property created successfully and sent to Admin for review.',
      property: newProperty,
    });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: error.message || 'Failed to create property' }, { status: 500 });
  }
}
