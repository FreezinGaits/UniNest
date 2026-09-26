'use client';

import React, { useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatINR } from '@/lib/utils';
import {
  ShieldCheck,
  Building2,
  Flame,
  Video,
  Fingerprint,
  FileCheck2,
  MapPin,
  Award,
  CalendarCheck,
  CheckCircle2,
  User,
} from 'lucide-react';

interface VerifiedPGProperty {
  id: string;
  name: string;
  locality: string;
  landlord: string;
  landlordPhone: string;
  distanceFromCampus: string;
  genderCategory: 'Boys' | 'Girls' | 'Co-Ed';
  totalBeds: number;
  availableBeds: number;
  monthlyRentPaise: number;
  fireSafetyNoc: 'VALID';
  cctvFeed: 'ONLINE';
  biometricEntry: 'ACTIVE';
  form11Compliance: '100%';
  sealEndorsed: boolean;
  sealValidUntil: string;
  inspectionScheduled: string | null;
}

const INITIAL_PROPERTIES: VerifiedPGProperty[] = [
  {
    id: 'pg-1',
    name: 'PCTE Smart Student Residency',
    locality: 'Ferozepur Road, Near PCTE Gate 1, Baddowal',
    landlord: 'Vikram Singh',
    landlordPhone: '+91 98140 11223',
    distanceFromCampus: '0.3 km',
    genderCategory: 'Boys',
    totalBeds: 96,
    availableBeds: 8,
    monthlyRentPaise: 600000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: true,
    sealValidUntil: '31 Jul 2027',
    inspectionScheduled: null,
  },
  {
    id: 'pg-2',
    name: 'Passi Nagar Scholars Nest',
    locality: 'Lane 4, Passi Nagar, Ludhiana',
    landlord: 'Vikram Singh',
    landlordPhone: '+91 98140 11223',
    distanceFromCampus: '0.6 km',
    genderCategory: 'Boys',
    totalBeds: 72,
    availableBeds: 6,
    monthlyRentPaise: 580000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: true,
    sealValidUntil: '31 Jul 2027',
    inspectionScheduled: null,
  },
  {
    id: 'pg-3',
    name: 'Sarabha Link Girls Enclave',
    locality: 'Sarabha Nagar Extension Link Road, Ludhiana',
    landlord: 'Gurpreet Kaur',
    landlordPhone: '+91 98722 90871',
    distanceFromCampus: '2.1 km',
    genderCategory: 'Girls',
    totalBeds: 84,
    availableBeds: 7,
    monthlyRentPaise: 650000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: true,
    sealValidUntil: '31 Jul 2027',
    inspectionScheduled: null,
  },
  {
    id: 'pg-4',
    name: 'BRS Nagar Student Villa',
    locality: 'Block E, Bhai Randhir Singh Nagar, Ludhiana',
    landlord: 'Harjinder Sidhu',
    landlordPhone: '+91 94170 55412',
    distanceFromCampus: '1.8 km',
    genderCategory: 'Girls',
    totalBeds: 60,
    availableBeds: 9,
    monthlyRentPaise: 620000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: false,
    sealValidUntil: 'Renewal Due',
    inspectionScheduled: null,
  },
  {
    id: 'pg-5',
    name: 'Baddowal Green View Boys Hostel',
    locality: 'Opposite Baddowal Cantt Railway Crossing, NH-5',
    landlord: 'Balwinder Grewal',
    landlordPhone: '+91 98152 67890',
    distanceFromCampus: '0.5 km',
    genderCategory: 'Boys',
    totalBeds: 110,
    availableBeds: 12,
    monthlyRentPaise: 540000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: false,
    sealValidUntil: 'Renewal Due',
    inspectionScheduled: null,
  },
  {
    id: 'pg-6',
    name: 'Model Town Executive Student PG',
    locality: 'Near Model Town Gol Market, Ludhiana',
    landlord: 'Manmohan Arora',
    landlordPhone: '+91 98550 33190',
    distanceFromCampus: '3.4 km',
    genderCategory: 'Co-Ed',
    totalBeds: 54,
    availableBeds: 5,
    monthlyRentPaise: 640000,
    fireSafetyNoc: 'VALID',
    cctvFeed: 'ONLINE',
    biometricEntry: 'ACTIVE',
    form11Compliance: '100%',
    sealEndorsed: true,
    sealValidUntil: '31 Jul 2027',
    inspectionScheduled: null,
  },
];

