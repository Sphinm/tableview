# Design Spec: 海外支付接入完整方案（tableview.dev）

- **Date**: 2026-09-20
- **Status**: Proposed — 待用户确认「商户实体方案」与「支付渠道」两项决策后进入实施
- **Scope**: `apps/finance`（tableview.dev）的订阅与单次付费；`tools` / `compress` 暂不接入
- **Author**: 本仓库 agent + User

> **证据约定**：本文件把**已实测的事实**与**待确认的推断**严格分开。标 ✅ 的为本仓库复核者亲自执行并取得输出的证据；标 ⏳ 的为常见说法但需以官方页面为准；标 ❓ 的为本次未能核实、必须在实施前解决。**不编造费率、门槛或资格规则**（费率见 §10，全部标注来源状态）。

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

> **推荐：以 Merchant of Record（MoR）为主路径，首选 Paddle。** 只有当你愿意并能够成立**美国 LLC（或香港/新加坡实体）**且希望自己承担全球间接税申报时，才选 Stripe。

**两条决定性理由**（详见 §3、§4）：

1. **资格**：绝大多数处理器（含 Stripe）要求商户注册在**其支持的国家**。若经营者在中国大陆且无境外实体，Stripe **开不了户**。MoR 的资格门槛与税务负担都更低。
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

### 3.4 我实测到的：卖家资格**不是查得到的，而是试出来的**

> 这是本次调研最有价值的一条结论，它把「未知」变成「可执行」。

我尝试从官方文档中查证「哪些国家的卖家可以开户」，结果如下（均为本次亲自执行）：

| 尝试 | 结果 |
| :--- | :--- |
| Paddle 官方「supported countries」文档页 | ✅ 能取到，但那是**买家**列表（229 国），**不含卖家资格** |
| Paddle `Create an account` API 参考页 | ⛔ **需 Paddle 合作伙伴登入**才可见（原文：「Join the Paddle partner program to read this content」）—— **卖家资格/开户字段不在公开文档中** |
| Stripe `stripe.com/global` | ⛔ 页面仅含**语言/地区选择器**（locale picker），**没有任何可用国家清单**；`/en-sg/global` 亦同 |
| Stripe `/register` | ⚠️ 在本机浏览器中被重定向到一个已登录的 Stripe 演示会话（"Cactus Practice"，测试模式），**无法据此判断你的真实资格**；我未继续深入该账户（属你的私有财务面板，不应越界查看） |
| Stripe docs 若干候选 URL | ⛔ 404 |

**结论**：主流渠道**不公开**卖家资格清单。因此**不要试图靠调研确定资格，直接做一次 15 分钟的开户实验**：

#### 资格验证流程（每个渠道约 15 分钟，可并行）

```
对每个候选渠道（Paddle → Lemon Squeezy → Stripe）：
  1. 打开其 signup / onboarding 页面，走到「选择国家 / 业务所在地」这一步
  2. 观察下拉框里是否存在：
       - 中国大陆（China / Mainland China）
       - 若你已有：香港 / 新加坡 / 美国
  3. 记录「是否需要当地银行账户」「是否需要公司实体」「KYC 要哪些文件」
  4. 走到需要提交真实资料之前就停下 —— 此时已足够判定
判定规则：
  - 你的主体**在下拉框里** → 可继续，进入 §10 成本核算
  - **不在** → 该渠道排除；若全部排除 → 必须先成立实体（路径 B/C）
```

**为什么这样做是对的**：eligibility 的权威来源是**渠道的实际开户流程**，不是任何文档或博客。本方案的 §6（权益与数据模型）**刻意与渠道解耦**，所以这个实验可以在**不写任何渠道相关代码**的前提下先做完 —— 这正是把风险前置的设计意图。

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

