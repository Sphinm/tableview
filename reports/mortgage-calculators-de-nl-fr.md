# 金融/房贷计算器一手调研：德国 · 荷兰 · 法国

> 说明：仅收录本次实际抓取到的一手页面；标注 [SECONDARY] 者为二手/聚合器口径，[UNVERIFIED] 为本次未能取得一手证据的条目。所有数字均取自下列 URL，未自行推算。

---

## Germany

### A. 在售计算器清单 (calculator product inventory)

| 产品 (德文 / 英文) | 提供商 | 类型 | 一手 URL |
|---|---|---|---|
| Baufinanzierungsrechner (building-finance calculator) | Interhyp | broker 经纪 | https://www.interhyp.de/baufinanzierung/ |
| Tilgungsrechner (amortisation / repayment schedule calculator) | Interhyp | broker | https://www.interhyp.de/lp/tilgungsrechner/ |
| Budgetrechner / Haushaltsrechner / Kauf- und Mietrechner / Grundbuch- und Notarkostenrechner / Zinsvergleich | Interhyp | broker | https://www.interhyp.de/baufinanzierung/ (导航所列) |
| Baufinanzierungsrechner / Baufinanzierung-Zinsvergleich | CHECK24 | comparison 比价 | https://www.check24.de/baufinanzierung/ |
| Baufinanzierungsrechner / Anschlussfinanzierungsrechner / Umschuldungsrechner / Forward-Darlehen-Rechner / Bausparrechner | Dr. Klein | broker | https://www.drklein.de/baufinanzierung.html |
| Schnell-Rechner Neufinanzierung | ING | bank 银行 | https://www.ing.de/baufinanzierung/ |
| Rechner-Hub (Baufinanzierungs-, Tilgungs-, Bauspar-Rechner 等) | Sparkasse | bank | https://www.sparkasse.de/rechner.html |
| Bausparrechner + 知识页 Zuteilung / Bewertungszahl | Bausparkasse Schwäbisch Hall | bank (Bausparkasse) | https://www.schwaebisch-hall.de/bausparen/wissenswertes/zuteilung.html ; https://www.schwaebisch-hall.de/bausparen/wissenswertes/bewertungszahl.html |
| **薪资/到手工资类:** Brutto-Netto-Rechner (gross-to-net pay) | Sparkasse | bank | https://www.sparkasse.de/service/rechner/brutto-netto-rechner.html |
| **薪资/税务类:** Lohn- und Einkommensteuerrechner (wage & income tax calculator) | Bundesministerium der Finanzen (BMF) | government 政府 | https://www.bmf-steuerrechner.de/ |

### B. 核心计算规则 (implementable spec)

