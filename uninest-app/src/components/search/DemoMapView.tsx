'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Navigation,
  ExternalLink,
  Zap,
  Info,
} from 'lucide-react';

interface MapProperty {
  id: string;
  name: string;
  type: string;
  locality?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  computedDistance: number;
  commuteTime?: string;
  minBaseRent: number;
  trueMonthlyCost: number;
  rating: number;
  availBeds: number;
  totalBeds: number;
  images: string[];
  verificationStatus: string;
}

interface DemoMapViewProps {
  properties: MapProperty[];
  selectedCollegeName: string;
  collegeLat: number;
  collegeLng: number;
  radiusKm: number;
}

export default function DemoMapView({
  properties,
  selectedCollegeName,
  collegeLat,
  collegeLng,
  radiusKm,
}: DemoMapViewProps) {
  const [activeProperty, setActiveProperty] = useState<MapProperty | null>(
    properties[0] || null
  );

  // SVG viewport dimensions
  const width = 800;
  const height = 500;
  const cx = width / 2;
  const cy = height / 2;

  // Scale map coordinates around center (college coordinates)
  const scale = 8000; // scale factor for lat/lng to SVG pixels

  const getPos = (lat?: number, lng?: number) => {
    if (!lat || !lng) return { x: cx, y: cy };
    const dx = (lng - collegeLng) * scale;
    const dy = (collegeLat - lat) * scale; // inverted Y axis for SVG
    return {
      x: Math.max(60, Math.min(width - 60, cx + dx)),
      y: Math.max(60, Math.min(height - 60, cy + dy)),
    };
  };

  // Convert radius in km to SVG circle radius pixels
  const radiusPx = (radiusKm / 5) * 160;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-6 shadow-sm relative overflow-hidden">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-sm font-bold text-emerald-700">
            Live Geospatial Map View
          </span>
          <span className="text-xs text-slate-500">
            • Centered on <strong className="text-slate-900">{selectedCollegeName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            {selectedCollegeName}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            PG Property ({properties.length})
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-3 h-3 rounded-full border border-dashed border-emerald-600 inline-block" />
            {radiusKm} km Radius
          </span>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div className="relative w-full h-[460px] bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
        {/* Grid Background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Radius Visualization Circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radiusPx}
            fill="rgba(16, 185, 129, 0.04)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* College Center Marker */}
          <g transform={`translate(${cx}, ${cy})`}>
            <circle r="18" fill="rgba(99, 102, 241, 0.2)" className="animate-pulse" />
            <circle r="10" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
            <text y="-16" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="bold">
              🎓 {selectedCollegeName}
            </text>
          </g>

          {/* Property Markers */}
          {properties.map((p) => {
            const { x, y } = getPos(p.latitude, p.longitude);
            const isSelected = activeProperty?.id === p.id;
            return (
              <g
                key={p.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => setActiveProperty(p)}
                className="cursor-pointer transition-all hover:scale-110"
              >
                {isSelected && (
                  <circle r="22" fill="rgba(16, 185, 129, 0.3)" className="animate-ping" />
                )}
                <circle
                  r={isSelected ? '14' : '10'}
                  fill={isSelected ? '#10b981' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? '10' : '9'}
                  fontWeight="bold"
                >
                  ₹{(p.minBaseRent / 1000).toFixed(1)}k
                </text>
                <text
                  y="-16"
                  textAnchor="middle"
                  fill={isSelected ? '#34d399' : '#cbd5e1'}
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {p.name.split(' ')[0]} ({p.computedDistance}km)
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Property Overlay Summary Card */}
        {activeProperty && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl z-20">
            <div className="flex gap-3">
              <img
                src={activeProperty.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'}
                alt={activeProperty.name}
                className="w-24 h-24 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    VERIFIED
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {activeProperty.locality || 'Ludhiana'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {activeProperty.name}
                </h4>
                <div className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {activeProperty.computedDistance} km
                  </span>
                  <span>•</span>
                  <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {activeProperty.rating}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">True Monthly:</span>
                    <span className="text-sm font-extrabold text-emerald-400 ml-1">
                      ₹{activeProperty.trueMonthlyCost.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <Link
                    href={`/student/search/${activeProperty.id}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    View Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
