# 同一套 Web 产品做不同国家：差异到底有多大？

> **文档类型**: 国际化 / 本地化可行性评估（决策级）
> **评估对象**: `tableview.dev`（美国房地产与借贷测算器）、`tools.tableview.dev`（Parquet / DuckDB-WASM）、`compress.tableview.dev`（FFmpeg-WASM）三站
> **评估问题**: 做同样的站点，不同国家的差异大吗？哪些是必须重建的，哪些只是配置？
> **日期**: 2026-09-20
> **方法**: 只采信一手来源（监管机构公告、成文法、官方文档、W3C/Unicode/IETF 规范、第一方 API 文档）。无法从一手来源核实的一律标注 **UNVERIFIED**；仅有二手聚合来源的标注 **SECONDARY**。
> **状态**: 已完成
> **检索诚实性说明**: EUR-Lex（`eur-lex.europa.eu`）与部分监管机构站点（FCA Handbook、legislation.gov.uk、ASIC PDF、CBUAE Rulebook）对自动化抓取返回 202/403 机器人挑战。对于这些来源，**条款原文经镜像或替代官方呈现方式逐字核对**（例如 GDPR Art. 3/7/13/27 的条文文本经 `gdpr-info.eu` 逐字验证），但正文引用的是**权威原始 URL**。凡原文未能逐字核对的，均已在第 10 节标注 UNVERIFIED。

---

## 1. 结论先行

一句话回答原问题：**差异很大，但差异不在"翻译"，而在"产品本身"。**

同一套"房贷计算器"在美国、英国、德国、日本不是同一个金融产品：固定利率期限、本金偿还方式、保险机制、税收处理、监管口径全都不同。一个美国 30 年期固定利率摊还计算器，**在多数国家没有对应物**。

**分层结论**（详细论证见第 9 节）：

| 层级 | 轴 | 判断 |
| :--- | :--- | :--- |
| **LARGE（必须重建内容/产品/合规）** | 产品与金融产品集（§3） | 各国产品集不重叠；US 专有产品（DSCR / hard money / 1031）在海外**没有类比物** |
| **LARGE** | 搜索需求与内容（§2） | 关键词宇宙由产品决定，产品不同则关键词不同 |
| **LARGE** | 中国大陆（§7） | 不是"配置"问题，是 ICP 备案 + Google 全栈不可用 + AdSense 结构性不可达 |
| **MEDIUM** | 合规负担（§4） | 纯广告站 = 加一层 CMP/consent（中等）；一旦出现"申请/比价/联盟链接"，触发英澳等地的金融推广牌照问题（升为 LARGE） |
| **MEDIUM** | 本地化机制（§6） | CLDR / BCP 47 / `Intl` 都是成熟规范，但本仓库**刻意把货币与数字钉死在 en-US**，需要参数化 |
| **MEDIUM** | SEO 管线（§2） | hreflang / URL 结构有明确官方规范，属机械工作，但本仓库当前 **0 处 hreflang** |
| **SMALL** | 变现可用性（§5） | 主要市场 AdSense 均可用；无国家级的"金融内容"禁令 |
| **SMALL** | 基础设施（§7，中国除外） | CDN 已是全球分布，HTTP/3/Brotli 全量可用 |

**单市场建议**：从美国优先的房产金融计算器出发，**最便宜的有意义扩张是加拿大**——前提是接受一个**法定的数学差异**（见 §3 加拿大条目与 §9.3）。最像陷阱的是**英国**（英文但产品完全不同）和**印度**（英文但税制层完全不同且单位经济更差）。

---

## 2. 搜索需求与 SEO 差异

### 2.1 Google 官方对多语言/多地区站点的规定（Large 差异，但工作可机械执行）

Google 在 Search Central 给出了完整规范，核心点：

