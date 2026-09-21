# S5 — Cost of getting entitlement to a merchant account (entity options + USD reception)

**Author:** subagent 5/5. **Today's date:** 2026-09-20. **All URLs accessed 2026-09-20 unless stated.**
**Scope:** cost/effort of (a) US LLC via Stripe Atlas or direct state filing, (b) Hong Kong company, (c) Singapore company,
(d) staying a mainland-China individual with a merchant of record (MoR); plus how a China-based person can receive USD.
**Evidence rules:** quotes are verbatim from first-party pages. Anything not sourced from a primary page is marked
**UNVERIFIED** or **SECONDARY**. Numbers change; freshness noted per page.
**Practical note on fetching:** `corp.delaware.gov` did not resolve in this sandbox (DNS); it was loaded by pinning the
resolved IP. `acra.gov.sg` pages are Next.js SPAs — body text required raw-HTML extraction. Payoneer article bodies are
JS-rendered and could not be extracted (titles/URLs only). `sos.wyo.gov` PDF returned "Request Rejected" to the fetch
tool, but the PDF itself downloaded and parsed cleanly.

---

## Stripe Atlas (US Delaware entity, all-inclusive)

- **Eligibility** (official text)
  - "Startups in over 175 countries have chosen Atlas to start their business." — https://stripe.com/atlas (accessed 2026-09-20).
  - "Atlas is appropriate for most founders, but not all. If you have unique considerations such as any of the following,
    consider talking to a lawyer before using Atlas. This list is not exhaustive." — https://docs.stripe.com/docs/atlas/signup
    (accessed 2026-09-20).
  - Stripe Atlas docs offer dedicated guides for **Indian resident founders** and **incorporating from Singapore**
    (https://docs.stripe.com/atlas/indian-founder-guide, https://docs.stripe.com/atlas/singapore-founder-guide), and a
    **Non-US Section 83(b)** guide. The Stripe site footer offers a **"Mainland China 简体中文 English"** locale. None of
    these is a formal statement of mainland-China founder eligibility.
  - **No official first-party page stating whether a founder resident in mainland China is accepted was found. See UNVERIFIED.**
- **What $500 includes** (official text, https://stripe.com/atlas, accessed 2026-09-20)
  - "Company incorporation in Delaware, including next-day expedited processing and state filing fees"
  - "Company tax ID"; "Founder equity issuance and share purchase"; "83(b) election filing"
  - "US$500 one-time setup fee (includes government fees and your first year of registered agent services)"
  - "Run your business … US$100 annually after your first year (renews automatically)" (registered-agent maintenance)
  - "Get your US$500 Atlas fee back when you deposit US$5,000 into a Stripe Treasury account."
  - "Atlas startups also get US$2,500 in Stripe product credits for use in their first year after incorporation, plus over
    US$50,000 in discounts on tools such as Google, Xero and OAI."
- **Docs repeat the price** (https://docs.stripe.com/docs/atlas/signup, accessed 2026-09-20):
  "Atlas costs 500 USD, which covers incorporation (plus state fees), and your first year of registered agent services.
  After that, we charge 100 USD annually to maintain your registered agent. We'll refund your fee if we're unable to
  support your business."
- **Entity variants** (from https://stripe.com/atlas structure picker): "C corporation / Often used by startups";
  "Limited liability company (LLC) / Often used by small businesses"; "Subsidiary / Owned by a parent company".
  Delaware is the state; "Delaware incorporates your company" (Next-day expedited). Annual renewal $100 is the registered
  agent only; **Delaware LLC annual tax and any US federal filings are separate** (see below).
- **KYC & bank/payout requirements:** Atlas collects founders, ownership, officers and a company address ("If you don't have
  an official company address yet, you can use your home address or get a virtual address through one of our partners");
  no SSN requirement is stated for Atlas itself. **Stripe payments approval is not guaranteed**: "Atlas can't guarantee
  that your business will be approved to use Stripe payments." (https://docs.stripe.com/docs/atlas/signup).
- **MoR or not + who bears tax:** Atlas is a **technology service, not a merchant of record**: "Atlas isn't a law firm and
  doesn't provide legal, tax or accounting advice." A US LLC formed via Atlas is the merchant and bears its own US tax
  obligations (and the seller bears cross-border/PRC tax). Exact US tax treatment is out of this agent's scope; see UNVERIFIED.
- **Current viability/status:** Actively sold; price and inclusions are explicit and current. The only gap relevant here is
  **founder-country eligibility**, which Stripe does not publish in the pages reachable today.
- **Sources:** https://stripe.com/atlas ; https://docs.stripe.com/docs/atlas/signup ; https://docs.stripe.com/atlas

---

## US LLC — direct state filing (Delaware / Wyoming) + EIN

### Delaware (official)
- **Formation fee (primary, current):** Delaware Division of Corporations Fee Schedule, **"Revised August 1, 2026"**:
  "Limited Liability Companies / **Formation – domestic $110.00**"; "Foreign Certificate of Registration $200.00".
  https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf (accessed 2026-09-20).
- **Conflicting official figure:** the Delaware Code, 6 Del. C. § 18-1105(a)(3) (https://delcode.delaware.gov/title6/c018/sc11/index.html,
  accessed 2026-09-20) says: "Upon the receipt for filing of a certificate of formation … a fee in the amount of **$70** …".
  Two first-party Delaware sources disagree ($70 code vs $110 current fee schedule). **Flagged; see UNVERIFIED.**
  (The Division's old PDF, https://corp.delaware.gov/Aug11Fee.pdf, still shows a superseded **$90**, "Revised August 1, 2013".)
- **Annual LLC tax — also conflicting:**
  - Code § 18-1107(b): "Every domestic limited liability company and every foreign limited liability company registered to
    do business in the State of Delaware shall pay an annual tax … in the amount of **$400**." (§18-1107(b), same URL.)
    Due "on the first day of June following the close of the calendar year" (§18-1107(c)).
  - Division "How to Form a New Business Entity": "Although Limited Partnerships, Limited Liability Companies and General
    Partnerships formed in the State of Delaware do not file an annual report, they are required to pay an annual tax of
    **$300.00**. Taxes for these entities are to be received no later than June 1st of each year."
    https://corp.delaware.gov/howtoform/ (accessed 2026-09-20).
  - **$300 vs $400 is unresolved between two official Delaware pages. See UNVERIFIED.**
- **Registered agent:** required in Delaware; a third-party service. Pricing from agent vendors is **SECONDARY** (not a
  state fee) and is not asserted as a number here.

### Wyoming (official)
- **Formation fee:** Wyoming Secretary of State, Business Division Filing Fee Schedule, **"Revised: June 2026",
  "Effective July 1st, 2026"**: "Limited Liability Companies: Articles of Organization*/Continuance/Domestication …… **$100.00**";
  "Certificate of Authority … $150.00".
  https://sos.wyo.gov/business/docs/businessfees.pdf (accessed 2026-09-20).
- **Recurring:** "Annual Report License tax is **$60 or two-tenths of one mill on the dollar ($.0002) whichever is greater**
  based on the company's assets located and employed in the state of Wyoming." (same schedule; the note sits under LLCs;
  annual reports are due on the anniversary month — exact due-date page not captured here).
- **Registered agent:** required; third-party cost (**SECONDARY**, vendor pricing not asserted).

### EIN for a foreign-owned LLC (official IRS)
- "If your principal place of business is outside the U.S., you can apply for an EIN **by phone at 267-941-1099** Monday –
  Friday, 6 a.m. to 11 p.m. Eastern time or submit Form SS-4 by: Fax 855-215-1627 (within the U.S.) or 304-707-9471
  (outside the U.S.). Mail to Internal Revenue Service, Attn: EIN International Operation, Cincinnati, OH 45999. You can
  apply only for 1 EIN per day."
  https://www.irs.gov/businesses/small-businesses-self-employed/employer-identification-number (accessed 2026-09-20).
- The **online** EIN tool is the part that demands an SSN/ITIN: "You have the responsible party's Social Security number
  (SSN) or individual taxpayer ID number (ITIN). You can't use this if either: **Your principal place of business is
  outside the U.S.** If so, apply by phone, fax or mail."
  https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online
  (accessed 2026-09-20). → A non-US owner does **not** need an SSN/ITIN to obtain an EIN by phone/fax/mail.
- **EIN-agent services are third-party (SECONDARY).** The IRS route above is free; paid "EIN filing agent" services are not
  state/IRS fees and their prices are not asserted here.

### Entity variant notes (US LLC)
- No US LLC: a mainland individual can still sell if the MoR accepts them (see Payoneer/other agents' MoR notes) — no US
  formation cost, but no US bank/Stripe US account either.
- US LLC: adds $110 (DE) or $100 (WY) formation + annual tax ($60 WY; DE $300–$400, conflicting) + registered agent
  (third-party) + possibly a US business bank (most US banks require in-person/SSN; Stripe Atlas/Stripe US is the usual route).
- HK / SG company: see below — both can be the contracting entity instead of a US LLC.

---

## Hong Kong company

- **Incorporation fee (official, Companies Registry "Major Fees under the Companies Ordinance"):**
  "Incorporation HK$ … (if delivered in electronic form) … **1,545** (if delivered in hard copy form) … **1,720**";
  "Change of company name … **295**"; "Registration of annual returns … If delivered within 42 days after the company's
  return date … **105**". https://www.cr.gov.hk/en/services/fees.htm (accessed 2026-09-20; no effective date shown on page).
- **Business Registration fee + levy (official, IRD "Business Registration Fee and Levy Table"):** for
  **01.04.2026 – 31.03.2027**: 1-year certificate = registration fee **$2,200** + levy **$150** = **total $2,350**;
  3-year certificate = **$5,720** + **$450** = **$6,170**; branch 1-year = $80 + $150 = $230.
  Table: https://www.ird.gov.hk/eng/pdf/brfee_table.pdf ; landing page: https://www.ird.gov.hk/eng/tax/bre_lcc.htm
  (both accessed 2026-09-20). (Prior year 01.04.2025–31.03.2026 had levy $0 — i.e. the $150 levy has returned for FY26/27.)
- **Statutory officers (official CR FAQ):** "A non-Hong Kong resident can be appointed as a director of a local limited
  company. However, the **company secretary, who is a natural person, should ordinarily reside in Hong Kong**. For company
  secretary which is a body corporate, its registered office or place of business should be in Hong Kong. A private local
  limited company must have at least one director who is a natural person and one company secretary. The sole director
  cannot act as the company secretary of the same company." Also: "Section 457(2) of the Companies Ordinance (Cap. 622)
  requires that every private company must have at least one director who is a natural person."
  https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm (accessed 2026-09-20).
  → A mainland **sole director/shareholder is allowed**; the **HK-resident company secretary** is the statutory blocker and is
  normally bought from a corporate-services firm (**SECONDARY** third-party cost, price not asserted).
- **Registered address:** a HK company must have a HK registered office (Companies Ordinance). The exact section/quote was
  not captured in this session — see UNVERIFIED. Practically the corporate-services firm supplies the address (third-party).
- **Bank / Stripe HK — the real bottleneck:** no official HK bank or Stripe page found stating "mainland-China UBOs are
  accepted/declined". **This is commentary, not a sourced rule (UNVERIFIED):** HK company formation is cheap and fast, but
  opening an HK business bank account for a mainland-resident UBO is the practical friction point; HK corporate-services
  firms bundle it. Whether Stripe (HK) will onboard the entity is a separate, unpublished review.
- **MoR/tax:** the HK company is the merchant (not a MoR); HK profits-tax and cross-border VAT/GST are its responsibility.
  Details are other agents' scope.
- **Sources:** https://www.cr.gov.hk/en/services/fees.htm ; https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm ;
  https://www.ird.gov.hk/eng/pdf/brfee_table.pdf ; https://www.ird.gov.hk/eng/tax/bre_lcc.htm

---

## Singapore company

- **Name application fee (official ACRA, "Step 3.2: Reserving a business name via Bizfile", page "Last updated 25 March 2026"):**
  "**Fee $15** … The fee is non-refundable if the name is unavailable or if you decide to withdraw the name application."
  https://www.acra.gov.sg/register/business/choosing-reserving-a-business-name/reserving-bizfile/ (accessed 2026-09-20).
- **Incorporation fee (official ACRA, "Step 4.6: Registering a local company via Bizfile", page "Last updated 31 July 2026"):**
  "Fees and processing time — Business registration … **Fee $300** … Payment method: Credit card, debit card, or online banking.
  Processing time: Most registrations are approved soon after payment."
  https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/registering-via-bizfile/
  (accessed 2026-09-20). → state total **S$315** (S$15 + S$300).
- **Resident director + secretary (official ACRA, "Step 4.3: Choosing company directors & other key officers",
  "Last updated 29 January 2026"):**
  - "Under the Companies Act, company directors must: **Be ordinarily resident**; Be 18 years old or older; Be mentally fit
    to make decisions; **Be a Singapore citizen, Singapore permanent resident, or someone who meets local residency rules**;
    Not be banned …"
  - "Every company must have **at least one company director and one company secretary**. A secretary must be appointed
    within six months of successful registration."
  - "A company secretary must: Be a real person (not a company); Be a Singapore citizen, Singapore permanent resident, or
    someone who meets local residency rules; Not be the same person as the sole director."
  https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/appointing-company-directors-other-key-officers/
  (accessed 2026-09-20).
- **Nominee resident director:** listed by ACRA as "(Optional) Nominee director" (same page). The nominee is normally a
  corporate-services provider — **third-party cost, SECONDARY; price not asserted.**
- **MoR/tax:** SG company is the merchant; GST/overseas VAT registration and tax are the company's responsibility.
- **Sources:** the three ACRA URLs above.

---

## Payout reception — how a mainland-China person can receive USD (Payoneer / Wise / bank)

- **Payoneer — supports mainland China (official).** Payoneer's China-specific Terms: "This Agreement is applicable to
  **individuals, legal entities and/or other organizations who reside in or whose business are registered or incorporated
  in China** (for the purpose of this Agreement only, excluding Hong Kong SAR, Macau SAR, and Taiwan …) **and who utilize
  Payoneer's cross-border payment services for the receipt of cross-border trade-related funds and their subsequent
  withdrawals and/or payments within China.**"
  https://pubs.payoneer.com/legal/PayoneerTermsAndConditions_PPG_Jan2026.pdf (document version: Jan 2026; accessed 2026-09-20).
  Corroborating official how-to pages (titles; body is JS-rendered and could not be extracted):
  "派安盈Payoneer**中国内地主体个人账户**注册指引" https://www.payoneer.com/zh-hans/resources/how-to-use-payoneer/how-to-register-an-individual-account/
  and "派安盈Payoneer**中国内地主体企业账户**注册指引" https://www.payoneer.com/zh-hans/resources/how-to-use-payoneer/how-to-register-a-company-account/
  (accessed 2026-09-20). Payoneer's receiving-account product page markets "**Get paid in 70+ currencies**".
  https://www.payoneer.com/receiving-accounts/ (accessed 2026-09-20).
- **Wise — can hold money with a China address, but CANNOT provide USD account details to a China address (official).**
  - "You can hold money in your account if you live in one of the following countries and territories: Andorra, Argentina,
    Australia, Austria … Canada, Cayman Islands, Chile, **China**, Colombia …" —
    https://wise.com/help/articles/2813542/which-countries-can-i-hold-money-in (accessed 2026-09-20).
  - "You can't get USD account details if your address is in: Afghanistan, Bangladesh, Belarus … **China**, Congo …" —
    https://wise.com/help/articles/2810318/can-i-get-usd-bank-account-details (accessed 2026-09-20).
  - → Wise is **not** a viable USD *receiving* rail for someone resident in mainland China (no USD details); it can hold
    balances/top-up but cannot be the Stripe/MoR payout endpoint in USD.
  - Wise does document sending **CNY to China business recipients** ("Your recipient's bank account must be a business
    account based in China and denominated in CNY"), which is the *outbound* direction only:
    https://wise.com/help/articles/5ndADC6KmFdLDyaLq5kI64 (accessed 2026-09-20).
  - Wise Business card availability is a separate country list; whether China appears in it was not confirmed in this
    session — see UNVERIFIED.
- **Bank (direct USD wire into a PRC bank account):** mechanically possible, but inbound USD is subject to PRC foreign-
  exchange administration (SAFE) rules and individual settlement quota. **No SAFE/primary rule was loaded in this session
  — UNVERIFIED.** A US LLC/Payoneer receiving account is the usual workaround.
- **Practical takeaway:** for a **mainland-China individual/company**, **Payoneer** is the first-party-documented USD
  reception path; **Wise** is excluded for USD details; a **HK company** can use HK rails, a **SG company** SG rails, and a
  **US LLC** Stripe/US or Payoneer. Note the receiving entity must match the merchant account holder (KYC name matching) —
  general industry practice, not quoted from a primary page here.

---

## Official price table (all figures from first-party pages; accessed 2026-09-20)

| Item | Amount (official) | Source URL | Page date shown |
|---|---|---|---|
| Stripe Atlas one-time | **US$500** (includes DE state fees + 1st-yr registered agent) | https://stripe.com/atlas ; https://docs.stripe.com/docs/atlas/signup | no date shown |
| Stripe Atlas renewal | **US$100/yr** (registered agent only) | same as above | no date shown |
| Delaware LLC formation | **$110** | https://corpfiles.delaware.gov/Fee_Schedule/AugustFee2026.pdf | "Revised August 1, 2026" |
| Delaware LLC annual tax | **$400** (Code) vs **$300** (Division how-to page) — conflicting | https://delcode.delaware.gov/title6/c018/sc11/index.html ; https://corp.delaware.gov/howtoform/ | Code current; how-to page no date |
| Wyoming LLC formation | **$100** | https://sos.wyo.gov/business/docs/businessfees.pdf | "Revised: June 2026"; effective 2026-07-01 |
| Wyoming LLC annual report license tax | **$60** (or $0.0002 of WY assets, whichever greater) | same as above | same |
| US EIN (foreign principal place of business) | **Free** by phone 267-941-1099 / fax / mail | https://www.irs.gov/businesses/small-businesses-self-employed/employer-identification-number | no date shown |
| HK incorporation (Companies Registry) | **HK$1,545** electronic / **HK$1,720** hard copy | https://www.cr.gov.hk/en/services/fees.htm | no date shown |
| HK annual return | **HK$105** (within 42 days) | same as above | no date shown |
| HK business registration (FY26/27) | **HK$2,200** fee + **HK$150** levy = **HK$2,350** (1-yr) | https://www.ird.gov.hk/eng/pdf/brfee_table.pdf | row 01.04.2026–31.03.2027 |
| SG company name application | **S$15** (non-refundable) | https://www.acra.gov.sg/register/business/choosing-reserving-a-business-name/reserving-bizfile/ | "Last updated 25 March 2026" |
| SG incorporation | **S$300** | https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/registering-via-bizfile/ | "Last updated 31 July 2026" |
| Payoneer China reception | supported (no fee quoted here) | https://pubs.payoneer.com/legal/PayoneerTermsAndConditions_PPG_Jan2026.pdf | Jan 2026 |
| Wise USD account details for China address | **Not available** | https://wise.com/help/articles/2810318/can-i-get-usd-bank-account-details | no date shown |

**Approximate first-year cash to get a usable merchant account (state/registry fees only, before agent/secretary/bank fees):**
US LLC via Atlas **US$500** (+DE/WY recurring); direct US LLC **~US$100–$110** + registered agent (3rd-party) + EIN free;
HK company **HK$1,545 + HK$2,350 ≈ HK$3,895** (+ HK-resident company secretary, 3rd-party);
SG company **S$315** (+ nominee resident director & corporate secretary, 3rd-party);
No entity (MoR route) **US$0** formation but MoR takes a cut and decides eligibility.

---

## Entity-variant decision notes

- **No entity (mainland-China individual + MoR):** $0 formation; no US/HK/SG bank; depends entirely on MoR accepting a PRC
  seller and paying out via Payoneer/PRC bank. Cheapest to start, least control; MoR fees/eligibility are other agents' scope.
- **US LLC (Atlas or direct):** best Stripe/US-payments access; recurring DE $300–$400/yr (conflicting) or WY $60/yr plus a
  registered agent; US business banking for a non-resident is the friction (Stripe Atlas/Stripe US or Payoneer).
  Whether Atlas accepts a **mainland-China-resident founder** is **not published** on the pages reachable today.
- **Hong Kong company:** cheap/fast formation and a HK-resident company secretary is the only statutory local requirement;
  the practical bottleneck is **HK bank / Stripe HK onboarding** (commentary, not a sourced rule).
- **Singapore company:** S$315 state fees; **needs a resident director** (nominee, third-party) and a local-resident
  company secretary, so recurring third-party cost is unavoidable.

---

### UNVERIFIED

1. **Stripe Atlas eligibility for a founder residing in mainland China** — Stripe publishes no eligibility FAQ on
   stripe.com/atlas, docs.stripe.com/atlas or docs.stripe.com/docs/atlas/signup. The only related signals are the
   "175 countries" marketing line, the Mainland-China locale in the site footer, and India/Singapore founder guides.
   **Not confirmed either way.** (support.stripe.com/questions/stripe-atlas is JS-only and returned no readable text.)
2. **Delaware LLC formation fee discrepancy** — current Division Fee Schedule (Revised 2026-08-01) says **$110**;
   Delaware Code § 18-1105(a)(3) says **$70**. Which governs today is unresolved.
3. **Delaware LLC annual tax discrepancy** — Code § 18-1107(b) says **$400**; Division "How to Form a New Business Entity"
   says **$300**. Unresolved; budget for $400 to be safe, but confirm with the Division.
4. **HK registered-office statutory citation** — Companies Ordinance requires a HK registered office, but the exact section/
   quote was not captured; the practical HK-address requirement is certain, the citation is not.
5. **HK bank / Stripe HK onboarding for a mainland-resident UBO** — no first-party page found; treated as commentary only.
   Whether Stripe HK accepts such a company is unpublished.
6. **Wise Business availability for a China-based company** — "Which countries can I hold money in" lists China (individual
   holding), but Wise Business eligibility/currency details for a mainland entity were not confirmed.
7. **Wise Business card country list** — article exists (https://wise.com/help/articles/2935775/can-my-business-use-a-wise-card)
   but whether "China" is in the list was not confirmed (content truncated).
8. **PRC SAFE rules for receiving USD into a Chinese bank account** — no SAFE/primary source loaded; inbound USD and the
   individual FX settlement quota are **not** documented here.
9. **Payoneer receiving currencies/limits available to a mainland-China account** — only the China T&C clause and the
   "Get paid in 70+ currencies" marketing line were readable; the article bodies are JS-rendered and could not be extracted.
10. **Third-party costs** (US registered agent, EIN filing agents, HK company secretary, HK/SG nominee director, virtual
    addresses) — deliberately not priced; these are **SECONDARY** vendor prices, not state/registry fees.
11. **US federal tax treatment of a foreign-owned US LLC (W-8BEN-E, ECI, 5472 filing, etc.)** — out of this agent's scope;
    not researched here.
