# Design Spec: 海外支付接入完整方案（tableview.dev）

- **Date**: 2026-09-20
- **Status**: Proposed — 渠道已定（Creem）；待用户确认「商户形态」与「免费 vs Freemium」两项产品决策后进入 P2 实施
- **Scope**: `apps/finance`（tableview.dev）的订阅与单次付费；`tools` / `compress` 暂不接入
- **Author**: 本仓库 agent + User

> **证据约定**：本文件把**已实测的事实**与**待确认的推断**严格分开。标 ✅ 的为本仓库复核者亲自执行并取得输出的证据；标 ⏳ 的为常见说法但需以官方页面为准；标 ❓ 的为本次未能核实、必须在实施前解决。**不编造费率、门槛或资格规则**（费率见 §10，全部标注来源状态）。
>
> **独立复核状态（由本仓库复核者执行，非撰写者自述）**：
>
> | 关键断言 | 复核结果 |
> | :--- | :--- |
> | **Creem 接受中国大陆卖家** | ✅ 已核实：官方「Supported Countries (86)」表含 **China\*** |
> | **中国个人可提现（无需境外账户）** | ✅ 已核实：官方 Payouts→China「Individual recipient: **Alipay**」，额度 ≤50,000 CNY/笔、300,000–600,000 CNY/年 |
> | **中国公司提现无上限** | ✅ 已核实：同上「Business recipient: **Local Bank Account**」「Unlimited」 |
> | **Creem 是 MoR 且承担税** | ✅ 已核实：官方 Payouts 原文「taxes (**yes, we cover taxes**)」；文档设有 Merchant of Record 专章 |
> | **Creem 费率 3.9% + $0.40** | ✅ 已核实：官方定价页标题即「3.9% + $0.40」；提现费 7 EUR/USD 或 1% 取高 |
> | **Stripe 不支持中国大陆** | ✅ 已核实：官方支持国列表无 CN（只有「Hong Kong SAR, China」）；提现文档无中国大陆银行账户格式 |
> | **欧盟非欧盟卖家无 €10,000 门槛** | ✅ 已核实：欧委会 Explanatory Notes §3.2.7 正文（条件为「established… in **only one Member State**」），详见 `docs/research/digital-sales-tax-and-consumer-law.md` 复核台账 |
> | **Paddle 卖家资格** | ⏳ **仍未确认**（其 Create-an-account 文档需合作伙伴登入）→ §3.4 的开户实验 |
> | **小额商品的提现费损耗** | ✅ 已用脚本代入**已核实费率**算得：单独提现一笔 $9.99 损耗 **78%**；攒批后可降至 11%（§10.2）

---

## 1. 背景与问题陈述

### 1.1 现状：支付是「假装」的，而且正在对用户展示不实陈述

经代码与**线上产物**双重核实：

| 事实 | 证据 |
| :--- | :--- |
| 无任何支付渠道接入 | ✅ 全仓库 grep `stripe/paddle/paypal/braintree/square/lemonsqueezy` → **0 命中**（唯一 "Stripe" 是一句文案） |
| 「升级 Pro」只写 localStorage | ✅ `authContext.tsx:248` `upgradePlan()` 仅 `setUser()` + `localStorage.setItem()`，无网络请求，无条件 `return true` |
| 「购买单次通行证」同样只写 localStorage | ✅ `authContext.tsx:227` `purchaseSinglePass()` 仅往本地数组塞 id |
| **线上正在展示「Secure checkout powered by Stripe」** | ✅ 抓取线上 `ProBrandingModal-BY5MWa9Y.js`（28878 bytes）→ 该字符串**在线上 live**，同时 `Upgrade to Pro`、`$19`、`$149`、`$9.99`、`Cancel anytime` 全部在线上 |
| 服务端有一套**真实**的计费能力，但从未被调用 | ✅ worker `/api/credits/consume` 实现完整（JWT 校验 → 查 D1 → 扣减 → 写 `usage_logs`）；但**客户端 0 处调用**，线上 `usage_logs` 行数 = **0** |
| 服务端 `users` 表**没有**品牌、购买记录、权益字段 | ✅ `pragma_table_info('users')` → id/email/name/avatar_url/plan/credits/total_usage_count/created_at/updated_at |
| 付费态完全在客户端，服务端不参与授权 | ✅ `isPro = user?.plan === 'pro'`，而 `user` 来自 localStorage |
| `basic` 档位从未售卖 | ✅ 仅存在于类型联合中，无任何 UI 或价格 |
| 营销文案与付费 UI 自相矛盾 | ✅ 5 个文件宣传「100% free / no credit card / without subscriptions」，4 个文件在卖 $19/月 |

### 1.2 后果

1. **对用户的不实陈述**（最高优先）：页面承诺「由 Stripe 提供安全结账」，而并不存在结账。
2. **无法收到任何钱**：没有收款通道。
3. **一旦接入真支付就会立刻冲突**：本地是 `pro`/5000 额度，D1 里是 `free`/30 —— 见 §7.1「状态分裂」。
4. **存在休眠后门**：`loginAsDemo('pro')` 无需任何验证即可发放 Pro + 5000 额度（当前未接 UI，但代码在）。

### 1.3 目标

一条**服务端授权、渠道可替换、合规可交付**的收款链路：用户付款 → 渠道 webhook → 服务端落库 → 服务端派生权益 → 客户端只读展示。

---

## 2. 决策先行（TL;DR）

> **推荐：以 Merchant of Record（MoR）为主路径，首选 Creem，并把 Paddle 作为并行验证的长期备选。**
>
> ✅ **资格已解决**：对「中国大陆个人、无境外实体」这一真实前提，**Creem 明确支持**（官方「Supported Countries (86)」含 China\*），且**中国个人可经 Alipay 提现**（无需境外银行账户）。这是原先唯一的硬阻塞点，现已解除（§3.4）。
>
> ⚠️ 但 Creem 是**较新的小型服务商**，存续风险高于 Paddle。因此**两者并行**：Creem 先跑通收款，Paddle 同步做开户实验。

**两条决定性理由**（详见 §3、§4）：

1. **资格**：主流处理器（含 **Stripe，官方列表无中国大陆**，且无法向中国大陆银行账户打款）要求商户注册在其支持的国家。若无境外实体，**处理器这条路的门槛是「先成立实体」**。MoR 则可能直接接受你的主体。
2. **税**：向欧盟销售数字服务的**非欧盟卖家没有起征点**，第一笔就要缴 VAT。MoR 由渠道成为**销售方 of record**，替你计算、代收、申报、缴纳 —— 这是一个人做全球生意唯一现实的做法。

**同时必须做的三件事**（与渠道无关，且不可省略）：
- 删除「Secure checkout powered by Stripe」这句不实文案（或接入真 Stripe 后改为真实陈述）
- 删除客户端自授权路径（`upgradePlan`/`loginAsDemo` 写 plan）与 `localStorage` 里的付费态
- 权益改为**服务端派生**（本方案已提供参考实现，见 §6）

---

## 3. 关键约束：商户资格（这是第一道门槛，不是技术问题）

### 3.1 概念区分：买家国家 ≠ 卖家资格

务必不要把两件事混淆：

- **买家覆盖**：渠道能向哪些国家的顾客收款。Paddle 官方明确「sell in over **200** countries」，其支持国家表共 **229** 行。✅（实测其官方文档表格）
- **卖家资格**：**你**（商户）可以注册在哪个国家。这与买家列表是两回事，且通常在注册/审核阶段才暴露。