| 渠道 | 类型 | 是否 MoR | 卖家资格（中国大陆主体） | 费率 | 备注 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Paddle** | MoR | ✅ 是（官方原文已核实） | ❓ 待确认 | ⏳ 见其官方定价页 | 支持 229 个买家国家；每国**含税/不含税展示偏好**可直接取用 ✅ |
| **Lemon Squeezy** | MoR | 是 | ❓ 待确认 | ⏳ | 已被 Stripe 收购；**是否仍接受新卖家需以官方为准** ❓ |
| **Stripe** | 处理器 | ❌ 否 | ❌ 中国大陆主体不可（需 US/HK/SG 等实体） ⏳ | ⏳ | 生态最好，但把税务责任留给你 |
| **FastSpring** | MoR | 是 | ❓ 待确认 | ⏳ | 面向 B2B/软件，偏重 |
| **Creem / Polar** | MoR | 是 | ❓ 待确认 | ⏳ | 新兴，面向 indie；**稳定性与存续需评估** ❓ |
| **Gumroad** | MoR | 是 | ❓ | ⏳ | 体验偏「创作者商城」，与自有站点集成弱 |

> ⚠️ **不要**基于本表的费率做财务决策 —— 费率变动频繁，且可能含最低费用/跨境费/争议费。实施前必须以其**官方定价页**为准（§10 给出计算模型，代入真实费率即可）。

### 4.3 推荐与理由

**首选 Paddle**，理由按权重：

1. 官方明确的 MoR 定位与「代算代缴税」承诺 ✅
2. 提供**每国含税/不含税展示偏好**（EU/AU = Inclusive，美国 = Exclusive）✅ —— 直接解决 §5.3 的定价展示合规
3. 订阅能力完整（试用、周期、客户自助门户、退款）
4. 买家覆盖 229 国 ✅
5. 相对成熟、存续风险低于新兴 indie 渠道

**备选**：Lemon Squeezy（若仍开放新卖家）；若你有美国 LLC 且偏好完全自控，则 A 路径降级为 **Stripe + 自行处理税务**（此时强烈建议启用 Stripe Tax 并接受其局限）。

**不推荐**：为了「费率低」而选处理器却把税务留给未来的自己 —— 从第一笔欧盟订单起就会产生欠缴风险。

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

## 8. 合规清单

> 详细版见 `docs/research/digital-sales-tax-and-consumer-law.md`（研究中）。以下为本方案的**设计要求**。

- **间接税**：走 MoR 则不自行注册 VAT/GST；**必须**在定价展示上遵守含税/不含税偏好（§5.3）
- **欧盟/英国 14 天撤回权**：数字内容需**明示同意 + 确认知悉放弃撤回权**方可即时交付 → 结账页条款必须含此声明
- **自动续订披露**：美国（FTC / 各州如加州 ARL）与欧盟要求续订前披露、且取消必须与订阅同样简单（"click to cancel"）→ 必须提供**自助门户**
- **退款政策**：需在 ToS 明示
- **PCI DSS**：采用**托管结账**（hosted checkout），卡数据**永不**经过我方服务器 → 目标为 SAQ A（最低负担）；**禁止**在服务器存储任何卡号/CVV
- **PSD2/SCA（EEA）**：由渠道实现 3DS；我方不自行处理
- **隐私/GDPR**：会处理买家姓名、邮箱、国家、订阅状态 → 需与渠道签 **DPA**；更新隐私政策；与现有 consent banner 协调（**注意**：结账属履约所必需，不能因未同意分析 cookie 而拒绝）
- **经营者信息**：EU/UK 要求展示**卖家名称与地址**（MoR 场景下通常由渠道展示其自身信息）

---

## 9. 测试与上线策略

| 层级 | 内容 |
| :--- | :--- |
| **单元**（已具备） | ✅ 权益派生 15 例；Webhook 幂等（已本地验证 UNIQUE 约束） |
| **契约** | 用渠道**沙箱**真实事件样本驱动 webhook 处理器；覆盖重复投递、乱序、退款、试用转正 |
| **E2E** | 沙箱完成一次真实订阅 → 校验 `GET /api/entitlements` 变 pro → 取消 → 校验周期末收回 |
| **负向** | 伪造签名（须 4xx 且不落库）、越权访问他人门户、客户端篡改 plan（须无效） |
| **对账** | 定时用渠道 API 与 D1 比对，发现漏投递 |

**上线闸门（全部满足才开闸）**：
1. 权益 100% 由服务端派生（客户端无写入路径）
2. 不实文案已清除
3. 沙箱 E2E 全绿（含取消与退款）
4. 幂等与验签测试通过
5. 回滚开关（feature flag）可用并有演练记录

**灰度**：先 1 个商品（`deal_pass`，一次性、金额小、逻辑最简单）→ 稳定后再开订阅。

