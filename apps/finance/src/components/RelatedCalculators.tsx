import {
  Building,
  Building2,
  Hammer,
  Home,
  ArrowRightLeft,
  Sparkles,
  Scale,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { navigateTo } from '../lib/router';
import { preloadRoute } from '../lib/routePreload';

export type CalculatorCategory = 'real-estate' | 'consumer' | 'payroll';

interface RelatedCalculatorsProps {
  currentSlug: string;
  category?: CalculatorCategory;
}

interface CalcItem {
  slug: string;
  path: string;
  title: string;
  description: string;
  badge: string;
  icon: any;
  category: CalculatorCategory;
}

const ALL_CALCULATORS: CalcItem[] = [
  {
    slug: 'cap-rate-calculator',
    path: '/cap-rate-calculator',
    title: 'Rental Property & Cap Rate',
    description: 'Model NOI, Cap Rate, Cash-on-Cash Return, 10-year equity and 1% / 50% rules.',
    badge: 'Cash Flow',
    icon: Building,
    category: 'real-estate'
  },
  {
    slug: 'loan-comparison-calculator',
    path: '/loan-comparison-calculator',
    title: 'Loan Comparison Calculator',
    description: 'Compare 2 loans side-by-side: APR, upfront points break-even & lifetime interest.',
    badge: 'Compare',
    icon: Scale,
    category: 'real-estate'
  },
  {
    slug: 'commercial-loan-calculator',
    path: '/commercial-loan-calculator',
    title: 'Commercial Loan & Balloon',
    description: 'Model 5/7/10-yr balloon payoffs, 25-yr amortization & commercial refinance risk.',
    badge: 'Commercial',
    icon: Building2,
    category: 'real-estate'
  },
  {
    slug: 'salary-to-hourly-calculator',
    path: '/salary-to-hourly-calculator',
    title: 'Salary to Hourly Calculator',
    description: 'Convert annual gross salary into hourly wages, bi-weekly checks & FLSA overtime.',
    badge: 'Payroll',
    icon: DollarSign,
    category: 'payroll'
  },
  {
    slug: 'section-1031-exchange-calculator',
    path: '/section-1031-exchange-calculator',
    title: '1031 Exchange Calculator',
    description: 'Realized gain, cash & mortgage boot, deferred tax, and the 45/180-day deadlines.',
    badge: '1031 Exchange',
    icon: Scale,
    category: 'real-estate'
  },
  {
    slug: 'dscr-loan-calculator',
    path: '/dscr-loan-calculator',
    title: 'DSCR Loan Calculator',
    description: 'Rental property cash flow, PITIA debt coverage ratio & qualification tiers.',
    badge: 'Rental ROI',
    icon: Building,
    category: 'real-estate'
  },
  {
    slug: 'hard-money-calculator',
    path: '/hard-money-calculator',
    title: 'Hard Money & Fix-Flip',
    description: 'Short-term bridge financing, points, holding interest & 70% rule MAO.',
    badge: 'Fix & Flip',
    icon: Hammer,
    category: 'real-estate'
  },
  {
    slug: 'mortgage-calculator',
    path: '/mortgage-calculator',
    title: 'Mortgage Payment Calculator',
    description: 'P&I monthly payment breakdown, amortization schedule & PMI milestones.',
    badge: 'Home Loan',
    icon: Home,
    category: 'real-estate'
  },
  {
    slug: 'refinance-calculator',
    path: '/refinance-calculator',
    title: 'Refinance Break-Even',
    description: 'Calculate monthly savings, closing cost payback timeline & lifetime interest.',
    badge: 'Refinance',
    icon: ArrowRightLeft,
    category: 'real-estate'
  }
];

export const RelatedCalculators = ({ currentSlug, category = 'real-estate' }: RelatedCalculatorsProps) => {
  // Filter out current page and prioritize same category, then others
  const related = ALL_CALCULATORS
    .filter((c) => c.slug !== currentSlug)
    .sort((a, b) => {
      if (a.category === category && b.category !== category) return -1;
      if (b.category === category && a.category !== category) return 1;
      return 0;
    })
    .slice(0, 3);

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <div className="my-12 pt-10 border-t border-slate-200 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-1.5">
            <Sparkles className="size-3" />
            <span>More Real Estate & Lending Underwriting Tools</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Explore Related Calculators
          </h3>
        </div>
        <a
          href="/finance-calculator"
          onMouseEnter={() => preloadRoute('/finance-calculator')}
          onFocus={() => preloadRoute('/finance-calculator')}
          onClick={(e) => handleNav(e, '/finance-calculator')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <span>View All Underwriting Calculators</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.slug}
              href={item.path}
              onMouseEnter={() => preloadRoute(item.path)}
              onFocus={() => preloadRoute(item.path)}
              onClick={(e) => handleNav(e, item.path)}
              className="p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 text-slate-700 group-hover:text-indigo-600 transition-colors border border-slate-200">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                <span>Launch Calculator</span>
                <ArrowRight className="size-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
