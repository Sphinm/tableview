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
    let statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
    if (dscr >= 1.25) {
      status = 'Prime Tier (>= 1.25x)';
      statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (dscr >= 1.15) {
      status = 'Standard Qualifying (1.15x - 1.24x)';
      statusColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
    } else if (dscr >= 1.0) {
      status = 'Break-Even Minimum (1.0x - 1.14x)';
      statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
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
      {/* Outer Card Container */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5 sm:p-7 md:p-8">
        {/* Header Bar: Title + Tab Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/80 mb-2">
              <Zap className="size-3" />
              <span>Instant In-Browser Modeler</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight [text-wrap:balance]">
              Live Analytical Playground
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 mt-1 [text-wrap:pretty]">
              Run debt service, equity yields, and wage amortizations directly in memory. Zero server roundtrips.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('mortgage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'mortgage'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Home className="size-3.5 text-indigo-600" />
              <span>Mortgage Loan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dscr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'dscr'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building className="size-3.5 text-cyan-600" />
              <span>DSCR Commercial</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('salary')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'salary'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <DollarSign className="size-3.5 text-emerald-600" />
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
                    <span className="font-bold text-slate-900">Property Purchase Price</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{fmtCurrency(homePrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={2000000}
                    step={10000}
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600 font-medium mt-1">
                    <span>$100k</span>
                    <span>$1.0M</span>
                    <span>$2.0M</span>
                  </div>
                </div>

                {/* Down Payment Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-bold text-slate-900">Down Payment ({downPercent}%)</span>
                    <span className="font-mono text-slate-800 font-medium text-xs">{fmtCurrency(mortgageMath.downAmount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[10, 15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPercent(pct)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          downPercent === pct
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100'
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
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
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
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                      />
                      <Percent className="size-3.5 text-slate-600 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
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
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold shadow-2xs'
                              : 'bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100'
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
                    <span className="font-bold text-slate-900">Gross Annual Rental Income</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{fmtCurrency(annualRent)}</span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={500000}
                    step={5000}
                    value={annualRent}
                    onChange={(e) => setAnnualRent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600 font-medium mt-1">
                    <span>$20k/yr</span>
                    <span>$250k/yr</span>
                    <span>$500k/yr</span>
                  </div>
                </div>

                {/* Operating Expenses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Annual Operating Expenses (Taxes, Ins, Maint)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={annualExpenses}
                      onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-cyan-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Annual Debt Service (P&I)
                    </label>
                    <input
                      type="number"
                      step={1000}
                      value={annualDebtService}
                      onChange={(e) => setAnnualDebtService(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:border-cyan-500 shadow-2xs"
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
                    <span className="font-bold text-slate-900">Base Annual Salary</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{fmtCurrency(annualSalary)}</span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={350000}
                    step={2500}
                    value={annualSalary}
                    onChange={(e) => setAnnualSalary(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600 font-medium mt-1">
                    <span>$25k</span>
                    <span>$150k</span>
                    <span>$350k</span>
                  </div>
                </div>

                {/* Standard Tiers */}
                <div>
                  <span className="block text-xs font-bold text-slate-900 mb-1.5">Common Salary Benchmarks</span>
                  <div className="flex flex-wrap gap-2">
                    {[40000, 50000, 65000, 80000, 100000, 120000].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setAnnualSalary(tier)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                          annualSalary === tier
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100'
                        }`}
                      >
                        ${tier / 1000}k/yr
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours per Week */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Weekly Working Hours: <span className="text-emerald-700 font-mono font-bold">{hoursPerWeek} hrs</span>
                  </label>
                  <div className="flex gap-2">
                    {[35, 40, 45, 50].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setHoursPerWeek(hrs)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          hoursPerWeek === hrs
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-900 font-semibold hover:bg-slate-100'
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

          {/* Right Column: Live Output Card */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 shadow-2xs">
            {activeTab === 'mortgage' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                    Estimated Monthly P&I
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {mortgageTermYears}Y Fixed @ {mortgageRate}%
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight mb-4">
                  {fmtCurrency(mortgageMath.monthlyPI, 2)}
                  <span className="text-xs text-slate-700 font-sans font-medium ml-1.5">/ month</span>
                </div>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Total Loan Amount:</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(mortgageMath.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Lifetime Interest:</span>
                    <span className="font-mono font-semibold text-indigo-700">{fmtCurrency(mortgageMath.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Total Cost of Loan:</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(mortgageMath.totalPaid)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dscr' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                    DSCR Debt Coverage Ratio
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {dscrMath.dscr.toFixed(2)}x
                  </span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-4 ${dscrMath.statusColor}`}>
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>{dscrMath.status}</span>
                </div>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Net Operating Income (NOI):</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(dscrMath.noi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Annual Net Cash Flow:</span>
                    <span className="font-mono font-semibold text-cyan-700">{fmtCurrency(dscrMath.netCashFlow)}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'salary' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-800 font-bold">
                    Equivalent Hourly Wage
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {hoursPerWeek}h/wk Standard
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight mb-4">
                  {fmtCurrency(salaryMath.hourlyRate, 2)}
                  <span className="text-xs text-slate-700 font-sans font-medium ml-1.5">/ hour</span>
                </div>

                {/* Breakdown Matrix */}
                <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Bi-Weekly Paycheck (26x):</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(salaryMath.biweeklyPay, 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">Monthly Gross Pay (12x):</span>
                    <span className="font-mono font-semibold text-slate-900">{fmtCurrency(salaryMath.monthlyPay, 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 font-medium">1.5x FLSA Overtime Rate:</span>
                    <span className="font-mono font-semibold text-emerald-700">{fmtCurrency(salaryMath.overtimeRate, 2)}/hr</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deep Link Action Button */}
            <div className="pt-5 mt-4 border-t border-slate-200">
              {activeTab === 'mortgage' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/mortgage-calculator')}
                  className="group w-full h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
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
                  className="group w-full h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
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
                  className="group w-full h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer"
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
  );
};
