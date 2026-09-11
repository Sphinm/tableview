import {
  Building,
  Hammer,
  Home,
  ArrowRightLeft,
  Server,
  PiggyBank,
  Sparkles,
  Scale,
  ArrowRight
} from 'lucide-react';
import { navigateTo } from '../lib/router';

export type CalculatorCategory = 'real-estate' | 'cloud-finops' | 'consumer';

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
  },
  {
    slug: 'snowflake-cost-calculator',
    path: '/snowflake-cost-calculator',
    title: 'Snowflake Warehouse FinOps',
    description: 'Model virtual warehouse credit consumption, auto-suspend & sizing cuts.',
    badge: 'Cloud FinOps',
    icon: Server,
    category: 'cloud-finops'
  },
  {
    slug: 'parquet-storage-calculator',
    path: '/parquet-storage-calculator',
    title: 'Parquet Storage & Query Savings',
    description: 'Estimate AWS S3 storage reductions and Athena/BigQuery scan savings.',
    badge: 'Data Savings',
    icon: PiggyBank,
    category: 'cloud-finops'
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="my-12 pt-10 border-t border-slate-800/80 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1.5">
            <Sparkles className="size-3" />
            <span>More Financial & FinOps Modeling Tools</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
            Explore Related Calculators
          </h3>
        </div>
        <a
          href="/finance-calculator"
          onClick={(e) => handleNav(e, '/finance-calculator')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <span>View All 10+ Calculators</span>
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
              onClick={(e) => handleNav(e, item.path)}
              className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="p-2 rounded-lg bg-slate-800/80 text-slate-300 group-hover:text-indigo-400 transition-colors border border-slate-700/60">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-slate-400 group-hover:text-indigo-300 transition-colors">
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
