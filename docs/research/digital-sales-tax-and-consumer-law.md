# 面向海外销售数字订阅与一次性数字商品：间接税、消费者法与支付合规义务

> **文档类型**: 合规义务研究（决策级 / 上线前检查清单）
> **评估对象**: 个人开发者（常驻 UTC+8，很可能在中国大陆，**尚无美国/欧盟实体**）在 `tableview.dev` 销售的：
> (a) **循环订阅**（约 US$19/月或 US$149/年）；(b) **一次性数字商品**（约 US$9.99）。产品为浏览器端金融测算 Web 应用，即时交付、无实物。主要客户在 **美国、加拿大、澳大利亚、英国、欧盟**。站点当前通过 Google AdSense 展示广告，并使用带欧盟同意模式的 Google Analytics。
> **评估问题**: 要卖进每个市场**必须遵守什么**；以及改用 **Merchant of Record（MoR）** 后**哪些义务会消失、哪些不会**。
> **日期**: 2026-09-20
> **证据标准**: **PRIMARY** = 成文法/监管机构/法院/服务商自身法律文件的第一方页面；**MIRROR** = 权威原始 URL 被自动化抓取阻断时，经镜像渲染后逐字核对（每条声明标注）；**SECONDARY** = 第三方整理，仅作背景，不用于断言税率或门槛；**UNVERIFIED** = 未能核实。**本文不给出任何无法溯源的税率或注册门槛**；无法核实的以"结构 + 缺口"描述。
> **状态**: 已完成（未核实项见 §8）
> **检索诚实性说明**: `eur-lex.europa.eu` 与 `legislation.gov.uk` 对自动化抓取返回 202 机器人挑战/JS 挑战；`ato.gov.au` 对本次抓取返回 **HTTP 403 Access Denied**。对这三类来源，本文引用权威原始 URL，但条款文本经镜像逐字核对并显式标注 MIRROR；澳大利亚 GST 的 ATO 页面改用 **Wayback Machine 的 ATO 存档页**（该存档页标有 "Last updated 11 September 2025"）。凡未能逐字核对的，全部进入 §8。
> **免责声明**: 本文为合规研究，非法律或税务意见。中国境内主体的所得税、以及美国各州/加拿大各省的具体适用，需分别咨询当地执业税务师/律师。

> **独立复核状态（由本仓库复核者执行，非撰写者自述）**:
>
> | 断言 | 复核结果 |
> | :--- | :--- |
> | **欧盟「非欧盟设立者无 €10,000 门槛，从第一笔起有义务」**（本报告最关键结论） | ✅ **已独立复核（一手 PDF 全文）**：复核者下载欧委会《Explanatory Notes》(revised 1 Jan 2027) 并提取 §3.2.7 正文。该节明确门槛条件为：「the supplier is established, has his permanent address or usually resides in **only one Member State**」（Article 59c(1) 条件 1）。**非欧盟设立者不满足此条件，故不享有该门槛** —— 本报告结论成立。另核实 §3.1.3「The non-Union scheme can be used exclusively by taxable persons (suppliers) **not established in the EU**」，确认 OSS 非欧盟分支的存在与适用范围。 |
> | 英国 VAT 标准税率 20% | ✅ 已复核：gov.uk/vat-rates 官方页返回 200，元数据即「standard 20%」 |
> | 各国门槛数字（UK/AU/CA/SG/NZ、美国各州） | ⚠️ 采纳其标注：AU 的 ATO 页面 403，门槛经 **Wayback 镜像**（报告已标 MIRROR）；其余有 canada.ca / IRAS / IRD / SDCL / CDTFA 一手链接 |
> | 条款逐字（EUR-Lex / legislation.gov.uk） | ⚠️ 报告已诚实标注 **MIRROR**（原始站 202 JS 挑战）。**方法上可接受**：MIRROR 标注 + 原始 URL 同时给出 |
>
> **方法说明**：本次复核**只验证代理指标与关键结论是否成立**，不逐条重查全部 66 个来源。凡报告标 MIRROR/UNVERIFIED 处，本复核**不将其升格为已核实**。
>
> **结论**：该报告可用于决策（选 MoR 的理由成立），但**具体税率与门槛在真正报税前仍应由执业税务师复核** —— 这也是报告 §11 免责声明自身的立场。

---



## 1. 结论先行

**一句话结论：如果一切自己卖，你从自己的第一笔海外 B2C 数字销售起，就同时落入欧盟/英国/澳/加/新西兰的"远程/数字服务"间接税网络（这些市场对非居民数字卖家普遍没有起征门槛）；美国则是"逐州经济关联"且数字商品可税性逐州不同。用 MoR 可以一次性替你解决"谁是卖家 + 间接税注册申报 + 卡数据合规"三大块，但消费者法、你自有网站的隐私法义务、以及你本国的所得税，MoR 一概不接管。**

### 1.1 直接适用到本卖家的义务

| 义务域 | 不用 MoR（自己卖） | 用 MoR |
| :--- | :--- | :--- |
| **欧盟 VAT** | 从**第一笔** B2C 电子服务销售起，按客户所在成员国税率征收，须注册 **non-Union OSS** 或逐国注册 | MoR 作为卖方自行注册/申报/缴纳，你**不再**需要 OSS |
| **英国 VAT** | 非英国设立者**从第一笔**应税供应起即须注册（无 £85k 门槛） | 同上，由 MoR 承担 |
| **澳大利亚 GST** | 非居民入境无形资产供应达到 **A$75,000** 门槛须（简化）注册 | MoR 承担 |
| **加拿大 GST/HST** | 对"特定加拿大接收方"的特定供应超过 **C$30,000** 须简化注册 | MoR 承担 |
| **美国州销售税** | 逐州**经济关联**（如 SD >$100,000 或 200 笔；CA >$500,000），数字商品可税性逐州不同 | MoR 作为卖方承担 |
| **新加坡/新西兰 GST** | SG：全球营业额 >S$1M 且对 SG 远程服务 >S$100k；NZ：>NZ$60,000 | MoR 承担 |
| **EU/UK 14 天撤回权 + 数字内容弃权** | **你有义务**在交付前取得"明示同意 + 知悉丧失撤回权" | **仍是你的义务**（MoR 不会替你满足信息与同意要件） |
| **美国自动续订/负面选项** | FTC Act §5 + ROSCA + 各州 ARL（如加州） | **仍是你的义务**（披露、同意、click-to-cancel） |
| **隐私/GDPR** | 你自己是控制者：Art 13/14 告知、Art 27 欧盟代表、cookies 同意、DPA | 仅**后端收款数据**部分转移；**你的站点分析/广告仍是你** |
| **PSD2/SCA、PCI DSS** | 必须由你的 PSP/网关落实 SCA 与 3DS；架构**绝不落卡数据** | MoR/PSP 承担 |
| **你本国的所得税** | **你的义务** | **仍是你的义务** |

### 1.2 三条最重要的可执行判断

