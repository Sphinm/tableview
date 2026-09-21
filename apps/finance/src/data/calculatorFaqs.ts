/**
 * Crawlable FAQ registry: one entry per canonical calculator path.
 *
 * Why this file exists
 * --------------------
 * The calculators used to keep their questions either inline in JSX or loose in
 * the page module. That caused two distinct problems:
 *
 *   1. The prerenderer had nothing to emit, so every calculator URL shipped
 *      ZERO words of static content: invisible to crawlers that do not execute
 *      JavaScript (Bing's first pass, and most AI crawlers such as GPTBot).
 *
 *   2. The mortgage and refinance pages declared FAQPage structured data whose
 *      questions appeared NOWHERE on the rendered page. Marking up content that
 *      a visitor cannot see violates Google's structured data guidelines and
 *      risks a manual action. Those two pages now render this data visibly.
 *
 * This registry is the single source of truth: pages render FROM it and the
 * prerenderer emits FROM it, so the static HTML can never disagree with what a
 * visitor sees. Adding FAQ markup that is not rendered would be cloaking.
 *
 * If you add a calculator, register it here and render it via
 * <CalculatorFaqSection /> rather than inlining the markup.
 */

export interface CalcFaq {
  q: string;
  a: string;
}

/** Keyed by canonical calculator path. */
export const CALCULATOR_FAQS: Record<string, CalcFaq[]> = {
  '/section-1031-exchange-calculator': [
    {
      q: 'What is a 1031 exchange and how does it work?',
      a: 'A 1031 exchange (named for IRC §1031) lets you defer capital gains tax when you sell investment real property and reinvest the proceeds into replacement property of like kind. You must identify replacement property within 45 days of closing and complete the purchase within 180 days. The gain is not forgiven: it is deferred, and the tax basis carries over into the replacement property, so the deferred gain becomes taxable when you eventually sell without exchanging again.',
    },
    {
      q: 'What is "boot" and when do I have to pay tax on it?',
      a: 'Boot is any value you take out of the exchange instead of rolling into the replacement property. It comes in two forms: cash boot, which is sale proceeds you keep rather than reinvest, and mortgage boot, which is debt paid off on the relinquished property that you do not replace with new financing or additional cash. You are taxed only on the lesser of your total boot or your realized gain. The rest of the gain stays deferred.',
    },
    {
      q: 'Can the 45-day identification period be extended?',
      a: 'No. The 45-day identification period and the 180-day exchange period are both set by statute and cannot be extended for any reason, including hardship, illness, or a death in the family. There is no grace period and no appeal. If day 45 passes without a valid written identification delivered to your qualified intermediary, the exchange fails and the entire gain becomes taxable.',
    },
    {
      q: 'Why might my 180-day deadline be shorter than 180 days?',
      a: 'The exchange period ends on the earlier of 180 days after closing or the due date of your tax return for the year of the transfer (including extensions). This is the most commonly missed rule in §1031. If you close in December and do not file for an extension, your return is due April 15, so you may have fewer than 135 days rather than 180. Filing for an extension restores the full 180 days.',
    },
    {
      q: 'Do I have to replace the debt on the relinquished property?',
      a: 'Yes, if you want to avoid mortgage boot. If you pay off a mortgage and do not take on new debt on the replacement property, the debt relief is treated as boot (unless you contribute additional cash at closing equal to the debt relief). You can also replace the debt with cash, or buy a more expensive property using a combination of your proceeds and new financing.',
    },
    {
      q: 'What are the three identification rules for replacement property?',
      a: 'You must identify replacement property in writing within 45 days, under one of three safe harbours. The three-property rule lets you identify up to three properties of any value. The 200% rule lets you identify any number of properties provided their combined fair market value does not exceed 200% of the relinquished property value. If you breach both, the 95% rule still saves the exchange provided you actually acquire at least 95% of the value you identified.',
    },
    {
      q: 'Can I 1031 exchange my primary residence or a second home?',
      a: 'Generally no. Section 1031 applies only to property held for productive use in a trade or business or for investment. A primary residence does not qualify. A second home may qualify if it was used as a rental or investment property, but the rules are strict and depend on your actual use and holding period. Primary residences are instead eligible for the §121 exclusion, which is a separate and different tax benefit.',
    },
    {
      q: 'Do I need a qualified intermediary, and what do they cost?',
      a: 'Yes, in practice. If you take actual or constructive receipt of the sale proceeds at any point, the exchange is disqualified: your attorney, real estate agent, or accountant cannot act as your intermediary. A qualified intermediary (QI) holds the proceeds in a qualified escrow account between the sale and the purchase. Typical QI fees run roughly $1,000 to $1,500 for a straightforward exchange, plus additional fees for complex structures.',
    },
    {
      q: 'How is depreciation recapture taxed in an exchange?',
      a: 'Depreciation you previously deducted is subject to unrecaptured §1250 gain treatment at a federal rate of up to 25%, rather than the ordinary income rates that apply to other depreciation recapture. In an exchange, recapture is recognised FIRST against any boot you receive, before long-term capital gain. A fully deferred exchange recognises neither, which is a large part of why §1031 exchanges are attractive to rental property owners.',
    },
    {
      q: 'Does every state recognize 1031 exchanges?',
      a: 'No. Most states conform to federal §1031 treatment, but a few do not. Pennsylvania, for example, does not allow deferral of its state income tax on like-kind exchanges. Several conforming states (including California) impose a claw-back that taxes the deferred gain when you later sell the replacement property if it is located outside that state. This calculator takes your state rate as an input rather than guessing, so you should confirm your state’s treatment with a tax advisor.',
    },
  ],

  '/mortgage-calculator': [
    {
      q: 'What is PITI in a monthly mortgage payment?',
      a: 'PITI stands for Principal, Interest, Taxes, and Insurance. These four components make up your total housing payment. In addition, homeowner association (HOA) fees and private mortgage insurance (PMI) may be included depending on your loan structure.',
    },
    {
      q: 'When does Private Mortgage Insurance (PMI) automatically cancel?',
      a: 'Under the federal Homeowners Protection Act, conventional mortgage lenders must automatically cancel PMI once your principal balance reaches 78% of the original home value, or you can request cancellation once your balance reaches 80% LTV.',
    },
    {
      q: 'How does an extra monthly principal payment save money?',
      a: 'Extra principal payments reduce your outstanding balance faster, which reduces future compound interest. Making an extra $100-$200 monthly principal payment can shave 4 to 6 years off a 30-year mortgage and save $30,000+ in interest.',
    },
    {
      q: 'What is the standard formula for a 30-year fixed mortgage?',
      a: 'Monthly payment M = P * [r(1+r)^n] / [(1+r)^n - 1], where P is loan principal, r is monthly interest rate (annual rate / 12), and n is total number of monthly payments (360 for 30 years).',
    },
  ],

  '/refinance-calculator': [
    {
      q: 'How is the refinance break-even point calculated?',
      a: 'Break-even point (in months) = Total upfront closing costs and discount points divided by monthly payment savings. For example, $6,000 in closing costs with $250/month in savings reaches break-even in 24 months.',
    },
    {
      q: 'How does TableView compare to Bankrate or SmartAsset refinance calculators?',
      a: 'Unlike Bankrate or SmartAsset, TableView operates 100% in your browser with zero lead forms and no broker phone spam. Furthermore, TableView provides exclusive net equity break-even analysis (accounting for lost tax deductions), a 30-year reset clock warning to prevent overpaying lifetime interest, and instant Excel downloads.',
    },
    {
      q: 'What is the "30-Year Reset Clock" trap in mortgage refinancing?',
      a: 'When you refinance an existing mortgage that is already partially paid off into a brand new 30-year mortgage, you reset the amortization clock back to year one. While your monthly payment might decrease, you may end up paying significantly more in total lifetime interest. TableView automatically detects and flags this trap with an amber alert.',
    },
    {
      q: 'Does it make sense to refinance from a 30-year to a 15-year mortgage?',
      a: 'Yes, if your goal is long-term wealth building. While your monthly payment may increase slightly, 15-year fixed loans carry lower interest rates and pay down principal twice as fast, saving tens of thousands of dollars in lifetime interest.',
    },
    {
      q: 'What is a zero-closing-cost refinance?',
      a: 'In a zero-cost refinance, the lender pays your closing fees in exchange for a slightly higher interest rate (e.g. +0.25% to +0.375%), or the closing costs are rolled into the loan balance. Your break-even is immediate, making it ideal if you plan to move within 3-5 years.',
    },
    {
      q: 'How does cash-out refinancing work?',
      a: 'A cash-out refinance replaces your existing mortgage with a larger loan balance, providing the difference in cash. Most conventional lenders permit up to 80% Loan-to-Value (LTV) for cash-out refinancing on primary residences.',
    },
  ],

  '/cap-rate-calculator': [
    {
      q: 'What is Capitalization Rate (Cap Rate) and how is it calculated?',
      a: 'Capitalization Rate is the ratio of a property’s annual Net Operating Income (NOI) to its current market value or purchase price: Cap Rate = (Annual NOI / Purchase Price) * 100%. It measures the unleveraged rate of return an investor would earn if purchasing 100% all-cash, allowing apples-to-apples comparison across deals independent of financing terms.',
    },
    {
      q: 'Why does Net Operating Income (NOI) strictly exclude mortgage debt service?',
      a: 'In institutional commercial real estate (CRE) underwriting, NOI isolates the operational earning power of the real estate asset from the buyer’s financing choices. Including debt service in NOI would mean two investors buying identical properties at identical prices and rents would calculate different NOI numbers depending on their loan terms, which destroys comparability.',
    },
    {
      q: 'What is the difference between Cap Rate and Cash-on-Cash Return?',
      a: 'Cap Rate evaluates the property as an unleveraged asset (NOI divided by Purchase Price). Cash-on-Cash Return evaluates the leveraged performance of the investor’s actual out-of-pocket cash: CoC = (Annual Pre-Tax Cash Flow / Total Initial Cash Invested) * 100%, where cash invested includes Down Payment + Closing Costs + Upfront Rehab.',
    },
    {
      q: 'What is a good Cap Rate for rental properties in the United States?',
      a: 'Target Cap Rates vary by asset class and market tier. Tier 1 primary gateway cities (NYC, SF, LA) typically trade at lower cap rates (4.5% to 6.0%) due to stability and strong long-term appreciation. Secondary and tertiary cash-flow markets (e.g. Midwest, Southeast) often trade at 7.0% to 10.0%+ cap rates with higher immediate yields.',
    },
    {
      q: 'What is the 1% Rule in real estate investing?',
      a: 'The 1% Rule is a rapid screening heuristic stating that gross monthly rent should be at least 1.0% of the total purchase price (e.g., $2,500/month rent for a $250,000 property). Properties meeting or exceeding 1% generally produce positive net cash flow after operating expenses and conventional debt service.',
    },
    {
      q: 'What is the difference between Maintenance Reserves and CapEx Reserves?',
      a: 'Maintenance reserves cover routine repairs and turnover costs (leaking faucets, garbage disposals, touch-up paint, re-keying). Capital Expenditures (CapEx) are long-term reserves set aside for major structural replacements (roof replacement, new HVAC compressor, asphalt repaving, water heaters) that occur once every 10 to 30 years.',
    },
    {
      q: 'Can I export my rental property underwriting analysis to Excel?',
      a: 'Yes. TableView provides 1-click native Excel (.xlsx) export containing three dedicated worksheets: Deal Summary & Financing, Itemized Operating Expenses, and a full 10-Year Multi-Year Wealth Accumulation Schedule (including rent growth, equity paydown, and appreciation).',
    },
  ],

  '/dscr-loan-calculator': [
    {
      q: 'Why use TableView DSCR Calculator instead of BiggerPockets Pro?',
      a: 'Unlike BiggerPockets which limits free accounts to 5 property calculations before requiring a $39/month Pro subscription, TableView.dev is 100% free with unlimited calculations, zero sign-up requirements, dual residential and commercial underwriting standards, reverse loan amount solving, and instant Excel exports.',
    },
    {
      q: 'What is a DSCR loan and how does it work?',
      a: 'A DSCR (Debt-Service Coverage Ratio) loan is a non-QM mortgage for real estate investors. Rather than verifying personal W-2 tax returns or personal debt-to-income (DTI) ratios, lenders qualify the loan based solely on the property\'s expected or actual rental income compared to its monthly PITIA (Principal, Interest, Taxes, Insurance, HOA).',
    },
    {
      q: 'What is the minimum DSCR required to qualify?',
      a: 'Most non-QM lenders seek a DSCR of 1.20x to 1.25x for competitive rates and up to 80% LTV. However, many lenders offer sub-1.0 or no-ratio DSCR loans down to 0.75x or even 0.0x for properties in high-appreciation markets or short-term rentals, typically requiring a 25% to 30% down payment.',
    },
    {
      q: 'How is the DSCR ratio calculated?',
      a: 'DSCR = Gross Monthly Rental Income / Monthly PITIA. For example, if a rental property generates $3,000 per month in gross rent and the total monthly payment (PITIA) is $2,400, the DSCR is $3,000 / $2,400 = 1.25x.',
    },
    {
      q: 'Can I use an LLC or corporate entity for a DSCR loan?',
      a: 'Yes. In fact, most DSCR lenders encourage or mandate that properties close in the name of an LLC, LP, or corporation to shield personal assets and facilitate multi-partner syndications.',
    },
    {
      q: 'Are short-term rentals (Airbnb and VRBO) eligible for DSCR financing?',
      a: 'Yes. Many modern DSCR lenders allow projected or historical short-term rental revenue verified through AirDNA Rentalizer or 12-month platform operating statements to underwrite debt service.',
    },
    {
      q: 'What is the difference between Interest-Only and 30-Year Fixed DSCR loans?',
      a: 'An interest-only (I/O) DSCR loan lowers your mandatory monthly payment during the initial 5 to 10 year period by eliminating principal payments. This significantly boosts your monthly DSCR ratio and maximizes immediate cash flow.',
    },
  ],

  '/hard-money-calculator': [
    {
      q: 'Why use TableView Hard Money Calculator instead of DealCheck or Rehab Financial?',
      a: 'Unlike DealCheck which caps free accounts to 15 property analyses and locks full PDF exports behind a monthly subscription, TableView.dev provides 100% free and unlimited deal evaluations, zero account sign-up, selectable Dutch vs as-incurred interest calculations, 70% rule MAO analysis, and instant Excel exports with complete client-side data privacy.',
    },
    {
      q: 'What is a hard money loan and how does it work for house flipping?',
      a: 'A hard money loan is an asset-based, short-term bridge loan provided by private investors or specialized lending companies to fund the purchase and renovation of real estate. Underwriting is primarily collateral-driven (focusing on the property\'s After Repair Value (ARV) and renovation scope) rather than personal W-2 income.',
    },
    {
      q: 'What is the 70% Rule in real estate flipping?',
      a: 'The 70% rule states that an investor should pay no more than 70% of the After Repair Value (ARV) of a home minus estimated repair and rehab costs: Maximum Allowable Offer (MAO) = (ARV × 70%) - Rehab Costs. The remaining 30% margin covers lender points, holding interest, acquisition/exit closing fees, and developer net profit.',
    },
    {
      q: 'How do hard money points and interest work?',
      a: 'Points are upfront lender origination fees expressed as a percentage of the loan amount (e.g., 2 points on a $200,000 loan = $4,000). While typical bridge and hard money interest rates often range from 9.5% to 13.5%+ annualized, terms vary significantly by lender, property type, borrower track record, market conditions, and deal structure. Loans are commonly serviced monthly as interest-only payments throughout the 6 to 18 month project duration.',
    },
    {
      q: 'How does the rehab escrow draw process work?',
      a: 'Lenders do not hand over the entire rehab budget upfront. Instead, funds are held in an escrow account and released in "draws" or disbursements as construction milestones (e.g., framing, rough plumbing, drywall, finishes) are completed and confirmed via third-party site inspections.',
    },
    {
      q: 'What is Dutch interest vs as-incurred interest in hard money lending?',
      a: 'In "Dutch interest", the borrower pays monthly interest on the entire total approved loan amount (purchase loan plus undrawn rehab escrow) from day one. In "as-incurred interest", the borrower only pays interest on the drawn balance, saving thousands of dollars in carrying costs during early construction.',
    },
    {
      q: 'What credit score and down payment are needed for a hard money loan?',
      a: 'Typical underwriting requirements vary by lender, property condition, and borrower experience. Most asset-based bridge lenders look for credit scores around 620 to 660+, while down payments commonly range from 10% to 25% of purchase price (75% to 90% Purchase LTV), with eligible renovation costs escrowed in draw facilities.',
    },
  ],

  '/loan-comparison-calculator': [
    {
      q: 'How do discount points affect my loan comparison?',
      a: 'One mortgage point costs 1% of the loan amount and typically lowers your interest rate by 0.25%. To determine if paying points is worthwhile, divide the upfront cost of the points by the monthly payment savings. If you plan to keep the loan longer than the break-even period (typically 36 to 60 months), buying points saves money.',
    },
    {
      q: 'Why can a 15-year loan save hundreds of thousands in interest?',
      a: 'A 15-year loan features higher monthly principal and interest payments than a 30-year loan, but cuts the compounding timeline in half and usually carries a lower interest rate (0.5% to 1.0% lower). This combination drastically reduces total lifetime interest payments.',
    },
    {
      q: 'How is the break-even point on loan upfront fees calculated?',
      a: 'Break-even in months = (Total Upfront Closing Costs of Loan B - Total Upfront Costs of Loan A) / (Monthly Payment of Loan A - Monthly Payment of Loan B). It tells you how many months you must hold the loan before lower monthly payments compensate for higher upfront origination fees.',
    },
    {
      q: 'What is the benefit of making extra monthly principal payments?',
      a: 'Any extra dollar paid directly toward principal shortens the repayment schedule and eliminates the compound interest that would have accrued on that dollar across remaining years. Even an extra $100/month can shave 3 to 5 years off a 30-year term.',
    },
  ],

  '/commercial-loan-calculator': [
    {
      q: 'What is a balloon payment on a commercial real estate loan?',
      a: 'A balloon payment is the remaining lump-sum principal balance due at the end of a commercial loan term (often 5, 7, or 10 years) when the amortization schedule is longer (typically 20, 25, or 30 years). The borrower must pay off, refinance, or sell the property before the balloon maturity date.',
    },
    {
      q: 'Why do commercial mortgages have 20 or 25-year amortizations with 5 or 10-year terms?',
      a: 'Commercial lenders avoid locking in long-term fixed interest rates for 30 years due to interest rate risk. Structuring loans with a 25-year amortization keeps monthly debt service manageable while a 5-to-10-year maturity allows the bank to re-evaluate underwriting and reset interest rates.',
    },
    {
      q: 'What happens when a commercial balloon loan matures?',
      a: 'Upon maturity, the borrower must satisfy the balloon payment by refinancing with the current lender or a new lender, paying cash from reserves, or selling the asset. Borrowers should begin the refinancing process 6 to 12 months prior to the balloon maturity date.',
    },
    {
      q: 'What is an Interest-Only (IO) period in commercial financing?',
      a: 'During an Interest-Only period (e.g. initial 1 to 3 years), the borrower only pays monthly interest and no principal. This maximizes cash flow during property renovations, tenant lease-up, or stabilization before standard amortization commences.',
    },
  ],

  '/salary-to-hourly-calculator': [
    {
      q: 'What is the standard formula to convert salary to hourly?',
      a: 'Divide your total annual gross salary by the number of hours worked in a year. In a standard full-time role with 40 hours per week and 52 weeks per year (including paid holidays and vacation), there are 2,080 hours. For example, a $75,000 salary equals $75,000 / 2,080 = $36.06/hour.',
    },
    {
      q: 'Why does this calculator not include federal and state income taxes?',
      a: 'This calculator computes pure gross mathematical conversions. Net take-home pay depends on personal W-4 withholding allowances, pre-tax 401(k) and HSA contributions, health insurance deductions, and state tax brackets (which range from 0% in Florida/Texas/Washington to over 13% in California). Providing an inaccurate net tax estimate would be misleading for contract negotiation.',
    },
    {
      q: 'How does paid time off (PTO) affect my effective hourly wage?',
      a: 'If you receive 25 days of paid time off (10 holidays + 15 vacation days), you actually work 1,880 hours instead of 2,080. If you divide your annual salary by only the actual hours worked, your "effective working wage" is higher. However, for payroll calculations, your base hourly rate remains calculated over the 2,080 total paid hours.',
    },
    {
      q: 'How is overtime calculated for salaried non-exempt employees?',
      a: 'For salaried non-exempt employees, the regular hourly rate is determined by dividing the weekly salary by 40 hours. For every hour worked above 40 in that week, the employee receives an extra half-time (0.5x) or time-and-a-half (1.5x) depending on whether the salary was intended to cover all hours worked or standard 40 hours.',
    },
  ],

  '/amortization-schedule-calculator': [
    {
      q: 'What is an amortization schedule and how does it work?',
      a: 'An amortization schedule is a complete table showing every periodic payment over the life of a loan. Each payment is split between the interest charged by the lender and the principal reduction applied to your loan balance.',
    },
    {
      q: 'How does making extra principal payments affect my amortization table?',
      a: 'Extra principal payments reduce your remaining loan balance immediately. Because subsequent interest charges are calculated on a smaller outstanding balance, more of each future payment goes toward principal, accelerating your debt payoff and saving thousands in lifetime interest.',
    },
    {
      q: 'Why is more interest paid during the early years of a mortgage?',
      a: 'Interest is calculated based on the outstanding principal balance. In the first years of a 30-year mortgage, the balance is at its highest, meaning the interest portion of each fixed payment is large. As the balance decreases over time, the interest portion shrinks while principal repayment grows.',
    },
  ],

  '/mortgage-payoff-calculator': [
    {
      q: 'How much interest can I save by paying extra principal each month?',
      a: 'Even an extra $100 to $200 per month applied directly to principal on a standard 30-year fixed mortgage can shave 4 to 6 years off your loan term and save tens of thousands of dollars in cumulative interest charges.',
    },
    {
      q: 'Is it better to make bi-weekly mortgage payments or one lump sum extra payment per year?',
      a: 'Both strategies yield similar results. Making bi-weekly payments results in 26 half-payments per year (equivalent to 13 full payments, or one extra payment annually). The advantage of bi-weekly payments is automatic budgeting without needing a large lump sum.',
    },
    {
      q: 'Does paying extra principal shorten my loan term or lower my monthly payment?',
      a: 'On a standard fixed-rate mortgage, paying extra principal shortens your loan term and eliminates future payments earlier. Your required monthly payment stays the same unless you request a formal loan recast from your servicer.',
    },
  ],

  '/cash-out-refinance-calculator': [
    {
      q: 'How does a cash-out refinance work?',
      a: 'A cash-out refinance replaces your existing mortgage with a new, larger loan balance, allowing you to withdraw the difference between the two loans in cash based on your accumulated home equity.',
    },
    {
      q: 'What is the maximum loan-to-value (LTV) permitted for a cash-out refinance?',
      a: 'Most conventional lenders cap cash-out refinances at 80% LTV on single-family primary residences. FHA loans permit up to 80% LTV, while VA cash-out refinances allow eligible veterans to borrow up to 90% or 100% of appraised home value.',
    },
    {
      q: 'How long does it take to break even on cash-out refinance closing costs?',
      a: 'Break-even time is calculated by dividing total closing costs (typically 2% to 4% of the new loan amount) by your monthly savings if your interest rate decreased. If your interest rate increased, the cost of funds must be compared against alternative borrowing options like HELOCs or personal loans.',
    },
  ],

  '/balloon-payment-calculator': [
    {
      q: 'What is a balloon payment in commercial real estate financing?',
      a: 'A balloon payment is a large lump-sum payment due at the end of a short-term commercial loan (commonly 5, 7, or 10 years) where the monthly payments were amortized over a much longer period (such as 20, 25, or 30 years).',
    },
    {
      q: 'How is the remaining balloon balance calculated at loan maturity?',
      a: 'The balloon balance equals the unpaid principal remaining on the loan after the agreed term. Our calculator models the exact month-by-month amortization schedule to compute the precise dollar balance due at maturity.',
    },
    {
      q: 'What are the main refinance risks associated with commercial balloon mortgages?',
      a: 'Borrowers face refinancing risk if interest rates rise sharply before maturity, if property values decline (lowering debt yield and LTV), or if credit standards tighten. Commercial investors typically begin refinancing discussions 12 to 18 months before the balloon date.',
    },
  ],

  '/1031-exchange-timeline-calculator': [
    {
      q: 'What are the strict 45-day and 180-day deadlines in an IRS Section 1031 exchange?',
      a: 'Under IRC §1031, you have exactly 45 calendar days from closing on your relinquished property to identify potential replacement properties in writing, and exactly 180 calendar days (or your tax return due date, whichever is earlier) to acquire the replacement property.',
    },
    {
      q: 'Can the 45-day or 180-day deadlines be extended if they land on a weekend or holiday?',
      a: 'No. IRS regulations strictly enforce calendar days. If day 45 or day 180 falls on a Saturday, Sunday, or federal holiday, the deadline does NOT roll over to the next business day. Missing the deadline by even one day disqualifies the entire exchange.',
    },
    {
      q: 'How do I avoid taxable boot during a like-kind exchange?',
      a: 'To achieve 100% tax deferral, you must reinvest all net cash proceeds and acquire replacement property of equal or greater value and debt. Any net cash withheld or mortgage debt reduction not offset by fresh capital is considered taxable boot.',
    },
  ],
};
export function getCalculatorFaqs(path: string): CalcFaq[] {
  return CALCULATOR_FAQS[path] ?? [];
}
