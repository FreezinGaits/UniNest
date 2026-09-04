import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Zap, Plus, ArrowUpRight } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const DEMO_ELECTRICITY_READINGS = [
  {
    id: 'el-1',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Sub-Meter #204)',
    tenant: 'Rahul Sharma',
    previousReading: 1420,
    currentReading: 1560,
    unitsConsumed: 140,
    ratePerUnit: 9.5,
    totalBill: 1330,
    status: 'PAID',
    month: 'August 2026',
  },
  {
    id: 'el-2',
    property: 'Passi Luxury PG & Co-Living',
    room: 'Room 102 (Sub-Meter #102)',
    tenant: 'Aman Verma',
    previousReading: 2100,
    currentReading: 2310,
    unitsConsumed: 210,
    ratePerUnit: 9.5,
    totalBill: 1995,
    status: 'UNPAID',
    month: 'August 2026',
  },
];

export default async function ElectricityMeteringPage() {
  let readings = DEMO_ELECTRICITY_READINGS;

  try {
    const dbReadings = await prisma.maintenanceTicket.findMany({
      where: { category: 'ELECTRICITY' },
      take: 10,
    });
    if (dbReadings && dbReadings.length > 0) {
      readings = dbReadings.map((r: any, idx: number) => ({
        id: r.id,
        property: 'PCTE Smart Student Residency',
        room: `Room ${201 + idx}`,
        tenant: 'Rahul Sharma',
        previousReading: 1400,
        currentReading: 1540,
        unitsConsumed: 140,
        ratePerUnit: 9.5,
        totalBill: 1330,
        status: 'PAID',
        month: 'August 2026',
      }));
    }
  } catch (error) {
    console.warn('Database error in ElectricityMeteringPage, using demo electricity meter log:', error);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Sub-meter Electricity Billing</h1>
          <p className="text-text-secondary mt-1">Log room sub-meter kWh readings, automated bill splitting, and PSPCL rate calculation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
            <Plus className="w-4 h-4 mr-1.5" /> Log Meter Reading
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-amber-50/60 border border-amber-200">
          <p className="text-xs font-bold text-amber-800 uppercase">Tariff Rate</p>
          <p className="text-2xl font-black text-amber-700 mt-1">₹9.50 / kWh</p>
        </Card>
        <Card className="bg-emerald-50/60 border border-emerald-200">
          <p className="text-xs font-bold text-emerald-800 uppercase">Total Units Consumed</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">350 kWh</p>
        </Card>
        <Card className="bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-600 uppercase">Total Utility Billed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{formatINR(3325)}</p>
        </Card>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property & Sub-meter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Prev / Curr Reading</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Units (kWh)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Bill Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {readings.map(el => (
                <tr key={el.id} className="hover:bg-surface-secondary/50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{el.property}</div>
                    <div className="text-xs text-amber-700 font-medium">{el.room}</div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary font-medium">{el.tenant}</td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-slate-600">{el.previousReading} → {el.currentReading}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{el.unitsConsumed} kWh</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">{formatINR(el.totalBill)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={el.status === 'PAID' ? 'success' : 'warning'} size="sm">
                      {el.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
