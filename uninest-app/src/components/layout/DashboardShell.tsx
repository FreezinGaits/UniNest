'use client';

import React, { useState, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { switchRole, logout } from '@/lib/auth/actions';
import { Building2, GraduationCap } from 'lucide-react';

const DEMO_EMAIL_SET = new Set([
  'rahul@uninest.demo',
  'rahul@uninest.in',
  'rahul.sharma@pcte.edu.in',
  'landlord@uninest.demo',
  'landlord@uninest.in',
  'vikram@passiresidency.in',
  'admin@uninest.demo',
  'admin@uninest.in',
  'nodal.escrow@uninest.in',
  'pcte@uninest.demo',
  'college@uninest.demo',
  'pcte@uninest.in',
  'housing.cell@pcte.edu.in',
  'provider@uninest.demo',
  'provider@uninest.in',
  'dispatch@quickfix.in',
]);

export function isDemoAccountEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  return clean.endsWith('@uninest.demo') || DEMO_EMAIL_SET.has(clean);
}

export interface DashboardUserContextValue {
  role: string;
  userName: string;
  userEmail: string;
  isDemoUser: boolean;
}

const DashboardUserContext = createContext<DashboardUserContextValue>({
  role: 'STUDENT',
  userName: 'Student',
  userEmail: '',
  isDemoUser: false,
});

export function useDashboardUser(): DashboardUserContextValue {
  return useContext(DashboardUserContext);
}

interface DashboardShellProps {
  children: React.ReactNode;
  role: string;
  userName: string;
  userEmail: string;
}

const roleOptions = [
  { role: 'STUDENT', label: 'Student', desc: 'Search PGs, book beds, manage stay', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  { role: 'LANDLORD', label: 'Landlord', desc: 'Manage properties, tenants, earnings', icon: <Building2 className="w-5 h-5" />, color: 'bg-brand-100 text-brand-600' },
];

export function DashboardShell({ children, role, userName, userEmail }: DashboardShellProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const router = useRouter();
  const userRole = role;
  const canSwitchRole = userRole === 'STUDENT' || userRole === 'LANDLORD';
  const isDemoUser = isDemoAccountEmail(userEmail);

  async function handleRoleSwitch(newRole: string) {
    if (!canSwitchRole) return;
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
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitching(null);
    }
  }

  async function handleLogout() {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
    } catch {}
    // Trigger server cookie clearance in background without blocking UI
    logout().catch(() => {});
    window.location.href = '/login';
  }

  return (
    <DashboardUserContext.Provider value={{ role, userName, userEmail, isDemoUser }}>
      <div className="min-h-screen">
        <Sidebar
          role={role}
          userName={userName}
          userEmail={userEmail}
          onRoleSwitch={canSwitchRole ? () => setShowRoleModal(true) : undefined}
          onLogout={handleLogout}
        />

        <main className="md:ml-64 min-h-screen pt-16 pb-24 md:pt-0 md:pb-0">
          {canSwitchRole && (
            <div className="hidden md:flex items-center justify-end px-6 lg:px-8 pt-4">
              <Button
                variant="outline"
                size="sm"
                loading={switching !== null}
                onClick={() => handleRoleSwitch(userRole === 'STUDENT' ? 'LANDLORD' : 'STUDENT')}
                className="text-xs font-semibold"
              >
                {userRole === 'STUDENT' ? (
                  <Building2 className="w-3.5 h-3.5 mr-1.5" />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                )}
                {userRole === 'STUDENT' ? 'Switch to Landlord' : 'Switch to Student'}
              </Button>
            </div>
          )}
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {canSwitchRole && (
          <Modal
            isOpen={showRoleModal}
            onClose={() => setShowRoleModal(false)}
            title="Switch Workspace Portal"
            description="Switch between your authorized UniNest portals."
            size="md"
          >
            <div className="space-y-2">
              {roleOptions.map((opt) => (
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
                    <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">Active</span>
                  )}
                  {switching === opt.role && (
                    <span className="text-xs text-text-tertiary">Switching…</span>
                  )}
                </button>
              ))}
            </div>
          </Modal>
        )}
      </div>
    </DashboardUserContext.Provider>
  );
}
