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
    expect(html).toContain('aria-label="Send feedback"');
  });

  it('offers no second step, since the link already opens the draft', () => {
    // A popover here would restate what the browser's own "copy link address"
    // already does on a real anchor.
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).not.toContain('Open in Gmail');
    expect(html).not.toContain('Click to expand');
  });

  it('renders safely where there is no DOM to observe, resting in the corner', () => {
    // The banner offset is driven by an effect that watches the document, so this
    // also covers the server-rendered pass: with no document the button must still
    // render, and must not assume it is lifted.
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} />);
    expect(html).toContain('bottom-6');
    expect(html).not.toContain('bottom-64');
  });

  it('offers a visible label and hides it on narrow screens', () => {
    const html = renderToStaticMarkup(<FloatingFeedback getEmailUrl={url} label="Send feedback" />);
    expect(html).toContain('Send feedback');
    expect(html).toContain('hidden sm:inline');
  });
});
