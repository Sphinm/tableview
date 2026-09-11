/**
 * Crawlable FAQ registry.
 *
 * Why this file exists
 * --------------------
 * The calculators previously kept their questions inline in their page
 * components. That is fine for rendering, but it left the prerenderer with
 * nothing to emit, so every calculator URL shipped ZERO words of static content
 * — invisible to crawlers that do not execute JavaScript (Bing's first pass,
 * and most AI crawlers such as GPTBot and PerplexityBot).
 *
 * Anything registered here MUST be the same text the page renders. Emitting
 * FAQ copy that a visitor cannot see would be cloaking, so a page that renders
 * its own inline FAQ must not appear in this registry until it has been
 * refactored to read from here.
 *
 * Currently registered: the §1031 exchange calculator, whose page renders
 * directly from this data.
 */

export interface CalcFaq {
  q: string;
  a: string;
}

/** Keyed by canonical calculator path. */
export const CALCULATOR_FAQS: Record<string, CalcFaq[]> = {
  '/section-1031-exchange-calculator': [
    {
      q: 'What is a 1031 exchange and how does it work?',
      a: 'A 1031 exchange (named for IRC §1031) lets you defer capital gains tax when you sell investment real property and reinvest the proceeds into replacement property of like kind. You must identify replacement property within 45 days of closing and complete the purchase within 180 days. The gain is not forgiven — it is deferred, and the tax basis carries over into the replacement property, so the deferred gain becomes taxable when you eventually sell without exchanging again.',
    },
    {
      q: 'What is "boot" and when do I have to pay tax on it?',
      a: 'Boot is any value you take out of the exchange instead of rolling into the replacement property. It comes in two forms: cash boot, which is sale proceeds you keep rather than reinvest, and mortgage boot, which is debt paid off on the relinquished property that you do not replace with new financing or additional cash. You are taxed only on the lesser of your total boot or your realized gain. The rest of the gain stays deferred.',
    },
    {
      q: 'Can the 45-day identification period be extended?',
      a: 'No. The 45-day identification period and the 180-day exchange period are both set by statute and cannot be extended for any reason, including hardship, illness, or a death in the family. There is no grace period and no appeal. If day 45 passes without a valid written identification delivered to your qualified intermediary, the exchange fails and the entire gain becomes taxable.',
    },
    {
      q: 'Why might my 180-day deadline be shorter than 180 days?',
      a: 'The exchange period ends on the earlier of 180 days after closing or the due date of your tax return for the year of the transfer — including extensions. This is the most commonly missed rule in §1031. If you close in December and do not file for an extension, your return is due April 15, so you may have fewer than 135 days rather than 180. Filing for an extension restores the full 180 days.',
    },
    {
      q: 'Do I have to replace the debt on the relinquished property?',
      a: 'Yes, if you want to avoid mortgage boot. If you pay off a mortgage and do not take on new debt on the replacement property, the debt relief is treated as boot — unless you contribute additional cash at closing equal to the debt relief. You can also replace the debt with cash, or buy a more expensive property using a combination of your proceeds and new financing.',
    },
    {
      q: 'What are the three identification rules for replacement property?',
      a: 'You must identify replacement property in writing within 45 days, under one of three safe harbours. The three-property rule lets you identify up to three properties of any value. The 200% rule lets you identify any number of properties provided their combined fair market value does not exceed 200% of the relinquished property value. If you breach both, the 95% rule still saves the exchange provided you actually acquire at least 95% of the value you identified.',
    },
    {
      q: 'Can I 1031 exchange my primary residence or a second home?',
      a: 'Generally no. Section 1031 applies only to property held for productive use in a trade or business or for investment. A primary residence does not qualify. A second home may qualify if it was used as a rental or investment property, but the rules are strict and depend on your actual use and holding period. Primary residences are instead eligible for the §121 exclusion, which is a separate and different tax benefit.',
    },
    {
      q: 'Do I need a qualified intermediary, and what do they cost?',
      a: 'Yes, in practice. If you take actual or constructive receipt of the sale proceeds at any point, the exchange is disqualified — your attorney, real estate agent, or accountant cannot act as your intermediary. A qualified intermediary (QI) holds the proceeds in a qualified escrow account between the sale and the purchase. Typical QI fees run roughly $1,000 to $1,500 for a straightforward exchange, plus additional fees for complex structures.',
    },
    {
      q: 'How is depreciation recapture taxed in an exchange?',
      a: 'Depreciation you previously deducted is subject to unrecaptured §1250 gain treatment at a federal rate of up to 25%, rather than the ordinary income rates that apply to other depreciation recapture. In an exchange, recapture is recognised FIRST against any boot you receive, before long-term capital gain. A fully deferred exchange recognises neither, which is a large part of why §1031 exchanges are attractive to rental property owners.',
    },
    {
      q: 'Does every state recognize 1031 exchanges?',
      a: 'No. Most states conform to federal §1031 treatment, but a few do not. Pennsylvania, for example, does not allow deferral of its state income tax on like-kind exchanges. Several conforming states — including California — impose a claw-back that taxes the deferred gain when you later sell the replacement property if it is located outside that state. This calculator takes your state rate as an input rather than guessing, so you should confirm your state’s treatment with a tax advisor.',
    },
  ],
};

export function getCalculatorFaqs(path: string): CalcFaq[] {
  return CALCULATOR_FAQS[path] ?? [];
}
