# Stripe — plain processor (NOT a merchant of record)

Research date: **2026-09-20** (all pages accessed this date unless noted). Seller scenario: mainland-China-based individual / company, no US/HK/SG/EU entity, no existing merchant account.
Scope: Stripe only (pricing/eligibility/payouts/Billing/Tax). Paddle / Lemon Squeezy / Polar / Gumroad / Atlas pricing are other agents' scope.

## Stripe

### Eligibility (quoted official text + URL)

- Official supported-country list — https://stripe.com/global (accessed 2026-09-20; no "last updated" shown):
  > "Stripe is currently supported in the following countries/regions, with more to come. Once Stripe is supported in your country/region, you'll be able to sell to customers anywhere in the world."

  The rendered list is: Australia, Austria, Belgium, Brazil, Bulgaria, Canada, Cote d'Ivoire (Extended network), Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Ghana (Extended network), Gibraltar, Greece, **Hong Kong**, Hungary, India (Preview), Indonesia (Preview), Ireland, Italy, Japan, Kenya (Extended network), Latvia, Liechtenstein, Lithuania, Luxembourg, Malaysia, Malta, Mexico, Netherlands, New Zealand, Nigeria (Extended network), Norway, Poland, Portugal, Romania, **Singapore**, Slovakia, Slovenia, South Africa (Extended network), Spain, Sweden, Switzerland, Thailand, United Arab Emirates, United Kingdom, **United States**.

  **Mainland China is NOT in the supported list.** The only "China" on the page is (a) "Hong Kong SAR, China" (a supported region) and (b) "Mainland China" as a *footer locale/language picker* entry (zh-CN UI), not as an account country.

  Self-serve registration links embedded in the same page (https://dashboard.stripe.com/register?country=XX) encode exactly **44 countries**: AE, AT, AU, BE, BG, BR, CA, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GI, GR, HK, HR, HU, IE, IT, JP, LI, LT, LU, LV, MT, MX, MY, NL, NO, NZ, PL, PT, RO, SE, SG, SI, SK, TH, US. **CN is absent; HK, SG and US are present.**

- Same page, for unsupported countries:
  > "Is your business outside of a supported country/region? Use Stripe Treasury with stablecoins to manage your money globally – accessible from the USA and 100+ additional countries/regions. Payments not supported yet. Register interest"

  i.e. a China-based business is offered a stablecoin Treasury waitlist, explicitly "Payments not supported yet."

- Stripe Support, "Requirements to open a Stripe account in another country" — https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country (accessed 2026-09-20; page shows no last-updated date; content extracted from the page's React props because the support site is JS-only):
  > "To open a Stripe account in a country different from your primary business country, you need a legal entity, tax ID, physical location, phone number, government-issued ID, working website, and physical bank account in that country. Stripe must also support processing payments there. Exceptions include accounts opened in Canada with USD-denominated bank accounts, and accounts opened in Europe with EUR-denominated bank accounts."
  >
  > "If supported, you'll will need the following **in that country**: * For Stripe business accounts: A legal entity registered in the same country where you plan to open the account. * A tax ID. * A physical location in that country where you can receive mail, not a PO box. * A phone number. * A government-issued ID, such as a passport or driving licence, from any country. * A working website that shows what your business sells or what services you provide. * A physical bank account in that country denominated in a supported transfer currency for that country. This can't be a virtual bank account."

  This same article points to https://stripe.com/global as the authority for "which countries Stripe currently supports."

- Account country is frozen at activation — https://docs.stripe.com/get-started/account/set-up (accessed 2026-09-20):
  > "After activating a Stripe service on a live account, you can't change the business origin country. To use a different supported country as your primary business location, create a new account."

**Settled answer:** A mainland-China individual OR mainland-China company **cannot open a Stripe account with China as the business country** (CN unlisted on https://stripe.com/global; the only China-facing offer is a stablecoin-Treasury waitlist where "Payments not supported yet"). To use Stripe at all, the seller must place a **legal entity + tax ID + physical address (not PO box) + phone + physical bank account in a supported country**.

### Entity variants (no entity / US LLC / HK / SG)

- **No entity (pure mainland-China individual or company):** Not eligible. China is not a supported account country and Stripe does not pay out to mainland-China bank accounts (see Payouts). Only route advertised: Stripe Treasury with stablecoins, "Payments not supported yet," register interest.
- **US LLC -> Stripe US account (country=US):** Eligible. Requires US legal entity + US EIN (or SSN) + US business address + US phone + US physical bank account. US tax-ID documents accepted — https://docs.stripe.com/acceptable-verification-documents (accessed 2026-09-20):
  > "If your business has an EIN (Multi-member LLC, private/public partnership, private/public corporation, unincorporated association, charity, government entity): Acceptable documents include IRS Letter 147C, IRS SS-4 confirmation letter, IRS Fax Transmission letter, or EIN Assistance Letter."
  > "If you use your SSN (Individual, sole proprietorship, single-member LLC): Stripe checks against the individual listed as owner, not your DBA or business name."
  Owner/representative ID can be a passport "from any country" per the support article. Forming the LLC is out of scope here (Stripe Atlas handled elsewhere), but the outcome maps to a **Stripe US** account.
- **Hong Kong Ltd -> Stripe HK account (country=HK):** Eligible. Stripe HK support — https://support.stripe.com/questions/requirements-for-hong-kong-based-businesses (accessed 2026-09-20):
  > "Stripe requires identification to confirm that you are a representative of the business for which you are filing the application."
  > "If you represent a business in Hong Kong and do not have a HKID, we can accept another form of government-issued identification."
  > "Unfortunately, we can't accept non-HK ID numbers for merchants signing up as individuals. If you don't have a HKID, but do have a Business Registration Number (BRN), please select 'Sole Proprietorship' when activating your Stripe account."
  Practical reading: a mainland-China-resident representative **can** represent a HK business account with a non-HK government ID, but the entity / tax-ID / address / phone / physical-HK-bank requirements still apply.
- **Singapore Pte Ltd -> Stripe SG account (country=SG):** Eligible. Stripe SG — https://support.stripe.com/questions/2025-updates-to-singapore-verification-requirements (accessed 2026-09-20): Representative Authority Verification, UBO (25%+ owners), all directors, verified via Singpass MyInfo / Stripe Identity / ACRA BizFile / Letter of Attestation. A Chinese national is explicitly accommodated — https://docs.stripe.com/acceptable-verification-documents:
  > "For Singapore based Stripe accounts, a CN ID Card is acceptable as proof of Address."

### KYC & bank/payout requirements

- https://docs.stripe.com/acceptable-verification-documents (accessed 2026-09-20):
  > "If the country of residence differs from the country of the account, a passport is required for identity verification"
  > "Credit card statements are acceptable documents for proof of address for China based owners and directors."
  > "For Singapore based Stripe accounts, a CN ID Card is acceptable as proof of Address."
  Identity/address/entity documents must be recent, in colour, uncropped, unprocessed (see "Common requirements").
- Business verification for US: EIN letter (IRS Letter 147C / SS-4 confirmation letter), exact legal name match to IRS records.
- Bank account — https://docs.stripe.com/payouts (accessed 2026-09-20):
  > "The account details required depend on your bank's location. The bank account currency must match the currency in your Payout settings."
  > "Bank accounts generally must be located in a country where the settlement currency is an official currency. For example, SEK bank accounts must be based in Sweden. Stripe also allows you to settle and pay out to banks in select additional currencies, or pay out to non-domestic bank accounts in the local currency."
  > "You can use various types of bank accounts for your Stripe payouts, including traditional accounts offered by established financial institutions (such as checking and savings accounts), virtual bank accounts (such as N26, Revolut, and Wise), and debit cards for instant payouts (if eligible)."
  But the cross-country support article above states the required bank account for an account opened on a foreign entity "can't be a virtual bank account."
- **China bank account:** NOT possible. https://docs.stripe.com/payouts enumerates bank-account formats by country; there is **no mainland-China (CN) section** (only "Hong Kong SAR China" and "Macao SAR China" appear, and those are HK/MO accounts). Stripe therefore cannot pay out to a mainland-China bank account.
- **Payoneer:** **UNVERIFIED / not addressed.** A search of Stripe's docs index (docs.stripe.com/llms.txt) and https://docs.stripe.com/payouts returned **zero** mentions of "Payoneer". The only general rule is the "physical bank account ... can't be a virtual bank account" statement for foreign-entity accounts.
- **Wise:** Contradictory / tension. Stripe's payouts doc names Wise as an acceptable *virtual bank account type*; the foreign-country support article says the required bank account "can't be a virtual bank account." Neither page says Wise may be used to satisfy the local-bank requirement for a China-based owner. Treat "use Wise instead of a local bank account" as **UNVERIFIED**.
- Payout schedule — https://docs.stripe.com/payouts:
  > "First payout: After you successfully receive your first live payment, Stripe typically schedules your initial payout to complete within 7 – 14 days."
  Schedules: manual, daily (every business day), weekly/monthly (chosen days).
- Multi-currency settlement locations — https://docs.stripe.com/payouts/multi-currency-settlement: AE, AU, CH, EU, GB, HK, LI, NO, SG, US. Minimum payout amounts are per-currency (rendered table on that page; values not present in the markdown export — see UNVERIFIED).

### Pricing (official, US locale)

Source: https://stripe.com/pricing (accessed 2026-09-20; no last-updated shown). The page geo-localises by IP — the default fetch returned Singapore pricing (3.4% + S$0.50); forcing the en-US locale returned the US numbers below.

- Cards and wallets:
  > "2.9% + 30c per successful transaction for domestic cards + 0.5% for manually entered cards + 1.5% for international cards + 1% if currency conversion is required"
- Disputes / chargebacks — https://stripe.com/pricing:
  > "Dispute received fee $15.00 for each dispute you receive. In rare cases, network fees also apply. Dispute countered fee $15.00 for each dispute you respond to manually. You get this fee back for won disputes. You don't get this fee back for lost disputes."
- Payouts — https://stripe.com/pricing:
  > "Access funds within minutes through an eligible debit card or bank account. Alternatively, pay out your funds on our standard schedule for free. 1.5% of Instant Payouts volume Minimum fee of 50c"
  Standard (non-instant) payouts to your own bank: **free**. Global Payouts to third parties (different product): "$1.50 per payout" domestic; international "$1.50 per payout cross-border fees starting at + 0.25%".
- Billing — https://stripe.com/billing/pricing (accessed 2026-09-20):
  Pay-as-you-go "0.7% of Billing volume" (page footnote: "Includes Billing transactions processed on and off Stripe. Excludes one-off invoices."), with tiers up to $100,000/month and "0.67% for additional Billing volume"; subscription plans $620 / $1,500 / $2,950 / $5,750 per month on 1-year contracts.
- Tax — https://stripe.com/tax/pricing (accessed 2026-09-20):
  Tax Complete "Starting at $90 per month with registrations, calculations, and filings included"; tiers $90 / $430 / $1,000 / $1,500 per month. Tax Basic "Pay for what you use, with no recurring fees": "0.5% per transaction" (no-code integrations: Billing, Checkout, Invoicing, Payment Links) or "50c per transaction" (API), each transaction including 10 calculation API calls, "5c per calculation API call above 10."
- Radar — https://stripe.com/radar/pricing (accessed 2026-09-20): businesses Radar Standard "Starting at $10 per month", Radar Plus $14/mo, Radar Pro $20/mo; platforms $20 / $44 / $70 per month; "Or pay as you go".
- Radar basic machine-learning fraud protection is included with Stripe payments at no extra listed charge ("Built-in fraud prevention ... No integration required").

### MoR or not + who bears tax

- **Stripe is a plain processor, NOT a merchant of record.** The merchant (the Stripe account holder) is the seller of record. Stripe's Services Agreement, clause 7.3 Taxes — https://stripe.com/legal/ssa (accessed 2026-09-20):
  > "(a) Exclusion of Taxes. The Fees exclude all Taxes, except as the Stripe Pricing Page or other documents expressly state to the contrary. (b) User's Tax Responsibilities. User has sole responsibility and liability for: (i) determining which, if any, Taxes or fees apply to the sale of its products and services, acceptance of donations, or payments it receives in connection with its use of the Services; and (ii) assessing, collecting, reporting, and remitting Taxes for its business to the appropriate tax and revenue authorities."
  Stripe only withholds/remits if "required by Law" (7.3(c)).
- Stripe Tax is a **calculation/collection/registration/filing service, not an MoR** — https://docs.stripe.com/tax and https://docs.stripe.com/tax/how-tax-works (accessed 2026-09-20):
  > "You must register with the tax authority in a location to collect taxes there."
  > "2. Register for tax in those locations. ... the Stripe Tax monitoring tool highlights where you have obligations based on your transactions."
  Stripe Tax supports UK and EU VAT (collection "Supported" for EU member states and the UK in the supported-countries table) — https://docs.stripe.com/tax/supported-countries. EU/UK VAT registrations and filings for a China-controlled entity still need an EU/UK intermediary (non-Union OSS / IOSS rules) — that compliance detail is outside Stripe's own docs and is **UNVERIFIED** here.
- Consequence for this seller: Stripe will not calculate/remit VAT on the seller's behalf unless the seller enables Stripe Tax and registers; the seller (or its local entity) owns all VAT/GST/sales-tax liability, tax refunds, invoices, and B2C digital-services registration.

### Payouts (currencies, countries, schedule, minimum)

- **Where Stripe can pay out to:** per-country bank-detail tables at https://docs.stripe.com/payouts. Includes HK, SG, US, UK, EU, and many cross-border-only territories, but **not mainland China**.
- **Same-country rule:** the payout bank account must be in a country where the settlement currency is official, or one of the supported exceptions (see quote above).
- **Schedule:** manual / daily / weekly / monthly (https://docs.stripe.com/payouts#payout-schedule). First payout typically 7–14 days after the first live payment.
- **Minimums:** per-currency minimum payout amounts are in the "Settlement pricing and minimum payout amounts" table on https://docs.stripe.com/payouts/multi-currency-settlement; the .md export replaces the table with "[See table on original page]" — exact numbers not captured (UNVERIFIED).
- **Fees:** standard payouts free; instant payouts 1.5% (min 50c). Global Payouts (third-party) $1.50/payout domestic, international from $1.50 + 0.25%.
- **Cross-border payouts** (https://docs.stripe.com/connect/cross-border-payouts) is a **Connect-platform** feature only ("allows Connect platforms and marketplaces to pay out connected accounts"), limited to platforms in "the United States, the United Kingdom, the EEA, Canada and Switzerland" paying accounts in those same regions. It is **not** a way for a China-based seller to receive payouts.

### Subscription features (Stripe Billing, no-code + API)

- **Free trials** — https://docs.stripe.com/billing/subscriptions/trials (accessed 2026-09-20):
  > "To offer a free trial subscription, include a 0 USD item in the subscription."
  Trial Offer API supports free (0 USD) and discounted/paid trials, per-item trials, and upgrade trials; it requires API version 2026-03-25.preview and flexible billing mode. Legacy trial_end free trials still work with Checkout / Payment Links. customer.subscription.trial_will_end fires "3 days before the trial period ends"; a free trial with no payment method can pause or cancel ("no-card-required").
- **Proration** — https://docs.stripe.com/billing/subscriptions/prorations (accessed 2026-09-20):
  > "Negative prorations aren't automatically refunded and positive prorations aren't immediately billed, although you can do both manually."
  Prorations can be previewed before applying; proration_behavior controls whether a new invoice is generated.
- **Plan changes / upgrades / downgrades** — https://docs.stripe.com/billing/subscriptions/change-price and https://docs.stripe.com/billing/subscriptions/change (accessed 2026-09-20): modify active subscriptions without cancel/recreate; upgrading/downgrading is done by changing the price. "Billing-related updates create prorations and can generate invoices. These include changing prices, quantities, billing periods or adding or removing subscription items."
- **Customer self-serve portal (no-code, Stripe-hosted)** — https://docs.stripe.com/no-code/customer-portal and https://docs.stripe.com/customer-management/configure-portal (accessed 2026-09-20):
  > "Stripe hosts the customer portal, which means you can use it even if you don't have a website."
  Configurable options (defaults in parentheses): **Switch plan** (Off), **Update quantities** (Off), **Prorate subscription updates** (Off), **Manage downgrades** (Update immediately), **Use promotion codes** (Off), **Cancel subscription** (On), **Cancellation reason** (On), **Retention coupons** (Off), **Payment methods** (On), **Tax ID** (Off), billing address / name / phone. Customers log in via emailed link; cannot change their email in the no-code portal.
- **Refunds** — https://docs.stripe.com/refunds (accessed 2026-09-20):
  > "You can cancel a payment before it's completed at no cost. Or you can refund all or part of a payment after it succeeds, which might incur a fee. Stripe's processing fees from the original transaction aren't returned."
  Refunds are issued via the Refunds API or Dashboard (including bulk full refunds). The customer portal does **not** expose self-serve refunds.
- **Tax on subscriptions:** Stripe Tax "Learn how to collect and report tax for recurring payments" (https://docs.stripe.com/tax/subscriptions) — calculation/collection only; the seller still files/remits.

### Current viability / status

- **As a mainland-China entity: not viable with Stripe.** China is not a supported business location (https://stripe.com/global); the page's only China offer is a stablecoin Treasury waitlist ("Payments not supported yet"); Stripe cannot pay out to a China bank account; and the bank account for any foreign-entity account "can't be a virtual bank account."
- **Viable with a supported-country entity:** US LLC -> Stripe US, HK Ltd -> Stripe HK, SG Pte Ltd -> Stripe SG — **provided** the seller has (a) a legal entity registered there, (b) a local tax ID, (c) a local physical address that receives mail (not a PO box), (d) a local phone, (e) a working website, and (f) a **local physical bank account** in a supported settlement currency. The bank account is the hardest gate; Stripe docs explicitly accommodate a mainland-China-resident owner/director (passport ID; CN ID card for SG proof of address; credit-card statements for China-based owners/directors' proof of address).
- **Pricing for that path** is the US schedule (2.9% + 30c domestic, +1.5% intl cards, +1% FX) if a US LLC is used, or the local schedule for HK/SG (note: Stripe geo-localises https://stripe.com/pricing; the SG schedule fetched was 3.4% + S$0.50).
- **Stripe is not an MoR**, so the seller keeps the VAT/GST/OSS burden for EU/UK B2C sales; Stripe Tax can compute and (on Tax Complete) register/file, but liability and registrations remain the seller's.
- **Biggest operational risks for this seller:** local physical bank account, local address/phone, ongoing KYC/UBO verification, and managing VAT/GST without an MoR. A one-time "deal pass" is fine on Stripe (one-off PaymentIntent / Checkout), but the recurring "Pro" plan means ongoing invoicing/renewal tax handling.

### Sources
- https://stripe.com/global (accessed 2026-09-20) — supported countries; unsupported-country statement.
- https://stripe.com/pricing (accessed 2026-09-20, en-US locale) — card/wallet, disputes, payouts, Global Payouts.
- https://stripe.com/billing/pricing (accessed 2026-09-20) — Billing 0.7%.
- https://stripe.com/tax/pricing (accessed 2026-09-20) — Tax Complete / Tax Basic.
- https://stripe.com/radar/pricing (accessed 2026-09-20) — Radar $10/$14/$20.
- https://stripe.com/legal/ssa (accessed 2026-09-20) — section 7.3 Taxes.
- https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-another-country (accessed 2026-09-20) — entity/tax ID/address/phone/physical bank account.
- https://support.stripe.com/questions/requirements-for-hong-kong-based-businesses (accessed 2026-09-20).
- https://support.stripe.com/questions/2025-updates-to-singapore-verification-requirements (accessed 2026-09-20).
- https://docs.stripe.com/get-started/account/set-up (accessed 2026-09-20) — business origin country is immutable.
- https://docs.stripe.com/get-started/account (accessed 2026-09-20).
- https://docs.stripe.com/acceptable-verification-documents (accessed 2026-09-20) — CN owner/director rules.
- https://docs.stripe.com/payouts (accessed 2026-09-20) — bank details by country, bank-type rules, schedule.
- https://docs.stripe.com/payouts/multi-currency-settlement (accessed 2026-09-20).
- https://docs.stripe.com/connect/cross-border-payouts (accessed 2026-09-20).
- https://docs.stripe.com/tax (accessed 2026-09-20), https://docs.stripe.com/tax/how-tax-works (accessed 2026-09-20), https://docs.stripe.com/tax/supported-countries (accessed 2026-09-20).
- https://docs.stripe.com/billing/subscriptions/trials, /prorations, /change, /change-price (all accessed 2026-09-20).
- https://docs.stripe.com/no-code/customer-portal, https://docs.stripe.com/customer-management/configure-portal (accessed 2026-09-20).
- https://docs.stripe.com/refunds (accessed 2026-09-20).
- SECONDARY (context only, not used for any number): dodopayments.com/blog/is-stripe-a-merchant-of-record, freemius.com/blog/stripe-merchant-of-record — both assert Stripe is not an MoR; corroborates the primary SSA 7.3, which is the citation actually relied on.

### UNVERIFIED
- Whether Payoneer can be used for Stripe payouts or to satisfy the local-bank requirement — **zero mentions of Payoneer in Stripe's docs index or payouts page.**
- Whether Wise (named as an acceptable virtual bank account type in https://docs.stripe.com/payouts) can satisfy the "physical bank account in that country ... can't be a virtual bank account" rule for a foreign-entity account — Stripe's two pages are in tension and neither resolves it.
- Exact per-currency **minimum payout amounts** — the table is rendered client-side; the markdown export says "[See table on original page]". Not captured.
- Exact HK/SG/AU/UK/CA local card rates — https://stripe.com/pricing geo-localises; only the US (2.9% + 30c) and default SG (3.4% + S$0.50) schedules were captured on 2026-09-20.
- Whether Stripe accepts a China-based UBO for a US LLC without an SSN/ITIN — the docs describe EIN vs SSN cases but do not explicitly address a non-resident-alien sole member.
- Last-updated dates: Stripe's docs/support/pricing pages did not display a "last updated" date on any page fetched; freshness could not be confirmed beyond the 2026-09-20 access date.
- India (Preview) and Indonesia (Preview) are listed on /global but Stripe's support article says India is invite-only — the practical meaning of "Preview"/"Extended network" was not verified in this pass (not relevant to the China seller).
