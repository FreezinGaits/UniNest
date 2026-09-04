import Link from 'next/link';
import { getSession } from '@/lib/auth/actions';
import {
  Search, Building2, ShieldCheck, CalendarCheck, CreditCard, Zap, Wrench,
  ShoppingBag, ArrowRight, ChevronRight, Users, TrendingUp, BarChart3,
  BedDouble, Star, DollarSign, RefreshCw, CheckCircle2, XCircle,
  MessageSquare, Smartphone, UserCheck
} from 'lucide-react';

export default async function LandingPage() {
  const session = await getSession();

  const roleRoutes: Record<string, string> = {
    STUDENT: '/student/dashboard',
    LANDLORD: '/landlord/dashboard',
    ADMIN: '/admin/dashboard',
    COLLEGE: '/college/dashboard',
    PROVIDER: '/provider/dashboard',
  };

  const userDashboardUrl = session ? (roleRoutes[session.role] || '/student/dashboard') : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Session Header Banner if logged in */}
      {session && (
        <div className="bg-brand-900 text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-brand-300" />
          <span>Logged in as <strong>{session.name}</strong> ({session.role})</span>
          <Link href={userDashboardUrl!} className="underline font-bold hover:text-brand-200 ml-2">
            Go to My Dashboard →
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">UniNest</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/investor" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors hidden sm:block">
              Investor Deck
            </Link>
            <Link href="/demo" className="text-sm font-medium text-gray-600 hover:text-brand-700 transition-colors hidden sm:block">
              Product Demo
            </Link>
            {session ? (
              <Link href={userDashboardUrl!} className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            Pre-Launch Demo — Pilot: Ludhiana
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Student Housing,<br />
            <span className="text-brand-600">Without the Headache.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            UniNest connects students with verified independent PGs — and continues beyond booking with digital tenancy, rent, utilities, maintenance, support, and student services.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-sm text-base">
              <Search className="w-4.5 h-4.5" /> Launch Product Demo
            </Link>
            <Link href="/investor" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all text-base">
              <TrendingUp className="w-4.5 h-4.5 text-brand-600" /> View Investor Deck
            </Link>
          </div>
        </div>
      </section>

      {/* Lifecycle Strip */}
      <section className="py-10 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">The Complete Rental Lifecycle</p>
          <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-0">
            {[
              { label: 'Find', icon: Search }, { label: 'Verify', icon: ShieldCheck }, { label: 'Book', icon: CalendarCheck },
              { label: 'Live', icon: BedDouble }, { label: 'Pay', icon: CreditCard }, { label: 'Manage', icon: Wrench },
              { label: 'Earn', icon: DollarSign }, { label: 'Repeat', icon: RefreshCw },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                    <step.icon className="w-5 h-5 text-brand-700" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600">{step.label}</span>
                </div>
                {i < 7 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Why Now</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">The Student Housing Problem</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">Both sides of the rental market suffer from fragmentation, distrust, and manual processes.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> Student Struggles
              </h3>
              <div className="space-y-3">
                {['Fragmented, unverified listings', 'Hidden charges & surprise costs', 'Lost security deposits', 'No complaint resolution', 'Manual rent via cash/screenshots', 'Unsafe accommodations'].map(p => (
                  <div key={p} className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-900">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Landlord Struggles
              </h3>
              <div className="space-y-3">
                {['High vacancy, manual tenant acquisition', 'Rent chasing & payment delays', 'Electricity dispute calculations', 'Maintenance coordination overhead', 'Tenant verification paperwork', 'No reason to stay on listing platforms after PG is full'].map(p => (
                  <div key={p} className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-amber-900">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center my-10">
            <div className="w-px h-8 bg-brand-200" />
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-white rotate-90" />
            </div>
            <div className="w-px h-8 bg-brand-200" />
          </div>

          <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-brand-800 mb-2">UniNest: One Connected Lifecycle</h3>
            <p className="text-sm text-brand-700 max-w-lg mx-auto">From finding a PG to moving out — verified listings, digital booking, KYC, agreements, rent, utilities, maintenance, disputes, and services — all in one platform.</p>
          </div>
        </div>
      </section>

      {/* Competitive Comparison */}
      <section id="competitive" className="py-16 sm:py-24 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Competitive Positioning</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Why UniNest?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-500">Capability</th>
                  <th className="py-3 px-4 font-semibold text-gray-500">General<br/>Portals</th>
                  <th className="py-3 px-4 font-semibold text-gray-500">PG<br/>Marketplaces</th>
                  <th className="py-3 px-4 font-semibold text-gray-500">Managed<br/>Co-Living</th>
                  <th className="py-3 px-4 font-semibold text-gray-500">Rental<br/>SaaS</th>
                  <th className="py-3 px-4 font-bold text-brand-700 bg-brand-50 rounded-t-lg">UniNest</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Student-specialized discovery', '—', '✓', '—', '—', '✓'],
                  ['Verified PG listings', '—', '~', '✓', '—', '✓'],
                  ['Bed-level booking', '—', '—', '✓', '—', '✓'],
                  ['Digital KYC & Agreement', '—', '—', '✓', '~', '✓'],
                  ['Rent collection', '—', '—', '✓', '✓', '✓'],
                  ['Electricity metering', '—', '—', '~', '~', '✓'],
                  ['Maintenance management', '—', '—', '✓', '✓', '✓'],
                  ['Dispute resolution', '—', '—', '~', '—', '✓'],
                  ['Ancillary services + earnings', '—', '—', '—', '—', '✓'],
                  ['Landlord retention post-fill', '—', '—', 'N/A', '✓', '✓'],
                ].map(([feature, ...cols]) => (
                  <tr key={feature} className="border-b border-gray-100 hover:bg-white transition-colors">
                    <td className="py-2.5 px-4 font-medium text-gray-700">{feature}</td>
                    {cols.map((c, i) => (
                      <td key={i} className={`py-2.5 px-4 text-center ${i === 4 ? 'bg-brand-50 font-bold text-brand-700' : c === '✓' ? 'text-emerald-600' : c === '~' ? 'text-amber-500' : 'text-gray-300'}`}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Landlord Retention Story */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">The Key Question</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">Why does a landlord stay after the PG is full?</h2>
          <p className="text-center text-gray-500 max-w-lg mx-auto mb-10">UniNest is not just a tenant-acquisition channel. It becomes the landlord&#39;s operating layer.</p>

          <div className="relative max-w-xs mx-auto">
            {[
              { label: 'PG is Full', color: 'bg-brand-600 text-white' },
              { label: 'Rent Collection', color: 'bg-brand-100 text-brand-800' },
              { label: 'Electricity Metering', color: 'bg-brand-100 text-brand-800' },
              { label: 'Maintenance Management', color: 'bg-brand-100 text-brand-800' },
              { label: 'Tenant Verification', color: 'bg-brand-100 text-brand-800' },
              { label: 'Digital Agreements', color: 'bg-brand-100 text-brand-800' },
              { label: 'Ancillary Services + Rewards', color: 'bg-emerald-100 text-emerald-800' },
              { label: 'Analytics & Documents', color: 'bg-brand-100 text-brand-800' },
              { label: 'Tenant Leaves → Vacancy', color: 'bg-amber-100 text-amber-800' },
              { label: 'UniNest Finds Next Student', color: 'bg-brand-600 text-white' },
              { label: 'Repeat ↻', color: 'bg-brand-700 text-white font-bold' },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center">
                {i > 0 && <div className="w-px h-4 bg-brand-200" />}
                <div className={`w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium ${step.color}`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Engine */}
      <section className="py-16 sm:py-24 px-4 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Business Model</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-3">How UniNest Makes Money</h2>
          <p className="text-center text-xs text-gray-400 mb-10">Illustrative pricing / demo economics — not actual rates</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Booking Fee', from: 'Student', amount: '₹399', desc: 'Per successful reservation', icon: CalendarCheck },
              { title: 'Success Fee', from: 'Landlord', amount: '₹500', desc: 'Per confirmed move-in', icon: CheckCircle2 },
              { title: 'SaaS Subscription', from: 'Landlord', amount: '₹499–999/mo', desc: 'Pro management tools', icon: BarChart3 },
              { title: 'Payment Processing', from: 'Rent Transactions', amount: '1–2%', desc: 'Gateway economics', icon: CreditCard },
              { title: 'Service Commission', from: 'Vendors', amount: '15–20%', desc: 'Cleaning, laundry, food', icon: ShoppingBag },
              { title: 'College Partnerships', from: 'Institutions', amount: 'Future', desc: 'B2B housing data', icon: Star },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                    <item.icon className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.from}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-brand-700">{item.amount}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Not WhatsApp */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold text-brand-600 uppercase tracking-widest mb-3">Common Question</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">&ldquo;Why not just WhatsApp?&rdquo;</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-700">WhatsApp / Informal Market</h3>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600">
                {['Random listings via groups', 'Phone calls to verify', 'Cash payments / screenshots', 'Manual paper agreements', 'Arguments over electricity', 'No maintenance tracking', 'No dispute evidence'].map(i => (
                  <div key={i} className="flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />{i}</div>
                ))}
              </div>
            </div>
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-brand-800">UniNest</h3>
              </div>
              <div className="space-y-2.5 text-sm text-brand-900">
                {['Verified listings with true-cost', 'Digital bed-level booking', 'Automated rent collection', 'Digital 11-month agreements', 'Sub-meter electricity splits', 'Tracked maintenance tickets', 'Documented dispute resolution'].map(i => (
                  <div key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />{i}</div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6 max-w-lg mx-auto">UniNest replaces fragmented rental administration with one connected workflow.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">See the Full Platform</h2>
          <p className="text-brand-100 mb-8">Explore the complete student housing lifecycle — from search to move-out.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-all">
              <Star className="w-4 h-4" /> Product Demo
            </Link>
            <Link href="/investor" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-brand-300 text-white font-semibold rounded-xl hover:bg-brand-500 transition-all">
              <TrendingUp className="w-4 h-4" /> Investor Deck
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center text-xs">
        <p>© 2026 UniNest. Pre-launch demo — all data is seeded for demonstration purposes.</p>
      </footer>
    </div>
  );
}
