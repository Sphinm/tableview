## New Zealand

*全部数字均来自本次实际抓取的第一方页面；无法抓取者明确标注。抓取日期：本会话。*

### A. 在售计算器清单 (calculator product inventory)

#### 房贷 / 购房类计算器

| # | 提供方 | 类型 | 产品名（原文） | 实际抓取的第一方 URL |
|---|---|---|---|---|
| 1 | ANZ Bank New Zealand | bank | **Repayments Calculator**（还款计算器，含期限选择器，最长 **30 years**） | https://tools.anz.co.nz/home-loans/repayment-calculator/ |
| 2 | ANZ Bank New Zealand | bank | **Borrowing Calculator**（How much can I borrow?） | https://tools.anz.co.nz/home-loans/borrowing-calculator/ |
| 3 | ANZ Bank New Zealand | bank | **Flexible Home Loan**（循环额度/offset 型产品说明页，非计算器，但为机制来源） | https://www.anz.co.nz/personal/home-loans-mortgages/manage/flexible-home-loan-transcript/ |
| 4 | BNZ | bank | **Home loan calculators**（计算器中心页） | https://www.bnz.co.nz/personal-banking/home-loans/calculators |
| 5 | BNZ | bank | **Home loan repayment calculator**（"Work out your repayments"） | https://www.bnz.co.nz/personal-banking/home-loans/calculators/home-loan-calculator |
| 6 | BNZ | bank | **Home loan borrowing calculator**（"Work out how much you could borrow"） | https://www.bnz.co.nz/personal-banking/home-loans/calculators/how-much-can-i-borrow |
| 7 | BNZ | bank | **TotalMoney home loan calculator**（offset 抵扣省息计算器，"Calculate how much you could save"） | https://www.bnz.co.nz/personal-banking/home-loans/calculators/totalmoney-home-loan-calculator |
| 8 | Kiwibank | bank | **Repayments & structuring calculator**（还款与贷款结构计算器） | https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/repayment-calculator/ |
| 9 | Kiwibank | bank | **First home buyer calculator** | https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/first-home-buyer-calculator/ |
| 10 | Kiwibank | bank | **Next home calculator** | https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/next-home-calculator/ |
| 11 | Kiwibank | bank | **Calculators**（计算器中心页，同一 hub 还列出 borrowing 计算器） | https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/ |
| 12 | Trade Me Property（门户） | portal(门户) | **Mortgage calculator**（"How much will your mortgage really cost?"） | https://secure.trademe.co.nz/c/property/article/how-long-will-it-take-to-pay-off-my-mortgage |
| 13 | Mike Pero | broker(经纪) | **Mortgage Calculator Repayments NZ / Discover Your Borrowing Power** | https://www.mikepero.co.nz/mortgages/calculators |
| 14 | ANZ (Flexible) / BNZ (TotalMoney) | bank | **Offset / revolving-credit 计算器**（NZ 通常以 "Flexible Home Loan" = ANZ、"TotalMoney" = BNZ、"Choices Floating with Offset" = Westpac 命名，而非统一叫 "offset calculator"） | 见 3、7、Westpac 403 |

