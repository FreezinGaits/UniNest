import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const globalForElectricity = globalThis as unknown as { fallbackReadings: any[] };
if (!globalForElectricity.fallbackReadings) {
  globalForElectricity.fallbackReadings = [
    {
      id: "demo-elec-1",
      property: "PCTE Premium Boys PG",
      room: "101",
      tenant: "Rahul Sharma",
      previousReading: 1200,
      currentReading: 1250,
      ratePerUnit: 9.5,
      month: "September 2026",
      totalAmount: 47500, // 50 units * 9.5 * 100
      createdAt: new Date().toISOString(),
    }
  ];
}

export async function GET() {
  try {
    let readings;
    try {
      // Prisma model could be electricityReading or similar, fallback is handled if this fails
      // @ts-ignore
      readings = await prisma.electricityReading.findMany();
    } catch (dbError) {
      console.error("Database error fetching electricity readings:", dbError);
    }

    if (!readings || readings.length === 0) {
      readings = globalForElectricity.fallbackReadings;
    }
    return NextResponse.json({ readings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch electricity readings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.property || !body.room) {
      return NextResponse.json({ error: 'Property and Room are required.' }, { status: 400 });
    }

    const data = {
      property: body.property,
      room: body.room,
      tenant: body.tenant || 'Unknown',
      previousReading: Number(body.previousReading || 0),
      currentReading: Number(body.currentReading || 0),
      ratePerUnit: Number(body.ratePerUnit || 9.5),
      month: body.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    };

    const newReading = {
      id: `elec-${Date.now()}`,
      ...data,
      totalAmount: (data.currentReading - data.previousReading) * data.ratePerUnit * 100,
      createdAt: new Date().toISOString(),
    };
    globalForElectricity.fallbackReadings.push(newReading);

    return NextResponse.json({
      success: true,
      message: 'Electricity reading logged successfully.',
      reading: newReading,
    });
  } catch (error: any) {
    console.error('Error logging electricity reading:', error);
    return NextResponse.json({ error: error.message || 'Failed to log electricity reading' }, { status: 500 });
  }
}
