# 各国金融计算器产品对标与计算规则实现指南

> **文档类型**: 产品对标（在售计算器清单）+ 计算规格（可实施级）+ 落地路线图
> **对标对象**: TableView apps/finance 现有 10 款美国计算器（tableview.dev）
> **上游文档（不重复其结论，只交叉引用）**
> - international-market-differences.md —— §3 各国按揭产品结构、§4 法律/合规、§5 广告变现、§6 i18n 机制、§7 基础设施、§8 在位者名单、§9 排序结论
> - us-financial-calculators-market-demand-analysis.md —— 美国基线：关键词簇、计算器品类、竞品弱点
> **本文回答**: 每个国家「市面上真实存在的计算器产品是什么」「实现它们需要哪些计算规则」「现有 10 款能否复用」「先做什么」
> **日期**: 2026-09-20
> **覆盖国家**: Tier A：美国（基线）、英国、加拿大、澳大利亚、爱尔兰、新西兰；Tier B：德国、荷兰、法国、日本、印度、新加坡；Tier C：阿联酋、中国香港、西班牙、意大利（**全部 18 个市场均有第一方产品清单与规则规格**）
> **证据标准**: 「某计算器是否存在」以在位者自身站点（第一方）为准；「规则是什么」以监管机构 / 成文法 / 央行 / 税务机关 / 住房机构 / 第一方银行页面为准。仅聚合来源标注 **SECONDARY**；未对一手来源核实标注 **UNVERIFIED**。**不编造费率、费用或税档**：无法核实的数字只描述结构并标注缺口。
> **检索诚实性说明**: EUR-Lex、legislation.gov.uk、FCA Handbook、legifrance、economie.gouv.fr、moneysmart.gov.au、ato.gov.au、rbnz.govt.nz、emiratesnbd.com / adcb.com、sorted.org.nz、normattiva.it 等对自动化抓取返回 WAF / CAPTCHA / 403 / JS 壳；部分页面的正文因此由研究 agent 以 curl 等方式绕过 JS 取得（已在 §6 逐条标注取数路径与复核建议）。一个有用替代：**欧盟按揭信贷指令（MCD）在爱尔兰的转写文本 S.I. No. 142/2016 可正常抓取**，其 Schedule 2（ESIS）与 Schedule 3（APRC）即欧盟范围内的统一披露/比价规范，见 §3。

> **独立复核状态（由本仓库复核者执行，非撰写者自述）**:
> 撰写 agent 的部分关键数值已由复核者在其可访问网络重新取证，结果如下，**实施前请以此表为准**：
>
> | 断言 | 复核结果 |
> | :--- | :--- |
> | 加拿大 Interest Act s.6「calculated yearly or half-yearly, not in advance」 | ✅ **已复核**：laws-lois.justice.gc.ca 返回 200，条文逐字一致 |
> | 香港住宅 LTV **70%**、DSR **50%**（HKMA 2024-10-16） | ✅ **已复核**：news.gov.hk 官方新闻稿原文为「adjust the maximum loan-to-value ratio for residential and non-residential properties to 70%… The maximum debt servicing ratio for properties will be adjusted to 50%」 |
> | **加拿大 CMHC 保费分档**（0.60 / 1.70 / 2.40 / 2.80 / 3.10 / 4.00%，非传统首付 4.50%） | ✅ **已复核**：cmhc-schl.gc.ca 官方保费页原文「Up to and including 65% 0.60%／65.01% to 75% 1.70%／75.01% to 80% 2.40%／80.01% to 85% 2.80%／85.01% to 90% 3.10%／90.01% to 95% 4.00%／90.01% to 95% with non-traditional down payment 4.50%」，**逐档一致** |
> | **NSW 外国买家附加印花税 9%** | ✅ **已复核**：nsw.gov.au 官方发布原文「From 1 January 2025, the foreign purchaser duty surcharge will increase from eight per cent to nine per cent」（土地税附加同步 4%→5%） |
> | 阿联酋 CBUAE 规则（LTV 分档 / 25 年 / DBR 50% / 提前结清 1%） | ⚠️ **待独立复核**：复核者对同一 Rulebook URL 实测返回 **HTTP 403**，无法复现。数值可作线索，**不可视为已核实** |
>
> 复核原则：**一个来源若无法被第二方重新取得，就不能仅凭撰写方自述解除 UNVERIFIED 标记。** 本表中标 ⚠️ 的条目在实施前必须重新取证。
>
> 方法学：✅ 条目均由复核者用**独立于撰写 agent 的网络路径**重新抓取同一权威来源并比对原文，而非采信转述。加拿大 CMHC 与 NSW 两条即因此从「agent 声称」转为「可复现」。

---


## 1. 结论先行（TL;DR）

**一句话**：现有 10 款里真正能跨市场复用的是 **Mortgage Payment、Loan Comparison、Cap Rate/现金流** 三类引擎；**DSCR、Hard Money、1031、Commercial Balloon、Salary-to-Hourly** 是美国制度性产物，海外大多没有对应产品或数据假设完全不成立。所以「支持多国」不是翻译问题，而是**逐国重建一个更小的产品集**。

**按「与现有产品重合度 x 可触达需求规模」排序：**

| 档 | 市场 | 为什么在这一档 | 结论 |
| :--- | :--- | :--- | :--- |
| **T1 最近，但要动引擎** | **加拿大** | 产品名（mortgage / affordability / refinance）一一对应，但**法定半年复利**要求摊还数学参数化；压力测试门槛已一手核实 | 先做。1 处引擎改造 + 2 个新增 |
| **T1** | **澳大利亚** | 英文、30 年、摊还通用；增量是 **offset account**、LMI、**州级**印花税 | 先做。1 个新计算器（州维度印花税） |
| **T1** | **爱尔兰** | 英文、欧元；央行 **LTI 4x / 3.5x** 与 **LTV 10% / 30%** 是硬上限；另有**法定房贷寿险** | 先做（合规增量见上游 §4.2 的 CMP） |
| **T1（陷阱）** | **英国** | 英文，但**没有 30 年固定利率常态**；remortgage、ERC、leasehold、SDLT 是核心；房东利息是**税额抵免**不是费用扣除 | 做，但按「新产品」预算 |
| **T1** | **新西兰** | 英文、**无印花税**（交易成本最低），offset / revolving credit 是一等公民 | 做 |
| **T2 需要新品类** | **荷兰** | annuitair / lineair / aflossingsvrij 三种还款公式 + NHG + hypotheekrenteaftrek | 新摊还引擎 + 3 个本地计算器 |
| **T2** | **德国** | Annuitätendarlehen 与 Tilgungsdarlehen 输出口径不同；Zinsbindung 到期再融资、Kaufnebenkosten、Vorfälligkeitsentschädigung | 新摊还引擎 + 2 个本地计算器 |
| **T2** | **法国** | assurance emprunteur 是事实必需项且显著改变月供；TAEG、frais de notaire、PTZ、HCSF | 新引擎（保险 + APR 口径） |
| **T2** | **日本** | 元利均等 / 元金均等、フラット35、団信、ボーナス払い、諸費用、住宅ローン控除 | 新引擎（bonus 期供 + 税控除） |
| **T2** | **印度** | EMI 数学通用，但 Sec 24(b) / 80C 税盾、州印花税、CIBIL、PMAY 构成不同输出 | 需要税层，不只是计算器 |
| **T2** | **新加坡** | TDSR + MSR + LTV 三重约束 + CPF OA + BSD/ABSD + 压力利率 | 新资格引擎 |
| **T3 远端** | **阿联酋 / 香港** | 产品面窄（按揭 + LTV/DSR + 转移费），但监管数值来源部分不可达 | 第二批 |
| **T3** | **西班牙 / 意大利** | 欧元区、**法式摊还通用**（比 Tier B 更接近现有引擎）；增量在交易税（ITP/IVA+AJD；registro/catastale/ipotecaria）与税盾 | 观察，但本轮已取得完整第一方规格 |

**最小可用产品集（MVP）**

- **Tier A（英文圈）**：① Mortgage repayment ② Borrowing power / affordability ③ Stamp/transfer duty ④ Overpayment / extra repayment ⑤ Remortgage / refinance break-even ⑥ Rental yield / cash flow。再加 1 条本地化：英国=ERC、澳洲=offset、加拿大=压力测试、爱尔兰=LTI/LTV、新西兰=offset/revolving。
- **Tier B（机制不同）**：上述基础上加 ④ 本地摊还类型选择器（annuitair/lineair、Annuität/Tilgung、元利/元金）、⑤ 购房交易税费计算器、⑥ 本地税盾（hypotheekrenteaftrek / 住宅ローン控除 / Sec 24(b)）、⑦ 保险（assurance emprunteur / 団信 / NHG）。
- **Tier C**：① Mortgage repayment ② LTV/DSR 资格 ③ 交易税（DLD 4% / HK AVD）。**不做**投资类（DSCR/hard money/1031）。

**最省钱的顺序**：加拿大 → 澳大利亚 → 爱尔兰 → 英国 → 新西兰 → 荷兰/德国 → 法国/日本 → 印度/新加坡 → 阿联酋/香港。

**必须承认的代价**：这个序列里**没有一个是「只翻译」**。最便宜的加拿大也要改摊还数学（半年复利）。

---

## 2. 产品对标矩阵

### 2.0 现有基线（本文的核对基准）

核对仓库真实路由（apps/finance/src/data/routeMeta.ts 与 apps/finance/src/pages/FinanceCalculatorHub.tsx）：站点当前提供 **10 个主计算器** + 5 个长尾路由（共用同一引擎）：

| # | 主路由 | 长尾路由（共用引擎） |
| :--- | :--- | :--- |
| 1 | /mortgage-calculator | /amortization-schedule-calculator、/mortgage-payoff-calculator |
| 2 | /refinance-calculator | /cash-out-refinance-calculator |
| 3 | /dscr-loan-calculator | - |
| 4 | /cap-rate-calculator | （现金流/租金收益） |
| 5 | /brrrr-calculator | /brrrr-method-calculator |
| 6 | /hard-money-calculator | - |
| 7 | /commercial-loan-calculator | /balloon-payment-calculator |
| 8 | /section-1031-exchange-calculator | /1031-exchange-timeline-calculator |
| 9 | /loan-comparison-calculator | - |
| 10 | /salary-to-hourly-calculator | 12 个长尾薪资页（如 /30000-a-year-is-how-much-an-hour） |

下文每国 **(d) 与现有 10 款的重合度** 均以这张表为准。

---

### 2.1 美国（基线 / US）

**(a) 在售计算器清单** —— 上游 us-financial-calculators-market-demand-analysis.md §2 已列国别关键词与竞品，§3 已审计本仓库能力，此处不重复。仅补口径：在位者都是 **lead-gen 比价门户或银行系**（Bankrate、LendingTree、NerdWallet、Zillow、Rocket），产品族为 mortgage / affordability / refinance / cash-out / HELOC / amortization / rent-vs-buy / DSCR / hard money / 1031 / CRE。

**(b) 必做计算器** —— 见上游 §4 的 5 个缺口（Home Affordability、Rent vs Buy、Rental/Cap Rate、BRRRR、HELOC vs Cash-Out）。其中 Cap Rate/NOI/Cash-on-Cash 是**少数「一次开发、多国复用」的资产**（上游 §3.3 亦认为「部分」可迁移）。

**(c) 核心计算规则** —— 沿用现有实现与上游引用：30/15 年固定为常态；**月度摊还**；PMI 在 LTV 降至 80% 可请求取消、78% 法定自动终止（12 U.S.C. ch. 49 HPA）；HPML 首贷强制 escrow、ATR/QM 43% DTI、TRID 三日规则与 TIP（12 CFR §1026.43）；1031 的 45/180 天与 boot（IRS §1031）；FLSA 1.5 倍加班（29 U.S.C. §207）。**美国是本仓库唯一「不需新增规则层」的市场。**

**(d) 与现有 10 款的重合度** —— 全部 **可直接复用**（基线）。

---

### 2.2 英国（UK）

**(a) 在售计算器清单（第一方核对，均为 2026/27 税年页面）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Calculate Stamp Duty Land Tax (SDLT)**（覆盖 FTB / 换自住 / 额外房产 / 住宅非住宅 / 永久与租赁产权 / 非英国居民） | HMRC | **政府** | tax.service.gov.uk/calculate-stamp-duty-land-tax |
| Borrowing calculator | Barclays | 银行 | barclays.co.uk/mortgages/mortgage-calculator/borrowing-calculator/ |
| Repayment calculator | Barclays | 银行 | barclays.co.uk/mortgages/mortgage-calculator/repayment-calculator/ |
| How much can I borrow? | Santander UK | 银行 | santander.co.uk/personal/mortgages/mortgage-calculators/how-much-could-i-borrow |
| Overpayment calculator | Santander UK | 银行 | santander.co.uk/.../mortgage-calculators/overpayment-calculator |
| Home deposit calculator | Santander UK | 银行 | santander.co.uk/.../home-deposit-calculator |
| Budget calculator | Santander UK | 银行 | santander.co.uk/.../budget-calculator |
| How much could I borrow? | NatWest | 银行 | natwest.com/mortgages/mortgage-calculators/how-much-can-i-borrow.html |
| Mortgage Overpayment Calculator | NatWest | 银行 | natwest.com/.../mortgage-overpayment-tool.html |
| Equity calculator | NatWest | 银行 | natwest.com/.../equity-calculator.html |
| Remortgage calculator | NatWest | 银行 | natwest.com/.../remortgage-calculator.html |
| Mortgage overpayment calculator | Nationwide | 银行 | nationwide.co.uk/mortgages/mortgage-calculators/overpayment-calculator/ |
| Check your affordability / Remortgage Calculator | Rightmove | **门户** | rightmove.co.uk/mortgages/calculators/remortgage-calculator |
| Stamp duty calculator | Zoopla | 门户 | zoopla.co.uk/discover/buying/stamp-duty-calculator/（**SECONDARY**，直抓 403） |
| Mortgage calculator | MoneyHelper (MaPS) | 政府咨询 | moneyhelper.org.uk/en/homes/buying-a-home/mortgage-calculator |

**已核实的本地产品命名**：**repayment、how much can I borrow、overpayment、remortgage、deposit、equity**。注意「overpayment calculator」是英国一等公民（美国对应物是 extra payment，但英国把它做成独立产品）。

**(b) 必做计算器** —— **① repayment ② how much can I borrow ③ stamp duty ④ remortgage ⑤ overpayment ⑥ deposit/LTV**。理由：每家银行/门户都提供这六类；政府自己都提供了 SDLT 计算器。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 利率结构 | 固定 + 浮动；固定期约 **2-5 年**，期满转 **SVR**（贷方自定、可月度变动）；**tracker** 跟随 **BoE Bank Rate**（当前 **3.75%**） | natwest.com/mortgages/mortgage-guides/fixed-rate-or-variable-mortgage.html；bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate |
| 摊还 / 计息 | **按日计息**：余额 x 年利率 / 365，月度还款因此随余额下降而减少（Santander 自述） | santander.co.uk/personal/mortgages/mortgage-calculators（"How is mortgage interest calculated?"） |
| 标准期限 | 未从一手页面取得默认年限 | **UNVERIFIED**（Barclays/Nationwide 计算器页 JS-only） |
| 按揭保险 / 担保 | **无 PMI**。国家机制为 **2025 Mortgage Guarantee Scheme**（2025 年 7 月起永久化）：政府为参与贷方在 **91-95% LTV** 贷款上的部分损失提供担保，使首付 5% 者可购房 | gov.uk/government/publications/2025-mortgage-guarantee-scheme |
| **SDLT（英格兰/北爱）** | 标准档：0% 至 £125,000；2% £125,001-£250,000；5% £250,001-£925,000；10% £925,001-£1.5m；12% 超过 £1.5m。**额外房产 +5%**（若 36 个月内售出旧自住可退）；**非居民 +2%**（前 12 个月在英不足 183 天）；**首套减免：£300,000 以下 0%，£300,001-£500,000 部分 5%，超 £500,000 不可用**；新租赁产权对 NPV 超 £125,000 部分收 1% | gov.uk/stamp-duty-land-tax/residential-property-rates（**已逐条核对**） |
| 提前还款 | 固定利率下每年通常可**免罚超还一定比例**（Santander 为固定贷款的 **10%/日历年**，超额部分收 ERC，未用额度不结转，换产品不重置）；浮动利率无限额、无 ERC。各贷方不同 | santander.co.uk/personal/mortgages/existing-customers/mortgage-overpayments |
| 可负担性 | 两层：**FCA MCOB 11** 负责任借贷（对收入与基本支出评估）；**FPC 压力测试建议已于 2022 年撤销**，但 **LTI >= 4.5 的流量上限保留**（不超过新增住宅放贷的 15%） | bankofengland.co.uk/news/2022/june/financial-policy-committee-confirms-withdrawal-of-mortgage-market-affordability-test；FCA MCOB 11（Cloudflare 拦截，条文 UNVERIFIED） |
| **税盾（房东）** | 不得从租金利润中扣除住宅融资成本；改为给予 **basic-rate 20% 税额抵免（tax reducer）**，依据 ITTOIA 2005 ss.272A-274AA；扣除比例 2017/18-2020/21 由 75% 逐步降至 **0%** | gov.uk/hmrc-internal-manuals/property-income-manual/pim2058 |
| 薪资（一段，已升级） | ① 个税 2026/27：个人免税额 **£12,570**（超 £100,000 每 £2 减 £1，至 £125,140 归零），**20%** 至 £50,270、**40%** 至 £125,140、**45%** 以上；苏格兰另有独立税率档（**本轮 UNVERIFIED**）。② Class 1 雇员 NI：£129-£242/周 0%、£242.01-£967/周 **8%**、超 £967/周 **2%**（月度阈值 1,048/4,189 英镑）；雇主 NI 超 £96/周 **15%**。③ **PAYE** 由雇主按税码逐期代扣，累计制，年度结算。④ **学生贷款**：Plan 1 门槛 £26,900、Plan 2 £29,385、Plan 4 £33,795、Plan 5 £25,000、Postgraduate £21,000，超门槛部分扣 **9%**（PGL 6%）。⑤ **自动加入养老金**：最低合计 8%（含雇主 >=3%），但 TPR 页面 404，**UNVERIFIED**。⑥ 法定周工时 **平均 48 小时 / 17 周**（可放弃）；**无美国式法定加班倍数**（ACAS 明确雇主无须支付加班附加） | gov.uk/income-tax-rates；gov.uk/national-insurance-rates-letters；gov.uk/repaying-your-student-loan/what-you-pay；acas.org.uk/working-time-rules/the-48-hour-weekly-maximum；gov.uk/maximum-weekly-working-hours |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需参数化** | 按日计息、SVR、product fee、leasehold |
| Refinance break-even | **需参数化** | 英国叫 **remortgage**，须纳入 ERC 与 product fee |
| DSCR rental loan | **不适用** | 无对应产品 |
| Cap rate / cash flow | **需参数化** | 房东利息是 20% 税额抵免，直接改变净收益与 CoC |
| BRRRR | **不适用** | 组合不成立 |
| Hard money / fix & flip | **需新建（bridging loan）** | 桥贷存在但费用结构与 70% rule 不同 |
| Commercial loan + balloon | **需参数化** | balloon / IO 常见 |
| 1031 exchange | **不适用** | 英国无同类交换 |
| Loan comparison | **需参数化** | 应按 **APRC / MCOB** 口径，而非美国 TIP |
| Salary to hourly | **需新建** | PAYE + NI；**英国无美国式固定加班倍数**，法定的是 48 小时周上限 |

---

### 2.3 加拿大（CA）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Mortgage Calculator / Mortgage Loan Insurance Premium Calculator / Affordability Calculator / Debt Service Calculator**（四件套） | **CMHC** | **政府住房机构** | cmhc-schl.gc.ca/consumers/home-buying（导航逐项核对） |
| CMHC Mortgage Loan Insurance Premium Calculator | CMHC | 政府 | cmhc-schl.gc.ca/consumers/home-buying/calculators/mortgage-loan-insurance-premium-calculator |
| **Mortgage Affordability Calculator**（输出含按揭月供 + 房产税 + 取暖费 + 公寓管理费） | RBC | 银行 | rbcroyalbank.com/mortgages/tools/mortgage-affordability-calculator/ |
| **Mortgage Payment Calculator** | RBC | 银行 | apps.royalbank.com/apps/mortgages/mortgage-payment-calculator |
| **Rent vs Buy Calculator** | RBC | 银行 | rbcroyalbank.com/mortgage/tools/rentvsbuy/index.html |
| Mortgage Payment / Affordability Calculator | TD Canada Trust | 银行 | td.com/ca/en/personal-banking/products/mortgages/mortgage-payment-calculator |
| Mortgage-Free Faster Calculator（加速还款） | Scotiabank | 银行 | scotiabank.com/mortgage/mffc/en/ |
| **Mortgage Prepayment Charge Calculator**（提前还款罚金） | CIBC | 银行 | cibc.com/en/personal-banking/mortgages/calculators/prepayment-calculator.html |
| Home Equity Calculator | CIBC | 银行 | cibc.com/en/personal-banking/mortgages/calculators/home-equity-calculator.html |
| **Mortgage Qualifier Tool**（压力测试资格） | **FCAC（联邦消费者机构）** | **政府** | itools-ioutils.fcac-acfc.gc.ca/MQ-HQ/MQReport-EAPHSommaire-eng.aspx |
| **MLTT/MNRST Calculator**（多伦多市土地转让税） | City of Toronto | **政府** | toronto.ca/services-payments/property-taxes-utilities/municipal-land-transfer-tax-mltt/ |
| Mortgage Payment / Affordability / Refinance | Ratehub.ca | 比价门户 + 自有经纪 | ratehub.ca/mortgage-payment-calculator |
| Calculator suite（payment / affordability / land transfer tax） | Dominion Lending Centres | 经纪 | calculators.dominionlending.ca/ |

