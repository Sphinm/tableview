# s4 — TAX / COMPLIANCE: MoR-vs-merchant for a mainland-China solo dev selling digital services (subscriptions + one-time downloads) to consumers in the EU, UK, US, Canada, Australia

- **Access date for every URL below: 2026-09-20**, unless a page shows its own "last updated" date (given where visible). Today's date is 2026-09-20; figures and dates change — re-verify before launch.
- **Scope.** Seller = individual or company in **mainland China**, no US/HK/SG/EU legal entity, no existing merchant account. Products = software subscriptions + one-time digital purchases (both "electronically supplied services" / TBE / digital services). "MoR" = merchant-of-record provider (Paddle / Lemon Squeezy / FastSpring / Creem). "Plain processor" = Stripe / PayPal where the developer is the seller.
- **Bottom line (details + URLs below):**
  1. **EU**: A mainland-China seller is *established outside the EU*, so the EUR 10,000 de-minimis is **not available**; the seller must charge the **customer's-country VAT from the first EU B2C sale** and may use the **non-Union OSS** (one EU Member State of identification, quarterly returns). There is no Chinese VAT to charge instead.
  2. **UK**: Non-UK-established sellers of services have **no UK registration threshold**; must register for UK VAT (**standard rate 20%**) from the first sale. The UK does **not** run an OSS for B2C services; register directly with HMRC.
  3. **US**: Post-*Wayfair*, states impose sales tax on remote sellers with **economic nexus** (state thresholds; SD's original law: over $100,000 or 200+ transactions). **SaaS/digital taxability differs by state** (e.g. Texas treats cloud SaaS as taxable data processing). A **marketplace facilitator / MoR collects** the state tax.
  4. **MoR effect**: with Paddle/Lemon Squeezy/FastSpring the **provider is the seller/merchant of record and is liable** for VAT/GST/sales tax; the developer does **not** register for those taxes on those sales. The developer **still owes income tax / enterprise income tax in China (or HK/SG)** — out of scope but named.
  5. **HK / SG / US LLC change almost nothing for EU/UK VAT** (all are "outside the EU" / "outside the UK" → same destination-VAT + no threshold). They change **provider eligibility/payouts and the developer's own income-tax position**.
- **Access limitation:** eur-lex.europa.eu and legislation.gov.uk serve an AWS/Cloudflare JavaScript challenge to plain fetches; EUR-Lex text below was read through a text-extraction reader of the EUR-Lex page, and is corroborated by the EU Commission's own Explanatory Notes. Quoted EU text is the authentic directive/Commission text.

---

## EU — VAT on electronically supplied services; non-Union OSS

### Eligibility (who must charge what, and where)

**Article 58, Council Directive 2006/112/EC** (as replaced by **Council Directive (EU) 2017/2455**, applicable from 1 January 2019):
> "Article 58
> 1. The place of supply of the following services to a non-taxable person shall be the place where that person is established, has his permanent address or usually resides:
> (a) telecommunications services;
> (b) radio and television broadcasting services;
> (c) electronically supplied services, in particular those referred to in Annex II. …
> 2. Paragraph 1 shall not apply where the following conditions are met:
> (a) the supplier is established or, in the absence of an establishment, has his permanent address or usually resides in only one Member State; and
> (b) services are supplied to non-taxable persons who are established, have their permanent address or usually reside in any Member State other than the Member State referred to in point (a); and
> (c) the total value, exclusive of VAT, of the supplies referred to in point (b) does not in the current calendar year exceed EUR 10 000 … and did not do so in the course of the preceding calendar year."

**Article 59c(1)** (same amending directive):
> "Point (a) of Article 33 and Article 58 shall not apply, where the following conditions are met:
> (a) the supplier is established or, in the absence of an establishment, has his permanent address or usually resides only in one Member State;
> (b) services are supplied to non-taxable persons who are established, have their permanent address or usually reside in any Member State other than the Member State referred to in point (a) …; and
> (c) the total value, exclusive of VAT, of the supplies referred to in point (b) does not in the current calendar year exceed EUR 10 000, or the equivalent in national currency, nor did it do so in the course of the preceding calendar year."

- Directive text source: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32017L2455 (EUR-Lex, accessed 2026-09-20; loaded via a reader because the site is WAF-protected). Consolidated directive: https://eur-lex.europa.eu/eli/dir/2006/112/oj (cited; not machine-loaded).
- **Official OSS site (European Commission, DG TAXUD):** https://vat-one-stop-shop.ec.europa.eu/index_en —
  > "Online sellers, including online marketplaces/platforms can register in one EU Member State and this is valid for the declaration and payment of VAT on all distance sales of goods and cross-border supplies of services to customers within the EU."
  > "New EU-wide threshold of EUR 10 000 … Below this EUR 10 000 threshold, supplies of TBE (telecommunications, broadcasting and electronic) services and distance sales of goods within the EU may remain subject to VAT in the Member State where the taxable person is established."
- **Who may use the non-Union scheme** — https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en :
  > "The OSS schemes are available to taxable persons established in the EU and outside the EU. Taxable persons who are established in the EU can use the Union scheme and the import scheme, whereas taxable persons who are not established in the EU can possibly use all three schemes, i.e. the non-Union, the Union and the import scheme."
- **Registration** — https://vat-one-stop-shop.ec.europa.eu/one-stop-shop/register-oss_en :
  > "For the non-Union scheme, a taxable person (who has neither established his business nor has a fixed establishment in the EU) can choose any Member State to be the Member State of identification. That Member State will allocate an individual VAT identification number to the taxable person (using the format EUxxxyyyyyz). This VAT identification number can only be used to declare supplies falling under the non-Union scheme."
- OSS returns are **quarterly** in the non-Union and Union schemes: "The VAT return is submitted quarterly in the non-Union and in the Union scheme and monthly in the import scheme." (same /one-stop-shop_en page).
- **No EU fiscal representative required for non-Union OSS:** EU Commission *Explanatory Notes on the new VAT e-commerce rules* (2021), section 3.1.5: "Member States may not require non-EU suppliers to appoint a tax representative to be able to use the non-Union scheme (Article 204 of the VAT Directive), but the supplier is free to appoint one." (https://vat-one-stop-shop.ec.europa.eu/guides_en, PDF "Explanatory Notes", accessed 2026-09-20.)

### The EUR 10,000 threshold — does it let a non-EU seller charge its own country's VAT? **NO.**

- The threshold is conditioned on the supplier being "established or, in the absence of an establishment, … permanent address or usually resides **in only one Member State**" (Art. 58(2)(a); Art. 59c(1)(a)). Mainland China is **not a Member State**, so the condition fails.
- The Commission states this explicitly in **Table 5 of the Explanatory Notes** (revised version applies from 1 January 2027; the 2021 version is materially the same):
  > Column heading: **"By suppliers established outside the EU or suppliers established in more than one Member State"**; row **"< EUR 10 000 per year"** → **"Threshold not applicable"**.
  Source PDF: https://vat-one-stop-shop.ec.europa.eu/document/download/774b31ca-03c6-4fb1-8209-9e447aeeb1e9_en?filename=Explanatory%20Notes_revised_1Jan2027_0.pdf (linked from https://vat-one-stop-shop.ec.europa.eu/guides_en; accessed 2026-09-20).
- Same notes, section 3.2.7, restate the Art. 59c(1) conditions verbatim (supplier resident/established in only one Member State; value not over EUR 10,000).
- **What VAT is due if the seller is in mainland China?** China has no EU VAT and the seller has **no EU Member State of establishment** to fall back on, so the place of supply is the **customer's EU Member State** and the seller charges **that Member State's VAT** (standard rates vary by Member State; see the Commission VAT-rates/TEDB pointer at https://vat-one-stop-shop.ec.europa.eu/vat-rates_en). It can declare/pay that destination VAT through the **non-Union OSS** (single Member State of identification, quarterly return + quarterly payment) instead of registering in each Member State.
- **Must a mainland-China seller with no EU establishment register from the first EU B2C digital sale? YES.** No EU de-minimis applies to a supplier established outside the EU; the first sale is taxed at destination. The only choice is *how* to comply: non-Union OSS (one registration, one quarterly return + payment) **or** register directly in each Member State of consumption.
- Historical note (pre-2019 rules that allegedly allowed third-country suppliers under a different threshold): **UNVERIFIED** in this pass; do not rely on it.

### Entity variants (EU VAT)
- **No entity (mainland-China individual) / mainland-China company**: taxable person; must register for the non-Union OSS (or each Member State) for EU B2C digital sales from the first sale.
- **Hong Kong company / Singapore company**: tax-wise still **not established in the EU** → identical result (threshold not applicable; destination VAT, non-Union OSS eligible). HK/SG may affect the developer's own income-tax position and provider/payout eligibility, not the EU VAT analysis.
- **US LLC**: also **not established in the EU** for these supplies → identical EU VAT result. A US LLC does not create an EU fixed establishment merely by selling into the EU.
- **Conclusion**: for EU VAT on B2C digital services the entity variant does **not** remove the obligation; the analysis is driven by the **customer's location**, not the seller's.

### KYC & registration requirements (EU)
- Non-Union OSS registration: register in one chosen Member State; obtain an EUxxx VAT ID used only for OSS (quote above). Quarterly OSS return listing supplies by Member State of consumption, plus quarterly payment.
- No obligation to appoint a fiscal representative for the non-Union scheme (Art. 204; Explanatory Notes quote above).
- Records: "Keep records of all supplies for 10 years for possible audit by Member States' tax authorities" (Explanatory Notes section 3.3).
- Seller is expected to display the VAT amount and collect it: "Display the amount of VAT to be paid by the customer in the EU at the latest when the ordering process is finalised, Collect the VAT from the customer in the EU on the cross-border B2C supplies …" (section 3.3).

### Pricing
- N/A for a jurisdiction. Destination VAT rates vary by Member State; do not hard-code a single EU VAT rate.

### MoR or not + who bears tax (EU)
- **Plain processor (Stripe/PayPal)**: the developer is the seller and is liable for the customer's-country VAT and for OSS registration/returns.
- **MoR (Paddle/Lemon Squeezy/FastSpring)**: the provider is the seller to the consumer and is liable for EU VAT on those sales; the developer does not register for EU VAT on those sales (provider quotes below).

### Payouts / Subscription features
- N/A for the jurisdiction. OSS treats subscriptions as recurring supplies charged when payment is accepted; feature detail is provider scope.

### Current viability/status
- OSS is live and the standard route. **ViDA (VAT in the Digital Age)** was adopted on 11 March 2025 as **Council Directive (EU) 2025/516**, **Council Regulation (EU) 2025/517** and **Commission Implementing Regulation (EU) 2025/518**. Per Directive (EU) 2025/516: amendments in **Article 2 apply from 1 January 2027** (Member States transpose by 31 December 2026) and amendments in **Article 3 apply from 1 July 2028** (transpose by 30 June 2028; platform-economy provisions). The Commission's OSS Explanatory Notes were revised "to include changes introduced by ViDA … that enter into force on 1 January 2027." Monitor the non-Union-scheme scope clarification (Art. 359).
- Source: EUR-Lex CELEX:32025L0516 (https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025L0516); OSS legislation page https://vat-one-stop-shop.ec.europa.eu/eu-legislation_en (lists Directive (EU) 2025/516 and related acts).

### Sources (EU)
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32017L2455 (Art. 58 and 59c as replaced, effective 1 Jan 2019) — accessed 2026-09-20
- https://eur-lex.europa.eu/eli/dir/2006/112/oj (consolidated Directive 2006/112/EC)
- https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025L0516 (ViDA Directive (EU) 2025/516; Art. 2 from 1 Jan 2027, Art. 3 from 1 Jul 2028)
- https://vat-one-stop-shop.ec.europa.eu/index_en ; /one-stop-shop_en ; /one-stop-shop/register-oss_en ; /eu-legislation_en ; /vat-rates_en ; /guides_en — accessed 2026-09-20
- Explanatory Notes (rev. 1 Jan 2027) and 2021 Explanatory Notes (PDFs on /guides_en) — accessed 2026-09-20

---

## UK — VAT on digital services to UK consumers

### Eligibility (who must charge what)
- **Standard rate:** "The standard VAT rate is 20%." — https://www.gov.uk/vat-rates (accessed 2026-09-20).
- **No registration threshold for non-UK-established sellers of services** — HMRC, *Place of supply of services (VAT Notice 741A)*, section 2.6:
  > "If you supply services whose place of supply is in the UK, you may be liable to register for VAT in the UK. **If you are not established in the UK, there is no registration threshold for taxable supplies of services.**"
  https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a (page dateModified: 2022-09-29; accessed 2026-09-20).
- **Register regardless of turnover** — https://www.gov.uk/vat-registration/when-to-register :
  > "You must also register (regardless of taxable turnover) if all of the following are true: you're based outside the UK; your business is based outside the UK; you supply any goods or services to the UK (or expect to in the next 30 days)."
  (The 90,000 GBP threshold applies to UK-established businesses; it is irrelevant to a non-UK-established seller of services.)
- **Digital-services-specific guidance** — HMRC, *VAT rules for supplies of digital services to consumers* (Published 19 Dec 2014; **Last updated 28 March 2022**):
  > "If you are a business making supplies of digital services to UK consumers, those supplies are liable to UK VAT. … **If your supplies are liable to UK VAT you will need to register for UK VAT if you are based outside the UK.**"
  > "If you supply digital services to consumers via a third party platform or marketplace, **the digital platform is responsible for accounting for VAT on the supply instead of you**."
  https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers (accessed 2026-09-20).
- **Answer:** a mainland-China seller must register for UK VAT and charge **20% UK VAT from the first sale to a UK consumer**. There is no UK threshold and no Chinese VAT alternative.

### Non-UK OSS equivalent
- The UK's "One Stop Shop" is a **goods** scheme for distance sales from Northern Ireland to the EU ("All distance sales of goods from Northern Ireland to the EU must be reported on your OSS VAT Return."). HMRC, *Completing a One Stop Shop VAT Return*, Published 20 September 2021, **last updated 25 March 2022**: https://www.gov.uk/guidance/completing-a-one-stop-shop-vat-return (accessed 2026-09-20).
- **I found no UK one-stop shop for B2C services supplied to UK consumers.** Non-UK sellers of digital services register for UK VAT directly with HMRC and file UK VAT returns (usually quarterly). The UK does have an **Import One Stop Shop** for goods: https://www.gov.uk/guidance/register-for-the-vat-import-one-stop-shop-scheme. Treat "UK OSS for services" as **not existing / UNVERIFIED**; do not promise it.

### Entity variants (UK VAT)
- **None / mainland-China company / HK / SG / US LLC**: all are **not established in the UK** → no registration threshold; UK VAT from first sale. A US LLC does not create a UK establishment for these purposes. (A UK fixed establishment would change this, but a client-only web app with no UK people/premises generally does not create one — legal analysis beyond this note.)

### KYC & registration requirements (UK)
- Register as a **non-established taxable person (NETP)**; Notice 741A cross-refers to VAT Notice 700/1 for NETPs. Exact NETP documentation / whether a UK representative is required: **UNVERIFIED** in this pass.
- Keep records and file UK VAT returns; if selling via a platform/marketplace, the platform accounts for VAT instead (quote above).

### Pricing
- UK VAT is 20% standard rate (source above). Digital services to consumers are standard-rated.

### MoR or not + who bears tax (UK)
- Plain processor: developer registers and remits 20%.
- MoR / marketplace: the platform is responsible for accounting for UK VAT on the supply (HMRC quote above). Provider-specific confirmation is provider scope.

### Current viability/status
- Rules in force; no UK OSS for B2C services. No post-Brexit change sourced here.

### Sources (UK)
- https://www.gov.uk/vat-rates (standard rate 20%)
- https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a (section 2.6 no threshold; dateModified 2022-09-29)
- https://www.gov.uk/vat-registration/when-to-register (register regardless of turnover if based outside UK)
- https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers (last updated 28 Mar 2022)
- https://www.gov.uk/guidance/completing-a-one-stop-shop-vat-return (OSS is goods/NI-to-EU; last updated 25 Mar 2022)

---

## US — state sales tax (no federal VAT)

### Eligibility (nexus)
- **South Dakota v. Wayfair, Inc.**, No. 17-494 (U.S. Supreme Court, decided **June 21, 2018**), https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf (accessed 2026-09-20):
  > "**Because the physical presence rule of *Quill* is unsound and incorrect, *Quill Corp. v. North Dakota*, 504 U. S. 298, and *National Bellas Hess, Inc. v. Department of Revenue of Ill.*, 386 U. S. 753, are overruled.**"
  > (describing South Dakota's law) "The Act covers only sellers that, on an annual basis, deliver more than **$100,000** of goods or services into the State or engage in **200 or more separate transactions** for the delivery of goods or services into the State."
- **Consequence:** after *Wayfair*, a remote seller (including a foreign seller) must collect state/local sales tax in a state once it crosses that state's **economic nexus** threshold. Thresholds and whether services are taxable **vary by state** (e.g. South Dakota's original $100,000 / 200-transaction test above; other states use different amounts, and some have dropped the transaction test). Do not assume one national rule.
- **SaaS / digital goods taxability differs by state** — example (taxable side): Texas Comptroller, *Data Processing Services are Taxable*:
  > "Data processing is a service performed with a computer using the customer's data. Entering, storing, manipulating, or retrieving a customer's data is taxable."
  https://comptroller.texas.gov/taxes/publications/94-127.php (accessed 2026-09-20). Texas treats cloud **SaaS as taxable data processing at 80% of the sales price** — that 80% figure is stated by the **SECONDARY** Texas Society of CPAs article https://www.tx.cpa/news/latest-news/news/article/2026/02/06/data-processing-services-saas-and-software-licenses (6 Feb 2026); the underlying primary rule is **34 Tex. Admin. Code section 3.330** (not loaded — UNVERIFIED). Paddle (a MoR) likewise states: "**The taxability of digital products varies greatly by, and within, states.**" (https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for; "Last Updated 1 August 2025"). Many states tax little or no SaaS; per-state sources are needed before selling outside an MoR.
- **Marketplace facilitator / MoR collects** — Texas Comptroller, *Remote Sellers and Marketplace Frequently Asked Questions*:
  > "**The marketplace providers are responsible for collecting and remitting tax on sales made through a marketplace.**"
  https://comptroller.texas.gov/taxes/sales/remote-sellers-marketplace-faq.php (accessed 2026-09-20).
  The same FAQ: "Do the laws for marketplace providers … impose a new tax on internet sales? No … These laws only address tax collection responsibilities."
- **Answer:** as a plain seller (Stripe) the developer is exposed to state-by-state economic-nexus registration and (where the product is taxable) collection; as a marketplace/MoR sale, the MoR collects and remits the state tax.

### Entity variants (US)
- **No US entity / mainland-China seller**: foreign remote seller; economic nexus can still attach; whether a US taxpayer identifier is needed to register is **UNVERIFIED** here.
- **HK / SG company**: same as no-US-entity for US sales tax.
- **US LLC**: a US entity; likely has nexus in its state of formation (and possibly the owner's state). It can obtain an EIN and register for state sales/use tax more easily.

### KYC & registration requirements (US)
- Register for a sales-tax permit in each state where economic nexus is exceeded and the product is taxable; file state returns (frequency varies). A marketplace/MoR sale is reported by the MoR, not the developer (Texas FAQ above).
- MoR providers may require a **W-8BEN/W-8BEN-E** (non-US person) or **W-9** (US person) and may issue 1099-K / 1042-S; possible US withholding on US-source income is a real risk — see "Income tax" below (**UNVERIFIED** per provider in this pass).

### Pricing
- N/A (jurisdiction). Sales tax is destination-based, state + local; rates vary.

### MoR or not + who bears tax (US)
- Plain processor: developer is the seller and is liable to state tax authorities where nexus exists.
- MoR/marketplace facilitator: provider is the seller/facilitator and is liable to collect and remit (Texas FAQ quote above). Paddle lists the US states for which it is registered (https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for; list plus "Last Updated 1 August 2025").

### Current viability/status
- Stable post-*Wayfair* framework; state thresholds and SaaS taxability keep changing. Verify per state / rely on the MoR's registration list.

### Sources (US)
- https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf (Wayfair, 2018)
- https://comptroller.texas.gov/taxes/publications/94-127.php (TX data processing taxable)
- https://comptroller.texas.gov/taxes/sales/remote-sellers-marketplace-faq.php (marketplace provider collects)
- https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for (MoR list; "Last Updated 1 August 2025")
- SECONDARY: https://www.tx.cpa/... (Texas 80% SaaS figure; primary 34 TAC section 3.330 not loaded)

---

## Canada — GST/HST on digital products/services

### Eligibility
- CRA, *GST/HST for digital-economy businesses: Overview*:
  > "The ETA has been amended, **effective July 1, 2021**, to include GST/HST provisions that generally apply to **non-resident suppliers, distribution platform operators and accommodation platform operators** participating in the digital economy. This means digital-economy businesses may have new obligations, **including registering for a GST/HST account and charging and collecting the GST/HST**."
  > "A **simplified GST/HST registration, reporting and remittance regime** is applicable to these non-resident vendors, non-resident digital platform operators and distribution platform operators."
  https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html (accessed 2026-09-20).
- CRA guide RC4022 (24e): "New measures for digital economy businesses are in effect as of July 1, 2021 … Cross-border digital products and services — You may be required to register under the **simplified GST/HST**." https://www.canada.ca/content/dam/cra-arc/formspubs/pub/rc4022/rc4022-24e.pdf (accessed 2026-09-20).
- **Threshold:** the CRA small-supplier registration threshold (widely reported as **C$30,000** over four consecutive calendar quarters) applies to the simplified regime; I could **not** confirm the number from a CRA page loaded in this pass → **UNVERIFIED**. Check https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html (URL surfaced by CRA's own guide; not loaded).

### Entity variants
- No entity/HK/SG: non-resident vendor → simplified GST/HST regime. A **US LLC** may fall in a different category; CRA states non-resident "supply of qualifying goods" sellers may need the **normal** GST/HST registration (simplified not available) — that is the goods rule; digital services sit under the simplified regime (RC4022 quote above).

### KYC & registration / MoR
- CRA registration (simplified), quarterly filing, charge GST/HST at the customer's province rate (GST 5% / HST 13-15% / QST separate). Under the simplified regime, input tax credits are generally **not** available — **UNVERIFIED** in this pass.
- If sold through a **distribution platform operator** that is registered, the platform may be the one that must collect (CRA lists "distribution platform operators" as covered) — exact split **UNVERIFIED**.

### Sources (Canada)
- https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html
- https://www.canada.ca/content/dam/cra-arc/formspubs/pub/rc4022/rc4022-24e.pdf

---

## Australia — GST on imported digital products/services

### Eligibility
- ATO, *How Australian GST works* (GST for non-resident businesses):
  > "**The GST rate in Australia is 10%**, meaning GST is 1/11th of the amount you charge for sales connected with Australia."
  > "**You must register for GST in Australia if both of the following apply:** You are carrying on a business or enterprise. **Your GST turnover from sales connected with Australia from your enterprise is equal to, or greater than the registration turnover threshold of A$75,000** … GST turnover includes the combined value of: imported services and digital products to Australian consumers; low value imported goods to consumers."
  > "**If all of these sales are made through an online marketplace or electronic distribution platform you may not need to register for GST.**"
  https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-australian-gst-works (accessed 2026-09-20 via reader; direct fetch returned HTTP 403).
- **Answer:** Australia has an **A$75,000** turnover threshold (not from-first-sale like EU/UK). A mainland-China seller below it need not register; above it, register (non-resident) and charge 10% GST; sales through an EDP/marketplace may shift the obligation to the platform.

### Entity variants
- No entity/HK/SG/US LLC: all are non-residents → ATO non-resident registration. A US LLC does not create Australian GST nexus by itself.

### MoR / marketplace
- ATO has an **electronic distribution platform (EDP) operator** regime: where sales are made through an EDP, the EDP may be liable for the GST and the underlying seller may not need to register (quote above). This is Australia's analogue of the MoR/marketplace-facilitator rule.
- Source: https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-to-charge-gst/if-you-are-an-edp-operator (URL surfaced on the ATO page; not separately loaded — **UNVERIFIED** for its exact wording).

### Sources (Australia)
- https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-australian-gst-works (GST 10%, A$75,000 threshold, EDP carve-out) — accessed 2026-09-20 via reader (direct 403)

---

## Merchant-of-record providers — who is the seller and who is liable

### Paddle
- **Eligibility / Entity variants / KYC & payouts**: Paddle onboards sellers globally and is a UK-headquartered MoR; its tax pages do not require the seller to have an EU/UK entity. Country eligibility, KYC documents, payout currencies/countries and schedule are on Paddle's own pages (covered by the provider sub-agents).
- **MoR or not + who bears tax** — Paddle Help Center, *How Paddle handles VAT on your behalf* (accessed 2026-09-20):
  > "Paddle entirely handles sales tax for all digital products sold to customers where it's a legal requirement. This includes VAT (Value Added Tax), GST (Goods and Services Tax), Sales Taxes, and other local equivalents around the world."
  > "**Paddle operates as the Merchant of Record for your digital products.** This means we take on the responsibility for all aspects of the transaction, from processing payments to handling sales tax compliance. Essentially, **when a buyer purchases your product through Paddle, we act as the seller to them.** Because Paddle is registered in over 100 jurisdictions worldwide, we can: Collect the necessary customer information. Calculate and charge the correct amount of sales tax (VAT, GST, state sales tax, etc.). **Remit those taxes to the relevant tax authorities globally.** Issue compliant invoices. **This model ensures your sales are always tax-compliant, and all the tax-related risk rests with Paddle, not with you.**"
  https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf
- **Pricing / payouts / subscription features**: provider scope (Paddle's MoR fee and payout terms are on its pricing/legal pages, not loaded here).
- **Sources**: https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf ; https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for ("Last Updated 1 August 2025") — accessed 2026-09-20.

### Lemon Squeezy
- **Eligibility / Entity variants**: "Lemon Squeezy supports merchants and affiliates in hundreds of countries." Bank payouts are supported in a listed set of countries (includes Hong Kong, Singapore, Taiwan, Macao — **mainland China is not in the bank-payout list**); PayPal payouts are supported in 200+ countries. https://docs.lemonsqueezy.com/help/getting-started/supported-countries (accessed 2026-09-20). For a mainland-China seller, PayPal payout is likely the only route (provider scope; verify current status — Lemon Squeezy was acquired by Stripe and the docs site's GitHub source repo is no longer publicly accessible).
- **KYC & payouts**: "As part of connecting your bank account, you may be asked to verify your identity for fraud prevention." Payouts **twice monthly, created on the 1st and 15th**, held 13 days, **paid on the 14th and 28th**; bank payouts made in **USD**, PayPal payouts **USD**; bank payout fees free in US / 1% outside US; PayPal $0.50 US / 3% capped at $30 outside US. https://docs.lemonsqueezy.com/help/getting-started/getting-paid ; https://docs.lemonsqueezy.com/help/getting-started/fees (accessed 2026-09-20).
- **MoR or not + who bears tax** — Lemon Squeezy docs:
  > "A merchant of record (sometimes shortened to 'MoR') is a term used to describe the **legal entity selling goods or services to an end customer**." … "**Lemon Squeezy acts as a merchant of record. We take on all of the liability** … including collecting sales tax, processing refunds and chargebacks, and ensuring PCI compliance." (https://docs.lemonsqueezy.com/help/payments/merchant-of-record)
  > "Lemon Squeezy is known as the merchant of record for all sales through our platform. … **you don't have to worry about collecting and remitting sales tax (including international tax like VAT)** as Lemon Squeezy simply takes care of it for you. This is possible because **Lemon Squeezy is technically selling products on your behalf and therefore we are liable** for all of the complicated bits. … **If sales tax has been applied to an order, we will deduct it from your next payout so that we can report and remit it.**" (https://docs.lemonsqueezy.com/help/payments/sales-tax-vat)
  > "**As Lemon Squeezy is a merchant of record, you shouldn't need to report sales tax for sales you make through Lemon Squeezy.**" (same page)
- **Pricing**: platform fee $0.50 + 5% of order total, plus 1.5% international card, 1.5% PayPal, 0.5% subscription; taxes are collected from the buyer on top (docs /help/getting-started/fees ; /help/payments/sales-tax-vat).
- **Subscription features**: trials, subscriptions, customer portal, refunds, proration are documented in LS help; provider scope.
- **Sources**: https://docs.lemonsqueezy.com/help/payments/merchant-of-record ; https://docs.lemonsqueezy.com/help/payments/sales-tax-vat ; https://docs.lemonsqueezy.com/help/getting-started/fees ; https://docs.lemonsqueezy.com/help/getting-started/getting-paid ; https://docs.lemonsqueezy.com/help/getting-started/supported-countries — accessed 2026-09-20.

### FastSpring
- **MoR or not + who bears tax** — FastSpring, *Digital Retailer Services Terms of Service* (accessed 2026-09-20):
  > "Under the Digital Retailer Service … **FastSpring shall act as a reseller of the Products, purchasing Products from Vendor and reselling them to Purchasers. This structure, where FastSpring is the seller and merchant of record of the Product, allows FastSpring to assume responsibility for all VAT, Sales Taxes …, Use Tax, and GST collection, reporting and remittance for Product sold via the FastSpring Service.** FastSpring is not responsible for import taxes or customs duties."
  https://fastspring.com/terms-use/seller-terms-service/digital-retailer/
- **Eligibility / KYC / payouts / pricing / subscription features**: provider sub-agent scope. The same terms state: "FastSpring is not responsible for determining whether any taxes apply to any transaction outside of the information provided on behalf of Vendors and Purchasers."
- **Sources**: https://fastspring.com/terms-use/seller-terms-service/digital-retailer/

### Creem
- **Not researched in this pass.** Creem (creem.io) markets itself as a MoR for digital products; no Creem-owned legal/tax page was loaded or quoted here. Treat Creem-specific tax terms as **UNVERIFIED**.

---

## Practical registrations: plain processor (Stripe) vs MoR

| | **Plain processor (Stripe/PayPal) — developer is the seller** | **MoR (Paddle/Lemon Squeezy/FastSpring)** |
|---|---|---|
| **EU VAT (B2C digital services)** | Register for the **non-Union OSS** in one EU Member State (or register in each Member State) **from the first sale**; charge the customer's-country rate; quarterly OSS return + payment. | Provider is the seller and remits EU VAT; developer **does not** register for EU VAT on those sales. |
| **UK VAT** | Register for **UK VAT with HMRC from the first sale** (no threshold); charge 20%; file UK returns. | Provider accounts for UK VAT (HMRC: "the digital platform is responsible for accounting for VAT on the supply instead of you"). |
| **US state sales tax** | Register in each state where **economic nexus** is crossed and the product is taxable; collect + file. SaaS taxability varies by state. | Provider is a marketplace provider and "**responsible for collecting and remitting tax on sales made through a marketplace**"; developer reports the MoR sale but does not collect. |
| **Canada GST/HST** | Simplified GST/HST registration for non-resident vendors (threshold C$30,000 — **UNVERIFIED**); charge GST/HST by province. | If the MoR is the distribution-platform operator it collects; confirm provider-by-provider. |
| **Australia GST** | Register if GST turnover from Australia-connected sales is at least **A$75,000**; charge 10%. | Sales through an EDP/marketplace may mean the platform is liable and the developer need not register (ATO). |
| **Invoices/VAT numbers** | Developer must display its own OSS/VAT/GST numbers and charge tax. | Provider issues its own compliant invoices with its own tax numbers. |
| **Income tax (China/HK/SG)** | Developer's income is taxable in its own jurisdiction. | **Still taxable in the developer's own jurisdiction** (net proceeds) — an MoR removes indirect tax, not income tax. |

**Named but out of scope:**
- **China individual income tax / enterprise income tax** (and, if relevant, HK profits tax / SG corporate tax) on the developer's net proceeds — both in the plain-processor and MoR cases. The MoR does not remit Chinese income tax for the developer.
- **US withholding on US-source payments** to a non-US person from a US MoR (W-8BEN/W-8BEN-E, potential 30% statutory withholding reduced by treaty; provider entity matters — e.g. FastSpring/Lemon Squeezy vs Paddle's UK/Ireland entities) — **UNVERIFIED per provider**; check before choosing a provider, as it affects net cash.
- **Permanent establishment / fixed-establishment analysis** if the developer ever has people or premises in an EU Member State, the UK or the US — not present today.

---

### UNVERIFIED
- Pre-2019 EU rule that allegedly allowed a non-EU supplier to use a EUR 100,000 threshold to keep the place of supply in its own country (historical; do not rely on).
- UK "One Stop Shop for B2C services": not found; the UK OSS is goods/NI-to-EU only. Treat as no such scheme until HMRC states otherwise.
- HMRC NETP registration documentation and whether a UK fiscal representative or agent is required for a mainland-China individual.
- Canada: the **C$30,000** simplified GST/HST threshold, the exact non-resident registration page, whether input tax credits are available under the simplified regime, and the exact distribution-platform-operator liability split — CRA subpages were 404/not loaded. Check https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html.
- Texas 80%-of-price SaaS rule as a primary figure: primary rule is **34 Tex. Admin. Code section 3.330** (not loaded); the 80% number is SECONDARY.
- US state-by-state economic-nexus thresholds beyond South Dakota's original $100,000/200-transaction test, and whether each state taxes SaaS.
- Whether a foreign (mainland-China) seller needs a US ITIN/EIN or state-specific US identifier to register for US sales tax.
- Creem's merchant-of-record / tax terms — no Creem-owned page loaded.
- Lemon Squeezy mainland-China payout route (bank list excludes mainland China; PayPal may be the only option) and Lemon Squeezy's current status post-Stripe-acquisition.
- US withholding / tax-form specifics (W-8 vs W-9, 1099-K/1042-S, treaty rate) per MoR provider.
- The exact ViDA changes to the non-Union scheme scope (Art. 359) entering into force 1 January 2027, and the final digital-reporting date.
- Exact EU standard VAT rates per Member State (only the rates page/TEDB pointer was loaded).

### Source URLs (all accessed 2026-09-20 unless noted)
- EU: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32017L2455 | https://eur-lex.europa.eu/eli/dir/2006/112/oj | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32025L0516 | https://vat-one-stop-shop.ec.europa.eu/index_en | https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en | https://vat-one-stop-shop.ec.europa.eu/one-stop-shop/register-oss_en | https://vat-one-stop-shop.ec.europa.eu/eu-legislation_en | https://vat-one-stop-shop.ec.europa.eu/vat-rates_en | https://vat-one-stop-shop.ec.europa.eu/guides_en
- UK: https://www.gov.uk/vat-rates | https://www.gov.uk/guidance/vat-place-of-supply-of-services-notice-741a | https://www.gov.uk/vat-registration/when-to-register | https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers | https://www.gov.uk/guidance/completing-a-one-stop-shop-vat-return
- US: https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf | https://comptroller.texas.gov/taxes/publications/94-127.php | https://comptroller.texas.gov/taxes/sales/remote-sellers-marketplace-faq.php
- Canada: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html | https://www.canada.ca/content/dam/cra-arc/formspubs/pub/rc4022/rc4022-24e.pdf
- Australia: https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-australian-gst-works
- MoR: https://www.paddle.com/help/sell/tax/how-paddle-handles-vat-on-your-behalf | https://www.paddle.com/help/sell/tax/which-countries-does-paddle-charge-sales-tax-or-vat-for | https://docs.lemonsqueezy.com/help/payments/merchant-of-record | https://docs.lemonsqueezy.com/help/payments/sales-tax-vat | https://docs.lemonsqueezy.com/help/getting-started/fees | https://docs.lemonsqueezy.com/help/getting-started/getting-paid | https://docs.lemonsqueezy.com/help/getting-started/supported-countries | https://fastspring.com/terms-use/seller-terms-service/digital-retailer/
