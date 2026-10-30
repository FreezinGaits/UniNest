'use client';

import React from 'react';
import { Building2, Sparkles, Shield, Zap, MapPin, CheckCircle2 } from 'lucide-react';

export function CampusBuildingsIllustration() {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-emerald-500/25 bg-gradient-to-b from-slate-950/90 via-emerald-950/40 to-slate-950/90 backdrop-blur-md shadow-2xl p-4 sm:p-5 group">
      {/* Top Header Strip inside the architectural frame */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide block leading-none">
              Verified Campus Living
            </span>
            <span className="text-[10px] text-emerald-300/80 font-mono">
              PCTE • PAU • GNDEC Hubs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Architecture &amp; Security</span>
        </div>
      </div>

      {/* Modern Architectural Buildings SVG Canvas */}
      <div className="relative w-full aspect-[16/9] min-h-[220px] max-h-[300px] flex items-center justify-center">
        <svg
          viewBox="0 0 680 340"
          className="w-full h-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="skyAmbient" cx="50%" cy="100%" r="80%">
              <stop offset="0%" stopColor="#047857" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#064e3b" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="towerGradCenter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="25%" stopColor="#065f46" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            <linearGradient id="towerGradLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="60%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>

            <linearGradient id="towerGradRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="windowWarmGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <linearGradient id="windowEmeraldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <linearGradient id="windowCyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>

            <linearGradient id="solarPanelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#022c22" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            <radialGradient id="lampCone" cx="50%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#fde047" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="beaconPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Sky Glow */}
          <rect x="0" y="0" width="680" height="340" fill="url(#skyAmbient)" />

          {/* Stars / Twinkling Campus Night Sky Lights */}
          <g opacity="0.6">
            <circle cx="55" cy="45" r="1" fill="#fff" opacity="0.8" />
            <circle cx="120" cy="25" r="1.5" fill="#a7f3d0" opacity="0.9" />
            <circle cx="180" cy="60" r="1" fill="#fff" opacity="0.6" />
            <circle cx="270" cy="20" r="1.5" fill="#fde047" opacity="0.8" />
            <circle cx="390" cy="35" r="1" fill="#fff" opacity="0.7" />
            <circle cx="480" cy="22" r="1.5" fill="#a7f3d0" opacity="0.9" />
            <circle cx="560" cy="50" r="1" fill="#fff" opacity="0.5" />
            <circle cx="630" cy="30" r="1.5" fill="#fde047" opacity="0.8" />
            <circle cx="650" cy="70" r="1" fill="#fff" opacity="0.6" />
          </g>

          {/* Distant Background Cityline Silhouettes */}
          <g fill="#03261d" opacity="0.55">
            {/* Far Left Tower */}
            <rect x="25" y="140" width="50" height="150" rx="3" />
            <rect x="35" y="125" width="30" height="20" rx="2" />
            {/* Tower 2 */}
            <rect x="85" y="160" width="40" height="130" rx="2" />
            {/* Tower 3 */}
            <rect x="135" y="130" width="55" height="160" rx="3" />
            <line x1="162" y1="105" x2="162" y2="130" stroke="#044d3b" strokeWidth="2" />
            {/* Far Right Tower 1 */}
            <rect x="495" y="120" width="65" height="170" rx="3" />
            <rect x="510" y="100" width="35" height="25" rx="2" />
            {/* Far Right Tower 2 */}
            <rect x="575" y="145" width="45" height="145" rx="2" />
            {/* Far Right Tower 3 */}
            <rect x="630" y="165" width="40" height="125" rx="2" />
          </g>

          {/* Distant Tiny Window Lights */}
          <g fill="#34d399" opacity="0.3">
            <rect x="35" y="150" width="4" height="3" />
            <rect x="45" y="150" width="4" height="3" />
            <rect x="55" y="150" width="4" height="3" />
            <rect x="35" y="165" width="4" height="3" />
            <rect x="55" y="165" width="4" height="3" />
            <rect x="145" y="145" width="4" height="3" />
            <rect x="165" y="145" width="4" height="3" />
            <rect x="175" y="160" width="4" height="3" />
            <rect x="505" y="135" width="4" height="3" />
            <rect x="525" y="135" width="4" height="3" />
            <rect x="540" y="150" width="4" height="3" />
            <rect x="585" y="160" width="4" height="3" />
            <rect x="640" y="175" width="4" height="3" />
          </g>

          {/* ============================================================ */}
          {/* MAIN CAMPUS BUILDINGS COMPLEX */}
          {/* ============================================================ */}

          {/* --- BUILDING 1: LEFT MODERN RESIDENCE WING (4 Stories) --- */}
          <g id="building-left">
            {/* Base Block */}
            <rect
              x="65"
              y="110"
              width="170"
              height="180"
              rx="4"
              fill="url(#towerGradLeft)"
              stroke="#047857"
              strokeWidth="1.5"
            />

            {/* Overhanging Modern Roof Slab & Trellis */}
            <rect x="55" y="103" width="190" height="8" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
            {/* Pergola Slats on Roof */}
            <line x1="80" y1="92" x2="80" y2="103" stroke="#34d399" strokeWidth="2" />
            <line x1="95" y1="92" x2="95" y2="103" stroke="#34d399" strokeWidth="2" />
            <line x1="110" y1="92" x2="110" y2="103" stroke="#34d399" strokeWidth="2" />
            <line x1="125" y1="92" x2="125" y2="103" stroke="#34d399" strokeWidth="2" />
            <line x1="75" y1="92" x2="130" y2="92" stroke="#10b981" strokeWidth="2" />

            {/* Rooftop Solar Panels */}
            <g transform="translate(150, 85)">
              <rect x="0" y="0" width="35" height="18" rx="2" fill="url(#solarPanelGrad)" stroke="#38bdf8" strokeWidth="0.8" transform="skewX(-15)" />
              <line x1="12" y1="0" x2="12" y2="18" stroke="#38bdf8" strokeWidth="0.5" transform="skewX(-15)" />
              <line x1="24" y1="0" x2="24" y2="18" stroke="#38bdf8" strokeWidth="0.5" transform="skewX(-15)" />
              <rect x="42" y="0" width="35" height="18" rx="2" fill="url(#solarPanelGrad)" stroke="#38bdf8" strokeWidth="0.8" transform="skewX(-15)" />
              <line x1="54" y1="0" x2="54" y2="18" stroke="#38bdf8" strokeWidth="0.5" transform="skewX(-15)" />
              <line x1="66" y1="0" x2="66" y2="18" stroke="#38bdf8" strokeWidth="0.5" transform="skewX(-15)" />
            </g>

            {/* Floor Dividing Strips */}
            <line x1="65" y1="155" x2="235" y2="155" stroke="#047857" strokeWidth="1.5" />
            <line x1="65" y1="200" x2="235" y2="200" stroke="#047857" strokeWidth="1.5" />
            <line x1="65" y1="245" x2="235" y2="245" stroke="#047857" strokeWidth="1.5" />

            {/* Windows Floor 4 */}
            <rect x="75" y="120" width="28" height="24" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <line x1="89" y1="120" x2="89" y2="144" stroke="#78350f" strokeWidth="1" />
            <rect x="115" y="120" width="28" height="24" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="155" y="120" width="28" height="24" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.85" />
            <rect x="195" y="120" width="28" height="24" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />

            {/* Cantilevered Glass Balcony Floor 3 */}
            <rect x="75" y="165" width="30" height="24" rx="2" fill="url(#windowCyanGlow)" opacity="0.9" />
            <rect x="115" y="165" width="40" height="24" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            {/* Balcony Railing */}
            <rect x="110" y="178" width="50" height="14" rx="2" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1.5" />
            <circle cx="118" cy="176" r="3" fill="#34d399" />
            <circle cx="125" cy="175" r="4" fill="#10b981" />

            <rect x="175" y="165" width="28" height="24" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.8" />
            <rect x="210" y="165" width="18" height="24" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />

            {/* Floor 2 Windows */}
            <rect x="75" y="210" width="35" height="24" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            {/* Balcony Railing Floor 2 */}
            <rect x="70" y="223" width="45" height="14" rx="2" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1.5" />
            <rect x="125" y="210" width="28" height="24" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="165" y="210" width="30" height="24" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="205" y="210" width="20" height="24" rx="2" fill="url(#windowCyanGlow)" opacity="0.75" />

            {/* Ground Floor Entrance & Lounge Glass */}
            <rect x="75" y="253" width="60" height="36" rx="2" fill="url(#windowWarmGlow)" opacity="0.85" />
            <line x1="105" y1="253" x2="105" y2="289" stroke="#78350f" strokeWidth="1.5" />
            <rect x="145" y="253" width="70" height="36" rx="2" fill="#065f46" stroke="#10b981" strokeWidth="1" />
            <text x="180" y="274" fill="#a7f3d0" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">
              STUDY LOUNGE
            </text>
          </g>

          {/* --- BUILDING 2: MAIN CENTRAL RESIDENCY TOWER (Tallest, 6 Stories) --- */}
          <g id="building-center">
            {/* Main Tower Mass */}
            <rect
              x="235"
              y="55"
              width="210"
              height="235"
              rx="4"
              fill="url(#towerGradCenter)"
              stroke="#10b981"
              strokeWidth="2"
            />

            {/* Architectural Stepped Crown & Rooftop Structure */}
            <rect x="270" y="38" width="140" height="18" rx="2" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
            <rect x="300" y="24" width="80" height="15" rx="2" fill="#047857" stroke="#34d399" strokeWidth="1.5" />

            {/* Antenna Mast with Pulsing Glowing Beacon */}
            <line x1="340" y1="2" x2="340" y2="24" stroke="#34d399" strokeWidth="2.5" />
            <circle cx="340" cy="2" r="8" fill="url(#beaconPulse)" />
            <circle cx="340" cy="2" r="3.5" fill="#34d399" />
            <circle cx="340" cy="2" r="1.5" fill="#fff" />

            {/* Crown Rooftop Terrace Garden & Pergola */}
            <g transform="translate(245, 42)">
              <line x1="5" y1="0" x2="5" y2="12" stroke="#34d399" strokeWidth="1.5" />
              <line x1="15" y1="0" x2="15" y2="12" stroke="#34d399" strokeWidth="1.5" />
              <line x1="2" y1="0" x2="20" y2="0" stroke="#34d399" strokeWidth="1.5" />
              {/* Potted Roof Shrub */}
              <circle cx="23" cy="8" r="4.5" fill="#10b981" />
              <rect x="21" y="9" width="4" height="4" fill="#78350f" />
            </g>

            {/* Central Vertical Glass Atrium / Elevator Core */}
            <rect
              x="325"
              y="55"
              width="30"
              height="200"
              fill="#022c22"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            {/* Glowing vertical elevator light track */}
            <line x1="340" y1="60" x2="340" y2="250" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
            {/* Moving Elevator Capsule Glowing */}
            <rect x="330" y="130" width="20" height="24" rx="2" fill="url(#windowCyanGlow)" opacity="0.95" stroke="#fff" strokeWidth="0.8" />

            {/* Grid of Student Rooms (Left and Right of central atrium) */}
            {/* --- Level 6 (y=68) --- */}
            <rect x="250" y="68" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            <rect x="286" y="68" width="28" height="20" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.85" />
            <rect x="366" y="68" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            <rect x="402" y="68" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />

            {/* --- Level 5 (y=100) --- */}
            <rect x="250" y="100" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="286" y="100" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="366" y="100" width="28" height="20" rx="2" fill="url(#windowCyanGlow)" opacity="0.85" />
            <rect x="402" y="100" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />

            {/* --- Level 4 (y=132) --- */}
            <rect x="250" y="132" width="28" height="20" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.9" />
            <rect x="286" y="132" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="366" y="132" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="402" y="132" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />

            {/* Balcony accents Level 4 */}
            <rect x="246" y="144" width="34" height="10" rx="1.5" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1" />
            <rect x="400" y="144" width="34" height="10" rx="1.5" fill="#10b981" fillOpacity="0.25" stroke="#34d399" strokeWidth="1" />

            {/* --- Level 3 (y=164) --- */}
            <rect x="250" y="164" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="286" y="164" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="366" y="164" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="402" y="164" width="28" height="20" rx="2" fill="url(#windowCyanGlow)" opacity="0.85" />

            {/* --- Level 2 (y=196) --- */}
            <rect x="250" y="196" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />
            <rect x="286" y="196" width="28" height="20" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.9" />
            <rect x="366" y="196" width="28" height="20" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            <rect x="402" y="196" width="28" height="20" rx="2" fill="#044333" stroke="#047857" strokeWidth="1" />

            {/* --- Level 1 / Ground Floor Grand Entrance Lobby --- */}
            {/* Grand Entrance Canopy (Cantilevered over ground) */}
            <rect
              x="260"
              y="245"
              width="160"
              height="8"
              rx="2"
              fill="#065f46"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            {/* Canopy Signboard */}
            <text x="340" y="240" fill="#a7f3d0" fontSize="8" fontWeight="800" textAnchor="middle" letterSpacing="1.5">
              UNINEST RESIDENCE
            </text>

            {/* Lobby Glass Wall & Sliding Doors with Warm Ambience */}
            <rect x="270" y="253" width="140" height="37" fill="url(#windowWarmGlow)" opacity="0.9" />
            <line x1="305" y1="253" x2="305" y2="290" stroke="#78350f" strokeWidth="1.5" />
            <line x1="340" y1="253" x2="340" y2="290" stroke="#78350f" strokeWidth="2" />
            <line x1="375" y1="253" x2="375" y2="290" stroke="#78350f" strokeWidth="1.5" />
            {/* Modern Entrance Pillars */}
            <line x1="268" y1="253" x2="268" y2="290" stroke="#10b981" strokeWidth="3" />
            <line x1="412" y1="253" x2="412" y2="290" stroke="#10b981" strokeWidth="3" />
          </g>

          {/* --- BUILDING 3: RIGHT MODERN LOFT & TOWNHOUSE WING (3 Stories) --- */}
          <g id="building-right">
            {/* Angled Modern Roof Silhouette */}
            <path
              d="M 445 135 L 595 160 L 595 290 L 445 290 Z"
              fill="url(#towerGradRight)"
              stroke="#047857"
              strokeWidth="1.5"
            />

            {/* Angled Roof Coping */}
            <line x1="440" y1="134" x2="600" y2="160" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />

            {/* Rooftop String Fairy Lights between modern posts */}
            <line x1="465" y1="125" x2="465" y2="137" stroke="#34d399" strokeWidth="1" />
            <line x1="520" y1="133" x2="520" y2="147" stroke="#34d399" strokeWidth="1" />
            <line x1="575" y1="143" x2="575" y2="157" stroke="#34d399" strokeWidth="1" />
            {/* Hanging Cable */}
            <path d="M 465 127 Q 492 133 520 135 Q 547 141 575 145" stroke="#fef08a" strokeWidth="0.8" fill="none" opacity="0.6" />
            {/* Fairy Light Bulbs */}
            <circle cx="478" cy="129" r="2" fill="#fef08a" />
            <circle cx="500" cy="133" r="2" fill="#fef08a" />
            <circle cx="538" cy="137" r="2" fill="#fef08a" />
            <circle cx="558" cy="142" r="2" fill="#fef08a" />

            {/* Architectural Vertical Louvers / Wooden Slats on facade */}
            <g opacity="0.75">
              <line x1="540" y1="175" x2="540" y2="245" stroke="#d97706" strokeWidth="1.5" />
              <line x1="546" y1="176" x2="546" y2="245" stroke="#d97706" strokeWidth="1.5" />
              <line x1="552" y1="177" x2="552" y2="245" stroke="#d97706" strokeWidth="1.5" />
              <line x1="558" y1="178" x2="558" y2="245" stroke="#d97706" strokeWidth="1.5" />
              <line x1="564" y1="179" x2="564" y2="245" stroke="#d97706" strokeWidth="1.5" />
            </g>

            {/* Loft Windows Upper Floor */}
            <rect x="460" y="160" width="30" height="30" rx="2" fill="url(#windowWarmGlow)" opacity="0.95" />
            <rect x="498" y="165" width="32" height="28" rx="2" fill="url(#windowEmeraldGlow)" opacity="0.85" />

            {/* Mid Floor Windows */}
            <rect x="460" y="205" width="68" height="28" rx="2" fill="url(#windowWarmGlow)" opacity="0.9" />
            <line x1="494" y1="205" x2="494" y2="233" stroke="#78350f" strokeWidth="1.5" />
            <rect x="540" y="208" width="45" height="25" rx="2" fill="url(#windowCyanGlow)" opacity="0.85" />

            {/* Ground Level Bicycle Parking Station */}
            <rect x="460" y="250" width="125" height="40" rx="2" fill="#03261d" stroke="#047857" strokeWidth="1" />
            {/* Bike rack frame */}
            <path d="M 475 285 L 475 272 L 485 272 L 485 285" stroke="#34d399" strokeWidth="1.5" fill="none" />
            <path d="M 495 285 L 495 272 L 505 272 L 505 285" stroke="#34d399" strokeWidth="1.5" fill="none" />
            <path d="M 515 285 L 515 272 L 525 272 L 525 285" stroke="#34d399" strokeWidth="1.5" fill="none" />
            {/* Parked Bicycle Silhouette */}
            <circle cx="480" cy="280" r="5" stroke="#a7f3d0" strokeWidth="1" fill="none" />
            <circle cx="496" cy="280" r="5" stroke="#a7f3d0" strokeWidth="1" fill="none" />
            <line x1="480" y1="280" x2="488" y2="275" stroke="#a7f3d0" strokeWidth="1" />
            <line x1="488" y1="275" x2="496" y2="280" stroke="#a7f3d0" strokeWidth="1" />
            <line x1="488" y1="275" x2="487" y2="271" stroke="#a7f3d0" strokeWidth="1" />
            <text x="555" y="274" fill="#a7f3d0" fontSize="7.5" fontWeight="bold" textAnchor="middle">
              ECO BIKE BAY
            </text>
          </g>

          {/* ============================================================ */}
          {/* GROUND LEVEL, PROMENADE & LANDSCAPING */}
          {/* ============================================================ */}

          {/* Ground Plaza Base */}
          <rect x="0" y="285" width="680" height="55" fill="url(#groundGrad)" />

          {/* Paved Walkway Edge Strip */}
          <line x1="0" y1="286" x2="680" y2="286" stroke="#34d399" strokeWidth="2" opacity="0.8" />
          <line x1="0" y1="290" x2="680" y2="290" stroke="#10b981" strokeWidth="1" opacity="0.4" />

          {/* Campus Promenade Perspective Joint Lines */}
          <g stroke="#047857" strokeWidth="1" opacity="0.4">
            <line x1="80" y1="290" x2="60" y2="340" />
            <line x1="180" y1="290" x2="160" y2="340" />
            <line x1="280" y1="290" x2="260" y2="340" />
            <line x1="380" y1="290" x2="380" y2="340" />
            <line x1="480" y1="290" x2="500" y2="340" />
            <line x1="580" y1="290" x2="610" y2="340" />
          </g>

          {/* --- STREET LANTERNS & WARM LIGHT CONES --- */}
          {/* Left Street Lamp */}
          <g transform="translate(190, 240)">
            {/* Lamp Light Cone radiating to ground */}
            <polygon points="10,12 -25,55 45,55" fill="url(#lampCone)" />
            {/* Lamp Post */}
            <line x1="10" y1="12" x2="10" y2="50" stroke="#34d399" strokeWidth="2" />
            <path d="M 6 12 Q 10 7 14 12 Z" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <circle cx="10" cy="13" r="3" fill="#fde047" />
          </g>

          {/* Right Street Lamp */}
          <g transform="translate(455, 240)">
            {/* Lamp Light Cone */}
            <polygon points="10,12 -25,55 45,55" fill="url(#lampCone)" />
            {/* Lamp Post */}
            <line x1="10" y1="12" x2="10" y2="50" stroke="#34d399" strokeWidth="2" />
            <path d="M 6 12 Q 10 7 14 12 Z" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <circle cx="10" cy="13" r="3" fill="#fde047" />
          </g>

          {/* --- MODERN ARCHITECTURAL TREES & SHRUBS --- */}
          {/* Left Trees */}
          <g transform="translate(25, 220)">
            {/* Tall Minimalist Cypress */}
            <path d="M 22 20 Q 12 50 22 70 Q 32 50 22 20 Z" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <path d="M 22 25 Q 16 50 22 68 Q 28 50 22 25 Z" fill="#065f46" />
            <line x1="22" y1="68" x2="22" y2="72" stroke="#78350f" strokeWidth="2" />
            {/* Rounded Emerald Tree */}
            <circle cx="42" cy="50" r="15" fill="#059669" stroke="#34d399" strokeWidth="1" />
            <circle cx="38" cy="46" r="10" fill="#10b981" opacity="0.6" />
            <line x1="42" y1="62" x2="42" y2="72" stroke="#78350f" strokeWidth="2.5" />
          </g>

          {/* Center-Right Campus Shrub & Park Bench */}
          <g transform="translate(425, 268)">
            {/* Minimalist Bench */}
            <rect x="0" y="8" width="22" height="3" rx="1" fill="#10b981" stroke="#34d399" strokeWidth="0.8" />
            <line x1="3" y1="11" x2="3" y2="18" stroke="#34d399" strokeWidth="1.5" />
            <line x1="19" y1="11" x2="19" y2="18" stroke="#34d399" strokeWidth="1.5" />
          </g>

          {/* Far Right Tree */}
          <g transform="translate(615, 225)">
            <circle cx="25" cy="45" r="18" fill="#047857" stroke="#10b981" strokeWidth="1" />
            <circle cx="21" cy="40" r="12" fill="#059669" opacity="0.8" />
            <circle cx="34" cy="52" r="9" fill="#10b981" opacity="0.7" />
            <line x1="25" y1="60" x2="25" y2="70" stroke="#78350f" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      {/* Bottom Architectural Highlights Bar */}
      <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-3 gap-2 text-center">
        <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-emerald-400 font-bold block flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> 100% Escrow
          </span>
          <span className="text-[9px] text-slate-300">2-Stage Move-In PIN</span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-amber-300 font-bold block flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-amber-300" /> Sub-Metered
          </span>
          <span className="text-[9px] text-slate-300">PSPCL ₹9/unit Split</span>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-lg py-1.5 px-2">
          <span className="text-[10px] text-teal-300 font-bold block flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3 text-teal-300" /> Direct Walking
          </span>
          <span className="text-[9px] text-slate-300">PCTE &bull; PAU &bull; GNDEC</span>
        </div>
      </div>
    </div>
  );
}
