'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { switchRole, logout } from '@/lib/auth/actions';
import { Building2, GraduationCap, Shield, Truck, School } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  userEmail: string;
}

const roleOptions = [
  { role: 'STUDENT', label: 'Student', desc: 'Search PGs, book beds, manage stay', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  { role: 'LANDLORD', label: 'Landlord', desc: 'Manage properties, tenants, earnings', icon: <Building2 className="w-5 h-5" />, color: 'bg-brand-100 text-brand-600' },
  { role: 'ADMIN', label: 'Admin', desc: 'Platform oversight, analytics, audit', icon: <Shield className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
  { role: 'COLLEGE', label: 'College Partner', desc: 'Student housing overview', icon: <School className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
  { role: 'PROVIDER', label: 'Service Provider', desc: 'Jobs, customers, earnings', icon: <Truck className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-600' },
];

export function DashboardShell({ children, role, userName, userEmail }: DashboardShellProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();

  async function handleRoleSwitch(newRole: string) {
    setSwitching(newRole);
    try {
      const result = await switchRole(newRole as 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'COLLEGE' | 'PROVIDER');
      if (result.success) {
        setShowRoleModal(false);
        const roleRoutes: Record<string, string> = {
          STUDENT: '/student/dashboard',
          LANDLORD: '/landlord/dashboard',
          ADMIN: '/admin/dashboard',
          COLLEGE: '/college/dashboard',
          PROVIDER: '/provider/dashboard',
        };
        router.push(roleRoutes[newRole] || '/');
        router.refresh();
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitching(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        onRoleSwitch={() => setShowRoleModal(true)}
        onLogout={handleLogout}
      />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Switch Demo Role"
        description="Switch between different user roles to explore the platform."
        size="md"
      >
        <div className="space-y-2">
          {roleOptions.map(opt => (
            <button
              key={opt.role}
              onClick={() => handleRoleSwitch(opt.role)}
              disabled={switching !== null}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${
                role === opt.role
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-border hover:border-brand-200 hover:bg-surface-secondary'
              } ${switching === opt.role ? 'opacity-60' : ''}`}
            >
              <div className={`p-2.5 rounded-lg ${opt.color}`}>{opt.icon}</div>
              <div className="text-left flex-1">
                <p className="font-semibold text-text-primary text-sm">{opt.label}</p>
                <p className="text-xs text-text-secondary">{opt.desc}</p>
              </div>
              {role === opt.role && (
                <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">Current</span>
              )}
              {switching === opt.role && (
                <span className="text-xs text-text-tertiary">Switching…</span>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-4 text-center">
          Demo mode — role switching is for demonstration purposes only.
        </p>
      </Modal>
    </div>
  );
}
