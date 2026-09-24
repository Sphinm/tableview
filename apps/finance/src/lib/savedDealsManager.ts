export interface AggregatedSavedDeal {
  calculatorId: string;
  calculatorTitle: string;
  route: string;
  id: string;
  name: string;
  date: string;
  data: any;
  metrics: {
    headline: string;
    subline: string;
  };
}

export const CALCULATOR_CONFIG: Record<
  string,
  { title: string; route: string; badge: string; color: string }
> = {
  dscr: {
    title: 'DSCR Loan Underwriter',
    route: '/dscr-loan-calculator',
    badge: 'Rental Debt',
    color: 'emerald',
  },
  refinance: {
    title: 'Mortgage Refinance Break-Even',
    route: '/refinance-calculator',
    badge: 'Refi Savings',
    color: 'indigo',
  },
  mortgage: {
    title: 'Mortgage Amortization',
    route: '/mortgage-calculator',
    badge: 'Residential',
    color: 'blue',
  },
  caprate: {
    title: 'Cap Rate & Cash Flow',
    route: '/cap-rate-calculator',
    badge: 'Cash Flow',
    color: 'teal',
  },
  commercial: {
    title: 'Commercial Balloon Debt',
    route: '/commercial-loan-calculator',
    badge: 'CRE Balloon',
    color: 'sky',
  },
  hardmoney: {
    title: 'Hard Money & Fix/Flip',
    route: '/hard-money-calculator',
    badge: '70% Rule',
    color: 'amber',
  },
  '1031': {
    title: '1031 Exchange Tax Deferral',
    route: '/section-1031-exchange-calculator',
    badge: 'Tax Strategy',
    color: 'violet',
  },
  'loan-comparison': {
    title: 'Loan Comparison Matrix',
    route: '/loan-comparison-calculator',
    badge: 'Side-by-Side',
    color: 'slate',
  },
};

/**
 * Scan localStorage for all tableview_scenarios_* keys and aggregate them
 */
export function getAllSavedDeals(): AggregatedSavedDeal[] {
  if (typeof window === 'undefined') return [];

  const deals: AggregatedSavedDeal[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tableview_scenarios_')) {
        const calculatorId = key.replace('tableview_scenarios_', '');
        const config = CALCULATOR_CONFIG[calculatorId] || {
          title: `${calculatorId.toUpperCase()} Calculator`,
          route: `/${calculatorId}-calculator`,
          badge: 'Calculator',
          color: 'slate',
        };

        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              for (const item of list) {
                if (item && item.id) {
                  deals.push({
                    calculatorId,
                    calculatorTitle: config.title,
                    route: config.route,
                    id: item.id,
                    name: item.name || 'Untitled Scenario',
                    date: item.date || 'Recent',
                    data: item.data,
                    metrics: item.metrics || { headline: '', subline: '' },
                  });
                }
              }
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error('Failed to read aggregated saved deals:', err);
  }

  return deals.sort((a, b) => b.id.localeCompare(a.id));
}

export function getTotalSavedDealsCount(): number {
  return getAllSavedDeals().length;
}

export function deleteSavedDeal(calculatorId: string, dealId: string): boolean {
  try {
    const storageKey = `tableview_scenarios_${calculatorId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return false;
    const filtered = list.filter((item: any) => item.id !== dealId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function renameSavedDeal(calculatorId: string, dealId: string, newName: string): boolean {
  try {
    const storageKey = `tableview_scenarios_${calculatorId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return false;
    const updated = list.map((item: any) =>
      item.id === dealId ? { ...item, name: newName.trim() } : item
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}
