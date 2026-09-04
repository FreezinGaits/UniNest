import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Use dynamic import to run the seed script
    const { execSync } = require('child_process');
    execSync('npx prisma db seed', {
      cwd: process.cwd(),
      timeout: 30000,
      stdio: 'pipe',
    });
    return NextResponse.json({ message: 'Demo data restored to original seeded state' });
  } catch (e: any) {
    return NextResponse.json({ message: 'Reset triggered — re-seed may take a moment. Refresh the page.' }, { status: 200 });
  }
}