export default function VerifiedPGsPage() {
  const [properties, setProperties] = useState<VerifiedPGProperty[]>(INITIAL_PROPERTIES);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const handleRenewSeal = (id: string, name: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              sealEndorsed: true,
              sealValidUntil: '31 Jul 2027 (Renewed)',
            }
          : p
      )
    );
    setBannerNotice(
      `Institutional Endorsement Seal issued/renewed for "${name}" by PCTE Housing Cell (pcte@uninest.in).`
    );
  };

  const handleScheduleInspection = (id: string, name: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              inspectionScheduled: 'Scheduled: Tomorrow 04:30 PM (Chief Warden Squad)',
            }
          : p
      )
    );
    setBannerNotice(`Warden Physical Safety Audit scheduled for "${name}". Landlord notified via SMS.`);
  };

  const totalBeds = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const totalAvailable = properties.reduce((acc, p) => acc + p.availableBeds, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" size="sm" dot>
              PCTE Housing Cell • pcte@uninest.in
            </Badge>
            <Badge variant="success" size="sm">
              100% Punjab Police Form-11 Audited
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Near Campus Approved PGs &amp; Safety Audit Registry
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            PCTE Institute of Technology (Ludhiana) • Institutional Endorsement Seal, Fire NOC, CCTV &amp; Biometric Registry
          </p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl flex items-center gap-2.5 border border-brand-200">
          <ShieldCheck className="w-6 h-6 text-brand-600" />
          <div>
            <p className="text-xs font-medium text-brand-700">Approved Partner Residences</p>
            <p className="text-sm font-bold text-brand-900">6 Audited Properties</p>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {bannerNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-xs text-emerald-700 underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Approved Partner PGs"
          value={properties.length}
          subtitle="Within 0.3 km – 3.4 km of PCTE"
          icon={<Building2 className="w-5 h-5" />}
          color="brand"
        />
        <StatCard
          title="Audited Bed Capacity"
          value={`${totalBeds} Beds`}
          subtitle={`${totalAvailable} Beds currently open`}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Fire NOC & CCTV Feed"
          value="100% VALID"
          subtitle="24x7 RTSP stream to PCTE Security"
          icon={<Flame className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Police Form-11 Compliance"
          value="100%"
          subtitle="PS Sadar & PS Sarabha Nagar verified"
          icon={<FileCheck2 className="w-5 h-5" />}
          color="brand"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {properties.map((pg) => (
          <Card key={pg.id} padding="lg" className="flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Property Title & Seal */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-text-primary">{pg.name}</h3>
                    <Badge
                      variant={
                        pg.genderCategory === 'Girls'
                          ? 'purple'
                          : pg.genderCategory === 'Boys'
                          ? 'info'
                          : 'default'
                      }
                      size="sm"
                    >
                      {pg.genderCategory} PG
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    {pg.locality} • <strong className="text-text-primary">{pg.distanceFromCampus} from PCTE Campus</strong>
                  </p>
                </div>
                <Badge variant={pg.sealEndorsed ? 'success' : 'warning'} size="sm" dot>
                  {pg.sealEndorsed ? `Endorsed (${pg.sealValidUntil})` : 'Seal Renewal Due'}
                </Badge>
              </div>

              {/* Landlord & Capacity Info */}
              <div className="grid grid-cols-3 gap-3 bg-surface-secondary p-3.5 rounded-xl border border-border-light">
                <div>
                  <p className="text-[11px] text-text-tertiary flex items-center gap-1">
                    <User className="w-3 h-3" /> Landlord
                  </p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{pg.landlord}</p>
                  <p className="text-[11px] text-text-tertiary">{pg.landlordPhone}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-tertiary">Total &amp; Available Beds</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">
                    {pg.totalBeds} Total •{' '}
                    <span className="text-emerald-600 font-bold">{pg.availableBeds} Open</span>
                  </p>
                  <p className="text-[11px] text-text-tertiary">15% Escrow Partner</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-tertiary">Approved Monthly Tariff</p>
                  <p className="text-sm font-bold text-brand-600 mt-0.5">
                    {formatINR(pg.monthlyRentPaise)}/mo
                  </p>
                  <p className="text-[11px] text-text-tertiary">Zero Hidden Charges</p>
                </div>
              </div>

              {/* 4 Mandatory Institutional Safety Audit Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-emerald-800">Fire Safety NOC</p>
                    <p className="text-xs font-bold text-emerald-700">{pg.fireSafetyNoc}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-blue-800">CCTV 24x7 Feed</p>
                    <p className="text-xs font-bold text-blue-700">{pg.cctvFeed}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-purple-800">Biometric Entry</p>
                    <p className="text-xs font-bold text-purple-700">{pg.biometricEntry}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-emerald-800">Police Form-11</p>
                    <p className="text-xs font-bold text-emerald-700">{pg.form11Compliance}</p>
                  </div>
                </div>
              </div>

              {pg.inspectionScheduled && (
                <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{pg.inspectionScheduled}</span>
                </div>
              )}
            </div>

            {/* Interactive Institutional Controls */}
            <div className="pt-3 border-t border-border-light flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => handleRenewSeal(pg.id, pg.name)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                Issue / Renew Institutional Endorsement Seal
              </button>

              <button
                onClick={() => handleScheduleInspection(pg.id, pg.name)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface-secondary hover:bg-surface-tertiary text-text-primary border border-border transition-colors"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-brand-600" />
                Schedule Warden Inspection
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