**已核实的本地输出口径差异**：加拿大「按揭月供」是美国 PITI 的变体 —— **本金 + 利息 + 房产税 + 取暖费**（+ 公寓管理费），由 RBC 页面文案直接核实。

**(b) 必做计算器** —— **① mortgage payment ② affordability ③ CMHC 保费 ④ debt service（GDS/TDS）⑤ land transfer tax**。理由：CMHC 自己就提供前三类；压力测试与省级土地转让税是强制规则。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **复利约定（关键）** | 设押不动产若采用本息混合还款计划，除非合约载明「按年或按半年计算、非预付（calculated yearly or half-yearly, not in advance）」的名义利率，否则不得计息。**实现公式**：合约名义半年复利率 r 必须换算为等效**月度**利率 = **(1 + r/2)^(1/6) - 1**（而**不是** r/12）。这是加拿大月供与美/澳月供的核心数学差异 | Interest Act, R.S.C. 1985, c. I-15, s. 6：laws-lois.justice.gc.ca/eng/acts/I-15/section-6.html（**已核对条文**） |
| **压力测试（已一手核实）** | OSFI 最低合格利率（MQR）：**取「合同利率 + 2%」与「5.25%」中的较高者**。2024-11-21 起，对**无保险的 straight switch 续约**不再要求固定 MQR | osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages；osfi-bsif.gc.ca/en/news/backgrounder-minimum-qualifying-rate-mqr |
| **保险（费率表已取得）** | **首付低于 20% 且房价 <= 150 万加元时必须投保**（LTV > 80%）；房价 > 150 万不可投保。保费按**贷款总额**（LTV 分档）：<=65% -> **0.60%**；65.01-75% -> **1.70%**；75.01-80% -> **2.40%**；80.01-85% -> **2.80%**；85.01-90% -> **3.10%**；90.01-95% -> **4.00%**（非传统首付 4.50%）；可携带性加保列 0.60%-6.60%。安省/魁省/萨省保费须另付省销售税且**不得并入贷款**。**首付规则**：<=50 万最低 5%；50 万-149.9999 万为前 50 万 5% + 超部分 10% | CMHC 成本页（**完整 LTV 保费表**）：cmhc-schl.gc.ca/consumers/home-buying/mortgage-loan-insurance-for-consumers/cmhc-mortgage-loan-insurance-cost；CMHC 说明页：cmhc-schl.gc.ca/observer/2025/cmhc-mortgage-loan-insurance-explained |
| **受保贷款摊销上限（2024 改革）** | 自 **2024-12-15** 起，**30 年摊销扩展至所有首次购房者及所有新建房购买者**（2024-08-01 起仅限首购者购新建房）；同期受保按揭价格上限由 100 万提高至 **150 万加元** | canada.ca/en/department-finance/news/2024/09/government-announces-boldest-mortgage-reforms-in-decades-to-unlock-homeownership-for-more-canadians.html |
| **信息披露（纠正上游缺口）** | **Cost of Borrowing (Banks) Regulations（SOR/2001-101）已于 2022-06-29 废止**（原文标注 "[Repealed, SOR/2021-181, s. 122]"）。现行文件为 **Financial Consumer Protection Framework Regulations, SOR/2021-181**（含 Credit Agreements / Loans / Mortgage Insurance 披露章节） | laws-lois.justice.gc.ca/eng/regulations/SOR-2001-101/page-1.html（废止）；laws-lois.justice.gc.ca/eng/regulations/SOR-2021-181/（现行） |
| **交易税（已取得省/市档位）** | **安省 LTT**：<=5.5 万 0.5%；5.5-25 万 1.0%；25-40 万 1.5%；>40 万 2.0%；含 1-2 户自住且 >200 万部分 2.5%；首次购房最高退税 **4,000 加元**（前 36.8 万免税）。**BC PTT**：<=20 万 1%；20-200 万 2%；>200 万 3%；住宅 >300 万部分再加 2%。**多伦多市 MLTT**（与省税叠加）：<=5.5 万 0.5%；-25 万 1.0%；-40 万 1.5%；-200 万 2.0%；-300 万 2.5%；首购退税上限 **4,475 加元**。联邦层无交易税 | 安省：ontario.ca/document/land-transfer-tax/calculating-land-transfer-tax；BC：www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax；多伦多：toronto.ca/services-payments/property-taxes-utilities/municipal-land-transfer-tax-mltt/ |
| **提前还款（已取得规则）** | 罚金通常取「**三个月利息**」与「**利率差（IRD）**」的**较高者**；IRD 由贷方用两个利率分别计算剩余期限的全部利息之差。CIBC 提供独立的 **Mortgage Prepayment Charge Calculator**（说明这是用户预期产品） | FCAC：canada.ca/en/financial-consumer-agency/services/mortgages/reduce-prepayment-penalties.html；CIBC：cibc.com/en/personal-banking/mortgages/calculators/prepayment-calculator.html |
| 薪资（一段，已升级） | ① **源泉代扣**：雇主按 CRA T4032/T4127 的**年度累进税率表分摊到发薪周期**代扣联邦税 + 省/地区税（魁省由 Revenu Québec 单独管理）；**CRA PDOC** 为官方口径工具。② **CPP**：5.95%（基础 4.95% + 首次附加 1%），年度基本豁免 **3,500 加元**；2025 年 YMPE **71,300**（雇员上限 4,034.10）；**CPP2** 对 71,300-81,200 区间再按 **4.00%**（2025 年 YAMPE 81,200，上限 396.00）。③ **EI**：2025 年雇员费率 **1.64%**，最高可保收入 **65,700**（雇员年上限 1,077.48）；雇主缴雇员 1.4 倍。④ **工时/加班**：Canada Labour Code s.169 标准工时 8 小时/日、40 小时/周，s.174 加班不低于 **1.5 倍**（或 1.5 倍带薪补休）—— 仅联邦管辖雇主；各省自定 | PDOC：canada.ca/en/revenue-agency/services/e-services/digital-services-businesses/payroll-deductions-online-calculator.html；CPP：canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html；EI：canada.ca/.../employment-insurance-ei/ei-premium-rates-maximums.html；工时：laws-lois.justice.gc.ca/eng/acts/L-2/section-169.html 与 /section/174.html |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需参数化（+引擎）** | 半年复利；PITH 输出；CMHC 保费并入本金 |
| Refinance break-even | **需参数化** | 加入 IRD 罚金 |
| DSCR rental loan | **不适用** | 加拿大无 DSCR 贷款产品 |
| Cap rate / cash flow | **需参数化** | 税费/保险层不同 |
| BRRRR | **不适用** | 无对应组合 |
| Hard money / fix & flip | **部分需新建** | 有私人/桥式贷款，但非「hard money」品牌 |
| Commercial loan + balloon | **需参数化** | 常见 |
| 1031 exchange | **不适用** | 无同类交换（有 rollover，规则不同） |
| Loan comparison | **需参数化** | 按 SOR/2021-181 披露口径 |
| Salary to hourly | **需新建** | CPP/EI + 省级税；加班规则各省不同 |

---

### 2.4 澳大利亚（AU）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Borrowing Power Calculator**（按收入/支出估算可借额度） | CommBank | 银行 | commbank.com.au/digital/home-loans/borrowing-power-calculator |
| **Repayment Calculator** | CommBank | 银行 | 同上「Other home loan calculators」区域 |
| **Stamp Duty Calculator** | CommBank | 银行 | 同上 |
| **Refinance Calculator** | CommBank | 银行 | 同上 |
| **Offset calculator**（100% offset，净额计息） | Westpac | 银行 | westpac.com.au/personal-banking/home-loans/calculator/offset-calculator/ |
| Borrowing power / Repayment / Costs & stamp duty / Home equity / Rate change / Split loan / Affordability / Refinance calculators | Westpac | 银行 | westpac.com.au/home-loans/calculator/ |
| Borrowing power calculator / Home Loan Repayment Calculator | NAB | 银行 | nab.com.au/personal/home-loans/calculators/borrowing-calculator |
| **LVR Calculator / Stamp Duty Calculator** / Borrowing Power / Deposit / Compare Home Loan | ANZ | 银行 | anz.com.au/personal/home-loans/calculators-tools/ |
| **Stamp Duty Calculator** / Mortgage / Borrowing power | realestate.com.au | 门户 | realestate.com.au/home-loans/stamp-duty-calculator/ |
| Mortgage Borrowing Power Calculator / 5% guarantee calculator | Aussie Home Loans | 经纪 | aussie.com.au/calculators/borrowing-power/ |
| Home Loan Calculator / Stamp Duty / Borrowing Power / Income Tax Calculator | Canstar | 比价 | canstar.com.au/calculators/ |
| **Transfer of land or business calculator**（官方印花税） | **Revenue NSW** | **政府** | apps09.revenue.nsw.gov.au/erevenue/calculators/landsalesimple.php |
| **Land transfer (stamp) duty calculator** | **SRO Victoria** | **政府** | sro.vic.gov.au/buying-property/land-transfer-stamp-duty/land-transfer-stamp-duty-calculator |
| First Home Owner Grant (FHOG) 州别选择器 | firsthome.gov.au | **政府** | firsthome.gov.au |
| First Home Guarantee（5% 首付政府担保）工具 | Housing Australia / 联邦政府 | **政府** | firsthomebuyers.gov.au |

**已核实的本地产品命名差异**：澳洲叫 **borrowing power**（不是 affordability）、**stamp duty**（州税）、**refinance**。

**(b) 必做计算器** —— **① repayment ② borrowing power ③ stamp duty（州维度）④ refinance ⑤ offset 影响**。理由：CommBank 自己把这四类放在同一工具中心；印花税由州决定，必须做州选择器。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **计息口径（已取得法源）** | NCCP Act 2009 (Cth) Sch 1 (National Credit Code) 规定 **daily percentage rate = 年利率 / 365**，按**每日未偿余额**计息；月度利息 = 年利率/12 乘以当月**平均每日未偿余额** —— 即「**按日计息、按月收取**」，**不是**月对月的利滚利（s.27 定义、s.28 利息上限、s.29 禁止提前扣息） | legislation.gov.au/C2009A00134/latest/text |
| 期限 / IO | **法规未规定标准期限**（NCC 全文无此条款）；「1 to 30 years」是产品惯例（CommBank Simple Home Loan fact sheet）；**interest-only 无法定上限**，但 APRA 认定「本息改只付息」或「延长只付息期」属重大变更，须**重新做偿付能力评估** | CommBank fact sheet PDF；APRA APG 223：handbook.apra.gov.au/ppg/apg-223 |
| **offset account（已取得第一方原文）** | Westpac 原文：「Every day, 100% of the balance in your Westpac transaction offset account is 'offset' against the amount owed… As interest is calculated **daily and charged monthly**, only the **net amount** (your loan balance minus your offset balance for that day) attracts interest.」→ 实现要点：计息本金 = 合同本金 - 当日 offset 余额；月供不变、期限缩短 | westpac.com.au/personal-banking/home-loans/calculator/offset-calculator/ |
| **LMI（已取得区间）** | LVR > 80%（首付 < 20%）通常须投保；保费一次性、按贷款额资本化。CommBank 首方给出区间「**generally 1% to 5% of your loan amount**」（例：50 万贷款、10% 首付，LMI 可超 1 万）。**属贷款人政策，非监管定价** | commbank.com.au/home-loans/lenders-mortgage-insurance.html |
| **comparison rate（法定定义）** | NCC **Part 10（ss.157-168）**：s.160 规定广告含年利率（APR）时**必须**载明相关对比利率；s.161 按最接近该产品典型金额与期限的指定档计算；s.166 由法规规定计算方法，**不确定是否发生的费用不必纳入** | legislation.gov.au/C2009A00134/latest/text |
| LMI | Lenders Mortgage Insurance，LVR 高于阈值时收取；属**贷方实践**而非监管定价 | 上游 §3.1 / §9.3 |
| **交易税（已取得州级档位）** | **NSW（2026/27）**：0-1.8 万 每 100 收 1.25（最低 20）；1.8-3.8 万 225 + 1.50/100；3.8-10.3 万 525 + 1.75/100；10.3-38.7 万 1,662 + 3.50/100；38.7-129 万 11,602 + 4.50/100；>129 万 52,237 + 5.50/100；溢价门槛 **387 万**；**首购：<=80 万全免、<100 万减免，空地 <=35 万免、<45 万减**；**外国买家附加税 9%**（统一税率）。**VIC 一般税率**：<=2.5 万 1.4%；2.5-13 万 350 + 2.4%；13-96 万 2,870 + 6%；96-200 万 5.5%；>200 万 11 万 + 6.5%；自住（PPR）优惠档 44-55 万，>55 万不适用；**外国买家另加 8%** | NSW：revenue.nsw.gov.au/_resources/duties-links/current-thresholds-and-rates（**已逐档核对，并额外核实 9% 外国买家附加税**）；VIC：sro.vic.gov.au/about-us/rates-and-statistics/current-rates/ |
| **可负担性（已逐字核实）** | 2024-11-22 APRA 确认「The mortgage **serviceability buffer will remain at 3 percentage points**」（即按不低于产品利率 + 3.0pp 评估还款能力）；APS 220 Attachment C 要求 ADI 至少加 3.0% 缓冲 | APRA：apra.gov.au/news-and-publications/update-apras-macroprudential-settings-november-2024；APG 223：handbook.apra.gov.au/ppg/apg-223 |
| comparison rate | 法律定义的比较利率（含费用） | **UNVERIFIED 本轮**（Moneysmart 403；需 NCCP Act / ASIC RG） |
| **薪资（一段，数值已由立法核实）** | ① **PAYG** 预扣：用 ATO **PAYG withholding Schedule 1 (NAT 1004)** 的周/双周/月系数（或 ATO Tax withheld / Gross pay estimator）计算。② **居民税率**（Income Tax Rates Act 1986 Sch 7 Part I）：2024-25/2025-26 为超过 **18,200 免税额**后 **16%**（至 45,000）、**30%**（45,001-135,000）、**37%**（135,001-190,000）、**45%**（>190,000）；**2026-27 起首档降至 15%**。③ **Medicare levy 2%**（Medicare Levy Act 1986 s.6）。④ **Superannuation Guarantee 12%**（SG(Administration) Act 1992 "charge percentage means 12"，雇主单方缴款）。⑤ **工时**：Fair Work Act 2009 s.21 全职普通工时 **38 小时/周**，s.62 禁止要求超过 38 小时（除合理加班外）；**加班倍率由 award/合同规定，无法定统一倍率**。⑥ 惯例：周薪 x 52 = 年薪，年薪 / 12 = 月薪 | legislation.gov.au/C2004A03348/latest/text（税率）；/C2004A03351/latest/text（Medicare 2%）；/C2004A04402/latest/text（SG 12%）；/C2009A00028/latest/text（Fair Work s.21/s.62）。**注**：ato.gov.au 计算器页本轮 403，其存在性经搜索索引确认 |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需参数化** | offset、IO 期、月度摊还、30 年 |
| Refinance break-even | **需参数化** | 需 break cost |
| DSCR rental loan | **不适用** | 投资贷按个人收入核贷 |
| Cap rate / cash flow | **需参数化** | **负扣税（negative gearing）**改变税后现金流，建议做税层开关 |
| BRRRR | **不适用** | 无对应产品链 |
| Hard money / fix & flip | **部分需新建** | 私人贷/桥贷市场小 |
| Commercial loan + balloon | **需参数化** | 常见 |
| 1031 exchange | **不适用** | 无同类交换 |
| Loan comparison | **需参数化（重要）** | 必须用法定 **comparison rate** |
| Salary to hourly | **需新建** | PAYG + Super；award 决定加班 |

---

### 2.5 爱尔兰（IE）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Mortgage Calculator**（how much could I borrow / repayment） | AIB | 银行 | aib.ie/our-products/mortgages/mortgage-calculator |
| **Home Buyer Calculator**（首付/购房成本） | AIB | 银行 | 同上 |
| **Switching Mortgage Calculator** | AIB | 银行 | 同上 |
| **Mortgage Overpayment Calculator**（每月/一次性多还 -> 利息节省） | AIB | 银行 | aib.ie/our-products/mortgages/mortgage-overpayment-calculator |
| Mortgage calculator / Repayments planner | Bank of Ireland | 银行 | personalbanking.bankofireland.com/borrow/mortgages/ |
| **Mortgage Rate Comparison Calculator** | Bank of Ireland | 银行 | personalbanking.bankofireland.com/borrow/mortgages/mortgage-rate-comparison-calculator/ |
| Mortgage Overpayment Calculator | Bank of Ireland | 银行 | personalbanking.bankofireland.com/borrow/mortgages/mortgage-overpayment-calculator/ |
| Mortgage calculator and comparison tool | **CCPC** | **政府/监管** | ccpc.ie/consumers/money-tools/mortgage-calculator/ |
| First-Time Buyers Mortgage Calculator and Comparison Tool | CCPC | 政府 | ccpc.ie/manage-your-money/buying-a-home/mortgage-comparison-tools/first-time-buyers-calculator-and-comparison-tool |
| Interest rate calculator | CCPC | 政府 | ccpc.ie/.../mortgage-comparison-tools/interest-rate-calculator |
| Mortgage affordability calculator | bonkers.ie | 比价 | bonkers.ie/compare-mortgages/affordability-calculator/ |

**已核实的产品形态**：AIB overpayment 计算器输入「当前余额 + 当前月供 + 额外月供/一次性还款 + 期限」，输出「总利息节省」。爱尔兰的 **mortgage rate comparison calculator**（BoI）与 CCPC 的 comparison tool 说明：**比价在这里是法定/监管鼓励的核心产品**，不是附加功能。

**(b) 必做计算器** —— **① repayment ② how much can I borrow ③ overpayment ④ stamp duty ⑤ rate comparison / switcher ⑥ breakage fee**。理由：央行 LTI/LTV 是硬上限；AIB 与 BoI 都单列 overpayment 与 switcher。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 期限 | 按揭通常 **20-35 年**、按月还款 | ccpc.ie/manage-your-money/buying-a-home/about-mortgages/understanding-mortgages |
| **LTI / LTV（硬上限）** | 2023-01-01 起：**LTI 上限 = 首购 4x 总收入、二次及以后 3.5x**；**LTV 最低首付：首购与二次购房 10%、Buy-to-let 30%**。允许比例：**首购 15%、二次 15%、BTL 10%** 的放贷可超限 | edit.centralbank.ie/consumer-hub/explainers/what-are-the-mortgage-measures（**已逐条核对**） |
| **法定房贷寿险** | **无 PMI**。但 **Consumer Credit Act 1995 s.126** 要求贷方为借款人安排**等于未偿本金的 mortgage protection 人寿保险**，有法定例外（非主要居所、保险不可得、批准时超 50 岁、已有足够寿险） | irishstatutebook.ie/eli/1995/act/24/section/126/enacted/en/html |
| **印花税** | 住宅：**1% 至 EUR 1,000,000；2% EUR 1,000,000-1,500,000；6% 超过 EUR 1,500,000**（2024-10-02 起执行）。同一栋 3 套以上公寓：1% 至 EUR 1m，2% 以上。**12 个月内取得 10 套以上住宅（不含公寓）适用 15%**（SDCA 1999 s.31E）。非住宅 7.5%。**没有首购印花税减免**；首购激励是 **Help to Buy**：退还申请前 4 个税年已缴的所得税与 DIRT | revenue.ie/en/property/stamp-duty/property/stamp-duty-property/rates.aspx；revenue.ie/en/property/help-to-buy-incentive/index.aspx |
| 提前还款 | 浮动通常免罚；固定可能收费或限制，各贷方不同。额外还款须**明确指定冲抵本金**，否则可能进入贷方暂记账户。AIB：一次性还款可「降低月供（期限不变）」或「缩短期限」；固定利率客户若要缩短期限须**break 固定利率，可能触发 ERC** | ccpc.ie/.../paying-extra-off-your-mortgage；aib.ie/help-and-guidance/mortgages-faq/can-i-make-an-overpayment-on-mortgage-repayments |
| ERC 公式 | AIB 有专门 breakage cost FAQ，但公式为 JS 渲染 | **UNVERIFIED**；**爱尔兰没有「每年 10% 免罚」的通用规则** |
| **税盾** | 自住按揭利息减免（TRS）**已实质关闭**：仅适用于 2004-01-01 至 2012-12-31 签订的合格贷款，最后申报年度 2020。**房东**可就租金收入**扣除**按揭利息（贷款须用于购置/改善/维修出租房，且租约已在 RTB 登记）——是**扣除**，不同于英国的税额抵免 | revenue.ie/en/property/mortgage-interest-relief/index.aspx；revenue.ie/en/property/rental-income/irish-rental-income/what-expenses-are-allowed.aspx |
| 薪资（一段，已升级） | ① 个税 2026：**20% 标准 / 40% 高**；单身标准率区间 **EUR 44,000**；抵免 **单身 EUR 2,000 + 雇员 EUR 2,000**，按周计算（EUR 44,000 / 52），通常按**累计制（cumulative basis）**，另有 Week-1 制；雇主依 Revenue 的 RPN 代扣。② **USC 2026**：免税额 EUR 13,000；对全部收入 前 EUR 12,012 收 0.5%、其后 EUR 12,988 收 2%、其后至约 EUR 70,044 收 3%、余额 8%；全额医疗卡/70 岁以上且 <=EUR 60,000 适用减免率。③ **PRSI** 由雇主经工资申报代扣（**2026 年雇员具体费率 UNVERIFIED**）。④ 工时：Organisation of Working Time Act 1997 **s.15** 平均每周不超过 **48 小时**，参考期最多 4 个月（特定情形 6 个月）。⑤ Revenue 有面向雇主的 **Employee pay day（个税+USC）计算器**；My Future Fund 自动加入（费率 **UNVERIFIED**） | revenue.ie/en/employing-people/paying-an-employee/employee-pay-day-calculating-income-tax-and-usc/index.aspx；revenue.ie/en/jobs-and-pensions/calculating-your-income-tax/how-income-tax-is-calculated.aspx；revenue.ie/en/jobs-and-pensions/usc/calculating-usc.aspx；irishstatutebook.ie/eli/1997/act/20/section/15/enacted/en/html |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需参数化** | LTI/LTV 校验、最长 35 年、**法定房贷寿险**须计入 |
| Refinance break-even | **需参数化** | 加入 breakage fee；爱尔兰对应 switcher |
| DSCR rental loan | **不适用** | 投资房按个人收入核贷 |
| Cap rate / cash flow | **需参数化** | 房东利息可扣除 |
| BRRRR / Hard money / 1031 | **不适用** | 无对应制度 |
| Commercial loan + balloon | **需参数化** | 常见 |
| Loan comparison | **需参数化（高价值）** | 应做 APRC 口径 + switcher 场景；本地已有监管级 comparison tool |
| Salary to hourly | **需新建** | PAYE + USC + PRSI；无美国式固定加班倍数 |