---

## 10. 成本与单位经济（费率待以官方定价页核实 ⏳）

**本方案不提供未经核实的费率数字。** 计算模型如下，代入真实费率即可：

```
净收入 = 标价 − 渠道费率 − 固定费用 − 汇损 − 退款/争议损失
MoR 的费率显著高于处理器（差额即「代缴全球税 + 承担卖方责任」的价格）
```

**保本思考**：
- 若 Pro 定价 $19/mo，需先覆盖：渠道费 + （若走实体路径）LLC/公司年费与报税成本
- **AdSense 尚未通过 ⇒ 当前现金流为 0**。这意味着：任何需要预付年费/注册费的路径（如美国 LLC）都有回本压力，而 MoR 通常**无需预付**，这是它在此阶段的又一优势
- 若月订阅量极低，固定成本（实体维护）可能**超过** MoR 的费率差额 → 再次指向 MoR

---

## 11. 分阶段路线图

| 阶段 | 交付物 | 验收标准 |
| :--- | :--- | :--- |
| **P0 止损**（可立即做） | 删除不实 Stripe 文案；删除 `loginAsDemo` 自授权；删除客户端写 plan | 全仓库无自授权写入；线上无「Stripe」不实陈述 |
| **P1 地基**（本方案已部分交付 ✅） | `0003_billing.sql` 应用；`entitlements.ts`（已交付）；`GET /api/entitlements` | 表存在；权益用例全绿；接口对未登录返回 401、对免费用户返回 free |
| **P2 渠道接入**（需先定渠道） | 服务端商品表 + `/checkout` + `/webhook/:provider` + 验签 + 幂等 | 沙箱一次性购买全链路打通，D1 出现 `billing_purchases` 行 |
| **P3 订阅** | 订阅结账、`past_due` 宽限、`/portal` 自助取消 | 沙箱订阅→取消→周期末收回，全部符合 §6.7 状态机 |
| **P4 客户端切换** | 5 处 `isPro` 改 `hasEntitlement`；品牌服务端持久化 | 客户端无授权逻辑；换设备权益一致 |
| **P5 运营** | 对账任务、退款流程、税务对账、监控告警 | 漏投递可被发现；退款自动撤权 |

**P0 与 P1 不依赖渠道决策，可并行推进** —— 这是本阶段投入产出比最高的部分。

---

## 12. 风险与未决问题

| # | 问题 | 影响 | 需谁决定 |
| :--- | :--- | :--- | :--- |
| 1 | **你的经营主体所在地** | 决定全部选型 | **用户** |
| 2 | **各 MoR 是否接受中国大陆主体**（❓未核实） | 能否开户 | 用户（查官方 onboarding） |
| 3 | **走得通 A 还是 B**（免费 vs Freemium） | 是否保留订阅 | **用户** |
| 4 | 需要哪家渠道（Paddle / 其他） | 实施细节 | 用户 |
| 5 | 真实费率与资格条款 | 单位经济 | 官方定价页 |
| 6 | 是否保留 `/api/credits/consume` | 架构整洁 | 用户 |
| 7 | 税务细节（VAT 注册、发票） | 合规 | 见 §8 研究文档 |

**最大风险**：**在资格未确认前开工实施。** 若最终发现目标渠道不接受你的主体，服务端代码大部分仍可复用（因为已做成渠道无关），但**渠道相关的结账与 webhook 适配需重做**。因此本方案刻意把 **P0/P1 与渠道解耦**，让风险最小化。

---

## 13. 本次已交付的工件（可立即验证）

| 工件 | 状态 |
| :--- | :--- |
| `apps/finance/src/worker/entitlements.ts` | ✅ 已实现（渠道无关、纯函数、零依赖） |
| `apps/finance/src/worker/__tests__/entitlements.test.ts` | ✅ 15 用例全绿 |
| `apps/finance/migrations/0003_billing.sql` | ✅ 已创建并**在本地 D1 验证**（含幂等约束实测）；**未应用到线上** |
| `docs/research/overseas-payment-provider-options.md` | 🔄 研究中（资格与费率一手来源） |
| `docs/research/digital-sales-tax-and-consumer-law.md` | 🔄 研究中（税与消费者法一手来源） |
