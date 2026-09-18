/**
 * Freddie Mac Primary Mortgage Market Survey® (PMMS) Benchmark Rates
 * Updated weekly; standard industry national barometer for conforming residential mortgages.
 */

export interface PmmsRateItem {
  rate: number;
  label: string;
  termYears: number;
  weekChange?: number;
  feesAndPoints?: number;
  sourceType?: 'pmms' | 'mnd';
  description?: string;
}

export interface PmmsDataset {
  asOfDate: string;
  source: string;
  sourceUrl: string;
  mndLive30: PmmsRateItem;
  fixed30: PmmsRateItem;
  fixed15: PmmsRateItem;
  fha30: PmmsRateItem;
  va30: PmmsRateItem;
}

export const LATEST_PMMS_RATES: PmmsDataset = {
  asOfDate: 'September 2026 Benchmark',
  source: 'Freddie Mac PMMS® & Mortgage News Daily (MND)',
  sourceUrl: 'https://www.freddiemac.com/pmms',
  mndLive30: {
    rate: 7.12,
    label: 'Live Market 30Y',
    termYears: 30,
    weekChange: 0.14,
    sourceType: 'mnd',
    description: 'Mortgage News Daily real-time lender rate sheets (broader credit profiles, unvarnished market price).'
  },
  fixed30: {
    rate: 6.95,
    label: '30-Year Fixed (PMMS)',
    termYears: 30,
    weekChange: 0.19,
    feesAndPoints: 0.0,
    sourceType: 'pmms',
    description: 'Freddie Mac PMMS weekly survey (20% down, 740+ FICO prime borrowers).'
  },
  fixed15: {
    rate: 6.26,
    label: '15-Year Fixed',
    termYears: 15,
    weekChange: 0.17,
    feesAndPoints: 0.0,
    sourceType: 'pmms'
  },
  fha30: {
    rate: 6.65,
    label: 'FHA 30-Year',
    termYears: 30,
    sourceType: 'pmms'
  },
  va30: {
    rate: 6.58,
    label: 'VA 30-Year',
    termYears: 30,
    sourceType: 'pmms'
  }
};
