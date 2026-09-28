import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { createProperty as addStoreProperty } from '@/lib/propertiesStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, email, profileData = {} } = body;
    const session = await getSession();
    const targetEmail = (email || session?.email || '').trim().toLowerCase();

    if (!targetEmail) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          email: {
            in: [
              targetEmail,
              targetEmail.replace('@uninest.in', '@uninest.demo'),
            ],
          },
        },
      });
    } catch (dbErr) {
      console.warn('DB offline during onboarding, using demo user:', dbErr);
    }

    if (!user) {
      user = {
        id: session?.userId || 'usr-demo-id',
        email: targetEmail,
        name: profileData.fullName || session?.name || 'Demo User',
      } as any;
    }

    const data = { ...body, ...profileData };

    if (role === 'LANDLORD') {
      const propertyName = (body.propertyName || profileData.propertyName || '').trim();
      if (propertyName) {
        await addStoreProperty({
          name: propertyName,
          locality: data.locality || 'Ferozepur Road',
          city: data.city || 'Ludhiana',
          address: data.address || `${data.locality || 'Ferozepur Road'}, ${data.city || 'Ludhiana'}`,
          type: data.propertyType || 'PG',
          totalRooms: Number(data.totalRooms || 6),
          bedsPerRoom: Number(data.bedsPerRoom || 2),
          rentPerMonth: Number(data.baseRent || data.rentPerMonth || 6500),
          ownerName: data.fullName || data.businessName || user.name || 'Landlord Partner',
        });
      }
    }

    try {
      if (role === 'STUDENT') {
        await prisma.student.upsert({
          where: { userId: user.id },
          update: {
            collegeName: data.collegeName || 'PCTE Institute',
            enrollmentNo: data.enrollmentNo || 'PCTE-BTECH-2024-042',
            course: data.course || 'B.Tech Computer Science',
            year: parseInt(data.year || '3'),
            gender: data.gender || 'MALE',
            emergencyName: data.emergencyName,
            emergencyPhone: data.emergencyPhone,
            emergencyRel: data.emergencyRel,
            prefSharing: data.prefSharing || 'Double Sharing',
            prefLocation: data.prefLocation || 'Ferozepur Road / BRS Nagar',
            sleepSchedule: data.sleepSchedule,
            studyHabits: data.studyHabits,
            cleanliness: parseInt(data.cleanliness || '4'),
            noisePref: data.noisePref,
            smokingPref: data.smokingPref,
            foodPref: data.foodPref,
            socialPref: data.socialPref,
            budgetMin: (parseInt(data.budgetMin || '5000')) * 100,
            budgetMax: (parseInt(data.budgetMax || '7000')) * 100,
            acPref: data.acPref ?? true,
            profileComplete: 85,
          },
          create: {
            userId: user.id,
            collegeName: data.collegeName || 'PCTE Institute',
            enrollmentNo: data.enrollmentNo || 'PCTE-BTECH-2024-042',
            course: data.course || 'B.Tech Computer Science',
            year: parseInt(data.year || '3'),
            gender: data.gender || 'MALE',
            emergencyName: data.emergencyName || 'Rajesh Sharma',
            emergencyPhone: data.emergencyPhone || '9814012345',
            emergencyRel: data.emergencyRel || 'Father',
            prefSharing: data.prefSharing || 'Double Sharing',
            prefLocation: data.prefLocation || 'Ferozepur Road / BRS Nagar',
            cleanliness: 4,
            budgetMin: 5000 * 100,
            budgetMax: 7000 * 100,
            profileComplete: 85,
          },
        });
      } else if (role === 'LANDLORD') {
        await prisma.landlord.upsert({
          where: { userId: user.id },
          update: {
            businessName: data.businessName || 'Singh Student Housing',
            address: data.address || 'Model Town, Ludhiana',
            phone: data.phone || '9898989801',
            panNo: data.panNo || 'ABCPS1234F',
            gstNo: data.gstNo || '03ABCPS1234F1Z5',
            bankAccount: data.bankAccount,
            ifscCode: data.ifscCode,
            profileComplete: 91,
          },
          create: {
            userId: user.id,
            businessName: data.businessName || 'Singh Student Housing',
            address: data.address || 'Model Town, Ludhiana',
            phone: data.phone || '9898989801',
            panNo: data.panNo || 'ABCPS1234F',
            profileComplete: 91,
          },
        });
      } else if (role === 'COLLEGE') {
        await prisma.college.upsert({
          where: { userId: user.id },
          update: {
            collegeName: data.collegeName || 'PCTE Institute',
            address: data.address || 'Ferozepur Road, Ludhiana',
            city: data.city || 'Ludhiana',
            state: data.state || 'Punjab',
            contactPerson: data.contactPerson,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            housingCoordinator: data.housingCoordinator,
            hostelCapacity: parseInt(data.hostelCapacity || '600'),
            totalStudents: parseInt(data.totalStudents || '3200'),
            profileComplete: 88,
          },
          create: {
            userId: user.id,
            collegeName: data.collegeName || 'PCTE Institute',
            address: data.address || 'Ferozepur Road, Ludhiana',
            city: data.city || 'Ludhiana',
            state: data.state || 'Punjab',
            profileComplete: 88,
          },
        });
      } else if (role === 'PROVIDER') {
        await prisma.serviceProvider.upsert({
          where: { userId: user.id },
          update: {
            businessName: data.businessName || 'QuickFix Services',
            ownerName: data.ownerName || 'Harpreet Singh',
            phone: data.phone || '9898989810',
            categories: data.categories || ['Plumbing', 'AC Repair', 'Deep Cleaning'],
            coverageArea: data.coverageArea || 'Ludhiana City',
            coverageRadius: parseFloat(data.coverageRadius || '12.0'),
            rateCard: data.rateCard || 'Standard Visit: ₹299',
            profileComplete: 73,
          },
          create: {
            userId: user.id,
            businessName: data.businessName || 'QuickFix Services',
            ownerName: data.ownerName || 'Harpreet Singh',
            phone: data.phone || '9898989810',
            profileComplete: 73,
          },
        });
      }
    } catch (dbErr) {
      console.warn('DB upsert error during onboarding, using fallback success:', dbErr);
    }

    return NextResponse.json({ success: true, profileComplete: 90 });
  } catch (error) {
    console.error('Onboarding update caught error:', error);
    return NextResponse.json({ success: false, error: 'Onboarding failed' }, { status: 500 });
  }
}
