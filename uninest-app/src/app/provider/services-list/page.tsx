'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Wrench, Zap, Wind, Sparkles, Hammer, Bug, Clock, Star, CheckCircle2, X } from 'lucide-react';

const initialServices = [
  { id: 1, name: 'Plumbing', description: 'Pipe repairs, leak fixes, tap replacements', avgTime: '1.5 hrs', rating: 4.8, active: true, icon: Wrench },
  { id: 2, name: 'Electrical', description: 'Wiring, switchboards, appliance installation', avgTime: '2 hrs', rating: 4.9, active: true, icon: Zap },
  { id: 3, name: 'AC/HVAC', description: 'AC servicing, gas refill, installation', avgTime: '1 hr', rating: 4.7, active: true, icon: Wind },
  { id: 4, name: 'Cleaning', description: 'Deep cleaning for single rooms or full PGs', avgTime: '3 hrs', rating: 4.6, active: true, icon: Sparkles },
  { id: 5, name: 'Carpentry', description: 'Furniture repair, door locks, woodwork', avgTime: '2 hrs', rating: 4.5, active: true, icon: Hammer },
  { id: 6, name: 'Pest Control', description: 'General pest control, termite treatment', avgTime: '1.5 hrs', rating: 4.4, active: false, icon: Bug },
];

export default function ServiceOfferingsPage() {
  const [services, setServices] = useState(initialServices);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uninest_provider_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices((prev) =>
            prev.map((s) => {
              const matched = parsed.find((p: any) => p.id === s.id);
              return matched ? { ...s, active: matched.active } : s;
            })
          );
        }
      }
    } catch {}
  }, []);

  const toggleService = (id: number) => {
    const updated = services.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setServices(updated);

    try {
      localStorage.setItem('uninest_provider_services', JSON.stringify(updated.map((s) => ({ id: s.id, active: s.active }))));
    } catch {}

    const target = updated.find((s) => s.id === id);
    if (target) {
      setToastMessage(`${target.name} is now ${target.active ? 'Available for PG Booking' : 'Paused'}.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toastMessage && (
        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Service Offerings</h1>
          <p className="text-text-secondary mt-1">Manage which services you are available for</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <ShoppingBag className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <Card key={service.id} className={service.active ? 'border-brand-200 shadow-sm' : 'opacity-75 grayscale-[0.2]'}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl ${service.active ? 'bg-brand-50 text-brand-600' : 'bg-surface-secondary text-text-tertiary'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">{service.name}</h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                        <Clock className="w-4 h-4" />
                        <span>{service.avgTime}</span>
                      </div>
                      {service.rating > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>{service.rating} Avg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <Badge variant={service.active ? 'success' : 'default'}>
                    {service.active ? 'Active ✅' : 'Inactive'}
                  </Badge>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={service.active}
                      onChange={() => toggleService(service.id)}
                    />
                    <div className="w-11 h-6 bg-surface-tertiary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
