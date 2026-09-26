'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  MapPin,
  Building2,
  Users,
  ShieldCheck,
  Navigation,
  PhoneCall,
  Lock,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface HousingCluster {
  id: string;
  name: string;
  corridor: string;
  distanceGate1: string;
  distanceGate2: string;
  verifiedPGs: number;
  totalBeds: number;
  occupiedBeds: number;
  avgMonthlyRentPaise: number;
  activeEscrowHolds: number;
  wardenOfficer: string;
  wardenPhone: string;
  patrolBeatTime: string;
  highlightPgs: string[];
}

const CLUSTERS: HousingCluster[] = [
  {
    id: 'clu-baddowal',
    name: 'Baddowal & Ferozepur Road Corridor',
    corridor: 'NH-5 Immediate Campus Belt',
    distanceGate1: '0.3 km from Gate 1',
    distanceGate2: '0.2 km from Gate 2 (Campus-2)',
    verifiedPGs: 12,
    totalBeds: 520,
    occupiedBeds: 468,
    avgMonthlyRentPaise: 600000,
    activeEscrowHolds: 16,
    wardenOfficer: 'Prof. Harpreet Singh Dhillon (Chief Warden)',
    wardenPhone: '+91 98141 77210',
    patrolBeatTime: 'Night Patrol: 09:00 PM & 11:00 PM',
    highlightPgs: ['PCTE Smart Student Residency', 'Baddowal Green View Boys Hostel'],
  },
  {
    id: 'clu-passi',
    name: 'Passi Nagar Academic Enclave',
    corridor: 'Pakhowal–Ferozepur Link Sector',
    distanceGate1: '0.6 km from Gate 1',
    distanceGate2: '0.9 km from Gate 2',
    verifiedPGs: 9,
    totalBeds: 380,
    occupiedBeds: 334,
    avgMonthlyRentPaise: 580000,
    activeEscrowHolds: 11,
    wardenOfficer: 'Dr. Manpreet Singh Gill (Warden — Boys)',
    wardenPhone: '+91 98724 61900',
    patrolBeatTime: 'Night Patrol: 09:30 PM',
    highlightPgs: ['Passi Nagar Scholars Nest', 'Passi Executive Boys Residency'],
  },
  {
    id: 'clu-sarabha',
    name: 'Sarabha Nagar Link & Canal Enclave',
    corridor: 'Dedicated Girls Safe Corridor',
    distanceGate1: '2.1 km from Gate 1',
    distanceGate2: '2.4 km from Gate 2',
    verifiedPGs: 8,
    totalBeds: 340,
    occupiedBeds: 298,
    avgMonthlyRentPaise: 650000,
    activeEscrowHolds: 8,
    wardenOfficer: 'Prof. Amandeep Kaur Grewal (Warden — Girls)',
    wardenPhone: '+91 98155 88320',
    patrolBeatTime: 'Lady Warden Inspection: 08:30 PM',
    highlightPgs: ['Sarabha Link Girls Enclave', 'Canal View Girls Scholar Home'],
  },
  {
    id: 'clu-brs',
    name: 'BRS Nagar (Bhai Randhir Singh Nagar)',
    corridor: 'Block D, E & H Residential Belt',
    distanceGate1: '1.8 km from Gate 1',
    distanceGate2: '2.0 km from Gate 2',
    verifiedPGs: 7,
    totalBeds: 290,
    occupiedBeds: 215,
    avgMonthlyRentPaise: 620000,
    activeEscrowHolds: 5,
    wardenOfficer: 'Mr. Gurtej Singh Brar (Estate Security Officer)',
    wardenPhone: '+91 98551 40912',
    patrolBeatTime: 'Evening Beat: 08:45 PM',
    highlightPgs: ['BRS Nagar Student Villa', 'Block-E Scholars Co-Living'],
  },
  {
    id: 'clu-model',
    name: 'Model Town & Jawaddi Transit Zone',
    corridor: 'PG & Independent Studio Cluster',
    distanceGate1: '3.4 km from Gate 1',
    distanceGate2: '3.8 km from Gate 2',
    verifiedPGs: 4,
    totalBeds: 150,
    occupiedBeds: 105,
    avgMonthlyRentPaise: 640000,
    activeEscrowHolds: 2,
    wardenOfficer: 'Mr. Kuldeep Singh Sekhon (Transport & Nodal Officer)',
    wardenPhone: '+91 98149 22105',
    patrolBeatTime: 'Shuttle Sync & Biometric Audit: 09:15 PM',
    highlightPgs: ['Model Town Executive Student PG'],
  },
];

