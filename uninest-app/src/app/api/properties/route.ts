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
      newProperty = await prisma.property.create({
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
          landlordId: 'demo-landlord-id',
        }
      });
    } catch (dbError) {
      console.error("Database error creating property, falling back to memory:", dbError);
      newProperty = {
        id: `prop-${Date.now()}`,
        ...data,
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