- **Annuitätendarlehen vs Tilgungsdarlehen 还款数学.** Annuitätendarlehen：每期总还款额（Zins + Tilgung）恒定，月供 = 贷款本金 × (名义年利率 + 初始 Tilgung) / 12，利息随余额递减、本金递增；Tilgungsdarlehen：每期偿还本金恒定、利息递减，月供逐期下降。Interhyp 的 Tilgungsrechner 明确输出"Zinsbindung 期末剩余本金 (Restschuld)"与"Sondertilgung 影响下的还款计划"。来源（一手经纪页，非监管）：https://www.interhyp.de/lp/tilgungsrechner/
- **Zinsbindung (5/10/15 年) 与再融资.** 固定利率期（常见 5/10/15 年）结束时剩余本金 (Restschuld) 需重新融资 (Anschlussfinanzierung)；这是德国房贷计算器的核心输出项。来源：同上 Tilgungsrechner 页。市场"典型 10 年"为惯例，[SECONDARY]。
- **§489 BGB：10 年后解约权.** 借款人可在"贷款全额到账满 10 年后"提前终止合同，须提前 6 个月通知 (Kündigungsfrist sechs Monate)；若约定固定利率，也可在利率绑定到期日提前 1 个月通知解约。来源：https://www.gesetze-im-internet.de/bgb/__489.html
- **Vorfälligkeitsentschädigung (提前还款违约金).** §490(2) BGB：固定利率且以不动产抵押担保的贷款，借款人可在贷款到账满 6 个月后、基于正当利益提前解约，但须赔偿贷款人因此产生的损害 (Schadenersatz)；文件未给出固定费率公式，实务金额由合同/银行计算。来源：https://www.gesetze-im-internet.de/bgb/__490.html
- **Grunderwerbsteuer (不动产取得税).** 联邦 GrEStG §11 规定基准税率 3.5 vom Hundert（3.5%），各州可立法另行规定，故实际为 3.5%–6.5% 区间。来源（联邦法条，确认 3.5% 基准）：https://www.gesetze-im-internet.de/grestg_1983/__11.html ；**各州具体税率表本次未取得一手政府页面，[UNVERIFIED]**。
- **Notar + Grundbuch 费用 (GNotKG).** 费用按 GNotKG Anlage 1 Kostenverzeichnis 的"倍数 × Tabelle B 金额"。已确认：KV 14110 "Eintragung eines Eigentümers" = 1,0；KV 14120 Briefgrundschuld = 1,3；KV 14121 sonstiges Recht (含 Buchgrundschuld) = 1,0。Anlage 2 Tabelle B 在 Geschäftswert 500.000 € 时 1,0 倍 = 935 €（300.000 € 时为 435 €；1.000.000 € 时为 1.735 €）。来源：https://www.gesetze-im-internet.de/gnotkg/anlage_1.html ；https://www.gesetze-im-internet.de/gnotkg/anlage_2.html 。Kaufvertrag 公证的 KV 21201 倍数本次未从页面文本中提取到，[UNVERIFIED]。
- **Maklerprovision (中介费).** §656a BGB：住宅/独栋房屋的中介合同须采文本形式；§656c BGB：中介向买卖双方收费时，双方须承诺"同等金额"，即买方实际最多承担 50%。来源：https://www.gesetze-im-internet.de/bgb/__656a.html ；https://www.gesetze-im-internet.de/bgb/__656c.html
- **Bausparen 机制.** 《Bausparkassengesetz (BauSparkG)》为法定框架（§1 Begriffsbestimmungen 等）。来源：https://www.gesetze-im-internet.de/bausparkg/ 。Sparphase→Zuteilung→Bewertungszahl 的具体机制页为 JS 渲染，未取到文本，[SECONDARY]。
- **利息计算惯例 (30/360，按月计息)：[UNVERIFIED]** — 本次未找到可引用的监管/法条一手来源。
- **标准期限与典型 Tilgung 率：** [SECONDARY]（市场惯例，未有监管口径）。
- **自雇/收入要求：** [UNVERIFIED]。
- **薪资/到手工资规则（一段）.**
  德国工资税由雇主按 BMF 发布的 Programmablaufplan 代扣 Lohnsteuer（并据此计算 Solidaritätszuschlag 与 Kirchensteuer 基数），因此任何"税前转税后"计算器必须实现累进工资税表；社保 2026 年费率为：法定医保 KV 14,6% + 附加费 Zusatzbeitrag（全国平均 2,9%）、养老 RV 18,6%、失业 AV 2,6%、护理 PV 基础 3,6%（无子女 23 岁以上 4,2%）；法定工作时间 §3 ArbZG 为每日 8 小时（可延至 10 小时，须 6 个月内平均每日不超 8 小时），即每周约 48 小时上限；德国薪酬惯例为月薪发放、常见第 13 薪 [后段为 SECONDARY]。来源：https://www.bmf-steuerrechner.de/ ；https://www.aok.de/fk/rps/tools/weitere-inhalte/beitraege-und-rechengroessen-der-sozialversicherung/beitragssaetze/ ；https://www.gesetze-im-internet.de/arbzg/__3.html