**抓取失败 / 被封锁（不得臆造内容）：**
- Westpac NZ **Mortgage repayment calculator** — https://www.westpac.co.nz/home-loans-mortgages/tools-resources/mortgage-repayment-calculator/ → 抓取超时；**How much could I borrow?** https://www.westpac.co.nz/home-loans-mortgages/tools-resources/how-much-could-i-borrow/ → 超时。
- Westpac NZ **Choices Floating with Offset calculator** — https://www.westpac.co.nz/home-loans-mortgages/tools-resources/choices-offset-calculator/ → **HTTP 403**（Westpac 站点错误页 "Error 26 / website currently unavailable"，疑似 WAF/IP 封锁）。
- **ASB**「ASB Calculators and Tools」(https://www.asb.co.nz/calculators)、**Borrowing calculator**(https://www.asb.co.nz/home-loans-mortgages/calculator-borrowing.html)、**Mortgage repayment calculator**(https://www.asb.co.nz/home-loans-mortgages/calculator-repayments.html) → 本环境全部 fetch failed / curl HTTP 000，**未能抓取**。产品名与 URL 由搜索结果标题确认，内容未验证 → 见 D。
- **Sorted (Te Ara Ahunga Ora 退休委员会)** https://sorted.org.nz/tools、https://sorted.org.nz/tools/money-planner → **HTTP 405 + AWS WAF "Human Verification" CAPTCHA**，无法抓取。
- **Kāinga Ora** https://kaingaora.govt.nz/home-ownership/first-home-grant/ → **Incapsula 反爬空白页**（noindex,nofollow + _Incapsula_Resource），无法抓取。
- **OneRoof** — 未找到可抓取的第一方计算器页（搜索仅返回房产详情页，见 D）。
- **SBS Bank / Mortgage Lab / homes.co.nz** — 本轮未抓取（时间预算）。

#### 薪资 / 到手工资 / 税务类计算器（payroll / take-home / tax）

| # | 提供方 | 类型 | 产品名（原文） | 实际抓取的第一方 URL |
|---|---|---|---|---|
| P1 | Inland Revenue (IRD) | government(政府) | **PAYE calculator** — "Use our PAYE calculator to work out salary and wage deductions"（支持 weekly / fortnightly / four weekly / monthly 发薪周期） | https://www.ird.govt.nz/employing-staff/deductions-from-income/deductions-from-salary-and-wages/work-out-paye-deductions-from-salary-or-wages |
| P2 | Inland Revenue (IRD) | government(政府) | **Income tax calculator** — "Work out tax on your yearly income"（可按 2011 至今任一年度计算年度基本所得税） | https://www.ird.govt.nz/income-tax/income-tax-for-individuals/how-income-is-taxed/work-out-tax-on-your-yearly-income |
| P3 | Inland Revenue (IRD) | government(政府) | **Income tax rates for individuals**（税率表页，构成 P1/P2 的计算规则基础） | https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals |
| P4 | Inland Revenue (IRD) | government(政府) | **ACC earners' levy rates**（工资中 ACC 征费率的官方表） | https://www.ird.govt.nz/income-tax/income-tax-for-individuals/acc-clients-and-carers/acc-earners-levy-rates |

**IRD PAYE 计算器明确排除项**（第一方页面原文列明）：extra pays（裁员/特殊奖金）、tailored tax codes、student loan special deduction rate、schedular payments、child support deductions、所有 lump sum payments。
**IRD 年度所得税计算器明确排除项**：tax credits（如 IETC）、已通过工资预缴的税、ACC earners' levy。
> Sorted.org.nz 的 "Take-home pay / Budget calculator" 因 AWS WAF（405 CAPTCHA）无法抓取 → 见 D。

### B. 核心计算规则

**1) 标准 30 年期限**
- ANZ **Repayments Calculator** 的期限下拉框实际列出 1–30 年（"17 years … 30 years" + 0–11 months），即第一方 UI 将 **30 年**作为最长可选期限。来源：https://tools.anz.co.nz/home-loans/repayment-calculator/
- BNZ 还款计算器说明页确认按 "principal and interest"、利率全期不变、利息按日计、**fortnightly** 计费：https://www.bnz.co.nz/personal-banking/home-loans/calculators/home-loan-calculator
- ⚠️ 30 年并非法定上限，而是市场惯例；**法律未强制 30 年**这一点本轮未找到明文法规条款（见 D）。

**2) RBNZ LVR 限制（投资者 vs 自住）—— 当前设置**
- **现行（自 2025 年 12 月 1 日起，2026 年 8 月复核后维持）**：
  - **自住业主 (owner-occupiers)**：新发放贷款中，LVR **高于 80%** 的份额上限为 **25%**（由 20% 上调）。
  - **投资者 (investors)**：新发放贷款中，LVR **高于 70%** 的份额上限为 **10%**（由 5% 上调）。
  - 来源（本次真正抓取成功）：https://www.rbnz.govt.nz/news-and-events/news/2025/11/reserve-bank-confirms-changes-to-lvr-restrictions （原文："For owner occupiers, the limit on the share of new lending allowed with an LVR above 80% will increase to 25% (up from 20%). For investors, the limit on the share of new lending allowed with an LVR above 70% will increase to 10% (up from 5%)."，生效日 "with effect from 1 December"。）
