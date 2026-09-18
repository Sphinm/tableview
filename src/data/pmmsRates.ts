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
}

export interface PmmsDataset {
  asOfDate: string;
  source: string;
  sourceUrl: string;
  fixed30: PmmsRateItem;
  fixed15: PmmsRateItem;
  fha30: PmmsRateItem;
  va30: PmmsRateItem;
}

export const LATEST_PMMS_RATES: PmmsDataset = {
  asOfDate: 'Weekly Benchmark (March 2026)',
  source: 'Freddie Mac Primary Mortgage Market Survey® (PMMS)',
  sourceUrl: 'https://www.freddiemac.com/pmms',
  fixed30: {
    rate: 6.42,
    label: '30-Year Fixed',
    termYears: 30,
    weekChange: -0.04,
    feesAndPoints: 0.6
  },
  fixed15: {
    rate: 5.68,
    label: '15-Year Fixed',
    termYears: 15,
    weekChange: -0.03,
    feesAndPoints: 0.6
  },
  fha30: {
    rate: 6.15,
    label: 'FHA 30-Year',
    termYears: 30
  },
  va30: {
    rate: 6.08,
    label: 'VA 30-Year',
    termYears: 30
  }
};
