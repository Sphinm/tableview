/**
 * Crawlable FAQ registry — one entry per canonical calculator path.
 *
 * Why this file exists
 * --------------------
 * The calculators used to keep their questions either inline in JSX or loose in
 * the page module. That caused two distinct problems:
 *
 *   1. The prerenderer had nothing to emit, so every calculator URL shipped
 *      ZERO words of static content — invisible to crawlers that do not execute
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
      a: 'A 1031 exchange (named for IRC §1031) lets you defer capital gains tax when you sell investment real property and reinvest the proceeds into replacement property of like kind. You must identify replacement property within 45 days of closing and complete the purchase within 180 days. The gain is not forgiven — it is deferred, and the tax basis carries over into the replacement property, so the deferred gain becomes taxable when you eventually sell without exchanging again.',
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
      a: 'The exchange period ends on the earlier of 180 days after closing or the due date of your tax return for the year of the transfer — including extensions. This is the most commonly missed rule in §1031. If you close in December and do not file for an extension, your return is due April 15, so you may have fewer than 135 days rather than 180. Filing for an extension restores the full 180 days.',
    },
    {
      q: 'Do I have to replace the debt on the relinquished property?',
      a: 'Yes, if you want to avoid mortgage boot. If you pay off a mortgage and do not take on new debt on the replacement property, the debt relief is treated as boot — unless you contribute additional cash at closing equal to the debt relief. You can also replace the debt with cash, or buy a more expensive property using a combination of your proceeds and new financing.',
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
      a: 'Yes, in practice. If you take actual or constructive receipt of the sale proceeds at any point, the exchange is disqualified — your attorney, real estate agent, or accountant cannot act as your intermediary. A qualified intermediary (QI) holds the proceeds in a qualified escrow account between the sale and the purchase. Typical QI fees run roughly $1,000 to $1,500 for a straightforward exchange, plus additional fees for complex structures.',
    },
    {
      q: 'How is depreciation recapture taxed in an exchange?',
      a: 'Depreciation you previously deducted is subject to unrecaptured §1250 gain treatment at a federal rate of up to 25%, rather than the ordinary income rates that apply to other depreciation recapture. In an exchange, recapture is recognised FIRST against any boot you receive, before long-term capital gain. A fully deferred exchange recognises neither, which is a large part of why §1031 exchanges are attractive to rental property owners.',
    },
    {
      q: 'Does every state recognize 1031 exchanges?',
      a: 'No. Most states conform to federal §1031 treatment, but a few do not. Pennsylvania, for example, does not allow deferral of its state income tax on like-kind exchanges. Several conforming states — including California — impose a claw-back that taxes the deferred gain when you later sell the replacement property if it is located outside that state. This calculator takes your state rate as an input rather than guessing, so you should confirm your state’s treatment with a tax advisor.',
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
      a: 'A hard money loan is an asset-based, short-term bridge loan provided by private investors or specialized lending companies to fund the purchase and renovation of real estate. Underwriting is primarily collateral-driven—focusing on the property\'s After Repair Value (ARV) and renovation scope—rather than personal W-2 income.',
    },
    {
      q: 'What is the 70% Rule in real estate flipping?',
      a: 'The 70% rule states that an investor should pay no more than 70% of the After Repair Value (ARV) of a home minus estimated repair and rehab costs: Maximum Allowable Offer (MAO) = (ARV × 70%) - Rehab Costs. The remaining 30% margin covers lender points, holding interest, acquisition/exit closing fees, and developer net profit.',
    },
    {
      q: 'How do hard money points and interest work?',
      a: 'Points are upfront lender origination fees expressed as a percentage of the total loan amount (e.g., 2 points on a $200,000 loan = $4,000). Interest rates typically range from 9.5% to 13.5% annualized, serviced monthly as interest-only payments throughout the 6 to 12 month project duration.',
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
      a: 'Most hard money lenders require a minimum credit score of 620 to 660. Down payments typically range from 10% to 20% of the purchase price (80% to 90% Purchase LTV), while 100% of verified renovation costs are financed in the escrow facility.',
    },
  ],

  '/snowflake-cost-calculator': [
    {
      q: 'How does Snowflake calculate virtual warehouse credit consumption?',
      a: 'Snowflake compute is billed in credits per second, with a 60-second minimum charge every time a warehouse starts or resizes. T-shirt sizes scale exponentially in powers of 2: X-Small consumes 1 credit/hour, Small consumes 2 credits/hour, Medium consumes 4, Large consumes 8, X-Large consumes 16, and up to 6X-Large at 512 credits/hour.',
    },
    {
      q: 'What is the price per Snowflake credit across editions?',
      a: 'On-demand list prices are typically $2.00 per credit for Standard Edition, $3.00 for Enterprise Edition (which includes multi-cluster warehouses and 90-day Time Travel), and $4.00 for Business Critical Edition (which includes HIPAA/PCI compliance, Tri-Secret Secure customer-managed keys, and private networking links).',
    },
    {
      q: 'How does Multi-Cluster Warehouse (MCW) autoscaling affect cost?',
      a: 'Multi-cluster warehouses (available on Enterprise and above) scale horizontally by spinning up identical warehouse clusters (e.g., Min: 1, Max: 4) to eliminate query queue times during peak dashboard spikes. Cost is strictly additive: 3 active Medium clusters running for 1 hour consume 3 × 4 = 12 credits.',
    },
    {
      q: 'What is the recommended Auto-Suspend setting for Snowflake warehouses?',
      a: 'For interactive BI dashboards and ad-hoc analytics, set AUTO_SUSPEND = 60 (1 minute). Because Snowflake bills by the second after the initial 60 seconds, reducing the auto-suspend window from the default 10 minutes down to 1 minute frequently slashes idle compute spend by 25% to 50%.',
    },
    {
      q: 'How much does Snowflake storage cost per TB?',
      a: 'On-demand capacity storage is billed at $40 per TB per month, while committed pre-purchased capacity contracts discount storage down to approximately $23 per TB per month. Snowflake automatically compresses data upon ingestion (typically achieving a 3x to 5x compression factor).',
    },
    {
      q: 'Should I scale up (larger warehouse) or scale out (multi-cluster)?',
      a: 'Scale up (e.g. Medium to Large) when you need to speed up a single heavy ETL job, large aggregation, or memory-intensive query. Scale out (multi-cluster) when hundreds of concurrent users or BI tools like Tableau/Looker are experiencing query queuing delays.',
    },
  ],

  '/parquet-storage-calculator': [
    {
      q: 'Why does Apache Parquet reduce AWS S3 storage bills by 80% to 90%?',
      a: 'Unlike row-based text files (CSV or JSON) where repetitive text strings are duplicated row by row, Apache Parquet organizes data in columns. Similar data types are grouped together, enabling ultra-efficient dictionary encoding, run-length encoding (RLE), bit-packing, and high-ratio compression codecs like ZSTD or Snappy.',
    },
    {
      q: 'How does Parquet cut Amazon Athena and Google BigQuery scanning costs?',
      a: 'Serverless query engines like AWS Athena bill $5.00 per TB of data scanned from S3. Because Parquet is columnar, a query selecting only 3 columns from a 50-column dataset reads ONLY those 3 columns from disk (column projection), skipping 90%+ of the file bytes. Combined with min/max predicate pushdown, Athena scan bills routinely fall by 90% to 99%.',
    },
    {
      q: 'Which Parquet compression codec is best: Snappy, ZSTD, or GZIP?',
      a: 'Snappy is the cloud default: it offers blazing fast decompression speeds with ~75% size reduction, ideal for real-time streaming queries. ZSTD (level 3) is the modern gold standard: it achieves 85% to 90% compression ratios while maintaining decomp speed close to Snappy. GZIP provides maximum compression but suffers from significantly slower decompression CPU overhead.',
    },
    {
      q: 'What is Predicate Pushdown and Row Group Pruning?',
      a: 'Parquet files divide tables into Row Groups (typically 128 MB to 512 MB) and store min/max statistics for every column in the file footer metadata. When you run a query like "WHERE event_date >= \'2025-01-01\'", the query engine reads the footer and skips reading entire row groups that don\'t match the criteria, avoiding millions of bytes of I/O.',
    },
    {
      q: 'Can I convert large CSV or JSON files to Parquet directly in the browser?',
      a: 'Yes! Using TableView\'s DuckDB-Wasm in-browser converter, you can convert gigabyte-sized CSV, JSON, and NDJSON files into Snappy or ZSTD Parquet files directly inside your browser without uploading any confidential data to third-party servers.',
    },
    {
      q: 'How does Parquet compare to Apache ORC or Avro?',
      a: 'Avro is a row-oriented format optimized for write-heavy streaming message queues (Kafka). Parquet and ORC are both columnar formats optimized for analytical read queries (OLAP). Parquet has achieved universal cross-platform dominance across Spark, DuckDB, Trino, Snowflake, Databricks, ClickHouse, and AWS Athena.',
    },
  ],
};
export function getCalculatorFaqs(path: string): CalcFaq[] {
  return CALCULATOR_FAQS[path] ?? [];
}