---

### 2.6 新西兰（NZ）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Repayments Calculator**（期限下拉最长 30 years） | ANZ NZ | 银行 | tools.anz.co.nz/home-loans/repayment-calculator/ |
| **Borrowing Calculator**（How much can I borrow?） | ANZ NZ | 银行 | tools.anz.co.nz/home-loans/borrowing-calculator/ |
| Home loan repayment / borrowing calculator | BNZ | 银行 | bnz.co.nz/personal-banking/home-loans/calculators/home-loan-calculator |
| **TotalMoney home loan calculator**（offset 抵扣省息） | BNZ | 银行 | bnz.co.nz/personal-banking/home-loans/calculators/totalmoney-home-loan-calculator |
| Repayments & structuring / **First home buyer** / Next home calculator | Kiwibank | 银行 | kiwibank.co.nz/personal-banking/home-loans/calculators/ |
| **Choices Floating with Offset calculator** / How much could I borrow? | Westpac NZ | 银行 | westpac.co.nz/home-loans-mortgages/tools-resources/choices-offset-calculator/（403） |
| Borrowing / Mortgage repayment calculator | ASB | 银行 | asb.co.nz/home-loans-mortgages/calculator-repayments.html（连接失败） |
| Mortgage calculator | Trade Me Property | 门户 | secure.trademe.co.nz/c/property/article/how-long-will-it-take-to-pay-off-my-mortgage |
| Mortgage Calculator Repayments NZ / Borrowing Power | Mike Pero | 经纪 | mikepero.co.nz/mortgages/calculators |
| Money planner / tools | **Sorted（Te Ara Ahunga Ora，政府）** | **政府** | sorted.org.nz/tools（WAF 405） |
| **PAYE calculator**（周/双周/4 周/月） | **IRD** | **政府** | ird.govt.nz/employing-staff/deductions-from-income/deductions-from-salary-and-wages/ |
| Income tax calculator / 税率表 / ACC earners' levy rates | IRD | 政府 | ird.govt.nz/income-tax/income-tax-for-individuals/ |

**已核实的本地产品命名**：**Repayments、Borrowing、offset（ANZ "Flexible Home Loan" / BNZ "TotalMoney" / Westpac "Choices Floating with Offset"）、TotalMoney**。

**(b) 必做计算器** —— **① mortgage repayment ② borrowing power ③ offset/revolving credit ④ deposit/LVR ⑤ KiwiSaver first-home 提取**。理由：RBNZ LVR 与 CCCFA 是硬约束；**无印花税**，所以交易税计算器在新西兰不是 table stakes（相对澳洲的成本优势）。

**(c) 核心计算规则（规格）** —— **本轮已大幅补齐（原「几乎全部 UNVERIFIED」已解除）**：

| 维度 | 规则 | 来源 |
| :--- | :--- | :--- |
| 摊还 / 计息 | 常 **30 年**（ANZ 计算器期限下拉最长显示 30 years）；BNZ 计算器假设 principal and interest、利率全期不变、**按日计息** | tools.anz.co.nz/home-loans/repayment-calculator/；bnz.co.nz/.../home-loan-calculator |
| **RBNZ LVR（宏观审慎流量上限）** | **自 2025-12-01**：自住者 LVR **>80%** 的份额上限由 20% 上调至 **25%**；投资者 LVR **>70%** 的份额上限由 5% 上调至 **10%**；并与 **DTI 限制**同步实施；2026-08 复核后维持。（2024-07-01 起为 20%/5%） | rbnz.govt.nz/news-and-events/news/2025/11/reserve-bank-confirms-changes-to-lvr-restrictions 与 .../macroprudential-policy/timeline-for-loan-to-value-ratio-restrictions。**注**：RBNZ 站本轮 403，数值与研究结论来自研究 agent 抓取（并见下文 §6） |
| **CCCFA 责任放贷** | Credit Contracts and Consumer Finance Act 2003：须遵守披露义务、询问用途以确保融资类型适当、**进行负担能力与适当性评估（affordability and suitability assessment）**、签约前协助理解条款、对**高成本贷款（年利率 >= 50%）限制利息与费用**、收取合理信贷与违约费用 | legislation.govt.nz/act/public/2003/52/en/latest/；consumerprotection.govt.nz/.../what-lenders-must-do |
| **offset / revolving（已取得第一方原文）** | **BNZ TotalMoney**：「Every dollar in these accounts offsets your loan, helping you pay it off sooner.」**ANZ Flexible Home Loan** 采用 "jug" 机制，额度填满部分不再计息，但通常**利率更高并收取月费**；Westpac 为 "Choices Floating with Offset" | bnz.co.nz/personal-banking/home-loans/home-loan-types/totalmoney；anz.co.nz/.../flexible-home-loan-transcript/ |
| **交易税** | **无印花税 / 无土地转让税**：Stamp Duty Abolition Act 1999（Public Act 1999 No 61，IRD 主管）已废除印花税 | legislation.govt.nz/act/public/1999/61/en/latest/ |
| **bright-line test（已修正表述）** | 分档依据是**物业出售/取得日期，不是 income-year thresholds**。**2024-07-01 或之后出售**：若 bright-line end date 在 start date 后 **2 年**内即适用。历史档：2021-03-27 或之后取得 -> 新建房 5 年、其他物业 10 年；2018-03-29 至 2021-03-26 取得 -> 5 年。start date 一般为产权登记日，end date 为签订具约束力买卖协议之日；主要自住房、商业物业、农地有排除 | ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test |
| **KiwiSaver 首购提取 / First Home** | **提取**须加入 KiwiSaver **满 3 年**，可提本人/雇主/政府供款及投资收益，**账户须保留 1,000 新元**，自澳大利亚转入资金不可提取。**First Home Grant（原 HomeStart grant）已停止**（Kāinga Ora 不再接受新申请，既有申请继续处理）；**First Home Loan 保留，首付可低至 5%** | ird.govt.nz/kiwisaver/kiwisaver-for-individuals/getting-my-kiwisaver-funds-early/getting-my-kiwisaver-for-my-first-home；hud.govt.nz/news/pre-budget-announcement-new-funding-and-savings |
| **压力测试利率（重要，勿误当法规）** | **RBNZ 不设定统一的 serviceability test rate**；RBNZ 只对 LVR/DTI 设宏观审慎上限。银行的 test rate 属**自身信贷政策**。BNZ 原文：「we used a **'test' interest rate which is higher than our advertised rates**」。**各银行当前具体 test rate 数值未取得** | bnz.co.nz/personal-banking/home-loans/calculators/how-much-can-i-borrow |
| 提前还款 / break fees | CCCFA 框架要求放贷人收取**合理的信贷与违约费用**并公平对待借款人。ANZ 计算器页提到 **Reserve Rate Agreement** 若保留利率未使用/取消可能产生费用；**具体公式 UNVERIFIED**（ANZ 固定利率提前还款说明 PDF 与费用表 PDF 本轮 404） | consumerprotection.govt.nz/.../what-lenders-must-do |
| 薪资（一段，已升级） | ① **PAYE 累进税率（2025-04-01 起）**：0-15,600 -> **10.5%**；15,601-53,500 -> **17.5%**；53,501-78,100 -> **30%**；78,101-180,000 -> **33%**；>180,000 -> **39%**。② **ACC earners' levy**：2025-04-01 至 2026-03-31 为 **1.67%**（含 GST），2026-04-01 起 **1.75%**，2027-04-01 起 1.83%；**计费收入上限（cap）本轮未取得**。③ **KiwiSaver**：雇员税前工资默认/最低 **3.5%**（可选 4/6/8/10%，每 3 个月方可变更一次），雇主最低 3.5%，雇主缴款须计 ESCT。④ **学生贷款**：超过门槛部分 **12%**。⑤ **工时**：新西兰**无一般性法定最高工时**；Employment NZ 要求雇佣协议固定最高工时，全职惯例约 40 小时/周（不含加班）；**加班无全国统一法定倍率**。⑥ IRD 官方 PAYE 计算器支持周/双周/4 周/月，但**不处理** extra pays、tailored tax codes、学生贷款特别扣款率、schedular payments 等 | ird.govt.nz 税率表 / ACC earners' levy rates / PAYE 页 / KiwiSaver employee contributions；employment.govt.nz/hours-and-wages/hours-of-work |
| 税盾（投资房利息） | 自住按揭利息不可扣除；**投资房利息扣除规则近年收紧**（未取得本轮一手条文，**UNVERIFIED**） | - |

**(d) 与现有 10 款的重合度** —— 与澳洲类似但**少一个交易税计算器**：Mortgage **需参数化**（offset/revolving）；Refinance **需参数化**；DSCR / BRRRR / Hard money / 1031 **不适用**；Cap rate **需参数化**；Commercial **需参数化**；Loan comparison **需参数化**；Salary to hourly **需新建**。

---

### 2.7 德国（DE）

**(a) 在售计算器清单（第一方核对，Interhyp 的「Rechner」导航本身就是完整目录）**

| 产品名（德语 / 英文） | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| Baufinanzierungsrechner（房贷总测算） | Interhyp | 经纪 | interhyp.de/baufinanzierung/ |
| **Tilgungsrechner**（摊还 / 还款计划） | Interhyp | 经纪 | interhyp.de/lp/tilgungsrechner/ |
| Budgetrechner / Haushaltsrechner / Kauf- und Mietrechner / Grundbuch- und Notarkostenrechner / Zinsvergleich | Interhyp | 经纪 | interhyp.de/baufinanzierung/ |
| Baufinanzierungsrechner / Baufinanzierung-Zinsvergleich | CHECK24 | 比价 | check24.de/baufinanzierung/ |
| Baufinanzierungs- / Anschlussfinanzierungs- / Umschuldungs- / Forward-Darlehen- / Bauspar-Rechner | Dr. Klein | 经纪 | drklein.de/baufinanzierung.html |
| Schnell-Rechner Neufinanzierung | ING | 银行 | ing.de/baufinanzierung/ |
| Rechner-Hub（Baufinanzierungs- / Tilgungs- / Bauspar-Rechner 等） | Sparkasse | 银行 | sparkasse.de/rechner.html |
| Bausparrechner + Zuteilung / Bewertungszahl 知识页 | Bausparkasse Schwäbisch Hall | 银行（Bausparkasse） | schwaebisch-hall.de/bausparen/wissenswertes/zuteilung.html |

**关键观察**：德国在位者把 **买 vs 租（Kauf-/Mietrechner）、购房附加费（Grundbuch-/Notarkostenrechner）、翻新、估值、Anschlussfinanzierung** 都做成独立计算器 —— 德国市场的「购房总成本 + 固定期到期再融资」是**多计算器组合**，一个 mortgage 页覆盖不了。

**(b) 必做计算器** —— **① Baufinanzierungsrechner（含 Tilgungsplan）② Kaufnebenkostenrechner ③ Kauf-/Mietrechner ④ Anschlussfinanzierung（Zinsbindung 到期再融资）⑤ Sondertilgung 测算**。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 摊还类型 | **Annuitätendarlehen**：每期总还款（Zins + Tilgung）恒定，月供 = 本金 x (名义年利率 + 初始 Tilgung) / 12，利息递减本金递增；**Tilgungsdarlehen**：每期本金恒定、利息递减，月供逐期下降。Tilgungsrechner 明确输出 Zinsbindung 期末 **Restschuld** 与 **Sondertilgung** 影响 | interhyp.de/lp/tilgungsrechner/ |
| Zinsbindung | 固定期常见 **5/10/15 年**；期末 Restschuld 须**再融资（Anschlussfinanzierung）**，是计算器核心输出项 | interhyp.de/lp/tilgungsrechner/ |
| **§489 十年解约权** | 固定利率贷款：**满 10 年**后可终止，须 **6 个月**通知；若固定期在还款期前结束且未另约定利率，则提前 1 个月通知、以固定期末日为终止日。**不得以合同排除或加重** | gesetze-im-internet.de/bgb/__489.html（**已逐字核对**） |
| **提前解约 / Vorfälligkeit** | §490(2) BGB：固定利率 + 不动产抵押贷款，到账满 6 个月后可基于正当利益提前解约，但须赔偿贷方损失（法条未给固定费率公式）。注：§502(3) 的 1% / 0.5% 上限只适用于**一般消费贷款**，按揭不适用该上限 | gesetze-im-internet.de/bgb/__490.html；gesetze-im-internet.de/bgb/__502.html |
| **GrESt** | 联邦 GrEStG §11 基准 **3.5%**，各州可另行立法（区间约 3.5%-6.5%） | gesetze-im-internet.de/grestg_1983/__11.html；**逐州税率 UNVERIFIED** |
| **Notar + Grundbuch** | 费用 = Kostenverzeichnis 倍数 x Tabelle B 金额。已确认 KV 14110 Eintragung Eigentümer = 1.0；KV 14120 Briefgrundschuld = 1.3；KV 14121 sonstiges Recht = 1.0。Tabelle B：Geschäftswert 500,000 EUR 时 1.0 = **935 EUR**（300,000 EUR = 435 EUR；1,000,000 EUR = 1,735 EUR） | gesetze-im-internet.de/gnotkg/anlage_1.html；anlage_2.html。**KV 21201（Kaufvertrag）倍数 UNVERIFIED** |
| Maklerprovision | §656a BGB 中介合同须文本形式；§656c BGB 双方付费须**等额**（买方实际最多承担 50%） | gesetze-im-internet.de/bgb/__656a.html；__656c.html |
| **APR** | 必须按 PAngV 附录的**数学公式**计算，含中介费、账户/支付工具费、必要时的房产评估费 | gesetze-im-internet.de/pangv_2022/__16.html（**已逐字核对**） |
| Bausparen | 法定框架 BauSparkG | gesetze-im-internet.de/bausparkg/；Sparphase/Zuteilung/Bewertungszahl 公式 **SECONDARY** |
| 30/360 计息 | 未找到可引用的一手来源 | **UNVERIFIED** |
| 薪资（一段，已升级） | ① **Lohnsteuer** 由雇主按 EStG §38 源头代扣，税额依 §32a tariff（2026 年 Grundfreibetrag **12,348 EUR**，之后为累进区间与最高档），按 **PAP（Programmablaufplan）**投影到工资周期；另可加 Solidaritätszuschlag / Kirchensteuer。② **2026 社保**：KV 14.6% + Zusatzbeitrag（系统平均 2.9%）、RV 18.6%、AV 2.6%、PV 基础 3.6%（23 岁以上无子女 4.2%），一般雇主雇员各半；雇主单方 Insolvenzgeldumlage 0.15%。③ **无美国式法定加班附加**；§3 ArbZG 每日 8 小时（48 小时/周），可延至 10 小时但须 6 个月内日均 <= 8 小时。④ 月薪发放，Minijob 另有规则。**Beitragsbemessungsgrenzen（缴费上限）本轮 UNVERIFIED** | §32a：gesetze-im-internet.de/estg/__32a.html；§38：gesetze-im-internet.de/estg/__38.html；§3 ArbZG：gesetze-im-internet.de/arbzg/__3.html；社保费率：aok.de/.../beitragssaetze/；BMF 计算器：bmf-steuerrechner.de |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需新建（引擎）** | 必须支持 Annuität vs Tilgung 两种模式与 Zinsbindung 分段 |
| Refinance break-even | **需新建** | 德国对应 **Anschlussfinanzierung**（固定期结束时再融资），不是「降息再贷」 |
| DSCR / BRRRR / Hard money / 1031 | **不适用** | 无对应制度 |
| Cap rate / cash flow | **需参数化** | 租金收益率概念通用，税/费层不同 |
| Commercial loan + balloon | **需参数化** | 常见 |
| Loan comparison | **需参数化** | 必须按 PAngV §16 的 effektiver Jahreszins |
| Salary to hourly | **需新建** | 月度工资 + 工资税/社保代扣；工时规则不同 |

---

### 2.8 荷兰（NL）

**(a) 在售计算器清单**

| 产品名（荷文 / 英文） | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| NHG toets / Keuzehulp inkomen / Rekenhulp verduurzamen | **NHG** | 准政府担保机构 | nhg.nl/ |
| Hypotheek maandlasten calculator（月供） | Independer | 比价 | independer.nl/hypotheek/info/maandlasten |
| Hoeveel kan ik lenen?（maximale hypotheek） | De Hypotheker | 经纪 | hypotheker.nl/zelf-berekenen/hoeveel-kan-ik-lenen/ |
| Can I afford this house? | De Hypotheker | 经纪 | hypotheker.nl/en/calculators-and-checks/can-i-afford-this-house/ |
| 消费者按揭工具与知识页 | **AFM** | 政府/监管 | afm.nl/nl-nl/consumenten/themas/hypotheken |
| Eigenwoningforfait 计算表 | Belastingdienst | 政府（税务） | belastingdienst.nl/.../hoe-werkt-eigenwoningforfait |

Rabobank 与 ABN AMRO 的 Hypotheek berekenen 本轮返回 403/503，其产品清单为 **SECONDARY**。

**(b) 必做计算器** —— **① woonlasten / hypotheeklasten ② maximale hypotheek（toetsinkomen）③ annuitair vs lineair 对比 ④ NHG 保费/上限 ⑤ overdrachtsbelasting**。理由：还款类型选择直接改变月供曲线与税盾资格；NHG 是准公共担保。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 摊还类型 | **annuitair**（每期总额恒定，年金公式）、**lineair**（本金恒定、还款递减）、**aflossingsvrij**（仅付息）。税盾资格与还款类型绑定 | afm.nl/nl-nl/consumenten/themas/hypotheken |
| **NHG 上限与保费（2026）** | 上限由 450,000 EUR 升至 **470,000 EUR**；含附加节能措施的贷款上限再高 6%，即 **498,200 EUR**；一次性 borgtochtpremie **0.4%**。（2026 年起 woonwagen 与 standplaats 合计亦为 470,000 EUR；betaalbaarheidsgrens 为 420,000 EUR） | volkshuisvestingnederland.nl/actueel/nieuws/2025/10/08/nhg-grens-stijgt-naar-470.000-euro-afsluitpremie-blijft-04 |
| **hypotheekrenteaftrek / tariefsaanpassing** | 2026：应税收入（扣除前）超 **78,426 EUR**（2025 为 76,817 EUR）时，tariefsaanpassing 为 **11.94%**，最高档利息扣除率被限制为 **37.56%**（2025 为 37.48%） | belastingdienst.nl/.../tariefsaanpassing-eigen-woning |
| **eigenwoningforfait（2026）** | 0% <= 12,500 EUR；0.10%（12,500-25,000）；0.20%（25,000-50,000）；0.25%（50,000-75,000）；0.35%（75,000-1,350,000）；超过 1,350,000 = 4,725 EUR + 超出部分 2.35% | belastingdienst.nl/.../hoe-werkt-eigenwoningforfait |
| **overdrachtsbelasting** | 自住自用住宅 **2%**；非自住住宅自 **2026 年起 8%**（2025 年该类为较高档）；其他不动产（土地、商业物业等）**10.4%** | belastingdienst.nl/.../tarieven_overdrachtsbelasting/ |
| **startersvrijstelling** | 购房者成年且**未满 35 岁**（以公证交付签署时点为准）、所购为长期自住住宅等条件，免缴转让税 | belastingdienst.nl/.../startersvrijstelling/ |
| LTV / toetsinkomen | Tijdelijke regeling hypothecair krediet（BWBR0032503）：§1 定义 toetsinkomen；Art. 2 非固定收入可用最近 **3 年 / 36 个月**平均；Art. 3/3a 规定 financieringslastpercentages；Artikel 5 规定贷款额/房价上限。**Artikel 5 具体百分比 UNVERIFIED** | wetten.overheid.nl/BWBR0032503/2025-01-01/0 |
| toetsrente | 考核利率取决于所选固定期，须高于合同利率 | **UNVERIFIED**（行业/贷方口径） |
| notariskosten | 官方公证人门户有费用章节 | **UNVERIFIED** |
| 薪资（一段） | 雇主代扣 **loonheffing**（个税 + 国民保险合并，按 Belastingdienst rekenvoorschriften / 年度税率表）；8% vakantiegeld 为惯例；月薪发放 | download.belastingdienst.nl/.../rekenvoorschriften_voor_geautomatiseerde_loonadministratie_lh991z62fd.pdf |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 | 说明 |
| :--- | :--- | :--- |
| Mortgage | **需新建（引擎）** | annuitair/lineair/aflossingsvrij 三种公式 + toetsrente |
| Refinance break-even | **需参数化** | 荷兰再融资普遍 |
| DSCR / BRRRR / Hard money / 1031 | **不适用** | - |
| Cap rate / cash flow | **需参数化** | 税盾与转移税影响 |
| Commercial loan + balloon | **需参数化** | 常见 |
| Loan comparison | **需参数化** | APRC + NHG 有无 |
| Salary to hourly | **需新建** | 月度工资 + loonheffing |

