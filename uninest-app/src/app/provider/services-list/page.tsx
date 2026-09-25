'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShoppingBag, Wrench, Zap, Wind, Sparkles, Hammer, Bug, Clock, Star } from 'lucide-react';

const initialServices = [
  { id: 1, name: 'Plumbing', description: 'Pipe repairs, leak fixes, tap replacements', avgTime: '1.5 hrs', rating: 4.8, active: true, icon: Wrench },
  { id: 2, name: 'Electrical', description: 'Wiring, switchboards, appliance installation', avgTime: '2 hrs', rating: 4.9, active: true, icon: Zap },
  { id: 3, name: 'AC/HVAC', description: 'AC servicing, gas refill, installation', avgTime: '1 hr', rating: 4.7, active: true, icon: Wind },
  { id: 4, name: 'Cleaning', description: 'Deep cleaning for single rooms or full PGs', avgTime: '3 hrs', rating: 4.6, active: true, icon: Sparkles },
  { id: 5, name: 'Carpentry', description: 'Furniture repair, door locks, woodwork', avgTime: '2 hrs', rating: 0, active: false, icon: Hammer },
  { id: 6, name: 'Pest Control', description: 'General pest control, termite treatment', avgTime: '1.5 hrs', rating: 0, active: false, icon: Bug },
];

export default function ServiceOfferingsPage() {
  const [services, setServices] = useState(initialServices);

  const toggleService = (id: number) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-6 animate-fade-in">
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
