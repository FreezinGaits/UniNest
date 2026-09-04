'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  ShoppingBag, Wifi, Utensils, Shirt, Droplets, Wind, Flame, Tv, Refrigerator,
  Sparkles, Wrench, Dumbbell, Truck, Car, Home, CheckCircle2, ShoppingCart
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number; // paise
  provider: string;
  description: string;
  icon: any;
}

const SERVICES: ServiceItem[] = [
  { id: 'srv-1', name: 'High-Speed Wi-Fi Boost (100 Mbps)', category: 'Utilities', price: 30000, provider: 'Airtel Broadband (Verified)', description: 'Unlimited campus Wi-Fi with guaranteed 99.9% uptime.', icon: Wifi },
  { id: 'srv-2', name: 'Daily Tiffin & Meal Plan (2 Meals/day)', category: 'Food', price: 350000, provider: 'Grandma Kitchens (DEMO PARTNER)', description: 'Fresh, hygienic home-style North/South Indian meals.', icon: Utensils },
  { id: 'srv-3', name: 'Weekly Laundry & Ironing (15kg/mo)', category: 'Essentials', price: 80000, provider: 'CleanWash Express (DEMO PARTNER)', description: 'Doorstep pickup, wash, fold & steam iron twice weekly.', icon: Shirt },
  { id: 'srv-4', name: 'RO Water Purifier Rental', category: 'Appliances', price: 40000, provider: 'PureWater Solutions (DEMO PARTNER)', description: 'Multi-stage UV+UF water purifier installed in room.', icon: Droplets },
  { id: 'srv-5', name: 'Desert Air Cooler Rental', category: 'Appliances', price: 60000, provider: 'CoolComfort Rentals (DEMO PARTNER)', description: '70L honeycomb pad air cooler for summer months.', icon: Wind },
  { id: 'srv-6', name: 'Instant Water Heater / Geyser', category: 'Appliances', price: 50000, provider: 'WarmHome Rentals (DEMO PARTNER)', description: '15L energy-efficient geyser installation.', icon: Flame },
  { id: 'srv-7', name: 'Inverter Split AC Rental (1.5 Ton)', category: 'Appliances', price: 150000, provider: 'CoolComfort Rentals (DEMO PARTNER)', description: '5-star energy rated silent AC with free maintenance.', icon: Tv },
  { id: 'srv-8', name: 'Single Door Mini Fridge (95L)', category: 'Appliances', price: 90000, provider: 'Appliance Hub (DEMO PARTNER)', description: 'Compact energy-efficient refrigerator for personal room.', icon: Refrigerator },
  { id: 'srv-9', name: 'Semi-Automatic Washing Machine', category: 'Appliances', price: 100000, provider: 'Appliance Hub (DEMO PARTNER)', description: '7kg washer placed in shared balcony/utility area.', icon: Shirt },
  { id: 'srv-10', name: 'Orthopedic Memory Foam Mattress', category: 'Furniture', price: 45000, provider: 'SleepWell Student (DEMO PARTNER)', description: '6-inch high-density mattress with washable cover.', icon: Home },
  { id: 'srv-11', name: 'Ergonomic Study Table & Drawer', category: 'Furniture', price: 35000, provider: 'StudyCraft (DEMO PARTNER)', description: 'Scratch-resistant wooden desk with laptop cable grommet.', icon: Home },
  { id: 'srv-12', name: 'Mesh Executive Study Chair', category: 'Furniture', price: 30000, provider: 'StudyCraft (DEMO PARTNER)', description: 'High-back lumbar support chair with height adjustment.', icon: Home },
  { id: 'srv-13', name: 'Bi-Weekly Deep Room Cleaning', category: 'Cleaning', price: 40000, provider: 'QuickFix Services (Verified)', description: 'Bathroom sanitization, dusting, mopping & bedsheet change.', icon: Sparkles },
  { id: 'srv-14', name: 'Annual Maintenance Cover (AMC)', category: 'Maintenance', price: 25000, provider: 'QuickFix Services (Verified)', description: 'Free unlimited plumbing, electrical & fan repairs.', icon: Wrench },
  { id: 'srv-15', name: 'Campus Fitness & Gym Pass', category: 'Wellness', price: 70000, provider: 'Gold Gym Baddowal (DEMO PARTNER)', description: 'Full access to weight room & cardio area near PG.', icon: Dumbbell },
  { id: 'srv-16', name: 'Semester Luggage Transport', category: 'Transit', price: 120000, provider: 'StudentMovers (DEMO PARTNER)', description: 'Door-to-door luggage pickup & drop for home visits.', icon: Truck },
  { id: 'srv-17', name: 'Station / Airport Pickup & Drop', category: 'Transit', price: 80000, provider: 'City Cab Fleet (DEMO PARTNER)', description: 'Verified AC cab driver dedicated for student arrivals.', icon: Car },
  { id: 'srv-18', name: 'Parent / Guest Overnight Stay Room', category: 'Hospitality', price: 120000, provider: 'UniNest Host Suite (DEMO PARTNER)', description: 'Furnished guest room booking for visiting parents.', icon: Home },
];

export default function OnDemandServicesPage() {
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  async function handleOrderService(service: ServiceItem) {
    setPurchasedId(service.id);
    try {
      await fetch('/api/demo/service', { method: 'POST' });
      await fetch('/api/demo/commission', { method: 'POST' });
    } catch (e) {
      // ignore in UI
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ancillary Services Marketplace</h1>
          <p className="text-text-secondary mt-1">On-demand rentals, meals, cleaning, appliances, and transit for students</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Banner */}
      <Card className="bg-gradient-to-r from-brand-800 to-indigo-900 text-white border-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="outline" className="text-brand-200 border-brand-400">
              UNINEST INTEGRATED REVENUE ENGINE
            </Badge>
            <h2 className="text-xl font-bold">1-Click Service Orders & Subscriptions</h2>
            <p className="text-xs text-brand-200">
              Orders automatically split payouts: <strong>85% Provider</strong> · <strong>10% UniNest Platform Fee</strong> · <strong>5% Landlord Commission</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {SERVICES.map((srv) => {
          const Icon = srv.icon;
          const isOrdered = purchasedId === srv.id;

          return (
            <Card key={srv.id} className="flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={srv.provider.includes('DEMO PARTNER') ? 'default' : 'success'} size="sm">
                    {srv.provider.includes('DEMO PARTNER') ? 'DEMO PARTNER' : 'VERIFIED'}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-primary">{srv.name}</h3>
                  <p className="text-xs text-text-tertiary mt-0.5">{srv.provider}</p>
                </div>

                <p className="text-xs text-text-secondary line-clamp-2">{srv.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-tertiary block">Price</span>
                  <span className="text-base font-extrabold text-text-primary">{formatINR(srv.price)}</span>
                </div>

                {isOrdered ? (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Booked!
                  </div>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handleOrderService(srv)}>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Order Now
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
