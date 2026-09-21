# Subagent 3 — FastSpring · Gumroad · Creem · Dodo Payments
**Focus:** can a **mainland-China-based individual / company** sell through each provider, pricing, MoR status, payouts.
**Access date for all pages below: 2026-09-20** (unless a page shows its own last-updated date). Today = 2026-09-20. Figures change; re-verify before integrating.

> Secondary/aggregator material is explicitly labeled **SECONDARY** and is not used to state numbers as fact.
> Anything not found on a primary page is under the provider's **UNVERIFIED** list.

---

## FastSpring
### Eligibility (quoted official text + URL)
- **There is NO published seller-country list.** FastSpring is a US MoR (Bright Market, LLC) that onboards sellers through an underwriting review, not a country checklist.
- Seller Terms of Service (https://fastspring.com/terms-use/seller-terms-service/, accessed 2026-09-20):
  > "FastSpring shall evaluate Vendor according to FastSpring's onboarding and underwriting criteria which may be updated from time to time in FastSpring's sole discretion, and FastSpring may, but shall have no obligation to, reevaluate Vendors following initial onboarding"
  > "In the event FastSpring declines to onboard a potential Vendor, FastSpring shall have no obligation to inform the potential Vendor of the reason(s) for the decision."
  > "FastSpring has the right to implement a hold on your payouts as soon as we onboard your account."
- Developer docs "Activate your store" (https://developer.fastspring.com/docs/activate-your-store, updated 2026-02-13): activation requires business details, a live matching website, identity verification and a FastSpring team review. No country restriction is published.
- Sign-up page (https://fastspring.com/sign-up/) lets anyone start a free test store; live mode is gated by FastSpring approval. No published country list.
- **Conclusion (mainland-China individual):** not explicitly prohibited by any published list, but **cannot be confirmed eligible** — approval is discretionary underwriting. Marked UNVERIFIED. A mainland-China company, HK company, SG company or US LLC are all subject to the same unpublished underwriting; no country-specific differentiation is documented.

### Entity variants
- **No entity (individual/sole proprietor):** Payouts Portal supports Individual accounts (national Tax ID for non-US, SSN for US) — https://developer.fastspring.com/docs/set-up-your-payout-account.
- **US LLC:** W-9 path (US person) — https://developer.fastspring.com/docs/tax-information-reporting.
- **HK / SG company:** W-8 path (non-US), subject to same underwriting.
- **Mainland-China company:** no published rule; UNVERIFIED.

### KYC & bank/payout requirements
- Tax forms (https://developer.fastspring.com/docs/tax-information-reporting, updated 2025-12-27):
  > "The IRS requires FastSpring to collect tax information from sellers earning revenue on our platform. All sellers must complete and update a W-9 or W-8 form in the app."
  > "**Form W-9:** Required for all US persons. **Form W-8:** Required for all persons residing outside the US."
- Payout setup (https://developer.fastspring.com/docs/set-up-your-payout-account): "If you select **Individual**, you will need to enter your **national Tax ID (Non-US Citizens)** or Social Security Number (US Citizens). If you select **Business**, you will need to enter your **business registration number or EIN**."
- Seller terms require disclosure of "personal information of Vendor's beneficial owners, business registration information, tax identification number, and bank account information."
- Payout rail is **Hyperwallet** (fastspring.hyperwallet.com). Transfer methods: **PayPal, Venmo (US only), Bank Account (direct deposit/ACH), Paper Check (USD), Wire Transfer**.
- Currencies (https://developer.fastspring.com/docs/receive-payouts, updated 2026-02-13): **USD, EUR, GBP, AUD, CAD**. "If your Store Currency ... differs from your Payout Currency, FastSpring applies a **2.5% currency conversion fee**."
- Can a China-based person receive money? **UNVERIFIED** — no per-country payout list is published; Hyperwallet/Wire/PayPal availability is determined at transfer-method setup.

### Pricing (URL + access date)
- https://fastspring.com/pricing/ (accessed 2026-09-20; page modified 2026-08-20). **No rate is published.** The live page and the 2026-08-12 Wayback capture both show a "**Talk to Sales**" flow and state:
  > "FastSpring's team will work with you to determine simple, flat-rate pricing based on transaction type and your volume of business — pricing that includes access to every feature and tool in the FastSpring platform."
  > "Our pricing works on a revenue-sharing model and our fees vary depending on the transaction volume you move through FastSpring."
- **Do not trust any flat 5.9% + $0.95 figure from memory or blogs — it is not on the official page (SECONDARY only, e.g. https://www.vendr.com/marketplace/fastspring).**

### MoR or not + who bears tax
- **Yes, FastSpring is the MoR.** https://developer.fastspring.com/docs/welcome-to-fastspring (updated 2026-02-13):
  > "We act as your **Merchant of Record (MoR)**, which means we handle the complexity of global taxes, compliance, and payment processing"
  > "With FastSpring, **we become the legal seller of your products.**"
  > "**Tax management:** We calculate, collect, and remit sales tax and VAT to local authorities worldwide."

### Payouts (currencies, countries, schedule, minimum)
- https://developer.fastspring.com/docs/receive-payouts:
  - "When you start processing live payments, FastSpring places a **45-day monitoring hold** on your account."
  - Default schedule **Twice per Month** (15th and end of month); also Monthly (15th) and Weekly.
  - "**14-day settlement delay**."
  - "The default minimum is **$100 USD** (or the equivalent in your payout currency)."
  - Currencies: USD, EUR, GBP, AUD, CAD (2.5% conversion if store != payout currency).

### Subscription features
- Subscriptions with trials ("Set up trial subscriptions", "Prevent trial hopping"), add-ons, pause, cancellation survey, renewal settings, coupons/discounts, license keys, file downloads, embedded payment management / customer account portal, refunds and chargebacks. Source: https://developer.fastspring.com/llms.txt and linked docs (accessed 2026-09-20).
- Proration on plan changes: **UNVERIFIED** in the pages fetched.
- License keys: https://developer.fastspring.com/docs/license-key-fulfillments (listed in llms.txt).

### Current viability/status
- Operating; legal entity Bright Market, LLC (US). No ownership change found on official pages. **UNVERIFIED:** any recent acquisition/ownership change.

### Sources
- https://fastspring.com/pricing/ (access 2026-09-20)
- https://web.archive.org/web/20260812153917/https://fastspring.com/pricing/ (archived 2026-08-12)
- https://developer.fastspring.com/docs/welcome-to-fastspring
- https://developer.fastspring.com/docs/activate-your-store
- https://developer.fastspring.com/docs/set-up-your-payout-account
- https://developer.fastspring.com/docs/receive-payouts
- https://developer.fastspring.com/docs/tax-information-reporting
- https://fastspring.com/terms-use/seller-terms-service/
- https://developer.fastspring.com/llms.txt

### UNVERIFIED (FastSpring)
- Whether a mainland-China individual or company can actually be approved (no published country list).
- Per-country payout availability (China bank/wire/PayPal).
- Exact effective rate (not published; sales-quoted).
- Proration mechanics for plan changes.
- Any ownership change.

---

## Gumroad
### Eligibility (quoted official text + URL)
- No single "supported countries" article exists. Eligibility is defined by the **payout rail** in "Getting paid by Gumroad" (https://gumroad.com/help/article/13-getting-paid, accessed 2026-09-20):
  > "We support direct bank deposits in the local currency for most countries. For countries where bank deposits are not available, we offer **PayPal transfers as the only payment option**. We do not support alternative payout modes like Payoneer, Wise, check, money order, wire transfer, etc. **If your country is not supported by direct bank deposits or PayPal, then unfortunately, we have no way to pay you out for now.**"
- **Mainland China is NOT in the bank-payout country list.** The published list includes "Hong Kong HKD", "Singapore SGD", but no "China"/"CNY" entry (full list in the same article). So a mainland-China creator would be **PayPal-payout-only at best**.
- Whether Gumroad/PayPal actually pay out to a mainland-issued account is **not stated** -> UNVERIFIED.
- Business/entity note (https://gumroad.com/help/article/260-your-payout-settings-page): "Choose 'Individual' if you operate under your name (effectively as a sole proprietor) or do not have business registration documents. Conversely, choose 'Business' if you already have business registration documents."
- Age: 18+ (or 13-17 with a legal guardian on the account).

### Entity variants
- **No entity:** Individual account type; supported wherever the payout rail works.
- **US LLC:** Business account; US bank payout (Thursday payout day) works.
- **HK / SG company:** Business account; HK (HKD) and Singapore (SGD) are in the bank payout list.
- **Mainland-China individual/company:** bank payout absent from official list -> PayPal-only fallback, actual availability UNVERIFIED.

### KYC & bank/payout requirements
- Payout settings article (https://gumroad.com/help/article/260-your-payout-settings-page):
  > "Gumroad uses **Stripe** to process all credit card payments and bank payouts, and we are subject to Stripe's policies and regulations. Stripe is required to follow **Know Your Customer** obligations..."
  - Stripe may request: "date of birth, legal name, phone number, and address"; "A government ID number (e.g., SSN or your country's national ID)"; "A scan or image of your photo ID"; "Company Tax ID and business registration document (if applicable)"; proof of home address.
  > "Use your full legal name ... Must use a physical address, no PO boxes."
- "Connect your Stripe account to Gumroad" (https://gumroad.com/help/article/330-stripe-connect): "We **no longer support new user-connected Stripe accounts except for users from Brazil**."
- Payout methods: local bank deposit (local currency), PayPal, or (legacy/Brazil) user-connected Stripe. "We do not support ... Payoneer, Wise, check, money order, wire transfer."

### Pricing (URL + access date)
- https://gumroad.com/help/article/66-gumroads-fees (accessed 2026-09-20):
  > "For sales made on Gumroad's website, we charge a **10% + $0.50 fee + sales tax per transaction**. This does not include: Credit card processing (2.9% + $0.30) PayPal fees"
  > "Sales made through Gumroad's marketplace (discovery sales via Gumroad.com) are subject to a **flat 30% fee**, which includes all processing fees."
  > "Once your paid sales in a calendar month reach **$20,000**, new direct sales that month are **5% + $0.50 instead of 10% + $0.50**."
- https://gumroad.com/pricing (accessed 2026-09-20), official title/meta: "Gumroad pricing: 10% + 50¢ direct, 30% via Discover" / "Direct sales: 10% + 50¢ per sale, $0 monthly. Discover marketplace sales: 30%. Gumroad handles sales tax worldwide as Merchant of Record, at no extra cost."

### MoR or not + who bears tax
- **Yes, Gumroad is the MoR.** https://gumroad.com/help/article/121-sales-tax-on-gumroad (accessed 2026-09-20):
  > "**Gumroad now acts as the Merchant of Record for all sales.** This means we automatically handle all sales tax collection and remittance worldwide. You don't need to manage any tax settings or applications - we take care of everything."
- Announcement post (official Gumroad publication): https://gumroad.gumroad.com/p/gumroad-is-becoming-a-merchant-of-record-more-updates (JS-rendered; title captured, body not loadable).

### Payouts (currencies, countries, schedule, minimum)
- From https://gumroad.com/help/article/13-getting-paid (accessed 2026-09-20):
  - Payout currencies = local currency of the listed countries (HKD, SGD, AUD, EUR, GBP, CAD, USD, etc.). "We can only pay out to a local bank account and in your local currency. We cannot pay you out in USD if it is not listed above as your country's payout currency."
  - "Countries showing '(min X)' have a higher minimum payout threshold than the standard **$100 USD** requirement." "**The $100 minimum still applies to weekly, monthly, and quarterly payouts.**"
  - Payout days: Tuesday (most bank countries), Wednesday (EU/AU/CA/SG etc.), Thursday (US), Friday (PayPal + own Stripe). "a minimum **7-day holding period** in your Gumroad balance".
  - Instant payouts: "**Creators from the US** can get paid within minutes for amounts up to $10K and a **3% fee**." No $100 minimum on instant payouts (>= $1).
  - Account review: "The review process can take **1-3 weeks**... Typically, this means 3-4 sales with a balance over US$100."

### Subscription features
- Gumroad sells memberships/subscriptions, license keys, discounts, and a customer library/portal; refund policy is seller-configurable. Details beyond the fee/MoR articles were **not** fully sourced here -> treat specific proration/trial behavior as UNVERIFIED unless read from https://gumroad.com/help.
- Refunds: "When a sale is refunded, Gumroad's own fee on the refunded portion is returned to you; only the underlying payment-processing portion of the fee is retained" (fees article). Custom refund policy: https://gumroad.com/help/article/335-custom-refund-policy.

### Current viability/status + product-restriction flag
- Operating; Gumroad is open-source (github.com/antiwork/gumroad). No ownership change found on official pages.
- **Product restriction that may matter:** "Prohibited products on Gumroad" (https://gumroad.com/prohibited, "Last revised: September 16, 2026") prohibits:
  > "security brokerage services (including, but not limited to, 'get rich quick' schemes, business opportunities, investment opportunities, **mortgage consulting, real estate purchases, mortgage reduction services** and credit repair and protection)"
  - A financial-calculator suite is a tool, not brokerage/consulting, but the mortgage/real-estate wording creates review risk. **Flag to seller.**

### Sources
- https://gumroad.com/help/article/13-getting-paid
- https://gumroad.com/help/article/66-gumroads-fees
- https://gumroad.com/help/article/121-sales-tax-on-gumroad
- https://gumroad.com/help/article/260-your-payout-settings-page
- https://gumroad.com/help/article/330-stripe-connect
- https://gumroad.com/pricing
- https://gumroad.com/prohibited
- https://gumroad.com/help

### UNVERIFIED (Gumroad)
- Whether a mainland-China creator can actually receive PayPal payouts (PayPal country coverage not published by Gumroad).
- Full subscription feature set (trials/proration) from official help.
- Any ownership change.

---

## Creem
### Eligibility (quoted official text + URL)
- https://docs.creem.io/merchant-of-record/supported-countries (accessed 2026-09-20):
  > "Creem supports purchases from all countries except those in the unsupported list below. We support merchants in **87 countries**."
  (The page's own table heading says "Supported Countries (86)" — an internal inconsistency on the page itself.)
- **China is explicitly listed as a supported merchant country:** the table row reads "[China*](/merchant-of-record/finance/payouts#transfer-limits)" with a green check, alongside Hong Kong, Singapore, USA, UK, Canada, Australia, etc.
- Unsupported-for-purchases list (32 countries) includes Russia, Iran, North Korea, Belarus, Cuba, Syria, etc. — **China is not on it**.
- The same page: "If you don't see your country listed below, sorry, you won't be able to use Creem at this time."
- **Mainland-China individual: YES. Mainland-China company: YES** (business payouts to a local bank account per the China note).
- HK / SG / US: all explicitly listed.

### Entity variants
- **No entity / individual:** supported; China individuals receive via **Alipay**.
- **US LLC / HK / SG company:** supported; payouts via Local Bank Transfer.
- **Mainland-China company:** supported; "Business recipient: Local Bank Account" (unlimited, per the China note).

### KYC & bank/payout requirements
- Payout accounts / onboarding are handled in "Balance -> Payout Account"; reviews typically 24-48h (up to 72h) — https://docs.creem.io/merchant-of-record/account-reviews/account-reviews.
- What Creem asks: "Your full individual name and/or your business entity name", store/product URL, business description, product description, "Your country of tax residence" — same page.
- Merchant Terms (https://www.creem.io/terms, accessed 2026-09-20) require disclosure of "shareholding(s) and/or ultimate beneficial owner(s) (UBO(s)), authorised representatives, business activities, and relevant jurisdiction(s)"; only one Merchant Account is allowed.
- **China payout specifics** (https://docs.creem.io/merchant-of-record/finance/payouts#transfer-limits, accessed 2026-09-20):
  > "### China
  > * Individual recipient: **Alipay**
  > * Business recipient: **Local Bank Account**
  > Receiving via Alipay: You can receive up to **50,000 CNY per payout** and between **300,000—600,000 CNY per year**
  > Receiving via Local Bank account: **Unlimited**"
- Payout methods: Local Bank Transfer (all 87 countries) and **USDC on Polygon** (stablecoin). "Some countries have Wise transfer restrictions" — restrictions come from their bank partner (Wise availability page linked).
- Identity mismatch rule: for individuals the payout account must be an individual account whose beneficiary name matches the KYC identity; for businesses the payout account must be a business account matching the entity.

### Pricing (URL + access date)
- https://docs.creem.io/getting-started/introduction (accessed 2026-09-20):
  > "**3.9% + 40¢ flat. No monthly fees. No tax headaches.**"
  > FAQ: "3.9% + 40¢ per successful transaction. No monthly fees, no setup costs, no hidden charges. You only pay when you earn."
- https://www.creem.io/pricing (accessed 2026-09-20): title "Creem Pricing: 3.9% + $0.40 | No Monthly Fees, Simple Setup".
- Additional official fees (https://docs.creem.io/merchant-of-record/finance/payouts):
  - Splits feature: "an additional **2% fee**"
  - Affiliate platform: "an additional **2% fee**"
  - Abandoned cart recovery: "an additional **5% fee**"
  - Payout fee: "Creem charges **7 USD/EUR or 1% of the payout amount, whichever is higher**"
  - Stablecoin (USDC/Polygon): "**2% of the payout volume**"

### MoR or not + who bears tax
- **Yes, Creem is the MoR.** https://docs.creem.io/merchant-of-record/what-is (accessed 2026-09-20):
  > "When customers make a purchase through Creem, they are technically buying from us as the Merchant of Record."
  > "Creem acts as your Merchant of Record, taking on all the complex financial and legal responsibilities"
  > We handle: "**Sales tax collection and remittance**"
- https://docs.creem.io/getting-started/introduction:
  > "We are the legal seller of record. We collect and remit VAT, GST, and sales tax in **190+ countries** so you never touch a tax form."
  > "VAT, GST, and sales tax across 190+ countries. 28+ US states, EU (Estonia OSS), UK, South Korea, and growing."

### Payouts (currencies, countries, schedule, minimum)
- https://docs.creem.io/merchant-of-record/finance/payouts (accessed 2026-09-20):
  > "Payouts are always executed **twice per month**: On the **1st day of the month**, On the **15th day of the month**"
  > "you need to achieve a **minimum balance of 50 USD or 50 EUR**"
  > "Payments may be held for **7-12 days** for risk assessment before they become available for payout."
  - If payout day is weekend/holiday -> next business day.
  - Local bank payouts are in the store currency (USD or EUR) with conversion by banking partners if bank currency differs.
  - USDC/Polygon stablecoin optional (2%).

### Subscription features
- From https://docs.creem.io/getting-started/introduction and https://docs.creem.io/llms.txt (accessed 2026-09-20):
  - One-time payments and recurring subscriptions; "automatic renewals, dunning, trials, and plan management."
  - "subscription lifecycle (trials, upgrades, pauses, cancellations)"
  - Hosted **Customer Portal** — https://docs.creem.io/features/customer-portal: "Customers can cancel and refund subscriptions by themselves." Magic-link access; customers can cancel, request invoices/support.
  - **License keys** ("Generate and deliver software license keys automatically on purchase").
  - Discounts/coupons, seat-based billing, split payments, affiliate program, storefronts.
  - Refunds/chargebacks handled by Creem as MoR ("Management of refunds and chargebacks").

### Current viability/status
- Active; 3,000+ teams claimed on the intro page. Pricing has hardened into a public 3.9% + $0.40. Creem CLI Homebrew tap is armitage-labs/creem (suggests an "Armitage Labs" operating company; exact legal entity **UNVERIFIED**).
- Product-restriction flag: prohibited list includes "**Trading and investment tools and services that enable or facilitate trade execution or automation**" and "Regulated services such as gambling, **lending**, telemarketing, debt relief, or **banking/financing services**". A calculator suite does not execute trades or lend, so it is likely acceptable — but confirm with Creem support given the lending/financing wording.

### Sources
- https://docs.creem.io/merchant-of-record/supported-countries
- https://docs.creem.io/merchant-of-record/finance/payouts
- https://docs.creem.io/merchant-of-record/what-is
- https://docs.creem.io/getting-started/introduction
- https://docs.creem.io/merchant-of-record/account-reviews/account-reviews
- https://docs.creem.io/features/customer-portal
- https://www.creem.io/pricing
- https://www.creem.io/terms

### UNVERIFIED (Creem)
- Exact KYC document list for individuals (ID type accepted for China).
- Whether the 300,000–600,000 CNY/year Alipay cap is hard or advisory; how it interacts with a separate local-bank payout option.
- Legal entity / jurisdiction behind Creem (Armitage Labs connection is inference).

---

## Dodo Payments
### Eligibility (quoted official text + URL)
- https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories (accessed 2026-09-20) — "Countries Eligible for Merchant Acceptance. Full list of countries and territories where Dodo Payments supports merchant accounts and payouts."
  > "Eligibility is based on **the country that issued the government-issued identity document you verify with**, not on where your company is registered or where you pay tax."
  - **China is #32 on the accepted list.** Hong Kong #72, Singapore #143, United States #169, United Kingdom #168, Canada #29, Australia #8.
  > "**Registering a company in a supported country does not by itself make an account eligible.** If a director or beneficial owner can only verify with an ID issued in a country that is not listed below, the account cannot be onboarded."
  > "Tax residence, a residence permit, and a local bank account are all helpful, but none of them replace a government-issued ID from a listed country."
  > "Payouts are supported only in the countries and regions listed above."
- **Mainland-China individual: YES (verify with a China-issued government ID). Mainland-China company: YES if every director/beneficial owner has a China (listed) government ID** — country of incorporation alone is insufficient.
- FAQ Q6 (https://docs.dodopayments.com/miscellaneous/faq): "Yes, we support unregistered businesses as well. You do not need a registered business to use Dodo Payments. You can onboard as an individual and start receiving international payments without any hassle."
- Note: the page references a "prohibited list" with grandfathered countries (Bangladesh, Egypt, Nigeria, Ukraine, etc.); China is **not** in that prohibited set.

### Entity variants
- **No entity / individual:** supported; KYC = own government ID; "Individual: Product Information Form -> Identity Verification (KYC) -> Bank Verification".
- **US LLC:** Registered Entity; adds Business Verification (KYB). A US-incorporated LLC whose owners verify with listed-country IDs is eligible.
- **HK / SG company:** same Registered Entity path; HK and SG are listed.
- **Mainland-China company:** eligible **only if every director/beneficial owner verifies with a listed-country ID** (China is listed, so a fully China-owned company qualifies).

### KYC & bank/payout requirements
- https://docs.dodopayments.com/miscellaneous/verification-process (accessed 2026-09-20):
  - Forms by account type: **Individual** -> Product Information Form -> Identity Verification (KYC) -> Bank Verification; **Registered Entity** -> Product Information Form -> Identity Verification (KYC) -> Business Verification (KYB) -> Bank Verification.
  - "If you are a **UK registered entity**, you must also submit a Tax Form **W-8BEN-E**."
  - Required documents (FAQ Q2): "a valid government-issued ID (for identity verification) and business registration documents (for business verification)."
  - "Most reviews finish within **72 hours**." Live mode is available from day 1; payouts require Bank Verification (+ KYB) **and** Monitoring Review.
  - Website must publicly show "pricing, Terms of Service, Privacy Policy, Refund and Cancellation policy, and a contact route."
- Payout currencies/wallets: https://docs.dodopayments.com/features/payouts/payout-structure — "Payout balances are held in your **USD, GBP, and EUR wallets**." (INR native wallet discontinued.)
  > "Payout routes and currencies vary by country. Contact support@dodopayments.com to confirm how your payouts will be sent and credited before you link a bank account."
- Tax (FAQ Q34): "Dodo Payments acts as the Merchant of Record, handles customer-side tax, and remits where applicable. We no longer require tax forms." (Only UK registered entities need W-8BEN-E.)

### Pricing (URL + access date)
- https://dodopayments.com/pricing (accessed 2026-09-20):
  > "Standard Plan ... **4% + 40¢ per transaction**"
  - Domestic (USA) Cards & Wallets: **4% + 40c**; International Payments: **+1.5%**; PayPal method: **+3%**; BNPL: **+3%**; India INR domestic: 4% + 15c.
  - ACH Direct Debit (US): 1.5% capped at $15; SEPA Direct Debit (EU): 1.5% capped at €15.
  - Subscriptions/Add-ons/Usage-based: **+0.5%** (0.7% per transaction); Invoicing 0.4%; Tax Management "Included 0.5% per transaction"; Analytics & Reporting "$10 per month"; Usage-Based Billing "$1 per Million Events"; BYOP 0.75% + 10c; Storefront 5%; License Keys 4-5%.
  - "No hidden fees. Pay only for what you use." / "4% + 40¢ per transaction" / "40+ payment methods — ready to sell in 220+ countries from day one."
  - Note: some rows display two columns (an included allowance and an overage price) — read the live table for exact bands.

### MoR or not + who bears tax
- **Yes, Dodo is the MoR.** https://docs.dodopayments.com/miscellaneous/merchant-acceptance (accessed 2026-09-20):
  > "Dodo Payments operates as a **Merchant of Record (MoR)**, providing an all-in-one platform for digital businesses for merchants by **acting as their official reseller**. As MoR, Dodo Payments assumes responsibility for payment processing, **tax compliance**, and chargeback handling."
- FAQ Q34: handles customer-side tax and remits where applicable. Pricing page: "Cross-border tax & compliance handle".

### Payouts (currencies, countries, schedule, minimum)
- https://docs.dodopayments.com/features/payouts/payout-structure (accessed 2026-09-20):
  - Cycles: **Bi-Monthly (default)** — period 1st-15th paid 18th; period 16th-EOM paid 4th of next month. **Weekly** on request. **Monthly** (1st-EOM paid 11th of next month).
  - "**Minimum Payout Threshold** USD $50"; "Payouts will only be initiated when the overall wallet balance across all currencies is greater than **$50 USD** (equivalent)."
  - "It typically takes **1-2 business days** for the amount to appear in your bank account."
  - Wallets: USD/GBP/EUR.

### Subscription features
- From https://docs.dodopayments.com/features/subscription, /customer-portal, /license-keys (accessed 2026-09-20):
  - Subscriptions with monthly/annual/custom cycles; **free trials and paid trials** ("Trial Period Days", "Trial Amount"); max 10,000 trial days.
  - **Proration** for upgrades/downgrades (Change Plan API, proration_billing_mode).
  - **Customer Portal** (21 languages): billing history, pause/resume/cancel, update payment methods, retrieve license keys, self-serve plan changes.
  - **License keys** via Entitlements (activation limits, expiry, auto-revoke on cancel/refund/plan change).
  - Dunning, automatic payment retries, digital product delivery, discounts, purchasing-power-parity, adaptive currency, multi-brand.

### Current viability/status + product-restriction flag
- Active and heavily invested (weekly changelogs through Sept 2026); founded 2024; org address "Cosmos Workspaces, Indiranagar, Bengaluru, Karnataka 560075, IN" (schema.org on dodopayments.com).
- **MAJOR product-restriction flag for tableview** — https://docs.dodopayments.com/miscellaneous/merchant-acceptance, prohibited category #7:
  > "**Financial products, services & advice** – We can't support unlicensed financial tools, investment strategies, wealth-building courses, **tax calculators**, banking services, escrow services or anything involving stored value, lending, or managing funds."
  - A US real-estate/lending calculator suite could plausibly be read as an "unlicensed financial tool" / "lending" adjacent product. **Verify with compliance@dodopayments.com before building.** (Category #8 also excludes registration services and #10 professional services.)

### Sources
- https://docs.dodopayments.com/miscellaneous/accepted-countries-and-territories
- https://docs.dodopayments.com/miscellaneous/verification-process
- https://docs.dodopayments.com/miscellaneous/faq
- https://docs.dodopayments.com/miscellaneous/merchant-acceptance
- https://docs.dodopayments.com/features/payouts/payout-structure
- https://docs.dodopayments.com/features/customer-portal
- https://docs.dodopayments.com/features/subscription
- https://docs.dodopayments.com/features/license-keys
- https://dodopayments.com/pricing
- https://dodopayments.com/payments/merchant-of-record

### UNVERIFIED (Dodo)
- Exact China payout route/currency and any per-payout cap (docs say "payout routes and currencies vary by country").
- Whether tableview's financial calculators pass Merchant Acceptance category #7 (needs Dodo confirmation).
- Supported payout currencies beyond USD/GBP/EUR (INR discontinued).
- Legal entity name behind Dodo Payments (India-based per schema; not a quoted ToS line here).

---

## Other providers checked (brief)

### 2Checkout / Verifone (has an official country list)
- Official FAQ "How do I know if 2Checkout is available in my country?" (https://docs.2checkout.com/get-started/getting-started/help-and-faqs, accessed 2026-09-20):
  > "2Checkout is available in most countries, but there are a number of territories and countries that are restricted from doing business with 2Checkout. If you and/or your business are from one of these countries, you cannot use the 2Checkout products and services. Also, 2Checkout does not accept PSP merchants or businesses (2Sell and 2Subscribe accounts) from several countries (Afghanistan, Algeria, American Samoa, Antigua and Barbuda, Bahamas, Benin, Botswana, Brunei Darussalam, Cambodia, Cameroon, Cote d'Ivoire, ... Venezuela, Yemen)."
  - **China is NOT in the published list**, so mainland-China sellers are not excluded by this page (the general restricted-territory list is not exposed as a single downloadable page in the docs index -> partially UNVERIFIED).
- Model: 2Checkout offers both a **Reseller model** (acts as reseller of record, MoR-like tax handling) and a **PSP model**; official solution brief "2Checkout - Reseller Model or PSP?" (https://www.2checkout.com/docs/en/datasheets/2Checkout_-_Reseller_Model_or_PSP_-_Solution_Brief.pdf). The legal Terms pages (www2.2checkout.com/legal/terms, www.2co.com/terms.html) returned empty/blocked bodies in this session.
- Pricing: the live pricing page returned no readable body (JS) -> **UNVERIFIED**. Legacy/enterprise/negotiated; not an indie self-serve path.
- Verdict: plausible on paper for China, but legacy, sales-led, and not MoR-transparent like Creem/Dodo.

### Payhip (NOT a merchant of record)
- https://help.payhip.com/article/173-how-do-i-get-paid ("Last updated on March 3, 2026"; accessed 2026-09-20):
  > "Before you can sell through Payhip, you will need to connect to one of our supported payment processors. Payhip now offers a total of 13 payment processors, allowing sellers from all over the world to distribute their products!"
  > "In most cases, you are able to connect PayPal plus one other payment processor for card and other applicable payment types."
- Because the seller connects their **own** processor (PayPal/Stripe/Mollie/Square/Mercado Pago/Flutterwave/Paystack/Xendit/Midtrans/PayU/Razorpay/Iyzico/PayTabs), Payhip does **not** solve the no-merchant-account problem and does **not** assume VAT/sales-tax liability the way a MoR does. Country eligibility is per-processor.
- Payhip's own pricing page was **Cloudflare-blocked** in this session -> exact Payhip fee UNVERIFIED here (SECONDARY reviews cite ~5% + processor fees).
- Verdict: not a MoR; only a storefront layer on top of a processor the seller must already qualify for.

### Sellfy (not confirmed as a MoR; no country list found)
- https://sellfy.com/pricing/ (accessed 2026-09-20): title "Sellfy Pricing: Plans From $22/mo, 0% Transaction Fees". Body is JS-rendered; Sellfy connects to Stripe/PayPal for payments/payouts. No official seller-country list located.
- MoR status NOT confirmed from official pages -> seller likely remains the seller of record. **UNVERIFIED.**

### Cross-provider verdict for a MAINLAND-CHINA individual (no entity)
- **Creem: YES.** China is a supported merchant country (individual -> Alipay, business -> local bank). 3.9% + $0.40, true MoR, 1st/15th payouts, min 50 USD/EUR.
- **Dodo Payments: YES** (eligibility keyed to a China-issued government ID). 4% + 40¢, true MoR, min $50, bi-monthly. **But check Merchant Acceptance category #7 (financial tools/lending) for tableview.**
- **Gumroad: NOT via bank payout** (China absent from the bank list); PayPal-only path unverified. 10% + $0.50, true MoR.
- **FastSpring: cannot be confirmed** (no published country list or rate); discretionary underwriting.
- **2Checkout/Verifone: not excluded** by the published PSP country list; legacy reseller model; pricing unknown.
- **Payhip / Sellfy: not MoRs**; they don't remove the need for the seller's own processor, so they don't address the core problem.

### UNVERIFIED (other)
- 2Checkout general restricted-territory list; 2Checkout pricing; whether its Reseller (MoR) model is offered to China-based individual sign-ups.
- Payhip transaction fee; Payhip tax responsibility wording (Cloudflare-blocked pricing page).
- Sellfy MoR status and China eligibility.
