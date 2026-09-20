# 金融计算器流量的「每访客变现潜力」国别评估

> **文档类型**: 变现（Google AdSense）国别优先级评估（决策级）
> **评估对象**: `tableview.dev`（房地产 / 借贷金融计算器，AdSense publisher `ca-pub-3414270480046504`，GA4 `G-JJBNH56W95`）+ `tools.tableview.dev` + `compress.tableview.dev`
> **评估问题**: 「有哪些主流国家呢，最好付费意愿强一点的」——即按**每访客可变现收入（revenue per visitor）**而非流量规模排序，用于决定下一个建哪国。
> **日期**: 2026-09-20
> **上游文档（不重复其结论，只交叉引用）**
> - [international-market-differences.md](./international-market-differences.md) —— §4 合规、§5 广告变现（AdSense 可用性 / CMP）、§9 排序结论
> - [financial-calculator-benchmark-by-country.md](./financial-calculator-benchmark-by-country.md) —— §9 国别产品重合度与落地顺序
> - [us-financial-calculators-market-demand-analysis.md](./us-financial-calculators-market-demand-analysis.md) —— 美国基线需求与竞品
> **证据标准**: **Tier 1** = 世界银行 / IMF / OECD 收入与购买力数据、官方/行业协会广告市场数据（IAB 系列、AA/WARC、Dentsu、OVK/BVDW）、Google 第一方文档；**Tier 2** = 第三方 CPM/RPM 基准，**仅用于相对次序**并显式标注 **SECONDARY**；**Tier 3** = 你自己的 GA4 × AdSense 数据（本文认为这是唯一可信答案）。**本文不编造任何国家级 RPM / CPC 数字**（原因见 §2）。
> **状态**: 已完成（未核实项见 §8）
> **检索诚实性说明**: 世界银行指标经其官方 API（`api.worldbank.org`）直接取数；IAB Australia / IAB Canada / OVK 数据取自其官方 PDF（经 PyMuPDF 抽取正文）；Dentsu、IAB UK、IAB Europe、Google 各页均取自第一方页面。IAB Europe 的**逐国明细在报告正文/付费下载内**，本文只把其新闻稿公开的**欧洲总计**当一手，逐国数字若引用则标 SECONDARY。

> **独立复核状态（由本仓库复核者执行，非撰写者自述）**:
>
> | 断言 | 复核结果 |
> | :--- | :--- |
> | 世界银行收入数据（Tier 1 骨架） | ✅ **已复核**：`api.worldbank.org` 的 `NY.GDP.PCAP.CD` 实测返回 2024 真实值（美国 $86,169.66、加拿大 $55,015.71、德国 $56,103.73、印度 $2,591.99），可复现 |
> | 「仓库无 Google 认证 CMP」 | ✅ **已复核并升级**：撰写方只查了源码（无法证明线上状态）。复核者实测**三个线上站点**的 HTML，`fundingchoicesmessages.google.com` 与所有第三方认证 CMP（OneTrust / Cookiebot / Didomi / Usercentrics / Quantcast / iubenda / consentmanager）**均未出现**，而 `pagead2.googlesyndication.com` 与 consent default 均已存在。即：**认证 CMP 确实缺失，且该缺失是线上的、不是仅源码层面的** |
> | Google「EEA/UK/CH 必须使用认证 CMP」规则 | ✅ 已复核：`support.google.com/adsense/answer/13554116` 返回 200，标题即「Google consent management requirements for serving ads in the EEA, the UK, and Switzerland」 |
> | 各国 RPM / CPC / CPM 具体数值 | ⛔ **本报告正确地未提供**（无一手来源）。复核者认可这一拒绝：Google 不发布国家级价格数据 |
>
> **本表的实际作用**：该报告最重要的可执行结论（上欧洲前必须先接认证 CMP，否则金融类高溢价被抹平）已从「源码推断」升级为**线上实测事实**。

---


## 1. 先回答（TL;DR）

**先把最重要的话说清楚：下面这张排序表是「代理指标（proxy）排序」，不是实测 RPM 排序。** 世界上**不存在**任何权威的「各国 AdSense RPM / CPC 表」（§2）。本表的排序依据是：**收入与购买力（Tier 1）× 广告市场密度（Tier 1）× 金融广告主强度（Tier 1 代理）× 英文/本地化成本 × 同意合规造成的折损（Tier 1 规则）**。真正属于你的答案只能来自 §6 的 GA4 × AdSense 实测。

**按「每访客变现潜力」的推荐短名单（高 → 低）：**

| 优先级 | 国家/地区 | 一句话理由（proxy 依据） | 关键约束 |
| :--- | :--- | :--- | :--- |
| **P0（巩固）** | 🇺🇸 **美国** | 收入与广告市场双第一（GDP/人 $90,027；互联网广告 $294.6B）；金融广告主最密集；**无认证 CMP 要求**；现有产品 100% 对口 | 已是基线；增量在广告位与留存，不在开新国 |
| **P1（下一步）** | 🇨🇦 **加拿大** | 英文；家庭消费/人 PPP ≈$34.5k；数字广告 C$18.2B（2024）；金融产品名一一对应；**不在 EEA/UK/CH，不触发认证 CMP** | 按揭为半年复利，需改摊还引擎（上游 §3） |
| **P1** | 🇦🇺 **澳大利亚** | 英文；消费/人 ≈$35.6k；数字广告 A$18.4B（2025）；**无 CMP 要求**；金融广告主成熟（ASIC 辖下） | offset account + 州级印花税 |
| **P1/P2** | 🇬🇧 **英国** | 英文；数字广告 £40.5bn（2025，欧洲最大之一）；金融广告主竞争极强（Google 金融验证最早落地 2021） | **需认证 CMP**；产品体系与美国差异大（无 30 年固定常态） |
| **P2** | 🇮🇪 爱尔兰 / 🇳🇿 新西兰 | 英文、高收入、金融产品名接近；NZ 无 CMP、IE 属 EEA 需 CMP | 市场小（人口 5–5.5M） |
| **P2** | 🇩🇪 德国 / 🇳🇱 荷兰 | 高收入、欧洲最大广告市场之一（德国在线展示+视频 €7.5bn/2025）；金融广告主强（BaFin 辖下） | **需认证 CMP** + 语言/产品本土化成本高 |
| **P3** | 🇸🇬 新加坡 / 🇭🇰 香港 / 🇦🇪 阿联酋 | 单用户价值高（HK 消费/人 PPP ≈$51k；SG GNI/人 PPP $135,750），英文可用，**非 EEA 无 CMP 要求** | 人口小；金融广告库存盘子小；不适合做主攻 |
| **P3** | 🇨🇭 瑞士 / 🇳🇴 挪威 / 北欧 | 收入极高，但人口小、需 CMP、语言/产品差异 | 长尾 |
| **P4（避坑）** | 🇮🇳 印度 / 🇧🇷 巴西 / 🇲🇽 墨西哥 / 🇮🇩 印尼 | **流量巨大但单位经济差**：家庭消费/人 PPP 仅 $6.7k–$16.6k；广告主出价能力低 | 不因流量大而优先 |

