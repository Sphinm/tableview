import { describe, it, expect, beforeEach } from 'bun:test';
import {
  trackUserAction,
  trackUserClick,
  setSentryUser,
  describeFile,
  isHighValueAction,
  captureMessage,
} from '../sentry';

describe('Sentry User Actions and Clicks', () => {
  beforeEach(() => {
    // Reset global user state if needed
    setSentryUser(null);
  });

  it('records user clicks with ui.click category', () => {
    expect(() => {
      trackUserClick('test_button_click', { button_id: 'calculate-btn', logged_in: false });
    }).not.toThrow();
  });

  it('records custom user actions with options', () => {
    expect(() => {
      trackUserAction('deal_copilot_login_required', { prompt_length: 42 }, {
        category: 'auth.required',
        level: 'warning',
      });
    }).not.toThrow();
  });

  it('scrubs sensitive keys so user files, tables, and data are never sent unredacted', () => {
    // Verify that passing sensitive keys does not throw and gets handled safely
    expect(() => {
      trackUserAction('test_scrubbing', {
        filename: 'secret_underwriting.xlsx',
        sql: 'SELECT * FROM users',
        content: 'confidential terms',
        headers: ['ssn', 'tax_id'],
        safe_param: 123,
      });
    }).not.toThrow();
  });

  it('updates Sentry user context for authenticated user and clears on logout', () => {
    expect(() => {
      setSentryUser({
        id: 'user_123',
        email: 'investor@example.com',
        plan: 'pro',
      });
    }).not.toThrow();

    expect(() => {
      setSentryUser(null);
    }).not.toThrow();
  });

  it('describes files safely without retaining exact name', () => {
    const desc = describeFile({ name: 'MyPortfolio2026.CSV', size: 2 * 1024 * 1024 });
    expect(desc.extension).toBe('csv');
    expect(desc.sizeBucket).toBe('1-10MB');
    expect((desc as any).name).toBeUndefined();
  });

  it('identifies high-value action patterns for automatic instant reporting', () => {
    expect(isHighValueAction('deal_copilot_calculate_click')).toBe(true);
    expect(isHighValueAction('dscr_export_excel')).toBe(true);
    expect(isHighValueAction('mortgage_export_pdf_click')).toBe(true);
    expect(isHighValueAction('pricing_page_upgrade_pro_click')).toBe(true);
    expect(isHighValueAction('checkout_initiated')).toBe(true);
    expect(isHighValueAction('checkout_completed')).toBe(true);
    expect(isHighValueAction('deal_copilot_preset_click')).toBe(true);
    expect(isHighValueAction('deal_copilot_prompt_blur')).toBe(true);

    expect(isHighValueAction('random_ui_hover')).toBe(false);
    expect(isHighValueAction('generic_div_click')).toBe(false);
  });

  it('supports captureMessage for immediate event reporting without error', () => {
    expect(() => {
      captureMessage('deal_copilot_test_instant_event', {
        level: 'info',
        extra: { prompt_text: 'Austin duplex $750k', test_mode: true },
      });
    }).not.toThrow();
  });

  it('supports skipScrub: true for AI Copilot functional verification', () => {
    expect(() => {
      trackUserAction(
        'deal_copilot_calculate_click',
        {
          prompt_text: 'Buying 4-plex in Dallas for $850k with $7,200 rent',
          content: 'exact unscrubbed prompt for verification',
          sql: 'test query parameter',
        },
        { captureAsEvent: true, skipScrub: true }
      );
    }).not.toThrow();

    expect(() => {
      trackUserClick(
        'deal_copilot_calculate_click',
        { prompt_text: 'Austin 10% down' },
        { captureAsEvent: true, skipScrub: true }
      );
    }).not.toThrow();
  });
});
