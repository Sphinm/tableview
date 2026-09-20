import { describe, it, expect } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FloatingFeedback } from '../FloatingFeedback';

const url = () => 'mailto:x@y.co';

describe('FloatingFeedback', () => {
  it('is a plain mailto link, so activating it reaches the mail client directly', () => {
    const html = renderToStaticMarkup(
      <FloatingFeedback getEmailUrl={() => 'mailto:feedback@tableview.dev'} />,
    );
    expect(html).toContain('href="mailto:feedback@tableview.dev"');
  });

  it('offers no second step, since the link already opens the draft', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).not.toContain('Open in Gmail');
  });

  /**
   * The control is icon-only, so the hint is not decoration: it is the only place
   * the action is named on screen. It has to appear on hover *and* on keyboard
   * focus, or a keyboard user gets an unlabelled circle.
   */
  it('reveals its hint on hover and on keyboard focus', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).toContain('group-hover:opacity-100');
    expect(html).toContain('group-focus-visible:opacity-100');
    expect(html).toContain('opacity-0');
  });

  it('names the action for assistive tech without reading the hint twice', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    // The anchor carries the accessible name…
    expect(html).toContain('aria-label="Send feedback"');
    // …so the visual hint is hidden from the accessibility tree.
    expect(html).toMatch(/aria-hidden="true"[^>]*>Send feedback/);
  });

  it('is a circle rather than a pill', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).toContain('rounded-full');
    // A square icon-sized box is what makes it read as a circle, not a pill.
    expect(html).toMatch(/size-1[01]/);
  });

  it('lets the caller override the hint', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} label="Contact us" />);
    expect(html).toContain('aria-label="Contact us"');
    expect(html).toContain('Contact us');
  });

  it('renders safely where there is no DOM to observe, resting in the corner', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).toContain('bottom-6');
    expect(html).not.toContain('bottom-64');
  });
});
