'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  Users,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  BedDouble,
  Layers,
} from 'lucide-react';

interface OverflowStudent {
  id: string;
  waitlistRank: number;
  rollNo: string;
  name: string;
  program: string;
  gender: 'Male' | 'Female';
  homeTown: string;
  preferredCorridor: string;
  allocatedPg: string | null;
}

interface PartnerPGPool {
  id: string;
  name: string;
  gender: 'Boys' | 'Girls';
  distance: string;
  reservedEscrowBeds: number;
  allocatedCount: number;
  monthlyRentPaise: number;
  landlord: string;
}

const INITIAL_WAITLIST: OverflowStudent[] = [
  {
    id: 'ov-1',
    waitlistRank: 1,
    rollNo: 'PCTE-CSE-2026-201',
    name: 'Arshdeep Singh Mann',
    program: 'B.Tech CSE (1st Yr)',
    gender: 'Male',
    homeTown: 'Bathinda, Punjab',
    preferredCorridor: 'Baddowal / Gate 1',
    allocatedPg: null,
  },
  {
    id: 'ov-2',
    waitlistRank: 2,
    rollNo: 'PCTE-CSE-2026-208',
    name: 'Prabhjot Singh Sidhu',
    program: 'B.Tech CSE (1st Yr)',
    gender: 'Male',
    homeTown: 'Moga, Punjab',
    preferredCorridor: 'Baddowal / Gate 1',
    allocatedPg: null,
  },
  {
    id: 'ov-3',
    waitlistRank: 3,
    rollNo: 'PCTE-MBA-2026-088',
    name: 'Harleen Kaur Bajwa',
    program: 'MBA International Business (1st Yr)',
    gender: 'Female',
    homeTown: 'Jalandhar, Punjab',
    preferredCorridor: 'Sarabha Link Corridor',
    allocatedPg: null,
  },
  {
    id: 'ov-4',
    waitlistRank: 4,
    rollNo: 'PCTE-BPH-2026-054',
    name: 'Gurkiran Kaur Dhillon',
    program: 'B.Pharm (1st Yr)',
    gender: 'Female',
    homeTown: 'Patiala, Punjab',
    preferredCorridor: 'Sarabha Link Corridor',
    allocatedPg: null,
  },
  {
    id: 'ov-5',
    waitlistRank: 5,
    rollNo: 'PCTE-BBA-2026-119',
    name: 'Yuvraj Sharma',
    program: 'BBA (1st Yr)',
    gender: 'Male',
    homeTown: 'Karnal, Haryana',
    preferredCorridor: 'Passi Nagar',
    allocatedPg: null,
  },
  {
    id: 'ov-6',
    waitlistRank: 6,
    rollNo: 'PCTE-BCA-2026-092',
    name: 'Damanpreet Singh',
    program: 'BCA (1st Yr)',
    gender: 'Male',
    homeTown: 'Sangrur, Punjab',
    preferredCorridor: 'Passi Nagar',
    allocatedPg: null,
  },
];

const INITIAL_PARTNER_POOLS: PartnerPGPool[] = [
  {
    id: 'pool-1',
    name: 'PCTE Smart Student Residency',
    gender: 'Boys',
    distance: '0.3 km from Gate 1',
    reservedEscrowBeds: 15,
    allocatedCount: 7,
    monthlyRentPaise: 600000,
    landlord: 'Vikram Singh',
  },
  {
    id: 'pool-2',
    name: 'Passi Nagar Scholars Nest',
    gender: 'Boys',
    distance: '0.6 km from Gate 1',
    reservedEscrowBeds: 12,
    allocatedCount: 6,
    monthlyRentPaise: 580000,
    landlord: 'Vikram Singh',
  },
  {
    id: 'pool-3',
    name: 'Sarabha Link Girls Enclave',
    gender: 'Girls',
    distance: '2.1 km from Gate 1',
    reservedEscrowBeds: 14,
    allocatedCount: 7,
    monthlyRentPaise: 650000,
    landlord: 'Gurpreet Kaur',
  },
];