- **历史沿革（同一 RBNZ 时间线页，抓取成功）**：2024-07-01 起为 owner-occupier 20% / investor 5%；2023-06-01 起 15% / 5%（阈值 65%）；2021-11 收紧至 10%；2021-05 投资者 5% @60%；2021-03 恢复至 20% / 5% @70%。来源：https://www.rbnz.govt.nz/regulation-and-supervision/oversight-of-banks/standards-and-requirements-for-banks/macroprudential-policy/timeline-for-loan-to-value-ratio-restrictions （该页 Last updated: 14 August 2026，并记录 "August 2026 LVR settings maintained — The Financial Policy Committee (FPC) decided to maintain current LVR settings in its annual review of macroprudential policy."）
- ⚠️ 2026 年 8 月的媒体稿正文页 https://www.rbnz.govt.nz/news-and-events/news/2026/08/reserve-bank-maintains-loan-to-value-ratio-settings 返回 **HTTP 403**（Cloudflare 封锁）；其"维持不变"结论由上面**成功抓取**的时间线页确认，非臆测。
- 另：DTI 限制自 2024-07-01 与 LVR 同步实施（RBNZ 时间线页原文："we eased LVR restrictions alongside the introduction of Debt-to-Income (DTI) restrictions, which also apply to banks' residential mortgage lending."）。

**3) CCCFA 责任放贷 (responsible lending)**
- 法律本体：**Credit Contracts and Consumer Finance Act 2003**（Public Act 2003 No 52），本次抓取成功：https://www.legislation.govt.nz/act/public/2003/52/en/latest/
- 规则摘要（Consumer Protection NZ，第一方政府页，抓取成功）：贷款人必须遵守 CCCFA 的 responsible lending principles；适用按揭、贷款、协议透支、BNPL 等；核心义务包括：遵守披露义务、询问贷款用途以确保提供合适类型融资、**进行 affordability and suitability assessment**（负担能力与适当性评估）、在签署前帮助借款人理解所签内容、对高成本贷款（年利率 50% 及以上）限制利息与费用、收取合理信贷与违约费用、公平对待。来源：https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do
- 同一页还确认：放贷方须获 Commerce Commission 认证 / FMA 或 RBNZ 许可或授权，且须加入经批准的独立争议解决计划。

**4) Offset / 循环信用 (revolving credit) 机制**
- BNZ **TotalMoney**（第一方产品页，抓取成功）：通过把日常交易/储蓄账户连接到住房贷款，"Every dollar in these accounts offsets your loan, helping you pay it off sooner."（账户内每一元抵扣贷款余额，从而减少利息、加快还清）。来源：https://www.bnz.co.nz/personal-banking/home-loans/home-loan-types/totalmoney
- ANZ **Flexible Home Loan**（第一方页面，抓取成功）：以"jug（水壶）"比喻——当账户余额（含利息与 Flexible Home Loan 月度费）未被支出吃掉时逐步填满；填满后该部分贷款**不再计息**；该贷款类型**通常利率更高并收取月度费**，适合自律管理现金流者。来源：https://www.anz.co.nz/personal/home-loans-mortgages/manage/flexible-home-loan-transcript/
- 产品命名差异：NZ 银行多把它叫 "Flexible Home Loan"（ANZ）/"TotalMoney"（BNZ）/"Choices Floating with Offset"（Westpac，本环境 403 未抓取）。

**5) 无印花税 (no stamp duty) —— 已确认**
- **Stamp Duty Abolition Act 1999**（Public Act 1999 No 61，1999-05-20 御准，由 Inland Revenue Department 主管），本次抓取成功；目录含 "Part 1 Amendments to Stamp and Cheque Duties Act 1971" 与 "8 Refund of duty following abolition of stamp duty"，即**新西兰已通过该法废除印花税**。来源：https://www.legislation.govt.nz/act/public/1999/61/en/latest/
- ✅ 结论：新西兰房产交易**没有印花税**（未找到任何现行征收依据）。

