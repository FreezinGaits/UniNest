import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    const landlord = await prisma.landlord.findFirst({ where: { user: { email: 'landlord@uninest.demo' } } });
    if (!landlord) return NextResponse.json({ message: 'Landlord not found' }, { status: 400 });

    const sources = ['wifi', 'food', 'laundry', 'water', 'gym', 'guest'];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const amounts: Record<string, number> = { wifi: 30000, food: 50000, laundry: 20000, water: 15000, gym: 10000, guest: 25000 };
    const now = new Date();

    const reward = await prisma.landlordReward.create({
      data: {
        landlordId: landlord.id, source, amount: amounts[source] || 20000,
        description: `${source.charAt(0).toUpperCase() + source.slice(1)} service commission`,
        month: now.getMonth() + 1, year: now.getFullYear(),
      },
    });
    return NextResponse.json({ message: `Landlord reward: ₹${(amounts[source] || 20000) / 100} from ${source} commission` });
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 });
  }
}
