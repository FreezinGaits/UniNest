'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatINR } from '@/lib/utils';
import {
  ShoppingBag,
  Wifi,
  Utensils,
  Shirt,
  Droplets,
  Wind,
  Flame,
  Tv,
  Refrigerator,
  Sparkles,
  Wrench,
  Dumbbell,
  Truck,
  Car,
  Home,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
  X,
  AlertCircle,
} from 'lucide-react';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number; // paise
  provider: string;
  description: string;
  icon: any;
}

interface ActiveServiceOrder {
  id: string;
  serviceId: string;
  name: string;
  category: string;
  price: number;
  provider: string;
  status: 'ACTIVE' | 'SCHEDULED';
  orderedAt: string;
  scheduledDate?: string;
  room?: string;
}

const ACTIVE_ORDERS: ActiveServiceOrder[] = [
  {
    id: 'ord-demo-1',
    serviceId: 'srv-1',
    name: 'High-Speed Wi-Fi Boost (100 Mbps)',
    category: 'Utilities',
    price: 30000,
    provider: 'Airtel Broadband (Verified)',
    status: 'ACTIVE',
    orderedAt: '15 Aug 2026',
    room: 'Room 204 (Bed A)',
  },
  {
    id: 'ord-demo-2',
    serviceId: 'srv-2',
    name: 'Daily Tiffin & Meal Plan (2 Meals/day)',
    category: 'Food',
    price: 350000,
    provider: 'Grandma Kitchens (DEMO PARTNER)',
    status: 'ACTIVE',
    orderedAt: '01 Sep 2026',
    room: 'Room 204 (Bed A)',
  },
];

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
  const { userEmail: ctxEmail, isDemoUser: ctxIsDemo, userName: ctxName } = useDashboardUser();
  const [isDemo, setIsDemo] = useState<boolean>(ctxIsDemo);
  const [userEmail, setUserEmail] = useState(ctxEmail || '');
  const [userName, setUserName] = useState(ctxName || 'Student');
  const [activeOrders, setActiveOrders] = useState<ActiveServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking modal state
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [startDateOption, setStartDateOption] = useState<'TOMORROW' | 'IMMEDIATE' | 'WEEKEND'>('TOMORROW');
  const [roomLocation, setRoomLocation] = useState('Room 204 (Bed A)');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'RENT_LEDGER' | 'ESCROW'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      let email = ctxEmail;
      let name = ctxName;

      if (!email) {
        try {
          const profileRes = await fetch('/api/profile');
          if (profileRes.ok) {
            const data = await profileRes.json();
            email = data?.email || data?.user?.email || '';
            name = data?.name || data?.user?.name || 'Student';
          }
        } catch {}
      }

      const demo = isDemoAccountEmail(email || '');
      setIsDemo(demo);
      setUserEmail(email || 'guest');
      if (name) setUserName(name);

      // 1. Load from localStorage
      const storageKey = 'uninest_service_orders_' + (email || 'guest');
      let localOrders: ActiveServiceOrder[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localOrders = parsed;
        }
      } catch {}

      // 2. Fetch live DB orders
      let dbOrders: ActiveServiceOrder[] = [];
      try {
        const res = await fetch(`/api/demo/service?studentEmail=${encodeURIComponent(email || '')}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.orders)) {
            dbOrders = json.orders;
          }
        }
      } catch {}

      // Merge unique orders
      const mergedMap = new Map<string, ActiveServiceOrder>();
      if (demo) {
        ACTIVE_ORDERS.forEach((o) => mergedMap.set(o.serviceId, o));
      }
      localOrders.forEach((o) => mergedMap.set(o.serviceId, o));
      dbOrders.forEach((o) => mergedMap.set(o.serviceId, o));

      setActiveOrders(Array.from(mergedMap.values()));
      setIsLoading(false);
    }

    loadData();
  }, [ctxEmail, ctxName]);

  const handleOpenBookingModal = (service: ServiceItem) => {
    setSelectedService(service);
    setSpecialInstructions('');
    setStartDateOption('TOMORROW');
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);

    const calculatedDate = new Date();
    if (startDateOption === 'TOMORROW') {
      calculatedDate.setDate(calculatedDate.getDate() + 1);
    } else if (startDateOption === 'WEEKEND') {
      calculatedDate.setDate(calculatedDate.getDate() + ((6 - calculatedDate.getDay() + 7) % 7 || 7));
    }

    const scheduledDateStr = calculatedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newOrder: ActiveServiceOrder = {
      id: `ord-${Date.now()}`,
      serviceId: selectedService.id,
      name: selectedService.name,
      category: selectedService.category,
      price: selectedService.price,
      provider: selectedService.provider,
      status: 'ACTIVE',
      orderedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      scheduledDate: scheduledDateStr,
      room: roomLocation,
    };

    const updatedOrders = [
      newOrder,
      ...activeOrders.filter((o) => o.serviceId !== selectedService.id),
    ];
    setActiveOrders(updatedOrders);

    try {
      localStorage.setItem(
        'uninest_service_orders_' + (userEmail || 'demo'),
        JSON.stringify(updatedOrders)
      );
    } catch {}

    // Send payload to DB via API
    try {
      const res = await fetch('/api/demo/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          categoryName: selectedService.category,
          price: selectedService.price,
          provider: selectedService.provider,
          room: roomLocation,
          notes: specialInstructions,
          studentEmail: userEmail,
          customerName: userName,
          scheduledDate: calculatedDate.toISOString(),
          paymentMethod,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      // Trigger commission creation for audit
      if (resData?.order?.id) {
        await fetch('/api/demo/commission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceOrderId: resData.order.id,
            totalAmount: selectedService.price,
          }),
        }).catch(() => {});
      }
    } catch (err) {
      // Optimistic update already saved
    }

    setIsSubmitting(false);
    setSelectedService(null);
    setToastMessage(`🎉 Subscribed to ${selectedService.name}! ${selectedService.provider} notified under 24-hr SLA guarantee.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm font-bold p-4 rounded-2xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ancillary Services Marketplace</h1>
          <p className="text-text-secondary mt-1">On-demand rentals, meals, cleaning, appliances, and transit for students</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      {/* Economic Engine Banner */}
      <Card className="bg-gradient-to-r from-brand-800 to-indigo-900 text-white border-none shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="outline" className="text-brand-200 border-brand-400">
              UNINEST INTEGRATED REVENUE ENGINE
            </Badge>
            <h2 className="text-xl font-bold">1-Click Service Orders & Subscriptions</h2>
            <p className="text-xs text-brand-200">
              Standard Verified Marketplace Split: <strong>85% Partner Vendor</strong> · <strong>10% UniNest Platform Fee</strong> · <strong>5% PG Host Reward</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 24-Hour SLA Delivery
            </span>
          </div>
        </div>
      </Card>

      {/* Active Subscriptions / Orders */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Active Service Subscriptions ({activeOrders.length})
          </h2>
          {activeOrders.length > 0 && (
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ● All Subscriptions Active
            </span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-slate-300 bg-slate-50/50">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-800">No active service subscriptions yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select any of the verified student services below (Wi-Fi, Tiffin, Laundry, AC Rentals, or Cleaning) to activate instant delivery to your room.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeOrders.map((ord) => (
              <Card key={ord.id} className="border-emerald-200 bg-emerald-50/30 p-4 space-y-2.5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="success" size="sm">
                    {ord.status}
                  </Badge>
                  <span className="text-[11px] text-text-tertiary">Since {ord.orderedAt}</span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-text-primary">{ord.name}</h3>
                  {ord.room && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600" /> {ord.room}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/60">
                  <span className="text-text-secondary truncate max-w-[150px]">{ord.provider}</span>
                  <span className="font-extrabold text-emerald-700">{formatINR(ord.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Grid of Available Services */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
          Available Campus Services ({SERVICES.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            const isOrdered = activeOrders.some((o) => o.serviceId === srv.id);

            return (
              <Card key={srv.id} className="flex flex-col justify-between hover:shadow-md transition-all border-slate-200">
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
                    <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Booked!
                    </div>
                  ) : (
                    <Button variant="primary" size="sm" onClick={() => handleOpenBookingModal(srv)}>
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Order Now
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Booking & Subscription Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 animate-scale-in border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Confirm Service Subscription</h3>
                  <p className="text-[11px] text-slate-500">24-Hr SLA Delivery • UniNest Verified Partner</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
              {/* Service Summary Card */}
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{selectedService.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Partner: {selectedService.provider}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Subscription Rate</div>
                  <div className="text-base font-black text-brand-700">{formatINR(selectedService.price)}</div>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Start / Delivery Window</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'TOMORROW', label: 'Tomorrow', sub: 'Standard 24h' },
                    { id: 'IMMEDIATE', label: 'Today (Urgent)', sub: 'Within 4h' },
                    { id: 'WEEKEND', label: 'This Weekend', sub: 'Sat / Sun' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStartDateOption(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        startDateOption === opt.id
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className={`text-[10px] ${startDateOption === opt.id ? 'text-brand-100' : 'text-slate-400'}`}>
                        {opt.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Location */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Room / Floor</label>
                <input
                  type="text"
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                  placeholder="e.g. Room 204 (Bed A), 2nd Floor"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferences & Notes for Vendor (Optional)</label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Pure vegetarian meals / Doorstep laundry pickup time after 6 PM"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Billing & Settlement Option</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="UPI">Direct UPI Instant Pay (Google Pay / PhonePe / Paytm)</option>
                  <option value="RENT_LEDGER">Add to Monthly Rent Ledger (Payable on 1st of month)</option>
                  <option value="ESCROW">Deduct from UniNest Security Escrow Balance</option>
                </select>
              </div>

              {/* Transparency Notice */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed">
                  <strong>UniNest Revenue Guarantee:</strong> 85% goes directly to the partner vendor ({formatINR(Math.round(selectedService.price * 0.85))}), 10% platform maintenance fee, and 5% PG host reward.
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button type="button" variant="ghost" onClick={() => setSelectedService(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming...' : `Confirm & Subscribe (${formatINR(selectedService.price)})`}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