**6) Bright-line test 结构（按"出售/取得日期"分档）**
- ⚠️ 重要更正：NZ bright-line 的分档依据是**物业出售/取得日期**，不是"income-year thresholds"（收入年度门槛）。以下为 IRD 第一方原文：
- **2024 年 7 月 1 日或之后出售**：若 bright-line end date 落在 start date 起 **2 年**内，则适用。原文："For property sold on or after 1 July 2024, the bright-line test looks at whether your bright-line end date for the property is within 2 years of your bright-line start date." 来源：https://www.ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test
- **2024 年 7 月 1 日之前出售**（历史档）：2021-03-27 或之后取得 → **新建房 5 年**、其他物业 **10 年**；2018-03-29 至 2021-03-26 取得 → **5 年**。来源：https://www.ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test/property-sold-before-1-july-2024
- 同一主页面确认：start date 一般为**产权转移日（结算日）**；end date 为**签订具约束力的买卖协议之日**；主要自住房 (main home)、商业物业、农地有排除（exclusions page）。

**7) KiwiSaver 首次购房提取 与 First Home Grant / Homestart**
- **KiwiSaver 首次购房提取**（IRD 第一方页，抓取成功）：须**加入 KiwiSaver 至少 3 年**；可提取**本人供款、雇主供款、政府供款、投资收益、fee subsidies**；**账户须保留 $1,000**；从澳大利亚 Complying Superannuation scheme 转入的资金**不可提取**。来源：https://www.ird.govt.nz/kiwisaver/kiwisaver-for-individuals/getting-my-kiwisaver-funds-early/getting-my-kiwisaver-for-my-first-home
- **First Home Grant（原 KiwiSaver HomeStart grant）—— 已停止**：HUD（Te Tūāpapa Kura Kāinga，2026-07-01 起并入 Ministry for Cities, Environment, Regions and Transport）2024-05-22 公告原文：政府 "has discontinued the First Home Grant"，"Kāinga Ora is no longer accepting new applications for First Home Grants. However, existing applications and pre-approvals will still be honoured and processed."；同时 **First Home Loan 保留**，允许首套房买家**首付低至 5%**。来源：https://www.hud.govt.nz/news/pre-budget-announcement-new-funding-and-savings
- ⚠️ Kāinga Ora 官方 First Home Grant / KiwiSaver first-home withdrawal 页面（https://kaingaora.govt.nz/home-ownership/first-home-grant/ 、https://kaingaora.govt.nz/en_NZ/home-ownership/kiwisaver-first-home-withdrawal/）本环境被 **Incapsula 反爬**拦截，未能抓取内容；上述结论改由 HUD 第一方公告 + IRD 第一方页支撑。

**8) Stressed serviceability test rates（压力测试利率）**
- **明确声明：新西兰银行使用的 "test rate / 压力测试利率" 不是监管机构设定的，RBNZ 未规定统一的测试利率。** 这是银行**自身**的信贷政策与内部基准。
- 第一方证据（BNZ 自己的计算器说明页，抓取成功）："we used a **'test' interest rate which is higher than our advertised rates**, to take account of the fact that interest rates are likely to change over time." 来源：https://www.bnz.co.nz/personal-banking/home-loans/calculators/how-much-can-i-borrow
- 同一页另确认 BNZ 计算器的假设：借款人收入支出终生不变、银行可能依内部基准调整、利率全期不变、所有还款为 "principal and interest" 且按时足额。
- RBNZ 一侧：RBNZ 只对 **LVR / DTI** 设宏观审慎上限（见第 2 条），**不设定** serviceability test rate。来源：https://www.rbnz.govt.nz/regulation-and-supervision/oversight-of-banks/standards-and-requirements-for-banks/macroprudential-policy/timeline-for-loan-to-value-ratio-restrictions
- 各银行当前具体 test rate 数值（如 7.x%、8.x%）→ 本轮**未从任何银行第一方页面取得**，见 D（媒体/比价站属 SECONDARY）。

