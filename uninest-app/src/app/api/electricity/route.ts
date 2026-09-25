import { NextRequest, NextResponse } from 'next/server';
import { getAllElectricityReadings, createElectricityReading } from '@/lib/electricityStore';

export async function GET() {
  try {
    const readings = await getAllElectricityReadings();
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

    const newReading = await createElectricityReading({
      property: body.property,
      room: body.room,
      tenant: body.tenant,
      previousReading: Number(body.previousReading || 0),
      currentReading: Number(body.currentReading || 0),
      ratePerUnit: Number(body.ratePerUnit || 9.5),
      month: body.month,
    });

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
