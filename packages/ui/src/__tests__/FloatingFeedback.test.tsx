import { describe, it, expect } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { FloatingFeedback, FeedbackFallback } from '../FloatingFeedback';

const url = () => 'mailto:x@y.co';

describe('FloatingFeedback', () => {
  it('renders an accessible link to the feedback address', () => {
    const html = renderToStaticMarkup(
      <FloatingFeedback getEmailUrl={() => 'mailto:feedback@tableview.dev'} />,
    );
    expect(html).toContain('href="mailto:feedback@tableview.dev"');
    expect(html).toContain('aria-label="Send feedback"');
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

describe('FeedbackFallback', () => {
  it('offers the Gmail web composer and the plain address', () => {
    const html = renderToStaticMarkup(
      <FeedbackFallback gmailUrl="https://mail.google.com/compose" email="feedback@tableview.dev" />,
    );
    expect(html).toContain('https://mail.google.com/compose');
    expect(html).toContain('feedback@tableview.dev');
  });

  it('opens the Gmail fallback in a new tab so the draft does not replace the app', () => {
    const html = renderToStaticMarkup(<FeedbackFallback gmailUrl="https://mail.google.com/compose" />);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer"');
  });
});