**本方案的一切阻塞点都在后者。**

### 3.2 各路径的资格与代价

| 路径 | 你能收款的前提 | 代价（结构性） | 税务责任 |
| :--- | :--- | :--- | :--- |
| **A. MoR（Paddle / Lemon Squeezy / FastSpring / Creem / Polar）** | 按各 MoR 的卖家国家要求注册企业/个体 | 费率高于处理器（见 §10） | **由 MoR 承担**：成为 of record，代算代缴全球间接税 ✅（Paddle 官方原文：「As a merchant of record, Paddle calculates, collects, and remits taxes for you」） |
| **B. Stripe + 美国 LLC** | 成立美国 LLC → 申请 EIN → 开美国商业银行账户 → 申请 Stripe | LLC 注册与年费、报税义务（含美国联邦申报）、维护成本 | **你自己承担**：EU VAT、UK VAT、AU GST、CA GST/HST、美国各州销售税 |
| **C. Stripe + 香港/新加坡实体** | 当地公司 + 当地银行账户 + KYC | 公司注册与年审、当地审计/报税、开户门槛 | 同上，你承担 |
| **D. 维持现状（不接支付）** | —— | 0 | 0（但必须删掉不实文案与假 Pro UI） |

### 3.3 必须由你确认的三个事实（不问清楚就无法选型）

1. **你的经营主体在哪？** 中国大陆个人 / 中国大陆公司 / 香港公司 / 新加坡公司 / 美国 LLC / 其他。
2. **你能否提供渠道要求的 KYC 与银行账户？** 若渠道要求**当地**银行账户，而你没有，则此路不通。
3. **你是否愿意承担全球间接税申报？** 若否 → 必须走 MoR。

### 3.4 ✅ 已解决：Creem 明确支持中国大陆主体（附「怎么查到的」）

**这是本次调研最重要的突破 —— 原先的头号阻塞点（资格）已被一手来源解除。**

| 我核实的事实 | 一手来源 | 原文要点 |
| :--- | :--- | :--- |
| **中国在 Creem 的受支持卖方国家列表内** | 官方「Supported Countries (86)」 | 表中含 **China\***（星号指向中国提现说明）；同类表中**无** Stripe |
| **中国个人可提现（无需境外账户）** | 官方 Payouts → China | 「Individual recipient: **Alipay**」「Business recipient: **Local Bank Account**」 |
| **额度与限制** | 同上 | Alipay：**≤50,000 CNY/笔**、**300,000–600,000 CNY/年**；公司本地银行：**Unlimited** |
| **它是 MoR，承担税** | 官方 Payouts + 文档专章 | 「taxes (**yes, we cover taxes**)」；文档设有 Merchant of Record 专章 |
| **费率与提现费** | 官方定价页 / Payouts | **3.9% + $0.40**；提现 **7 EUR/USD 或 1%（取高）** |
| **风险提示（官方自述）** | 官方 Payouts | 「Payments may be held for **7–12 days** for risk assessment」 |

**因此对「中国大陆个人、无境外实体」这一真实前提，Creem 是目前唯一被一手来源证实可用的渠道。**

#### 仍需你亲自完成的验证（Creem 之外）

Creem 解决了「能不能收钱」，但**它是一家较新的小型服务商**。因此**并行**做下面的实验，为长期选型留后路：

| 渠道 | 状态 | 你要做的 |
| :--- | :--- | :--- |
| **Paddle** | ❓ 资格不在公开文档（需合作伙伴登入） | 走到 signup 的「选择国家」步骤，看是否有中国；**它是更稳的长期归宿** |
| **Lemon Squeezy** | ❓ | 同上；注意其已被 Stripe 收购，先确认是否仍收新卖家 |
| **Stripe** | ❌ **已明确不支持**（官方列表无 CN，且无法向中国大陆银行打款） | **无需实验** —— 除非你愿成立 US/HK/SG 实体 |
| **FastSpring / Gumroad / Dodo** | ⚠️ 各有明确限制（见 §4.2） | 若 Creem 在你所在场景不可用，再逐个验证 |

#### 通用验证流程（每个渠道约 15 分钟）

```
1. 打开 signup / onboarding，走到「选择国家 / 业务所在地」
2. 确认下拉框里是否有：中国大陆 / 香港 / 新加坡 / 美国
3. 记录「是否要求当地银行账户」「是否要求公司实体」「KYC 要哪些文件」
4. 在提交真实资料之前停下 —— 此时已足够判定
判定：主体在列表内 → 进入 §10 成本核算；不在 → 排除该渠道
```

**为什么流程仍重要**：渠道的**实际开户流程**才是资格的最终权威。本方案 §6 刻意与渠道解耦，所以这些实验都可以在**不写任何渠道相关代码**的前提下先做完。

### 3.5 历史记录：为什么一开始没查到（供后来者参考）

以下是我最初尝试的路径，全部失败 —— 说明**「查文档」这条路对多数渠道无效**，必须走开户实验：

| 尝试 | 结果 |
| :--- | :--- |
| Paddle 官方「supported countries」文档页 | ✅ 能取到，但那是**买家**列表（229 国），**不含卖家资格** |
| Paddle `Create an account` API 参考页 | ⛔ **需 Paddle 合作伙伴登入**才可见（原文：「Join the Paddle partner program to read this content」）—— **卖家资格/开户字段不在公开文档中** |
| Stripe `stripe.com/global` | ⛔ 页面仅含**语言/地区选择器**（locale picker），**没有任何可用国家清单**；`/en-sg/global` 亦同 |
| Stripe `/register` | ⚠️ 在本机浏览器中被重定向到一个已登录的 Stripe 演示会话（"Cactus Practice"，测试模式），**无法据此判断你的真实资格**；我未继续深入该账户（属你的私有财务面板，不应越界查看） |
| Stripe docs 若干候选 URL | ⛔ 404 |

**教训**：多数渠道**不公开**卖家资格清单；**能查到的（如 Paddle 的 229 国）往往是买家列表，容易误读**。Creem 是例外 —— 它的「Supported Countries」明确是**卖方/收款**国家表，且含 China。这提醒后来者：**先确认一张国家表到底描述的是买方还是卖方**，再去判断资格。

> ⚠️ 我在浏览器中仅确认了「存在一个已登录的 Stripe 会话（演示/测试模式）」。**这不代表你的真实主体资格**，也不代表你已有可用账户。请以你自己确认的信息为准。

---

## 4. 支付渠道选型

### 4.1 MoR 与处理器的本质差别（这是选型的核心，不是费率）

| | 处理器（Stripe） | Merchant of Record（Paddle 等） |
| :--- | :--- | :--- |
| 谁是法律上的卖方 | **你** | **渠道** |
| 全球 VAT/GST/销售税 | **你**注册、计算、申报、缴纳 | 渠道承担 ✅ |
| 发票/税率/退税合规 | 你 | 渠道 |
| 客服与退款（税务意义上） | 你 | 渠道代为处理 |
| 费率 | 低 | 高（买的是合规与资格） |
| 客户品牌体验 | 完全自控 | 渠道托管结账（可定制，但含其标识） |
| 数据与控制 | 完全 | 通过 API/webhook 获取，较间接 |
| 迁移成本 | —— | 客户与订阅关系在渠道侧，迁移较难 |