---

### 2.9 法国（FR）

**(a) 在售计算器清单**

| 产品名（法文 / 英文） | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| Simulateur capacité d'emprunt / Simulateur mensualités / Simulateur de prêt immobilier | CAFPI | 经纪 | cafpi.fr/credit-immobilier/ |
| Simulation de prêt immobilier / calcul de mensualités | Meilleurtaux | 比价 | meilleurtaux.com/credit-immobilier/ |
| **Calculer les frais de notaire**（公证费计算器） | **service-public.fr** | **政府** | service-public.gouv.fr/particuliers/vosdroits/R54267 |
| Simulateur de l'impôt sur le revenu | impots.gouv.fr (DGFiP) | 政府 | impots.gouv.fr/simulateur-de-limpot-sur-le-revenu |
| **Simulateur salaire brut/net** | URSSAF Mon-entreprise | 政府 | mon-entreprise.urssaf.fr/ |
| PTZ 资格说明页 | service-public.fr | 政府 | service-public.gouv.fr/particuliers/vosdroits/F10871 |
| Assurance emprunteur 说明页 | service-public.fr | 政府 | service-public.gouv.fr/particuliers/vosdroits/F1671 |
| **Taux d'usure 季度公布** | Banque de France | **央行** | banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2 |

**(b) 必做计算器** —— **① mensualité ② capacité d'emprunt ③ frais de notaire ④ assurance emprunteur ⑤ TAEG / 贷款比较 ⑥ PTZ 资格**。理由：frais de notaire 是法国购房附加费主体；assurance emprunteur 是事实必需项。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 摊还 | 等额月供（mensualité constante）：月供 = 本金 x i / (1 - (1+i)^-n)，i = 名义年利率/12，n = 月数；taux nominal 与 **TAEG** 是两个口径 | **UNVERIFIED**（legifrance 403） |
| **taux d'usure** | Banque de France 按季度公布各类贷款（含 immobilier）的利率上限 | banque-france.fr/.../taux-dusure-2026-q2（页面存在；**具体数值 UNVERIFIED**） |
| **IRA（提前还款补偿金）—— 已证实** | 补偿金上限为「提前偿还本金按贷款平均利率计算的 **6 个月利息**」与「提前还款前剩余本金的 **3%**」中的较高者；浮动利率可另加 intérêts compensateurs | service-public.gouv.fr/particuliers/vosdroits/F1669 |
| frais de notaire | 官方有「公证费是什么」专页与计算器 | service-public.gouv.fr/.../F17701；R54267。**「ancien 约 7-8% / neuf 约 2-3%」UNVERIFIED** |
| PTZ | 官方确认四类适用情形：购置 neuf（竣工不满 5 年、首次入住）、购置 ancien、购置现住 logement social、将非住宅改造为住宅 | service-public.gouv.fr/particuliers/vosdroits/F10871。**收入上限/额度/zone UNVERIFIED** |
| assurance emprunteur | 官方有专页 | service-public.gouv.fr/particuliers/vosdroits/F1671。**按年龄费率、Loi Lemoine 转换权 UNVERIFIED** |
| HCSF | 债务率 <= 35%、期限 <= 25 年 | **UNVERIFIED**（economie.gouv.fr/hcsf 与 legifrance 均 403） |
| 薪资（一段） | 社保分摊按 URSSAF 规则（官方 Mon-entreprise 模拟器可算）；个税自 2019 年实行 **prélèvement à la source（PAS，源头代扣）**，雇主按 DGFiP 税率每月代扣、年度清算；法定每周 **35 小时**（加班起算基准） | code.travail.gouv.fr/fiche-ministere-travail/la-duree-legale-du-travail；mon-entreprise.urssaf.fr/；impots.gouv.fr/simulateur-de-limpot-sur-le-revenu |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 |
| :--- | :--- |
| Mortgage | **需新建（引擎）**：mensualité + assurance emprunteur + TAEG |
| Refinance break-even | **需参数化**：加入 IRA |
| DSCR / BRRRR / Hard money / 1031 | **不适用** |
| Cap rate / cash flow | **需参数化** |
| Commercial loan + balloon | **需参数化** |
| Loan comparison | **需新建/需参数化**：法国比的是 **TAEG**，不是美国 TIP |
| Salary to hourly | **需新建**：净工资（salaire net）+ 社会分摊；35 小时法定工时 |

---

### 2.10 日本（JP）

**(a) 在售计算器清单（第一方核对，来源：住宅金融支援机构 JHF 的「ローンシミュレーション」）**

| 产品名（日语 / 英文） | 提供方 | 类型 |
| :--- | :--- | :--- |
| **資金計画シミュレーション**（资金计划 / 生活资金） | **住宅金融支援機構（JHF）** | **政府住房机构** |
| **返済プラン比較シミュレーション**（多机构 x 多利率类型对比） | JHF | 政府 |
| **毎月の返済額から借入可能額を調べる**（由月供反推可借额度） | JHF | 政府 |
| **借入金額から毎月の返済額を調べる**（由借款额算月供） | JHF | 政府 |
| **現在の年収から借入可能額を調べる**（由年收入算可借额度） | JHF | 政府 |
| **機構団信特約制度 特約料シミュレーション**（团体信用寿险特约费） | JHF | 政府 |
| **借換えシミュレーション**（借换/再融资） | JHF | 政府 |
| **返済方法変更シミュレーション**（变更还款方式） | JHF | 政府 |
| **らくらく診断**（ダブルフラット 适用性 + 月供） | JHF | 政府 |
| 住宅ローンシミュレーター（App） | JHF | 政府 |

来源：flat35.com/simulation-info/index.html（导航逐项核对）。

**(b) 必做计算器** —— **① 月供（元利/元金/ボーナス払い）② 借入可能額（年收基准）③ 繰上返済 ④ 諸費用 ⑤ 住宅ローン控除 ⑥ 借換え**。理由：JHF 自己就把这几类全部做成独立模拟器；**繰上返済**与**住宅ローン控除**是核心决策点。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 摊还类型（已升级） | **元利均等返済**：月供 M = P x i x (1+i)^n / ((1+i)^n - 1)（i = 年利率/12，n = 月数）；**元金均等返済**：第 k 月 = P/n + 剩余本金 x i（月供递减，总还款更少但初期更重）。另有 **ボーナス払い**：借款意向额的 **40% 以内**可作为每 6 个月一次的奖金还款。フラット35 模拟器期限 **15-35 年**（60 岁以上可选 10-14 年） | 元利/元金定义：smbc.co.jp/kojin/money-viva/kihon-no-ki/0027/；期限与ボーナス 40%：flat35.com/simulation/simu_01.html |
| 利率结构 / 期限 | 変動金利 vs 固定金利；**フラット35** 为最长 **35 年全期固定**，由 JHF 提供；**フラット35 不适用于投资用房** | flat35.com/（上游 §3.1） |
| **団信（团体信用生命保险）** | 借款人死亡/高度障害时偿清贷款；フラット35 通常**必须加入**，成本内含于利率或特约料 | JHF 导航「団体信用生命保険」+ 上游 §3.1 |
| 繰上返済（已升级） | 两种方式：① 期間短縮（月供不变、缩短期间）；② 返済額減少（期间不变、减少月供）。全额提前还款原则上无手续费但可能收「経過利息」。银行实例（SMBC，2025-03-10）：网银免费；柜台书面 全额 **33,000 円**、一部 **16,500 円**。JHF 另有「繰上返済制限制度」，触发时收违约金，**具体百分数 UNVERIFIED** | jhf.go.jp/hensai/kuriage/index.html；smbc.co.jp/kojin/jutaku_loan/simulation/ |
| **住宅ローン控除** | 按**年末贷款余额**计算；按住宅类别（认定住宅 / ZEH水準省エネ / 省エネ基準適合 / その他）区分**借入限度額**与**控除期間**；适用居住年份为 **令和4年1月1日 - 令和12年12月31日** | nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1211-1.htm（**已核对正文结构**）；索引 nta.go.jp/taxes/shiraberu/taxanswer/code/bunya-tochi-tatemono.htm |
| 交易税费（已升级） | **印紙税**：不动产买卖契约书按金额分级（1,000万円超-5,000万円以下 = 2万円；5,000万円超-1億円以下 = 6万円），对不动产转让契约书适用轻减税率（至令和9年3月31日）。**登録免許税**：土地买卖移转本则 20/1000、轻减 15/1000（至令和11年3月31日）；建物保存 4/1000、买卖移转 20/1000。**不動産取得税**（都道府县税）：本则 4%、住宅及土地特例 3%（至令和9年3月31日），新筑住宅课税标准扣除 1,200万円。**仲介手数料**：法定上限见昭和45年建設省告示第1552号（通行速算式 3% + 6万円 + 消费税） | 印紙税：nta.go.jp/taxes/shiraberu/taxanswer/inshi/7140.htm 与 /inshi/7108.htm；登録免許税：nta.go.jp/taxes/shiraberu/taxanswer/inshi/7191.htm；不動産取得税：soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/149767_11.html；仲介手数料法源：mlit.go.jp/totikensangyo/const/1_6_bt_000267.html |
| 薪资（一段，已升级） | 月给制。① **源泉所得税**按「給与所得の源泉徴収税額表」月额表（甲/乙欄）代扣，加复兴特别所得税，年末調整清算，住民税自 6 月起由雇主代扣。② **給与所得控除**（令和8/9年分）：<=220万 -> 74万；220-360万 -> 30%+8万；360-660万 -> 20%+44万；660-850万 -> 10%+110万；>=850万 -> 195万上限。③ **厚生年金 18.3%**（各半 9.15%），按标准报酬月额（88,000-650,000 円，32 等级），标准赏与额上限 150万円。④ 健康保险按都道府县费率（协会けんぽ，**具体费率 UNVERIFIED**）。⑤ 法定工时 **1日8小时 / 1周40小时**；加班 25%/35%/50%（**具体条文 UNVERIFIED**） | 源泉徴収税額表：nta.go.jp/publication/pamph/gensen/zeigakuhyo2024/02.htm；給与所得控除：nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm；厚生年金：nenkin.go.jp/service/kounen/hokenryo/hoshu/20150515-01.html |

**(d) 与现有 10 款的重合度**

| 现有计算器 | 判定 |
| :--- | :--- |
| Mortgage | **需新建（引擎）**：元利/元金、ボーナス払い、団信、35 年 |
| Refinance break-even | **需参数化**：日本「借換え」非常普遍，JHF 有专门模拟器 |
| DSCR rental loan | **不适用**（フラット35 明令不可投资用） |
| Cap rate / cash flow | **需参数化** |
| BRRRR / Hard money / 1031 | **不适用** |
| Commercial loan + balloon | **需参数化** |
| Loan comparison | **需新建/需参数化**：比的是实质年率与总返済额 |
| Salary to hourly | **需新建**：月给 + 社会保险；不是美国时薪产品 |

---

### 2.11 印度（IN）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Home Loan EMI Calculator** | HDFC Bank | 银行 | homeloans.hdfc.bank.in/ |
| **Home Loan Eligibility Calculator** | HDFC Bank | 银行 | 同上 |
| **Check Affordability**（购房预算） | HDFC Bank | 银行 | 同上 |
| **Home Loan Balance Transfer Calculator** | HDFC Bank | 银行 | 同上 |
| Interest Subsidy Scheme (ISS) / **PMAY (U) 2.0** | HDFC + 政府 | 银行 + 政府 | 同上（导航项） |
| NRI Housing Loans / Loan Against Property / Top Up | HDFC Bank | 银行 | 同上 |
| BankBazaar / Paisabazaar 比价计算器 | 门户 | lead-gen | 上游 §8 |

**已核实的本地产品命名**：**EMI、eligibility、affordability、balance transfer、interest subsidy / PMAY** —— 与英文圈完全不同的产品族。

**(b) 必做计算器** —— **① EMI ② eligibility/affordability ③ prepayment ④ stamp duty & registration（州）⑤ tax benefit（Sec 24(b) / 80C）⑥ balance transfer**。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **EMI 公式** | EMI = P x r x (1+r)^n / ((1+r)^n - 1)，r = 年利率/12，**月度复利**，n = 月数；总利息 = EMI x n - P。标准期限常 20-30 年 | 实现参照 HDFC（homeloans.hdfc.bank.in/home-loan-emi-calculator）、SBI（sbi.bank.in/web/personal-banking/loans/calculators）、ICICI、Bajaj Finserv 的 EMI 计算器 |
| 利率结构（已升级） | 自 2019-10-01 起，新增浮动利率零售贷款必须挂钩外部基准之一：**RBI 政策回购利率**、**3 个月印度国债收益率（FBIL）**、**6 个月国债收益率**或 FBIL 其它基准；同一贷款类别内基准须统一。利差可自定，但信用风险溢价仅在信用评估实质变化时调整，其它组成**每 3 年**才可调；**外部基准利率至少每 3 个月重置一次** | RBI/2019-20/53（2019-09-04）：rbi.org.in/Scripts/NotificationUser.aspx?Id=11677 |
| **税盾** | Sec **24(b)**：自住房贷利息扣除（旧税制有上限）；Sec **80C**：本金偿还（有上限）；新税制多数优惠取消 | incometaxindia.gov.in/w/various-deductions-under-the-income-tax-act（上游 §3.1）；**条文页本轮 403** |
| 交易税 / 补贴 | **印花税与注册费由州决定**（差异极大；马哈拉施特拉通行 5% 城市 / 4% 农村 + 1% 登记费，**SECONDARY**）。**PMAY-CLSS 已结束**：MIG 类 2021-03-31、EWS/LIG 类 2022-03-31；历史最高补贴 2.67 lakh 卢比/户；现行为 PMAY-U 2.0 | PMAY：pib.gov.in/PressReleaseIframePage.aspx?PRID=2147921 |
| 保险 | 房贷保险非强制；**CIBIL 评分**决定可得性与利率 | 上游 §3.1 |
| 提前还款（已升级） | **RBI (Pre-payment Charges on Loans) Directions, 2025**（RBI/2025-26/64，2025-07-02）：对**所有浮动利率贷款**，非经营性个人贷款**不得收取提前还款费**；经营性个人/MSE 贷款多数亦不得收取（SFB/RRB/LAB 有例外）。自 **2026-01-01** 起适用于当日或之后发放/续做的贷款 | rbi.org.in/Scripts/BS_CircularIndexDisplay.aspx?Id=12878 |
| 薪资（一段） | **CTC / 月薪**结构；需要 take-home / CTC breakup 计算器，而非美国式年薪转时薪。① 所得税按年度累进税率按月 **TDS 预扣**（Income-tax Act s.192），新制为默认；② **EPF**：雇员 12%（basic+DA）、雇主 12%（其中 8.33% 入 EPS）、工资上限 15,000 卢比/月（**SECONDARY**，EPFO 被拦）；③ 法定工时 8 小时/日、48 小时/周（Factories Act 1948），加班 2 倍（**部分 UNVERIFIED**）；④ 按月发薪 | PIB 新制门槛：pib.gov.in/Pressreleaseshare.aspx?PRID=2098406 |

**(d) 与现有 10 款的重合度** —— Mortgage **需参数化**（EMI 数学相同，但须加税盾与州印花税）；Refinance **需参数化**（叫 balance transfer）；DSCR **不适用**；Cap rate **需参数化**；BRRRR / Hard money / 1031 **不适用**；Commercial **需参数化**；Loan comparison **需参数化**；Salary to hourly **需新建**（改为 CTC/take-home）。

---

### 2.12 新加坡（SG）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **MyHome Planner**（可负担性 + 现金流时间线报告） | DBS | 银行 | dbs.com.sg/personal/landing/loans/homeloans/calculate-loans.html |
| **Home Loan Repayment Calculator**（逐月还款表） | DBS | 银行 | 同上 |
| **Home Loans Savings Calculator**（换贷节省） | DBS | 银行 | 同上 |
| **Renovation Loan Calculator** | DBS | 银行 | 同上 |
| **Buyer's Stamp Duty (BSD)** 与 **Additional BSD (ABSD)** 税率与计算 | **IRAS** | **政府** | iras.gov.sg/quick-links/tax-rates/stamp-duty；iras.gov.sg/taxes/stamp-duty/for-property/.../additional-buyer's-stamp-duty-(absd) |

**关键已核实事实**：DBS 页面明确以「**medium-term 3.5% interest rate**」作为压力测试假设 —— 即 TDSR 压力利率是新加坡计算器的**必备输入**。

**(b) 必做计算器** —— **① repayment ② affordability（TDSR + MSR + LTV 三重校验）③ stamp duty（BSD + ABSD）④ CPF OA 使用 ⑤ refinance savings**。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **TDSR / MSR（已升级）** | **TDSR <= 55%** gross monthly income（含本次贷款的全部月度债务）。**MSR <= 30%**，仅适用于 **HDB 组屋与未过最低居住期的 EC**，公式 =（所有房产贷款月供 / 月总收入）x 100% | MAS explainer：mas.gov.sg/regulation/explainers/new-housing-loans/msr-and-tdsr-rules；法源 MAS Notice 645 / 632 |
| LTV / 年限 | **HDB 最长 30 年、私宅 35 年**；**HDB 超过 25 年（私宅超过 30 年）时最高贷款额可能降至房价 55%**；LTV 另按贷款笔数分档 | DBS：dbs.com.sg/personal/landing/loans/homeloans/calculate-loans.html；法源 MAS Notice 632 |
| **压力测试利率（已升级）** | TDSR 计算须使用 **4% 年利率下限**（或银行现行利率，取较高者） | MAS 国会答复：mas.gov.sg/news/parliamentary-replies/2022/reply-to-parliamentary-question-on-setting-total-debt-servicing-ratio-medium-term-interest-rate-floor-at-4-per-cent-per-annum |
| HDB concessionary loan | 利率锚定 **CPF OA 利率 + 0.1%**（当前 OA 2.5% -> HDB 2.6%） | **SECONDARY**（法源为 HDB/CPF 联合新闻稿，本轮未抓到原文句） |
| **BSD / ABSD（已升级）** | **BSD**：自 2023-02-15 起住宅最高边际 **6%**；首 180,000 新元 **1%**、次 180,000 **2%**，其后 3%/4%/5%，超 200 万部分 **6%**（非住宅最高 5%）。**ABSD**：自 2023-04-27 起 **公民第 2 套 20%、第 3 套及以上 30%；PR 第 2 套 30%、第 3 套及以上 35%；外国人任何住宅 60%；实体/信托 65%**（公民/PR 首套 0%/5%，**首套两行取自 IRAS 全表，本轮部分 UNVERIFIED**） | BSD：iras.gov.sg/taxes/stamp-duty/for-property/buying-or-acquiring-property/buyer-s-stamp-duty-(bsd)；ABSD：iras.gov.sg + MND 2023-04-26 新闻稿 |
| CPF OA | 可用普通账户支付首付与月供；**卖出/转让房产时须退还已用 CPF OA 本金加上累计利息（accrued interest）** | cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home/cpf-refund-when-selling-or-transferring-property |
| 提前还款 | 银行贷款通常无罚，但有 lock-in clawback | **UNVERIFIED** |
| 薪资（一段，已升级） | ① 个税**累进**、居民最高 **24%**、首 20,000 新元 0%；**雇主不代扣**（新加坡无 PAYE），雇员自行申报（计算器用 IRAS 税率表）；② **CPF**：55 岁及以下雇员 **20%** + 雇主 **17%**，按 Ordinary Wage 上限 **7,400 新元/月**与 Additional Wage 上限 **102,000 新元**计费；③ 法定工时 **每周 44 小时**，加班 **1.5 倍**（Part 4 适用人群：非劳务者月薪 <=2,600、劳务者 <=4,500） | CPF 缴款率表：cpf.gov.sg；MOM：mom.gov.sg/employment-practices/salary/calculate-overtime-pay |

