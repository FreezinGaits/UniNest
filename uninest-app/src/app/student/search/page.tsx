'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/Shared';
import { formatINR } from '@/lib/utils';
import {
  STATES_DATA,
  COLLEGES_DATA,
  estimateCommuteTime,
} from '@/lib/locationData';
import DemoMapView from '@/components/search/DemoMapView';
import { HeartSaveButton } from '@/components/property/HeartSaveButton';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Wifi,
  UtensilsCrossed,
  ShieldCheck,
  Star,
  ChevronDown,
  Building2,
  Heart,
  Eye,
  CalendarCheck,
  Zap,
  Car,
  Shirt,
  Camera,
  X,
  ArrowUpDown,
  Grid3X3,
  List,
  Map as MapIcon,
  Navigation,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PropertyResult {
  id: string;
  name: string;
  type: string;
  address: string;
  locality?: string;
  city: string;
  state: string;
  gender: string;
  latitude?: number;
  longitude?: number;
  commuteTime?: string;
  images: string[];
  verificationStatus: string;
  verifiedAt: string | null;
  lastAvailabilityConfirm: string | null;
  wifiAvailable: boolean;
  foodAvailable: boolean;
  laundryAvailable: boolean;
  parkingAvailable: boolean;
  amenities: string[];
  rules: string[];
  wifiCharge: number;
  foodCharge: number;
  maintenanceCharge: number;
  electricityRate: number;
  computedDistance: number;
  minBaseRent: number;
  minDeposit: number;
  totalBeds: number;
  availBeds: number;
  trueMonthlyCost: number;
  rating: number;
  reviewCount: number;
  landlord?: {
    businessName: string;
    responseRate: number;
    avgResponseTime: string;
    user: { name: string; phone: string };
  };
  rooms: {
    id: string;
    roomNumber: string;
    sharing: number;
    rent: number;
    deposit: number;
    hasAC: boolean;
    beds: { id: string; status: string }[];
  }[];
  reviews: { overall: number; comment?: string }[];
  collegeLinks: { distance: number | null; college: { collegeName: string } }[];
}