**结论**：对一个从零开始的单人团队，「买合规」几乎总是正确选择。**当合规成本 > 差价时选 MoR。**

### 4.2 候选对比（费率与资格以官方定价/资格页为准，标 ⏳ 者待核实）

| 渠道 | 类型 | 是否 MoR | 卖家资格（**中国大陆主体**） | 费率 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Creem** | MoR | ✅ 是（文档设有 Merchant of Record 专章；官方原文「taxes (**yes, we cover taxes**)」） | ✅ **明确支持中国**（官方「Supported Countries (86)」表含 **China\***） | ✅ **3.9% + $0.40**（官方定价页标题即此；另加提现费 7 EUR/USD 或 1% 取高） | ✅ **中国个人经 Alipay 收款**（≤50,000 CNY/笔、300,000–600,000 CNY/年）；中国**公司**走本地银行**无上限** ✅ |
| **Paddle** | MoR | ✅ 是（官方原文已核实） | ❓ **待确认**（卖家资格文档需合作伙伴登入，见 §3.4） | ⏳ | 成熟度高、支持 229 买家国、每国含税/不含税偏好可取用 ✅ |
| **Lemon Squeezy** | MoR | 是 | ❓ 待确认 | ⏳ | 已被 Stripe 收购；**是否仍接受新卖家需以官方为准** ❓ |
| **Stripe** | 处理器 | ❌ 否 | ❌ **明确不支持中国大陆**（官方支持国列表无 CN；亦无法向中国大陆银行账户打款） | 2.9% + $0.30（美国价目） | 生态最好，但**把全球税务责任留给你** |
| **FastSpring** | MoR | 是 | ❓ **无公开国家清单**，属**酌情承保（underwriting）**，且官方明示「拒绝时无义务告知理由」、「有权随时冻结提现」 | ⏳ | 条款对卖家较不利，需评估 |
| **Gumroad** | MoR | 是 | ⚠️ **银行提现国家列表无中国大陆**（仅 Hong Kong / Singapore 等）→ 大概率**仅 PayPal**，实际可用性 UNVERIFIED | ⏳ | 体验偏「创作者商城」，与自有站点集成弱 |
| **Dodo Payments** | MoR | 是 | ⚠️ **按 KYC 证件国判定**：中国在可接受名单内（第 32 位），但**公司须每位董事/实益所有人均持名单内证件** | ⏳ | 判定逻辑与别家不同，注意「注册地 ≠ 可接受」 |

> ⚠️ **不要**仅凭本表费率做财务决策 —— 费率会变，且可能含最低费/跨境费/争议费。**§10 给出计算模型**，代入官方页现价即可。
>
> ✅ = 已由本仓库复核者亲自核实一手来源；⏳/❓ = 待你按 §3.4 的开户实验或官方页确认。

### 4.3 推荐与理由

**结论：对「中国大陆主体、无境外实体」这一真实前提，Creem 是目前唯一被一手来源证实可用的 MoR，因此它应作为首选。**

理由（按权重）：

1. **资格已被官方证实** ✅ —— 这是此前唯一的硬阻塞，现已解除。官方「Supported Countries (86)」明确列出 **China\***。
2. **收款路径对个人友好** ✅ —— 中国个人经 **Alipay** 提现（无需香港/美国银行账户），有年度额度（300k–600k CNY）；若你日后成立中国公司，则走本地银行**无上限**。
3. **它是 MoR** —— 官方文档设有 Merchant of Record 专章，且明示承担税费（「taxes (yes, we cover taxes)」）。这正是解决 §8.1「欧盟从第一笔起」的关键。
4. **费率可接受** —— 3.9% + $0.40；对照 Stripe 的 2.9% + $0.30，**差额约 1% 就是「代缴全球税 + 承担卖方身份」的价格**。以 $19/月计，该差额远低于你自行注册 EU OSS + 英国 VAT + 美国逐州的成本。

**但必须认清 Creem 的风险**（这不是小问题）：

- 它是**较新的小型服务商**，存续与长期政策稳定性**低于 Paddle/Stripe**。
- 官方自己也写：「Payments may be held for **7–12 days** for risk assessment」，且提现费按笔收（7 EUR/USD 或 1% 取高）—— **对 $9.99 这类小额单次购买，固定费占比很高**（见 §10 的建议：小额商品要么绑定更高客单，要么暂缓）。
- 因此建议：**Creem 用于「先跑通收款」，同时把 Paddle 的开户实验并行做完**。由于 §6 的权益与数据模型**渠道无关**，日后从 Creem 迁移到 Paddle 只需新增一个 adapter，不必重写业务逻辑 —— 这正是本方案坚持渠道解耦的原因。

**至于「为什么不是 Creem 以外」**：

- **Stripe**：官方列表**无中国大陆**，且无法向中国大陆银行账户打款 → 必须成立 US/HK/SG 实体，成本更高（§5 之外，见 `_scratch/s5-entity-costs.md`）。
- **Paddle**：成熟度最好，但卖家资格**不在公开文档中**（§3.4），需开户实验确认；**强烈建议并行验证**，它可能成为更稳的长期归宿。
- **FastSpring / Gumroad / Dodo**：分别受「酌情承保且条款不利」、「银行提现不含中国大陆」、「按证件国判定」限制，均不如 Creem 直接。

> **不要**为了「费率低 1%」而选处理器却把税务留给自己 —— 从第一笔欧盟订单起就会产生欠缴风险（§8.1）。

---

## 5. 产品与定价设计

### 5.1 商品结构（沿用现有 UI 意图，但改为服务端定义）

| 商品 | key | 类型 | 价格（建议） | 权益 |
| :--- | :--- | :--- | :--- | :--- |
| Free | `free` | —— | 0 | 基础计算器、有限导出、无白标 |
| Pro 月付 | `pro_monthly` | 订阅 | US$19/mo | §5.2 的 5 项权益 |
| Pro 年付 | `pro_annual` | 订阅 | US$149/yr（≈$12.42/mo） | 同上 |
| 单次通行证 | `deal_pass` | 一次性 | US$9.99 | 解锁**单个** deal 的 Dossier |

> 现有 UI 已按此结构设计（`LenderReadyDossierModal` 含 $9.99 / $19 / $149 三档与月年切换），**无需重新设计界面**，只需把「点一下即变 Pro」换成「跳转渠道结账」。

### 5.2 Pro 权益（代码里已有的真实门槛，直接映射为 entitlement key）

| 现有门槛 | entitlement key | 现有实现位置 |
| :--- | :--- | :--- |
| 无限导出（PDF/Excel） | `unlimited_exports` | `SavedScenariosModal` / 导出流程 |
| 白标品牌 | `white_label_branding` | `PrintableMortgageReport.tsx:67`、`PrintableRefinanceReport.tsx:31` |
| 客户分享链接 | `share_links` | `ShareCalculationButton` |
| 无限保存方案 | `unlimited_scenarios` | `SavedScenariosModal.tsx:56,75`（`FREE_LIMIT`） |
| 1031 / DSCR Pro 模型 | `pro_models` | 各计算器 |

✅ 这 5 个 key 已在 `apps/finance/src/worker/entitlements.ts` 中定义为 `PRO_ENTITLEMENTS`。