### C. 一手来源清单 (Germany)
- https://www.interhyp.de/baufinanzierung/ — 确认 Baufinanzierungsrechner 等 8 个计算器名称
- https://www.interhyp.de/lp/tilgungsrechner/ — 确认 Tilgungsrechner、Restschuld、Sondertilgung、Zinsbindung 概念
- https://www.check24.de/baufinanzierung/ — 确认 CHECK24 Baufinanzierung 比价产品存在
- https://www.drklein.de/baufinanzierung.html — 确认 Baufinanzierungs-/Anschluss-/Umschuldungs-/Forward-/Bauspar-Rechner
- https://www.ing.de/baufinanzierung/ — 确认 ING Schnell-Rechner
- https://www.sparkasse.de/rechner.html — 确认 Sparkasse 计算器中心
- https://www.sparkasse.de/service/rechner/brutto-netto-rechner.html — 确认 Brutto-Netto-Rechner
- https://www.schwaebisch-hall.de/bausparen/wissenswertes/zuteilung.html 与 .../bewertungszahl.html — 确认 Bauspar 知识页存在（内容 JS）
- https://www.bmf-steuerrechner.de/ — 确认 BMF Lohn- und Einkommensteuerrechner 与 Programmablaufplan 机制
- https://www.gesetze-im-internet.de/bgb/__489.html — §489 十年解约权、6 个月通知
- https://www.gesetze-im-internet.de/bgb/__490.html — §490(2) 提前解约与损害赔偿
- https://www.gesetze-im-internet.de/grestg_1983/__11.html — GrEStG §11 基准 3,5%
- https://www.gesetze-im-internet.de/gnotkg/anlage_1.html — KV 14110/14120/14121 倍数
- https://www.gesetze-im-internet.de/gnotkg/anlage_2.html — Tabelle B 金额（500k€ → 1,0 = 935€）
- https://www.gesetze-im-internet.de/bgb/__656a.html、__656c.html — 中介合同形式与费用对半
- https://www.gesetze-im-internet.de/bausparkg/ — BauSparkG 目录
- https://www.gesetze-im-internet.de/arbzg/__3.html — 每日 8 小时工作制
- https://www.aok.de/fk/rps/tools/weitere-inhalte/beitraege-und-rechengroessen-der-sozialversicherung/beitragssaetze/ — 2026 社保费率

### D. UNVERIFIED (Germany)
- Grunderwerbsteuer 各州具体税率 (3.5%–6.5% 的逐州表) — 仅联邦基准 3.5% 已证实；[UNVERIFIED] / 逐州法条未取。
- GNotKG KV 21201 (Kaufvertrag) 倍数 — [UNVERIFIED]。
- 30/360 按月计息惯例 — [UNVERIFIED]，无一手来源。
- 标准贷款期限、典型 Tilgung 率、自雇/收入要求 — [SECONDARY]/[UNVERIFIED]。
- Bausparen 的 Sparphase/Zuteilung/Bewertungszahl 具体公式 — [SECONDARY]（页面 JS 渲染）。
- 第 13 薪、月薪惯例 — [SECONDARY]。

---

## Netherlands

### A. 在售计算器清单

| 产品 (荷文 / 英文) | 提供商 | 类型 | 一手 URL |
|---|---|---|---|
| NHG toets / Keuzehulp inkomen / Rekenhulp verduurzamen (NHG 资格与收入测试工具) | NHG (Nationale Hypotheek Garantie) | government-backed guarantee body | https://www.nhg.nl/ (导航确认) |
| Hypotheek maandlasten calculator (monthly mortgage cost) | Independer | comparison 比价 | https://www.independer.nl/hypotheek/info/maandlasten |
| Hoeveel kan ik lenen? (how much can I borrow / maximale hypotheek) | De Hypotheker | broker 经纪 | https://www.hypotheker.nl/zelf-berekenen/hoeveel-kan-ik-lenen/ |
| Can I afford this house? / Kan ik dit huis betalen? | De Hypotheker | broker | https://www.hypotheker.nl/en/calculators-and-checks/can-i-afford-this-house/ |
| Kun je de hypotheek betalen? 消费者工具与知识页 | AFM | government 政府(监管) | https://www.afm.nl/nl-nl/consumenten/themas/hypotheken |
| Eigenwoningforfait 计算表 / aangifte rekenhulpen | Belastingdienst | government (tax) | https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/hoe-werkt-eigenwoningforfait |
| **薪资/到手工资类:** Loonheffing 代扣表与 voorlopige aanslag / proefberekening 工具 | Belastingdienst | government | https://download.belastingdienst.nl/belastingdienst/docs/rekenvoorschriften_voor_geautomatiseerde_loonadministratie_lh991z62fd.pdf ; https://over-ons.belastingdienst.nl/onderwerpen/omgaan-met-gegevens/algoritmeregister/weegmodule-verzoek-voorlopige-aanslag-vva-en-bedrijfsregels-eerste-voorlopige-aanslag-eva/ |

