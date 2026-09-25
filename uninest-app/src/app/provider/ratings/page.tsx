'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Star, MessageSquare } from 'lucide-react';

const reviews = [
  { id: 1, student: 'Rahul Sharma', rating: 5, date: '12 Sep 2026', service: 'Plumbing Repair', comment: 'Very quick and professional. Fixed the leaky tap in 10 minutes.' },
  { id: 2, student: 'Amit Kumar', rating: 4, date: '05 Sep 2026', service: 'AC Service/Gas Refill', comment: 'Good service, AC is cooling well now. Arrived 15 mins late though.' },
  { id: 3, student: 'Priya Patel', rating: 5, date: '28 Aug 2026', service: 'Deep Cleaning (Full PG)', comment: 'Excellent deep cleaning! The PG looks brand new. Highly recommended.' },
  { id: 4, student: 'Vikram Singh', rating: 5, date: '15 Aug 2026', service: 'Electrical Wiring', comment: 'Fixed the short circuit issue safely and quickly.' },
  { id: 5, student: 'Neha Gupta', rating: 3, date: '02 Aug 2026', service: 'Lock Replacement', comment: 'Job was done, but left a bit of a mess near the door.' },
];

export default function CustomerRatingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Reviews & Ratings</h1>
          <p className="text-text-secondary mt-1">See what students and landlords are saying about your services</p>
        </div>
        <div className="p-2.5 bg-brand-50 rounded-xl">
          <Star className="w-6 h-6 text-brand-600" />
        </div>
      </div>

      <Card className="bg-gradient-to-br from-brand-50 to-white">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm min-w-[150px]">
            <span className="text-4xl font-bold text-text-primary">4.7</span>
            <div className="flex items-center gap-1 mt-2 text-amber-500">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current opacity-50" />
            </div>
            <span className="text-sm text-text-secondary mt-2">34 Total Reviews</span>
          </div>
          
          <div className="flex-1 w-full space-y-3">
            {[
              { stars: 5, count: 22, percent: (22/34)*100 },
              { stars: 4, count: 8, percent: (8/34)*100 },
              { stars: 3, count: 3, percent: (3/34)*100 },
              { stars: 2, count: 1, percent: (1/34)*100 },
              { stars: 1, count: 0, percent: 0 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 text-sm font-medium text-text-secondary">
                  {row.stars} <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-right text-text-secondary">{row.count}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          Recent Reviews
        </h3>
        
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-text-primary">{review.student}</h4>
                  <Badge variant="outline" size="sm">{review.service}</Badge>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-surface-tertiary'}`} 
                    />
                  ))}
                </div>
                <p className="text-text-secondary mt-3">{review.comment}</p>
              </div>
              <div className="text-sm text-text-tertiary whitespace-nowrap">
                {review.date}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