**9) 提前还款 / break fees（提前还款违约金）**
- ANZ CCCFA 披露类 PDF（搜索命中 "We use mathematical formulas when we calculate the **Early Repayment Recovery**"）→ URL: https://www.anz.co.nz/resources/d/e/deb80053-13bf-4ca5-8b51-906ca823b0fe/CCCFA-Comb-Flexible+HL-TsCs.pdf （**本轮未成功下载正文，仅搜索片段** → 见 D）
- ANZ **Repayments Calculator** 页面提到 "Reserve Rate Agreement"：若已为你保留利率而你不使用、取消或更改 Reserve Rate Agreement，可能产生费用；并指向 "Home Loan Terms and Conditions (PDF 172KB)"。来源（抓取成功）：https://tools.anz.co.nz/home-loans/repayment-calculator/
- ANZ 旧版 "break-fixed-term-loan.pdf" 与 "Fees-Charges.pdf" 链接本轮均返回 **HTTP 404**（链接已失效），未取得正文。
- CCCFA 框架：Consumer Protection NZ 页确认贷款人须**收取合理的信贷与违约费用 (charge reasonable credit and default fees)** 且公平对待借款人——这是 break fee 受 CCCFA 约束的第一方依据。来源：https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do

**10) 薪资 / 到手工资计算器所需规则（一段话总括）**
新西兰 PAYE 为**累进税率**，自 **2025 年 4 月 1 日**起：$0–15,600 按 **10.5%**、$15,601–53,500 按 **17.5%**、$53,501–78,100 按 **30%**、$78,101–180,000 按 **33%**、$180,001 以上按 **39%**（来源：https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals ）；在此之上按**固定费率**加征 **ACC earners' levy**，自 **2025-04-01 至 2026-03-31 为 1.67%（每 $100 收 $1.67，含 GST）**，2026-04-01 起 1.75%，2027-04-01 起 1.83%（来源：https://www.ird.govt.nz/income-tax/income-tax-for-individuals/acc-clients-and-carers/acc-earners-levy-rates ）；KiwiSaver 员工**最低/默认供款率为税前工资的 3.5%，可选 4%、6%、8%、10%**，且**每 3 个月**才能改一次（除非雇主同意更短），税前工资口径**包含**津贴、奖金、佣金、加班费、小费等、**不含**裁员补偿（来源：https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/employee-contributions 与 https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/employee-contributions-to-kiwisaver ）；**发薪周期**官方 PAYE 计算器支持 **weekly / fortnightly / four weekly / monthly**，并明确**不处理** extra pays、tailored tax codes、student loan 特别扣款率、schedular payments、child support 及所有 lump sum payments（来源：https://www.ird.govt.nz/employing-staff/deductions-from-income/deductions-from-salary-and-wages/work-out-paye-deductions-from-salary-or-wages ）；**工时与加班**规则见 Employment New Zealand 的 "Hours of work" / "Working overtime or extra shifts" 板块（来源：https://www.employment.govt.nz/hours-and-wages/hours-of-work ）——**年付 vs 双周付**的换算在本国实务中按官方 PAYE 计算器支持的发薪周期处理，年度口径则以 IRD 年度所得税计算器为基准（来源：https://www.ird.govt.nz/income-tax/income-tax-for-individuals/how-income-is-taxed/work-out-tax-on-your-yearly-income ）。
> 雇主 KiwiSaver 最低 3% 供款这一具体数值**本轮未从 IRD 第一方页取得**（对应 URL 404），见 D。Employment NZ 关于"无统一法定最高工时、加班由协议/合同约定"的具体措辞页本轮返回 **404 页面未找到**，仅 hub 页抓取成功，见 D。

### C. 一手来源清单（本次实际抓取）