- **hreflang 必须双向自引用**：每个语言版本都要列出自己和所有其他版本；两个页面互不指回时"tags will be ignored"。三种等价实现（HTML `<link>`、HTTP `Link:` header、sitemap），URL 必须完全限定（含 https）。[Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions)
- **语言码规则**：第一段必须是 ISO 639-1 语言码，第二段可选 ISO 3166-1 Alpha 2 地区码。**不能只写国家码**（`be` 是白俄罗斯语而非比利时）；**`es-419` 不被支持**；简繁中文用 ISO 15924 写 `zh-Hans` / `zh-Hant`。[同上](https://developers.google.com/search/docs/specialty/international/localized-versions)
- **`x-default`** 用于未匹配任何语言的兜底，推荐用在语言选择页/自动重定向首页。[同上](https://developers.google.com/search/docs/specialty/international/localized-versions)
- **Google 不用 hreflang 或 HTML `lang` 判断页面语言**，而是用可见内容的算法判断。[同上](https://developers.google.com/search/docs/specialty/international/localized-versions)
- **关键激励条款**："Localized versions of a page are only considered duplicates **if the main content of the page remains untranslated.**" —— 也就是说，**正文真正翻译过之后，各语言版本不构成重复内容**，可以各自独立排名。[同上](https://developers.google.com/search/docs/specialty/international/localized-versions)

### 2.2 URL 结构：Google 自己列出的取舍

| 结构 | 优势（Google 原文） | 劣势（Google 原文） |
| :--- | :--- | :--- |
| ccTLD `example.de` | 地理定位清晰；服务器位置无关；站点易隔离 | 昂贵（可得性有限）；需要更多基础设施；ccTLD 申请有时有严格限制；**只能定位单一国家** |
| 子域 `de.example.com` | 易搭建；可用不同服务器位置；站点易隔离 | 用户可能无法从 URL 看出地理定位 |
| 子目录 `example.com/de/` | 易搭建；维护成本低（同一主机） | 用户可能无法从 URL 看出地理定位；服务器位置单一；站点隔离更难 |
| URL 参数 `site.com?loc=de` | — | Google 明确标注 **"Not recommended."** |

来源：[Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### 2.3 地理定位信号与反模式

Google 依赖的信号：ccTLD（强信号）、hreflang、服务器 IP 位置（**在 CDN 下不是决定性信号**）、以及本地地址/电话/货币/本地语言等。Google 明确说明它**忽略** `geo.position`、`distribution` 等地理 meta 标签，且**不要用 IP 分析**来适配内容。[Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

对 locale-adaptive（按 IP 或 `Accept-Language` 返回不同内容）的页面，Google 警告"might not crawl, index, or rank all your content for different locales"，因为 **Googlebot 默认 IP 位于美国且请求不带 `Accept-Language`**；官方建议改用独立的 locale URL + hreflang。[How Google crawls locale-adaptive pages](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)

另外，Google 建议**不要**在语言版本之间自动重定向（"don't redirect based on what you think the user's language may be"），而应提供可见的语言链接。[Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

### 2.4 本仓库现状（代码事实，非外部来源）

我用 grep 核实了当前状态：

- **全仓库 `hreflang` 命中数为 0**，`x-default` 命中数为 0。
- 三个 app 的入口 HTML 均为单语硬编码：`apps/finance/index.html` 为 `<html lang="en" class="light">`，`apps/tools/index.html` 与 `apps/compressor/index.html` 为 `<html lang="en" class="dark">`。
- sitemap 由 `apps/finance/scripts/prerender.ts` 生成单一语言版本，无 hreflang 注解。

即：**SEO 国际化的管线尚未开始**，但 §2.1–2.3 的规范是明确且可机械执行的，这部分本身不构成"产品难题"。

### 2.5 搜索需求本身是国别化的（Large）

关键词宇宙由金融产品决定。`dscr loan calculator`、`30-year fixed`、`1031 exchange`、`hard money`、`PMI` 是**美国制度性概念**；英国用户搜的是 `stamp duty calculator`、`remortgage calculator`、`early repayment charge`；德国是 `Annuitätendarlehen`、`Bausparen`、`Zinsbindung`；日本是 `住宅ローン シミュレーション`、`変動金利`、`団信`；印度是 `home loan EMI calculator`、`home loan tax benefit`、`CIBIL score`。

因此"把 en-US 关键词翻成目标语言"在结构上是无效的：**产品不同 → 关键词不同 → 内容页要重写，而不是翻译**。

> **UNVERIFIED**：各国具体月搜索量我无法从一手来源核实。Google Ads Keyword Planner 需登录且其数据不公开发布为可引用的一手文档；任何国家级别的搜索量/CPC 数字都应视为 **SECONDARY 估算**。

---

## 3. 产品与金融产品集：这是最大的差异轴（Large）

这是本次调研唯一一个"无论怎么优化都绕不过去"的轴。各国房贷不是同一个产品，甚至不是同一种**数学**。

### 3.1 分市场对照

| 市场 | 利率/产品结构 | 与美国不重叠的关键机制 | 一手来源 |
| :--- | :--- | :--- | :--- |
| **美国** | 30/15 年**固定**利率为常态 | PMI 在 LTV 降至 80% 时**法定自动终止**；HPML 首贷必须设 escrow；points & fees 定义；TRID 三日规则；ATR/QM；1031 交换 45/180 天 | [12 U.S.C. ch. 49 (HPA)](https://www.govinfo.gov/content/pkg/USCODE-2023-title12/html/USCODE-2023-title12-chap49.htm)、[12 CFR §1026.35](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-35.xml)、[12 CFR §1026.32](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-32.xml)、[12 CFR §1026.19](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-19.xml)、[12 CFR §1026.43](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-43.xml)、[IRS §1031](https://www.irs.gov/newsroom/like-kind-exchanges-under-irc-code-section-1031) |
| **英国** | **没有 30 年固定利率的常态**，短期固定为主 | SDLT 印花税分段（0/2/5/10/12%）+ 二套房加 5%；非居民再加 2%；leasehold vs freehold；remortgage；ERC 提前还款费 | [HMRC SDLT 住宅税率](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates)、[HMRC 非居民税率](https://www.gov.uk/guidance/rates-of-stamp-duty-land-tax-for-non-uk-residents)、[Leasehold toolkit, MHCLG](https://www.gov.uk/government/publications/leasehold-toolkit/leasehold-toolkit-england)、[Bank of England FSR Dec 2023](https://www.bankofengland.co.uk/financial-stability-report/2023/december-2023) |
| **加拿大** | fixed vs variable；**法定半年复利** | 联邦压力测试 = max(合同利率+2%, 5.25%)；受保贷款摊销上限基准 25 年；CMHC 高比率保险 | [OSFI B-20 infosheet](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/infosheet-residential-mortgage-underwriting-practices-procedures-guideline-b-20)、[CMHC Home Start](https://www.cmhc-schl.gc.ca/media-newsroom/news-releases/2024/cmhc-home-start-helps-canadians-buy-their-first-homes)、[Interest Act, R.S.C. 1985, c. I-15, s. 6](https://laws-lois.justice.gc.ca/eng/acts/I-15/section-6.html) |
| **澳大利亚** | 浮动 + 短期固定为主 | **offset account**；LMI；**印花税由州决定**（非联邦）；负责任借贷义务 | [ASIC RG 209 / 信贷义务](https://www.asic.gov.au/regulatory-resources/credit/credit-general-conduct-obligations/faqs-complying-with-your-credit-obligations)、[Revenue NSW 转让税](https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty)、[SRO Victoria 土地转让税](https://www.sro.vic.gov.au/about-us/rates-and-statistics/current-rates/land-transfer-duty-principal-place-residence-current-rates)、[APRA APG 223](https://www.apra.gov.au/sites/default/files/2022-06/Final%20Prudential%20Practice%20Guide%20APG%20223%20Residential%20Mortgage%20Lending.pdf) |
| **德国** | **年金贷款（Annuitätendarlehen）vs 等额本金（Tilgungsdarlehen）**；`Zinsbindung` 固定 5/10/15 年 | **Bausparen**（合同期内利率全期固定）；提前还款通常有罚金；Grunderwerbsteuer 州级 + GNotKG 公证费 | [BaFin 房地产贷款](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/immobilienkredit/immobilienkredit_node_en.html)、[BaFin Bausparen](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/bausparen/bausparen_en.html)、[GNotKG §122](https://www.gesetze-im-internet.de/gnotkg/__122.html) |
| **荷兰** | annuitair / lineair / aflossingsvrij | **NHG 国家担保**，上限随年份调整；房贷利息扣除（hypotheekrenteaftrek）与偿还方式绑定 | [NHG 2026 上限](https://www.nhg.nl/faq/product-en-proces/wat-is-de-nhg-grens-in-2026/)、[Belastingdienst 年金 vs 直线](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/annuitair-lineair-aflossen) |
| **日本** | 変動金利 vs 固定金利 | **フラット35**（最长 35 年全期固定，住宅金融支援機構 JHF）；**団信**（团体信用寿险）；フラット35 不能用于投资用房 | [フラット３５ 官方](https://www.flat35.com/)、[金融庁 FRT Council DP2025-7](https://www.fsa.go.jp/frtc/seika/discussion/2025/DP2025-7.pdf) |
| **印度** | EMI；fixed / floating | 房贷利息扣除 Sec 24(b)；本金在 Sec 80C；CIBIL 评分体系；RBI 对浮动利率重置有专门规定 | [RBI 浮动利率重置通知](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529)、[印度所得税局各类扣除](https://www.incometaxindia.gov.in/w/various-deductions-under-the-income-tax-act) |
| **新加坡** | 银行贷款，受 TDSR/LTV 约束 | **TDSR**（总偿债率）与 **LTV** 由 MAS 两份 Notice 规定 | [MAS Notice 645](https://www.mas.gov.sg/regulation/notices/notice-645)、[MAS Notice 632](https://www.mas.gov.sg/regulation/notices/notice-632) |
| **香港** | 银行按揭，受 LTV/DSR 约束 | 2024-10-16 起住宅 **一律 70% LTV**；资产基础审批 60%→70%；非自用 DSR 40%→50% | [HKMA 2024-10-16 新闻稿](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2024/10/20241016-4/) |
| **海湾 / UAE** | 外籍 vs 本国人 | LTV、期限、年龄上限由央行按揭条例规定（Circular 31/2013） | [CBUAE Rulebook 按揭条例](https://rulebook.centralbank.ae/en/rulebook/regulations-regarding-mortgage-loans) |

### 3.2 两个结构性洞察

**洞察一：美国产品集是"规则定义"的，多数其他国家是"利率结构定义"的。**
美国：30/15 固定 + HPA + escrow + TRID + 1031，每一项都有成文法/监管文本支撑。
英国/德国/日本：差异首先体现在"利率固定多久、本金怎么还"，而不是"哪种法定披露"。

**洞察二：房产交易税在多数国家是州/省/地方层，而非联邦层。**
英国 SDLT 是国家级但分段复杂；澳洲印花税**完全由州决定**；德国 Grunderwerbsteuer 由州决定；加拿大有省级土地转让税。美国模式（联邦层无交易税）在海外没有对应结构。

### 3.3 具体到 TableView 的资产盘点

| 现有计算器 | 可迁移性 | 说明 |
| :--- | :--- | :--- |
| Mortgage Payment & Amortization | **部分** | 摊还数学通用，但复利约定、保险、税费层必须参数化（加拿大为例：半年复利） |
| Refinance Break-Even | **部分** | "break-even" 概念通用，但英国叫 remortgage 且有 ERC |
| DSCR Rental Loan | **不可迁移** | 美国非 QM 制度的产物；海外无对应产品 |
| Hard Money / Fix-and-Flip | **不可迁移** | 美国州牌照私人借贷；海外无对应产品 |
| 1031 Exchange | **不可迁移** | 美国税法专有（IRC §1031） |
| Commercial Loan + Balloon | **部分** | 气球贷概念通用，但期限结构与 DSCR 基准各国不同 |
| Cap Rate | **部分** | NOI/Cap Rate 是投资者语言，但税与费用层不同 |
| Loan Comparison | **部分** | 依赖各国披露口径（美国 TIP 等） |
| Salary-to-Hourly | **部分** | FLSA 加班规则是美国的；各国工时/加班法不同 |

结论：**约 40% 的资产在海外没有对应产品**，这部分要么放弃，要么保留为美国英文页（不分国家版本）。

---

## 4. 法律与合规负担

### 4.1 数据保护：一个纯客户端工具到底欠什么？

**关键结论**：**"计算不出浏览器"这一点在合规上确实是真实优势，但它只覆盖计算器本身，不覆盖 AdSense/Analytics。**

- **GDPR 属地范围**（Art. 3(2)）：适用于"向欧盟境内数据主体提供商品或服务（**无论是否要求付款**）"，或"监控其在欧盟境内的行为"的非欧盟控制者。原文："the offering of goods or services, irrespective of whether a payment of the data subject is required, to such data subjects in the Union; or the monitoring of their behaviour as far as their behaviour takes place within the Union." [Regulation (EU) 2016/679, Art. 3](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
  → **一个只面向美国访客、不针对也不画像欧盟用户的工具，落在 Art. 3(2) 之外。**
- **纯客户端、不设 cookie、不外传**：不处理个人数据，因此 Art. 4(11)/Art. 7 的同意、Art. 13/14 的通知义务都**没有触发条件**。
- **但 AdSense / Google Analytics 会设置 cookie / 设备标识符**，而 ePrivacy Directive 2002/58/EC Art. 5(3) 独立地要求：向用户终端设备存储信息或访问已存储信息，需**事先同意**。[Directive 2002/58/EC, Art. 5(3)](https://eur-lex.europa.eu/eli/dir/2002/58/oj)
- **同意的有效性**：必须自由给出、具体、知情、明确（opt-in，不能预勾选）。[GDPR, Art. 7](https://eur-lex.europa.eu/eli/reg/2016/679/oj)；[EDPB Guidelines 05/2020 on consent](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en)
- **Art. 27 欧盟代表**：Art. 3(2) 适用时，控制者须书面指定欧盟代表；豁免条件为"偶发、不含大规模特殊类别数据、且不太可能对自然人权利自由造成风险"。原文："Where Article 3(2) applies, the controller or the processor shall designate in writing a representative in the Union." 及豁免："processing which is occasional, does not include, on a large scale, processing of special categories of data... and is unlikely to result in a risk to the rights and freedoms of natural persons"。**规模化投放广告 cookie 的流量不属于"偶发"**。[GDPR, Art. 27](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- **Art. 28 数据处理协议（DPA）**：与任何处理者（如 Google）之间需要。[GDPR, Art. 28](https://eur-lex.europa.eu/eli/reg/2016/679/oj)

### 4.2 Google 的合同性要求（比法律更容易触发的约束）

- **Google EU user consent policy**：要求向 EEA/英国/瑞士用户披露并取得同意，覆盖 cookie/本地存储以及广告个性化所需的数据收集、共享与使用。这是**合同义务**，不遵守会导致 AdSense 停用。[Set up and manage your Consent Management Platform (CMP)](https://support.google.com/adsense/answer/7670013)（该页面明确引述"Google's updated EU user consent policy"并列出 ePrivacy Directive 与 GDPR 作为其反映的法规）。
- **认证 CMP 是硬性要求**：原文："partners using our publisher products—Google AdSense, Ad Manager, or AdMob—**are required to use a consent management platform (CMP) that has been certified by Google** and integrates with the IAB's Transparency and Consent Framework (TCF) when serving personalized ads to users in the following regions: **EEA and UK: As of 16 January 2024**... **Switzerland: As of 31 July 2024**"。并且："Only traffic from a certified CMP is eligible for personalized ads." [Google consent management requirements (for publishers)](https://support.google.com/adsense/answer/13554116)

→ **这是"进入欧洲市场"的最高确定性成本**：不是翻译页面，而是接入一个认证 CMP 并维护 TCF 信号。

### 4.3 美国州隐私法：单人站点大概率不在范围内

CCPA/CPRA 的适用门槛（CPI 调整后，自 2025-01-01 生效）：年毛收入 **≥ $26.625M**；或买入/卖出/共享 **≥100,000** 加州消费者/家庭的个人信息；或 ≥50% 年收入来自出售/共享个人信息。[CPPA FAQ — "Who must comply with the CCPA?"](https://cppa.ca.gov/faq.html)

→ **低于门槛的独立站点不是 CCPA 意义上的 "business"**，不承担通知与 opt-out 义务。若达标，第三方广告 cookie 会被认定为"sharing... for cross-context behavioral advertising"，触发 opt-out 权。[同上](https://cppa.ca.gov/faq.html)

Virginia CDPA 门槛为 ≥100,000 消费者/年，或 ≥25,000 且 >50% 收入来自出售 PI。[Code of Virginia §59.1-576](https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-576/)

### 4.4 金融推广 / 投资建议：这条线才是真正的分水岭

这是整个合规评估里**最重要的发现**：一个纯教育性计算器通常不构成受监管的"建议"；**但加上"比价 / 申请 / 联盟出站链接"就可能变成"金融推广"**。

| 法域 | 规则 | 对本站的含义 |
| :--- | :--- | :--- |
| **英国** | FSMA 2000 s.21：未经授权/豁免，禁止在业务过程中发出"invitation or inducement to engage in investment activity"（金融推广限制）。[FSMA 2000, s.21](https://www.legislation.gov.uk/ukpga/2000/8/section/21)。FCA FG24/1 规定推广的合规要求。[FCA FG24/1](https://www.fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media)；边界指引见 [FCA Handbook PERG 8](https://handbook.fca.org.uk/handbook/PERG/8/) | 中性的计算器**不是**诱导；一旦页面出现 "Apply now" 或指向放贷方的联盟链接，性质可能改变 |
| **欧盟/英国** | "建议"要求**个性化推荐**（personal recommendation）。[MiFID II Dir. 2014/65/EU, Art. 4(1)(4)](https://eur-lex.europa.eu/eli/dir/2014/65/oj) | 通用计算与结果展示本身不构成 advice |
| **澳大利亚** | Corporations Act 2001 s.766B 将 "financial product advice" 定义为意图影响金融产品决策的**推荐或意见**。[Corporations Act 2001, s.766B](https://www.legislation.gov.au/C2004A00818/latest/text)；牌照指引 ASIC RG 36，数字建议见 RG 255 | 通用计算器不属于个性化建议，但涉及"推荐产品"的服务需要 AFSL |
| **美国** | RESPA §8 / Regulation X 12 CFR §1024.14：禁止为结算服务的**推介**支付/收受"thing of value"。原文："No person shall give and no person shall accept any fee, kickback or other thing of value pursuant to any agreement or understanding... that business incident to or part of a settlement service involving a federally related mortgage loan shall be referred to any person." [12 CFR §1024.14](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol8/xml/CFR-2024-title12-vol8-sec1024-14.xml) | 不推介任何人的计算器不构成 arrangement；一旦做 lead-gen 就进入监管射程 |

> **UNVERIFIED**：我没有找到任何监管机构**专门针对"金融计算器"**发布的指引（CFPB、FCA、ASIC 均无）。上述结论是从推广/建议的通用定义推导的，不是监管机构的直接表态。

### 4.5 广告披露与消费者保护

- **美国**：FTC Act §5 禁止欺骗性行为；FTC 的 `.com Disclosures` 指引要求披露"clear and conspicuous"、位置邻近、不可藏在链接后。[15 U.S.C. §45](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap2-subchapI-sec45.htm)；[FTC .com Disclosures](https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising)
- **原生广告**：付费内容必须以广告形式可识别，除非其商业性质一目了然。[FTC Native Advertising: A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)
- **联盟披露**：未披露的实质性关联（联盟链接、有偿评价）构成欺骗。16 CFR Part 255。[FTC Endorsement Guides](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255)
- **欧盟**：Unfair Commercial Practices Directive 2005/29/EC 要求商业意图可识别（禁止 advertorial）。[Directive 2005/29/EC](https://eur-lex.europa.eu/eli/dir/2005/29/oj)

### 4.6 税务/法律免责声明

> **UNVERIFIED**：**没有找到任何一手来源**要求通用金融计算器必须展示免责声明。唯一找到的强制性警示制度是产品特定的（如 FCA 对主流投资推广的风险警示：[FCA risk warnings](https://www.fca.org.uk/firms/risk-warnings-mainstream-investments)）。保留"仅供教育、非投资建议"的声明是风险管理，不是法定合规。

---

## 5. 变现（AdSense / Ad Manager）

### 5.1 官方国家级差异

| 维度 | 官方事实 | 来源 |
| :--- | :--- | :--- |
| 可用国家 | Google 发布**正面清单**（Region → Country/territory），美/英/加/澳/德/法/印/日全部在列 | [AdSense availability](https://support.google.com/adsense/answer/13402307) |
| 制裁地区不可用 | 明确排除 Crimea、Cuba、所谓 DNR/LNR、Iran、North Korea 等（依 OFAC 制裁），"no grace periods or exceptions" | [Understanding AdSense country restrictions](https://support.google.com/adsense/answer/6167308) |
| 未列入正面清单 | **Russia 与 Belarus 不在正面可用清单中**（我对页面文本做了逐项核对） | [AdSense availability](https://support.google.com/adsense/answer/13402307) |
| 金融内容是否被禁 | **Publisher Policies 没有"金融服务/信贷"这一禁止类别**；Restrictions 中也没有金融/贷款类别，唯一的"金钱类"是 Online gambling | [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938)、[Google Publisher Restrictions](https://support.google.com/publisherpolicies/topic/10402539) |
| 个性化广告定向限制 | **美国与加拿大**：信贷、银行产品与服务、部分理财服务的广告不得按性别、年龄、育儿状态、婚姻状态、**邮编**定向 | [Restricted targeting in Personalized advertising](https://support.google.com/adspolicy/answer/143465) |
| 发布商门槛 | 年满 18；须拥有内容并具备 HTML 访问权限；一个发布商一个账户 | [Eligibility requirements for AdSense](https://support.google.com/adsense/answer/9724) |
| 付款门槛 | 按**报告货币**而非国家：USD $100、GBP £60、EUR €70、JPY ¥8,000、AUD A$100、CAD C$100 | [Payment thresholds](https://support.google.com/adsense/answer/1709871) |
| Ad Manager | "for large publishers who have significant direct sales"，且需已有 AdSense 账户 → **不是单人发布商的路径** | [Sign up for Ad Manager](https://support.google.com/admanager/answer/7084151) |

### 5.2 关键区分：广告主政策 ≠ 发布商政策

Google 对金融的限制主要落在**广告主侧**（Google Ads），不是发布商侧：

- Google Ads "Financial products and services" 定义金融产品为"related to the management or investment of money and cryptocurrencies, **including personalized advice**"，并要求广告主遵守其目标地区的法律、包含当地要求的披露。[Financial products and services](https://support.google.com/adspolicy/answer/2464998)
- 该页还包含**按国家滚动的金融广告主验证要求**（如 UK、Australia 等已实施验证）。[同上](https://support.google.com/adspolicy/answer/2464998)

**推论（标记为推论）**：广告主验证在某些国家已经落地，意味着这些市场上你的金融页面库存来自**已核验的金融广告主**，理论上广告质量更高。但——

> **UNVERIFIED（重要）**：Google 官方文档中**不存在任何国家级 RPM / CPM 数据表**。任何"某国 RPM 是多少"的数字都只能来自二手聚合估算，本文**不采用**，并建议不要基于此类数字做决策。

---

## 6. 本地化机制：货币、数字、日期、单位、方向

### 6.1 规范基础（Small，但本仓库需要一次重构）

- **CLDR UTS #35 Part 3 (Numbers)** 定义了本地化的 `decimal`（小数点）与 `group`（分组符）符号，并明确规定分组大小**不是全局统一的**：原文提到"commonly used for thousands (grouping size 3, e.g. \"100,000,000\") or in some locales, **ten-thousands (grouping size 4**, e.g. \"1,0000,0000\")"，并存在 secondary grouping size，例如 `12,34,56,789`。[Unicode LDML Part 3: Numbers](https://unicode.org/reports/tr35/tr35-numbers.html)
  → 这直接命中了印度/南亚的 lakh–crore 分组。
- **ECMA-402 (ECMAScript Internationalization API)** 规定 `Intl.NumberFormat`、`Intl.DateTimeFormat`、货币代码（ISO 4217）、时区、测量单位标识符与 locale negotiation。[ECMA-402](https://tc39.es/ecma402/)
- **语言标签**由 BCP 47 定义，最新为 RFC 5646，子标签来自 IANA Language Subtag Registry。[W3C — Language tags in HTML and XML](https://www.w3.org/International/articles/language-tags/)；[BCP 47 (RFC Editor)](https://www.rfc-editor.org/info/bcp47)
  W3C 的"黄金法则"是**标签尽可能短**：用 `ja` 而不是 `ja-JP`，除非确有区分必要。[同上](https://www.w3.org/International/articles/language-tags/)
- **HTML 语言声明**：始终在 `<html>` 上使用 `lang`；**不要**用 `meta http-equiv="Content-Language"`；涉及双向文本（阿拉伯语、希伯来语）时还要用 `dir` 属性。[W3C — Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations)
- **浏览器支持**：`Intl.NumberFormat` 与 `Intl.DateTimeFormat` 均为 MDN 的 **Baseline: Widely available**，"available across browsers **since September 2017**" → 现代浏览器**不需要 polyfill**。[Intl.NumberFormat (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

### 6.2 本仓库的具体缺陷类别（代码事实）

这个仓库**已经踩过** locale 相关的数字格式化坑，而且处理方式本身就是国际化障碍：

- `packages/shared/src/format.ts` 的注释明确写明了 bug 类别："bare `Number.prototype.toLocaleString()` formats with the *browser's* locale, so `1234.5` renders as \"1,234.5\" in en-US and \"1.234,5\" in de-DE... For a lending suite that is a **correctness bug, not a cosmetic one**."
- 但该模块的应对方式是**把 locale 与货币硬钉死**：`USD_WHOLE`、`USD_CENTS`、`DECIMAL` 三个模块级 `Intl.NumberFormat` 全部固定为 `'en-US'` + `'USD'`，并声明目标是"the same input produces byte-identical output on every machine"。
- `apps/finance/src/lib/__tests__/localeFormatting.test.ts` 用四个测试守卫这个策略：禁止裸 `toLocaleString()`、禁止非 `en-US` 的 locale 参数、禁止 `toLocaleString(undefined, ...)`、要求 `Intl` 构造器显式传 locale。

→ **含义**：要做多币种/多语言，不是"加一个语言包"，而是要把这套**刻意的确定性钉死**改造成**locale 参数化的确定性**（即"格式化必须显式传入目标 locale"，而不是"必须传入 en-US"）。测试守卫的第 2 条（`toLocaleString(\s*'(?!en-US)`）第一条就要改。这是中等规模但有明确边界的工作。

其它需要参数化但同样明确的项：
- **单位**：sq ft vs m² —— ECMA-402 定义了 sanctioned single unit identifiers。[ECMA-402 §6.6](https://tc39.es/ecma402/)
- **货币舍入**：JPY 无小数位、INR 有 lakh/crore 分组，不是换符号那么简单。[CLDR Part 3](https://unicode.org/reports/tr35/tr35-numbers.html)
- **RTL**：若做阿拉伯语（UAE 市场），需要 `dir`。[W3C](https://www.w3.org/International/questions/qa-html-language-declarations)

---

## 7. 基础设施与性能

### 7.1 全球分发：已基本解决（Small）

- Cloudflare 自述网络规模：**348 cities · 8 regions**，"250 ms To 95% of the world's Internet users"，并称"One of the world's largest networks — running every service in every data center"。[Cloudflare Global Network](https://www.cloudflare.com/network/)
- Anycast 的定义："a routing method where the **same IP address is announced from data centers worldwide**, so each visitor's request is routed to a nearby data center."[Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- **HTTP/3 (QUIC) 对所有 plan 可用**。[HTTP/3 (with QUIC)](https://developers.cloudflare.com/speed/optimization/protocol/http3/)
- 压缩支持 Gzip / **Brotli** / Zstandard。[Content compression](https://developers.cloudflare.com/speed/optimization/content/brotli/)
- Cloudflare Pages："instantly deployed to the Cloudflare global network"，所有 plan 可用。[Cloudflare Pages overview](https://developers.cloudflare.com/pages/)

→ 对于欧洲、北美、澳新、日韩、东南亚、印度的普通访客，**基础设施不是差异源**。

### 7.2 中国大陆：这不是优化问题（Large，且基本封闭）

- 普通全球网络**不覆盖中国大陆**：原文"Delivering content quickly and securely to users in Mainland China requires infrastructure within China itself"，由 JD Cloud 运营的数据中心提供。[Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- China Network 是**Enterprise plan 的独立订阅**，要求：**每个 apex domain 持有有效的 ICP 备案/许可**、在页脚展示 ICP 号、JD Cloud 内容审核、强制 IPv6。[Get started · Cloudflare China Network](https://developers.cloudflare.com/china-network/get-started/)
- Cloudflare 明确说明监管环境："All the content inside of Mainland China is monitored by local authorities and must comply with local regulations."[Cloudflare China Network](https://developers.cloudflare.com/china-network/)

→ **结论：中国大陆对一个 AdSense + Google Analytics 驱动的站点是结构性不可达市场**（备案主体资格 + Google 广告栈 + Enterprise 门槛），不是一个"加个 CDN"就能解决的问题。

### 7.3 Google 服务在中国大陆：无法从一手来源证实

> **UNVERIFIED / SECONDARY**：我**没有找到任何 Google 第一方文档**声明 Google Analytics、Google Tag Manager 或 Google Fonts 在中国大陆被封。该封锁由防火长城执行，而防火长城本身没有官方文档。最接近的一手来源是 Google 透明度报告 FAQ，其中提到用户可能因"network outages to **government-mandated blocks**"而无法访问产品，并以 "YouTube in China" 作为使"the vast majority of people in a region"受影响的例子。[Google product traffic disruptions FAQs](https://support.google.com/transparencyreport/answer/7381506)

实践含义（作为推论，而非已证事实）：依赖 Google Fonts / GTM / GA / AdSense 的架构无法为中国大陆访客提供可用体验；若目标是该市场，正确做法是**自托管字体 + 非 Google 分析**，而不是修补 i18n。

---

## 8. 竞争格局：各国在位者不同

分类依据各公司自身站点文案（第一方）。**未引用任何市场份额数字**（无一手来源）。

| 市场 | 在位者 | 性质 |
| :--- | :--- | :--- |
| **美国** | Bankrate、LendingTree、NerdWallet、Zillow、Rocket Mortgage | 比价门户 / lead-gen / 银行系直贷 |
| **英国** | MoneySuperMarket、money.co.uk、MoneySavingExpert、Compare the Market | 比价门户 / lead-gen（其中多个同属 MONY Group） |
| **加拿大** | Ratehub.ca、WOWA.ca、rates.ca | 比价门户 + 自有经纪（lead-gen） |
| **澳大利亚** | Canstar、Finder、（RateCity 已 301 至 Canstar）、CommBank | 评级/比价门户 / 银行系 |
| **德国** | CHECK24、Interhyp、Verivox | 比价门户 / 房贷经纪 |
| **法国** | Meilleurtaux、Empruntis、Pretto | 房贷经纪（courtier）/ lead-gen |
| **印度** | BankBazaar、Paisabazaar、HDFC Bank | lead-gen 平台 / 银行系 |
| **日本** | 価格.com 住宅ローン、モゲチェック、フラット３５（JHF）、オリコン | 比价门户 / 经纪 / 公的机构 |

来源示例（各公司自身站点）：[Bankrate](https://www.bankrate.com/)、[LendingTree](https://www.lendingtree.com/)、[MONY Group 品牌页](https://www.monygroup.com/about-us/our-brands/)、[Ratehub.ca](https://www.ratehub.ca/)、[Canstar](https://www.canstar.com.au/)、[CHECK24](https://www.check24.de/)、[Meilleurtaux](https://www.meilleurtaux.com/)、[BankBazaar](https://www.bankbazaar.com/)、[価格.com 住宅ローン](https://kakaku.com/housing-loan/)、[フラット３５](https://www.flat35.com/)

**观察**：几乎所有市场的在位者都是 **lead-gen / 比价门户或银行系**，普遍以导流为商业模式。TableView 的"零追踪、全客户端、不做 lead capture"定位在各国都是差异化点——但这也意味着**它不参与这些市场的主要变现路径**，只能靠展示广告。

---

## 9. 排序结论与建议

### 9.1 分层排序

**LARGE（必须重建内容 / 产品 / 合规）**

1. **产品与金融产品集（§3）** —— 决定性轴。美国 30 年固定利率 + PMI + DSCR + hard money + 1031 的整套组合在海外**没有对应物**。约 40% 的现有计算器不可迁移（§3.3）。
2. **搜索需求与内容（§2.5）** —— 关键词由产品决定；产品不同则内容必须重写而非翻译。Google 官方明确"正文翻译后不算重复内容"，这奖励的是**真翻译**，惩罚的是**机翻模板**。
3. **中国大陆（§7.2）** —— ICP 备案 + Enterprise 独立订阅 + Google 全栈不可用，属结构性排除。

**MEDIUM（配置 + 本地化 + 工程）**

4. **合规（§4）** —— 当前"纯广告、无联盟"的形态下，欧洲成本 = 认证 CMP + consent + 隐私政策 + 大概率需要 Art. 27 代表。**一旦转向"比价/申请/联盟"，英国 §21 与澳洲 s.766B 会把它推成 LARGE。**
5. **本地化机制（§6）** —— CLDR/BCP 47/ECMA-402 都是成熟规范，`Intl` 自 2017 年起广泛可用。但要改造本仓库刻意钉死 en-US/USD 的确定性与测试守卫。
6. **SEO 管线（§2.1–2.3）** —— 规范清晰、工作机械，但当前 0 处 hreflang，需从零建立。

**SMALL（i18n 管线基本解决）**

7. **变现可用性（§5）** —— 主要市场 AdSense 全可用；发布商政策无金融禁类。
8. **基础设施（§7.1，中国除外）** —— 全球 CDN、HTTP/3、Brotli 已就绪。

### 9.2 决策原则

**不要问"翻译成本是多少"，要问"哪些计算器在目标国存在对应产品"。** 前者是 Small/Medium，后者是 Large。TableView 的具体形态（美国房产+借贷+投资测算）使这个问题特别尖锐，因为它的**差异化资产（DSCR、hard money、1031）恰好也是最不可迁移的资产**。

### 9.3 单市场建议

**推荐：加拿大（Canada）**

理由：
1. **语言与关键词几乎零成本**：英文为主（魁北克除外），`mortgage calculator`、`refinance`、`amortization` 等词高度重叠。
2. **边际计算器是现有计算的变体**，而非新品类：压力测试资格（max(合同+2%, 5.25%)，[OSFI B-20 infosheet](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/infosheet-residential-mortgage-underwriting-practices-procedures-guideline-b-20)）、CMHC 保险、摊销上限（基准 25 年，[CMHC Home Start](https://www.cmhc-schl.gc.ca/media-newsroom/news-releases/2024/cmhc-home-start-helps-canadians-buy-their-first-homes)）。
3. **变现与基础设施零变更**：AdSense/GA 在加拿大完全可用（[AdSense availability](https://support.google.com/adsense/answer/13402307)），CDN 已覆盖。
4. **无新增同意制度**：不在 EEA/UK/瑞士，因此**不触发认证 CMP 要求**。

**但必须承认一个非平凡的代价**：加拿大按揭的复利约定与美国不同。Interest Act 对设押不动产规定利率须"calculated **yearly or half-yearly, not in advance**"（原文：`unless the mortgage or hypothec contains a statement showing the amount of the principal money and the rate of interest chargeable on that money, calculated yearly or half-yearly, not in advance`）。[Interest Act, R.S.C. 1985, c. I-15, s. 6](https://laws-lois.justice.gc.ca/eng/acts/I-15/section-6.html)
→ 这意味着**摊还数学本身必须参数化**（半年复利而非月复利），不是换个符号。**这是"最容易"的市场里仍需动到核心引擎的部分。**

**陷阱市场（英文看着像、产品其实不同）**

| 市场 | 为什么是陷阱 |
| :--- | :--- |
| **英国** | 英文，但**没有 30 年固定利率的常态**；BoE 明确指出英国借款成本由短期市场利率驱动，而欧元区部分借款人因长期固定而"shielded"。[BoE FSR Dec 2023](https://www.bankofengland.co.uk/financial-stability-report/2023/december-2023)。加上 SDLT/leasehold/remortgage/ERC，以及 §4.4 的 FSMA s.21 推广线 |
| **澳大利亚** | 英文，但 **offset account + 州级印花税**改变计算器；LMI 是贷方实践而非监管规则；在有联盟链接时受 Corporations Act s.766B / ASIC 约束 |
| **印度** | 英文且流量大，但**税制层（Sec 24(b) / 80C / CIBIL）完全另起一套**，且广告单位经济与本地 lead-gen 门户（BankBazaar、Paisabazaar）竞争。**UNVERIFIED**：印度 RPM 无法从一手来源核实 |
| **德国/荷兰/日本** | 产品差异最大（Bausparen / NHG / フラット35 + 団信），且需要真正的语言与本地化工作 |

> **UNVERIFIED**：加拿大/澳洲/英国相对美国的**搜索量级**我无法从一手来源核实；上述排序基于"产品重合度 + 工程增量 + 合规增量"，而非流量经济性。建议在做最终投入决策前，用 Google Ads Keyword Planner（需登录，非可引用一手文档）自行核对目标国搜索量。

### 9.4 一个被忽略的选项

值得注意的是，**`tools.tableview.dev`（Parquet / DuckDB-WASM）与 `compress.tableview.dev`（FFmpeg-WASM）的国际化难度远低于金融站**：文件格式、SQL、视频编解码没有国别制度差异，唯一国别化的是 **UI 语言**与 **AdSense 可用性**。如果目标是"以最低成本触达非美国用户"，**先国际化工具站、而不是金融站**，是单位投入产出比更高的路径。这与原问题（金融计算器站点）不同，但直接影响资源分配。

---

## 10. 无法从一手来源验证的断言（清单）

1. **各国搜索量 / CPC / RPM** —— 无一手来源。Google Ads Keyword Planner 需登录且非可引用文档；Google 官方**不存在**国家级 RPM 表。任何此类数字为 **SECONDARY**。
2. **中国大陆封锁 Google Analytics / GTM / Google Fonts** —— 无 Google 第一方文档；GFW 无官方文档。仅有 Google 透明度报告对"government-mandated blocks"的一般性描述作为间接证据。标为 **SECONDARY/UNVERIFIED**。
3. **监管机构对"金融计算器"的直接指引** —— CFPB、FCA、ASIC 均未找到专门指引；第 4.4 节结论是从通用"推广/建议"定义推导的。
4. **金融计算器必须展示免责声明的法定义务** —— 未找到任何法域有此要求。
5. **英国长期固定利率为何不普遍的结构性原因**（批发融资、提前还款风险等）—— 只有 FCA MCOB / DP25/2 涉及 ERC 披露，未找到直接解释成因的一手文本。
6. **美国 Fannie Mae Selling Guide 的 PMI 章节具体条款** —— 抓取时返回 403（UNVERIFIED link）；PMI 法定终止已在 12 U.S.C. ch. 49 中核实。
7. **UAE 外籍 vs 本国人 LTV 具体百分比** —— CBUAE Rulebook 页面在本次会话中返回 403；条例存在性已核实，具体数值 **UNVERIFIED**。
8. **新加坡 TDSR/LTV 的具体百分比** —— MAS Notice 645/632 页面为 JS 渲染，只核实了文书存在与标题。
9. **加拿大/澳洲/英国相对美国的搜索量级** —— 见第 9.3 节的说明。

---

## 参考资料 / Sources

### 搜索引擎与 SEO（Google Search Central）
- [Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [How Google crawls locale-adaptive pages](https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages)

### 国际标准与 Web 规范
- [Unicode LDML Part 3: Numbers (UTS #35)](https://unicode.org/reports/tr35/tr35-numbers.html)
- [ECMA-402 — ECMAScript Internationalization API Specification](https://tc39.es/ecma402/)
- [W3C — Language tags in HTML and XML](https://www.w3.org/International/articles/language-tags/)
- [W3C — Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations)
- [BCP 47 / RFC 5646 (RFC Editor)](https://www.rfc-editor.org/info/bcp47)
- [MDN — Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)

### 数据保护与消费者保护
- [Regulation (EU) 2016/679 (GDPR), Art. 3 / 7 / 27 / 28 — EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Directive 2002/58/EC (ePrivacy), Art. 5(3) — EUR-Lex](https://eur-lex.europa.eu/eli/dir/2002/58/oj)
- [EDPB Guidelines 3/2018 on the territorial scope of the GDPR (Art. 3)](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3-version_en)
- [EDPB Guidelines 05/2020 on consent](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en)
- [CPPA FAQ（CCPA/CPRA 适用门槛）](https://cppa.ca.gov/faq.html)
- [Code of Virginia §59.1-576 (VCDPA)](https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-576/)
- [Directive 2005/29/EC (Unfair Commercial Practices) — EUR-Lex](https://eur-lex.europa.eu/eli/dir/2005/29/oj)
- [FTC .com Disclosures](https://www.ftc.gov/business-guidance/resources/com-disclosures-how-make-effective-disclosures-digital-advertising)
- [FTC Native Advertising: A Guide for Businesses](https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses)
- [FTC Endorsement Guides, 16 CFR Part 255](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-255)
- [15 U.S.C. §45 (FTC Act §5)](https://www.govinfo.gov/content/pkg/USCODE-2023-title15/html/USCODE-2023-title15-chap2-subchapI-sec45.htm)

### 金融监管与金融推广
- [FSMA 2000, s.21 — legislation.gov.uk](https://www.legislation.gov.uk/ukpga/2000/8/section/21)
- [FCA FG24/1 — Financial promotions on social media](https://www.fca.org.uk/publications/finalised-guidance/fg24-1-finalised-guidance-financial-promotions-social-media)
- [FCA Handbook PERG 8 — Financial promotion and related activities](https://handbook.fca.org.uk/handbook/PERG/8/)
- [MiFID II Directive 2014/65/EU, Art. 4(1)(4) — EUR-Lex](https://eur-lex.europa.eu/eli/dir/2014/65/oj)
- [Corporations Act 2001 (Cth), s.766B — Federal Register of Legislation](https://www.legislation.gov.au/C2004A00818/latest/text)
- [ASIC — Complying with your credit obligations](https://www.asic.gov.au/regulatory-resources/credit/credit-general-conduct-obligations/faqs-complying-with-your-credit-obligations)
- [12 CFR §1024.14 (RESPA §8) — GovInfo](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol8/xml/CFR-2024-title12-vol8-sec1024-14.xml)
- [12 CFR §1026.19 / §1026.32 / §1026.35 / §1026.43 (Regulation Z) — GovInfo](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-43.xml)
- [12 U.S.C. ch. 49 (Homeowners Protection Act) — GovInfo](https://www.govinfo.gov/content/pkg/USCODE-2023-title12/html/USCODE-2023-title12-chap49.htm)
- [IRS — Like-Kind Exchanges Under IRC Section 1031](https://www.irs.gov/newsroom/like-kind-exchanges-under-irc-code-section-1031)

### 各国金融产品与监管（一手来源）
- 英国：[HMRC SDLT 住宅税率](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates) · [HMRC 非居民 SDLT](https://www.gov.uk/guidance/rates-of-stamp-duty-land-tax-for-non-uk-residents) · [Leasehold toolkit (MHCLG)](https://www.gov.uk/government/publications/leasehold-toolkit/leasehold-toolkit-england) · [Bank of England Financial Stability Report, December 2023](https://www.bankofengland.co.uk/financial-stability-report/2023/december-2023)
- 加拿大：[OSFI Guideline B-20 infosheet](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/infosheet-residential-mortgage-underwriting-practices-procedures-guideline-b-20) · [CMHC — Mortgage Loan Insurance for Consumers](https://www.cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers) · [CMHC Home Start (2024)](https://www.cmhc-schl.gc.ca/media-newsroom/news-releases/2024/cmhc-home-start-helps-canadians-buy-their-first-homes) · [Interest Act, R.S.C. 1985, c. I-15, s. 6](https://laws-lois.justice.gc.ca/eng/acts/I-15/section-6.html)
- 澳大利亚：[Revenue NSW — Transfer duty](https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty) · [SRO Victoria — Land transfer duty (PPR)](https://www.sro.vic.gov.au/about-us/rates-and-statistics/current-rates/land-transfer-duty-principal-place-residence-current-rates) · [APRA APG 223](https://www.apra.gov.au/sites/default/files/2022-06/Final%20Prudential%20Practice%20Guide%20APG%20223%20Residential%20Mortgage%20Lending.pdf)
- 德国：[BaFin — 房地产贷款](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/immobilienkredit/immobilienkredit_node_en.html) · [BaFin — Bauspar plans](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/bausparen/bausparen_en.html) · [GNotKG §122](https://www.gesetze-im-internet.de/gnotkg/__122.html)
- 荷兰：[NHG — NHG-grens 2026](https://www.nhg.nl/faq/product-en-proces/wat-is-de-nhg-grens-in-2026/) · [Belastingdienst — annuïtair vs lineair](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/annuitair-lineair-aflossen)
- 日本：[フラット３５ 官方](https://www.flat35.com/) · [金融庁 FRT Council DP2025-7](https://www.fsa.go.jp/frtc/seika/discussion/2025/DP2025-7.pdf)
- 印度：[RBI — 浮动利率重置](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529) · [印度所得税局 — 各类扣除](https://www.incometaxindia.gov.in/w/various-deductions-under-the-income-tax-act)
- 新加坡：[MAS Notice 645 (TDSR)](https://www.mas.gov.sg/regulation/notices/notice-645) · [MAS Notice 632 (LTV)](https://www.mas.gov.sg/regulation/notices/notice-632)
- 香港：[HKMA 新闻稿 2024-10-16](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2024/10/20241016-4/)
- 阿联酋：[CBUAE Rulebook — Regulations Regarding Mortgage Loans](https://rulebook.centralbank.ae/en/rulebook/regulations-regarding-mortgage-loans)

### 广告变现（Google 第一方文档）
- [AdSense availability（可用国家清单）](https://support.google.com/adsense/answer/13402307)
- [Understanding AdSense country restrictions](https://support.google.com/adsense/answer/6167308)
- [Google Publisher Policies](https://support.google.com/publisherpolicies/answer/10502938)
- [Google Publisher Restrictions](https://support.google.com/publisherpolicies/topic/10402539)
- [AdSense Program policies](https://support.google.com/adsense/answer/48182)
- [Eligibility requirements for AdSense](https://support.google.com/adsense/answer/9724)
- [Payment thresholds](https://support.google.com/adsense/answer/1709871)
- [Set up and manage your Consent Management Platform (CMP)](https://support.google.com/adsense/answer/7670013)
- [Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)](https://support.google.com/adsense/answer/13554116)
- [Set up consent mode on websites](https://developers.google.com/tag-platform/security/guides/consent)
- [Restricted targeting in Personalized advertising](https://support.google.com/adspolicy/answer/143465)
- [Financial products and services (Google Ads)](https://support.google.com/adspolicy/answer/2464998)
- [Compare Google Ad Manager and AdSense](https://support.google.com/admanager/answer/4599464)
- [Sign up for Ad Manager](https://support.google.com/admanager/answer/7084151)

### 基础设施
- [Cloudflare Global Network](https://www.cloudflare.com/network/)
- [Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- [Get started · Cloudflare China Network](https://developers.cloudflare.com/china-network/get-started/)
- [Cloudflare — HTTP/3 (with QUIC)](https://developers.cloudflare.com/speed/optimization/protocol/http3/)
- [Cloudflare — Content compression](https://developers.cloudflare.com/speed/optimization/content/brotli/)
- [Cloudflare — IP addresses (Anycast)](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- [Cloudflare Pages overview](https://developers.cloudflare.com/pages/)
- [Google product traffic disruptions FAQs](https://support.google.com/transparencyreport/answer/7381506)

### 竞争格局（各公司自身站点）
- [Bankrate](https://www.bankrate.com/) · [LendingTree](https://www.lendingtree.com/) · [Rocket Mortgage](https://www.rocketmortgage.com/)
- [MONY Group — Our brands](https://www.monygroup.com/about-us/our-brands/) · [money.co.uk](https://www.money.co.uk/)
- [Ratehub.ca](https://www.ratehub.ca/) · [WOWA.ca](https://wowa.ca/) · [rates.ca](https://rates.ca/)
- [Canstar](https://www.canstar.com.au/) · [Finder](https://www.finder.com.au/) · [CommBank](https://www.commbank.com.au/)
- [CHECK24](https://www.check24.de/) · [Interhyp](https://www.interhyp.de/)
- [Meilleurtaux](https://www.meilleurtaux.com/) · [Empruntis](https://www.empruntis.com/) · [Pretto](https://www.pretto.fr/)
- [BankBazaar](https://www.bankbazaar.com/) · [Paisabazaar](https://www.paisabazaar.com/) · [HDFC Bank](https://www.hdfcbank.com/)
- [価格.com 住宅ローン](https://kakaku.com/housing-loan/) · [モゲチェック](https://www.mogecheck.jp/) · [フラット３５](https://www.flat35.com/)

### 本仓库代码事实（非外部来源，用于 §2.4 与 §6.2）
- `apps/finance/index.html`、`apps/tools/index.html`、`apps/compressor/index.html`（`lang="en"` 硬编码）
- `apps/finance/scripts/prerender.ts`（单语言 sitemap 生成）
- `packages/shared/src/format.ts`（en-US/USD 硬钉死的格式化）
- `apps/finance/src/lib/__tests__/localeFormatting.test.ts`（locale 确定性测试守卫）
