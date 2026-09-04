import { prisma } from '@/lib/db';
import { SavedPropertiesClient } from './SavedPropertiesClient';

export default async function SavedPropertiesPage() {
  // Find Rahul Sharma student user
  let studentUser = await prisma.user.findFirst({
    where: { email: 'rahul@uninest.demo' },
  });

  if (!studentUser) {
    studentUser = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
    });
  }

  let savedItems: any[] = [];
  if (studentUser) {
    savedItems = await prisma.savedProperty.findMany({
      where: { userId: studentUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          include: {
            rooms: { include: { beds: true } },
            landlord: { include: { user: true } },
            collegeLinks: { include: { college: true } },
            reviews: true,
          },
        },
      },
    });
  }

  return <SavedPropertiesClient initialSavedItems={savedItems} />;
}
