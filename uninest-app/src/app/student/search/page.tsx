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
  Search, MapPin, Filter, SlidersHorizontal, Wifi, UtensilsCrossed,
  ShieldCheck, Star, ChevronDown, Building2, Heart, Eye, CalendarCheck,
  Zap, Car, Shirt, Camera, X, ArrowUpDown, Grid3X3, List
} from 'lucide-react';

interface PropertyResult {
  id: string;
  name: string;
  address: string;
  city: string;
  gender: string;
  images: string[];
  verificationStatus: string;
  verifiedAt: string | null;
  lastAvailabilityConfirm: string | null;
  wifiAvailable: boolean;
  foodAvailable: boolean;
  laundryAvailable: boolean;
  parkingAvailable: boolean;
  amenities: string[];
  wifiCharge: number;
  foodCharge: number;
  maintenanceCharge: number;
  electricityRate: number;
  rooms: {
    id: string;
    roomNumber: string;
    sharing: number;
    rent: number;
    deposit: number;
    hasAC: boolean;
    beds: { id: string; status: string }[];
  }[];
  reviews: { overall: number }[];
  collegeLinks: { distance: number | null; college: { collegeName: string } }[];
}

export default function StudentSearchPage() {
  const [properties, setProperties] = useState<PropertyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    sharing: '',
    gender: '',
    amenity: '',
    verifiedOnly: false,
  });

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (filters.minRent) params.set('minRent', filters.minRent);
        if (filters.maxRent) params.set('maxRent', filters.maxRent);
        if (filters.sharing) params.set('sharing', filters.sharing);
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
  }, [searchQuery, filters, sortBy]);

  function getMinRent(property: PropertyResult): number {
    if (property.rooms.length === 0) return 0;
    return Math.min(...property.rooms.map(r => r.rent));
  }

  function getMinDeposit(property: PropertyResult): number {
    if (property.rooms.length === 0) return 0;
    return Math.min(...property.rooms.map(r => r.deposit));
  }

  function getAvailableBeds(property: PropertyResult): number {
    return property.rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'AVAILABLE').length, 0);
  }

  function getTotalBeds(property: PropertyResult): number {
    return property.rooms.reduce((acc, r) => acc + r.beds.length, 0);
  }

  function getAvgRating(property: PropertyResult): number {
    if (property.reviews.length === 0) return 0;
    return property.reviews.reduce((acc, r) => acc + r.overall, 0) / property.reviews.length;
  }

  function getEstimatedMonthlyCost(property: PropertyResult): number {
    const minRent = getMinRent(property);
    const elecEstimate = 40000; // ₹400 estimate in paise
    return minRent + property.wifiCharge + property.foodCharge + property.maintenanceCharge + elecEstimate;
  }

  function getDistance(property: PropertyResult): string {
    if (property.collegeLinks.length > 0 && property.collegeLinks[0].distance) {
      return `${property.collegeLinks[0].distance.toFixed(1)} km`;
    }
    return '—';
  }

  function getVerifiedLabel(property: PropertyResult): string {
    if (property.verificationStatus !== 'VERIFIED') return '';
    if (!property.verifiedAt) return 'Verified';
    const days = Math.floor((Date.now() - new Date(property.verifiedAt).getTime()) / 86400000);
    if (days === 0) return 'Verified today';
    if (days === 1) return 'Verified yesterday';
    return `Verified ${days} days ago`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Find Your PG</h1>
        <p className="text-text-secondary mt-1">Discover verified accommodations near your college.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by PG name, area, or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          icon={<SlidersHorizontal className="w-4 h-4" />}
        >
          Filters
          {Object.values(filters).some(v => v !== '' && v !== false) && (
            <span className="w-2 h-2 bg-brand-500 rounded-full" />
          )}
        </Button>
        <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-1">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-surface-tertiary text-text-primary' : 'text-text-tertiary'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-surface-tertiary text-text-primary' : 'text-text-tertiary'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Filters</h3>
            <button onClick={() => setFilters({ minRent: '', maxRent: '', sharing: '', gender: '', amenity: '', verifiedOnly: false })} className="text-xs text-brand-600 font-medium">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input
              label="Min Rent (₹)"
              type="number"
              placeholder="3000"
              value={filters.minRent}
              onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
            />
            <Input
              label="Max Rent (₹)"
              type="number"
              placeholder="10000"
              value={filters.maxRent}
              onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
            />
            <Select
              label="Sharing"
              value={filters.sharing}
              onChange={(e) => setFilters({ ...filters, sharing: e.target.value })}
              options={[
                { value: '', label: 'Any' },
                { value: '1', label: 'Single' },
                { value: '2', label: '2-Sharing' },
                { value: '3', label: '3-Sharing' },
                { value: '4', label: '4-Sharing' },
              ]}
            />
            <Select
              label="Gender"
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              options={[
                { value: '', label: 'Any' },
                { value: 'MALE', label: 'Boys' },
                { value: 'FEMALE', label: 'Girls' },
              ]}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg cursor-pointer hover:bg-surface-tertiary transition-colors">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
                  className="rounded text-brand-600"
                />
                <span className="text-sm font-medium text-text-primary">Verified Only</span>
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Sort Bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {loading ? 'Searching...' : `${properties.length} PGs found`}
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border-none bg-transparent text-text-secondary font-medium focus:outline-none cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
            <option value="verified">Recently Verified</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface rounded-xl border border-border p-0 overflow-hidden">
              <div className="skeleton h-44 rounded-none" />
              <div className="p-4 space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-8 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="No PGs Found"
          description="Try adjusting your search or filters to find more options."
          action={
            <Button variant="outline" onClick={() => { setSearchQuery(''); setFilters({ minRent: '', maxRent: '', sharing: '', gender: '', amenity: '', verifiedOnly: false }); }}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {properties.map(property => (
            <Link key={property.id} href={`/student/search/${property.id}`}>
              <Card padding="none" hover className="overflow-hidden">
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-brand-100 to-blue-100">
                  {property.images && property.images.length > 0 ? (
                    <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-text-tertiary" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-brand-300" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {property.verificationStatus === 'VERIFIED' && (
                      <span className="verified-badge">
                        <ShieldCheck className="w-3 h-3" />
                        UniNest Verified
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      <Heart className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                  {/* Availability */}
                  <div className="absolute bottom-3 left-3">
                    <Badge variant={getAvailableBeds(property) > 0 ? 'success' : 'danger'} size="sm">
                      {getAvailableBeds(property)} of {getTotalBeds(property)} beds available
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary text-base truncate">{property.name}</h3>
                      {getAvgRating(property) > 0 && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {getAvgRating(property).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.address}
                      {property.collegeLinks.length > 0 && (
                        <span className="text-brand-600 font-medium ml-1">
                          • {getDistance(property)} from {property.collegeLinks[0].college.collegeName}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-text-primary">{formatINR(getMinRent(property))}</span>
                    <span className="text-sm text-text-secondary">/month</span>
                    <span className="text-xs text-text-tertiary ml-auto">
                      Deposit: {formatINR(getMinDeposit(property))}
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-1.5">
                    {property.wifiAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        <Wifi className="w-3 h-3" /> Wi-Fi
                      </span>
                    )}
                    {property.foodAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        <UtensilsCrossed className="w-3 h-3" /> Food
                      </span>
                    )}
                    {property.laundryAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        <Shirt className="w-3 h-3" /> Laundry
                      </span>
                    )}
                    {property.parkingAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        <Car className="w-3 h-3" /> Parking
                      </span>
                    )}
                    {property.rooms.some(r => r.hasAC) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        <Zap className="w-3 h-3" /> AC
                      </span>
                    )}
                    {property.amenities.slice(0, 2).map(a => (
                      <span key={a} className="inline-flex items-center px-2 py-0.5 bg-surface-tertiary rounded text-[11px] font-medium text-text-secondary">
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* True Monthly Cost */}
                  <div className="bg-brand-50 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-brand-700">Estimated monthly cost</span>
                      <span className="text-sm font-bold text-brand-800">{formatINR(getEstimatedMonthlyCost(property))}</span>
                    </div>
                  </div>

                  {/* Verification */}
                  {property.verificationStatus === 'VERIFIED' && (
                    <p className="text-[11px] text-text-tertiary flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      {getVerifiedLabel(property)}
                      {property.lastAvailabilityConfirm && (
                        <>
                          <span className="mx-1">•</span>
                          Availability confirmed {(() => {
                            const days = Math.floor((Date.now() - new Date(property.lastAvailabilityConfirm).getTime()) / 86400000);
                            return days === 0 ? 'today' : `${days}d ago`;
                          })()}
                        </>
                      )}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1">
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Book Visit
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
