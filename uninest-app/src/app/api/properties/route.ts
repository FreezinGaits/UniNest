import { NextRequest, NextResponse } from 'next/server';
import { getAllProperties, createProperty } from '@/lib/propertiesStore';

export async function GET() {
  try {
    const properties = await getAllProperties();
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

    const newProperty = await createProperty({
      name: body.name,
      locality: body.locality || 'Ferozepur Road',
      city: body.city || 'Ludhiana',
      address: body.address,
      type: body.type || 'PG',
      totalRooms: Number(body.totalRooms || 4),
      bedsPerRoom: Number(body.bedsPerRoom || 2),
      rentPerMonth: Number(body.rentPerMonth || 6000),
      gender: body.gender || 'ANY',
      description: body.description || '',
    });

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