(注：Rabobank https://www.rabobank.nl/particulieren/hypotheek/ 与 ABN AMRO https://www.abnamro.nl/nl/prive/hypotheken/hypotheek-berekenen.html 本次返回 403/503，其"Hypotheek berekenen"计算器未能直接取证 — [SECONDARY]。)

### B. 核心计算规则

- **摊销类型 annuitair / lineair / aflossingsvrij.** AFM 消费者页确认三类产品并存（含"Oversluiten"、"Vervroegd aflossen"专题）。annuitair 为每期总还款恒定（标准年金公式，利息递减本金递增）；lineair 为本金恒定、还款递减；aflossingsvrij 仅付息、期末还本。来源：https://www.afm.nl/nl-nl/consumenten/themas/hypotheken
- **NHG 担保 grens 与 premie (2026).** 政府在 2025-10-08 公告：NHG 上限 2026 年由 450.000 € 升至 **470.000 €**；含附加节能措施的贷款上限再高 6%，即 **498.200 €**；一次性 borgtochtpremie 维持 **0,4%**。来源（BZK/Volkshuisvesting Nederland）：https://www.volkshuisvestingnederland.nl/actueel/nieuws/2025/10/08/nhg-grens-stijgt-naar-470.000-euro-afsluitpremie-blijft-04
- **NHG 要求完整还款计划 (annuitair/lineair)：** NHG 的 Voorwaarden en Normen 以 PDF 发布（如 https://nhg.nl/media/...voorwaarden_en_normen... 检索可见），**具体条款文本本次未取，[SECONDARY]**。
- **Hypotheekrenteaftrek (房贷利息抵扣).** 仅 annuitair/lineair（有还款计划）可抵扣；aflossingsvrij 新贷不适用 — 后句 [SECONDARY]。已证实：tariefsaanpassing 使高收入者扣除率受限。2026 年：应税收入（扣除前）超过 **78.426 €**（2025 年为 76.817 €）时，tariefsaanpassing 为 **11,94%**，最高档利息扣除率被限制为 **37,56%**（2025 年为 37,48%）。来源：https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/tariefsaanpassing-eigen-woning
- **Eigenwoningforfait (自住房推定收益, 2026 表).** 0% ≤ 12.500 €；12.500–25.000 € 为 0,10%；25.000–50.000 € 为 0,20%；50.000–75.000 € 为 0,25%；75.000–1.350.000 € 为 0,35%；超过 1.350.000 € = 4.725 € + 超出部分的 2,35%。示例：WOZ 280.000 € × 0,35% = 980 €。来源：https://www.belastingdienst.nl/wps/wcm/connect/nl/koopwoning/content/hoe-werkt-eigenwoningforfait
- **Overdrachtsbelasting (不动产转让税).** 自住自用住宅 2%；非自住住宅自 **2026 年起 8%**（2025 年该类为较高档）；其他不动产（土地、商业物业等）**10,4%**；继承/特定情形另有 0% 例外。来源：https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/tarieven_overdrachtsbelasting/
- ** startersvrijstelling (首购豁免).** 条件：购房者成年且 **未满 35 岁**（以公证交付签署时点为准）、所购为将长期自住住宅、并满足其余 4 项条件，则免缴转让税。来源：https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/overdrachtsbelasting/startersvrijstelling/
- **Notariskosten.** 官方公证人门户 notaris.nl 设有"Kosten bij koop en verkoop huis"专页；具体金额/费率本次未取，[UNVERIFIED]。来源：https://www.notaris.nl/
- **30 年标准期限 / 按月复利：** [SECONDARY]，未找到监管一手表述。
- **LTV 与 loan-to-income (toetsinkomen).** 依据《Tijdelijke regeling hypothecair krediet》(BWBR0032503)：§1 定义 toetsinkomen（贷款机构在确定最高贷款额时采用的收入）；Art. 2 要求以当前固定且可持续收入为准，若收入非固定，可用最近 **3 个日历年/36 个月**平均收入；Art. 3/3a 规定 financieringslastpercentages 与其它财务义务的加总/扣减；§3 (Artikel 5) 专门规定"贷款额与房屋价值之比"上限。**Art.5 的具体百分比文本本次未从页面渲染中取到，[UNVERIFIED]**。来源：https://wetten.overheid.nl/BWBR0032503/2025-01-01/0
- **薪资/到手工资规则（一段）.**
  荷兰由雇主代扣 **loonheffing**（个人所得税与国民保险合并代扣，按 Belastingdienst 的 rekenvoorschriften/年度税率表）；员工另有 8% 度假金 (vakantiegeld) 惯例 [SECONDARY]；工资支付通常为月薪，年收入需按年税率表换算；最低工资 (WML) 由 Rijksoverheid 年度调整；法定工时上限见 Arbeidstijdenwet [SECONDARY]。来源：https://download.belastingdienst.nl/belastingdienst/docs/rekenvoorschriften_voor_geautomatiseerde_loonadministratie_lh991z62fd.pdf ；https://www.rijksoverheid.nl/actueel/nieuws/2025/12/10/uitkeringsbedragen-per-1-januari-2026 ；https://ondernemersplein.overheid.nl/personeel/arbeidsvoorwaarden/werktijden/

### C. 一手来源清单 (Netherlands)
- https://www.nhg.nl/ — 确认 NHG 工具导航（NHG toets、Keuzehulp inkomen）
- https://www.volkshuisvestingnederland.nl/actueel/nieuws/2025/10/08/nhg-grens-stijgt-naar-470.000-euro-afsluitpremie-blijft-04 — NHG 2026 grens 470.000 €、能源 498.200 €、premie 0,4%
- https://www.belastingdienst.nl/.../tarieven_overdrachtsbelasting/ — 2% / 8% (2026) / 10,4%
- https://www.belastingdienst.nl/.../startersvrijstelling/ — 首购豁免 4 条件、<35 岁
- https://www.belastingdienst.nl/.../tariefsaanpassing-eigen-woning — 2026 阈值 78.426 €、11,94% / 37,56%
- https://www.belastingdienst.nl/.../hoe-werkt-eigenwoningforfait — 2026 eigenwoningforfait 完整分档表
- https://wetten.overheid.nl/BWBR0032503/2025-01-01/0 — Tijdelijke regeling：toetsinkomen、36 个月平均、Art.5 LTV 章节
- https://www.afm.nl/nl-nl/consumenten/themas/hypotheken — 三类摊销/消费者工具
- https://www.notaris.nl/ — 公证费用章节存在
- https://www.hypotheker.nl/zelf-berekenen/hoeveel-kan-ik-lenen/ — De Hypotheker 计算器
- https://www.independer.nl/hypotheek/info/maandlasten — Independer 月供计算器

### D. UNVERIFIED (Netherlands)
- Tijdelijke regeling Art. 5 的 LTV 具体百分比 — [UNVERIFIED]（页面未渲染该条正文）。
- 30 年期限、按月复利的监管依据 — [SECONDARY]。
- NHG "必须完整还款计划"条款原文 — [SECONDARY]（PDF 未解析）。
- notariskosten 具体金额/费率 — [UNVERIFIED]。
- Rabobank / ABN AMRO 的 Hypotheek berekenen 计算器 — [SECONDARY]（站点 403/503）。
- Arbeidstijdenwet 具体工时数字、vakantiegeld 8% — [SECONDARY]（后者为惯例/法源未逐条取证）。

---

## France

### A. 在售计算器清单

| 产品 (法文 / 英文) | 提供商 | 类型 | 一手 URL |
|---|---|---|---|
| Simulateur capacité d'emprunt / Simulateur mensualités / Simulateur de prêt immobilier | CAFPI | broker 经纪 | https://www.cafpi.fr/credit-immobilier/ (导航确认) |
| Simulation de prêt immobilier / calcul de mensualités | Meilleurtaux | comparison 比价 | https://www.meilleurtaux.com/credit-immobilier/ (导航确认) |
| Calculer les frais de notaire pour un achat immobilier (公证费计算器) | service-public.fr | government 政府 | https://www.service-public.gouv.fr/particuliers/vosdroits/R54267 |
| Simulateur de l'impôt sur le revenu (所得税计算器) | impots.gouv.fr (DGFiP) | government | https://www.impots.gouv.fr/simulateur-de-limpot-sur-le-revenu |
| Simulateur salaire brut/net (税前/税后工资) | URSSAF Mon-entreprise | government | https://mon-entreprise.urssaf.fr/ |
| Prêt à taux zéro (PTZ) 资格说明页 | service-public.fr | government | https://www.service-public.gouv.fr/particuliers/vosdroits/F10871 |
| Assurance emprunteur 取得与变更说明页 | service-public.fr | government | https://www.service-public.gouv.fr/particuliers/vosdroits/F1671 |
| Taux d'usure 季度公布（利率上限工具/数据） | Banque de France | central bank 央行 | https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2 |

### B. 核心计算规则

- **Crédit immobilier 摊销 (mensualité constante).** 标准做法为等额本息：月供 = 本金 × i / (1 − (1+i)^(−n))，i 为月利率（名义年利率/12），n 为月数；另有 taux nominal（名义利率）与 TAEG（含费用与保险的实际年成本）之别。**TAEG 的一手法条文本本次未取（legifrance 被 Cloudflare 拦截 403），[UNVERIFIED]**。
- **Taux d'usure (usury rate).** 由 Banque de France 按季度公布，作为各类贷款（含 immobilier）利率上限；本次确证其官方公布页存在（2026-Q2），**具体费率数值因页面 JS 未渲染，[UNVERIFIED]**。来源：https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2
- **Assurance emprunteur.** service-public 设专页说明"如何取得房贷保险"（F1671）；**"实务上强制、按年龄费率、Loi Lemoine/2018 与转换权"等细节本次未取到一手正文，[UNVERIFIED]/[SECONDARY]**。来源：https://www.service-public.gouv.fr/particuliers/vosdroits/F1671
- **Frais de notaire.** service-public 设"公证费是什么"专页（F17701）与计算器（R54267）。**"ancien 约 7–8%、neuf 约 2–3%"的本次数值未从一手页面取得（页面内容 JS 渲染、notaires.fr 返回 403），[UNVERIFIED]；若引用具体百分比须标注 [SECONDARY]**。来源：https://www.service-public.gouv.fr/particuliers/vosdroits/F17701 ；https://www.service-public.gouv.fr/particuliers/vosdroits/R54267
- **PTZ (prêt à taux zéro).** service-public 官方页确认适用四类情形：购置 **neuf**（竣工不满 5 年、首次入住）、购置 **ancien**、购置现住 **logement social**、以及将非住宅改造为住宅；各情形条件不同。**收入上限、可贷比例、zone 划分等数值本次未取，[UNVERIFIED]**。来源：https://www.service-public.gouv.fr/particuliers/vosdroits/F10871
- **IRA / indemnité de remboursement anticipé (提前还款补偿金) — 已证实.** 提前还款补偿金不得超过以下两者中的较高上限：提前偿还本金部分按贷款"平均利率"计算的 **6 个月利息**，以及提前还款前剩余本金的 **3%**；浮动利率贷款还可另加 intérêts compensateurs。来源：https://www.service-public.gouv.fr/particuliers/vosdroits/F1669
- **Durée standard、按月复利、taux effectif global：** [SECONDARY]/[UNVERIFIED]（未取得一手条文）。
- **HCSF 偿付能力规则 (35% 负债率、最长 25 年).** 该规范由 Haut Conseil de Stabilité Financière 发布；本次尝试访问 economie.gouv.fr/hcsf/decisions-hcsf 与 legifrance 均被 Cloudflare 403 拦截，**未能取得一手文本，[UNVERIFIED]/[SECONDARY]**。可参考的官方入口（未能打开）：https://www.economie.gouv.fr/hcsf/decisions-hcsf
- **薪资/到手工资规则（一段）.**
  法国工资单由两部分构成：社保分摊 (cotisations sociales) 占毛工资比例由 URSSAF 规则决定，计算可用官方 Mon-entreprise 模拟器；个人所得税自 2019 年起实行 **prélèvement à la source (PAS，源头代扣)**，由雇主按 DGFiP 提供的税率 (taux de prélèvement) 每月代扣，年度再申报清算 (impots.gouv.fr 模拟器覆盖)。法定每周工作时间为 **35 heures**（temps complet，作为加班计算基准，超出部分为 heures supplémentaires），工资惯例为月净收入发放。来源：https://code.travail.gouv.fr/fiche-ministere-travail/la-duree-legale-du-travail ；https://mon-entreprise.urssaf.fr/ ；https://www.impots.gouv.fr/simulateur-de-limpot-sur-le-revenu 。加班 25%/50% 加成费率本次未逐条取证，[SECONDARY]。

### C. 一手来源清单 (France)
- https://www.service-public.gouv.fr/particuliers/R54267 (=R54267) — 确认公证费计算器存在
- https://www.service-public.gouv.fr/particuliers/vosdroits/F17701 — 确认"公证费是什么"官方页（内容 JS）
- https://www.service-public.gouv.fr/particuliers/vosdroits/F1669 — **已证实 IRA 上限：6 个月利息 或 3% 剩余本金**
- https://www.service-public.gouv.fr/particuliers/vosdroits/F10871 — 确认 PTZ 四类适用情形
- https://www.service-public.gouv.fr/particuliers/vosdroits/F1671 — 确认房贷保险官方页
- https://www.banque-france.fr/fr/statistiques/taux-et-cours/taux-dusure-2026-q2 — 确认 usure 季度公布页（数值未渲染）
- https://www.impots.gouv.fr/simulateur-de-limpot-sur-le-revenu — 确认 2026 年（对 2025 收入）所得税模拟器
- https://mon-entreprise.urssaf.fr/ — 确认 URSSAF 官方毛/净工资模拟器
- https://code.travail.gouv.fr/fiche-ministere-travail/la-duree-legale-du-travail — 确认法定 35 小时/周
- https://www.cafpi.fr/credit-immobilier/ — 确认能力/月供/贷款模拟器名称（404 页导航）
- https://www.meilleurtaux.com/credit-immobilier/ — 确认贷款模拟/月供计算

### D. UNVERIFIED (France)
- TAEG / taux effectif global 法条文本 — [UNVERIFIED]（legifrance 403）。
- Taux d'usure 具体季度费率 — [UNVERIFIED]（页面 JS）。
- Frais de notaire 的 7–8% / 2–3% 数值 — [UNVERIFIED]；聚合器口径为 [SECONDARY]。
- Assurance emprunteur 的 Loi Lemoine / 2018 权利、按年龄费率、转换权 — [UNVERIFIED]/[SECONDARY]。
- PTZ 收入上限、额度、zone — [UNVERIFIED]（仅有适用情形）。
- HCSF 35% / 25 年规范的一手文本 — [UNVERIFIED]（500/403 阻断）。
- 标准期限、按月复利 — [SECONDARY]。
- 加班加成 25%/50% — [SECONDARY]。
- 社保具体分摊率数字 — [UNVERIFIED]（仅有官方模拟器）。

---

## 跨国家结论要点 (供报告使用)
1. **可直接实现的硬规则：** 德国 §489 (10 年/6 个月) 与 §490 (6 个月+赔偿)、GrEStG 3.5% 联邦基准、GNotKG Tabelle B 金额；荷兰 NHG 470.000 €/498.200 €/0,4%、eigenwoningforfait 分档、tariefsaanpassing 37,56%、overdrachtsbelasting 2%/8%/10,4%、starter <35 岁；法国 IRA = min(6 个月利息, 3% 本金)、法定 35 小时。
2. **需要补证的高风险数字：** 德国各州 GrESt 税率与 30/360 惯例；荷兰 LTV 百分比与 notariskosten；法国 frais de notaire 百分比、taux d'usure 数值、HCSF 35%/25 年。
3. **阻断原因：** legifrance.gouv.fr 与 economie.gouv.fr 在本会话被 Cloudflare 403 拦截；service-public/banque-france 部分页面正文由 JS 渲染，纯 HTML 抓取取不到数值；PDF 附件不被 fetch 工具支持。