export default function HostelOverflowPage() {
  const [waitlist, setWaitlist] = useState<OverflowStudent[]>(INITIAL_WAITLIST);
  const [partnerPools, setPartnerPools] = useState<PartnerPGPool[]>(INITIAL_PARTNER_POOLS);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['ov-1', 'ov-2']);
  const [targetPgName, setTargetPgName] = useState<string>('PCTE Smart Student Residency');
  const [allocationAlert, setAllocationAlert] = useState<string | null>(null);

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchAllocate = () => {
    if (selectedStudentIds.length === 0) return;

    const count = selectedStudentIds.length;
    setWaitlist((prev) =>
      prev.map((student) =>
        selectedStudentIds.includes(student.id)
          ? { ...student, allocatedPg: targetPgName }
          : student
      )
    );

    setPartnerPools((prev) =>
      prev.map((pool) =>
        pool.name === targetPgName
          ? {
              ...pool,
              allocatedCount: Math.min(pool.reservedEscrowBeds, pool.allocatedCount + count),
            }
          : pool
      )
    );

    setAllocationAlert(
      `Allocated ${count} waitlisted student(s) to ${targetPgName} under the 15% Advance Semester Escrow Block.`
    );
    setSelectedStudentIds([]);
  };

  const unallocatedRemaining = 38 - waitlist.filter((s) => s.allocatedPg !== null).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="warning" size="sm">
              15% Advance Semester Escrow Block Active
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Campus Hostel Overflow &amp; Batch Allotment
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology (Ludhiana) • Automated Spillover Routing from Campus Hostels to Approved Partner PGs
          </p>
        </div>
        <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <BedDouble className="w-6 h-6 text-red-600" />
          <div>
            <p className="text-xs font-medium text-red-700">On-Campus Hostel Status</p>
            <p className="text-sm font-bold text-red-900">600 / 600 Beds — 100% Full</p>
          </div>
        </div>
      </div>

      {/* Allocation Confirmation Alert */}
      {allocationAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{allocationAlert}</span>
          </div>
          <button
            onClick={() => setAllocationAlert(null)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Campus Hostel Capacity"
          value="600 / 600 Beds"
          subtitle="100% Full (Boys & Girls Wing)"
          icon={<Building2 className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Active Overflow Waitlist"
          value={`${unallocatedRemaining} Incoming 1st-Year Students`}
          subtitle="Priority outstation admissions"
          icon={<Users className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="15% Partner Escrow Quota"
          value="41 Reserved Beds"
          subtitle="Locked across 3 partner PGs"
          icon={<Lock className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Pre-Agreed Institutional Tariff"
          value={formatINR(600000)}
          subtitle="Zero brokerage • 48-hr escrow protection"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Partner PG 15% Advance Semester Escrow Pools */}
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" />
          Partner PGs Under 15% Advance Semester Escrow Block
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {partnerPools.map((pool) => {
            const freeQuota = pool.reservedEscrowBeds - pool.allocatedCount;
            const pct = Math.round((pool.allocatedCount / pool.reservedEscrowBeds) * 100);
            return (
              <Card
                key={pool.id}
                padding="md"
                className={`border-2 transition-colors ${
                  targetPgName === pool.name ? 'border-brand-600' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{pool.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {pool.distance} • Landlord: {pool.landlord}
                    </p>
                  </div>
                  <Badge variant={pool.gender === 'Girls' ? 'purple' : 'info'} size="sm">
                    {pool.gender}
                  </Badge>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Escrow Block Utilization</span>
                    <span className="font-bold text-text-primary">
                      {pool.allocatedCount} / {pool.reservedEscrowBeds} Beds ({freeQuota} Open)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-light flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-700">
                    {formatINR(pool.monthlyRentPaise)}/mo
                  </span>
                  <button
                    onClick={() => setTargetPgName(pool.name)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                      targetPgName === pool.name
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                    }`}
                  >
                    {targetPgName === pool.name ? 'Selected Target PG' : 'Select for Batch'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Batch Allocation Action Bar & Waitlist Table */}
      <Card padding="none">
        <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-secondary/50">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Incoming 1st-Year Hostel Overflow Waitlist Queue
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Select waitlisted students below and assign them directly to a verified partner PG under PCTE’s 15% Advance Semester Escrow Block.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={targetPgName}
              onChange={(e) => setTargetPgName(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {partnerPools.map((pool) => (
                <option key={pool.id} value={pool.name}>
                  Target: {pool.name} ({pool.gender})
                </option>
              ))}
            </select>

            <button
              onClick={handleBatchAllocate}
              disabled={selectedStudentIds.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                selectedStudentIds.length > 0
                  ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Allocate Selected Students to Partner PG ({selectedStudentIds.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase w-10">
                  Select
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Waitlist #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Student &amp; Roll No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Program &amp; Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Hometown &amp; Preference
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                  Escrow Allotment Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {waitlist.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const isAllocated = student.allocatedPg !== null;

                return (
                  <tr
                    key={student.id}
                    className={`transition-colors ${
                      isAllocated
                        ? 'bg-emerald-50/30'
                        : isSelected
                        ? 'bg-brand-50/40'
                        : 'hover:bg-surface-secondary/50'
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        disabled={isAllocated}
                        checked={isSelected}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-text-secondary">
                      #WL-{String(student.waitlistRank).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-text-primary">{student.name}</div>
                      <div className="text-xs font-mono text-brand-600">{student.rollNo}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-text-primary">{student.program}</div>
                      <Badge
                        variant={student.gender === 'Female' ? 'purple' : 'info'}
                        size="sm"
                        className="mt-1"
                      >
                        {student.gender}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs font-medium text-text-primary">{student.homeTown}</div>
                      <div className="text-xs text-text-tertiary">
                        Prefers: {student.preferredCorridor}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {student.allocatedPg ? (
                        <div className="space-y-1">
                          <Badge variant="success" size="sm" dot>
                            ALLOCATED: {student.allocatedPg}
                          </Badge>
                          <div className="text-[11px] text-emerald-700 font-medium">
                            15% Advance Semester Escrow Block Locked
                          </div>
                        </div>
                      ) : (
                        <Badge variant="warning" size="sm" dot>
                          AWAITING BATCH ALLOTMENT
                        </Badge>
                      )}
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
