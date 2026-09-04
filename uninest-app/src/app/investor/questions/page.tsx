import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const questions: { q: string; a: string }[] = [
  { q: 'Why would students use UniNest?', a: 'Students currently discover PGs through WhatsApp groups and unverified listings. UniNest provides verified listings with true monthly cost calculators, bed-level availability, and a complete post-booking experience — rent, utilities, maintenance, and dispute resolution — eliminating the fragmented informal process.' },
  { q: 'Why would landlords use UniNest?', a: 'Landlords struggle with vacancy, rent chasing, electricity disputes, and tenant verification. UniNest provides a steady flow of verified students AND operational tools that remain valuable after the PG is full: rent tracking, sub-meter billing, maintenance dispatch, compliance, and ancillary earnings.' },
  { q: 'Why would landlords stay after PG is full?', a: 'This is the critical retention question. Unlike listing portals, UniNest becomes the operating layer — managing rent collection, electricity metering, maintenance tickets, police verification compliance, and providing ancillary service commission revenue. The landlord stays because leaving means losing their management infrastructure.' },
  { q: 'Why not WhatsApp?', a: 'WhatsApp handles messages. UniNest handles the full lifecycle: verified listings, digital booking, KYC, 11-month agreements, automated rent, sub-meter electricity splits, maintenance tracking with evidence, dispute resolution, and documented tenancy history. WhatsApp cannot provide a trusted rental record.' },
  { q: 'Why not MagicBricks / NoBroker?', a: 'General property portals focus on discovery. They do not specialize in student PGs, do not offer bed-level booking, and have no post-booking operating layer. Students need college distance, sharing type, meal inclusion, and true cost transparency — features general portals do not prioritize.' },
  { q: 'Why not NestAway / managed co-living?', a: 'Managed operators own or master-lease properties, requiring heavy capital. UniNest is asset-light — it connects independent landlords with students and provides the technology layer without taking property risk. This allows faster scaling with lower capital requirements.' },
  { q: 'Why would colleges cooperate?', a: 'Colleges face hostel overflow every year. UniNest provides visibility into off-campus student housing conditions without colleges needing to build infrastructure. It is positioned as a welfare and safety tool, not a commercial partnership — reducing institutional friction.' },
  { q: 'What happens if a student doesn\'t pay rent?', a: 'Automated reminders, grace period tracking, and landlord visibility dashboards. Security deposits provide protection. UniNest is not a guarantor — it provides infrastructure for transparency, not insurance. This is clearly communicated in the agreement terms.' },
  { q: 'What happens if a landlord refuses deposit refund?', a: 'The dispute resolution system documents move-in condition, payment history, and maintenance records. This creates an evidence trail. UniNest can mediate but is not a legal authority. The documented record makes informal disputes harder to fabricate.' },
  { q: 'How do you prevent off-platform leakage?', a: 'Post-booking value is the primary retention mechanism. Rent collection, electricity metering, maintenance, and ancillary services all happen on-platform. The landlord receives commission earnings from services — creating financial incentive to remain on UniNest after the initial booking.' },
  { q: 'How do you make money when PGs are full?', a: 'SaaS subscriptions for management tools, payment processing fees on rent transactions, and commission on ancillary services (cleaning, laundry, food, Wi-Fi). A full PG is actually more valuable — more tenants means more transactions and service orders.' },
  { q: 'Why won\'t competitors copy you?', a: 'The moat is execution-based: campus-cluster density, verified local PG supply, landlord relationships, student lifecycle data, and ancillary service networks. These are built through ground-level operations, not just code. A national portal would need to replicate this city-by-city.' },
  { q: 'What will ₹1 lakh accomplish?', a: 'One controlled campus-cluster pilot: build/refine MVP, onboard 50 verified beds, acquire initial students, measure conversion, validate repeat usage, and test unit economics. The goal is data to justify the next funding round — not national scale.' },
  { q: 'How will you know if the idea is working?', a: 'Five pilot success gates: (1) 50 verified beds onboarded, (2) 100 student enquiries, (3) 20% booking conversion, (4) 80% landlord retention at 3 months, (5) positive per-student contribution. If gates are not met, we diagnose and adjust before scaling.' },
  { q: 'What happens during low season?', a: 'Ancillary services (cleaning, laundry, maintenance) generate year-round revenue. Mid-year transfers and short-term stays can partially offset seasonality. The SaaS subscription model provides baseline recurring revenue independent of booking volume.' },
];

export default function InvestorQuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/investor" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600"><ArrowLeft className="w-4 h-4" /> Investor Deck</Link>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Q&A</span>
          <Link href="/demo" className="text-sm font-medium text-brand-600">Demo →</Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Likely Judge / Investor Questions</h1>
        <p className="text-sm text-gray-500 mb-10">Concise, evidence-based answers. No overselling.</p>
        <div className="space-y-4">
          {questions.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-2">{item.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-gray-100 rounded-xl p-4 text-center text-xs text-gray-500">
          All answers represent the planned product thesis and pilot strategy. Claims about market response are hypotheses to be validated during the pilot.
        </div>
      </div>
    </div>
  );
}