| URL | 确认了什么 | 状态 |
|---|---|---|
| https://tools.anz.co.nz/home-loans/repayment-calculator/ | ANZ "Repayments Calculator" 存在；期限下拉最长 **30 years**；提及 Reserve Rate Agreement 可能产生费用 | 200 |
| https://tools.anz.co.nz/home-loans/borrowing-calculator/ | ANZ "Borrowing Calculator" (How much can I borrow?) 存在 | 200 |
| https://www.anz.co.nz/personal/home-loans-mortgages/manage/flexible-home-loan-transcript/ | ANZ Flexible Home Loan 机制：抵扣余额、填满后不计息、利率较高且有月费 | 200 |
| https://www.bnz.co.nz/personal-banking/home-loans/calculators | BNZ 房贷计算器 hub；列出 3 个计算器 | 200 (curl+UA) |
| https://www.bnz.co.nz/personal-banking/home-loans/calculators/home-loan-calculator | BNZ 还款计算器名称与假设（PI、按日计息、fortnightly 计费） | 200 (curl+UA) |
| https://www.bnz.co.nz/personal-banking/home-loans/calculators/how-much-can-i-borrow | BNZ 借贷计算器；**使用高于挂牌利率的 "test" 利率**（压力测试非监管设定） | 200 (curl+UA) |
| https://www.bnz.co.nz/personal-banking/home-loans/calculators/totalmoney-home-loan-calculator | BNZ TotalMoney offset 省息计算器名称与用途 | 200 (curl+UA) |
| https://www.bnz.co.nz/personal-banking/home-loans/home-loan-types/totalmoney | offset 机制："Every dollar in these accounts offsets your loan" | 200 (curl+UA) |
| https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/ | Kiwibank 房贷计算器 hub | 200 |
| https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/repayment-calculator/ | Kiwibank "Repayments & structuring calculator" 名称与描述 | 200 |
| https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/first-home-buyer-calculator/ | Kiwibank "First home buyer calculator" 名称与描述 | 200 |
| https://www.kiwibank.co.nz/personal-banking/home-loans/calculators/next-home-calculator/ | Kiwibank "Next home calculator" 名称与描述 | 200 |
| https://secure.trademe.co.nz/c/property/article/how-long-will-it-take-to-pay-off-my-mortgage | Trade Me Property "Mortgage calculator"（portal），考虑贷款额/利率/期限/固定浮动/首付 | 200 |
| https://www.mikepero.co.nz/mortgages/calculators | Mike Pero（broker）"Mortgage Calculator Repayments NZ" 页面存在 | 200 |
| https://www.westpac.co.nz/home-loans-mortgages/tools-resources/choices-offset-calculator/ | Westpac "Choices Floating with Offset calculator" URL 存在但被 WAF 拦截 | **403** |
| https://www.westpac.co.nz/home-loans-mortgages/tools-resources/how-much-could-i-borrow/ | Westpac 借贷计算器 — 未能取得内容 | 超时 |
| https://sorted.org.nz/tools | Sorted 计算器总览 — AWS WAF CAPTCHA 拦截 | **405** |
| https://sorted.org.nz/tools/money-planner | Sorted Money Planner — AWS WAF CAPTCHA 拦截 | **405** |
| https://kaingaora.govt.nz/home-ownership/first-home-grant/ | Kāinga Ora First Home Grant — Incapsula 反爬空白 | 拦截 |
| https://www.ird.govt.nz/employing-staff/deductions-from-income/deductions-from-salary-and-wages/work-out-paye-deductions-from-salary-or-wages | IRD **PAYE calculator**；支持 weekly/fortnightly/four-weekly/monthly；排除额外付款、tailored code、学生贷款特别扣款率、schedular payments、child support、lump sums | 200 |
| https://www.ird.govt.nz/income-tax/income-tax-for-individuals/how-income-is-taxed/work-out-tax-on-your-yearly-income | IRD **年度所得税计算器**；不含 tax credits、已缴税、ACC levy | 200 |
| https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals | **自 2025-04-01 累进税率**：10.5%/17.5%/30%/33%/39%，门槛 15,600/53,500/78,100/180,000；含 2024–25 旧档与 secondary tax codes | 200 |
| https://www.ird.govt.nz/income-tax/income-tax-for-individuals/acc-clients-and-carers/acc-earners-levy-rates | **ACC earners' levy** 固定费率表：2025–26 = 1.67%，2026–27 = 1.75%，2027–28 = 1.83%（含 GST） | 200 |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/employee-contributions | KiwiSaver 员工供款率 **3.5% 默认 / 4% / 6% / 8% / 10%**；每 3 个月可改一次 | 200 |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/growing-my-kiwisaver-account/employee-contributions-to-kiwisaver | 同上；税前工资口径含津贴/奖金/佣金/加班费/小费，不含裁员补偿 | 200 |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/how-kiwisaver-works | KiwiSaver 自动加入（18–65 岁）、默认扣款率 3.5% | 200 |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-for-individuals/getting-my-kiwisaver-funds-early/getting-my-kiwisaver-for-my-first-home | **首次购房提取**：须加入满 3 年；可提本人/雇主/政府供款+收益；**须留 $1,000**；澳洲转入资金不可提 | 200 |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/getting-my-kiwisaver-funds-early | 早期提取总览（首次购房/移居海外/重大困难/健康原因） | 200 |
| https://www.ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test | **bright-line 现行规则：2024-07-01 起出售者，2 年内适用**；start/end date 定义；main home 等排除 | 200 (curl+UA) |
| https://www.ird.govt.nz/property/buying-and-selling/when-you-need-to-pay/the-brightline-test/property-sold-before-1-july-2024 | **历史档：2021-03-27 起取得 → 新建房 5 年/其他 10 年；2018-03-29～2021-03-26 取得 → 5 年** | 200 (curl+UA) |
| https://www.rbnz.govt.nz/regulation-and-supervision/oversight-of-banks/standards-and-requirements-for-banks/macroprudential-policy/timeline-for-loan-to-value-ratio-restrictions | **LVR 完整时间线**；2026-08 维持设置；2025-12-01 起 25%/10%；2024-07-01 起 20%/5% 并同步引入 DTI | 200 (curl+UA) |
| https://www.rbnz.govt.nz/news-and-events/news/2025/11/reserve-bank-confirms-changes-to-lvr-restrictions | **自 2025-12-01 起**：自住 >80% 份额上限 25%（原 20%）；投资者 >70% 份额上限 10%（原 5%） | 200 (curl+UA) |
| https://www.rbnz.govt.nz/news-and-events/news/2026/08/reserve-bank-maintains-loan-to-value-ratio-settings | 2026-08 RBNZ 维持 LVR 设置 — **正文 403 被封锁**，结论由上面时间线页佐证 | **403** |
| https://www.legislation.govt.nz/act/public/2003/52/en/latest/ | **Credit Contracts and Consumer Finance Act 2003** 法律本体存在 | 200 |
| https://www.legislation.govt.nz/act/public/1999/61/en/latest/ | **Stamp Duty Abolition Act 1999**（Public Act 1999 No 61，IRD 主管），含 "Refund of duty following abolition of stamp duty" → 确认**无印花税** | 200 (curl+UA) |
| https://www.consumerprotection.govt.nz/help-product-service/borrowing-money/what-lenders-must-do | CCCFA **责任放贷**义务清单（affordability & suitability assessment、披露、合理费用、公平对待）；放贷方须获认证/许可 | 200 |
| https://www.hud.govt.nz/news/pre-budget-announcement-new-funding-and-savings | **First Home Grant 已停止**（不再接受新申请，既有申请/预批 honoured）；**First Home Loan 保留，首付低至 5%** | 200 |
| https://www.employment.govt.nz/hours-and-wages/hours-of-work | Employment NZ 工时与休息 hub（Hours of work / Rest and breaks / Rostering / Working overtime or extra shifts） | 200 |
| https://www.employment.govt.nz/hours-and-wages/hours-of-work/working-overtime-or-extra-shifts | 加班子页面 — 返回 404，未取得内容 | **404** |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/how-kiwisaver-works/employee-contributions | 旧版 URL，返回 404 | **404** |
| https://www.ird.govt.nz/kiwisaver/kiwisaver-employers/contributions-to-kiwisaver/employer-contributions | 雇主供款页 URL 不存在，返回 404 | **404** |
| https://www.anz.co.nz/resources/0/1/01ce8a804fca9babb28fba8ac61213a2/break-fixed-term-loan.pdf | ANZ 固定利率提前还款说明 PDF — 链接已失效 | **404** |
| https://www.anz.co.nz/resources/6/7/6735dc004f02f5f78551d7146f64e4a5/Fees-Charges.pdf | ANZ 费用表 PDF — 链接已失效 | **404** |
| https://www.asb.co.nz/calculators | ASB 计算器 hub — 完全无法连接 | fetch failed |
| https://www.asb.co.nz/home-loans-mortgages/calculator-borrowing.html | ASB Borrowing calculator — 完全无法连接 | HTTP 000 |
| https://www.asb.co.nz/home-loans-mortgages/calculator-repayments.html | ASB Mortgage repayment calculator — 完全无法连接 | HTTP 000 |