**(d) 与现有 10 款的重合度** —— Mortgage **需新建（引擎）**：TDSR/MSR/LTV 三重校验 + CPF + 压力利率；Refinance **需参数化**（DBS 已有 savings calculator，是本地标配）；DSCR **部分适用**（商业地产）；Cap rate **需参数化**；BRRRR / Hard money / 1031 **不适用**；Commercial **需参数化**；Loan comparison **需参数化**；Salary to hourly **需新建**（CPF）。

---

### 2.13 阿联酋（UAE）

**(a) 在售计算器清单** —— **产品清单仍 UNVERIFIED**：emiratesnbd.com 与 adcb.com 均返回 **Cloudflare 403**；但**规则侧本轮已取得 CBUAE Rulebook 与 Dubai Land Department 的一手页面**（见 (c)）。

| 产品（预期） | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| Home Loan Offers / "Calculate your eligibility" 资格计算器 | Emirates NBD | 银行 | emiratesnbd.com/en/campaigns/mortgage/ |
| **Key Facts Statement – Home Loan Fixed & Variable**（含 APR、EMI 算例） | Emirates NBD | 银行 | emiratesnbd.com/en/kfs/home-loan-fixed-and-variable-interest-rate |
| **Mortgage Calculator** | First Abu Dhabi Bank (FAB) | 银行 | bankfab.com/en-ae/personal/mortgages/mortgage-calculator |
| Mortgage Calculator + Loan Comparison calculator | Mashreq NEO | 银行 | mashreq.com/uae/neo/loans/mortage-loans/home-loan-residents/ |
| **Rent vs Buy Calculator** | Property Finder | 门户 | propertyfinder.ae/en/rent-vs-buy-calculator |
| Mortgage Calculator | PRYPCO | 经纪 | prypco.com/mortgage-calculator/ |
| **Registering the Sale of a Mortgaged Property / Grant property mortgage**（官方 DLD 费用明细） | **Dubai Land Department** | **政府** | dubailand.gov.ae/en/eservices/registering-the-sale-of-a-mortgaged-property/ |
| **Online Gratuity Calculator**（离职金） | Dubai Development Authority | **政府** | dda.gov.ae/en/gratuity-calculator/gratuity-calculator |

预期产品族：**monthly payment、affordability / DBR、home loan transfer（转贷）、early settlement fee、Dubai transfer fee (DLD 4%)**。

**(b) 必做计算器** —— **① monthly payment ② affordability under DBR 50%（退休者 30%）③ 收入倍数上限（国民 8 年收入 / 外籍 7 年收入）④ 交易与抵押登记费（DLD）⑤ early settlement 费**。

**(c) 核心计算规则（规格）** —— **数值已记录，但来源状态为「待独立复核」**（见下方注记，非 UNVERIFIED 亦非已核实）：

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **LTV（按国籍 × 价格带 × 用途）** | **本国国民**：首套 <=AED 5m = **85%**、>AED 5m = **75%**；第二套/投资 = **65%**。**外籍**：首套 <AED 5m = **80%**、>AED 5m = **70%**；第二套/投资 = **60%**。**off-plan 一律 50%**（不分国籍/类别） | CBUAE Rulebook Art. 3.4：rulebook.centralbank.ae/en/rulebook/article-3-important-ratios |
| **期限 / 年龄** | 最长 **25 年** | 同上 |
| **收入倍数上限** | 最高融资 = 本国国民 **8 年**年收入；**外籍 7 年**年收入（**注意：不是 8x**） | 同上 |
| **DBR** | 债务负担率上限 **50%**（**退休者 30%**） | 同上 |
| **压力测试** | 在贷款利率之上加 **2-4 个百分点**做压力测试 | 同上 |
| **利率结构（已取得 KFS 算例）** | 可变利率挂 **EIBOR + 固定息差**，可选挂 **1 个月或 6 个月 EIBOR**（分别每月/每半年重定价）。还款须按 **reducing balance**，频率**不低于每季**。Emirates NBD 首方算例：贷款 AED 800,000 / 25 年 / 1M EIBOR 0.25% + 息差 1.89% = 2.14%，EMI **AED 3,446**；含 1.05% 手续费后 **APR 2.22%** | 期限/reducing balance 见 CBUAE Art. 3；算例见 emiratesnbd.com/en/kfs/home-loan-fixed-and-variable-interest-rate |
| 工资 / 离职金 | UAE **无个人所得税**（故**无房贷利息抵税**），**无强制全国性社保**；私营部门雇员**离职金**：满 1 年不满 5 年 = 每年 **21 天**基本工资，满 5 年后 = 每年 **30 天**，总额**不超过 2 年工资**，仅以**基本工资**为基数。标准工时 **每日 8 小时 / 每周 48 小时**，加班上限每日 2 小时，加班费 **+25%**，22:00-04:00 加班 **+50%**。月薪制通行，按 **月薪 x 12** 年化 | u.ae/en/information-and-services/finance-and-investment/taxation；beta.government.ae/.../end-of-service-benefits-for-employees-in-the-private-sector；u.ae/.../working-hours |
| **提前结清费** | 上限为**未偿余额的 1% 或 AED 10,000，取较小者**（Appendix 2，home loans #35；部分结清 #41 同一上限） | CBUAE Appendix 2：rulebook.centralbank.ae/en/rulebook/amendments-appendix-2-regulation-no-292011-regulations-regarding-bank-loans-other-services |
| **Dubai 交易登记费** | 买卖登记 **售价的 4%** + registrar fee（价格 **>=AED 500,000 为 AED 4,200**，**低于则为 AED 2,100**）+ **AED 10 knowledge + AED 10 innovation**；抵押登记 **按揭金额的 0.25%**；**抵押注销 AED 525 + 登记员 AED 315**；同日办理抵押可免登记员费，隔日另收 AED 4,000 + VAT。（迪拜**经纪佣金约 2%** 仅见聚合来源，标 **SECONDARY**） | dubailand.gov.ae/en/eservices/registering-the-sale-of-a-mortgaged-property/；dubailand.gov.ae/en/eservices/grant-property-mortgage/ |
| 税 | **无按揭利息抵税** | - |

> **注（来源状态：待独立复核 / NOT independently verified）**：上述数值系研究 agent 声称从其列出的 Rulebook URL 抓取。**本仓库的复核者随后对同一 URL 实测，返回 HTTP 403 Forbidden**，因此这些数字**无法被独立复现**。
>
> 这不构成「已核实」：一个来源若无法被第二方重新取得，就不能仅凭抓取方自述而解除 UNVERIFIED 标记。实施阿联酋规则前必须在可访问网络上重新取证。
>
> 其余市场若出现同类情况（仅由单一 agent 声称抓取、他人无法复现），按同一标准处理：**标注为「待独立复核」，不计入已核实。**
>
> **实现注意（边界）**：LTV 在「恰为 AED 5m」处的归属，来源表述为国民「<=AED 5m」、外籍「<AED 5m」，两侧不等号不一致。实现时必须向监管文本确认 5m 整点的归属，否则会产生 5-10 个百分点的 LTV 跳变。

**(d) 与现有 10 款的重合度** —— Mortgage **需参数化**（关键差异是 **LTV 与收入倍数按国籍分档**）；Refinance（transfer）**需参数化**；DSCR **部分适用**（UAE 商业地产有 DSCR 概念）；Cap rate **适用**（迪拜租赁收益率热门）；BRRRR / Hard money / 1031 / Commercial balloon **基本不适用或需新建**；Salary to hourly **不适用**（月薪 + gratuity）。

---

### 2.14 中国香港（HK）

**(a) 在售计算器清单**

| 产品 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| 按揭計算機 – 每月還款額 / 可負擔貸款額 / Mortgage-Link 計算機 | 恒生銀行 | 银行 | hangseng.com/zh-hk/personal/mortgages/mortgage-calculators/ |
| 按揭貸款 – 每期供款額計算機 / 「置理想」按揭計劃計算機 | 中銀香港 (BOCHK) | 银行 | bochk.com/tc/more/calculators.html |
| **Mortgage Repayment Calculator**（含 Stress Test Assumption 输入项） | **HKMA** | **政府** | hkma.gov.hk/eng/smart-consumers/mortgages/ |
| Repayment calculator | HSBC | 银行 | broking.hsbc.com.hk/zh-hk/mortgages/repayment-calculator/（DNS 解析失败） |
| 按揭計算機（含按揭保費、負擔能力測試、住宅/非住宅） | 28Hse | 门户 | 28hse.com/mortgage/ |
| Calculator | 中原按揭 | 经纪 | centamortgage.com/v2/Calculator |
| 經絡按揭計算機（含按保表、印花稅費率） | mReferral | 经纪 | mreferral.com/（403） |
| **Mortgage Insurance Programme（按保）** | **HKMC** | **准政府** | hkmc.com.hk/eng/our_business/mortgage_insurance_programme.html |
| 印花税（AVD） | **IRD** | **政府** | ird.gov.hk/eng/faq/avd.htm（**完整档位已核对**） |

**(b) 必做计算器** —— **① 每月供款 ② LTV / DSR 资格（70% / 50%）③ 按保（MIP）保费 ④ 印花税（AVD）⑤ 提前还款/罚息测算**。
> **重要更正**：**加息 +200bp 压力测试目前处于暂停状态**，资质审核以 **DSR（供款占入息比率）**为主，**没有 60% 受压 DSR 的要求在生效**。因此「压力测试计算器」在香港当前**不是** table stakes，把它做成主打功能会反映过时的监管口径。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| **LTV / DSR（已核实）** | 2024-10-16 起：所有住宅 **最高 LTV 一律 70%**（不论价值、不论是否自用）；**资产（net worth）基础审批的 LTV 由 60% 上调至 70%**（住宅与非住宅均适用）；**DSR 上限统一为 50%**（非自用由 40% 上调至 50%）；**对已持有其他按揭的申请人「LTV 与 DSR 各减 10 个百分点」的要求被取消**。调整后住宅与非住宅**统一为 LTV 70% / DSR 50%** | hkma.gov.hk/eng/news-and-media/press-releases/2024/10/20241016-4/（**已逐条核对**：(1)(2)(3)(4) 四点） |
| **压力测试（已更正）** | HKMA 2024-02-28 通函**暂停**「假设按揭利率上升 200 个基点」的利率压力测试要求；此后审批以 DSR 为主，**无 60% 受压 DSR 要求** | HKMA 通函（PDF，2024-02-28）：brdr.hkma.gov.hk/eng/doc-ldg/docId/getPdf/20240228-3-EN/20240228-3-EN.pdf（**我方抓取为 PDF，未能解析文本**；另有中文媒体对该暂停的报道，属 SECONDARY） |
| 利率结构 | **H 按** = 1M HIBOR + 息差，或按计划封顶利率，**取低**；**P 按** = 银行最优惠利率 - 息差。HIBOR 波动大，通常设 cap。**「P - 1.75% / P - 2%」这两个具体息差档位未获一手确认（SECONDARY）** | HKMA 按揭页 Note 2：hkma.gov.hk/eng/smart-consumers/mortgages/ |
| **印花税 AVD（已更正：2026 年改表）** | **自 2026-02-26 起**：住宅适用 **Part 1 of Scale 1 与 Scale 2（两者相同）**；**非住宅新设 Scale 3**（此前非住宅用 Scale 2）。住宅档位（Part 1 Scale 1 = Scale 2）：<=$4,000,000 = $100；$4,000,001-$4,323,780 = $100 + 超出部分的 20%；$4,323,781-$4,500,000 = 1.50%；$4,500,001-$4,935,480 = $67,500 + 10%；$4,935,481-$6,000,000 = 2.25%；$6,000,001-$6,642,860 = $135,000 + 10%；$6,642,861-$9,000,000 = 3.00%；$9,000,001-$10,080,000 = $270,000 + 10%；$10,080,001-$20,000,000 = 3.75%；$20,000,001-$21,739,120 = $750,000 + 10%；$21,739,121-$100,000,000 = 4.25%；$100,000,001-$109,574,470 = $4,250,000 + 30%；>= $109,574,471 = 6.5%。**2026 年前的 Scale 2 表已过时，不可使用** | gov.hk/en/residents/taxes/stamp/stamp_duty_rates.htm（修订说明）；ird.gov.hk/eng/faq/avd.htm（**完整档位表，已核对**） |
| 需求管理措施 | 2024-02 起撤销住宅需求管理措施（SSD / BSD / NRSD） | 上游 §3.1 |
| **提前还款罚息（已核实，来自银行 KFS）** | **中银香港（BOCHK）**：全额提前还款第 1 年 **原贷款额的 2%**、第 2 年 **1%**；部分提前还款第 1 年收 **提前还款额的 1%**，另加 **1 个月利息**。**HSBC High Advance**：全额提前还款第 1/2/3 年分别为 **3% / 2% / 1%**；前 2 年内部分提前还款 = **2 个月利息**（最低 HK$50,000） | BOCHK 与 HSBC 的第一方 KFS（key facts statement），经研究 agent 核对 |
| **按保 MIP（已取得 HKMC 一手 IEC/费率表）** | 银行可提供最高 **80% LTV**；**80% 以上至 90%** 仅限（i）所有抵押人申请时不持有香港住宅物业，且（ii）所有申请人皆为固定受薪人士。物业价值分档：**<=HK$10m -> 80%/90%**；>HK$10m 且 <HK$11.25m -> 80%/90%（贷款上限 HK$9m）；HK$11.25m-15m -> 80%；>HK$15m 且 <=HK$17.15m -> 70-80%（贷款上限 HK$12m）；>HK$17.15m 且 <=HK$30m -> 70%。**资格**：最高 DTI **50%**、最长 **30 年**、「剩余年期 + 楼龄」**<=75 年**、**仅限完全摊销贷款**（气球还款/供款假期/延迟本金不合资格）、首付须为自有资金。**保费表**（物业 <=HK$6m、首次置业、浮动利率）：70-80% LTV 一次过 **0.50%（10 年）至 0.92%（30 年）**；70-85% -> **0.86%-1.41%**；**70-90% -> 1.25%-2.16%** | hkmc.com.hk/eng/our_business/mortgage_insurance_programme.html；IEC 与 Premium Rate Sheet PDF（2024-10 版） |
| 期限 / 复利 / 税 | 市场标准 **25-30 年**（按保上限 30 年），**按月等额本息**。**无资本利得税**（IRD 明确 "does not tax capital gains"）。**自住贷款利息扣除**每人合计 **20 个课税年度**（2012/13 起由 10 年延至 15 年，2017/18 起延至 20 年） | ird.gov.hk/eng/tax/bus_taxcertainty.htm；ird.gov.hk/eng/faq/hli_basic.htm |
| 薪资（已升级） | 薪俸税按**净应课税入息**累进：首 $50,000 -> **2%**；次 $50,000 -> **6%**；次 $50,000 -> **10%**；次 $50,000 -> **14%**；余额 -> **17%**；或按净入息**标准税率**（2024/25 起两级：首 $5,000,000 -> **15%**，余额 -> **16%**），**两者取低**；由 IRD 官方 Tax Calculator 实现。**MPF**：雇员与雇主**各 5%**，月薪制相关收入 **HK$7,100-30,000**（雇员每月最高 **HK$1,500**）。**法定标准工时无统一上限（未取得劳工处一手条文，UNVERIFIED）** | gov.hk/.../salariesrates.htm；gov.hk/.../tax_computation.htm；mpfa.org.hk/en/MPF-system/mandatory-contributions/employees |
| 薪资 | 月薪 + MPF | **UNVERIFIED** |

**(d) 与现有 10 款的重合度** —— Mortgage **需新建**（H/P 双利率与封顶 + LTV 70% / DSR 50% 资格 + MIP，**但不需要 +200bp 压力测试**）；Cap rate **适用**；DSCR **部分适用**；Refinance **需参数化**（含提前还款罚息曲线：第 1-3 年 3%/2%/1% 这类结构）；BRRRR / Hard money / 1031 **不适用**；Salary to hourly **需新建**（月薪 + MPF）。

---

### 2.15 西班牙（ES）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Simulador de préstamo hipotecario o personal**（含 carencia、amortización anticipada、TAE、IRPH 差价） | **Banco de España** | **政府/央行** | clientebancario.bde.es/pcb/es/menu-horizontal/podemosayudarte/simuladores/simulador_prestamo_hipotecario_personal.html |
| **Comparador de tipos de interés y comisiones** + 良好做法准则资格模拟器 | Banco de España | 政府 | clientebancario.bde.es/.../comparadores-y-simuladores/ |
| Simulador de hipoteca（cuota/TAE/gastos） | BBVA | 银行 | bbva.es/general/landings/hipotecas/simula-tu-hipoteca.html |
| Simulador Hipoteca fija/variable/mixta | Banco Santander | 银行 | bancosantander.es/particulares/hipotecas/simulador-hipoteca |
| Simulador de hipotecas | CaixaBank | 银行 | www4.caixabank.es/apl/hipotecas/simulador/index_es.html |
| **Calculadora de gastos hipoteca**（购房费用） | iAhorro | 经纪/比价 | iahorro.com/calculadoras/gastos-hipoteca |
| Calculadoras de vivienda（含 IVA vivienda nueva） | Fotocasa | 门户 | fotocasa.es/fotocasa-life/categoria/calculadora/ |
| Simulador de hipotecas | idealista | 门户 | idealista.com/hipotecas/simulador-hipotecas/ |
| **Servicio de Cálculo de Retenciones**（工资预扣） | **AEAT** | **政府/税务** | sede.agenciatributaria.gob.es/.../servicio-calculo-retenciones.html |
| Calculadora Sueldo Neto | Banco Sabadell | 银行 | bancsabadell.com/.../calculadora-sueldo-neto/ |

**(b) 必做计算器** —— **① mortgage repayment（含 TAE）② capacidad de endeudamiento ③ gastos de compraventa（ITP / IVA + AJD + 公证登记）④ 提前还款补偿（按利率类型分档）⑤ IRPF 过渡扣除提示**。理由：ITP 由自治区自定，必须做 CCAA 参数化；提前还款补偿上限在 2019 年后分档细化。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 利率结构 / 期限 | variable（**Euribor 12M** 为基准，另有 6M/3M/1M 与年度）+ fija + mixta；期限 25-30 年（可至 40）。**IRPH** 仍由 BdE 官方公布（Cajas/Bancos/Entidades）并设替换差价计算器，但约 2019 年后无新发放；ECJ 2020（C-125/18）与 2025-11 最高法院全体庭要求逐案透明度审查（法院评论为 SECONDARY） | clientebancario.bde.es |
| 摊还 | **法式等额本息（constant-payment）**，月度复利；法律仅要求披露「el sistema de amortización y la fórmula de cálculo de las cuotas」 | BOE Ley 5/2019 art. 23 |
| **购房税** | **新房（开发商首次交付）= IVA 10%**（特殊制度 4%）+ AJD（自治区定）；**二手房 = ITP**，税率/档位**由自治区自定**（国家基准 RDL 1/1993，地区档位见 Hacienda 自治区汇编）→ 计算器**必须按 CCAA 参数化**。**加泰罗尼亚**官方实例：一般 **10%** 至 EUR 600k，超出部分 11%/12%/13%；gran tenedor 20%；保护房/自住 5% | AEAT「IVA o ITP」页；atc.gencat.cat/es/tributs/itpajd/tpo/tarifes-tipus/ |
| 公证 / 登记费 | 国家价目 RD 1426/1989 + RD 1427/1989 | **具体价目 UNVERIFIED**（notariado.org 计算器 404） |
| **提前还款补偿（已核实 BOE）** | **浮动利率**：5 年内上限 **0.15%**，或（两者互斥）3 年内 **0.25%**；5 年后 **0%**。**固定利率**：首 **10 年 2%**、其后 **1.5%**。**浮动转固定（novación/subrogación）**：3 年内 **0.05%**，其后 0%。**2019-06-16 前签订的贷款**：5 年内 0.5%、其后 0.25%（或更低的约定值） | BOE Ley 5/2019 art. 23：boe.es/buscar/act.php?id=BOE-A-2019-3814（**已核对：该法立法说明明确「按浮动/固定区分补偿期间，并适用法定百分比上限」**） |
| IRPF 扣除 | **2013-01-01 起基本废除**（Ley 16/2012）；仅 **DT 18ª LIRPF** 对 2013 年前购置的自住房屋保留过渡制度；2012 年后贷款默认 **0**。地区性扣除仍存。**2013 年前的 15% / EUR 9,040 上限参数 UNVERIFIED** | AEAT 自住房屋扣除页 |
| 可负担性 | BdE「Guía de acceso al préstamo hipotecario」（2013）：机构通常不融资超过**评估价值的 80%**；月供不得超过净月收入的「某一比例」。**35% 是市场惯例，不是法定上限**；**无法定 LTV 上限** | bde.es 指南 PDF |
| 保险 / 担保 | **无一般性公共按揭保险**。仅有定向公共担保 **ICO/MIVAU aval 线**：对**35 岁以下首购或有未成年子女的家庭**提供**本金最高 20%** 的国家担保，使融资可达 100%，规模 25 亿欧元，延长至 2027 | ico.es/es/linea-avales-hipoteca-primera-vivienda |
| 薪资（一段） | 按 **AEAT rendimientos del trabajo 预扣表**计算 IRPF（reducciones、mínimo personal/familiar 等），以官方 Servicio de Cálculo de Retenciones 为准；雇员一般制度共同 contingency 缴费 **4.70%**（雇主 23.60%/21.20%），另加 MEI 与失业险；法定每周工时 **40 小时**（ET art. 34.1）；年薪按 **12 或 14 pagas** 折算（6 月/12 月双薪） | BOE Orden PJC/297/2026；AEAT |

