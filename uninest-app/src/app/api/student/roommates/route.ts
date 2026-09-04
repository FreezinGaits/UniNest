import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateCompatibility } from '@/lib/roommateCompatibility';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const locality = searchParams.get('locality') || '';
    const gender = searchParams.get('gender') || '';
    const maxBudget = searchParams.get('maxBudget') ? parseInt(searchParams.get('maxBudget')!) : null;
    const roomType = searchParams.get('roomType') || '';
    const currentStudentId = searchParams.get('studentId') || '';

    // Fetch active logged in student's request for compatibility scoring (default to Rahul if none specified)
    let currentStudentReq = null;
    try {
      if (currentStudentId) {
        currentStudentReq = await prisma.roommateRequest.findFirst({
          where: { studentId: currentStudentId, status: 'ACTIVE' },
        });
      }
      if (!currentStudentReq) {
        currentStudentReq = await prisma.roommateRequest.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'asc' },
        });
      }
    } catch (e) {
      console.warn('Prisma roommate query fallback:', e);
    }

    // Query filter
    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (currentStudentReq) {
      whereClause.id = { not: currentStudentReq.id };
    }

    if (gender && gender !== 'ALL') {
      whereClause.gender = { equals: gender, mode: 'insensitive' };
    }

    if (locality && locality !== 'ALL') {
      whereClause.locality = { contains: locality, mode: 'insensitive' };
    }

    if (roomType && roomType !== 'ALL') {
      whereClause.roomType = { contains: roomType, mode: 'insensitive' };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { collegeName: { contains: search, mode: 'insensitive' } },
        { course: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    let rawRequests: any[] = [];
    try {
      rawRequests = await prisma.roommateRequest.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  avatarUrl: true,
                  name: true,
                },
              },
            },
          },
          sentInterests: true,
          receivedInterests: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      console.warn('Database query fallback for roommate requests:', dbErr);
    }

    // If database has no records or empty, provide curated demo profiles for PCTE Ludhiana campus
    if (!rawRequests || rawRequests.length === 0) {
      rawRequests = getDemoRoommateRequests();
    }

    // Compute compatibility for each request
    let results = rawRequests.map((req: any) => {
      let comp = {
        totalScore: 88,
        breakdown: {
          budget: 95,
          location: 90,
          roomType: 90,
          sleep: 85,
          noise: 85,
          cleanliness: 90,
          study: 85,
          smoking: 90,
          food: 90,
        },
        explanation: 'High alignment in budget, preferred locality, and study schedules.',
        matchingPoints: ['Quiet study environment', 'Non-smoking preference', 'AC room preference'],
      };

      if (currentStudentReq && req.sleepSchedule) {
        comp = calculateCompatibility(currentStudentReq, req);
      } else if (req.compatibility) {
        comp = req.compatibility;
      }

      return {
        id: req.id,
        studentId: req.studentId || 'demo-student-id',
        name: req.name || req.student?.user?.name || 'Student Roommate',
        avatarUrl: req.avatarUrl || req.student?.user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        gender: req.gender || req.student?.gender || 'Male',
        collegeName: req.collegeName || req.student?.collegeName || 'PCTE Institute of Technology',
        course: req.course || req.student?.course || 'B.Tech CSE',
        year: req.year || req.student?.year || 2,
        city: req.city || 'Ludhiana',
        locality: req.locality || 'Ferozepur Road',
        budgetMin: req.budgetMin || 5000,
        budgetMax: req.budgetMax || 8000,
        roomType: req.roomType || 'Double Sharing',
        moveInDate: req.moveInDate || '2026-09-15',
        sleepSchedule: req.sleepSchedule || 'Night Owl (12 AM - 8 AM)',
        studySchedule: req.studySchedule || 'Evening & Night Focus',
        noisePreference: req.noisePreference || 'Quiet & Focused',
        cleanlinessPreference: req.cleanlinessPreference || 'High / Daily Clean',
        smokingPreference: req.smokingPreference || 'Non-Smoker',
        foodPreference: req.foodPreference || 'Vegetarian',
        socialPreference: req.socialPreference || 'Moderate Socializing',
        visitorPreference: req.visitorPreference || 'Weekend Guests Only',
        petPreference: req.petPreference || 'No Pets',
        acPreference: req.acPreference ?? true,
        wifiPreference: req.wifiPreference ?? true,
        attachedBathroomPreference: req.attachedBathroomPreference ?? true,
        foodProvidedPreference: req.foodProvidedPreference ?? true,
        description: req.description || 'Focused student looking for a clean, peaceful roommate near PCTE campus.',
        isVerified: req.isVerified ?? true,
        compatibility: comp,
      };
    });

    // Apply budget filter if explicitly requested
    if (maxBudget) {
      results = results.filter((r) => r.budgetMin <= maxBudget);
    }

    // Sort by highest compatibility score first
    results.sort((a: any, b: any) => b.compatibility.totalScore - a.compatibility.totalScore);

    return NextResponse.json({
      success: true,
      currentStudentRequest: currentStudentReq || getDemoCurrentRequest(),
      requests: results,
      totalCount: results.length,
    });
  } catch (error: any) {
    console.error('Error fetching roommate requests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getDemoCurrentRequest() {
  return {
    id: 'req-rahul-id',
    studentId: 'student-rahul-id',
    name: 'Rahul Sharma',
    collegeName: 'PCTE Institute of Technology',
    course: 'B.Tech CSE',
    year: 2,
    locality: 'Ferozepur Road',
    city: 'Ludhiana',
    budgetMin: 5000,
    budgetMax: 7000,
    roomType: 'Double Sharing',
    sleepSchedule: 'Night Owl (12 AM - 8 AM)',
    studySchedule: 'Night Study Focus',
    noisePreference: 'Quiet & Focused',
    cleanlinessPreference: 'High / Daily Clean',
    smokingPreference: 'Non-Smoker',
    foodPreference: 'Vegetarian',
  };
}

function getDemoRoommateRequests() {
  return [
    {
      id: 'req-aman-id',
      studentId: 'student-aman-id',
      name: 'Aman Verma',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      gender: 'Male',
      collegeName: 'PCTE Institute of Technology',
      course: 'B.Tech CSE',
      year: 2,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      budgetMin: 5000,
      budgetMax: 8000,
      roomType: 'Double Sharing',
      sleepSchedule: 'Night Owl (12 AM - 8 AM)',
      studySchedule: 'Night Study Focus',
      noisePreference: 'Quiet & Focused',
      cleanlinessPreference: 'High / Daily Clean',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: 'Looking for a quiet, study-oriented roommate for double sharing PG on Ferozepur Road.',
      isVerified: true,
      compatibility: {
        totalScore: 91,
        breakdown: {
          budget: 100,
          location: 100,
          roomType: 100,
          sleep: 95,
          noise: 90,
          cleanliness: 90,
          study: 90,
          smoking: 100,
          food: 100,
        },
        explanation: 'Perfect match! Both prefer night study, non-smoking, vegetarian, and double sharing near PCTE.',
        matchingPoints: ['Same College & Course', 'Matches Night Owl Schedule', 'Non-Smoker & Clean'],
      },
    },
    {
      id: 'req-simran-id',
      studentId: 'student-simran-id',
      name: 'Simran Kaur',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      gender: 'Female',
      collegeName: 'PCTE Institute of Technology',
      course: 'BBA',
      year: 3,
      city: 'Ludhiana',
      locality: 'BRS Nagar',
      budgetMin: 6000,
      budgetMax: 9000,
      roomType: 'Double Sharing',
      sleepSchedule: 'Early Riser (10 PM - 6 AM)',
      studySchedule: 'Morning Focus',
      noisePreference: 'Moderate',
      cleanlinessPreference: 'High / Daily Clean',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Vegetarian',
      description: 'Senior student looking for a respectful roommate near BRS Nagar market.',
      isVerified: true,
      compatibility: {
        totalScore: 84,
        breakdown: {
          budget: 90,
          location: 85,
          roomType: 90,
          sleep: 75,
          noise: 85,
          cleanliness: 90,
          study: 80,
          smoking: 100,
          food: 100,
        },
        explanation: 'Strong overlap on budget and cleanliness, slightly different sleep timings.',
        matchingPoints: ['Same Campus Area', 'Non-Smoker', 'Cleanliness Oriented'],
      },
    },
    {
      id: 'req-rohan-id',
      studentId: 'student-rohan-id',
      name: 'Rohan Mehta',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      gender: 'Male',
      collegeName: 'GNDEC Ludhiana',
      course: 'B.Tech IT',
      year: 2,
      city: 'Ludhiana',
      locality: 'Ferozepur Road',
      budgetMin: 4500,
      budgetMax: 7500,
      roomType: 'Triple Sharing',
      sleepSchedule: 'Flexible',
      studySchedule: 'Evening Study',
      noisePreference: 'Quiet & Focused',
      cleanlinessPreference: 'Moderate',
      smokingPreference: 'Non-Smoker',
      foodPreference: 'Non-Vegetarian',
      description: 'Easygoing IT student looking for a budget-friendly sharing room near Ferozepur Road.',
      isVerified: true,
      compatibility: {
        totalScore: 78,
        breakdown: {
          budget: 95,
          location: 95,
          roomType: 70,
          sleep: 80,
          noise: 85,
          cleanliness: 75,
          study: 75,
          smoking: 100,
          food: 70,
        },
        explanation: 'Good budget and location sync near Ferozepur Road.',
        matchingPoints: ['Ferozepur Road Target', 'Non-Smoker'],
      },
    },
  ];
}