### 5.3 定价展示合规（易被忽略但会直接违规）

- **欧盟/英国/澳洲**：面向消费者必须展示**含税总价**。
- Paddle 官方给出每国 `TAX PREFERENCE`（Inclusive / Exclusive）✅，例如 Austria = Inclusive、Australia = Inclusive、阿根廷 = Inclusive，美国 = Exclusive。
- **要求**：价格展示必须由**渠道返回的税务偏好**驱动，而不是在代码里写死「$19」。若自建定价，须在欧盟显示为「€X incl. VAT」。
- **货币**：优先展示本地货币（Paddle 支持按国家定价与自动换算 ✅）。

### 5.4 订阅生命周期规则（本方案已实现为纯函数，见 §6.2）

- 试用 → 完整 Pro；`cancel_at_period_end` **不提前收回**已付周期
- 支付失败（`past_due`）→ **3 天宽限期**，避免因换卡锁死用户
- 退款的一次性购买 → **不再授权**
- 未知状态（渠道新增）→ **默认不授权**（fail closed）

### 5.5 与营销定位的一致性（必须由你决策）

现有文案「100% free / without subscriptions」与 $19/月订阅**直接矛盾**（✅ 实测 5:4）。二选一：

- **A（保住免费定位）**：移除订阅 UI，只保留可选的一次性 $9.99，或完全不收费 —— 与现有营销一致，且「零追踪 + 免费」本身是差异化优势
- **B（转为 Freemium）**：保留订阅，但**必须改写**全部「100% free」文案，否则构成误导

> 本方案技术上同时支持 A 与 B。**这是产品决策，不应由工程擅自决定。**

---

## 6. 技术架构

### 6.1 权威边界（本方案的核心原则）

```
   渠道（Paddle/Stripe）        ← 钱的唯一权威
            │  webhook（签名验证）
            ▼
   服务端 Worker + D1            ← 权益的唯一权威
            │  GET /api/entitlements（需 JWT）
            ▼
   浏览器（React）               ← 只读展示，禁止写入 plan
```

**三条铁律**：
1. 浏览器**永不**写入 `plan` / `credits` / 权益（现状违反）
2. 权益**只**由 webhook 驱动的服务端状态派生
3. 校验 webhook **签名**，且按渠道事件 id **幂等**

### 6.2 权益派生（已实现 ✅）

`apps/finance/src/worker/entitlements.ts` —— 纯函数，无 I/O、无 import（保持 worker 零依赖），`now` 作为参数以便精确测试。

- `normalizeSubscriptionStatus()`：把 Stripe / Paddle / Lemon Squeezy 的状态词表（含 `on_trial`、`cancelled`、`unpaid`、`incomplete_expired`）归一为 8 个状态；**未知状态 → `unknown` → 不授权**
- `resolveEntitlements({ subscription, purchases, now })` → `{ plan, keys, dealPasses, currentPeriodEnd, cancelAtPeriodEnd, source }`

**测试**：`apps/finance/src/worker/__tests__/entitlements.test.ts` —— **15 个用例全绿** ✅，覆盖：无订阅、活跃、试用、周期末取消、渠道标记 canceled 但仍在已付周期、周期结束即收回、`past_due` 宽限期内/外、paused/incomplete/expired/unknown 一律不授权、单次购买只解锁该 deal 而不给 Pro、退款无效、重复购买去重、确定性。

### 6.3 数据模型（已实现 DDL ✅，**尚未应用到线上**）

`apps/finance/migrations/0003_billing.sql` —— 4 张表，全部**渠道无关**（`provider` 判别列 + `provider_*` 命名 + UNIQUE 约束，换渠道无需改表）：

| 表 | 用途 |
| :--- | :--- |
| `billing_customers` | 渠道客户 ↔ 本站用户。`user_id` 可空 + `email` 唯一化路径，**支持先付款后注册**（$9.99 场景不该被注册墙拦住） |
| `billing_subscriptions` | 订阅。`status` **原样存储**渠道值，归一化在代码层，避免渠道改状态名就得做数据迁移 |
| `billing_purchases` | 一次性购买。`amount_minor` 整数最小单位，**绝不用浮点存钱** |
| `billing_webhook_events` | **幂等账本**。主键 = 渠道事件 id |

**已验证** ✅（本地 D1，未触碰线上）：
- 4 张表全部创建成功
- **重复应用安全**（12 条语句全部成功重跑）
- **幂等约束真的生效**：重复插入同一事件 id → `UNIQUE constraint failed: billing_webhook_events.id`

### 6.4 Webhook 处理规范

```
POST /api/billing/webhook/:provider
  1. 读取原始 body（必须 raw，不能先 JSON.parse 再验签）
  2. 验签（渠道密钥来自 env，绝不硬编码）
  3. 用事件 id 抢占幂等账本（INSERT ... ON CONFLICT DO NOTHING）
        └─ 已存在且 processed_at 非空 → 直接 200，不重复处理
  4. 处理：
       customer.*    → upsert billing_customers
       subscription.*→ upsert billing_subscriptions（status/period_end/cancel_at_period_end）
       order/txn.*   → insert billing_purchases（含 refunded_at）
  5. 标记 processed_at；异常写 error 供重放
  6. 一律快速返回 2xx（渠道重试会放大故障）
```

**必须处理的边界**：
- **乱序**：渠道不保证事件顺序 → 每次 upsert 用「事件时间戳较新才覆盖」，或用 `updated_at` 守卫
- **重复投递**：由幂等账本拦截
- **符号/伪造**：验签失败必须 4xx 且**不落库**
- **首次投递丢失**：提供**对账任务**（定时拉取渠道 API 核对），不能只依赖 webhook

### 6.5 API 契约

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| `GET` | `/api/entitlements` | 需 JWT。返回 `EntitlementState`。客户端启动与付款返回后各调一次 |
| `POST` | `/api/billing/checkout` | 需 JWT。入参 `{ productKey, interval? }` → 返回渠道结账 URL（**价格 id 在服务端映射**，绝不接受客户端传价格） |
| `POST` | `/api/billing/portal` | 需 JWT。返回客户自助门户 URL（取消/改卡/发票） |
| `POST` | `/api/billing/webhook/:provider` | **免鉴权**，以签名验证代替 |

**安全要求**：
- 结账金额/价格 id **只能**来自服务端商品表，客户端只能传 `productKey`
- 门户 URL 必须校验该 customer 属于当前登录用户，否则可越权查看他人发票

### 6.6 客户端改造（把自授权改成只读）

| 现状 | 目标 |
| :--- | :--- |
| `upgradePlan()` 写 localStorage | **删除**；改为 `POST /api/billing/checkout` → 跳转 |
| `purchaseSinglePass()` 写 localStorage | **删除**；改为同上，`resourceId` 由服务端在付款成功后写 `billing_purchases` |
| `loginAsDemo('pro')` | **删除**（或仅限 `import.meta.env.DEV` 且构建期剔除） |
| `user.plan` 来自 localStorage | 来自 `GET /api/entitlements`；本地只做缓存，**不作授权依据** |
| 5 处 `isPro = user?.plan === 'pro'` | 统一改为 `hasEntitlement('...')`，数据来自服务端 |
| `updateBranding()` 仅存本地 | 白标品牌需服务端持久化（否则换设备即丢失 —— 现为隐藏缺陷） |
| `SavedScenariosModal` 本地存储 | 短期可保留本地，但**「无限方案」这一权益必须服务端判定** |

