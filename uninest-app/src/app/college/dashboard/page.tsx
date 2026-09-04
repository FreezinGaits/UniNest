import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth/actions';
import { Card, StatCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Shared';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Building2, BedDouble, Users, MapPin, Shield, AlertTriangle } from 'lucide-react';

export default async function CollegeDashboard() {
  const session = await getSession();
  if (!session) return null;

  const college = await prisma.college.findUnique({ where: { userId: session.userId } });
  
  const totalProperties = await prisma.property.count({ where: { isActive: true, city: college?.city || 'Ludhiana' } });
  const verifiedProperties = await prisma.property.count({ where: { verificationStatus: 'VERIFIED', city: college?.city || 'Ludhiana' } });
  const totalBeds = await prisma.bed.count();
  const availableBeds = await prisma.bed.count({ where: { status: 'AVAILABLE' } });
  const studentsOnPlatform = await prisma.student.count({ where: { collegeId: college?.id } });

  const hostelCapacity = college?.hostelCapacity || 600;
  const totalStudents = college?.totalStudents || 2000;
  const offCampusNeed = totalStudents - hostelCapacity;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{college?.collegeName || 'College'} Dashboard</h1>
        <p className="text-text-secondary mt-1">Off-campus housing overview for your students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents.toLocaleString()} subtitle="Enrolled" icon={<GraduationCap className="w-5 h-5" />} color="brand" />
        <StatCard title="Hostel Capacity" value={hostelCapacity} subtitle={`${offCampusNeed.toLocaleString()} need off-campus`} icon={<Building2 className="w-5 h-5" />} color="blue" />
        <StatCard title="Verified PGs Nearby" value={verifiedProperties} subtitle={`of ${totalProperties} total`} icon={<Shield className="w-5 h-5" />} color="purple" />
        <StatCard title="Students on UniNest" value={studentsOnPlatform} subtitle="Using the platform" icon={<Users className="w-5 h-5" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Housing Overview</h2>
          <div className="space-y-4">
            <ProgressBar value={hostelCapacity} max={totalStudents} label="Hostel Coverage" color="blue" />
            <ProgressBar value={studentsOnPlatform} max={offCampusNeed} label="UniNest Adoption" color="brand" />
            <ProgressBar value={availableBeds} max={totalBeds} label="Available Beds Nearby" color="amber" />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Off-Campus Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{availableBeds}</p>
              <p className="text-xs text-text-secondary mt-1">Available Beds</p>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{totalProperties}</p>
              <p className="text-xs text-text-secondary mt-1">PGs in Area</p>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">{verifiedProperties}</p>
              <p className="text-xs text-text-secondary mt-1">Verified PGs</p>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-text-primary">{offCampusNeed.toLocaleString()}</p>
              <p className="text-xs text-text-secondary mt-1">Off-Campus Need</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
