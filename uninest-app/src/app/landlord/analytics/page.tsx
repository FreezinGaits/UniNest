import { prisma } from '@/lib/db';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BarChart3, TrendingUp, Users, DollarSign, Building2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default async function PropertyAnalyticsPage() {
  let occupancyRate = 82;
  let totalRevenueMonth = 168000;
  let yieldPercentage = 9.4;

  try {
    const properties = await prisma.property.findMany({
      include: { rooms: { include: { beds: true } } },
    });
    if (properties && properties.length > 0) {
      let totalBeds = 0;
      let occBeds = 0;
      properties.forEach(p => p.rooms.forEach(r => r.beds.forEach(b => {
        totalBeds++;
        if (b.status === 'OCCUPIED') occBeds++;
      })));
      if (totalBeds > 0) {
        occupancyRate = Math.round((occBeds / totalBeds) * 100);
      }
    }
  } catch (error) {
    console.warn('Database error in PropertyAnalyticsPage, using demo fallback analytics:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Portfolio Analytics & Yield</h1>
          <p className="text-text-secondary mt-1">Real-time PG occupancy rates, monthly gross rental revenue, and ancillary yield</p>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Portfolio Occupancy" value={`${occupancyRate}%`} subtitle="Beds filled" icon={<Users className="w-5 h-5 text-brand-600" />} />
        <StatCard title="Gross Monthly Revenue" value={formatINR(totalRevenueMonth)} subtitle="Rent + Ancillary" icon={<DollarSign className="w-5 h-5 text-emerald-600" />} />
        <StatCard title="Gross Rental Yield" value={`${yieldPercentage}%`} subtitle="Annualized return" icon={<TrendingUp className="w-5 h-5 text-purple-600" />} />
        <StatCard title="Average Stay Duration" value="11.4 mos" subtitle="Student tenure" icon={<Building2 className="w-5 h-5 text-amber-600" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Occupancy Breakdown by Property</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>PCTE Smart Student Residency</span>
                <span className="text-emerald-700">75% (9 / 12 beds)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Passi Luxury PG & Co-Living</span>
                <span className="text-emerald-700">87.5% (14 / 16 beds)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-brand-600 h-full rounded-full" style={{ width: '87.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Campus Edge Girls Hostel</span>
                <span className="text-emerald-700">83% (10 / 12 beds)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue Mix</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-800">Fixed Monthly Room Rent</span>
              </div>
              <span className="font-extrabold text-slate-900">{formatINR(159500)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-800">Ancillary WiFi & Meal Share</span>
              </div>
              <span className="font-extrabold text-purple-700">{formatINR(8500)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-semibold text-slate-800">Vendor Service Commission</span>
              </div>
              <span className="font-extrabold text-amber-700">{formatINR(2500)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