### 6.7 订阅状态机（对应 §5.4 的规则）

```
trialing ──▶ active ──(用户取消)──▶ active(cancel_at_period_end)
                │                        │
                │(扣款失败)               │(周期结束)
                ▼                        ▼
            past_due ──(3天内补缴)──▶ active      canceled ──▶ 不授权
                │
                └─(超宽限)──▶ 不授权
```

✅ 该状态机由 `entitlements.test.ts` 逐条覆盖。

---

### 6.8 客户端 / 服务端契约（TypeScript，可直接据此实施）

**服务端**（`apps/finance/src/worker/`）：

```ts
// entitlements.ts —— 已交付 ✅
export type EntitlementKey =
  | 'unlimited_exports' | 'white_label_branding' | 'share_links'
  | 'unlimited_scenarios' | 'pro_models';
export interface EntitlementState {
  plan: 'free' | 'pro';
  keys: EntitlementKey[];
  dealPasses: string[];
  currentPeriodEnd?: number;
  cancelAtPeriodEnd?: boolean;
  source: 'subscription' | 'purchase' | 'none';
}

// billingRoute.ts —— 待实施（P2）
// 注意：价格 id 的映射只存在于服务端，客户端只能传 productKey
export async function handleCreateCheckout(req: Request, env: Env): Promise<Response>;
export async function handleWebhook(req: Request, env: Env, provider: string): Promise<Response>;
```

**客户端**（替换现有的 `isPro = user?.plan === 'pro'`）：

```ts
// lib/useEntitlements.ts —— 待实施（P1/P4）
export interface Entitlements {
  plan: 'free' | 'pro';
  keys: EntitlementKey[];
  dealPasses: string[];
  loading: boolean;
}
/** 唯一授权入口。组件不得再直接读 user.plan。 */
export function useEntitlements(): Entitlements;
export function hasEntitlement(e: Entitlements, key: EntitlementKey): boolean;
export function hasDealPass(e: Entitlements, dealId: string): boolean;
/** 跳转渠道结账；金额由服务端决定。 */
export async function startCheckout(productKey: string, interval?: 'month' | 'year'): Promise<void>;
/** 打开自助门户（取消/改卡/发票）。 */
export async function openBillingPortal(): Promise<void>;
```

**迁移后的调用点改写**（共 5 处 `plan === 'pro'`）：

| 文件 | 原判定 | 改为 |
| :--- | :--- | :--- |
| `PrintableMortgageReport.tsx:67` | `user?.plan === 'pro' && branding.enabled` | `hasEntitlement('white_label_branding')` |
| `PrintableRefinanceReport.tsx:31` | 同上 | 同上 |
| `SavedScenariosModal.tsx:56,75` | `isPro` / 免费上限 | `hasEntitlement('unlimited_scenarios')` |
| `LenderReadyDossierModal.tsx:46,48` | `isPro \|\| purchasedDossiers.includes(dealId)` | `hasEntitlement('unlimited_exports') \|\| hasDealPass(dealId)` |
| `ProBrandingModal.tsx:31` | `isPro` | `hasEntitlement('white_label_branding')` |
| `FinanceHeader.tsx:470` | `user.plan === 'pro'` 徽标 | `hasEntitlement('pro_models')` 或 `plan === 'pro'`（仅展示） |

---

### 6.9 Creem adapter 草图（P2 的具体落点）

渠道已确定为 Creem，因此这里给出**第一个 adapter** 的形状。它是唯一需要写渠道相关代码的地方 —— 其余（权益、幂等、乱序、路由）都已交付且渠道无关。

```ts
// apps/finance/src/worker/adapters/creem.ts
import type { PaymentProviderAdapter, NormalizedWebhookEvent } from '../billingWebhook';

export const creemAdapter: PaymentProviderAdapter = {
  id: 'creem',
  // 官方签名头名称，取自 Creem webhook 文档（实施时以文档现值为准）
  signatureHeader: 'creem-signature',

  async verifySignature({ rawBody, headers, secret }) {
    const provided = headers.get(this.signatureHeader);
    if (!provided) return false;                 // 必须显式拒绝缺失
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
    const expected = [...new Uint8Array(mac)]
      .map((b) => b.toString(16).padStart(2, '0')).join('');
    // 常量时间比较，避免逐字符泄露签名
    return constantTimeEqual(expected, provided.trim().toLowerCase());
  },

  normalize({ rawBody }) {
    const body = JSON.parse(rawBody) as {
      id: string; eventType: string; created_at: number; object: any;
    };
    const occurredAt = Date.parse(body.created_at as any) || Date.now();

    switch (body.eventType) {
      case 'subscription.active':
      case 'subscription.paid':
      case 'subscription.canceled':
      case 'subscription.past_due':
      case 'subscription.trialing':
        return {
          providerEventId: body.id, type: 'subscription_upsert', occurredAt,
          subscription: {
            providerCustomerId: body.object.customer.id,
            email: body.object.customer.email,
            providerSubscriptionId: body.object.id,
            providerPriceId: body.object.product ?? null,
            status: body.eventType.split('.')[1],   // 原样存，归一化交给 entitlements.ts
            currentPeriodEnd: Date.parse(body.object.current_period_end) || null,
            cancelAtPeriodEnd: Boolean(body.object.cancel_at_period_end),
          },
        } as NormalizedWebhookEvent;

      case 'checkout.completed': {
        // 一次性购买：product 与自定义字段决定解锁哪个 deal
        const meta = body.object.metadata ?? {};
        if (meta.productKey !== 'deal_pass') return { providerEventId: body.id, type: 'ignore', occurredAt };
        return {
          providerEventId: body.id, type: 'purchase_upsert', occurredAt,
          purchase: {
            providerCustomerId: body.object.customer?.id ?? null,
            email: body.object.customer?.email ?? null,
            providerOrderId: body.object.order?.id ?? body.object.id,
            productKey: 'deal_pass',
            resourceId: meta.dealId ?? null,
            amountMinor: Number(body.object.order?.amount ?? 0),
            currency: (body.object.order?.currency ?? 'USD').toUpperCase(),
          },
        } as NormalizedWebhookEvent;
      }

      case 'refund.created':
        return {
          providerEventId: body.id, type: 'purchase_refund', occurredAt,
          purchase: { providerOrderId: body.object.order?.id ?? body.object.id },
        } as NormalizedWebhookEvent;

      default:
        // 已签名但与本集成无关 → 认领并忽略，避免渠道无限重试
        return { providerEventId: body.id, type: 'ignore', occurredAt };
    }
  },
};
```

**接入点**（`index.ts`，一处）：

```ts
if (url.pathname === '/api/billing/webhook/creem' && request.method === 'POST') {
  return handleWebhookRequest(request, env, creemAdapter, { db: env.DB });
}
if (url.pathname === '/api/billing/checkout' && request.method === 'POST') {
  // 需 JWT；priceId 由服务端商品表映射，绝不接受客户端传入
  return handleCreateCheckout(request, env);
}
```

