import { getPlatformUsers } from '@/lib/usersStore';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, ShieldCheck, Building2, GraduationCap, Wrench, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getPlatformUsers();

  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const landlordCount = users.filter((u) => u.role === 'LANDLORD').length;
  const partnerCount = users.filter((u) => u.role === 'PROVIDER' || u.role === 'COLLEGE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">Identity & Role Governance</h1>
            <Badge variant="success" dot>DPDP Act 2023 Compliant</Badge>
          </div>
          <p className="text-text-secondary mt-1">
            Verified directory of students, property owners, campus housing cells, and SLA service vendors ({users.length} active accounts)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Accounts"
          value={users.length}
          subtitle="100% Aadhaar / Institutional verified"
          icon={<Users className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Verified Students"
          value={studentCount}
          subtitle="PCTE, PAU & GNDEC cohorts"
          icon={<GraduationCap className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Escrow Landlords"
          value={landlordCount}
          subtitle="UPI settlement bank linked"
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Campus & SLA Partners"
          value={partnerCount}
          subtitle="QuickFix Services & PCTE Cell"
          icon={<Wrench className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Account Holder</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Official Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Affiliation / Entity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">KYC Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {users.map((u) => {
                const roleVariant =
                  u.role === 'ADMIN'
                    ? 'purple'
                    : u.role === 'LANDLORD'
                    ? 'success'
                    : u.role === 'STUDENT'
                    ? 'info'
                    : u.role === 'COLLEGE'
                    ? 'warning'
                    : 'default';
                return (
                  <tr key={u.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3.5 text-text-secondary font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={roleVariant}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-text-secondary">{u.institution}</td>
                    <td className="px-4 py-3.5 text-text-secondary">{u.phone}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {u.kycStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-text-tertiary text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