export default function OffCampusHousingClustersPage() {
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [dispatchedClusterId, setDispatchedClusterId] = useState<string | null>(null);

  const visibleClusters =
    selectedCorridor === 'ALL'
      ? CLUSTERS
      : CLUSTERS.filter((c) => c.id === selectedCorridor);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="info" size="sm">
              Ludhiana West &amp; Ferozepur Road Zones
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Off-Campus Housing Clusters &amp; Allocation
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology (Ludhiana) • Mapped Locality Clusters, Bed Availability &amp; Warden Patrol Beats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" dot>
            5 Active Ludhiana Micro-Clusters
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Off-Campus Students"
          value="1,800"
          subtitle="Enrolled across PCTE Campus 1 & 2"
          icon={<Users className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Registered in Verified PGs"
          value="1,420 — 78.9%"
          subtitle="380 in private parent-arranged flats"
          icon={<ShieldCheck className="w-5 h-5" />}
          trend={{ value: '14.2% vs last semester', positive: true }}
          color="blue"
        />
        <StatCard
          title="Average Monthly Rent"
          value={formatINR(615000)}
          subtitle="Includes verified sub-meter tariff cap"
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Active Escrow Holds"
          value="42"
          subtitle="48-Hr Move-In Protection active"
          icon={<Lock className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Cluster Filter Bar */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filter Ludhiana Locality Cluster:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCorridor('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCorridor === 'ALL'
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              All Clusters (5)
            </button>
            {CLUSTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCorridor(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCorridor === c.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary'
                }`}
              >
                {c.name.split(' ')[0]} {c.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Locality Cluster Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {visibleClusters.map((cluster) => {
          const occupancyPct = Math.round((cluster.occupiedBeds / cluster.totalBeds) * 100);
          const availableBeds = cluster.totalBeds - cluster.occupiedBeds;

          return (
            <Card key={cluster.id} padding="lg" className="flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                      <h3 className="text-lg font-bold text-text-primary">{cluster.name}</h3>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{cluster.corridor}</p>
                  </div>
                  <Badge variant={availableBeds > 30 ? 'success' : 'warning'} size="sm" dot>
                    {availableBeds} Beds Open
                  </Badge>
                </div>

                {/* Distance Pills */}
                <div className="grid grid-cols-2 gap-2.5 bg-surface-secondary p-3 rounded-xl border border-border-light">
                  <div className="flex items-center gap-2 text-xs">
                    <Navigation className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <div>
                      <span className="text-text-tertiary block">PCTE Gate 1</span>
                      <span className="font-semibold text-text-primary">{cluster.distanceGate1}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <div>
                      <span className="text-text-tertiary block">PCTE Gate 2</span>
                      <span className="font-semibold text-text-primary">{cluster.distanceGate2}</span>
                    </div>
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-secondary">
                      Cluster Bed Occupancy ({cluster.occupiedBeds} / {cluster.totalBeds} Beds)
                    </span>
                    <span className="font-bold text-brand-600">{occupancyPct}% Occupied</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyPct > 88 ? 'bg-amber-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-light">
                    <p className="text-[11px] text-text-tertiary">Verified PGs</p>
                    <p className="text-sm font-bold text-text-primary">{cluster.verifiedPGs} Properties</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-light">
                    <p className="text-[11px] text-text-tertiary">Avg Monthly Rent</p>
                    <p className="text-sm font-bold text-text-primary">
                      {formatINR(cluster.avgMonthlyRentPaise)}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-secondary border border-border-light">
                    <p className="text-[11px] text-text-tertiary">Escrow Holds</p>
                    <p className="text-sm font-bold text-amber-700">{cluster.activeEscrowHolds} Active</p>
                  </div>
                </div>

                {/* Assigned College Warden Patrol Officer */}
                <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-800">
                      Assigned College Warden Patrol Officer
                    </span>
                    <Badge variant="info" size="sm">
                      {cluster.patrolBeatTime}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{cluster.wardenOfficer}</p>
                  <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                    <span className="flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                      {cluster.wardenPhone}
                    </span>
                    <span>Primary PGs: {cluster.highlightPgs.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-3 border-t border-border-light flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  100% Form-11 &amp; CCTV Linked to PCTE Control Room
                </span>
                {dispatchedClusterId === cluster.id ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Patrol Log Pinged
                  </span>
                ) : (
                  <button
                    onClick={() => setDispatchedClusterId(cluster.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-secondary hover:bg-brand-600 hover:text-white text-text-primary border border-border transition-colors"
                  >
                    Ping Warden Beat Status
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