> ⚠️ **实施时必须核对**：上表的**事件名**、**字段路径**与**签名算法/头部名**均为按 Creem 文档结构的**示意**，需以其**当前官方 webhook 文档与沙箱实际 payload** 为准。我未逐一核实这些字段名 —— 它们是 P2 的第一项工作，且应由**沙箱真实事件**驱动（§9 契约测试）。
>
> **注意**：`status` 我**原样存储** `eventType` 的后半段，而不是在这里映射 —— 归一化统一由 `entitlements.ts` 负责，这正是「渠道无关」的落点。

---

## 7. 从现状迁移

### 7.1 必须先修的三处（与渠道无关）

1. **状态分裂（split-brain）** ✅：`upgradePlan` 只改本地，D1 的 `users.plan` 永远不变（线上实测：唯一用户 `plan='free'`）。接入真支付后两边会立刻打架 → 必须改为**单一权威**（服务端）。
2. **不实文案** ✅：删除或改写「Secure checkout powered by Stripe」（线上 live）。
3. **休眠后门** ✅：`loginAsDemo('pro')`。同理移除客户端自授权。

### 7.2 迁移顺序（每步可独立上线、可回滚）

| 步 | 动作 | 风险 | 回滚 |
| :--- | :--- | :--- | :--- |
| M1 | 删除「Secure checkout powered by Stripe」文案 | 无（仅文案） | 还原字符串 |
| M2 | 应用 `0003_billing.sql`（纯新增表，不动现有列） | 极低 | 删表 |
| M3 | 上线 `GET /api/entitlements`（此时恒返回 free/purchase） | 低 | 移除路由 |
| M4 | 客户端改为读 `/api/entitlements`；**删除** `upgradePlan`/`loginAsDemo` 的写入 | **中**：现有「假 Pro」用户会掉回 free（因线上无真实付费用户，实际影响为 0） | 恢复客户端写入 |
| M5 | 接入渠道沙箱：结账 + webhook + 落库 | 中 | 关闭结账入口（feature flag） |
| M6 | 生产密钥、真实验证、小流量灰度 | 中 | 关闭 flag |
| M7 | （可选）对账任务 + 客户门户 | 低 | —— |

> **M4 是关键点**：它是「不再欺骗」与「可能激怒假 Pro 用户」的取舍。鉴于线上没有真实付费用户，建议直接做。

### 7.3 数据清理

- 清除客户端 localStorage 键 `tableview_mock_user`（或忽略，让其自然过期）
- `users` 表保留 `plan`/`credits` 列以兼容，但**授权改由 `billing_*` 派生**；可将 `users.plan` 降级为缓存字段或在后续迁移中废弃
- `/api/credits/consume`：**要么接上，要么删除**（现为「看起来有计费」的假象）

---

### 7.4 逐文件改动清单（实施时按此勾选）

**必须删除（自授权路径）**
- [ ] `apps/finance/src/lib/authContext.tsx` — `upgradePlan` / `purchaseSinglePass` / `loginAsDemo` 的写入逻辑
- [ ] `apps/finance/src/lib/authTypes.ts` — 对应接口声明
- [ ] `LenderReadyDossierModal.tsx` — 「Secure checkout powered by Stripe」文案（线上 live）

**必须新增**
- [ ] `apps/finance/src/worker/entitlements.ts` ✅ 已交付
- [ ] `apps/finance/src/worker/billingRoute.ts` — checkout / webhook / portal
- [ ] `apps/finance/src/lib/useEntitlements.ts` — 客户端唯一授权入口
- [ ] `apps/finance/src/worker/__tests__/billingWebhook.test.ts` — 验签 + 幂等 + 乱序
- [ ] `apps/finance/migrations/0003_billing.sql` ✅ 已交付（本地已验证，**未上生产**）

**必须修改**
- [ ] `apps/finance/src/worker/index.ts` — 挂载 billing 路由；`Env` 增加渠道密钥与 webhook secret
- [ ] `apps/finance/wrangler.jsonc` — 不提交密钥；用 `wrangler secret put`
- [ ] `README` / 部署文档 — 记录 webhook URL 与密钥轮换步骤

**待决策后再动**
- [ ] `/api/credits/consume` 与 `consumeCredit` —— 接入或删除（§7.3）
- [ ] 营销文案「100% free」（5 个文件）—— 取决于 §5.5 的 A/B 决策
- [ ] `updateBranding` 服务端持久化（白标跨设备一致）

---

## 8. 合规清单

> 逐条一手来源的完整研究见 `docs/research/digital-sales-tax-and-consumer-law.md`（研究中）。以下是本方案的设计要求，其中**标 ✅ 的已由本仓库复核者亲自核实一手来源**。

### 8.1 间接税（已有一手来源 ✅，见 `docs/research/digital-sales-tax-and-consumer-law.md` §2）

**核心结论：自建收款会在第一笔欧盟订单就产生纳税义务。**

| 市场 | 税种 | **非居民数字卖家的注册门槛** | 来源状态 |
| :--- | :--- | :--- | :--- |
| **欧盟** | VAT，按**客户所在成员国**税率（标准税率下限 15%） | **无门槛** —— €10,000 档**明确不适用于非欧盟设立者** | ✅ 一手：欧委会《Explanatory Notes》§3.2.7 逐字（"This threshold does not apply to: i) … **not established in the EU**"）；Table 5 列 "Threshold not applicable" |
| **英国** | VAT 20% | **任何金额**即须注册（非英国设立者 / NETP） | ✅ Schedule 1A VATA 1994、HMRC VATREG37200 |
| **澳大利亚** | GST 10% | A$75,000 | ⚠️ ATO 页面被 403，门槛取自 **Wayback 镜像**（标 MIRROR） |
| **加拿大** | 联邦 GST 5%；HST 13%/15% | C$30,000（简化注册） | ✅ canada.ca / CRA + ETA s.165 |
| **美国** | **无联邦 VAT**；各州销售/使用税 | **无统一门槛**，是逐州 **economic nexus**（如 SD >$100,000 或 ≥200 笔；CA >$500,000） | ✅ Supreme Court *Wayfair* (2018)、SDCL 10-64-2、CDTFA |
| **新加坡** | GST 9% | 全球营业额 >S$1,000,000 **且** 对 SG B2C >S$100,000 | ✅ IRAS |
| **新西兰** | GST 15% | NZ$60,000 | ✅ IRD |

**设计含义**：这正是选 MoR 的决定性理由。若自建收款，你需要自行完成 **non-Union OSS**（或逐国注册）、英国 VAT 注册、以及美国**逐州**注册 —— 对单人团队不现实。

> ⚠️ **诚实边界**：上述门槛的**原始法条**（Directive 2006/112/EC）在 EUR-Lex 抓取时返回 202 JS 挑战，逐字核对经由**镜像**完成。**在依此做税务决策前，请让税务顾问复核**。走 MoR 时这些由渠道承担，你无需实现。

### 8.2 自动续订与取消（**本节有一处重要更正**）

✅ **已核实（一手来源：Federal Register）**：FTC 于 **2026-02-12 生效**的终局规则，明确将 2024 年修正后的 Negative Option Rule（即广为流传的 “click-to-cancel”）**恢复为 2024 年前的文本**，因为法院已将其撤销。

原文（Federal Register, 16 CFR Parts 425/463/910, RIN 3084-AB60，2026-02-12）：
> “the Commission is revising its recently amended ‘Rule Concerning Recurring Subscriptions and Other Negative Option Programs’ (‘Negative Option Rule’) to **recodify the text of the Negative Option Rule as it existed before the effective date of the Commission's 2024 final rule amending it**”