> **一句话结论**：**先把英文、免 CMP、金融广告主密集的市场吃透（美 → 加 → 澳 → 英），再考虑欧洲大陆（需先付认证 CMP + 本地化成本），最后才碰新兴大流量市场。**

---

## 2. 为什么不存在「各国 RPM 表」

这是本报告最重要的**方法学声明**，请先接受它再看后面的所有数字：

1. **Google 从不发布国家级 RPM / CPM / CPC 数据。** AdSense 帮助中心公开的只有：可用国家正面清单、付款方式与付款门槛、同意管理要求——**没有任何按国家排列的价格表**。
2. **Google Ads Keyword Planner 需要登录**，其数据不构成可引用的公开一手文档；任何「某国 CPC 是 $X」的数字都只能来自二手估算。
3. 因此，**任何声称「各国 RPM 表」的文档，其数字几乎必然是二手聚合或厂商营销内容**，不能用于投入决策。上游 [international-market-differences.md §5](./international-market-differences.md) 已独立得出同一结论，本报告不推翻、只复用。
4. 本文的做法：用**收入 / 广告市场 / 金融广告主强度 / 合规成本**四个可核实维度构造**代理排序**，并明确指出每一步是 Tier 1、Tier 2 还是作者综合判断。

**唯一能给出「你的每访客收入」的来源，是 §6 的 GA4 × AdSense 实测数据。外部报告永远替代不了它。**


---

## 3. 国家分层表

### 3.1 收入与购买力（Tier 1 基础数据）

数据来源：**World Bank World Development Indicators**，经其官方 API 直接取得（`api.worldbank.org`，指标 `NY.GDP.PCAP.CD`、`NY.GNP.PCAP.PP.CD`、`NY.GDP.PCAP.PP.CD`、`NE.CON.PRVT.PP.CD`、`SP.POP.TOTL`，数据更新时间 2026-07-13）。除标注外均为 **2025 年**；阿联酋为 2024 年。最后一列为**作者据世界银行两项指标推算**（家庭最终消费支出 PPP 总额 ÷ 人口），用以校正 GDP/人 的失真。

| 国家/地区 | GDP/人（现价 US$） | GNI/人 PPP（现价国际$） | GDP/人 PPP（现价国际$） | 家庭消费/人 PPP（推算，国际$） | 人口 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 🇺🇸 美国 | 90,027 | 89,490 | 90,027 | **61,250** | 341.8M |
| 🇨🇭 瑞士 | 114,769 | 101,690 | 102,513 | 44,348 | 9.1M |
| 🇳🇴 挪威 | 94,594 | 107,770 | 104,044 | 41,813 | 5.6M |
| 🇸🇬 新加坡 | 98,814 | 135,750 | 163,354 | 39,231 | 6.1M |
| 🇩🇪 德国 | 60,496 | 78,140 | 75,407 | 39,617 | 83.5M |
| 🇦🇹 奥地利 | 62,930 | 77,010 | 76,778 | 38,480 | 9.2M |
| 🇬🇧 英国 | 57,602 | 64,210 | 64,606 | 37,689 | 69.5M |
| 🇳🇱 荷兰 | 73,684 | 85,480 | 87,320 | 36,618 | 18.1M |
| 🇦🇺 澳大利亚 | 65,130 | 69,930 | 71,934 | 35,629 | 27.6M |
| 🇨🇦 加拿大 | 55,698 | 66,820 | 66,746 | 34,462 | 41.7M |
| 🇮🇹 意大利 | 43,309 | 62,870 | 62,803 | 34,218 | 58.9M |
| 🇭🇰 香港 | 56,983 | 88,500 | 80,423 | **51,005** | 7.5M |
| 🇮🇪 爱尔兰 | 131,592 | 106,310 | 155,089 | **32,483** | 5.5M |
| 🇸🇪 瑞典 | 63,133 | 76,090 | 72,529 | 32,070 | 10.6M |
| 🇩🇰 丹麦 | 76,970 | 85,460 | 83,218 | 32,141 | 6.0M |
| 🇫🇮 芬兰 | 56,149 | 66,300 | 65,884 | 31,456 | 5.6M |
| 🇫🇷 法国 | 48,986 | 65,110 | 63,975 | 32,021 | 68.7M |
| 🇪🇸 西班牙 | 38,627 | 59,830 | 59,868 | 31,247 | 49.4M |
| 🇳🇿 新西兰 | 49,591 | 53,600 | 57,350 | 30,814（2024） | 5.3M |
| 🇦🇪 阿联酋 | 50,274（2024） | 81,640（2024） | 79,344（2024） | 28,821（2023） | 11.5M |
| 🇰🇷 韩国 | 36,227 | 64,210 | 63,125 | 28,117 | 51.7M |
| 🇯🇵 日本 | 35,951 | 58,920 | 55,422 | 27,452（2024） | 123.4M |
| 🇧🇷 巴西 | 10,713 | 22,670 | 23,433 | 14,710 | 212.8M |
| 🇲🇽 墨西哥 | 13,889 | 25,070 | 25,868 | 16,594 | 131.9M |
| 🇨🇳 中国大陆 | —（结构排除，上游 §7.2） | — | — | — | — |
| 🇮🇩 印尼 | 5,060 | 17,190 | 17,660 | 9,089 | 285.7M |
| 🇮🇳 印度 | 2,702 | 11,600 | 11,748 | 6,741 | 1,463.9M |

**两个必须注意的失真（这就是为什么要加「家庭消费/人」这一列）：**