**(d) 与现有 10 款的重合度** —— Mortgage **需参数化**（法式摊还通用；增 TAE、提前还款分档、CCAA 税制）；Refinance **需参数化**；DSCR / BRRRR / Hard money / 1031 **不适用**；Cap rate **需参数化**；Commercial **需参数化**；Loan comparison **需参数化**（按 TAE/ESIS 口径，可复用 MCD Schedule 3）；Salary to hourly **需新建**（IRPF 预扣 + 12/14 pagas，不是美国时薪产品）。

### 2.16 意大利（IT）

**(a) 在售计算器清单（第一方核对）**

| 产品名 | 提供方 | 类型 | 来源 |
| :--- | :--- | :--- | :--- |
| **Calcolatore della rata del mutuo**（含 piano di ammortamento） | **Banca d'Italia** | **政府/央行** | economiapertutti.bancaditalia.it/strumenti/calcolatori/calcolatore-della-rata-del-mutuo/ |
| **Calcolatore del capitale finanziabile a partire dalla rata**（由月供反推可贷额） | Banca d'Italia | 政府 | economiapertutti.bancaditalia.it/strumenti/calcolatori/ |
| Calcolo rata mutuo | UniCredit | 银行 | unicredit.it/it/privati/servizi-digitali/tutti-i-servizi/altro/rata-mutuo.html |
| Simulatore/comparatore mutui（TAEG） | MutuiOnline | 经纪 | mutuionline.it/mutuo-casa/ |
| Fondo di garanzia mutui prima casa（Consap）说明与模拟 | Intesa Sanpaolo | 银行 | intesasanpaolo.com/.../fondo-di-garanzia-mutui-prima-casa-consap.html |
| Calcolatore mutuo | Immobiliare.it | 门户 | immobiliare.it/mutui/ |
| Comparatore mutui | MutuiSupermarket | 比价 | mutuisupermarket.it/ |
| **Fondo Prima Casa（资格）** | **Consap / MEF** | **政府机构** | consap.it/fondo-prima-casa/ |
| **Agevolazioni acquisto prima casa** | **Agenzia delle Entrate** | **政府/税务** | agenziaentrate.gov.it/portale/aree-tematiche/casa/agevolazioni/ |

**(b) 必做计算器** —— **① rata（piano di ammortamento francese）② capitale finanziabile ③ imposte acquisto prima casa（2%/9% 或 IVA 4%/10%）④ imposta sostitutiva ⑤ detrazione interessi 19% ⑥ Fondo Prima Casa 资格**。理由：prima casa 资格直接改变税率档次（2% vs 9%、IVA 4% vs 10%），必须做成显式资格测试。

**(c) 核心计算规则（规格）**

| 维度 | 规则 | 一手来源 |
| :--- | :--- | :--- |
| 利率结构 / 期限 | fisso / variabile（Euribor 或 ECB + spread）/ misto / cap；期限 25-30 年（可至 40）；**TAEG** 签约前强制披露；**IRPH 在意大利不使用** | economiapertutti.bancaditalia.it |
| 摊还 | BdI 官方计算器明确构建 **piano di ammortamento francese**（月供固定，本金递增、利息递减）；BdI 并指出月供 <= 净收入的 **1/3** | economiapertutti.bancaditalia.it/.../calcolatore-della-rata-del-mutuo/ |
| **购房税（prima casa）** | 向私人卖方（免 IVA）：**imposta di registro 2%**（否则 9%，按 valore catastale，**最低 EUR 1,000**），ipotecaria + catastale 各 **EUR 50** 固定。向增值税纳税人购买：**IVA 4%**（否则 10%），registro/catastale/ipotecaria 各 **EUR 200** 固定。非优惠制度：registro **9%**（D.Lgs 347/1990  tariffa） | Agenzia delle Entrate：agenziaentrate.gov.it/.../infogen-agevolazioni-acquisto-prima-casa-intermediari（**已核对 2%/9%、IVA 4%/10%、EUR 50/EUR 200、最低 EUR 1,000**） |
| **imposta sostitutiva** | **0.25% prima casa**；非首套住房 2%；一般 0.75% | DPR 601/1973 art. 18（Normattiva） |
| **提前还款（关键：两条不可混用）** | **TUB art. 120-ter**：对**自然人购买或翻新住房的按揭**，任何规定提前还款罚则的条款**无效** —— 即住宅按揭**一律无提前还款罚**。**art. 125-sexies**（该条属**消费信贷**）才适用 **1%**（剩余期限 >1 年）/ **0.5%**（<=1 年）上限，且提前还款额 <= EUR 10,000 免收。**Legge 40/2007 art. 7 的 portabilità/surroga（转贷）不得收任何费用或罚金** | Normattiva：TUB art. 120-ter（normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1993-12-01;385~art120ter）与 art. 125-sexies。**注（重要冲突）**：两位研究 agent 对意大利罚则口径冲突 —— 一位把 125-sexies 的 1%/0.5% 套用到按揭；120-ter 版本更准确（住宅按揭无罚），并经独立搜索的第三方法律引述佐证；但 Normattiva 在我方环境为 JS 壳，**条文未逐字核对**，见 §6 |
| 税盾 | **art. 15 TUIR**：**19% detrazione** 对按揭利息（abitazione principale），合并计税基数上限 **EUR 4,000**；2020 年起须可追溯支付。**19%/EUR 4,000 本轮仅二手来源，UNVERIFIED** | Agenzia delle Entrate / Fisco Oggi |
| 可负担性 | BdI 的 **1/3 净收入**规则；**80% LTV 是市场惯例，非法定**；Consap 对符合条件者可将融资提至 100% | economiapertutti.bancaditalia.it |
| **担保（有全国基金）** | **Fondo di Garanzia Mutui Prima Casa**（Consap/MEF，Legge 147/2013 art. 1 c.48(c)）：国家担保**最高按揭的 80%**，融资额 **<= EUR 250,000**，优先类别（一方 <36 岁的年轻夫妇、有未成年子女的单亲家庭、公房租户、ISEE 门槛）。另有 Fondo di Sospensione Mutui 供还款暂停 | consap.it/fondo-prima-casa/ |
| 薪资（一段） | 到手 = 毛额 - IRPEF 档预扣（**<=EUR 28,000 -> 23%**；EUR 28,001-50,000 -> **35%**（AdE 页面注明 2026 年预算法拟降至 33%）；>EUR 50,000 -> **43%**）- 大区/市镇附加税 - 雇员社保。法定每周工时 **40 小时**（D.Lgs. 66/2003 art. 3.1）。薪酬惯例 **13 mensilità**（部分 CCNL 为 14，12 月发 tredicesima）。**常引用的 9.19% IVS 雇员费率仅二手来源**（INPS 一手本轮仅取到农业雇员 8.84%，不可外推） | Agenzia delle Entrate 税率页；normattiva D.Lgs 66/2003 art. 3；inps.it |

**(d) 与现有 10 款的重合度** —— Mortgage **需参数化**（法式摊还通用；增 TAEG、prima casa 资格、imposta sostitutiva）；Refinance **需参数化**（surroga 无罚是意大利特色）；DSCR / BRRRR / Hard money / 1031 **不适用**；Cap rate **需参数化**；Commercial **需参数化**；Loan comparison **需参数化**（按 TAEG）；Salary to hourly **需新建**（IRPEF 预扣 + 13 mensilità）。

---

## 3. 计算规则差异对照表（开发者可直接实施的跨市场表）

> **填写规则**：只填能给出（或明确缺失）一手来源的项；无来源写 **UNVERIFIED**。数值费率/税档不在此表凭空填写，实施前必须回查正文来源。

| 市场 | 利率结构 | 标准期限 | 摊还约定 | 复利 / 计息 | 按揭保险 / 担保 | 关键交易税 | 提前还款 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **美国** | 30/15 年固定为常态 | 30 年 | 月度等额摊还 | 月复利 | **PMI**（80% 可取消 / 78% 法定终止）、FHA MIP、VA | 无联邦交易税；州/县转让税 + 登记费 | QM/常规多无罚；非 QM 可有 |
| **英国** | 短期固定（2-5y）+ SVR；tracker 跟 BoE Bank Rate 3.75% | UNVERIFIED | capital & interest；interest-only 亦常见 | **按日计息**：余额 x 年率 / 365 | **无 PMI**；政府 2025 Mortgage Guarantee Scheme（91-95% LTV） | **SDLT** 0/2/5/10/12%；FTB 减免；额外 +5%；非居民 +2%（已逐条核对） | 固定期每年免罚额度（Santander 10%/日历年），超额收 ERC |
| **加拿大** | fixed / variable（prime-linked） | 25 年（受保基准） | 月度等额摊还 | **法定半年复利**（Interest Act s.6） | **CMHC**/Sagen/Canada Guaranty；保费并入本金 | **省级**土地转让税（+ 多伦多市） | **IRD**（固定）/ 3 个月利息（浮动） |
| **澳大利亚** | 浮动 + 短期固定 | 30 年 | 月度等额；**IO 期** | 月度 UNVERIFIED | **LMI**（贷方实践）；政府 First Home Guarantee | **州级印花税**（NSW/VIC...）+ 登记费 | 浮动无罚；固定 break cost |
| **爱尔兰** | fixed（常见 3/5y）/ variable | 20-35 年 | 月度等额摊还 | 月度 UNVERIFIED | **无 PMI**，但 **CCA 1995 s.126 法定房贷寿险** | **印花税 1%/2%/6%**（10 套以上 15%）；无 FTB 减免，有 Help to Buy 退税 | 固定：breakage fee；浮动：通常免罚；**无通用 10% 额度** |
| **新西兰** | 浮动 + 短期固定 | 常 30 年 | 月度等额 | **按日计息、按月收取**（BNZ 计算器假设） | 无按揭保险；**First Home Loan 首付可低至 5%**；**RBNZ LVR 流量上限（自 2025-12-01：自住 >80% 份额 25%、投资 >70% 份额 10%）**；**RBNZ 不设统一 test rate**（属银行信贷政策） | **无印花税 / 无土地转让税**（Stamp Duty Abolition Act 1999） | break fees（固定）；具体公式 UNVERIFIED |
| **德国** | **Zinsbindung** 5/10/15 年固定，到期再融资 | 常 25-30 年（含 Tilgung） | **Annuitätendarlehen**（月供固定）/ **Tilgungsdarlehen**（本金固定） | 30/360 按月 UNVERIFIED | **无按揭保险**；**Bausparen** 为替代机制 | **GrESt** 联邦基准 3.5%，州可加（区间约 3.5-6.5%）+ GNotKG 公证/登记 | **§489 满 10 年可终止（6 个月通知）**；§490 提前解约须赔偿 |
| **荷兰** | 固定期（常见 10/20/30y） | 30 年 | **annuitair / lineair / aflossingsvrij** | 月度；toetsrente 考核利率 UNVERIFIED | **NHG 国家担保**：2026 上限 470,000 EUR（节能 498,200 EUR），保费 0.4% | **overdrachtsbelasting** 自住 2% / 非自住 8%（2026）/ 其他 10.4%；<35 岁首购豁免 | 多数贷方年度免罚额度 UNVERIFIED |
| **法国** | 固定为主；variable/mixte | 常 20-25 年（HCSF <=25） | 等额月供（mensualité constante） | 月度；taux nominal 不等于 TAEG | **无按揭保险，但 assurance emprunteur 事实必需** | **frais de notaire** 旧房约 7-8% / 新房约 2-3% UNVERIFIED | **IRA** <= 6 个月利息或 3% 剩余本金（已证实） |
| **日本** | 変動 / 固定 / **フラット35（最长 35 年全期固定）** | 最长 35 年（模拟器 15-35 年） | **元利均等 / 元金均等 / ボーナス払い（<=40%）** | 月度复利（月利率 = 年率/12，行业惯例） | **団信（团体信用生命保险）**，フラット35 通常强制，成本内含于利率 | 印紙税 / 登録免許税（土地移转 15/1000 轻减）/ 不動産取得税（住宅特例 3%、扣除 1,200万円）/ 仲介手数料（3%+6万円+消费税） | 繰上返済 有手续费（SMBC 柜台 全额 33,000 円 / 一部 16,500 円；JHF 另有制限制度违约金） |
| **印度** | fixed / floating（必须挂钩 repo / 3M 或 6M 国债，**至少每 3 个月重置**） | 20-30 年 | EMI 等额摊还 | 月度复利（r = 年率/12） | 非强制；**CIBIL 评分**决定定价 | **州级**印花税 + 注册费；PMAY-CLSS 已结束，现行 PMAY-U 2.0 | **浮动不得收提前还款费**（RBI Directions 2025，2026-01-01 起适用） |
| **新加坡** | 银行浮动（SORA-linked）/ HDB 贷款（CPF OA + 0.1%） | HDB 最长 30 年、私宅 35 年 | 月度等额 | 月度；**TDSR 压力利率下限 4%（或现行利率取高）** | **无按揭保险**；CPF OA + HDB 贷款机制 + accrued interest | **BSD**（最高边际 6%）+ **ABSD**（公民 20/30%、PR 30/35%、外国人 60%、实体 65%） | 银行多无罚，有 lock-in clawback |
| **阿联酋** | 浮动（EIBOR / base-rate linked） | **最长 25 年** | 月度等额 | 月度；**压力测试 = 贷款利率 + 2-4pp** | 无 | **DLD 买卖登记 4%** + registrar fee（>=AED 500,000 为 4,200，否则 2,100）+ 杂费；抵押登记 0.25% | **提前结清费 <= 未偿余额 1% 或 AED 10,000 取小**；**LTV 按国籍/价格带/用途**（国民首套 85%/75%、外籍 80%/70%、投资 65%/60%、off-plan 50%）；**收入上限：国民 8 年、外籍 7 年**；DBR 50%（退休 30%） |
| **中国香港** | H（HIBOR）vs P（最优惠利率），有封顶 | 25-30 年 | 月度等额 | 月度；**+200bp 压力测试已暂停（2024-02）** | **HKMC MIP**（LTV 80% 常态、80-90% 限首置+固定受薪；DTI 50%、最长 30 年、楼龄+年期 <=75；保费 0.50%-2.16%） | **AVD**：2026-02-26 起住宅用 Part 1 Scale 1 = Scale 2（最高 6.5%），非住宅新设 Scale 3；2024-02 撤销 SSD/BSD/NRSD | 罚息期：全额第 1-3 年 2%/1%（BOCHK）或 3%/2%/1%（HSBC High Advance）；部分提前还款另计 |
| **西班牙** | Euribor 12M 浮动 / fija / mixta | 25-30 年（可至 40） | 法式等额本息 | 月度 | 无一般性公共保险；**ICO/MIVAU aval 定向担保**（<35 岁首购，本金最高 20%，融资可达 100%，至 2027） | **IVA 10%**（新建）+ AJD（自治区）；**ITP**（二手，**自治区自定**，加泰一般 10%） | **浮动：3 年内 0.25% / 5 年内 0.15% / 5 年后 0**；**固定：首 10 年 2%、其后 1.5%**；浮动转固定 3 年内 0.05% |
| **意大利** | Euribor/ECB 浮动 / fisso / misto / cap | 25-30 年（可至 40） | **piano di ammortamento francese** | 月度 | **有全国基金**：Fondo Prima Casa（Consap）国家担保**最高 80%**、融资 **<=EUR 250,000** | **prima casa**：registro **2%**（否则 9%，最低 EUR 1,000）+ ipotecaria/catastale 各 **EUR 50**；或 IVA **4%**（否则 10%）+ 各 **EUR 200**；**imposta sostitutiva 0.25%**（否则 2%） | **住宅按揭提前还款一律无罚**（TUB art. 120-ter）；1%/0.5% 上限属**消费信贷** art. 125-sexies；surroga 免罚 |

**跨市场实现要点**

1. **复利约定只需三档**：月复利（绝大多数）、**半年复利（加拿大，法定）**、以及英国/澳新常见的**按日计息、按月扣款**。
2. **摊还类型选择器**是 Tier B 的必备 UI：annuitair/lineair（NL）、Annuität/Tilgung（DE）、元利/元金（JP）。三者数学等价于「月供固定 vs 本金固定」，**可共用一套内核 + 一个模式开关**。
3. **保险/担保分三态**：有定价保险（美 PMI / 加 CMHC 0.60%-4.50% / 港 HKMC MIP 0.50%-2.16%）；准公共担保或强制寿险（荷 NHG 0.4% / 日 団信 / 爱 CCA 1995 s.126 法定寿险 / 法 assurance emprunteur / **意 Consap Fondo Prima Casa 最高 80%、<=EUR 250,000** / **西 ICO aval 定向 20%**）；无任何按揭保险或担保（英/新/德）。
4. **交易税分三层**：联邦/全国统一（英 SDLT、爱印花税、港 AVD）；**州/省/自治区决定**（澳 NSW/VIC、德 GrESt、加安省/BC/多伦多、美、印、**西 CCAA 的 ITP/AJD**）；无（新西兰）。**意大利是第四类**：以**资格判定**而非地域决定税档 —— prima casa 命中则 registro **2%**（或 IVA **4%**）、否则 **9%**（或 **10%**），故必须实现**显式资格测试**而非地区选择器。
5. **提前还款分四类**：有**按利率类型/年份分档的法定上限**（**西 Ley 5/2019：浮动 3 年内 0.25%、5 年内 0.15%、5 年后 0；固定首 10 年 2%、其后 1.5%；转固定 3 年内 0.05%**；法 IRA 6 个月利息或 3%；德 §489/§490）；有合同罚金但无统一上限（英 ERC、加 IRD、澳 fixed break cost、港罚息期 2%-3%/年递减）；**法律明文无罚**（**意住宅按揭 TUB art. 120-ter**、印度浮动、澳洲浮动、爱尔兰浮动）；无（新西兰实际存在 break fees，属第三类）。**意大利的坑**：1%/0.5% 上限属**消费信贷** art. 125-sexies，**不可套用到住宅按揭**。
6. **薪资代扣分三种模式（决定能否共用一套 take-home 引擎）**：(1) 雇主按累计制/税率表代扣、年度结算 —— 英国 PAYE、爱尔兰 PAYE、加拿大、新西兰 PAYE、德国 Lohnsteuer、日本 源泉所得税；(2) **无雇主代扣**、年度申报 —— 新加坡；(3) 雇主按**年度估算/TDS** 代扣 —— 印度；澳洲 PAYG 属表格式代扣 + 年度结算。需单独建模的扣缴项：英国（学生贷款 9%/6% + 自动加入养老金）、爱尔兰（USC + PRSI + My Future Fund）、加拿大（CPP/CPP2 + EI）、澳洲（Medicare + Super + HELP）、新西兰（ACC levy 1.75% + KiwiSaver 3.5% + 学生贷款 12%）、德国（KV/RV/AV/PV + Soli）、日本（厚生年金 18.3% + 健康保险 + 雇用保险 + 所得税）、印度（EPF 12% + ESI + professional tax + TDS）、新加坡（CPF 20%+17%）。**加班倍数极少是国家级法定**：只有日本（25/35/50%）、印度（Factories Act 2x）、加拿大联邦（1.5x）、新加坡（Part 4，1.5x）有明文；英国/爱尔兰/新西兰/德国留给合同或集体协议。
7. **欧盟统一披露规格（MCD）是一条捷径**：爱尔兰转写文本 **S.I. No. 142/2016** 的 **Schedule 2 = ESIS（European Standardised Information Sheet）**、**Schedule 3 = APRC 计算方法**，Art. 18 规定 APRC 计算、Art. 19 规定偿债能力评估、Art. 26 规定提前还款。**同一套 ESIS/APRC 规范适用于爱尔兰、德国、荷兰、法国、西班牙、意大利**。这意味着 **Loan Comparison 计算器可以在欧盟多国共用一套 APRC 口径**，而不是逐国重建（见 irishstatutebook.ie/eli/2016/si/142/made/en/html）。

---

## 4. 逐国落地路线图

> 格式：**最小可用计算器集（按实施顺序）** / **需要的引擎改造** / **可复用的现有资产**。

### 4.1 加拿大
1. Mortgage Payment & Amortization（PITH 输出）
2. Borrowing Power / Affordability（OSFI MQR：max(合同利率 + 2%, 5.25%)）
3. CMHC Insurance Premium
4. Land Transfer Tax（省级 + 多伦多）
5. Refinance Break-Even（含 IRD）

**引擎改造**：compounding = 'semi-annual'（Interest Act s.6）；CMHC 保费并入本金；PITH 输出项。**可复用**：#1、#2（affordability 内核）、#9。

### 4.2 澳大利亚
1. Borrowing Power
2. Repayment（含 offset 场景）
3. Stamp Duty（**州选择器**：NSW/VIC/QLD/WA/SA/TAS/ACT/NT）
4. Refinance Break-Even（含 break cost）
5. Rental Yield / Cash Flow（负扣税开关）