**因此不要照抄「FTC 强制 click-to-cancel」这一（已过期的）说法。** 当前真实情况：

| 层级 | 现状 | 对本方案的要求 |
| :--- | :--- | :--- |
| 美国联邦（FTC Negative Option Rule） | **2024 修正案已撤销；规则退回 2024 前文本** ✅ | 不按「联邦 click-to-cancel」设计 |
| 美国州法（加州 ARL 等） | **仍然有效** ✅（加州 B&P Code §17602/§17603 已逐字核对） | 自动续订需披露续订条款与价格；取消不得难于订阅 |
| FTC Section 5 | 仍可对欺骗性/不公平行为执法 | 披露必须真实（**这正是 §7 必须删掉「Secure checkout powered by Stripe」的原因**） |
| 欧盟/英国 | 续订前信息披露、取消便利 | 需自助取消入口 |

**设计结论（不变）**：仍要提供**自助取消门户**——它同时满足州法、欧盟要求与良好体验，且成本极低。但**不要**在文案里声称「依 FTC 规则提供 click-to-cancel」。

### 8.3 MoR 转移了什么、没转移什么（避免误判，已有一手来源 ✅）

| MoR **会**接管 | MoR **不会**接管（仍是你的事） |
| :--- | :--- |
| **卖方 of record** 身份（FastSpring 原文："seller and merchant of record"；Paddle 为 "authorised reseller"，客户 "purchase the Product from Paddle"） | **你本国的所得税** |
| 间接税注册/计算/代收/申报/缴纳 | **消费者法信息义务**（撤回权告知、续订披露、取消便利） |
| 卡合规（PCI / SCA 由渠道承担） | **EULA / 产品责任** |
| —— | 你**自己站点**的 GDPR 控制者身份 |
| —— | **拒付（chargeback）成本**仍从你的分成中扣除 |

> **最容易误解的一条**：MoR 不等于「全部合规外包」。消费者法义务附着于**面向消费者的销售体验**，你的落地页与条款仍是抓手。

### 8.4 消费者法（本方案的设计要求）

- **欧盟 14 天撤回权**（CRD Art.9(1) ✅ 逐字）：数字内容若要**即时交付**，必须取得消费者 **(a) 事先明示同意** 与 **(b) 确认知悉丧失撤回权**（Art.16(m) ✅ 逐字）→ **结账页必须含此声明**。
  - **若未履行 Art.6(1)(h) 的告知** → 撤回期**延长至 12 个月**（Art.10）。
- **英国等同要求**（CCR 2013）：reg.30(2) 14 天；reg.37(1) 未经明示同意+知悉**不得开始供应**；**reg.37(4)：若未取得同意或未以耐久介质确认，消费者对已交付的数字内容「不承担任何费用」** —— 即**收不到钱**。这是最强的一条经济风险。
- **退款**：需在 ToS 明示；欧盟数字内容指令另有不符合救济（Art.14）。
- **PCI DSS**：**托管结账**，卡数据**永不**经我方服务器 → 目标 **SAQ A**；**禁止**存储卡号/CVV（✅ PCI SSC 一手）。
- **PSD2/SCA**：由渠道实现 3DS（✅ RTS 2018/389）。
- **隐私/GDPR**：GDPR **Art.3(2)(a) 适用**；需 **Art.27 欧盟代表**（非"偶发"处理）；与渠道/Google/邮件/托管签 **DPA**。
- **ePrivacy Art.5(3)**：现有 Google 同意横幅**不够** —— Google 要求**认证 CMP**，且 **Consent Mode 本身不是同意横幅**（✅ 与本仓库复核者在**线上实测**的结论一致：三站均无认证 CMP）。
- **经营者信息**：EU/UK 须展示卖家名称与地址（MoR 场景下通常由渠道展示其自身信息）。

### 8.5 上线前合规检查清单

- [ ] 结账页含「即时交付需明示同意 + 知悉丧失撤回权」声明（EU/UK）
- [ ] ToS 含退款政策、自动续订条款、取消方式
- [ ] 提供**自助取消门户**（同时满足州法与欧盟）
- [ ] **不**声称「依 FTC click-to-cancel」（该规则已撤销）
- [ ] 卡片数据 100% 由渠道托管（验证：我方服务器无任何卡字段）
- [ ] 与渠道签 DPA；隐私政策更新；评审 Art.27 欧盟代表义务
- [ ] 欧洲流量上线前接入**认证 CMP**（否则个性化广告与金融溢价受损，§8.4）
- [ ] **删除全部不实付款陈述**（§7；线上仍 live）

---

## 9. 测试与上线策略

| 层级 | 内容 | 状态 |
| :--- | :--- | :--- |
| **权益单元** | 权益派生 15 例（生命周期/宽限/退款/fail-closed） | ✅ 已具备 |
| **Webhook 单元** | 幂等、乱序、退款、失败可重试 —— 用内存 mock | ✅ 已具备（9 例） |
| **Webhook 集成** | **加载真实 `0003_billing.sql` + 真实生产 SQL，在真实 SQLite 上跑** | ✅ 已具备（7 例）—— 这条用来防止「mock 以为 SQL 是这样」的假绿 |
| **路由/安全** | 缺签名头、伪造签名、重复投递、未处理类型、处理失败、密钥缺失、以及**「验签失败时绝不解码」** | ✅ 已具备（13 例） |
| **契约** | 用 **Creem 沙箱**真实事件样本驱动；覆盖试用转正、退款事件形态 | ⏳ P2 时做 |
| **E2E** | 沙箱完成真实订阅 → `GET /api/entitlements` 变 pro → 取消 → 周期末收回 | ⏳ P3 时做 |
| **对账** | 定时用渠道 API 与 D1 比对，发现漏投递 | ⏳ |

> **为什么要有「集成」这一层**：单元测试用的 mock 编码了作者**对 SQL 的信念**。若该信念有误（例如误判 `ON CONFLICT … WHERE` 的语义），单元测试会全绿而生产状态被写坏。集成测试用真实 SQLite 消除这个缺口。

**上线闸门（全部满足才开闸）**：
1. 权益 100% 由服务端派生（客户端无写入路径）
2. 不实文案已清除
3. 沙箱 E2E 全绿（含取消与退款）
4. 幂等与验签测试通过
5. 回滚开关（feature flag）可用并有演练记录

**灰度**：先 1 个商品（`deal_pass`，一次性、金额小、逻辑最简单）→ 稳定后再开订阅。

---

## 10. 成本与单位经济（Creem 费率已核实 ✅）

**采用的已核实费率**（Creem，2026-09-20 官方页）：
- 平台费：**3.9% + $0.40 / 笔**
- 提现费：**7 EUR/USD 或 1%（取高）/ 次提现**

> ⚠️ **注意「3.9%」是标题价，实际有效费率更高**，因为 $0.40 是固定成分。下面用真实数字算给你看。

### 10.1 单笔有效费率（含固定费）

| 商品 | 标价 | 扣平台费后 | **有效费率** |
| :--- | ---: | ---: | ---: |
| Pro 年付 | $149.00 | $142.79 | **4.2%** |
| Pro 月付 | $19.00 | $17.86 | **6.0%** |
| 单次通行证 | $9.99 | $9.20 | **7.9%** |

