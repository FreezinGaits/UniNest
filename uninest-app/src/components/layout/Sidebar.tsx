'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home, Search, Heart, CalendarCheck, Building2, CreditCard, Zap, Wrench,
  ShoppingBag, FileText, AlertTriangle, Phone, User, BedDouble, Users,
  BarChart3, Shield, DollarSign, TrendingUp, Eye, Settings, ClipboardList,
  Star, Truck, GraduationCap, Briefcase, Clock, MapPin, Menu, X,
  ChevronRight, Bell, LogOut, ArrowLeftRight, Play,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Shared';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const roleNavItems: Record<string, NavItem[]> = {
  STUDENT: [
    { label: 'Dashboard', href: '/student/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Find PG', href: '/student/search', icon: <Search className="w-4.5 h-4.5" /> },
    { label: 'Find Roommate', href: '/student/roommates', icon: <Users className="w-4.5 h-4.5" /> },
    { label: 'Onboarding', href: '/onboarding/student', icon: <ClipboardList className="w-4.5 h-4.5" /> },
    { label: 'Saved', href: '/student/saved', icon: <Heart className="w-4.5 h-4.5" /> },
    { label: 'Bookings', href: '/student/bookings', icon: <CalendarCheck className="w-4.5 h-4.5" /> },
    { label: 'My Stay', href: '/student/stay', icon: <Building2 className="w-4.5 h-4.5" /> },
    { label: 'Payments', href: '/student/payments', icon: <CreditCard className="w-4.5 h-4.5" /> },
    { label: 'Electricity', href: '/student/electricity', icon: <Zap className="w-4.5 h-4.5" /> },
    { label: 'Maintenance', href: '/student/maintenance', icon: <Wrench className="w-4.5 h-4.5" /> },
    { label: 'Services', href: '/student/services', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { label: 'Documents', href: '/student/documents', icon: <FileText className="w-4.5 h-4.5" /> },
    { label: 'Disputes', href: '/student/disputes', icon: <AlertTriangle className="w-4.5 h-4.5" /> },
    { label: 'Emergency', href: '/student/emergency', icon: <Phone className="w-4.5 h-4.5" /> },
    { label: 'Profile', href: '/student/profile', icon: <User className="w-4.5 h-4.5" /> },
  ],
  LANDLORD: [
    { label: 'Dashboard', href: '/landlord/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Properties', href: '/landlord/properties', icon: <Building2 className="w-4.5 h-4.5" /> },
    { label: 'Onboarding', href: '/onboarding/landlord', icon: <ClipboardList className="w-4.5 h-4.5" /> },
    { label: 'Beds', href: '/landlord/beds', icon: <BedDouble className="w-4.5 h-4.5" /> },
    { label: 'Bookings', href: '/landlord/bookings', icon: <CalendarCheck className="w-4.5 h-4.5" /> },
    { label: 'Tenants', href: '/landlord/tenants', icon: <Users className="w-4.5 h-4.5" /> },
    { label: 'Rent', href: '/landlord/rent', icon: <CreditCard className="w-4.5 h-4.5" /> },
    { label: 'Electricity', href: '/landlord/electricity', icon: <Zap className="w-4.5 h-4.5" /> },
    { label: 'Maintenance', href: '/landlord/maintenance', icon: <Wrench className="w-4.5 h-4.5" /> },
    { label: 'Compliance', href: '/landlord/compliance', icon: <Shield className="w-4.5 h-4.5" /> },
    { label: 'Disputes', href: '/landlord/disputes', icon: <AlertTriangle className="w-4.5 h-4.5" /> },
    { label: 'Services', href: '/landlord/services', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { label: 'Earnings', href: '/landlord/earnings', icon: <DollarSign className="w-4.5 h-4.5" /> },
    { label: 'Analytics', href: '/landlord/analytics', icon: <BarChart3 className="w-4.5 h-4.5" /> },
    { label: 'Documents', href: '/landlord/documents', icon: <FileText className="w-4.5 h-4.5" /> },
    { label: 'Profile', href: '/landlord/profile', icon: <User className="w-4.5 h-4.5" /> },
  ],
  ADMIN: [
    { label: 'Overview', href: '/admin/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-4.5 h-4.5" /> },
    { label: 'Properties', href: '/admin/properties', icon: <Building2 className="w-4.5 h-4.5" /> },
    { label: 'Verification', href: '/admin/verification', icon: <Shield className="w-4.5 h-4.5" /> },
    { label: 'Bookings', href: '/admin/bookings', icon: <CalendarCheck className="w-4.5 h-4.5" /> },
    { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4.5 h-4.5" /> },
    { label: 'KYC', href: '/admin/kyc', icon: <ClipboardList className="w-4.5 h-4.5" /> },
    { label: 'Tenant Verification', href: '/admin/tenant-verification', icon: <Eye className="w-4.5 h-4.5" /> },
    { label: 'Maintenance', href: '/admin/maintenance', icon: <Wrench className="w-4.5 h-4.5" /> },
    { label: 'Disputes', href: '/admin/disputes', icon: <AlertTriangle className="w-4.5 h-4.5" /> },
    { label: 'Vendors', href: '/admin/vendors', icon: <Truck className="w-4.5 h-4.5" /> },
    { label: 'Services', href: '/admin/services', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-4.5 h-4.5" /> },
    { label: 'Audit Log', href: '/admin/audit-log', icon: <Clock className="w-4.5 h-4.5" /> },
    { label: 'Demo Control', href: '/admin/demo-control', icon: <Play className="w-4.5 h-4.5" /> },
  ],
  COLLEGE: [
    { label: 'Overview', href: '/college/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Onboarding', href: '/onboarding/college', icon: <ClipboardList className="w-4.5 h-4.5" /> },
    { label: 'Students', href: '/college/students', icon: <GraduationCap className="w-4.5 h-4.5" /> },
    { label: 'Off-Campus Housing', href: '/college/housing', icon: <Building2 className="w-4.5 h-4.5" /> },
    { label: 'Near Campus PGs', href: '/college/verified-pgs', icon: <Shield className="w-4.5 h-4.5" /> },
    { label: 'Hostel Overflow', href: '/college/overflow', icon: <MapPin className="w-4.5 h-4.5" /> },
    { label: 'Issues', href: '/college/issues', icon: <AlertTriangle className="w-4.5 h-4.5" /> },
    { label: 'Analytics', href: '/college/analytics', icon: <BarChart3 className="w-4.5 h-4.5" /> },
  ],
  PROVIDER: [
    { label: 'Dashboard', href: '/provider/dashboard', icon: <Home className="w-4.5 h-4.5" /> },
    { label: 'Onboarding', href: '/onboarding/provider', icon: <ClipboardList className="w-4.5 h-4.5" /> },
    { label: 'Jobs', href: '/provider/jobs', icon: <Briefcase className="w-4.5 h-4.5" /> },
    { label: 'Customers', href: '/provider/customers', icon: <Users className="w-4.5 h-4.5" /> },
    { label: 'Availability', href: '/provider/availability', icon: <Clock className="w-4.5 h-4.5" /> },
    { label: 'Services', href: '/provider/services-list', icon: <ShoppingBag className="w-4.5 h-4.5" /> },
    { label: 'Pricing', href: '/provider/pricing', icon: <DollarSign className="w-4.5 h-4.5" /> },
    { label: 'Earnings', href: '/provider/earnings', icon: <TrendingUp className="w-4.5 h-4.5" /> },
    { label: 'Ratings', href: '/provider/ratings', icon: <Star className="w-4.5 h-4.5" /> },
    { label: 'Profile', href: '/provider/profile', icon: <User className="w-4.5 h-4.5" /> },
  ],
};

interface SidebarProps {
  role: string;
  userName: string;
  userEmail: string;
  notificationCount?: number;
  onRoleSwitch?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ role, userName, userEmail, notificationCount = 0, onRoleSwitch, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = roleNavItems[role] || [];

  const roleLabelMap: Record<string, string> = {
    STUDENT: 'Student',
    LANDLORD: 'Landlord',
    ADMIN: 'Admin',
    COLLEGE: 'College',
    PROVIDER: 'Service Provider',
  };

  const roleColorMap: Record<string, string> = {
    STUDENT: 'bg-blue-100 text-blue-700',
    LANDLORD: 'bg-brand-100 text-brand-700',
    ADMIN: 'bg-purple-100 text-purple-700',
    COLLEGE: 'bg-amber-100 text-amber-700',
    PROVIDER: 'bg-cyan-100 text-cyan-700',
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface shadow-card border border-border md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-40',
          'flex flex-col transition-transform duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border flex-shrink-0">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-text-primary">UniNest</span>
            <span className={cn('ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full', roleColorMap[role] || 'bg-gray-100 text-gray-700')}>
              {roleLabelMap[role] || role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                )}
              >
                <span className={cn(isActive && 'text-brand-600')}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3 space-y-2 flex-shrink-0">
          {/* Quick actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onRoleSwitch}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
              title="Switch Role"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Switch Role
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-1.5 rounded-lg text-text-tertiary hover:bg-surface-tertiary hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar name={userName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
              <p className="text-[11px] text-text-tertiary truncate">{userEmail}</p>
            </div>
            {notificationCount > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4 text-text-tertiary" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