**引擎改造**：**offset 账户**（计息本金 = 合同本金 - offset 余额，月供不变）；IO 期；APRA 3.0pp 缓冲。**可复用**：#1、#9、#4。

### 4.3 爱尔兰
1. Mortgage Repayment（LTI 4x/3.5x + LTV 10%/30% 校验）
2. Borrowing Power
3. Overpayment / Breakage Fee
4. Stamp Duty 1%/2%/6%
5. Rate Comparison / Switcher（APRC）

**引擎改造**：LTI/LTV 资格校验器；**法定房贷寿险**成本项；breakage fee；期限可到 35 年；APRC 口径（可复用 MCD Schedule 3）。

### 4.4 英国
1. Repayment Calculator（按日计息）
2. How Much Can I Borrow
3. **SDLT Calculator**（FTB / 额外房产 / 非居民 / leasehold）
4. Remortgage Break-Even（含 ERC + product fee）
5. Overpayment Calculator

**引擎改造**：短期固定 + SVR 分段；ERC；房东利息 **20% 税额抵免**（非费用扣除）的税后现金流。**可复用**：#1（数学）、#9（改 APRC 口径）。

### 4.5 新西兰
1. Repayment（含 offset / revolving）
2. Borrowing Power
3. Deposit / LVR
4. KiwiSaver First-Home 提取
5. Rental Cash Flow（利息扣除规则）

**引擎改造**：offset/revolving；RBNZ LVR 分档；CCCFA 验证输入。**注意**：不需要交易税计算器。
**可加做的本地差异化**：新西兰的**薪资/PAYE 侧规则本轮已取得强一手来源**（IRD PAYE calculator、ACC earners levy 1.75% 上限 156,641 新元、KiwiSaver 最低 3.5%、学生贷款 12% / 门槛 24,128 新元），是 Tier A 中薪资计算器最可落地的一个。

### 4.6 德国
1. Baufinanzierungsrechner（Annuität **或** Tilgung 模式）
2. Tilgungsplan（逐期利息/本金/Restschuld）
3. Kaufnebenkosten（GrESt 州选择器 + GNotKG 公证/登记 + Makler 50% 规则）
4. Anschlussfinanzierung（Zinsbindung 到期再融资风险）
5. Sondertilgung / Vorfälligkeit 测算

**引擎改造**：**Annuität vs Tilgung 双模式**；Zinsbindung 分段；effektiver Jahreszins（PAngV §16）。**可复用**：#1（内核）、#9。

### 4.7 荷兰
1. Woonlasten / Hypotheeklasten（annuitair/lineair/aflossingsvrij）
2. Maximale Hypotheek（toetsinkomen + toetsrente）
3. NHG 上限与保费（470,000 / 498,200 EUR，0.4%）
4. Overdrachtsbelasting（2% / 8% / 10.4%，<35 岁豁免）+ 公证费
5. Hypotheekrenteaftrek 税后对比（tariefsaanpassing 37.56%）

**引擎改造**：三种摊还公式；toetsrente 压测；NHG 保费池；eigenwoningforfait 分档表。

### 4.8 法国
1. Mensualité（含 assurance emprunteur）
2. Capacité d'Emprunt（HCSF 35% / 25 年）
3. Frais de Notaire
4. TAEG / 贷款比较（可复用 MCD APRC）
5. PTZ 资格

**引擎改造**：**保险按年龄/时点本金计费**；taux nominal vs TAEG 双输出；IRA。**可复用**：#1（内核）、#9（改 TAEG）。

### 4.9 日本
1. 月供计算（元利均等 / 元金均等 / ボーナス払い）
2. 借入可能額（年收基准）
3. 繰上返済（期間短縮 vs 額減少）
4. 諸費用（印紙税 / 登録免許税 / 不動産取得税 / 仲介手数料）
5. 住宅ローン控除（年末余额 x 类别借入限度額 x 控除期間）
6. 借換え

**引擎改造**：ボーナス払い（借款意向额 40% 以内、每 6 个月一次）；元金均等模式（第 k 月 = P/n + 剩余本金 x i）；団信成本（内含于「団信付き金利」）；税控除年现金流；**諸費用**按印纸税/登录免许税/不动产取得税/仲介手数料分项（本轮已取得费率结构）。**可复用**：#1（内核）、#9。

### 4.10 印度
1. Home Loan EMI
2. Eligibility / Affordability
3. Prepayment（减少期限 vs 减少月供）
4. Stamp Duty & Registration（州）
5. Tax Benefit（Sec 24(b) / 80C，旧/新税制切换）
6. Balance Transfer

**引擎改造**：税制层（旧/新 regime，新制 12L/12.75L 免税门槛）；**浮动利率引擎须实现外部基准（repo / 3M / 6M 国债）与至少每 3 个月重置**；提前还款无罚（RBI Directions 2025）；lakh/crore 数字分组（上游 §6.1 已指出 CLDR secondary grouping）。**可复用**：#1（EMI 数学相同）、#9。

### 4.11 新加坡
1. Repayment
2. Affordability（TDSR + MSR + LTV 三重校验）
3. BSD + ABSD
4. CPF OA 使用与 accrued interest
5. Refinance Savings

**引擎改造**：**TDSR/MSR 资格引擎**（TDSR <= 55%、MSR <= 30%）；**压力利率下限 4%**；年限超过 HDB 25 年 / 私宅 30 年时 LTV 降至 55%；CPF OA 账户模型（含 accrued interest）。**可复用**：#1、#9。

### 4.12 阿联酋 / 香港（第二批）
- **UAE**：Monthly Payment -> Affordability（DBR）-> DLD 4% -> Early Settlement -> Transfer。
- **HK**：每月供款 -> **LTV 70% / DSR 50% 资格**（**不要做 +200bp 压力测试，已暂停**）-> HKMC MIP 保费 -> AVD 印花税（用 2026-02-26 后的表）-> 提前还款罚息曲线。
- **UAE** 的资格层关键：**LTV 按国籍/价格带/用途分档**（国民首套 85%/75%、外籍 80%/70%、投资 65%/60%、off-plan 50%）、**收入倍数上限（国民 8 年 / 外籍 7 年，不是 8x）**、DBR 50%（退休 30%）、压力测试 +2-4pp。
- **引擎改造**：H/P 双利率与封顶；压力测试；按保保费。**可复用**：#1、#4（Cap Rate）、#9。

### 4.13 西班牙 / 意大利
**西班牙**：1) Repayment（含 TAE）2) Capacidad de endeudamiento 3) **Gastos de compraventa（CCAA 选择器：ITP / IVA+AJD + 公证登记）** 4) 提前还款补偿（按浮动/固定分档）5) IRPF 过渡扣除提示。
**引擎改造**：法式摊还通用；**必须按 CCAA 参数化 ITP/AJD**；提前还款补偿需按「浮动 3/5 年、固定 10 年」分档。

**意大利**：1) Rata（piano di ammortamento francese）2) Capitale finanziabile 3) **Imposte prima casa（含 prima casa 资格测试）** 4) Imposta sostitutiva 5) Detrazione interessi 19% 6) Fondo Prima Casa 资格。
**引擎改造**：法式摊还通用；prima casa 资格测试（2% vs 9%、IVA 4% vs 10%、固定 EUR 50/200）；**提前还款无罚**（不可照搬消费信贷的 1%/0.5%）。

**共同**：两者都比 Tier B 更接近现有引擎（法式摊还 + 月度复利），增量集中在**交易税与税盾**；但都落在 EEA（触发认证 CMP，上游 §4.2）。

---

## 5. 优先级建议

### 5.1 排序（重合度 x 需求规模）

| 排名 | 市场 | 重合度 | 引擎增量 | 合规增量 | 建议 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **加拿大** | 高 | 中（半年复利） | 无（非 EEA/UK/CH，不触发 CMP） | **立即做** |
| 2 | **澳大利亚** | 高 | 中（offset / 州税） | 中（无 CMP；有联盟链接则触发 AFSL 线，上游 §4.4） | **立即做** |
| 3 | **爱尔兰** | 高 | 中（LTI/LTV + 法定寿险） | **高**（EEA -> 认证 CMP + consent，上游 §4.2） | 做，先算 CMP 成本 |
| 4 | **英国** | 中（英文但产品不同） | 中高 | **高**（UK GDPR + CMP + FSMA s.21 线） | 做，按新产品预算 |
| 5 | **新西兰** | 中高 | 中（offset/revolving + LVR 流量上限） | 低 | 做（**按揭与薪资两侧规格本轮均已补齐**，是 Tier A 中「一手完成度」改善最大的市场） |
| 6 | **荷兰** | 中 | 高（三摊还） | 高（CMP） | 第二批 |
| 7 | **德国** | 中 | 高（Annuität/Tilgung） | 高（CMP） | 第二批 |
| 8 | **日本** | 中 | 高（bonus / 税控除） | 中 | 第二批 |
| 9 | **法国** | 中 | 高（保险 / TAEG） | 高（CMP） | 第二批 |
| 10 | **新加坡** | 中 | 高（TDSR/MSR） | 低 | 第二批 |
| 11 | **印度** | 中 | 高（税制） | 低 | 第三批，先验证 RPM |
| 12 | **阿联酋 / 香港** | 低 | 中 | 低 | 第三批 |
| 13 | **西班牙 / 意大利** | **中（法式摊还通用）** | 中（交易税 CCAA/primacasa + 税盾） | 高（CMP） | 观察 -> **可提前**（本轮已取得第一方规格，不再是空白） |

### 5.2 「看着便宜、其实不便宜」清单

| 市场 | 陷阱 | 真实成本 |
| :--- | :--- | :--- |
| **英国** | 英文，看着像美国 | 没有 30 年固定；remortgage/ERC/leasehold/SDLT 是新品类；房东利息是 **20% 税额抵免** |
| **爱尔兰** | 英文、欧元、产品名接近 | 央行 **LTI 4x/3.5x、LTV 10%/30%** 硬上限 + **法定房贷寿险** + EEA 认证 CMP（上游 §4.2 是最高确定性成本） |
| **印度** | 英文、流量大 | 税盾（24(b)/80C）与州印花税构成独立产品层；RPM 无法核实 |
| **德国 / 荷兰** | 「就是换个词」 | 摊还类型不同（Annuität/annuitair）-> **内核必须重写输出**；NHG/Bausparen 是独立机制 |
| **日本** | 日语是门槛，但更贵的是机制 | ボーナス払い + 団信 + 住宅ローン控除 + 諸費用，缺一不可 |
| **加拿大** | 看起来是「最便宜的英文市场」 | **半年复利是法定数学差异**，必须动内核 |

### 5.3 各国「美国专用、带过去就是死重」的计算器

| 现有计算器 | 在哪些市场是死重 | 例外 |
| :--- | :--- | :--- |
| **DSCR Rental Loan** | 英、爱、新、德、荷、法、日、澳、加、新加坡（住宅） | 新加坡/UAE/香港**商业地产**可保留概念 |
| **Hard Money / Fix & Flip** | 除美国外基本无对应零售产品 | 英国 bridging、澳洲少数私人贷（需重建规则，不能照搬 70% rule） |
| **Section 1031 Exchange** | **全部海外市场均不适用** | 无 |
| **Commercial Loan + Balloon** | 多数市场有商业按揭，但期限/IO/DSCR 基准不同 | 需参数化，不是死重 |
| **BRRRR** | 依赖 hard money + cash-out refi 的组合，海外不成立 | 无 |
| **Salary to hourly（26x 双周 / FLSA 1.5x）** | **全部海外市场的数据假设都不成立** | 需按国重建（PAYE/CPP+EI/PAYG+Super/USC+PRSI/CPF...） |

### 5.4 最重要的工程结论

**贷款摊还内核 + 摊还类型选择器**（月供固定 / 本金固定 / 只还息 / offset / 半年复利 / 按日计息）是所有 14 个市场共用的唯一真正引擎资产。建议抽成显式的 AmortizationEngine 配置对象，而不是在各国页面里分支。第二个可复用资产是**欧盟 APRC 口径**（MCD Schedule 3），可覆盖 6 个欧洲市场。

---

## 6. 未能核实（UNVERIFIED）

### 6.1 本轮对自动化抓取不可达的一手来源

| 来源 | 状态 | 影响的条目 |
| :--- | :--- | :--- |
| eur-lex.europa.eu | AWS WAF 挑战（202） | EU **Mortgage Credit Directive 2014/17/EU** 原文未逐字核对（但经爱尔兰转写 SI 142/2016 核实其结构） |
| legislation.gov.uk | AWS WAF 挑战（202） | 英国成文法原文 |
| handbook.fca.org.uk | Cloudflare 403 | **MCOB 11**（可负担性/压力测试条文） |
| legifrance.gouv.fr、economie.gouv.fr | Cloudflare 403 | 法国 **TAEG** 条文、**HCSF 35%/25 年** |
| moneysmart.gov.au | Cloudflare 403 | 澳洲 **comparison rate** 法定定义 |
| emiratesnbd.com、adcb.com | Cloudflare 403 | UAE **银行计算器产品清单**（规则侧已由 CBUAE Rulebook / DLD 一手页补齐） |
| rulebook.centralbank.ae（我方环境） | 403 | UAE 规则数值由研究 agent 抓取该一手 URL 取得；建议实施前复核 |
| brdr.hkma.gov.hk（PDF） | PDF 不支持解析 | 香港 2024-02-28 压力测试暂停通函的**原文句**未能逐字核对（有 SECONDARY 媒体佐证） |
| rbnz.govt.nz | 403（"access has been restricted"） | 新西兰 LVR 25%/10% 与 DTI 数值（由研究 agent 抓取） |
| normattiva.it | JS / session 渲染 | 意大利 TUB 条文（art. 120-ter、art. 125-sexies）未能逐字核对 |
| notariado.org | 404 | 西班牙公证费具体价目 |
| bayut.com / mreferral.com / bankinter.es / mutuionline.it / gpssa | 503 / 403 / WAF | 各国若干计算器产品清单与费率 |
| sorted.org.nz | CAPTCHA 405 | 新西兰政府计算器产品清单 |
| imperdir.nl / rabobank.nl（计算器页） | 隐私墙 / 403 | 荷兰银行计算器 |
| broking.hsbc.com.hk | DNS 解析失败 | 香港按揭还款计算器 |
| incometaxindia.gov.in（条文页） | 403 | 印度 Sec 24 条文正文 |
| ato.gov.au / fairwork.gov.au / moneysmart.gov.au | CloudFront / Akamai 403 | 澳洲全部数值（税率档、Medicare、SG、38 小时、comparison rate） |
| moneyhelper.org.uk / TPR | Cloudflare 403 / 404 | 英国到手工资计算器与自动加入养老金费率 |
| epfindia.gov.in / esic.gov.in / indiacode.nic.in | CloudFront 403 | 印度 EPF/ESIC 费率与 Factories Act 条文 |
| cpf.gov.sg / sso.agc.gov.sg | JS 渲染 / 403 | 新加坡 CPF 费率与法定条文 |
| gov.ie（SW19 2026 等） | 403 / 405 | 爱尔兰 PRSI 2026 雇员费率 |
| 多处 JS 渲染 | 内容未渲染 | Nationwide 计算器名、NHG 上限页、IRAS 税率子页、HKMA 新闻稿正文、Boursorama 计算器、Banque de France taux d'usure 数值、GNotKG KV 21201 |

### 6.2 具体未核实的断言（按 §2 顺序）

1. **英国**：标准期限年限；**MCOB 11.6** 条文；Lloyds / Halifax 产品清单；MoneySuperMarket 与 Zoopla（403）；payment arrears/advance 惯例；苏格兰 LBTT / 威尔士 LTT。
2. **加拿大**：省级土地转让税具体档位；IRD 罚金公式；CMHC 保费费率表。
3. **澳大利亚**：30 年期限与月复利的一手来源；offset 机制一手说明；comparison rate 定义；LMI 定价；PAYG/Super 规则。
4. **爱尔兰**：**ERC / breakage 公式**；tracker 指数与利差（ECB 利率）；非居民印花附加税（未找到，非确认不存在）；Permanent TSB 产品（403）；**2026 年雇员 PRSI 费率**；固定利率期限惯例。
5. **新西兰**：**已大幅补齐**（LVR 25%/10%（2025-12-01 起）、CCCFA 义务清单、offset 第一方机制、bright-line 2 年、无印花税、KiwiSaver 满 3 年/保留 1,000 新元、First Home Grant 已停止、First Home Loan 5%、PAYE 2025 税率档、ACC levy 1.67%/1.75%/1.83%）。**仍缺**：各银行当前具体 serviceability **test rate** 数值（仅确认机制）、ACC levy 的**计费收入上限**、雇主 KiwiSaver 最低 3% 的说法（IRD 页 404）、ANZ 提前还款违约公式（PDF 404）、4 个 40 小时/周工时条文的法源强度。**注**：RBNZ 站在我方环境 403，LVR/DTI 数值来自研究 agent 抓取。
6. **德国**：逐州 GrESt 税率（仅联邦基准 3.5% 已证实）；GNotKG **KV 21201（Kaufvertrag）倍数**；30/360 计息惯例；标准期限与典型 Tilgung 率；Bausparen 的 Zuteilung/Bewertungszahl 公式（JS 渲染）；第 13 薪惯例。
7. **荷兰**：Tijdelijke regeling **Artikel 5 的 LTV 具体百分比**；30 年期限与月复利的监管依据；NHG「必须完整还款计划」条款原文（PDF）；notariskosten 具体金额；Rabobank / ABN AMRO 计算器（403/503）；Arbeidstijdenwet 工时数字与 vakantiegeld 8% 的法源。
8. **法国**：TAEG / taux effectif global 条文；**taux d'usure 具体季度费率**；**frais de notaire 7-8% / 2-3% 数值**；assurance emprunteur 的 Loi Lemoine / 2018 细节与按年龄费率；PTZ 收入上限/额度/zone；**HCSF 35% / 25 年一手文本**；加班 25%/50% 加成；社保具体分摊率。
9. **日本**：**已补齐**元利/元金公式、ボーナス払い 40% 上限、印纸税/登录免许税/不动产取得税/仲介手数料、厚生年金 18.3%、給与所得控除表。**仍缺**：flat35「繰上返済制限制度」的确切违约百分数、住宅ローン控除的控除率（0.7%）与各分类借入限度額完整数值表、协会けんぽ健康保险各县费率、労働基準法加班 25/35/50% 的条文页、月复利的一手明示。
10. **印度**：**已补齐**外部基准与 3 个月重置（RBI Id=11677）、浮动贷款免提前还款费（RBI Directions 2025，2026-01-01 生效）、PMAY-CLSS 结束日期、新制 12L / 12.75L 免税门槛。**仍缺**：Sec 24(b) 2,00,000 与 80C 1,50,000 的一手条文（403，标 SECONDARY）、各州印花税、新制分档税率表、EPF/ESI 费率与上限（EPFO/ESIC 被拦，SECONDARY）、CIBIL 门槛、GST 处理。
11. **新加坡**：**已补齐**TDSR 55%、MSR 30%、压力利率下限 4%、HDB 30 年 / 私宅 35 年与超年限降至 55%、BSD 6% 上限与起档、ABSD 全线、CPF 20%+17% 与 OW 7,400 / AW 102,000、加班 1.5x / 44 小时。**仍缺**：MAS Notice 632/645 原文数字（PDF 无文本层）、BSD 中间两档区间金额、公民/PR 首套 ABSD（部分 UNVERIFIED）、HDB 贷款利率 = CPF OA + 0.1% 的原文句、锁定期 clawback 条款。
12. **阿联酋**：**规则侧已补齐**（LTV 国籍/价格带分档、25 年期限、国民 8 年 / 外籍 7 年收入倍数、DBR 50%/退休 30%、+2-4pp 压力测试、提前结清费 1% 或 AED 10,000 取小、DLD 买卖 4% + registrar fee、抵押登记 0.25%）。**仍缺**：银行计算器产品清单（403）、浮动利率挂钩与重定价细节；且 CBUAE 页在我方环境为 403，数值来自研究 agent 的抓取，实施前应复核。
13. **中国香港**：**已补齐并更正**：LTV 70% / DSR 50% / 资产基础 70% / 取消「其他按揭减 10pp」（HKMA 2024-10-16 新闻稿，已逐条核对）；**+200bp 压力测试已暂停**（2024-02-28 通函，原文句未逐字核对）；**AVD 2026-02-26 新表**（住宅 Part 1 Scale 1 = Scale 2，非住宅 Scale 3，IRD FAQ 完整档位已核对）；BOCHK 与 HSBC 提前还款罚息。**仍缺**：HKMC MIP 保费表、H/P 利率封顶与 MPF 规则、压力测试暂停通函的逐字条文。
14. **西班牙 / 意大利**：**已从「未核对」升级为有第一方规格**。西班牙——BdE 官方计算器与比较器、Ley 5/2019 的提前还款分档（浮动 0.25%/0.15%、固定 2%/1.5%、转固定 0.05%）、AEAT 的 IVA/ITP 划分、加泰 ITP 档位、ICO aval 线。**仍缺**：公证/登记费具体价目（notariado.org 404）、AJD 各自治区税率、**2013 年前 IRPF 扣除的 15%/EUR 9,040 上限**、法定最长期限、IRPH/Euribor 一手指数页。意大利——BdI 官方 rata/capitale 计算器、AdE 的 prima casa **2%/9% + IVA 4%/10% + EUR 50/200 + 最低 EUR 1,000**、DPR 601/1973 的 **0.25%/2%/0.75%** imposta sostitutiva、Consap **80% / EUR 250,000** 担保、IRPEF **23%/35%/43%**。**仍缺**：**detrazione 19%/EUR 4,000（本轮仅二手来源）**、9.19% IVS 雇员费率（仅二手；INPS 一手只有农业 8.84%）、大区/市镇附加税、catastale 重估系数、标准期限、TAEG 公式原文、公证费一手来源。
15. **意大利提前还款口径冲突（已裁决，但未逐字核对）**：两位研究 agent 给出不同答案 —— 一位引 Codice del Consumo art. 40（可变无罚、固定 **1%/0.5%** 上限），另一位引 **TUB art. 120-ter**（住宅按揭提前还款罚则条款**一律无效**）并指出 1%/0.5% 属**消费信贷** art. 125-sexies。本报告采用 **120-ter 版本**（更准确，且经独立搜索的第三方法律引述佐证）。但 **Normattiva 在我方环境为 JS 壳，条文未能逐字核对**，实施前必须复核。