**含义**：金额越小，固定费占比越高。**年付比月付的单位经济更优** —— 这是「提供年付折扣」（$149 ≈ $12.4/月）的合理依据，不只是营销手段。

### 10.2 提现费才是小额商品的真陷阱 ⚠️

提现费**按次收取**（7 USD 或 1% 取高），因此**是否攒批提现**决定生死：

| 提现金额 | 提现费 | 占该次提现比例 |
| ---: | ---: | ---: |
| $19 | $7.00 | **36.8%** |
| $50 | $7.00 | 14.0% |
| $100 | $7.00 | 7.0% |
| $500 | $7.00 | 1.4% |
| $1,000 | $10.00 | 1.0% |

**对 $9.99 单次商品的影响**：

| 场景 | 实收 | 总损耗 |
| :--- | ---: | ---: |
| 单独提现一笔 $9.99 | **$2.20** | **78.0%** 😱 |
| 与其余 19 笔一起提现（20 笔 ≈ $184） | $8.85 / 笔 | **11.4%** |

### 10.3 结论与建议（可执行）

1. **绝不要「卖一笔、提一笔」** —— 对 $9.99 商品会损失 78%。**让余额累积**或按固定周期提现；提现频率应以「使固定费占比 < 1–2%」为目标（约 **每次 ≥ $500**）。
2. **优先推年付**：有效费率 4.2% vs 月付 6.0%，且现金流前置。
3. **$9.99 单次商品在小规模下不划算**。选择其一：
   - 提高定价或改为打包（如 $19 三份）；
   - 或**首发只做订阅**，待量起来再加单次商品。
4. **对比处理器**：Stripe 为 2.9% + $0.30（美国价目），差额约 **1%** 即「代缴全球税 + 承担卖方身份」的价格 —— 以 $19/月计约 $0.19/笔，**远低于**你自行注册 EU OSS + 英国 VAT + 美国逐州的成本（§8.1）。
5. **当前现金流为 0**（AdSense 未通过）→ MoR **无需预付年费/注册费**，而成立美国 LLC 有前置成本与报税义务，因此现阶段 **MoR 的优势被进一步放大**。

> 计算模型（费率变动时可代入）：
> ```
> 单笔净额 = 标价 − (标价 × 平台费率 + 平台固定费)
> 提现净额 = 累计净额 − max(提现固定费, 累计净额 × 提现费率)
> ```
> 上述数字由本仓库复核者用脚本代入**已核实的官方费率**计算，非估算。

---

## 11. 分阶段路线图

| 阶段 | 交付物 | 验收标准 | 状态 |
| :--- | :--- | :--- | :--- |
| **P0 止损** | 删除不实 Stripe 文案；删除 `loginAsDemo`/客户端写 plan | 全仓库无自授权写入；线上无「Stripe」不实陈述 | **可立即做** |
| **P1 地基** | `0003_billing.sql` 应用；`GET /api/entitlements` | 表存在；接口对未登录 401、对免费用户 free | ⚙️ **代码已交付**，仅差应用迁移与路由挂载 |
| **P2 Creem 接入** | Creem adapter（验签 + 事件归一）+ 服务端商品表 + `/checkout` | **Creem 沙箱**一次性购买全链路打通，D1 出现 `billing_purchases` 行 | 渠道已定 → **可开工** |
| **P3 订阅** | 订阅结账、`past_due` 宽限、`/portal` 自助取消 | 沙箱订阅→取消→周期末收回，符合 §6.7 状态机 | 待 P2 |
| **P4 客户端切换** | 5 处 `isPro` 改 `hasEntitlement`；品牌服务端持久化 | 客户端无授权逻辑；换设备权益一致 | 待 P2 |
| **P5 运营** | 对账任务、退款流程、监控告警；**提现攒批** | 漏投递可发现；退款自动撤权；提现费占比 <2%（§10.3） | 待 P3 |
| **P6（并行）** | Paddle 开户实验 | 确认 Paddle 是否接受你的主体；若接受，作为长期主渠道 | 建议**现在**做 |

**关键变化：P2 不再被「渠道决策」阻塞** —— Creem 的资格已核实（§3.4），因此 **P0 → P1 → P2 可以一路做下去**。P6 并行进行，为将来迁移留后路（迁移只需新增一个 adapter，§6.5）。

---

## 12. 风险与未决问题

| # | 问题 | 影响 | 状态 / 需谁决定 |
| :--- | :--- | :--- | :--- |
| 1 | ~~各 MoR 是否接受中国大陆主体~~ | ~~能否开户~~ | ✅ **已解决**：Creem 官方支持 China，个人经 Alipay 收款（§3.4） |
| 2 | **你的经营主体**（个人 / 中国公司 / 境外实体） | 影响提现方式与额度、所得税 | **用户** —— 个人走 Alipay（有年额度）；公司本地银行无上限 |
| 3 | **Paddle 是否接受你的主体** | 长期备选是否成立 | **用户**（15 分钟开户实验，§3.4） |
| 4 | **走 A 还是 B**（纯免费 vs Freemium） | 是否保留订阅与全部付费 UI | **用户**（§5.5） |
| 5 | **Creem 存续风险** | 若其停运，需迁移 | 已用「渠道无关架构」缓解（§6）；建议并行验证 Paddle |
| 6 | **小额商品（$9.99）的单位经济** | 3.9%+$0.40 **且提现费 7 EUR/USD 或 1% 取高** → 固定费占比高 | **用户** + §10 模型 |
| 7 | 真实费率（Paddle 等） | 单位经济 | 官方定价页现价 |
| 8 | 是否保留 `/api/credits/consume` | 架构整洁 | **用户** |
| 9 | 税务细节（发票、OSS 边界） | 合规 | MoR 承担；仍见 §8 |

**剩余最大风险已从「资格」转为「小额商品的固定费损耗」**：Creem 的提现费（7 EUR/USD 或 1% 取高）对 $9.99 的单次购买占比很高。**建议**：要么把单次商品定价提高/打包，要么首发只做订阅（月付门槛低、金额高）。**资格风险已解除**，因此 P0/P1 可以放心推进，不必再等渠道决策。

---

## 13. 本次已交付的工件（可立即验证）

| 工件 | 状态 |
| :--- | :--- |
| `apps/finance/src/worker/entitlements.ts` | ✅ 渠道无关、纯函数、零依赖 |
| `apps/finance/src/worker/billingWebhook.ts` | ✅ **幂等 + 乱序安全**的 webhook 核心；含导出的 `SQL` 常量供集成测试使用 |
| `apps/finance/src/worker/billingWebhookRoute.ts` | ✅ HTTP 入口：**先验签、后处理**；含 `constantTimeEqual`；响应码语义化 |
| `apps/finance/migrations/0003_billing.sql` | ✅ 4 表 + 幂等账本 + **`last_event_at` 乱序守卫**；**本地已验证，未应用到线上** |
| 测试 | ✅ **44 例**：权益 15 + webhook 单元 9 + **真实 SQLite 集成 7** + 路由安全 13 |
| `docs/research/digital-sales-tax-and-consumer-law.md` | ✅ 已交付（66 个一手来源；税门槛/消费者法/PCI/GDPR） |
| `docs/research/overseas-payment-provider-options.md` | ⚠️ **未交付**（agent 两次空转）。其最重要的部分已由 §3.4 的「15 分钟开户实验」替代；**精确费率仍待官方页核实** |
