import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const property = await prisma.property.findFirst({ where: { name: 'ABC Student Residence' } });
    const meter = await prisma.electricityMeter.findFirst({ where: { propertyId: property?.id } });
    if (!meter) return NextResponse.json({ message: 'No electricity meter found' }, { status: 400 });

    const lastReading = await prisma.electricityReading.findFirst({
      where: { meterId: meter.id }, orderBy: { readingDate: 'desc' },
    });
    const newReading = (lastReading?.reading || 1200) + Math.floor(Math.random() * 40) + 20;
    const reading = await prisma.electricityReading.create({
      data: { meterId: meter.id, reading: newReading, readingDate: new Date() },
    });
    const units = newReading - (lastReading?.reading || 1200);
    const rate = 800; // 8 rupees in paise
    await prisma.utilityCharge.create({
      data: { readingId: reading.id, units, rate, amount: units * rate, tenantName: 'Rahul Sharma' },
    });
    return NextResponse.json({ message: `Reading logged: ${newReading} units. Charge: ₹${(units * rate) / 100} (${units} units × ₹8)` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
