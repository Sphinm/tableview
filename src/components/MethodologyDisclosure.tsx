import { ShieldCheck, BookOpen, Lock, Scale, Clock } from 'lucide-react';

interface MethodologyDisclosureProps {
  type?: 'mortgage' | 'dscr' | 'refinance' | 'hardmoney' | 'cloud' | 'section1031';
}

export const MethodologyDisclosure = ({ type = 'mortgage' }: MethodologyDisclosureProps) => {
  const getDetails = () => {
    switch (type) {
      case 'dscr':
        return {
          title: 'DSCR Underwriting & Calculation Standards',
          standards: [
            {
              icon: Scale,
              title: 'Standard Formula Alignment',
              desc: 'Calculations strictly use DSCR = Gross Rental Income / Monthly PITIA, matching non-QM secondary market guidelines (Fannie Mae Form 1007 comp rent appraisal standards).'
            },
            {
              icon: BookOpen,
              title: 'Operating Expense Heuristics',
              desc: 'Net cash flow simulations factor in standard 8% property management, 5% vacancy allowance, and 5% ongoing maintenance reserves.'
            },
            {
              icon: Lock,
              title: '100% Private In-Browser Sandbox',
              desc: 'All deal numbers, rental yields, and financial simulations execute strictly in your local device memory. Zero client data is stored or monetized.'
            }
          ]
        };

      case 'refinance':
        return {
          title: 'Mortgage Refinance Break-Even Methodology',
          standards: [
            {
              icon: Scale,
              title: 'Amortization & Interest Recalibration',
              desc: 'Computes monthly payment deltas using exact fixed-rate monthly compounding and accounts for front-loaded interest on remaining loan schedules.'
            },
            {
              icon: BookOpen,
              title: 'Closing Cost & Points Amortization',
              desc: 'Break-even timeline calculates exact months to recoup closing fees and points (Net Closing Costs / Monthly Payment Savings).'
            },
            {
              icon: Lock,
              title: '100% Client-Side Privacy Guarantee',
              desc: 'No personal credit scores, home values, or mortgage balances are ever sent to remote servers or shared with loan brokers.'
            }
          ]
        };

      case 'hardmoney':
        return {
          title: 'Hard Money & 70% Rule Methodology',
          standards: [
            {
              icon: Scale,
              title: '70% Rule of Real Estate Investing',
              desc: 'Calculates Maximum Allowable Offer (MAO) based on 70% of After-Repair Value (ARV) minus estimated renovation costs and carrying fees.'
            },
            {
              icon: BookOpen,
              title: 'Holding Cost & Points Underwriting',
              desc: 'Accurately computes monthly interest-only debt service, lender origination points, title insurance, and property taxes across holding periods.'
            },
            {
              icon: Lock,
              title: '100% Private Real Estate Workbench',
              desc: 'Run deal underwriting safely without exposing proprietary flip opportunities to external databases.'
            }
          ]
        };

      case 'section1031':
        return {
          title: 'IRC §1031 Exchange Methodology',
          standards: [
            {
              icon: Scale,
              title: 'Boot Computed on Both Sides',
              desc: 'Cash boot is measured against the cash actually required at closing, so new financing on the replacement increases it. Mortgage boot is debt relief on the relinquished property, netted against cash contributed beyond your sale proceeds. Recognized gain is the lesser of total boot or realized gain.'
            },
            {
              icon: Clock,
              title: 'Statutory Deadlines Modelled Exactly',
              desc: 'The 45-day identification and 180-day exchange periods run from the closing date. The exchange period ends on the earlier of day 180 or the due date of that year\'s return, including extensions — a rule that shortens many December closings well below 180 days.'
            },
            {
              icon: BookOpen,
              title: 'Identification Safe Harbours',
              desc: 'Applies the three-property rule, the 200% rule, and the 95% rule to each identification, and reports which safe harbour the exchange relies on.'
            },
            {
              icon: Lock,
              title: '100% Private Deal Analysis',
              desc: 'Your basis, depreciation history, and projected gains never leave your device. No account, no upload, no server-side record of your holdings.'
            }
          ]
        };

      case 'cloud':
        return {
          title: 'Cloud FinOps & Benchmark Standards',
          standards: [
            {
              icon: Scale,
              title: 'Public Cloud Provider Benchmarks',
              desc: 'Pricing calibrated against published rates: AWS S3 Standard ($0.023/GB/mo), Athena queries ($5.00/TB scanned), and Snowflake Standard Edition ($2.00-$4.00/credit).'
            },
            {
              icon: BookOpen,
              title: 'Columnar Compression Heuristics',
              desc: 'Calculates data compression ratios (5x - 10x) based on real-world Apache Parquet dictionary encoding, RLE, and Snappy/ZSTD benchmarks.'
            },
            {
              icon: Lock,
              title: 'Zero Telemetry & Egress Fees',
              desc: 'Benchmark your cloud data architecture client-side without connecting your AWS or Snowflake IAM credentials.'
            }
          ]
        };

      case 'mortgage':
      default:
        return {
          title: 'Calculation Methodology & Banking Standards',
          standards: [
            {
              icon: Scale,
              title: 'Standard Fixed-Rate Amortization Math',
              desc: 'Adheres to standard US banking compounding equations: M = P[r(1+r)^n]/[(1+r)^n - 1], matching Fannie Mae & Freddie Mac conventional guidelines.'
            },
            {
              icon: BookOpen,
              title: 'Truth in Lending (Regulation Z) Disclosures',
              desc: 'Transparently isolates Principal & Interest from Property Taxes, Homeowners Insurance, Private Mortgage Insurance (PMI), and HOA assessments.'
            },
            {
              icon: Lock,
              title: '100% Client-Side Privacy Guarantee',
              desc: 'No personal financial data, property values, or household income inputs are ever transmitted over the network.'
            }
          ]
        };
    }
  };

  const info = getDetails();

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 mt-12 mb-8">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <ShieldCheck className="size-4 text-emerald-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          {info.title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {info.standards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <Icon className="size-3.5 text-indigo-400 shrink-0" />
                <span>{s.title}</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
