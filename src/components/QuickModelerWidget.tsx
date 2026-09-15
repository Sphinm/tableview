import { useState, useMemo } from 'react';
import {
  Home,
  Building,
  DollarSign,
  ArrowRight,
  Zap,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { navigateTo } from '../lib/router';

export const QuickModelerWidget = () => {
  const [activeTab, setActiveTab] = useState<'mortgage' | 'dscr' | 'salary'>('mortgage');

  // --- Tab 1: Mortgage Inputs ---
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPercent, setDownPercent] = useState<number>(20);
  const [mortgageRate, setMortgageRate] = useState<number>(6.75);
  const [mortgageTermYears, setMortgageTermYears] = useState<number>(30);

  const mortgageMath = useMemo(() => {
    const downAmount = (homePrice * downPercent) / 100;
    const loanAmount = Math.max(0, homePrice - downAmount);
    const monthlyRate = mortgageRate / 100 / 12;
    const totalMonths = mortgageTermYears * 12;

    let monthlyPI = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyPI =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (loanAmount > 0 && totalMonths > 0) {
      monthlyPI = loanAmount / totalMonths;
    }

    const totalPaid = monthlyPI * totalMonths;
    const totalInterest = Math.max(0, totalPaid - loanAmount);

    return {
      loanAmount,
      downAmount,
      monthlyPI,
      totalInterest,
      totalPaid
    };
  }, [homePrice, downPercent, mortgageRate, mortgageTermYears]);

  // --- Tab 2: DSCR / Commercial Inputs ---
  const [annualRent, setAnnualRent] = useState<number>(84000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(25200);
  const [annualDebtService, setAnnualDebtService] = useState<number>(42000);

  const dscrMath = useMemo(() => {
    const noi = Math.max(0, annualRent - annualExpenses);
    const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
    const netCashFlow = Math.max(0, noi - annualDebtService);

    let status = 'Distressed (< 1.0x)';
    let statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (dscr >= 1.25) {
      status = 'Prime Tier (>= 1.25x)';
      statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (dscr >= 1.15) {
      status = 'Standard Qualifying (1.15x - 1.24x)';
      statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    } else if (dscr >= 1.0) {
      status = 'Break-Even Minimum (1.0x - 1.14x)';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }

    return {
      noi,
      dscr,
      netCashFlow,
      status,
      statusColor
    };
  }, [annualRent, annualExpenses, annualDebtService]);

  // --- Tab 3: Salary Inputs ---
  const [annualSalary, setAnnualSalary] = useState<number>(80000);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);

  const salaryMath = useMemo(() => {
    const totalHoursYear = Math.max(1, hoursPerWeek * 52);
    const hourlyRate = annualSalary / totalHoursYear;
    const biweeklyPay = annualSalary / 26;
    const monthlyPay = annualSalary / 12;
    const overtimeRate = hourlyRate * 1.5;

    return {
      hourlyRate,
      biweeklyPay,
      monthlyPay,
      overtimeRate
    };
  }, [annualSalary, hoursPerWeek]);

  const fmtCurrency = (val: number, decimals = 0) =>
    val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mb-16">
      {/* Outer Doppelrand Shell */}
      <div className="p-[1px] rounded-3xl bg-gradient-to-b from-slate-800/90 via-slate-800/40 to-slate-900/90 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
        {/* Inner Card Container */}
        <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/95 p-5 sm:p-7 md:p-8">
          {/* Header Bar: Title + Tab Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-2">
                <Zap className="size-3" />
                <span>Instant In-Browser Modeler</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight [text-wrap:balance]">
                Live Analytical Playground
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 [text-wrap:pretty]">
                Run debt service, equity yields, and wage amortizations directly in memory. Zero server roundtrips.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('mortgage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'mortgage'
                    ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Home className="size-3.5 text-indigo-400" />
                <span>Mortgage Loan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dscr')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'dscr'
                    ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Building className="size-3.5 text-cyan-400" />
                <span>DSCR Commercial</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('salary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === 'salary'
                    ? 'bg-slate-800 text-slate-100 shadow-xs border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <DollarSign className="size-3.5 text-emerald-400" />
                <span>Salary to Hourly</span>
              </button>
            </div>
          </div>

          {/* Interactive Body Grid: Inputs on Left, Output KPIs on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6">
            {/* Left Column: Sliders & Parameter Controls */}
            <div className="lg:col-span-7 space-y-5">
              {activeTab === 'mortgage' && (
                <>
                  {/* Home Price Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-semibold text-slate-300">Property Purchase Price</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">{fmtCurrency(homePrice)}</span>
                    </div>
                    <input
                      type="range"
                      min={100000}
                      max={2000000}
                      step={10000}
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>$100k</span>
                      <span>$1.0M</span>
                      <span>$2.0M</span>
                    </div>
                  </div>

                  {/* Down Payment Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-semibold text-slate-300">Down Payment ({downPercent}%)</span>
                      <span className="font-mono text-slate-400 text-xs">{fmtCurrency(mortgageMath.downAmount)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[10, 15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDownPercent(pct)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                            downPercent === pct
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Rate & Term */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Interest Rate (APR)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.125}
                          min={2.0}
                          max={15.0}
                          value={mortgageRate}
                          onChange={(e) => setMortgageRate(Number(e.target.value))}
                          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                        <Percent className="size-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Loan Term
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[15, 30].map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setMortgageTermYears(term)}
                            className={`py-2 rounded-xl text-xs font-mono transition-colors ${
                              mortgageTermYears === term
                                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-bold'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {term} Yrs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'dscr' && (
                <>
                  {/* Gross Annual Rent */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-semibold text-slate-300">Gross Annual Rental Income</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">{fmtCurrency(annualRent)}</span>
                    </div>
                    <input
                      type="range"
                      min={20000}
                      max={500000}
                      step={5000}
                      value={annualRent}
                      onChange={(e) => setAnnualRent(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>$20k/yr</span>
                      <span>$250k/yr</span>
                      <span>$500k/yr</span>
                    </div>
                  </div>

                  {/* Operating Expenses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Annual Operating Expenses (Taxes, Ins, Maint)
                      </label>
                      <input
                        type="number"
                        step={1000}
                        value={annualExpenses}
                        onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Annual Debt Service (P&I)
                      </label>
                      <input
                        type="number"
                        step={1000}
                        value={annualDebtService}
                        onChange={(e) => setAnnualDebtService(Number(e.target.value))}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'salary' && (
                <>
                  {/* Annual Salary Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <span className="font-semibold text-slate-300">Base Annual Salary</span>
                      <span className="font-mono font-bold text-slate-100 text-sm">{fmtCurrency(annualSalary)}</span>
                    </div>
                    <input
                      type="range"
                      min={25000}
                      max={350000}
                      step={2500}
                      value={annualSalary}
                      onChange={(e) => setAnnualSalary(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>$25k</span>
                      <span>$150k</span>
                      <span>$350k</span>
                    </div>
                  </div>

                  {/* Standard Tiers */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-300 mb-1.5">Common Salary Benchmarks</span>
                    <div className="flex flex-wrap gap-2">
                      {[40000, 50000, 65000, 80000, 100000, 120000].map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setAnnualSalary(tier)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                            annualSalary === tier
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ${tier / 1000}k/yr
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hours per Week */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Weekly Working Hours: <span className="text-emerald-400 font-mono font-bold">{hoursPerWeek} hrs</span>
                    </label>
                    <div className="flex gap-2">
                      {[35, 40, 45, 50].map((hrs) => (
                        <button
                          key={hrs}
                          type="button"
                          onClick={() => setHoursPerWeek(hrs)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                            hoursPerWeek === hrs
                              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 font-bold'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {hrs}h/wk
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Live Output Card with Double Bezel */}
            <div className="lg:col-span-5 flex flex-col justify-between p-[1px] rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-800/40 to-slate-900/90">
              <div className="rounded-[calc(1rem-1px)] bg-slate-900/90 p-5 sm:p-6 flex-1 flex flex-col justify-between">
                {activeTab === 'mortgage' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Estimated Monthly P&I
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {mortgageTermYears}Y Fixed @ {mortgageRate}%
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight mb-4">
                      {fmtCurrency(mortgageMath.monthlyPI, 2)}
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1.5">/ month</span>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Loan Amount:</span>
                        <span className="font-mono font-semibold text-slate-200">{fmtCurrency(mortgageMath.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lifetime Interest:</span>
                        <span className="font-mono font-semibold text-indigo-300">{fmtCurrency(mortgageMath.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Cost of Loan:</span>
                        <span className="font-mono font-semibold text-slate-200">{fmtCurrency(mortgageMath.totalPaid)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'dscr' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        DSCR Debt Coverage Ratio
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight">
                        {dscrMath.dscr.toFixed(2)}x
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-4 ${dscrMath.statusColor}`}>
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      <span>{dscrMath.status}</span>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Net Operating Income (NOI):</span>
                        <span className="font-mono font-semibold text-slate-200">{fmtCurrency(dscrMath.noi)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Annual Net Cash Flow:</span>
                        <span className="font-mono font-semibold text-cyan-300">{fmtCurrency(dscrMath.netCashFlow)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'salary' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Equivalent Hourly Wage
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {hoursPerWeek}h/wk Standard
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-100 font-mono tracking-tight mb-4">
                      {fmtCurrency(salaryMath.hourlyRate, 2)}
                      <span className="text-xs text-slate-400 font-sans font-normal ml-1.5">/ hour</span>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bi-Weekly Paycheck (26x):</span>
                        <span className="font-mono font-semibold text-slate-200">{fmtCurrency(salaryMath.biweeklyPay, 2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Gross Pay (12x):</span>
                        <span className="font-mono font-semibold text-slate-200">{fmtCurrency(salaryMath.monthlyPay, 2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">1.5x FLSA Overtime Rate:</span>
                        <span className="font-mono font-semibold text-emerald-300">{fmtCurrency(salaryMath.overtimeRate, 2)}/hr</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deep Link Action Button */}
                <div className="pt-5 mt-4 border-t border-slate-800/80">
                  {activeTab === 'mortgage' && (
                    <button
                      type="button"
                      onClick={() => navigateTo('/mortgage-calculator')}
                      className="group w-full h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-between shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <span>Open Full Schedule in Mortgage Calculator</span>
                      <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="size-3" />
                      </span>
                    </button>
                  )}

                  {activeTab === 'dscr' && (
                    <button
                      type="button"
                      onClick={() => navigateTo('/dscr-loan-calculator')}
                      className="group w-full h-10 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-between shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                    >
                      <span>Open Full DSCR Qualification Matrix</span>
                      <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="size-3" />
                      </span>
                    </button>
                  )}

                  {activeTab === 'salary' && (
                    <button
                      type="button"
                      onClick={() => navigateTo('/salary-to-hourly-calculator')}
                      className="group w-full h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <span>Open 52-Week Wage Matrix & Tax Model</span>
                      <span className="size-6 rounded-full bg-white/15 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                        <ArrowRight className="size-3" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