- **爱尔兰**：GDP/人 PPP $155,089 看似全球最高，但**家庭消费/人 PPP 仅 $32,483** —— 跨国企业利润与无形资产把 GDP 抬得远超居民实际购买力。**爱尔兰不能按「人均 GDP 世界第一」来估值。**
- **新加坡**：GDP/人 PPP $163,354 / GNI/人 PPP $135,750，但**家庭消费/人 PPP $39,231** —— 同样被外籍高薪与资本账户抬高。它仍是高价值市场，但**不是美国那种体量内的第一**。
- 反例：**香港**家庭消费/人 PPP $51,005，仅次于美国，且人口 7.5M —— 这是一个「小盘子、高单价」的市场。

### 3.2 广告市场规模与密度（Tier 1）

| 国家/地区 | 广告市场（官方/行业协会，年份） | 增长 | 每互联网用户数字广告支出（作者据上表推算） | 来源 |
| :--- | :--- | :--- | :--- | :--- |
| 🇺🇸 美国 | 互联网广告收入 **$294.6B**（2025） | **+13.9%** YoY | ≈ **$910 / 人 / 年** | IAB / PwC Internet Advertising Revenue Report, Full Year 2025 |
| 🇬🇧 英国 | 数字广告 **£40.5bn**（2025）；全部媒介广告 £46.9bn（2025） | 全部媒介 +10.1% | ≈ **£610 / 人 / 年** | IAB UK Digital Adspend 2025；AA/WARC Expenditure Report（2026-01-29） |
| 🇦🇺 澳大利亚 | 互联网广告 **A$18.4bn**（2025，+11.5%） | +11.5% | ≈ **A$693 / 人 / 年** | IAB Australia / PwC Internet Advertising Revenue Report, CY2025 |
| 🇨🇦 加拿大 | 互联网广告 **C$18.2bn**（2024，+14.3%）；2025 预测 C$21.2bn | +14.3% | ≈ **C$463 / 人 / 年** | IAB Canada 2024 Internet Ad Revenue Survey（2025-10） |
| 🇯🇵 日本 | 互联网广告 **¥4,045.9bn**（2025）；广告总额 ¥8,062.3bn | 互联网 +10.8% | ≈ **¥38,339 / 人 / 年** | 電通「2025年 日本の広告費」（2026-03-05） |
| 🇩🇪 德国 | 在线展示+视频 **€7.5bn**（2025，+9.6%）；2026 预测 €8.2bn | +9.6% | ≈ €96（**仅展示+视频，口径不全，不可与他国同比**） | OVK / BVDW OVK-Report 2026 |
| 🇪🇺 欧洲（合计） | 数字广告 **€131.1bn**（2025，+10.5%） | +10.5% | — | IAB Europe AdEx Benchmark 2025（2026-07-07） |

> **Tier 2（SECONDARY）—— 逐国数字只作相对次序，不作数值引用**：IAB Europe 报告发布后，二手媒体（如 Telecompaper 2026-07-13）转述其逐国值（英国、德国、法国为欧洲前三，Top 3 占 62%）。**这些数字本文不做方向之外的引用**，因为一手报告的逐国明细未在公开新闻稿中逐项列明。此外，第三方厂商博客（如 Ranktracker 2025 年的 *AdSense Geographic Variations*）确实按「购买力越高、广告主竞争越强 → CPC/RPM 越高」给出**定性的地区排序**（美国/英国/加/澳/西欧/北欧 > 南亚/拉美/东南亚），**这是 SECONDARY 且仅有定性价值**：它印证了本报告的逻辑，但其中的任何具体金额都不可引用。

### 3.3 分层结论（作者综合，proxy-based）

下表每一列都标注了证据层级；**最后一列是作者综合判断，不是实测**。同意负担依据见 §5。

| 国家/地区 | 收入水平（T1） | 广告市场条件（T1，部分 T2） | 英语适配（产品判断） | 同意负担（T1） | 每访客变现潜力（综合，非实测） | 主要依据 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 🇺🇸 美国 | 极高（消费/人 $61.3k） | 全球最大（$294.6B） | 原生 | **无 CMP** | **高** | 四项全占；金融广告主最密集 |
| 🇨🇦 加拿大 | 高（$34.5k） | 大（C$18.2B） | 英文原生 | **无 CMP** | **高** | 英文+免 CMP+金融强+产品重合 |
| 🇦🇺 澳大利亚 | 高（$35.6k） | 大（A$18.4B） | 英文原生 | **无 CMP** | **高** | 同上；ASIC 金融广告成熟 |
| 🇬🇧 英国 | 高（$37.7k） | 大（£40.5bn） | 英文原生 | **需认证 CMP** | **中高→高** | 市场大且金融广告极强，但 CMP+产品重构 |
| 🇳🇿 新西兰 | 中高（$30.8k） | 小 | 英文原生 | **无 CMP** | 中高 | 英文+免 CMP，但市场小 |
| 🇮🇪 爱尔兰 | 高（消费口径 $32.5k，GDP 失真） | 中（属欧洲大盘） | 英文原生 | **需认证 CMP** | 中 | 英文且产品名接近，但 EEA 合规成本 |
| 🇩🇪 德国 | 高（$39.6k） | 欧洲最大之一（展示+视频 €7.5bn） | 需德语 | **需认证 CMP** | 中高 | 收入与广告主强，但语言+产品+CMP |
| 🇳🇱 荷兰 | 高（$36.6k） | 中 | 需荷兰语（英语普及率高） | **需认证 CMP** | 中 | 高收入但盘子小、产品差异大 |
| 🇸🇪🇳🇴🇩🇰🇫🇮 北欧 | 极高（$31k–$42k） | 中 | 英语普及率极高 | **需认证 CMP** | 中高 | 高收入+高英语普及，但人口小 |
| 🇨🇭 瑞士 / 🇦🇹 奥地利 | 极高（$38k–$44k） | 中 | 德/法/意语为主 | **需认证 CMP** | 中 | 高收入，小盘子+语言 |
| 🇫🇷 法国 | 中高（$32.0k） | 大（欧洲前三） | 需法语 | **需认证 CMP** | 中 | 市场大但语言+产品+CMP |
| 🇪🇸 西班牙 / 🇮🇹 意大利 | 中（$31k–$34k） | 中 | 需西/意语 | **需认证 CMP** | 中低 | 收入偏低+语言+CMP |
| 🇸🇬 新加坡 | 极高（消费 $39.2k，GDP 失真） | 中 | 英文可用 | **无需 CMP**（非 EEA） | 中高 | 高收入+英文+免 CMP，但人口仅 6.1M |
| 🇭🇰 香港 | 极高（消费 $51.0k，全球第二） | 中 | 英文可用 | **无需 CMP** | 中高 | 单用户价值极高，但盘子小、金融广告本地化 |
| 🇦🇪 阿联酋 | 高（GNI PPP $81.6k） | 中 | 英文可用 | **无需 CMP** | 中 | 外籍房贷需求+高收入，但人口/市场小 |
| 🇯🇵 日本 | 中高（$27.5k） | 大（¥4.0trn 互联网） | 需日语 | 无 CMP（APAC 非 EEA） | 中 | 广告市场大，但语言/产品门槛最高 |
| 🇰🇷 韩国 | 中高（$28.1k） | 中 | 需韩语 | 无 CMP（非 EEA） | 中低 | 语言门槛+本地门户强势 |
| 🇮🇳 印度 | **低**（$6.7k） | 大但单位经济差 | 英文可用 | 无 CMP | **低** | 流量大≠变现强；广告主出价能力低 |
| 🇧🇷 巴西 | **低**（$14.7k） | 中 | 需葡语 | 无 CMP | **低** | 单位经济差+语言 |
| 🇲🇽 墨西哥 | **低**（$16.6k） | 中 | 需西语 | 无 CMP | **低** | 单位经济差+语言 |
| 🇮🇩 印尼 | **低**（$9.1k） | 中 | 需印尼语 | 无 CMP | **低** | 流量大但购买力最低档 |



