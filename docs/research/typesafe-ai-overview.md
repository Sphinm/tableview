# TypeSafe AI 技术调研与使用全景指南

> **调研日期**: 2026-09-19  
> **数据源**: [TypeSafe AI 官方文档 (docs.typesafe.ai)](https://docs.typesafe.ai/introduction) 及官方文档索引 (`llms.txt`)  
> **核心模型**: `jev-latest` (旗舰 System One 模型)  
> **核心 SDK**: `@typesafe-ai/sdk` (TypeScript/Node), `typesafe-sdk` (Python)

---

## 1. 什么是 TypeSafe AI？

### 1.1 核心定义与哲学：System One AI
传统大语言模型（如 GPT-4、Claude 3.5、OpenAI o1、DeepSeek R1）本质上属于认知心理学中的 **System 2（慢思考）**：
- 逐 Token 自回归生成自然语言文本；
- 延迟高（通常在数百毫秒到数十秒）；
- 输出概率分布不可控，常常需要结构化提取器（Pydantic / Instructor）或 JSON Mode 约束解码；
- 容易产生幻觉，且对自身“不确定性”缺乏可量化的置信度指标。

**TypeSafe AI** 走了一条完全不同的架构路线：打造专为软件系统服务的 **System 1（快思考）** AI 模型。
- **旗舰模型**：**Jev**（当前版本 `jev-latest` / `jev-1.13`），被称为全球首个 **System One 模型**。
- **核心职能**：**快速判断与结构化决策（Snap Judgments & Structured Decisions）**，而不是生成长篇大论或撰写代码。
- **输入输出形式**：
  - **输入**：**State（状态）**（纯文本或任意 JSON 序列化对象） + **Typed Questions（类型化问题基元）**。
  - **输出**：严格受限的枚举值、校准过的离散概率分布（Probabilities）、以及量化的置信度（Confidence）。
- **运行特征**：没有自回归文本生成的逐字开销，具备极低的推理延迟，单次请求可并行计算数十个独立问题，输出百分之百符合类型约束，绝不产生破坏 JSON Schema 的结构幻觉。

```
              +------------------------------------------+
              |           Application Code               |
              +------------------------------------------+
                     |                            ^
      1. State       |                            | 3. Typed Decision
     + Typed Questions                            |  + Probabilities
                     v                            |  + Confidence
              +------------------------------------------+
              |           TypeSafe AI (Jev)              |
              |       System 1 Decision Engine           |
              +------------------------------------------+
```

---

## 2. 核心架构与三大基元（Primitives）

TypeSafe 不让模型输出自由文本，而是设计了 3 个原子级的决策基元（Questions & Answers）。每个问题在请求中拥有独立 ID，针对相同的 State 并行计算。

| 基元类型 (Primitive) | 适用问题定义 | 典型应用场景 | 返回字段 |
| :--- | :--- | :--- | :--- |
| **`Choice`** (单选) | 在一组预定义且无序的选项中挑选一个 | 工单部门分发、文档类型分类、编程语言识别 | `choice`: 选中的枚举值<br>`probabilities`: 各选项概率分布<br>`confidence`: 综合置信度 (0~1) |
| **`Score`** (离散评分) | 在有序且带描述的阶梯（Levels）上评定等级 | 客户情绪强度、Bug 严重度、技能成熟度 | `score`: 浮动评分 (可落在两级之间)<br>`legend`: 级别映射对照<br>`probabilities`: 各阶梯概率分布<br>`confidence`: 置信度 (0~1) |
| **`Noul`** (布尔概率) | 纯粹的 Yes/No 命题真伪判断 | 是否申请退款、是否存在安全注入风险、是否包含紧急需求 | `noul`: 0.0 到 1.0 的 Yes 概率 (接近 1 为真，接近 0 为假，0.5 代表极端不确定) |

> **注**：Noul 不包含独立的 `confidence` 字段，因为其概率值（如 0.99 vs 0.50）本身就是贝叶斯校准后的置信表达。

---

## 3. 关键机制与设计模式

### 3.1 状态寻址（Field Addressing via Dot Notation）
当输入的 `state` 是复杂的 JSON 结构时，可以在基元的 `instructions` 中直接用反引号加点语法引用特定字段：
```json
{
  "instructions": "Does `ticket.messages[0].text` request a refund, given `refund_policy`?"
}
```
模型能精准将注意力投向该上下文路径，避免无关字段的噪声干扰。

### 3.2 置信度门控（Confidence-Gated Routing）
所有 `Choice` 和 `Score` 返回的 `confidence`（0~1）表征概率分布的尖锐程度。
- **高置信度（如 > 0.85）**：代码可直接无感自动执行（如自动放行退款）。
- **中置信度（如 0.50 ~ 0.85）**：提示用户二次确认，或收集更多上下文。
- **低置信度（如 < 0.50）**：降级处理，转交人工客服审核，或委派给慢速 System 2 重推理大模型（如 Claude / GPT-4）。

### 3.3 投机扇出模式（Speculative Fan-Out）
单个 HTTP 请求中，可以在 `questions` 字典中塞入数十个甚至上百个基元问题（上下文上限约 32,000 Tokens）。
- 单个问题与数十个问题相比，响应时间几乎没有变化（并行运算）；
- 代码可以“提前询问”很多假设性条件（Speculative Questions），由宿主程序逻辑根据前端状态选择性使用返回结果，极大减少多轮网络往返。

### 3.4 复合评分模式（Composite Scoring）
避免让 AI 直接做“评价该项目质量”这种模糊的全局判断，而是拆解为多个独立的原子 `Score`：
- 维度 A（商业模式清晰度，权重 0.4）
- 维度 B（技术门槛，权重 0.4）
- 维度 C（竞品饱和度，权重 0.2）
各维度由 Jev 单独打分，业务代码在外部做加权汇总。当业务权重调整时，仅需修改代码逻辑，无需重写 Prompt。

---

## 4. 快速上手与使用示例

### 4.1 准备工作
1. 在 [TypeSafe 控制台](https://console.typesafe.ai) 注册并创建 API Key。
2. 配置环境变量：`export TYPESAFE_API_KEY="your_api_key"`。

---

### 4.2 TypeScript / JavaScript 接入 (`@typesafe-ai/sdk`)

#### 安装
```bash
bun add @typesafe-ai/sdk
# 或
npm install @typesafe-ai/sdk
```

#### 代码实现
```typescript
import { TypeSafeClient, choice, score, noul } from "@typesafe-ai/sdk";

const client = new TypeSafeClient({
  apiKey: process.env.TYPESAFE_API_KEY, // 默认会自动读取 TYPESAFE_API_KEY
});

async function main() {
  const userTicket = {
    user: "Alice",
    message: "I was double-charged $49 for order #A-882. Fix this right now or I will dispute with my bank!",
    account_tier: "enterprise",
  };

  const response = await client.systemOne({
    state: userTicket,
    questions: {
      // 1. 意图分类 (Choice)
      category: choice("What is the primary concern in `message`?", {
        billing: "Issues with charges, invoices, or subscriptions",
        bug: "Software malfunctioning or broken feature",
        feature_request: "Requesting a new product capability",
      }),

      // 2. 情绪等级评分 (Score: 0~2)
      frustration: score("How angry is the customer in `message`?", [
        "Calm and polite",
        "Irritated but professional",
        "Extremely furious / threatening chargeback",
      ]),

      // 3. 紧急度布尔概率 (Noul)
      is_urgent: noul("Does `message` require immediate same-hour intervention?"),
    },
  });

  const { category, frustration, is_urgent } = response.answers;

  console.log("Category:", category.choice); // "billing"
  console.log("Category Confidence:", category.confidence); // ~0.92
  console.log("Frustration Score:", frustration.score); // ~1.85 (靠近级别2)
  console.log("Urgency Probability:", is_urgent.noul); // ~0.99

  // 基于置信度门控业务路由
  if (category.confidence > 0.85 && category.choice === "billing") {
    console.log("-> 自动派发至财务工单队列");
  } else {
    console.log("-> 置信度不足，交由人工分拣");
  }
}

main();
```

---

### 4.3 Python 接入 (`typesafe-sdk`)

#### 安装
```bash
pip install typesafe-sdk
# 或
uv add typesafe-sdk
```

#### 代码实现
```python
import os
from typesafe_sdk import TypeSafeClient, Choice, Score, Noul

client = TypeSafeClient(api_key=os.environ.get("TYPESAFE_API_KEY"))

ticket_text = "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing. I'm losing sales. Please help ASAP."

response = client.system_one(
    state=ticket_text,
    questions={
        "department": Choice(
            instructions="Which team should handle this?",
            criteria={
                "billing": "Payment or subscription issues",
                "technical": "Bugs or integration problems",
                "sales": "Pricing or account questions",
            },
        ),
        "frustration": Score(
            instructions="How frustrated the customer appears",
            criteria=[
                "Calm, just stating facts",
                "Frustrated but civil",
                "Very angry, strong language",
            ],
        ),
        "is_urgent": Noul(
            instructions="The message conveys urgency or time-sensitivity",
        ),
    },
)

# 读取强类型结果
print("Department:", response.answers["department"].choice)       # "billing"
print("Department Conf:", response.answers["department"].confidence)
print("Frustration Score:", response.answers["frustration"].score) # 1.035
print("Is Urgent:", response.answers["is_urgent"].noul)             # 0.999
```

---

### 4.4 原始 HTTP REST API 调用

```bash
curl -X POST https://api.typesafe.ai/v1/systemone \
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "jev-latest",
    "state": "The user provided an invalid email address format on the signup page.",
    "questions": {
      "error_type": {
        "type": "choice",
        "instructions": "Classify the client-side error",
        "criteria": {
          "validation": "Input format error",
          "network": "Connection failed",
          "auth": "Unauthorized"
        }
      }
    }
  }'
```

---

## 5. Agent Skills 集成（Coding Agents）

TypeSafe 官方专门为 Claude Code、OpenAI Codex 以及其它符合 Agent Skills 规范的环境封装了开箱即用的 Skill：

```bash
# 针对 Claude Code:
claude plugin marketplace add typesafe-ai/skills
claude plugin install typesafe@typesafe-ai

# 针对通用 Agent 规范:
npx skills add typesafe-ai/skills --skill typesafe-ai
```

一旦安装，Agent 会在编写复杂状态机或脆弱的正则解析时，主动提议使用 TypeSafe 的快思考基元（`Choice` / `Score` / `Noul`）来替代硬编码的脆弱启发式规则。

---

## 6. TypeSafe AI 适合与不适合的场景

### 6.1 黄金适用场景 (Best Fit)
1. **Agent 高速前置路由（Intent Routing / Gatekeeper）**：在调用重量级 LLM（如 Claude 3.5 Sonnet / o1）之前，用 TypeSafe 在 50ms 内完成意图分流与危险内容拦截，节约 90% 的调用成本。
2. **文本清洗与模式结构化（Data Classification & SDE Cascade）**：批量判定爬虫抓取网页、简历、工单或金融公告的结构标签。
3. **安全护栏与审核（LLM Guardrails & Prompt Injection Defense）**：利用 `Noul` 和 `Score` 毫秒级探测越狱提示词与违规文本。
4. **状态机转换驱动（State-driven Automation）**：根据用户行为与会话状态，安全决定自动化流程的下一步跳转。

### 6.2 不适合的场景 (Anti-Patterns)
1. **长文本与创意生成**：撰写邮件、写营销方案、代码生成（Jev 不生成任何文本）。
2. **深度逻辑多步推演**：复杂的数学证明、长链条逻辑解谜（需要 System 2 推理模型）。
3. **多模态任务**：目前 Jev 仅支持纯文本与 JSON，暂不支持图像、音视频输入。

---

## 7. 总结

TypeSafe AI 是目前大模型工业界中一个**高度特色化且定位极其清晰**的基础设施：
它抛弃了自回归生成文本的繁琐与脆弱，专攻**软件业务流中的快思考（System 1）判断**。它通过强类型问题定义（Choice、Score、Noul）以及校准后的置信度，让开发者能像写普通 TypeScript/Python 函数一样，安全、快速、低成本地在核心逻辑中嵌入 AI 智能决策。