### D. UNVERIFIED / SECONDARY

**UNVERIFIED（未取得第一方正文，不应写入报告为事实）**
1. **各银行当前具体 serviceability test rate 数值**（例如 "7.5%" 之类）——本轮未从任何银行第一方页面取得。仅确认机制（"higher than our advertised rates"，BNZ 页）。相关的 **SECONDARY** 媒体来源（如 mpamag.com、hougarden.com 报道"五大行 test rate 不变"）属二手，不可作为数字依据。
2. **雇主 KiwiSaver 最低供款率 3%** —— 常见说法，但本次对应的 IRD 第一方 URL 返回 404，**未确认**。
3. **ACC earners' levy 的年度最高计费收入上限 (maximum liable earnings cap)** —— 本轮只确认费率表，**未取得 cap 数值**。
4. **Employment NZ 关于"无统一法定最高工时"及加班计算的具体措辞** —— hub 页抓取成功但具体子页 404，**规则细节未确认**（勿引用具体小时数）。
5. **30 年期限的法律依据** —— 仅确认 ANZ 计算器 UI 最长 30 年（市场惯例），**未找到规定 30 年的法规条文**。
6. **ANZ 提前还款违约金计算方式** —— 搜索片段显示其 CCCFA 条款 PDF 含 "Early Repayment Recovery" 公式，但**该 PDF 本轮未成功获取正文**，具体公式未确认。
7. **ANZ 旧版 break-fixed-term-loan.pdf / Fees-Charges.pdf 内容** —— 均 404。
8. **Westpac 的产品与计算器内容** —— "Choices Floating with Offset calculator"、"Mortgage repayment calculator"、"How much could I borrow?" 三个 URL 均未能取得内容（403 / 超时），仅由搜索结果标题知其存在。
9. **ASB 全部计算器内容** —— 站点本环境不可达，产品名与 URL 仅由搜索标题确认。
10. **Sorted.org.nz 任何计算器**（含 money tools、take-home pay、budget calculator）—— AWS WAF CAPTCHA 拦截，**未取得任何第一方内容**。
11. **Kāinga Ora 的 KiwiSaver first-home withdrawal 申请页与 First Home Grant 页面** —— Incapsula 反爬拦截，未取得内容；结论改由 IRD + HUD 支撑。
12. **OneRoof 的房贷/借贷计算器** —— 未找到可抓取的第一方计算器页；搜索仅返回房产详情页 (https://www.oneroof.co.nz/property/...) 与一条关于 OneRoof 与 Tella 合作的第三方新闻 (nzme.co.nz)，**OneRoof 计算器产品未证实**。
13. **SBS Bank、Mortgage Lab、homes.co.nz 计算器** —— 本轮未抓取（时间预算）。
14. **Bright-line "income-year thresholds" 表述本身** —— 任务描述中的该提法与实际不符：IRD 第一方页按**出售/取得日期**分档（2 年 / 5 年 / 10 年），**不存在按收入年度分档**。已在 B 第 6 条更正。

**SECONDARY（非第一方，仅作线索，勿引用数字）**
- https://www.mpamag.com/nz/specialty/residential/major-banks-hold-serviceability-test-rates-steady-despite-ocr-hike/582083 — 媒体关于 test rate 的报道。
- https://www.hougarden.com/nz/gu/news/nz-ocr-hike-major-banks-mortgage-test-rates-unchanged — 中文媒体同类报道。
- https://calk.nz/calculator/mortgage-lump-sum-calculator/ — 第三方计算器站。
- https://nztax.tools/paye-calculator/ — 第三方 PAYE 计算器。
- https://www.mortgagelab.co.nz/blog/mortgage-calculator-how-to-find-the-best-one — broker 博客（非计算器本体）。
- https://www.nzme.co.nz/news/oneroof-and-tella-launch-new-digital-home-loans-portal-for-kiwis — OneRoof 贷款门户的第三方新闻。
- Chrome Web Store "Mortgage Mate - NZ Property Calculator" — 浏览器扩展，非机构产品。