---

## 4. 金融类广告主的国别强度

对一个**金融计算器**站来说，「哪个国家的金融广告主最愿意为一次高意图访问付费」比 GDP 排名更关键。可用的一手/准一手证据如下：

### 4.1 Google 的「金融服务广告主验证」计划（Tier 1，广告主侧）

Google 对金融广告主实施**按地区**的强制验证（牌照、注册号、监管机构核验），**已落地的地区与时间本身就是「该市场存在成规模、受监管、愿意投放的金融广告主」的一手信号**：

| 地区 | 生效时间 | 相关监管机构（Google 列出） | 来源 |
| :--- | :--- | :--- | :--- |
| 🇬🇧 英国 | **2021-09-06** | 英国金融监管体系 | [Financial Services Verification: Relevant Regulators and Enforcement Dates](https://support.google.com/adspolicy/answer/12390454) |
| 🇦🇺 澳大利亚 | **2022-08-30** | ASIC、AFSA、ABN/ACN 登记 | 同上 |
| 🇪🇺 24 个 EEA 市场 | 自 **2026-07-23** 起滚动执行 | 各国央行/监管（见下） | [Introducing New Verification Requirements… (June 2026)](https://support.google.com/adspolicy/answer/17127726) |
| 🇩🇪 德国 | — | BaFin、DIHK、DGUV、ESMA | [同上 Regulators 页](https://support.google.com/adspolicy/answer/12390454) |
| 🇫🇷 法国 | — | ACPR、AMF、ORIAS | 同上 |
| 🇮🇪 爱尔兰 | — | 央行 CBI、CCPC、HIA、Pensions Authority | 同上 |
| 🇸🇬 新加坡 | — | MAS、律政部放贷人/交易商登记、GIA | 同上 |
| 🇳🇿 新西兰 | — | RBNZ、FMA、NZICA、FSPR | 同上 |

> **2026-07 起新纳入的 24 个市场**（Google 原文逐字）：Austria, Belgium, Bulgaria, Croatia, Cyprus, Czechia, Denmark, Estonia, Finland, Greece, Hungary, Iceland, Latvia, Liechtenstein, Lithuania, Luxembourg, Malta, Netherlands, Norway, Poland, Romania, Slovakia, Slovenia, Sweden。

**解读（作者推论，非 Google 表态）**：英国（2021）、澳大利亚（2022）是最早要求金融广告主验证的市场，说明它们的金融广告竞争高度成熟；2026 年把整套 EEA 纳入，意味着欧盟大陆的金融广告主竞争正在向英澳看齐——但这**同时**意味着 EEA 的合规门槛（§5）也在同步抬高。

### 4.2 市场体量与在位者

- **美国**是全球最大的数字广告市场（$294.6B，2025），按揭/再融资/（房产）投资类关键词是美国**竞价最激烈**的金融意图之一；在位者是 lead-gen 比价门户与银行系（Bankrate、LendingTree、NerdWallet、Zillow、Rocket Mortgage）——上游 [us-financial-calculators-market-demand-analysis.md](./us-financial-calculators-market-demand-analysis.md) 已列其关键词簇与弱点。
- **英国**数字广告 £40.5bn（2025），由比价门户/银行系主导（MONY Group、money.co.uk、银行自营计算器），FCA 辖下的金融推广制度成熟（上游 §4.4）。
- **加拿大 / 澳大利亚 / 新西兰**：有成熟的本土比价与银行系计算器（Ratehub/WOWA、Canstar/Finder、sorted.org.nz 等，见上游 benchmark 文件 §2）。
- **Google 广告主侧的个性化定向限制**：美国与加拿大对信贷、银行产品与服务等广告**禁止按性别、年龄、育儿状态、婚姻状态、邮编定向**（[Restricted targeting in Personalized advertising](https://support.google.com/adspolicy/answer/143465)）。这反向说明这些市场规模大到需要用规则约束。

> **UNVERIFIED**：**没有任何一手来源给出「各国按揭/贷款广告投放金额」的国别表**。我检索了监管机构（FCA/ASIC/CFPB 等）与行业协会的一手文件，均未找到按国家统计的「金融广告支出」公开数据；厂商/媒体数据库（如 MediaRadar 广告主档案）为 **SECONDARY 且需订阅**，未纳入。因此本节的强度判断来自**广告主验证计划 + 广告市场体量 + 在位者清单**三个可核实维度的组合，而非直接的「金融广告支出」数字。

---

## 5. 合规对变现的折损

### 5.1 规则本身（Tier 1）

- **GDPR / ePrivacy**：向用户设备存储信息或读取已存信息需**事先同意**（ePrivacy Directive 2002/58/EC Art. 5(3)）；同意须自由、具体、知情、明确（opt-in）。（上游 §4.1 已逐字核对条文。）
- **Google EU user consent policy**：必须向 **EEA、英国、瑞士**用户披露并取得同意，涵盖 cookie/本地存储与**广告个性化**所需的数据收集、共享与使用——这是**合同义务**，不遵守会导致 AdSense 停用。（[Set up and manage your CMP](https://support.google.com/adsense/answer/7670013)）
- **认证 CMP 是硬门槛**：原文——"partners using our publisher products—Google AdSense, Ad Manager, or AdMob—**are required to use a consent management platform (CMP) that has been certified by Google** and integrates with the IAB's Transparency and Consent Framework (TCF) when serving personalized ads to users in the following regions: **EEA and UK: As of 16 January 2024** … **Switzerland: As of 31 July 2024**。" 并且：**"Only traffic from a certified CMP is eligible for personalized ads."**（[Google consent management requirements (for publishers)](https://support.google.com/adsense/answer/13554116)）

### 5.2 折损机制（这是欧洲变现的核心）

Google 对**未接认证 CMP**的流量明确规定：

> **"Only traffic from a certified CMP is eligible for personalized ads. Traffic from a certified CMP will continue to be eligible for personalized ads, non-personalized ads, and limited ads… Traffic from a non-certified CMP may be eligible for non-personalized ads or limited ads…"**（同上）

**含义**：在 EEA / 英国 / 瑞士，如果站点没有接认证 CMP，**广告个性化能力直接被剥夺**，只能拿 **非个性化广告（NPA）或 limited ads**。金融广告主为**个性化/高意图定向**支付的溢价，正是金融类流量高 eCPM 的主要来源之一；失去个性化，等于主动放弃欧洲最值钱的那部分库存。**具体的收入降幅百分比，没有任何一手来源可核实（UNVERIFIED）** ——它取决于国家、设备、页面、竞价环境，**必须由你自己的 A/B 实测得出**。

### 5.3 同意率（Tier 2，SECONDARY）

- 第三方 CMP 厂商 **Didomi** 在《What is the average consent rate in Europe in 2026?》（2026-03-19，基于数百万次欧洲同意交互）给出：**同意率（consent rate）按区域 75.1%–89.3%**，其中西欧最低 **75.1%**、法国 **71%**、不列颠群岛 87.3%、北欧 84.8%、南欧 82.5%、东欧 89.3%；而**真正的 opt-in 率（opt-in ÷ 展示的 banner 总数）仅 55.7%（西欧）– 67.6%（东欧）**。
- **标注**: 这是 **SECONDARY**（厂商自有数据的营销内容），仅用于说明「欧洲有相当比例的会话拿不到个性化同意」这一**结构**，其具体百分比不应作为你的预期值。
- 学术侧旁证（**SECONDARY**）：arXiv 2606.31485《A history of GDPR cookie banner compliance》（2026）基于 **30 个国家 11,364 个网站**的历史评估，讨论 banner 设计对用户选择的影响——同样只作结构参考。

**结论**：EEA 的「有效可个性化流量比例」大概率在 **六成上下**，再叠加 NPA 的低价，**同一份流量的欧洲有效收入会低于同等收入水平的非欧洲市场（美/加/澳/新西兰）**。这正是我们把英国/爱尔兰放在「高价值但需先付合规成本」、把欧洲大陆放在第二批的原因。

### 5.4 你自己的实现（仓库事实，决定当前处于哪一档）

我用 grep 核对了本仓库：

- **已实现** Google Consent Mode v2：`apps/{finance,tools,compressor}/index.html` 的 `<head>` 内联了 `gtag('consent','default',{...全 denied...})`；`apps/{finance,tools,compressor}/src/lib/consent.ts` 定义了 `GA4_MEASUREMENT_ID = 'G-JJBNH56W95'`，并在用户同意后 `update` 为 granted。
- **策略是「basic consent mode」**：`consent.ts` 注释明确——GA4 **只在同意后才加载**，未同意前**完全不向 googletagmanager.com 发请求**；代价是「EEA 拒绝的访客不产生任何数据，而不是被 modeled 估算」。
- **未发现认证 CMP 集成**：全仓库 grep `fundingchoices | privacy-messaging | cookieyes | onetrust | usercentrics | didomi | quantcast | consentmanager | klaro` —— **没有任何命中**。也就是说，当前仓库里实现的是一个**自建 banner + Consent Mode v2**，而不是 Google 认证 CMP。
- AdSense 主脚本（`pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3414270480046504`）在三个 app 的 `index.html` 中**无条件加载**。

**直接含义**：若未在 AdSense 后台额外启用 Google 自家的 **Privacy & Messaging（Funding Choices）** 认证 CMP，则你这套自建 banner **不满足 §5.1 的认证 CMP 要求**，EEA/英国/瑞士流量大概率只能拿到 **NPA / limited ads**。

> **注意（代码观察 vs 线上事实）**：仓库里没有认证 CMP 代码，**不等于**线上没有——Google 的 Privacy & Messaging 可以在 AdSense 后台配置并由 AdSense 脚本注入，不体现在源码里。**上线欧洲前，请先在 AdSense 后台确认「Privacy & Messaging / GDPR 消息」是否已启用，或用 §6 的 GA4 数据看 EEA 流量的实际广告收入是否异常偏低**。

**行动项**：在决定做欧洲大陆之前，先用 **Google 认证 CMP**（Google 自家的 Privacy & Messaging 对发布商免费，或任一 TCF 认证 CMP 如 Didomi/Usercentrics/OneTrust）+ 认证状态验证，把「可个性化流量」拿回来；否则欧洲的高收入会被 NPA 折价抹平。



---

## 6. 你自己的数据怎么看（GA4）——本文最高价值的一节

**结论：任何外部报告都不能替代你自己站点的「国家 × 广告收入」数据。** 你已经具备全部条件：GA4（`G-JJBNH56W95`）与 AdSense（`ca-pub-3414270480046504`）在三个站点均已部署（仓库事实：`apps/*/src/lib/consent.ts`、`apps/*/index.html`、`apps/*/src/data/adSlots.ts`）。下面是可执行的步骤。

### Step 0 — 前置确认（关键）

- GA4 的 `country` 维度**由 IP 自动派生**，无需配置：「The country from which user activity originated… This dimension is populated automatically. Google Analytics automatically derives location data from users' IP addresses.」（[GA4 dimensions](https://support.google.com/analytics/answer/12948931)）
- **但**你用的是 **basic consent mode**：未同意的访客不发送任何数据。因此 GA4 里 EEA 的会话数会**系统性偏低**，而 AdSense 报告里仍可能有对应展示——两边对不齐时，先想到这一层。

### Step 1 — 把 AdSense 关联到 GA4 资源

1. 在 **AdSense** 后台：**Account → Settings → Access and authorization → Google Analytics**，或在 GA4 后台 **Admin → Product links → AdSense links**。
2. 关联文档：[Link your Google Analytics 4 property with AdSense](https://support.google.com/adsense/answer/6084409) · [Link AdSense to Google Analytics](https://support.google.com/analytics/answer/13610380)。
3. 关联后，「Publisher ads」报告才会出现数据。

### Step 2 — 打开三个相关报告

| 报告 | 路径 | 你能看到什么 | 来源 |
| :--- | :--- | :--- | :--- |
| 用户属性总览 | **Reports → User → User attributes → Overview** | 「Country」卡片：按国家的活跃用户数 | [User attributes overview](https://support.google.com/analytics/answer/13823984) |
| 人口统计详情 | **Reports → User → User attributes → Demographic details** | Country / City / Language 的细分 | [Demographic details report](https://support.google.com/analytics/answer/12948931) |
| 发布商广告 | **Advertising → Publishing → Publisher ads**（**仅桌面版**，需已关联 AdSense/AdMob/Ad Manager） | 指标：**Total ad revenue**、Publisher ad impressions、Publisher ad clicks、Ad unit exposure | [Publisher ads report](https://support.google.com/analytics/answer/12925552) |
| AdSense 侧国家报告 | **AdSense → Reports → Countries** | 直接在 AdSense 里看按国家的收入 | [About the Countries report](https://support.google.com/adsense/answer/9974594) |

### Step 3 — 计算「每会话广告收入」（本文要的核心指标）

GA4 没有内置的「revenue per session」，但**标准属性即可创建计算指标**：

1. **Admin → Custom definitions → Custom metrics → 创建**。
2. 名称：`Ad revenue per session`；公式：`Total ad revenue` **÷** `Sessions`（单位可设为货币）。
3. 文档明确：**"You can create up to 5 calculated metrics per standard property / 50 per 360 property"**，且可在 reports、explorations、Data API 中使用。（[Create calculated metrics](https://support.google.com/analytics/answer/14166471)）
4. 同法可再建一个 `Ad revenue per 1000 sessions`（`Total ad revenue / Sessions * 1000`）作为 **RPM 的近似代理**——注意它**不是** AdSense 的 RPM，只是你自己可比的内部口径。

### Step 4 — 用 Explorations 做「国家 × 广告收入」

1. **Explore → Blank**。
2. **Dimension**: `Country`（可再加 `Device category`、`Session default channel group`）。
3. **Metrics**: `Sessions`、`Active users`、`Total ad revenue`、`Ad revenue per session`、`Ad revenue per 1000 sessions`。
4. **Tab Settings → Rows**: Country；按 `Ad revenue per 1000 sessions` 降序。
5. 若要同时看三站，把三个 GA4 property 都连到同一个 **BigQuery export**，或分别导出后按 country join。

> **口径警告（必须记住）**：`Total ad revenue` 的官方定义是 **"The sum of the advertising revenue for a user."** ——它是**按用户**聚合的，不是页面级 RPM。因此它除以 `Sessions` 得到的是一致性内部指标，**不要**直接当作 AdSense 后台的 RPM 去对外比较。

### Step 5 — 输出一张属于你的表（取代本文所有 proxy）

建议至少观察 **30 天 / 90 天**两个窗口，并按下表留档：

| country | sessions | active users | total ad revenue | **ad revenue / session** | **ad revenue / 1000 sessions** | 备注（同意率/设备） |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| US | … | … | … | … | … | |
| CA | … | … | … | … | … | |
| GB | … | … | … | … | … | EEA/UK：注意 basic consent mode 数据缺口 |
| AU | … | … | … | … | … | |
| … | | | | | | |

### Step 6 — 交叉核对两个口径

- **GA4 的 country** = 访客 IP 派生；**AdSense 的 country** = 广告请求的地理判定。两者会有小幅差异，尤其 VPN / 移动网络。
- 若某国 **AdSense 收入 ÷ GA4 sessions 明显异常**（例如 EEA 国家特别低），先检查 §5 的 CMP 状态，而不是先怀疑「该国 RPM 低」。

---

## 7. 建议

### 7.1 优先做这 3–5 个（按变现理由排序）

1. **🇺🇸 美国（巩固，不新开国）** —— 全球最大、金融广告主最密集、无 CMP 要求、现有 10 款计算器 100% 对口。**先把美国流量的每会话收入做上去**（广告位、内容深度、内链），这是投入产出比最高的一步。
2. **🇨🇦 加拿大** —— 英文、**不触发认证 CMP**、金融广告成熟、产品名一一对应；唯一成本是**半年复利**的摊还数学改造（上游已定位）。
3. **🇦🇺 澳大利亚** —— 英文、**不触发 CMP**、互联网广告 A$18.4B、金融广告主受 ASIC 监管而成熟；增量是 offset + 州级印花税。
4. **🇬🇧 英国** —— 英文、数字广告 £40.5bn、金融广告主竞争最强（Google 金融验证 2021 年最早落地）。**但必须先接认证 CMP 并接受产品重构**（无 30 年固定常态；remortgage/ERC/SDLT）。建议按「新产品」而非「翻译」立项。
5. **🇳🇿 新西兰 / 🇮🇪 爱尔兰（二选一）** —— 新西兰：英文+免 CMP+无印花税，但市场最小；爱尔兰：英文+产品名最接近，但在 EEA、需 CMP，且 GDP 口径失真需按家庭消费口径估值（≈$32.5k，仍是高收入）。

### 7.2 第二波（等 CMP 与本地化能力就位）

- **德国 / 荷兰**：收入与广告主强度都够（德国在线展示+视频 €7.5bn/2025），但**产品差异最大 + 语言成本 + 必须接认证 CMP**，属「重资产」扩张。
- **法国 / 西班牙 / 意大利**：市场不小、法式摊还与现有引擎较近，但同样落在 EEA 同意门槛内。
- **北欧 / 瑞士 / 奥地利**：收入极高、英语普及率高（北欧），但人口小、需 CMP，适合作为长尾而非主攻。

### 7.3 高收入但小盘子（可做精准 SEO，不做主攻）

**新加坡 / 香港 / 阿联酋**：单用户价值极高（香港家庭消费/人 PPP ≈$51k），英文可用，且**非 EEA/UK/CH、无认证 CMP 要求**；但人口分别只有 6.1M / 7.5M / 11.5M，金融广告库存盘子有限。适合用少量高意图页面（房贷、外籍贷款、LTV/DSR）卡位，不建议规模化建站。

### 7.4 尽管流量大，建议**不要**优先

**印度 / 巴西 / 墨西哥 / 印尼**：家庭消费/人 PPP 仅 $6.7k / $14.7k / $16.6k / $9.1k，广告主出价能力低；印度虽英文且流量巨大，但税制层完全另起一套（Sec 24(b)/80C/CIBIL）。**「流量大」在按流量计价的展示广告里不等于「收入高」**。如果要做，请先用 §6 的方法确认这几个国家的每会话收入，再决定是否值得本地化。

### 7.5 一个被忽略的高 ROI 方向

上游 [international-market-differences.md §9.4](./international-market-differences.md) 已指出：**`tools.tableview.dev`（Parquet/DuckDB）与 `compress.tableview.dev`（FFmpeg）对国别制度几乎零依赖**，唯一国别化的是 UI 语言与 AdSense 可用性。如果你的目标是「用最低成本触达非美用户并变现」，**先国际化两个工具站**比先国际化金融站单位投入产出更高；金融站则应聚焦「英文+免 CMP」的四国（美加澳新）。

### 7.6 行动清单

1. **本周**：在 AdSense 后台确认 Privacy & Messaging（认证 CMP）状态；按 §6 建 `Ad revenue per session` 计算指标 + Country 探索。
2. **30 天后**：用实测的「国家 × 每会话收入」重排本文所有 proxy 结论。
3. **若做 EEA**：先上线认证 CMP，再评估欧洲大陆；否则英国/爱尔兰/德国的广告收入会被 NPA 折价。
4. **产品侧**：按上游 benchmark 文件的 §9 顺序（加 → 澳 → 爱 → 英 → 新）排期，唯一需要动核心引擎的是加拿大的半年复利。



---

## 8. 未能核实 (UNVERIFIED)

1. **各国 AdSense RPM / CPC / CPM 的具体数值** —— 无一手来源。Google 不发布国家级价格数据；Keyword Planner 需登录且非可引用文档。任何此类数字均为 **SECONDARY**，本报告不采用。
2. **各国「国家 × 每会话广告收入」的真实值** —— 只有你自己的 GA4 × AdSense 能给出（§6）。本文所有「每访客变现潜力」档位都是**代理指标综合判断，非实测**。
3. **各国按揭/贷款/金融广告支出的国别表** —— 未找到任何监管机构或行业协会的一手统计；厂商数据库（MediaRadar 等）为二手且需订阅。
4. **EEA/UK/CH 失去个性化后广告收入的具体降幅百分比** —— 无一手来源；取决于国家、设备、页面与竞价，必须自行 A/B 实测。
5. **IAB Europe AdEx 2025 的逐国一手明细** —— 公开新闻稿只有欧洲合计（€131.1bn / +10.5%）与区域定性；逐国数字（英国/德国/法国为前三等）来自二手媒体转述，本文仅标 SECONDARY 且不引用其金额。
6. **Google 认证 CMP 在你线上站点的实际启用状态** —— 仓库源码中未发现认证 CMP 集成（grep 无命中），但这**不能证明**线上未通过 AdSense 后台启用；需在 AdSense 后台确认。
7. **「金融计算器」的国别搜索量级** —— Keyword Planner 需登录，无法作为一手引用（与上游结论一致）。
8. **阿联酋部分收入指标的年份滞后** —— 世界银行 API 对该国返回 2024（GNI/GDP PPP）与 2023（家庭消费）数据，晚于其余国家的 2025。
9. **日本/新西兰的家庭消费/人 PPP 为 2024 年**（其余国家为 2025 年），跨年比较时需注意。
10. **中国的任何数值** —— 结构性排除（ICP 备案 + Google 全栈不可达，上游 §7.2），故不列具体收入/广告数据。
11. **新加坡/香港/阿联酋的金融广告库存规模** —— 未找到一手国别数据；「高价值小盘」是据收入与人口结构的推断，非实测广告支出。

---

## 参考资料 / Sources

### 收入与购买力（Tier 1，一手）
- **World Bank — World Development Indicators（经官方 API 直接取数）**：GDP per capita `NY.GDP.PCAP.CD`；GNI per capita, PPP `NY.GNP.PCAP.PP.CD`；GDP per capita, PPP `NY.GDP.PCAP.PP.CD`；Household final consumption expenditure, PPP `NE.CON.PRVT.PP.CD`；Population `SP.POP.TOTL`。数据更新时间 2026-07-13。[https://api.worldbank.org/v2/](https://api.worldbank.org/v2/)（示例：[US GDP/cap](https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.PCAP.CD?format=json)）

### 广告市场规模（Tier 1，官方/行业协会）
- **IAB / PwC** — Internet Advertising Revenue Report, Full Year 2025（美国 $294.6B，+13.9%，2026-04-16）：[IAB news](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/) · [PDF](https://www.iab.com/wp-content/uploads/2026/04/IAB_PwC_Internet_Ad_Revenue_Report_Full_Year_2025_April_2026.pdf)
- **IAB Europe** — AdEx Benchmark 2025（欧洲 €131.1bn，+10.5%，2026-07-07）：[新闻稿](https://iabeurope.eu/iab-europes-adex-benchmark-2025-report/)
- **IAB UK** — Digital Adspend 2025（英国数字广告 £40.5bn）：[IAB UK](https://www.iabuk.com/news-article/digital-adspend-2025-uks-digital-ad-market-reaches-ps405bn)
- **AA / WARC** — UK ad spend rose 11.4% to £12.5bn in Q3 2025（2025 全年 £46.9bn，2026-01-29）：[WARC](https://www.warc.com/en/press/press-releases/26-01-29_uk-ad-spend-rose-11-to-12bn-in-q3-2025)
- **IAB Australia / PwC** — Internet Advertising Revenue Report, CY2025（A$18.4bn，+11.5%）：[PDF](https://www.iabaustralia.com.au/wp-content/uploads/2026/03/IAB-Australia-Internet-Advertising-Report-Q4-25_FINAL_PDF.pdf)
- **IAB Canada** — 2024 Internet Ad Revenue Survey and 2025 Forecast（C$18.2bn，+14.3%，2025-10）：[PDF](https://iabcanada.com/wp-content/uploads/2025/10/IAB-Canada-Revenue-Survey-2024-Final-v2b.pdf)
- **Dentsu（電通）** — 2025 Advertising Expenditures in Japan（互联网广告 ¥4,045.9bn，+10.8%；总额 ¥8,062.3bn；互联网占比 50.2%，2026-03-05）：[Dentsu EN](https://www.dentsu.co.jp/en/news/release/2026/0305-011007.html)
- **OVK / BVDW** — OVK-Report 2026（德国在线展示+视频 €7.5bn，+9.6%；2026 预测 €8.2bn）：[PDF](https://www.ovk.de/wp-content/uploads/2026/03/260226_OVK-Report_2026_01.pdf)

### Google 第一方文档（Tier 1）
- [AdSense availability（可用国家正面清单）](https://support.google.com/adsense/answer/13402307)
- [Understanding AdSense country restrictions](https://support.google.com/adsense/answer/6167308)
- [Add your payment method for AdSense or AdSense for YouTube](https://support.google.com/adsense/answer/1714397)
- [Payment thresholds（USD $100 / GBP £60 / EUR €70 / AUD A$100 / CAD C$100 / HKD HK$800）](https://support.google.com/adsense/answer/1709871)
- [Set up and manage your Consent Management Platform (CMP)](https://support.google.com/adsense/answer/7670013)
- [Google consent management requirements for serving ads in the EEA, the UK, and Switzerland (for publishers)](https://support.google.com/adsense/answer/13554116)（认证 CMP：EEA/UK 2024-01-16、CH 2024-07-31；"Only traffic from a certified CMP is eligible for personalized ads"）
- [Financial products and services（Google Ads 广告主政策）](https://support.google.com/adspolicy/answer/2464998)
- [Financial Services Verification](https://support.google.com/adspolicy/answer/15332527)
- [Financial Services Verification: Relevant Regulators and Enforcement Dates（UK 2021-09-06、AU 2022-08-30 等）](https://support.google.com/adspolicy/answer/12390454)
- [Introducing New Verification Requirements for Certain Financial Services Advertisers (June 2026)（24 个 EEA 市场，2026-07-23 起）](https://support.google.com/adspolicy/answer/17127726)
- [Restricted targeting in Personalized advertising（美/加信贷类定向限制）](https://support.google.com/adspolicy/answer/143465)

### Google Analytics 4 / AdSense 关联（Tier 1）
- [Link your Google Analytics 4 property with AdSense](https://support.google.com/adsense/answer/6084409)
- [Link AdSense to Google Analytics](https://support.google.com/analytics/answer/13610380)
- [Publisher ads report（Advertising → Publishing → Publisher Ads；指标 Total ad revenue / impressions / clicks / ad unit exposure）](https://support.google.com/analytics/answer/12925552)
- [Create calculated metrics（标准属性 5 个 / 360 属性 50 个）](https://support.google.com/analytics/answer/14166471)
- [GA4 dimensions and metrics — Country（IP 派生） / Region / City](https://support.google.com/analytics/answer/12948931)
- [User attributes overview（Active users by Country）](https://support.google.com/analytics/answer/13823984)
- [About the Countries report（AdSense 按国家收入）](https://support.google.com/adsense/answer/9974594)

### Tier 2（SECONDARY，仅作相对次序/结构参考，不作数值引用）
- Ranktracker — *Geographic Variations in CPC and RPM for AdSense*（2025-01-27）：定性排序（购买力越高、竞争越强 → CPC/RPM 越高）。[链接](https://www.ranktracker.com/blog/geographic-variations-in-cpc-and-rpm-for-adsense/)
- Didomi — *What is the average consent rate in Europe in 2026?*（2026-03-19；consent rate 75.1%–89.3%，opt-in 55.7%–67.6%，法国 71%）。[链接](https://www.didomi.io/blog/benchmark-average-consent-rate-europe)
- arXiv 2606.31485 — *A history of GDPR cookie banner compliance*（2026；30 国 11,364 站）。[链接](https://arxiv.org/abs/2606.31485)
- Telecompaper — *UK en Duitsland domineren Europese digitale advertentiemarkt*（2026-07-13；转述 IAB Europe AdEx 逐国值）。[链接](https://www.telecompaper.com/nieuws/uk-en-duitsland-domineren-europese-digitale-advertentiemarkt--1576901)

### 本仓库代码事实（非外部来源，用于 §5.4 与 §6）
- `apps/finance/index.html`、`apps/tools/index.html`、`apps/compressor/index.html`：Consent Mode v2 默认 denied 内联脚本；AdSense `ca-pub-3414270480046504` 脚本无条件加载
- `apps/{finance,tools,compressor}/src/lib/consent.ts`：`GA4_MEASUREMENT_ID = 'G-JJBNH56W95'`；basic consent mode（同意前不发请求）
- `apps/{finance,tools,compressor}/src/data/adSlots.ts`：`ADSENSE_CLIENT = 'ca-pub-3414270480046504'`
- 全仓库 grep 未命中任何认证 CMP 供应商关键字（fundingchoices / privacy-messaging / onetrust / didomi / usercentrics 等）

### 上游文档（交叉引用，不重复其结论）
- [international-market-differences.md](./international-market-differences.md)
- [financial-calculator-benchmark-by-country.md](./financial-calculator-benchmark-by-country.md)
- [us-financial-calculators-market-demand-analysis.md](./us-financial-calculators-market-demand-analysis.md)