1. **MoR 买的是"间接税 + 卖方身份 + 卡合规"，不是"全部合规"。** 消费者法（撤回权弃权、自动续订披露与取消、退款）与 GDPR 告知义务附着于**面向消费者的销售体验**，即使法律卖方变成 MoR，你的落地页/结账页/条款仍是监管机关与消费者主张的抓手。
2. **不要自建结账收卡。** 只要卡数据经过你的服务器，你就从 **SAQ A** 掉进 **SAQ A-EP / SAQ D** 的沉重范围。用托管结账（MoR/PSP 托管页或 iframe）把卡数据完全隔离。
3. **欧盟"从第一笔起"是关键。** 欧盟 €10,000 门槛**明确不适用于非欧盟设立者**（欧委会《Explanatory Notes》原文，见 §2.2）。这意味着在欧盟没有"小卖家豁免"，想合规只有 MoR 或自行 OSS 两条路。

---

## 2. 间接税（VAT / GST / 销售税）按国家

### 2.1 汇总表

| 市场 | 税种与税率结构 | 非居民数字卖家的注册门槛 | 一站式/申报机制 | 主要一手来源 |
| :--- | :--- | :--- | :--- | :--- |
| **欧盟** | VAT，各成员国标准税率**下限 15%**（Art.97 VAT Directive），实际税率见 TEDB；电子服务按**客户所在成员国**税率 | **无门槛**：€10,000 门槛**不适用于非欧盟设立者**，故**从第一笔起**在客户国产生纳税义务 | **non-Union OSS**（可选），向"识别成员国"按季申报 | [EC VAT rates](https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en)；[EC OSS](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en)；EC《Explanatory Notes》§3.2.7（见 §2.2） |
| **英国** | VAT 标准税率 **20%**；数字服务按客户所在地 | 非英国设立者（NETP）就**任何金额**的应税供应即须注册（Schedule 1A VATA 1994） | 须注册英国 VAT 并申报（此类数字服务无英国版 OSS） | [GOV.UK VAT rates](https://www.gov.uk/vat-rates)；[HMRC VATREG37200](https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg37200) |
| **澳大利亚** | GST **10%**（GST 为售价的 1/11） | **A$75,000**（GST turnover；非营利 A$150,000）；含对澳消费者的进口服务与数字产品 | 简化 GST 注册（Simplified GST registration） | ATO《How Australian GST works》（经 Wayback 存档，**MIRROR**）；[legislation.gov.au GST Act](https://www.legislation.gov.au/C2004A00446/latest/text) |
| **加拿大** | 联邦 **GST 5%**（ETA s.165(1)）；参与省份 **HST 13%（安省）/15%（新斯科舍等）**，按供应地适用 | 非居民向"特定加拿大接收方"做"特定供应"超过 **C$30,000** 须简化注册 | 简化 GST/HST 注册制度 | [CRA 数字经济活动](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html)；[CRA 是否须注册](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html)；[CRA 适用税率](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html)；[ETA s.165](https://laws-lois.justice.gc.ca/eng/acts/E-15/section-165.html) |
| **美国** | **无联邦 VAT/销售税**；由**各州+地方**征收销售/使用税，税率与税基逐州不同 | **无"门槛"概念，取而代之是经济关联（economic nexus）**：各州门槛不同（如 SD >$100,000 **或** ≥200 笔；CA >$500,000） | 逐州注册、按州申报（无全国一站式） | [South Dakota v. Wayfair (2018)](https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf)；[SDCL 10-64-2](https://sdlegislature.gov/Statutes/10-64-2)；[CDTFA Wayfair 页](https://cdtfa.ca.gov/industry/wayfair/general-information.htm) |
| **新加坡** | GST **9%** | 全球年营业额 **>S$1,000,000** 且对新加坡 B2C 远程服务 **>S$100,000** | Overseas Vendor Registration（OVR） | [IRAS 海外企业](https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/gst-and-digital-economy/overseas-businesses)；[IRAS 当前税率](https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/current-gst-rates) |
| **新西兰** | GST **15%** | 对 NZ 客户的货物/服务总供应超过 **NZ$60,000**（过去或未来 12 个月） | 注册 remote services GST | [IRD Supplying remote services into NZ](https://www.ird.govt.nz/gst-on-remote-services) |

### 2.2 欧盟：为什么"没有门槛"（最关键的一条）

**法条结构。** 电子服务（TBE = 电信、广播、电子服务）的**供应地为消费者所在地**（Directive 2006/112/EC 第 58 条的位置规则体系），因此原则上按客户所在成员国课 VAT。

**€10,000 门槛及其排除。** 欧委会《Explanatory notes on the new VAT e-commerce rules》（revised 1 Jan 2027，§3.2.7）逐字写明：

> "This threshold does not apply to: i) supplies of TBE services made by a supplier **not established in the EU** (non-Union scheme) …"

同一文件 Table 5 亦列明：由 "suppliers established outside the EU" 作出的 B2C TBE 服务，结果为 "**Threshold not applicable**"。
来源（**PRIMARY，欧委会 PDF**）：[Explanatory Notes](https://vat-one-stop-shop.ec.europa.eu/document/download/774b31ca-03c6-4fb1-8209-9e447aeeb1e9_en?filename=Explanatory%20Notes_revised_1Jan2027_0.pdf) §3.2.7。

**OSS 机制。** 非欧盟设立者可选用 **non-Union scheme**，在任一"识别成员国"（Member State of identification）注册并按季申报，免去逐国注册（[EC One Stop Shop](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en)）。

**税率结构。** 各成员国标准税率**不得低于 15%**（Art.97 VAT Directive），无上限；优惠税率体系自 2022 年 4 月起由 Council Directive (EU) 2022/542 调整。**具体国别税率本文不逐一列举**，请查欧委会 **TEDB（Taxes in Europe Database）**（[EC VAT rates](https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en)）。
> ⚠️ Directive 2006/112/EC 在 EUR-Lex 的直接抓取返回 202 JS 挑战；本文对其条款的引用标注 **MIRROR**（经镜像渲染后核对），原始 URL 为 [EUR-Lex 32006L0112](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0112)。

### 2.3 英国

- **税率**：标准税率 **20%**，减税率 5%，零税率 0%（GOV.UK《VAT rates》，**PRIMARY**）。
- **注册义务**：HMRC《VATREG37200》载明："a business without UK establishment is liable to register under Schedule 1A of the VAT Act 1994 if it makes taxable supplies of **any value** or intends to do so in the next 30 days."（**PRIMARY**，2026-07-29 更新）。即**没有 £85,000 门槛**适用于非英国设立者。
- 数字服务指引："If your supplies are liable to UK VAT you will need to register for UK VAT if you are based outside the UK."（[GOV.UK 数字服务指引](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers)，**PRIMARY**）。
- 通过第三方平台/市场销售时，**平台**负责申报 VAT（同上指引原文："the digital platform is responsible for accounting for VAT on the supply instead of you."）。

### 2.4 澳大利亚

- **税率**：ATO 原文："The GST rate in Australia is **10%**, meaning GST is 1/11th of the amount you charge for sales connected with Australia."
- **门槛**：ATO 原文（同页）："Your GST turnover from sales connected with Australia from your enterprise is **equal to, or greater than the registration turnover threshold of A$75,000**（或非营利 A$150,000）… GST turnover includes the combined value of: imported services and digital products to Australian consumers …"
- 来源：ATO《How Australian GST works》，标 "Last updated 11 September 2025"。**注意**：`ato.gov.au` 对本次抓取返回 HTTP 403，上述引文取自 **Wayback Machine 的 ATO 存档页**（**MIRROR**）；法条本体见 [A New Tax System (Goods and Services Tax) Act 1999](https://www.legislation.gov.au/C2004A00446/latest/text)（含 Div 84 "inbound intangible consumer supplies"；本轮未逐条抓取，见 §8）。
- **简化注册**：低门槛非居民可用 Simplified GST registration（ATO《Simplified GST registration》页）。

### 2.5 加拿大

- **联邦 GST 5%**：ETA s.165(1) 原文："every recipient of a taxable supply made in Canada shall pay … tax … calculated at the rate of **5%** on the value of the consideration for the supply."；参与省份另加 HST（**PRIMARY**，[laws-lois.justice.gc.ca](https://laws-lois.justice.gc.ca/eng/acts/E-15/section-165.html)）。
- **HST 税率**：CRA《Charge and collect the GST/HST》举例明确 "place of supply is Ontario → charges **13% HST**"、"Nova Scotia → **15%**"（**PRIMARY**）。
- **门槛（数字卖方）**：CRA 是否须注册页面的判定逻辑即 "Does your registration threshold exceed **$30,000 CAD**?"；适用对象为向 "**specified Canadian recipient**" 作出 "**specified supply**" 的**非居民、非（普通）注册**卖方（CRA《GST/HST for digital-economy businesses》与《Find out if you need to register》，**PRIMARY**）。
- **定义**：CRA《Definitions》载明 "specified supply means a taxable supply of intangible personal property or a service …"；"specified Canadian recipient" 排除已提供普通 GST/HST 注册号者（**PRIMARY**）。
- **魁北克 QST**：非居民向魁省消费者提供数字服务另可能触发 **QST 9.975%** 的"指定制度"注册。本文**未能从 Revenu Québec 官网直接取回**（多次 404/被拒），9.975% 与"须与 GST 分列"仅见于 **SECONDARY/UNVERIFIED**（见 §8）。
- **省 PST**：卑诗省等对非居民数字服务的 PST 适用需逐一核实；本轮未验证（见 §8）。

### 2.6 美国：州销售税与经济关联（economic nexus）

- **宪法基础**：*South Dakota v. Wayfair, Inc.*, No. 17-494（2018-06-21）。判决主文："Because the physical presence rule of *Quill* is unsound and incorrect, *Quill Corp. v. North Dakota*, 504 U. S. 298, and *National Bellas Hess, Inc. v. Department of Revenue of Ill.*, 386 U. S. 753, are **overruled**."（**PRIMARY**，[supremecourt.gov](https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf)）。
- **经济关联（economic nexus）**：Wayfair 判决书描述 SD 法："covers only sellers that, on an annual basis, deliver **more than $100,000** of goods or services into the State **or engage in 200 or more separate transactions**."；[SDCL 10-64-2](https://sdlegislature.gov/Statutes/10-64-2) 原文亦要求 gross revenue 超过 "**one hundred thousand dollars** in the previous or current calendar year"。
- **加州**：CDTFA 明确，依 RTC §6203/§7262，在**前一或当年度**对加州的应税有形动产总销售（含关联方）**超过 $500,000** 的远程卖方，须向 CDTFA 注册、代收州使用税，并 "engaged in business in **every district** in the state"（**PRIMARY**，[CDTFA](https://cdtfa.ca.gov/industry/wayfair/general-information.htm)）。
- **关键不确定项**：**数字商品与订阅在各州是否可税、按什么定义课税，逐州不同**，且部分州以"有形个人财产"定义销售税，可能将纯电子交付排除或纳入。本文**不给出任何州的可税性结论**（未取得逐州一手裁定），见 §8。
- **市场促成方法（marketplace facilitator）**：若通过平台销售，平台常被要求代收代缴；若自营，则须自行判断逐州关联。

### 2.7 新加坡与新西兰

- **新加坡**：当前 GST **9%**（IRAS《Current GST Rates》页面结构化数据原文："The current GST rate in Singapore is **9%**."）。OVR 门槛：IRAS 原文 "Overseas suppliers, with a **global annual turnover of at least $1 million**, making B2C supplies of low-value goods and remote services to Singapore **exceeding $100,000** are required to register, charge and account for GST on these supplies."（**PRIMARY**）。
- **新西兰**：GST **15%**（IRD "Rate 15%"）。门槛：IRD 原文 "You must register for and charge GST when your total supplies of goods and services to New Zealand customers either: were **more than $60,000** in the last 12 months, or are expected to be more than $60,000 in the next 12 months."；远程服务包括 "digital content such as e-books … subscriptions"（**PRIMARY**，[ird.govt.nz](https://www.ird.govt.nz/gst-on-remote-services)）。

---

## 3. MoR 是否转移税负

### 3.1 MoR 作为"记录卖方"的自我描述（服务商自身法律文件，PRIMARY）

| 服务商 | 原文关键句 | 来源 |
| :--- | :--- | :--- |
| **Paddle** | Buyer Terms："Paddle is an **authorised reseller** of Products for Suppliers, which means you **purchase the Product from Paddle** using our Services…"；Supplier Terms：Paddle 承担 "(ii) acting as your **non-exclusive reseller** of the Product via Paddle Checkout… (iv) … being **responsible for all aspects of Sales Tax** as between you, Paddle and Buyers."；开发者文档："Paddle **calculates, collects, and remits taxes** for you across the world. No need to register for VAT, GST, or sales tax in the countries where you operate." | [Paddle Buyer Terms](https://www.paddle.com/legal/buyer-terms)；[Paddle Supplier Terms](https://www.paddle.com/legal/terms)；[developer.paddle.com](https://developer.paddle.com/get-started/how-paddle-works.md) |
| **FastSpring** | 条款原文："FastSpring shall act as a **reseller** of the Products, purchasing Products from Vendor and reselling them to Purchasers. This structure, where FastSpring is the **seller and merchant of record** of the Product, allows FastSpring to assume responsibility for **all VAT, Sales Taxes, Use Tax, and GST collection, reporting and remittance**…"；"As the **seller of record**, FastSpring shall have the right to **set the price** …" | [FastSpring Digital Retailer Services Terms](https://fastspring.com/terms-use/seller-terms-service/digital-retailer/) |
| **Lemon Squeezy**（2024-10 被 Stripe 收购） | "When a customer makes a purchase, they are **buying from the merchant of record** … responsible for … **collecting sales tax, processing refunds and chargebacks, and ensuring PCI compliance**."；"Lemon Squeezy is known as the **merchant of record** for all sales through our platform."；"Lemon Squeezy is technically **selling products on your behalf** and therefore **we are liable for all of the complicated bits**." | [LS: Merchant of Record](https://docs.lemonsqueezy.com/help/payments/merchant-of-record)；[LS: Sales Tax and VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat) |

> **补充**：Lemon Squeezy 被 Stripe 收购（2024-10-22 公告），后续推出 "Lemon Squeezy + Stripe Managed Payments"（2026-04-16 更新）——选型时务必确认当前条款与存续安排。

### 3.2 MoR 明确**不**接管的义务

1. **你本国的所得税与常设机构判定**。三家 MoR 的自我限定都只覆盖**间接税**（sales tax/VAT/GST）。同时它们仍会收集你的税务身份信息（FastSpring："The IRS requires FastSpring to collect tax information from sellers earning revenue on our platform"；Lemon Squeezy：非美国商户须填 **W-8**）。**没有任何一家声明替你缴纳居住国所得税**——**UNVERIFIED**，见 §8。
2. **产品责任与消费者法义务**。MoR 的责任被明确限定在支付、销售税、退款/拒付、PCI。FastSpring 甚至要求：交易相关条款必须是 **FastSpring 的条款**，但"we recommend you still apply your own **EULA** for using the product"——即**产品本身的 EULA/责任仍归你**。
3. **你自有网站的隐私控制者身份**（见 §6）。Paddle 的数据共享附录是 **controller-to-controller**："one Controller (the Data Discloser) discloses Personal Data to another Controller (the Data Receiver)"；"Each party shall bear responsibility for **its own compliance obligations** under applicable Data Protection Legislation…"。FastSpring 明言："your company may have **additional obligations under GDPR**, for which FastSpring cannot provide legal advice."
4. **拒付/退款的处理成本仍落在你的结算款上**。MoR 出面处理流程，但：Lemon Squeezy 可"issue refunds within 60 days"并收取 "**$15 dispute fee**"，均从你的 payout 扣除；FastSpring 的争议结果"determined solely by the buyer's bank"，争议款从你 payout 扣。
5. **不在 MoR 体系内的销售**：若你另开自营结账或另一渠道，那部分间接税仍是你的事。
6. **关税/进口税**：FastSpring 明示 "FastSpring is **not responsible for import taxes or customs duties**."（对纯数字交付通常不涉及）。

### 3.3 你能从 MoR 拿回哪些客户数据（决定你的 GDPR 义务范围）

| 服务商 | 通过 webhook/API 回传的字段 |
| :--- | :--- |
| Paddle | customer：name、email、locale、marketing_consent；address：country_code、city、region、postal_code、first_line（[customer-created](https://developer.paddle.com/webhooks/customers/customer-created.md)、[address-created](https://developer.paddle.com/webhooks/addresses/address-created.md)） |
| Lemon Squeezy | customer：name、email、city、region、country；order：user_name、user_email、tax、total（[customers API](https://docs.lemonsqueezy.com/api/customers)、[webhook payload](https://docs.lemonsqueezy.com/help/webhooks/example-payloads)） |
| FastSpring | 结账结束按 customer email + name 建 account，触发 `account.created` webhook（[pass-customer-information](https://developer.fastspring.com/docs/pass-customer-information.md)） |

> **缺口**：**没有一家文档承诺回传"税务居民身份"字段**；实务上 country/address 只能作为代理指标。

---

## 4. 消费者法义务（这些 MoR 不能替你免）

### 4.1 欧盟/英国：14 天撤回权 + 数字内容弃权

**欧盟（Directive 2011/83/EU，消费者权利指令 CRD）**：
- **Art.9(1)**（**MIRROR** 逐字核对）："Save where the exceptions provided for in Article 16 apply, the consumer shall have a period of **14 days** to withdraw from a distance or off-premises contract, without giving any reason …"
- **Art.16(m)**（**MIRROR** 逐字核对）："the supply of **digital content which is not supplied on a tangible medium** if the performance has begun with the consumer's **prior express consent** and his **acknowledgment that he thereby loses his right of withdrawal**."
- **信息义务 Art.6(1)**：须在缔约前以清晰易懂方式告知，包括 **(h)** 撤回权的条件、期限与程序（撤回模板见 Annex I(B)）；**(k)** 若不享有撤回权（依 Art.16），须告知 "the consumer will not benefit from a right of withdrawal or … the circumstances under which the consumer loses his right of withdrawal"；**(o)** 合同期限、自动续约时的终止条件；**(r)/(s)** 数字内容的功能性与互操作性。
- **后果**：若未履行 Art.6(1)(h) 的撤回权信息义务，**撤回期延长**至 12 个月（Art.10）。
- 来源：**MIRROR**（EUR-Lex 32011L0083 经镜像渲染后逐字核对），原始 URL：[EUR-Lex 32011L0083](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083)。

**英国（Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, SI 2013/3134）**：
- **reg.30(2)**（**MIRROR** 逐字核对）：数字内容且非有形介质时，取消期 "ends at the end of **14 days** after the day on which the contract is entered into."
- **reg.37(1)**（**MIRROR** 逐字核对）："Under a contract for the supply of digital content not on a tangible medium, the trader **must not begin supply** … before the end of the cancellation period … unless— (a) the consumer has given **express consent**, and (b) the consumer has **acknowledged that the right to cancel** … **will be lost**."
- **reg.37(4)**：若未取得该同意/知悉，或未在耐久介质上确认，**消费者对已开始的数字内容不承担任何费用**："The consumer bears no cost for supply of the digital content … if— (a) … no prior express consent … (b) … did not acknowledge … (c) the trader failed to provide confirmation …"
- 来源：**MIRROR**（legislation.gov.uk 经镜像渲染后逐字核对），原始 URL：[SI 2013/3134 reg.37](https://www.legislation.gov.uk/uksi/2013/3134/regulation/37)、[reg.30](https://www.legislation.gov.uk/uksi/2013/3134/regulation/30)。

**欧盟数字内容指令（Directive (EU) 2019/770）**：
- **Art.14**（救济）：数字内容/服务不符合时，消费者有权要求**修复、减价、终止合同并退款**等；若国内法要求不合规须在一定期间内显现，则该期间"**shall not be less than two years** from the time of supply"。
- **Art.11**：持续供应的合同，责任覆盖"the period of time during which the digital content or digital service is to be supplied"。
- 来源：**MIRROR**（EUR-Lex 32019L0770 渲染核对），[EUR-Lex 32019L0770](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0770)。**注意**：2019/770 的终止与退款条文（Art.16–18）本轮因渲染截断未逐字取回，见 §8。

**英国 CRA 2015（数字内容）**：消费者数字内容合同另有法定救济（ss.33–47 体系）。本轮**未逐字取回**（见 §8）。

### 4.2 美国：自动续订 / 负面选项（negative option）

**FTC "click-to-cancel" 规则的当前状态（关键，且近期发生重大变化）**：
- FTC 2024-11-15 发布的《Rule Concerning Recurring Subscriptions and Other Negative Option Programs》（16 CFR part 425 修订版）**已被法院撤销**。第八巡回上诉法院认定 FTC 未发布 preliminary regulatory analysis，"procedurally insufficient"，遂 **vacated** 该 2024 规则（*Custom Commc'ns, Inc. v. FTC*, 142 F.4th 1060 (8th Cir. 2025)）。
- FTC 于 **2026-02-12** 在《Federal Register》发布 **final rule**，把 16 CFR part 425 **恢复到 2024 规则生效前的文本**，即 **"Use of Prenotification Negative Option Plans"**（回归 1973 年原规则框架），同时撤回 CARS Rule、移除 Non-Compete Rule。
- 来源（**PRIMARY**）：[Federal Register Vol. 91, No. 29 (2026-02-12), 91 FR 6507](https://www.govinfo.gov/content/pkg/FR-2026-02-12/html/2026-02866.htm)；判决 *Custom Commc'ns, Inc. v. FTC*, 142 F.4th 1060 (8th Cir. 2025)。
- **实务含义**：即使没有统一的联邦 "click-to-cancel" 规则，FTC 仍可依 **FTC Act §5**（unfair/deceptive acts）与 **ROSCA（Restore Online Shoppers' Confidence Act, 15 U.S.C. §§ 8401–8405）** 执法，要求清晰披露续订条款、取得明示同意、提供简便取消；**各州法**亦独立适用。

**加州自动续订法（ARL, Cal. Bus. & Prof. Code §§ 17600–17606；AB 2863 修订，2023-07-01 生效）**：
- **§17602(a)**（**PRIMARY**，leginfo 打印视图逐字核对）禁止：**(1)** 未在履行前以 "clear and conspicuous manner" 且"在视觉上紧邻于请求同意处"呈现自动续订条款；若含免费赠品/试用，须在收费前披露试用结束后的费用及价格变动方式；**(2)** 未先取得 **affirmative consent** 即扣款；**(3)** 未提供可留存的确认（含续订条款、取消政策、如何取消）；**(4)** 未取得对续订条款的 **express affirmative consent**。
- **§17603**：未先取得同意即发货/提供服务，视为 "**unconditional gift**"，消费者无义务。
- 来源：加州立法官网打印视图 [BPC §17602](https://leginfo.legislature.ca.gov/faces/printCodeSectionWindow.xhtml?lawCode=BPC&article=9.&sectionNum=17602.&op_statues=2024&op_chapter=515&op_section=2)（**PRIMARY**）；镜像交叉核对 [california.public.law §17602](https://california.public.law/codes/business_and_professions_code_section_17602)（**MIRROR**）。
- **其他州**：多个州有各自 ARL（结构类似：披露、同意、取消）。本文**未逐一取得**各州一手条文，见 §8。

**必须做到的（合称）**：
1. 收费前**清晰且显著**地披露：会自动续订、周期、金额、如何取消。
2. 取得对续订条款的**明示同意**（不得用预选勾选框）。
3. 提供**可留存的确认**（邮件 / 账单页）。
4. 取消必须**简便**（在线自助取消，步骤不劣于订阅时）。
5. 免费试用前先披露并取得同意，且在试用结束前允许取消。

### 4.3 退款义务按市场

| 市场 | 退款/救济结构 | 来源状态 |
| :--- | :--- | :--- |
| **欧盟** | 撤回权内退货退款（Art.13 CRD）；数字内容不符合时依 2019/770 Art.14 取得修复/减价/终止退款 | CRD 条文 **PRIMARY/MIRROR**；2019/770 部分条文待补（§8） |
| **英国** | 14 天取消费用返还（CCR 2013）；CRA 2015 下数字内容不符合时的修复/退款 | CCR 条文 **MIRROR**；CRA 2015 待补（§8） |
| **澳大利亚** | **Australian Consumer Law** 消费者保障（consumer guarantees）；不符合保障时可要求补救，且**不得以合同排除**（ACL 的保障不可排除条款） | 法条 URL 已知（[Competition and Consumer Act 2010 Sch 2](https://www.legislation.gov.au/C2004A04426/latest/text)），但本轮抓取失败，**UNVERIFIED**（§8） |
| **加拿大** | 联邦层面对数字商品无统一"退款权"；主要落在**省级消费者保护法** | 本轮未验证（§8） |
| **美国** | **无一般联邦退款权**；以商家自定政策 + FTC Act §5 + 各州 ARL 约束 | 结构性结论；具体州待核 |

> **给本产品的直白建议**：金融测算工具最容易触发的是"**消费者主张不符合描述/未达预期**"。即便 MoR 处理了支付退款，**退款资格判断与产品描述准确性**仍应由你控制，否则会成为争议与差评来源。

### 4.4 服务条款与隐私政策是否强制

**是。** 至少有三条独立的法律理由：
1. **GDPR Art.12(1) + Art.13/14** 要求以 "concise, transparent, intelligible and easily accessible form" 向数据主体提供处理信息 → 必须有隐私政策（见 §6）。
2. **CRD Art.6(1)** 的缔约前信息义务（含撤回权、合同期限、自动续约终止条件）需要可呈现的条款载体 → 服务条款。
3. **ePrivacy Art.5(3)** 的 cookies 告知与同意（见 §6）。

---

## 5. 支付合规

### 5.1 PSD2 / SCA（强客户认证）

- **法律义务落在支付服务提供商（PSP）**，不是商户。Commission Delegated Regulation (EU) 2018/389（RTS）**Art.1** 逐字（**MIRROR** 核对）："This Regulation establishes the requirements to be complied with by **payment service providers** for the purpose of implementing security measures which enable them to do the following: (a) apply the procedure of **strong customer authentication in accordance with Article 97 of Directive (EU) 2015/2366** …"；**Art.2** 进一步要求 PSP 部署交易监控机制。
- **PSD2 Art.97(1)**（其存在与"义务在 PSP"由 RTS Art.1 的交叉引用确证；本轮 EUR-Lex 渲染在此之前被截断，**未逐字取回**，见 §8）：成员国立 ensure 支付服务提供商在特定情形下施加 SCA。欧委会/EBA 亦明示，SCA 的落实与迁移计划是 **PSP** 对监管机关的义务；欧委会文件指出弹性安排"conditional on that the **payment service provider (PSP)** designs a migration plan, agrees the plan with its NCA, and executes the plan…"。
- **对你的含义**：**你不需要自己实现 SCA**。使用 MoR 时，**MoR 才是面对 PSP 的商户**；使用普通 PSP 时，由该 PSP 的托管结账落实。你只需在架构上**避免任何绕过 SCA 的自建收卡表单**。
- 来源：[RTS 2018/389](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018R389)（**PRIMARY/MIRROR**）；PSD2 [EUR-Lex 32015L2366](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32015L2366)（**MIRROR/SECONDARY**）。

### 5.2 3-D Secure

- **EMVCo** 定义协议："EMV 3DS enables the exchange of data, or messages, between the merchant and the issuer to **authenticate the consumer** and approve the transaction."（[emvco.com](https://www.emvco.com/emv-technologies/3-d-secure/)，**PRIMARY**）。
- **由 PSP/网关触发**：Stripe 文档原文 "Stripe triggers 3DS automatically if mandated by regulations such as Strong Customer Authentication in Europe…"、"Stripe's mandatory authentication rules run automatically, regardless of whether or not you manually request 3DS."（[docs.stripe.com](https://docs.stripe.com/payments/3d-secure/authentication-flow)，**PRIMARY**）。Paddle 的宣传页亦列 "3DS2 support. Data stored in a fully PCI-1-compliant vault."
- **你的动作**：不需要自建 3DS Server；在 PSP/MoR 后台**启用**认证即可。**UNVERIFIED**：是否存在"完全无需任何配置"的情形。

### 5.3 PCI DSS 范围

- **架构铁律：永不存储/处理/传输卡数据（PAN/CVV）。**
- **SAQ A 的适用条件**（PCI SSC 原文）："All processing of account data is **entirely outsourced** to PCI DSS compliant third-party service provider (TPSP)/payment processor; The merchant **does not electronically store, process, or transmit any account data** on merchant systems or premises…"（[PCI DSS v4.0 SAQ A](https://www.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A.pdf)，**PRIMARY**）。
- **SAQ A-EP**：若你的站点"does not itself receive account data but … **does affect the security of the payment transaction and/or the integrity of the page** that accepts the customer's account data"（[PCI DSS v4.0 SAQ A-EP](https://www.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A-EP.pdf)，**PRIMARY**）。
- **2025 更新**：PCI DSS v4.0.1（2025-04-01 生效）为 SAQ A 增加"站点不易受脚本攻击"的资格条件；FAQ 1588 允许要么落实 Req 6.4.3/11.6.1，要么取得 TPSP 的确认（[PCI SSC 博客](https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants)）。
- **结论**：使用托管/跳转结账或 MoR，你通常符合 **SAQ A** 范围（若你的页面脚本影响支付页完整性，则可能落入 **SAQ A-EP**）；**卡数据绝不落你的服务器**是唯一不可妥协的架构约束。

---

## 6. 隐私与数据

> GDPR/ePrivacy 条文因 EUR-Lex 与 legislation.gov.uk 阻断，经镜像逐字核对并**逐条标注 MIRROR**；监管机构（EDPB/ICO/Google）页面为 PRIMARY。

### 6.1 GDPR 是否适用于你（非欧盟开发者）

- **适用**：**Art.3(2)(a)** —— "the offering of goods or services, irrespective of whether a payment of the data subject is required, **to such data subjects in the Union**"（**MIRROR**，[gdpr-info.eu/art-3-gdpr](https://gdpr-info.eu/art-3-gdpr/)）。EDPB Guidelines 3/2018 的 "targeting" 标准（使用欧盟语言/货币、面向欧盟投放广告等）会使其成立（**PRIMARY，EDPB**）。
- **Art.27 欧盟代表**：Art.27(1) 要求非欧盟控制者 "**shall designate in writing a representative in the Union**"；Art.27(2) 豁免仅适用于 "processing which is **occasional** … and is unlikely to result in a risk"。**持续订阅与持续分析不属于 occasional**，故豁免不成立 → 需指定欧盟代表（**MIRROR**，[gdpr-info.eu/art-27-gdpr](https://gdpr-info.eu/art-27-gdpr/)）。

### 6.2 控制者/处理者与 DPA

- 你仍是**你自己决定的数据**（账号、分析、营销）的控制者（Art.4(7)）；MoR 是结账/支付数据的控制者或独立控制者；你从 MoR 收回的数据使**你**成为控制者。
- **你从 MoR 收到的典型字段**：
  - **FastSpring DPA（PRIMARY）**：数据类别包括 "**First name; last name; email address; and unique user code**"；在 EEA/UK/CH 场景 "FastSpring acts as a **joint controller** … with the Vendor"，另约定 "Vendor shall be the **Controller** and FastSpring shall be the **Processor**"。[FastSpring DPA](https://fastspring.com/terms-use/data-processing-agreement/)
  - **Paddle DPA（PRIMARY）**：Paddle "act as a **Processor**"；数据类型含 "e-mail, user ID, name, phone number, last 4 digits of the card number, language, address, IP address"。[Paddle DPA](https://www.paddle.com/legal/data-processing-addendum)
  - **Lemon Squeezy DPA（PRIMARY）**："The Company acts as a **Data Controller**"，Lemon Squeezy 为 "**Data Processor**"，跨境依赖 "EU approved standard contractual clauses"。[Lemon Squeezy DPA](https://www.lemonsqueezy.com/dpa)
- **Art.28(3)** 要求处理者关系由合同约束并载明标的、期限、数据类别与义务（**MIRROR**）。**因此你需要 DPA**：与 MoR（若其作为处理者）、与 **Google Analytics/AdSense**（Google Ads Processor Terms + Controller-Controller Terms）、邮件服务商、托管/CDN。若 FastSpring 为 joint controller，另需 **Art.26** 安排。
- **Paddle 的角色张力**：其 DPA 称 processor，而买方条款称 Paddle 为授权转售方/卖方——**以签约文本为准**（见 §8）。

### 6.3 核心 GDPR 义务清单

| 主题 | 条款 | 要点 |
| :--- | :--- | :--- |
| 问责 | Art.5(2) | 须能 "demonstrate compliance" |
| 合法性基础 | Art.6(1) | 交付服务 = **(b) 合同**；税务 = **(c) 法律义务**；安全 = **(f) 正当利益**；分析与广告 cookie = **(a) 同意** |
| 同意 | Art.7 | 须能证明同意；撤回与给予**同等容易** |
| 透明 | Art.12/13/14 | 清晰易懂；身份、目的与基础、接收方、跨境与保障、留存期、权利、投诉途径 |
| 权利 | Art.15–22 | 访问/更正/删除/限制/可携/反对/自动化决策；**一个月**内答复（Art.12(3)） |
| 记录 | Art.30 | 须维护处理活动记录；<250 人豁免**不适用于非 "occasional"** 的处理 |
| 安全 | Art.32 | 适当技术与组织措施（假名化、加密） |
| 泄露 | Art.33/34 | 72 小时内通报监管机关；高风险时告知数据主体 |
| 跨境 | Art.44–46 | 需充分性决定或 **SCC** 等适当保障；EU→中国/美国传输须 SCC + 传输影响评估（[ICO 国际传输指引](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/)，**PRIMARY**） |

（条文均经 **MIRROR** 核对：[gdpr-info.eu](https://gdpr-info.eu/)。）

### 6.4 Cookie / ePrivacy 与现有同意横幅

- **ePrivacy Directive 2002/58/EC Art.5(3)**：终端设备上存储/读取信息 "only allowed on condition that the subscriber or user concerned has given **his or her consent**"，仅 "strictly necessary" 可豁免（**MIRROR**）。
- **ICO（PECR reg 6，PRIMARY）**："you must: tell people the cookies are there; explain what the cookies are doing and why; and get the person's consent"；"Consent must be **actively and clearly given**."
- **Google 对 AdSense 发布商的强制要求（PRIMARY，Google）**：面向 EEA/UK/CH 提供个性化广告时，**必须使用 Google 认证且集成 IAB TCF 的 CMP**（EEA/UK 自 2024-01-16，瑞士自 2024-07-31）。来源：[Google consent management requirements](https://support.google.com/adsense/answer/13554116)。
- **Consent Mode 不等于同意横幅**：Google 原文 "Consent mode … **does not provide a consent banner or widget**."。因此，**现有"Google consent mode + 自建横幅"并不自动满足 Google 对认证 CMP 的要求，也不自动构成 GDPR/PECR 合规同意**。
- 行动：接入 **Google 认证 CMP**；确保同意可拒绝、可撤回；将分析与广告 cookie 置于同意之后。

### 6.5 中国侧（简要，超出本文范围）

- **PIPL Art.38** 规定个人信息出境须满足安全评估/认证/标准合同等条件之一（**PRIMARY，NPC 中文原文**）：如果从中国大陆向境外提供欧盟/英国买方数据，可能触发 CAC 标准合同备案或安全评估。**需中国执业律师确认，本文不展开。**

---

## 7. 上线前合规检查清单

### 7.1 税务与卖方身份

- [ ] 决定架构：**MoR（推荐用于间接税）** 还是自营 + PSP。
- [ ] 若用 MoR：在合同中逐一确认 **(a)** 其确为 seller/merchant of record；**(b)** 其代收代缴 VAT/GST/销售税的范围（欧盟、英国、澳、加、美国各州、SG/NZ）；**(c)** 费率与结算周期；**(d)** 退款/拒付由谁处理、费用如何从 payout 扣除。
- [ ] 若**自营**：欧盟注册 **non-Union OSS**（或逐国注册）；英国注册 VAT；澳（若超 A$75k）简化 GST；加（若超 C$30k）简化 GST/HST；SG（若超 S$1M 且 >S$100k）OVR；NZ（若超 NZ$60k）远程服务 GST；美国逐州做**经济关联评估**。
- [ ] 记录**判定依据与计算过程**（各门槛的滚动 12 个月测算），以备税务稽查。
- [ ] 咨询本地税务师处理**中国境内所得税/利润归属**（MoR 不处理）。
- [ ] 确认发票/收据格式符合各市场要求（MoR 通常代开）。

### 7.2 消费者法

- [ ] 结账页在**交付前**取得对数字内容的 **express consent + acknowledgement of loss of withdrawal right**（EU CRD Art.16(m)；UK CCR reg.37）——**必须留痕**。
- [ ] 提供**14 天撤回权**说明与撤回模板（EU）/ 取消权说明（UK）；若不适用，按 Art.6(1)(k) 说明原因。
- [ ] 订阅页面在收费前**显著披露**：自动续订、周期、金额、取消方法。
- [ ] 取得对续订条款的**明示同意**（无预选勾选框）。
- [ ] 发送**可留存的确认**（邮件含条款、取消政策、取消链接）。
- [ ] 提供**在线自助取消**且不设障碍（click-to-cancel 精神；加州 §17602 明示同意要件）。
- [ ] 免费试用：在试用结束前提醒并允许取消。
- [ ] 发布**服务条款**与**退款政策**（明确数字商品的手动退款口径）。
- [ ] 产品描述准确（避免触发"不符合描述"的救济主张）。

### 7.3 支付与安全

- [ ] 使用 MoR/PSP **托管结账**；前端**不出现卡号输入框**。
- [ ] 确认 SCA/3DS 由 PSP 落实（欧盟/EEA 客户）。
- [ ] 确定 PCI DSS 自评等级（默认目标 **SAQ A**），并向 PSP 索取 AOC/合规声明。
- [ ] 确保卡数据不进入日志、数据库、分析事件。

### 7.4 隐私与数据

- [ ] 发布**隐私政策**（GDPR Art.13/14 要素齐全：身份、目的与合法性基础、接收方、跨境与 SCC、留存、Art.15–22 权利、撤回、投诉途径）。
- [ ] 若**持续/非偶发**处理 EU 数据主体数据：指定 **Art.27 欧盟代表**。
- [ ] 与 MoR、Google（Analytics/AdSense）、邮件、托管**签署/并入 DPA**。
- [ ] 若涉及 EU→第三国传输：采用 **SCC** 并做传输影响评估（TIA）。
- [ ] 接入 **Google 认证 CMP**（EEA/UK/CH 个性化广告）；cookies 置于同意之后且可拒绝/撤回。
- [ ] 建立 **Art.30 处理活动记录** 与 **72 小时泄露响应流程**。
- [ ] 确认中国 PIPL 出境合规路径（如适用）。

---

## 8. 未能核实 (UNVERIFIED)

1. **Directive 2006/112/EC 逐条文本**：EUR-Lex 直接抓取返回 202 JS 挑战，本文引用为 **MIRROR**；Art.58 / Art.59c / Art.97 的**逐字条款**未从官方直接取回（Art.97 的"≥15%"经欧委会 VAT rates 页确认为 "no less than 15%"）。
2. **欧盟 2019/770 的 Art.16–18（终止与退款）**：EUR-Lex 渲染截断，未逐字取回；Art.11（持续供应）与 Art.14（救济、"不低于 2 年"）已见。
3. **英国 CRA 2015 数字内容条款（ss.33–47）**：未逐字取回。
4. **澳大利亚 ACL 文本**：`legislation.gov.au` 抓取失败；consumer guarantees 与"保障不可排除"（s.64）的**具体条文未逐字核对**。ATO GST 门槛/税率取自 **Wayback 存档的 ATO 页**（MIRROR）。
5. **加拿大魁北克 QST 9.975% 与"指定制度"注册门槛**：Revenu Québec 页面多次 404/被拒，**未取得一手确认**；省 PST（如 BC）对非居民数字服务的适用亦未验证。
6. **美国各州数字商品/订阅的可税性与税基定义**：未取得逐州一手裁定；本文只确认了**经济关联门槛**（SD、CA）与 Wayfair 判决。
7. **其他州自动续订法（CA 以外）**：未逐一取得条文。
8. **PCI DSS SAQ A / SAQ A-EP 的具体适用条件**：以 PCI SSC 最新文件为准；本文对 iframe/redirect 的差异只作一般性描述。
9. **3-D Secure / EMV 3DS 2.x 的官方逐字规格**：未取回完整规格，属 SECONDARY（EMVCo 概述页为 PRIMARY）。
10. **PSD2 Art.97 逐字条款**：渲染截断未取回；其存在与"义务在 PSP"由 RTS 2018/389 Art.1 交叉引用确证，Art.97(1) 引文为 **SECONDARY**。
11. **Paddle 的 seller-of-record 性质与 DPA 角色**：买方条款称"purchase the Product from Paddle"（授权转售方），而 DPA 称 Paddle 为 processor——**以签约文本为准**；Lemon Squeezy 文档为客户端渲染，关键句经渲染读取（内容仍为其官方）。
12. **MoR 是否/如何承担消费者法下的退款与撤回权履行**：各服务商政策不同，未取得统一一手结论。
13. **MoR 是否替你缴纳居住国所得税**：**没有任何一家声明这样做**，属结构推断而非条文确认。
14. **FastSpring 的公开交易费率**：为 quote-based，未找到公开百分比。
15. **"税务居民身份"回传字段**：三家 MoR 文档均未承诺，只有 country/address。
16. **中国居民个人/企业的所得税与常设机构影响、PIPL Art.38 官方英文文本**：需本地专业人士；官方中文原文已核对。
17. **GDPR 条文引用**：均经 gdpr-info.eu（MIRROR）核对；ePrivacy Art.5(3) 经镜像渲染的 EUR-Lex 页核对。

---

## 参考资料 / Sources

**欧盟**
- European Commission — [VAT rates](https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en)（PRIMARY）
- European Commission — [The One Stop Shop](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop_en)（PRIMARY）
- European Commission — [Explanatory Notes on the new VAT e-commerce rules, revised 1 Jan 2027](https://vat-one-stop-shop.ec.europa.eu/document/download/774b31ca-03c6-4fb1-8209-9e447aeeb1e9_en?filename=Explanatory%20Notes_revised_1Jan2027_0.pdf) §3.2.7 / Table 5（PRIMARY PDF，逐字提取）
- European Commission — [OSS Guidelines, revised 1 Jan 2027](https://vat-one-stop-shop.ec.europa.eu/document/download/55f4ec9d-83e6-4942-9e8d-11d44c243087_en?filename=OSS%20Guidelines_revised_1Jan2027_0.pdf)（PRIMARY PDF）
- Directive 2006/112/EC — [EUR-Lex 32006L0112](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32006L0112)（**MIRROR** 核对）
- Directive 2011/83/EU（CRD）— [EUR-Lex 32011L0083](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083)（**MIRROR**：Art.6/9/10/16(m) 逐字核对）
- Directive (EU) 2019/770 — [EUR-Lex 32019L0770](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32019L0770)（**MIRROR**）
- Directive (EU) 2015/2366（PSD2）— [EUR-Lex 32015L2366](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32015L2366)（**MIRROR/SECONDARY**）
- Commission Delegated Regulation (EU) 2018/389（RTS）— [EUR-Lex 32018R0389](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018R0389)（**MIRROR**：Art.1/2 逐字核对）
- Commission / EBA — SCA 相关意见（[EC 2019 statement PDF](https://finance.ec.europa.eu/system/files/2019-06/190621-eba-opinion-strong-customer-authentication-statement_en.pdf)；[EBA-Op-2018-04](https://www.eba.europa.eu/sites/default/files/documents/10180/2137845/0f525dc7-0f97-4be7-9ad7-800723365b8e/Opinion%20on%20the%20implementation%20of%20the%20RTS%20on%20SCA%20and%20CSC%20(EBA-2018-Op-04).pdf)）
- Directive 2002/58/EC（ePrivacy）— EUR-Lex 02002L0058（**MIRROR**，Art.5(3)）

**英国**
- [GOV.UK — VAT rates](https://www.gov.uk/vat-rates)（PRIMARY）
- [HMRC — VATREG37200](https://www.gov.uk/hmrc-internal-manuals/vat-registration-manual/vatreg37200)（PRIMARY）
- [GOV.UK — VAT rules for supplies of digital services to consumers](https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers)（PRIMARY）
- [SI 2013/3134 reg.30](https://www.legislation.gov.uk/uksi/2013/3134/regulation/30) / [reg.37](https://www.legislation.gov.uk/uksi/2013/3134/regulation/37)（**MIRROR**，逐字核对）

**澳大利亚**
- [ATO — How Australian GST works](https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/gst-for-non-resident-businesses/how-australian-gst-works)（原始页 403；引文取自 **Wayback 存档页**，MIRROR）
- [A New Tax System (Goods and Services Tax) Act 1999](https://www.legislation.gov.au/C2004A00446/latest/text)（法条本体；本轮未逐条抓取）
- [Competition and Consumer Act 2010, Sch 2 (ACL)](https://www.legislation.gov.au/C2004A04426/latest/text)（UNVERIFIED）

**加拿大**
- [CRA — GST/HST for digital-economy businesses: Overview](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy.html)（PRIMARY）
- [CRA — Find out if you need to register](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/find-out-need-register.html)（PRIMARY，C$30,000）
- [CRA — Definitions under the digital-economy measures](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/digital-economy-definitions.html)（PRIMARY）
- [CRA — Charge and collect the GST/HST（13%/15%）](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html)（PRIMARY）
- [Excise Tax Act s.165（5% GST）](https://laws-lois.justice.gc.ca/eng/acts/E-15/section-165.html)（PRIMARY）

**美国**
- [South Dakota v. Wayfair, Inc., No. 17-494 (2018)](https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf)（PRIMARY）
- [SDCL 10-64-2](https://sdlegislature.gov/Statutes/10-64-2)（PRIMARY）
- [CDTFA — Wayfair use tax collection requirements](https://cdtfa.ca.gov/industry/wayfair/general-information.htm)（PRIMARY）
- [Federal Register 91 FR 6507 (2026-02-12) — Revision of the Negative Option Rule](https://www.govinfo.gov/content/pkg/FR-2026-02-12/html/2026-02866.htm)（PRIMARY）
- *Custom Commc'ns, Inc. v. FTC*, 142 F.4th 1060 (8th Cir. 2025)
- [Cal. Bus. & Prof. Code §17602](https://leginfo.legislature.ca.gov/faces/printCodeSectionWindow.xhtml?lawCode=BPC&article=9.&sectionNum=17602.&op_statues=2024&op_chapter=515&op_section=2)（PRIMARY）/[§17603](https://leginfo.legislature.ca.gov/faces/printCodeSectionWindow.xhtml?lawCode=BPC&article=9.&sectionNum=17603.)

**新加坡 / 新西兰**
- [IRAS — Overseas businesses supplying remote services and low-value goods](https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/gst-and-digital-economy/overseas-businesses)（PRIMARY，S$1M / S$100k）
- [IRAS — Current GST Rates](https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/basics-of-gst/current-gst-rates)（PRIMARY，9%）
- [IRD — Supplying remote services into New Zealand](https://www.ird.govt.nz/gst-on-remote-services)（PRIMARY，NZ$60,000 / 15%）

**MoR / 支付服务商**
- [Paddle — How Paddle works (developer docs)](https://developer.paddle.com/get-started/how-paddle-works.md) / [Buyer Terms](https://www.paddle.com/legal/buyer-terms) / [Supplier Terms](https://www.paddle.com/legal/terms) / [DPA](https://www.paddle.com/legal/data-processing-addendum) / [Data Sharing Addendum](https://www.paddle.com/legal/data-sharing-addendum)（PRIMARY）
- [FastSpring — Digital Retailer Services Terms](https://fastspring.com/terms-use/seller-terms-service/digital-retailer/) / [DPA](https://fastspring.com/terms-use/data-processing-agreement/) / [developer docs](https://developer.fastspring.com/docs/welcome-to-fastspring.md)（PRIMARY，seller of record 逐字）
- [Lemon Squeezy — Merchant of Record](https://docs.lemonsqueezy.com/help/payments/merchant-of-record) / [Sales Tax and VAT](https://docs.lemonsqueezy.com/help/payments/sales-tax-vat) / [DPA](https://www.lemonsqueezy.com/dpa) / [Stripe acquisition](https://www.lemonsqueezy.com/blog/stripe-acquires-lemon-squeezy)（PRIMARY）
- [PCI SSC — SAQ A](https://www.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A.pdf) / [SAQ A-EP](https://www.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A-EP.pdf) / [SAQ A 资格 FAQ 博文](https://blog.pcisecuritystandards.org/faq-clarifies-new-saq-a-eligibility-criteria-for-e-commerce-merchants)（PRIMARY）
- [EMVCo — 3-D Secure](https://www.emvco.com/emv-technologies/3-d-secure/)（PRIMARY）
- [Stripe — 3D Secure authentication flow](https://docs.stripe.com/payments/3d-secure/authentication-flow)（PRIMARY）

**隐私**
- [EDPB Guidelines 3/2018 on territorial scope](https://www.edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines_3_2018_territorial_scope_after_public_consultation_en_1.pdf)（PRIMARY）
- [ICO — International transfers](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/)（PRIMARY）
- [ICO — Guide to PECR: cookies](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)（PRIMARY）
- [Google — Consent management requirements for serving ads in the EEA, the UK, and Switzerland](https://support.google.com/adsense/answer/13554116)（PRIMARY）
- [Google — EU User Consent Policy](https://www.google.com/about/company/user-consent-policy.html)（PRIMARY）
- [Google Analytics — Consent mode](https://support.google.com/analytics/answer/9976101)（PRIMARY）
- gdpr-info.eu（**MIRROR**，GDPR 各条）
- 《中华人民共和国个人信息保护法》Art.38 — [NPC 官方中文](http://www.npc.gov.cn/npc/c2/c30834/202108/t20210820_313088.html)（PRIMARY，中文）




