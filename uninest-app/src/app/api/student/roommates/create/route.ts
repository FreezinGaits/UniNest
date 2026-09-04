import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      name,
      gender,
      collegeName,
      course,
      year,
      city = 'Ludhiana',
      locality = 'Ferozepur Road',
      radiusKm = 3.0,
      budgetMin = 5000,
      budgetMax = 7000,
      roomType = 'Double Sharing',
      moveInDate,
      genderPreference = 'Same Gender',
      sleepSchedule = 'Night Owl',
      studySchedule = 'Late Night',
      noisePreference = 'Quiet Room',
      cleanlinessPreference = 'Very Neat',
      smokingPreference = 'Non-Smoker',
      foodPreference = 'Vegetarian',
      socialPreference = 'Balanced',
      visitorPreference = 'Weekend Only',
      petPreference = 'No Pets',
      acPreference = true,
      coolerPreference = false,
      heaterPreference = false,
      wifiPreference = true,
      foodProvidedPreference = true,
      attachedBathroomPreference = true,
      furniturePreference = true,
      description = '',
      showFirstName = true,
      showCollege = true,
      showCourse = true,
      showBudget = true,
      showLifestyle = true,
    } = body;

    // Find logged in student (or fallback to first student)
    let targetStudent = null;
    if (studentId) {
      targetStudent = await prisma.student.findUnique({ where: { id: studentId } });
    }
    if (!targetStudent) {
      targetStudent = await prisma.student.findFirst({
        include: { user: true },
      });
    }

    if (!targetStudent) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    // Check if an existing request exists for this student
    const existingReq = await prisma.roommateRequest.findFirst({
      where: { studentId: targetStudent.id, status: 'ACTIVE' },
    });

    const parsedMoveIn = moveInDate ? new Date(moveInDate) : new Date(Date.now() + 14 * 86400000);

    let resultRequest;
    if (existingReq) {
      resultRequest = await prisma.roommateRequest.update({
        where: { id: existingReq.id },
        data: {
          name: name || existingReq.name,
          gender: gender || existingReq.gender,
          collegeName: collegeName || existingReq.collegeName,
          course: course || existingReq.course,
          year: year ? parseInt(year) : existingReq.year,
          city,
          locality,
          radiusKm: parseFloat(radiusKm),
          budgetMin: parseInt(budgetMin),
          budgetMax: parseInt(budgetMax),
          roomType,
          moveInDate: parsedMoveIn,
          genderPreference,
          sleepSchedule,
          studySchedule,
          noisePreference,
          cleanlinessPreference,
          smokingPreference,
          foodPreference,
          socialPreference,
          visitorPreference,
          petPreference,
          acPreference: Boolean(acPreference),
          coolerPreference: Boolean(coolerPreference),
          heaterPreference: Boolean(heaterPreference),
          wifiPreference: Boolean(wifiPreference),
          foodProvidedPreference: Boolean(foodProvidedPreference),
          attachedBathroomPreference: Boolean(attachedBathroomPreference),
          furniturePreference: Boolean(furniturePreference),
          description,
          showFirstName: Boolean(showFirstName),
          showCollege: Boolean(showCollege),
          showCourse: Boolean(showCourse),
          showBudget: Boolean(showBudget),
          showLifestyle: Boolean(showLifestyle),
          status: 'ACTIVE',
        },
      });
    } else {
      resultRequest = await prisma.roommateRequest.create({
        data: {
          studentId: targetStudent.id,
          name: name || 'Rahul Sharma',
          gender: gender || 'Male',
          collegeName: collegeName || 'PCTE Institute of Technology',
          course: course || 'B.Tech CSE',
          year: year ? parseInt(year) : 2,
          city,
          locality,
          radiusKm: parseFloat(radiusKm),
          budgetMin: parseInt(budgetMin),
          budgetMax: parseInt(budgetMax),
          roomType,
          moveInDate: parsedMoveIn,
          genderPreference,
          sleepSchedule,
          studySchedule,
          noisePreference,
          cleanlinessPreference,
          smokingPreference,
          foodPreference,
          socialPreference,
          visitorPreference,
          petPreference,
          acPreference: Boolean(acPreference),
          coolerPreference: Boolean(coolerPreference),
          heaterPreference: Boolean(heaterPreference),
          wifiPreference: Boolean(wifiPreference),
          foodProvidedPreference: Boolean(foodProvidedPreference),
          attachedBathroomPreference: Boolean(attachedBathroomPreference),
          furniturePreference: Boolean(furniturePreference),
          description,
          showFirstName: Boolean(showFirstName),
          showCollege: Boolean(showCollege),
          showCourse: Boolean(showCourse),
          showBudget: Boolean(showBudget),
          showLifestyle: Boolean(showLifestyle),
          status: 'ACTIVE',
          isVerified: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Roommate request published successfully!',
      request: resultRequest,
    });
  } catch (error: any) {
    console.error('Error creating roommate request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