export default function StudentSearchPage() {
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('recommended');

  useEffect(() => {
    fetch('/api/student/saved/ids')
      .then((res) => res.json())
      .then((data) => {
        if (data.savedIds) setSavedIds(data.savedIds);
      })
      .catch(() => {});
  }, []);

  // Location Hierarchy States
  const [selectedState, setSelectedState] = useState('Punjab');
  const [selectedCity, setSelectedCity] = useState('Ludhiana');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('pcte-ludhiana');
  const [selectedRadius, setSelectedRadius] = useState('3');

  // Filter Drawer States
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    maxDeposit: '',
    maxTotalCost: '',
    sharing: '',
    type: '',
    gender: '',
    amenities: [] as string[],
    rules: [] as string[],
    verifiedOnly: false,
  });

  // Get available cities for selected state
  const stateObj = STATES_DATA.find((s) => s.name === selectedState) || STATES_DATA[0];
  const citiesList = stateObj.cities;

  // Get available localities for selected city
  const cityObj = citiesList.find((c) => c.name === selectedCity) || citiesList[0];
  const localitiesList = cityObj?.localities || [];

  // Get current selected college
  const selectedCollege =
    COLLEGES_DATA.find((c) => c.id === selectedCollegeId) || COLLEGES_DATA[0];

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (selectedState) params.set('state', selectedState);
        if (selectedCity) params.set('city', selectedCity);
        if (selectedLocality) params.set('locality', selectedLocality);
        if (selectedCollegeId) {
          params.set('collegeId', selectedCollegeId);
          params.set('lat', selectedCollege.latitude.toString());
          params.set('lng', selectedCollege.longitude.toString());
        }
        if (selectedRadius) params.set('maxDistance', selectedRadius);

        if (filters.minRent) params.set('minRent', filters.minRent);
        if (filters.maxRent) params.set('maxRent', filters.maxRent);
        if (filters.maxDeposit) params.set('maxDeposit', filters.maxDeposit);
        if (filters.maxTotalCost) params.set('maxTotalCost', filters.maxTotalCost);
        if (filters.sharing) params.set('sharing', filters.sharing);
        if (filters.type) params.set('type', filters.type);
        if (filters.gender) params.set('gender', filters.gender);
        if (filters.verifiedOnly) params.set('verified', 'true');

        if (sortBy) params.set('sort', sortBy);

        const res = await fetch(`/api/properties/search?${params.toString()}`);
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [
    searchQuery,
    selectedState,
    selectedCity,
    selectedLocality,
    selectedCollegeId,
    selectedRadius,
    filters,
    sortBy,
  ]);

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const newStObj = STATES_DATA.find((s) => s.name === newState);
    if (newStObj && newStObj.cities.length > 0) {
      setSelectedCity(newStObj.cities[0].name);
      setSelectedLocality('');
    }
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setSelectedLocality('');
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLocality('');
    setSelectedRadius('5');
    setFilters({
      minRent: '',
      maxRent: '',
      maxDeposit: '',
      maxTotalCost: '',
      sharing: '',
      type: '',
      gender: '',
      amenities: [],
      rules: [],
      verifiedOnly: false,
    });
    setSortBy('recommended');
  };

  function getVerifiedLabel(verifiedAt: string | null): string {
    if (!verifiedAt) return 'Verified Recently';
    const days = Math.floor(
      (Date.now() - new Date(verifiedAt).getTime()) / 86400000
    );
    if (days === 0) return 'Verified today';
    if (days === 1) return 'Verified yesterday';
    return `Verified ${days} days ago`;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Search Title & Counter Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Verified Marketplace
            </span>
            <span className="text-xs text-slate-500">• Demo City: Ludhiana, Punjab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Find Student PGs & Accommodation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Search verified housing near <strong className="text-slate-900">{selectedCollege.name}</strong> with True Cost transparency.
          </p>
        </div>

        {/* Primary Demo Persona Matching Banner (Requirement V) */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-800">
              Rahul Sharma Persona Search Active
            </div>
            <div className="text-sm font-extrabold text-slate-900">
              {properties.length} PGs match your preferences
            </div>
          </div>
        </div>
      </div>

      {/* A-E: LOCATION HIERARCHY SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        {/* Top Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PG name, locality, street, or college landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl border flex items-center gap-2 font-medium text-sm transition-all ${
              showFilters
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Location Selector Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* State */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500"
            >
              {STATES_DATA.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500"
            >
              {citiesList.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locality */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Locality / Area</label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500"
            >
              <option value="">All Localities ({localitiesList.length})</option>
              {localitiesList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* College / Landmark */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">College / Landmark</label>
            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-emerald-700 font-bold focus:bg-white focus:border-emerald-500"
            >
              {COLLEGES_DATA.map((col) => (
                <option key={col.id} value={col.id}>
                  🎓 {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* F: Radius Search */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-slate-600 font-semibold mb-1">Campus Radius</label>
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:bg-white focus:border-emerald-500"
            >
              <option value="0.5">500 meters (0.5 km)</option>
              <option value="1">1 km</option>
              <option value="2">2 km</option>
              <option value="3">3 km (Rahul Pref)</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Switcher & Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Interactive Map
            </button>
          </div>

          <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
            Showing <strong className="text-slate-900">{properties.length}</strong> verified listings
          </span>
        </div>

        {/* I: Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-600 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-3 py-1.5 focus:bg-white focus:border-emerald-500"
          >
            <option value="recommended">Recommended</option>
            <option value="closest">Closest to {selectedCollege.name}</option>
            <option value="lowest_rent">Lowest Rent</option>
            <option value="lowest_total_cost">Lowest Total Monthly Cost</option>
            <option value="highest_rated">Highest Rated</option>
            <option value="most_available">Most Available Beds</option>
            <option value="recently_verified">Recently Verified</option>
            <option value="recently_updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* H: COMPLETE FILTER DRAWER */}
      {showFilters && (
        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-md space-y-5 animate-slide-down">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Advanced Property Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-emerald-600 hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Price Filters */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Monthly Rent (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min (e.g. 4000)"
                  value={filters.minRent}
                  onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Max (e.g. 8000)"
                  value={filters.maxRent}
                  onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>

            {/* Room Sharing */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Room Sharing</label>
              <select
                value={filters.sharing}
                onChange={(e) => setFilters({ ...filters, sharing: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
              >
                <option value="">Any Sharing</option>
                <option value="1">Single Room</option>
                <option value="2">Double Sharing (2-Sharing)</option>
                <option value="3">Triple Sharing (3-Sharing)</option>
                <option value="4">4-Sharing</option>
              </select>
            </div>

            {/* Property Type & Gender */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Gender & Type</label>
              <div className="flex gap-2">
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                >
                  <option value="">All Gender</option>
                  <option value="MALE">Boys Only</option>
                  <option value="FEMALE">Girls Only</option>
                  <option value="ANY">Co-ed / Any</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                >
                  <option value="">All Types</option>
                  <option value="PG">PG Accommodation</option>
                  <option value="HOSTEL">Student Hostel</option>
                  <option value="FLAT">Student Flat</option>
                </select>
              </div>
            </div>

            {/* Trust & Verification */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Verification Trust</label>
              <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-pointer text-slate-700 hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>UniNest Verified Listings Only</span>
              </label>
            </div>
          </div>

          {/* Key Amenities Selection */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-xs">Filter by Amenities</label>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Wi-Fi', 'AC', 'Cooler', 'Food', 'Laundry', 'CCTV', 'Power Backup', 'RO', 'Parking', 'Study Table', 'Biometric Access'].map((amenity) => {
                const active = filters.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* G: MAP VIEW MODE */}
      {viewMode === 'map' && (
        <DemoMapView
          properties={properties}
          selectedCollegeName={selectedCollege.name}
          collegeLat={selectedCollege.latitude}
          collegeLng={selectedCollege.longitude}
          radiusKm={parseFloat(selectedRadius)}
        />
      )}

      {/* GRID / LIST PROPERTY CARDS */}
      {viewMode !== 'map' && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-10 h-10 text-slate-400 mx-auto" />}
            title="No PG properties match your filters"
            description="Try adjusting your campus radius, price range, or clearing filters."
            action={<Button onClick={clearFilters}>Clear All Filters</Button>}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {properties.map((property) => {
              const distanceKm = typeof property.computedDistance === 'number' ? property.computedDistance : 1.2;
              const commuteStr = estimateCommuteTime(distanceKm, selectedCollege.name);
              const verifiedLabel = getVerifiedLabel(property.verifiedAt);

              return (
                <Card
                  key={property.id}
                  className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Image Header with Badges */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={property.images[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex gap-1.5">
                          {property.verificationStatus === 'VERIFIED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-1 shadow-md">
                              <ShieldCheck className="w-3.5 h-3.5 text-white" />
                              VERIFIED
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md border border-slate-200/80 shadow-sm">
                            {property.gender === 'MALE' ? 'Boys PG' : property.gender === 'FEMALE' ? 'Girls PG' : 'Co-ed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pointer-events-auto">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-md">
                            {verifiedLabel}
                          </span>
                          <HeartSaveButton
                            propertyId={property.id}
                            initialSaved={savedIds.includes(property.id)}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Distance Badge on Image Bottom */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                        <span className="bg-slate-900/85 text-indigo-200 font-bold px-2.5 py-1 rounded-lg border border-indigo-400/30 flex items-center gap-1 backdrop-blur-md">
                          <Navigation className="w-3.5 h-3.5 text-indigo-300" />
                          {distanceKm} km from {selectedCollege.name.split(' ')[0]}
                        </span>
                        <span className="bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded text-xs flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
                          {property.rating}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{property.locality || 'Ludhiana'}, {property.city}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mt-0.5">
                          {property.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          Commute: <strong className="text-slate-700">{commuteStr}</strong>
                        </p>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {property.wifiAvailable && (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-blue-600" />
                            Fiber Wi-Fi
                          </span>
                        )}
                        {property.foodAvailable && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-medium flex items-center gap-1">
                            <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                            Meals Included
                          </span>
                        )}
                        {property.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                            {a}
                          </span>
                        ))}
                      </div>

                      {/* Availability & Beds Status */}
                      <div className="flex items-center justify-between bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-xs">
                        <span className="text-slate-600 font-medium">Bed Availability:</span>
                        <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {property.availBeds} available of {property.totalBeds} beds
                        </span>
                      </div>

                      {/* J: TRUE MONTHLY COST BREAKDOWN */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Base Room Rent:</span>
                          <strong className="text-slate-900">₹{property.minBaseRent.toLocaleString('en-IN')}/mo</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>Deposit (Refundable):</span>
                          <span>₹{property.minDeposit.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-slate-800">True Monthly Cost:</span>
                          <span className="text-base font-extrabold text-emerald-600">
                            ₹{property.trueMonthlyCost.toLocaleString('en-IN')}/mo
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 text-right">
                          (Rent + Food + Wi-Fi + Maint. + Est. Elec ₹400)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action CTAs */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
                    <Link
                      href={`/student/search/${property.id}`}
                      className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/student/search/${property.id}`}
                      className="w-full text-center py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-md"
                    >
                      Reserve Bed (₹399)
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