### 6.3 方法论层面的限制

- **搜索量 / CPC / RPM**：与上游 §2.5、§10 一致，本文**不采用**任何国家级搜索量或 RPM 数字。
- **「在一手站点未找到」不等于「不存在」**：例如爱尔兰/新西兰「无按揭保险」是「未找到制度」，不是「已确认不存在」。
- **本文的规则表是「实现前的检索清单」，不是可直接上线的参数表**：凡标注 UNVERIFIED 的数值，实施时必须回查正文来源后再写入代码。
- **一个可复制的取证技巧**：EUR-Lex 被 WAF 拦时，可用**成员国转写文本**（如爱尔兰 irishstatutebook.ie 的 SI）读取欧盟指令的完整结构；本报告的 MCD/ESIS/APRC 结论即由此取得。

---

## 参考资料 / Sources

### 上游文档
- [international-market-differences.md](./international-market-differences.md)（§3 产品结构 / §4 合规 / §5 变现 / §6 i18n / §7 基础设施 / §8 在位者 / §9 排序）
- [us-financial-calculators-market-demand-analysis.md](./us-financial-calculators-market-demand-analysis.md)（美国基线）

### 第一方计算器产品页
- **英国**：[HMRC SDLT Calculator](https://www.tax.service.gov.uk/calculate-stamp-duty-land-tax) · [gov.uk SDLT 住宅税率](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates) · [Barclays borrowing calculator](https://www.barclays.co.uk/mortgages/mortgage-calculator/borrowing-calculator/) · [Santander calculators](https://www.santander.co.uk/personal/mortgages/mortgage-calculators) · [NatWest calculators](https://www.natwest.com/mortgages/mortgage-calculators.html) · [Nationwide overpayment](https://www.nationwide.co.uk/mortgages/mortgage-calculators/overpayment-calculator/) · [Rightmove remortgage](https://www.rightmove.co.uk/mortgages/calculators/remortgage-calculator) · [MoneyHelper mortgage calculator](https://www.moneyhelper.org.uk/en/homes/buying-a-home/mortgage-calculator)
- **加拿大**：[CMHC Homebuying Calculators](https://www.cmhc-schl.gc.ca/consumers/home-buying) · [CMHC 保费计算器](https://www.cmhc-schl.gc.ca/consumers/home-buying/calculators/mortgage-loan-insurance-premium-calculator) · [RBC Affordability Calculator](https://www.rbcroyalbank.com/mortgages/tools/mortgage-affordability-calculator/) · [Ratehub Payment Calculator](https://www.ratehub.ca/mortgage-payment-calculator)
- **澳大利亚**：[CommBank Borrowing Power Calculator](https://www.commbank.com.au/digital/home-loans/borrowing-power-calculator)（含 Repayment / Stamp Duty / Refinance）· [firsthomebuyers.gov.au](https://firsthomebuyers.gov.au/)
- **爱尔兰**：[AIB Mortgage Calculator](https://www.aib.ie/our-products/mortgages/mortgage-calculator) · [AIB Overpayment Calculator](https://www.aib.ie/our-products/mortgages/mortgage-overpayment-calculator) · [Bank of Ireland Rate Comparison Calculator](https://personalbanking.bankofireland.com/borrow/mortgages/mortgage-rate-comparison-calculator/) · [CCPC Mortgage Calculator](https://www.ccpc.ie/consumers/money-tools/mortgage-calculator/) · [bonkers.ie affordability](https://www.bonkers.ie/compare-mortgages/affordability-calculator/)
- **德国**：[Interhyp Baufinanzierungsrechner / Rechner 目录](https://www.interhyp.de/baufinanzierung/) · [Interhyp Tilgungsrechner](https://www.interhyp.de/lp/tilgungsrechner/) · [CHECK24 Baufinanzierung](https://www.check24.de/baufinanzierung/) · [Dr. Klein](https://www.drklein.de/baufinanzierung.html) · [ING Baufinanzierung](https://www.ing.de/baufinanzierung/) · [Sparkasse Rechner](https://www.sparkasse.de/rechner.html)
- **荷兰**：[NHG](https://www.nhg.nl/) · [De Hypotheker hoeveel kan ik lenen](https://www.hypotheker.nl/zelf-berekenen/hoeveel-kan-ik-lenen/) · [Independer maandlasten](https://www.independer.nl/hypotheek/info/maandlasten) · [AFM wonen/hypotheken](https://www.afm.nl/nl-nl/consumenten/themas/hypotheken)
- **法国**：[CAFPI crédit immobilier](https://www.cafpi.fr/credit-immobilier/) · [Meilleurtaux crédit immobilier](https://www.meilleurtaux.com/credit-immobilier/) · [service-public frais de notaire 计算器](https://www.service-public.gouv.fr/particuliers/vosdroits/R54267) · [URSSAF Mon-entreprise brut/net](https://mon-entreprise.urssaf.fr/)
- **日本**：[JHF フラット35 ローンシミュレーション](https://www.flat35.com/simulation-info/index.html)
- **印度**：[HDFC Bank Home Loans / Calculators](https://homeloans.hdfc.bank.in/)
- **新加坡**：[DBS Home Loan Calculators](https://www.dbs.com.sg/personal/landing/loans/homeloans/calculate-loans.html) · [IRAS Stamp Duty](https://www.iras.gov.sg/quick-links/tax-rates/stamp-duty) · [IRAS ABSD](https://www.iras.gov.sg/taxes/stamp-duty/for-property/buying-or-acquiring-property/additional-buyer's-stamp-duty-(absd))
- **香港**：[HSBC HK Mortgages](https://www.hsbc.com.hk/mortgages/) · [BOCHK / HSBC 按揭 KFS（提前还款罚息，经研究 agent 核对）]
- **阿联酋**：[Emirates NBD Home Loans](https://www.emiratesnbd.com/en/loans/home-loans/home-loans-for-uae-nationals) · [Mashreq NEO Home Loan](https://www.mashreq.com/uae/neo/loans/mortage-loans/home-loan-residents/) · [ADCB Bayut Mortgage](https://www.adcb.com/en/personal/loans/home-loans/standard-mortgage-loan-bayut)

### 成文法 / 监管 / 央行 / 税务
- **欧盟（MCD）**：[S.I. No. 142/2016 — European Union (Consumer Mortgage Credit Agreements) Regulations 2016（Schedule 2 = ESIS；Schedule 3 = APRC）](https://www.irishstatutebook.ie/eli/2016/si/142/made/en/html) · Directive 2014/17/EU（EUR-Lex 被 WAF 拦，结构经上述转写核实）
- **爱尔兰**：[Central Bank of Ireland — mortgage measures（LTI 4x/3.5x；LTV 10%/30%；allowances）](https://edit.centralbank.ie/consumer-hub/explainers/what-are-the-mortgage-measures) · [CCPC — 房贷期限与首付](https://www.ccpc.ie/manage-your-money/buying-a-home/about-mortgages/understanding-mortgages) · [Revenue — 印花税税率](https://www.revenue.ie/en/property/stamp-duty/property/stamp-duty-property/rates.aspx) · [Revenue — Help to Buy](https://www.revenue.ie/en/property/help-to-buy-incentive/index.aspx) · [Revenue — 按揭利息减免（TRS 已关闭）](https://www.revenue.ie/en/property/mortgage-interest-relief/index.aspx) · [Revenue — 出租费用扣除](https://www.revenue.ie/en/property/rental-income/irish-rental-income/what-expenses-are-allowed.aspx) · [Revenue — USC 计算](https://www.revenue.ie/en/jobs-and-pensions/usc/calculating-usc.aspx) · [CCA 1995 s.126（法定房贷寿险）](https://www.irishstatutebook.ie/eli/1995/act/24/section/126/enacted/en/html) · [Organisation of Working Time Act 1997 s.15（48 小时）](https://www.irishstatutebook.ie/eli/1997/act/20/section/15/enacted/en/html) · [service-public F1669 — IRA 上限](https://www.service-public.gouv.fr/particuliers/vosdroits/F1669)
- **英国**：[gov.uk SDLT 住宅税率](https://www.gov.uk/stamp-duty-land-tax/residential-property-rates) · [gov.uk HMRC PIM2058 — 房东融资成本限制](https://www.gov.uk/hmrc-internal-manuals/property-income-manual/pim2058) · [BoE Bank Rate](https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate) · [BoE FPC 2022 撤销压力测试建议](https://www.bankofengland.co.uk/news/2022/june/financial-policy-committee-confirms-withdrawal-of-mortgage-market-affordability-test) · [gov.uk 2025 Mortgage Guarantee Scheme](https://www.gov.uk/government/publications/2025-mortgage-guarantee-scheme) · [gov.uk Income Tax rates](https://www.gov.uk/income-tax-rates) · [gov.uk NI rates](https://www.gov.uk/national-insurance-rates-letters) · [gov.uk 最长周工时](https://www.gov.uk/maximum-weekly-working-hours) · [BoE FSR Dec 2023](https://www.bankofengland.co.uk/financial-stability-report/2023/december-2023)
- **加拿大**：[OSFI — Minimum qualifying rate（max(contract+2%, 5.25%)）](https://www.osfi-bsif.gc.ca/en/supervision/financial-institutions/banks/minimum-qualifying-rate-uninsured-mortgages) · [OSFI MQR Backgrounder（2024-11-21 无保险 straight switch）](https://www.osfi-bsif.gc.ca/en/news/backgrounder-minimum-qualifying-rate-mqr) · [Interest Act s.6](https://laws-lois.justice.gc.ca/eng/acts/I-15/section-6.html) · [OSFI B-20 infosheet](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/infosheet-residential-mortgage-underwriting-practices-procedures-guideline-b-20) · [Financial Consumer Protection Framework Regulations, SOR/2021-181](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2021-181/) · [Cost of Borrowing SOR/2001-101（已废止）](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2001-101/page-1.html)
- **澳大利亚**：[NCCP Act 2009 / National Credit Code（日利率 = 年率/365、comparison rate Part 10）](https://www.legislation.gov.au/C2009A00134/latest/text) · [APRA 2024-11 宏观审慎更新（3.0pp 服务缓冲）](https://www.apra.gov.au/news-and-publications/update-apras-macroprudential-settings-november-2024) · [APRA APG 223](https://handbook.apra.gov.au/ppg/apg-223) · [NSW 印花税率与门槛（含 9% 外国买家附加税）](https://www.revenue.nsw.gov.au/_resources/duties-links/current-thresholds-and-rates) · [SRO Victoria Land Transfer Duty](https://www.sro.vic.gov.au/about-us/rates-and-statistics/current-rates/land-transfer-duty-principal-place-residence-current-rates) · [Westpac offset 计算器（净额计息原文）](https://www.westpac.com.au/personal-banking/home-loans/calculator/offset-calculator/) · [CommBank LMI（1%-5%）](https://www.commbank.com.au/home-loans/lenders-mortgage-insurance.html) · [Income Tax Rates Act 1986 Sch 7](https://www.legislation.gov.au/C2004A03348/latest/text) · [Medicare Levy Act 1986 s.6（2%）](https://www.legislation.gov.au/C2004A03351/latest/text) · [SG(Administration) Act 1992（12%）](https://www.legislation.gov.au/C2004A04402/latest/text) · [Fair Work Act 2009（38 小时）](https://www.legislation.gov.au/C2009A00028/latest/text)
- **德国**：[§ 489 BGB](https://www.gesetze-im-internet.de/bgb/__489.html) · [§ 490 BGB](https://www.gesetze-im-internet.de/bgb/__490.html) · [§ 491 BGB（贷款类型定义）](https://www.gesetze-im-internet.de/bgb/__491.html) · [§ 502 BGB](https://www.gesetze-im-internet.de/bgb/__502.html) · [§ 16 PAngV（effektiver Jahreszins）](https://www.gesetze-im-internet.de/pangv_2022/__16.html) · [GrEStG §11](https://www.gesetze-im-internet.de/grestg_1983/__11.html) · [GNotKG Anlage 1](https://www.gesetze-im-internet.de/gnotkg/anlage_1.html) · [GNotKG Anlage 2（Tabelle B）](https://www.gesetze-im-internet.de/gnotkg/anlage_2.html) · [§ 656a BGB](https://www.gesetze-im-internet.de/bgb/__656a.html) · [§ 656c BGB](https://www.gesetze-im-internet.de/bgb/__656c.html) · [BauSparkG](https://www.gesetze-im-internet.de/bausparkg/) · [§ 3 ArbZG](https://www.gesetze-im-internet.de/arbzg/__3.html) · [BMF Lohn- und Einkommensteuerrechner](https://www.bmf-steuerrechner.de/) · [BaFin 房地产贷款](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/immobilienkredit/immobilienkredit_node_en.html) · [BaFin Bausparen](https://www.bafin.de/EN/verbraucherinnen-verbraucher/themen-finanzprodukte/kredite-immobilienfinanzierung/immobilienfinanzierung/bausparen/bausparen_en.html)
- **荷兰**：[NHG-grens 2026 = 470,000 EUR / 498,200 EUR / 0.4%（Volkshuisvesting Nederland）](https://www.volkshuisvestingnederland.nl/actueel/nieuws/2025/10/08/nhg-grens-stijgt-naar-470.000-euro-afsluitpremie-blijft-04) · [Tijdelijke regeling hypothecair krediet (BWBR0032503)](https://wetten.overheid.nl/BWBR0032503/2025-01-01/0) · [Belastingdienst — overdrachtsbelasting tarieven](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/tarieven_overdrachtsbelasting/) · [Belastingdienst — startersvrijstelling](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/) · [Belastingdienst — tariefsaanpassing eigen woning](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/tariefsaanpassing-eigen-woning) · [Belastingdienst — eigenwoningforfait](https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/hoe-werkt-eigenwoningforfait)
- **日本**：[国税庁 No.1211-1 住宅借入金等特別控除](https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1211-1.htm) · [国税庁 土地・建物（住宅ローン控除等）索引](https://www.nta.go.jp/taxes/shiraberu/taxanswer/code/bunya-tochi-tatemono.htm) · [フラット３５ 官方](https://www.flat35.com/)
- **印度**：[RBI 浮动利率重置通知](https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12529) · [印度所得税局 — 各类扣除](https://www.incometaxindia.gov.in/w/various-deductions-under-the-income-tax-act)
- **新加坡**：[MAS Notice 645 (TDSR)](https://www.mas.gov.sg/regulation/notices/notice-645) · [MAS Notice 632 (LTV)](https://www.mas.gov.sg/regulation/notices/notice-632) · [IRAS Stamp Duty](https://www.iras.gov.sg/quick-links/tax-rates/stamp-duty)
- **香港**：[HKMA 2024-10-16 按揭逆周期措施（LTV 70% / DSR 50% / 资产基础 70% / 取消减 10pp）](https://www.hkma.gov.hk/eng/news-and-media/press-releases/2024/10/20241016-4/) · [HKMA 2024-02-28 通函（暂停 +200bp 利率压力测试，PDF）](https://brdr.hkma.gov.hk/eng/doc-ldg/docId/getPdf/20240228-3-EN/20240228-3-EN.pdf) · [HKMA LTV/DSR FAQ (PDF)](https://www.hkma.gov.hk/media/eng/doc/other-information/FAQ_table_(e).pdf) · [GovHK 印花税税率（2026-02-26 起 Part 1 Scale 1 = Scale 2，非住宅增设 Scale 3）](https://www.gov.hk/en/residents/taxes/stamp/stamp_duty_rates.htm) · [IRD AVD 完整档位表（已核对）](https://www.ird.gov.hk/eng/faq/avd.htm)
- **阿联酋**：[CBUAE Rulebook — Mortgages](https://rulebook.centralbank.ae/en/rulebook/regulations-regarding-mortgage-loans) · [CBUAE Article 3 — Important Ratios（LTV 国籍分档、25 年、国民 8 年/外籍 7 年、DBR 50%、压力测试 +2-4pp）](https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios) · [CBUAE Appendix 2（提前结清费 <=1% 或 AED 10,000 取小）](https://rulebook.centralbank.ae/en/rulebook/amendments-appendix-2-regulation-no-292011-regulations-regarding-bank-loans-other-services) · [Dubai Land Department — 买卖登记（4% + registrar fee）](https://dubailand.gov.ae/en/eservices/registering-the-sale-of-a-mortgaged-property/) · [Dubai Land Department — 抵押登记（0.25%）](https://dubailand.gov.ae/en/eservices/grant-property-mortgage/)
- **新西兰**：[RBNZ LVR 时间线（自 2025-12-01：25%/10%）](https://www.rbnz.govt.nz/regulation-and-supervision/oversight-of-banks/standards-and-requirements-for-banks/macroprudential-policy/timeline-for-loan-to-value-ratio-restrictions) · [RBNZ 2025-11 LVR 调整新闻稿](https://www.rbnz.govt.nz/news-and-events/news/2025/11/reserve-bank-confirms-changes-to-lvr-restrictions) · [CCCFA 2003](https://www.legislation.govt.nz/act/public/2003/52/en/latest/) · [Stamp Duty Abolition Act 1999](https://www.legislation.govt.nz/act/public/1999/61/en/latest/) · [IRD bright-line test（2 年）](https://www.ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test) · [IRD ACC earners' levy 费率](https://www.ird.govt.nz/income-tax/income-tax-for-individuals/acc-clients-and-carers/acc-earners-levy-rates) · [IRD KiwiSaver 首购提取](https://www.ird.govt.nz/kiwisaver/kiwisaver-for-individuals/getting-my-kiwisaver-funds-early/getting-my-kiwisaver-for-my-first-home) · [HUD：First Home Grant 停止](https://www.hud.govt.nz/news/pre-budget-announcement-new-funding-and-savings) · [BNZ TotalMoney offset 机制](https://www.bnz.co.nz/personal-banking/home-loans/home-loan-types/totalmoney)
- **西班牙**：[BOE Ley 5/2019 art. 23（提前还款分档补偿）](https://www.boe.es/buscar/act.php?id=BOE-A-2019-3814) · [Banco de España 模拟器/比较器](https://clientebancario.bde.es/pcb/es/menu-horizontal/actualidadeducac/educacion-financiera/comparadores-y-simuladores/) · [AEAT IVA o ITP](https://sede.agenciatributaria.gob.es/Sede/en_gb/iva/iva-operaciones-inmobiliarias/compro-vivienda-tengo-que-pagar-itp.html) · [加泰罗尼亚 ITP 税率](https://atc.gencat.cat/es/tributs/itpajd/tpo/tarifes-tipus/) · [ICO 首购 aval 线](https://www.ico.es/es/linea-avales-hipoteca-primera-vivienda) · [Orden PJC/297/2026（社保缴费）](https://www.boe.es/eli/es/o/2026/03/30/pjc297/con)
- **意大利**：[Banca d'Italia 月供计算器（piano francese）](https://economiapertutti.bancaditalia.it/strumenti/calcolatori/calcolatore-della-rata-del-mutuo/) · [Agenzia delle Entrate — prima casa 购房优惠（2%/9%、IVA 4%/10%、EUR 50/200）](https://www.agenziaentrate.gov.it/portale/schede/agevolazioni/scheda-acquisto-prima-casa/infogen-agevolazioni-acquisto-prima-casa-intermediari) · [TUB art. 120-ter（住宅按揭提前还款无罚）](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1993-12-01;385~art120ter) · [TUB art. 125-sexies（消费信贷 1%/0.5%，仅消费信贷适用）](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1993-12-01;385~art125sexies) · [Consap Fondo Prima Casa（80% / EUR 250,000）](https://www.consap.it/fondo-prima-casa/) · [AdE IRPEF 税率与计算（23%/35%/43%）](https://www.agenziaentrate.gov.it/portale/web/guest/aliquote-e-calcolo-dell-irpef9)
- **美国**：[12 U.S.C. ch. 49 (HPA)](https://www.govinfo.gov/content/pkg/USCODE-2023-title12/html/USCODE-2023-title12-chap49.htm) · [12 CFR §1026.43 (Reg Z / QM)](https://www.govinfo.gov/content/pkg/CFR-2024-title12-vol9/xml/CFR-2024-title12-vol9-sec1026-43.xml) · [IRS §1031](https://www.irs.gov/newsroom/like-kind-exchanges-under-irc-code-section-1031)
