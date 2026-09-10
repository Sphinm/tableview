import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle, Copy, ExternalLink, Check, Bug, FileText } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { navigateTo } from '../lib/router';
import { getBugReportTemplate, getBugReportMailto } from '../lib/feedback';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formData, setFormData] = useState(() => {
    const search = typeof window !== 'undefined' ? window.location.search.toLowerCase() : '';
    const hash = typeof window !== 'undefined' ? window.location.hash.toLowerCase() : '';
    const isBug = search.includes('bug') || search.includes('issue') || hash.includes('bug') || hash.includes('issue');
    return {
      name: '',
      email: '',
      subject: isBug ? 'Bug Report' : 'General Inquiry',
      message: isBug ? getBugReportTemplate() : ''
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Construct genuine email mailto payload routed to feedback@tableview.dev
    const encodedSubject = encodeURIComponent(`[TableView] ${formData.subject} from ${formData.name}`);
    const encodedBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.subject}\n\nMessage:\n${formData.message}\n\n---\nSent via TableView.dev contact workbench`
    );

    // Trigger user's mail client directly
    window.location.href = `mailto:feedback@tableview.dev?subject=${encodedSubject}&body=${encodedBody}`;
    setSubmitted(true);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('feedback@tableview.dev');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=feedback@tableview.dev&su=${encodeURIComponent(
    `[TableView] ${formData.subject} from ${formData.name || 'User'}`
  )}&body=${encodeURIComponent(
    `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-800 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 mb-4 shadow-sm">
          <MessageSquare className="size-3.5" />
          <span>We'd Love to Hear From You</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4">
          Contact & Support
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Have feedback, found an unsupported Parquet schema, or interested in partnership opportunities? Reach out via the form below or send directly to our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Contact Channels */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="size-9 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center mb-3">
              <Mail className="size-4" />
            </div>
            <h3 className="text-slate-100 font-semibold text-sm mb-1">Direct Support</h3>
            <p className="text-xs text-slate-400 mb-2">Technical issues & partnerships:</p>
            <a
              href="mailto:support@tableview.dev"
              className="text-xs font-mono text-slate-300 hover:text-slate-100 underline decoration-slate-600"
            >
              support@tableview.dev
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="size-9 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center mb-3">
              <MessageSquare className="size-4" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-slate-100 font-semibold text-sm">Feedback & Inquiries</h3>
              <button
                onClick={handleCopyEmail}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                title="Copy email address"
              >
                {copiedEmail ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-2">Feature ideas & format requests:</p>
            <a
              href="mailto:feedback@tableview.dev"
              className="text-xs font-mono text-slate-300 hover:text-slate-100 underline decoration-slate-600 font-semibold"
            >
              feedback@tableview.dev
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
              <HelpCircle className="size-4" />
            </div>
            <h3 className="text-slate-100 font-semibold text-sm mb-1">Knowledge Hub</h3>
            <p className="text-xs text-slate-400 mb-2">Check our in-depth guides for instant answers:</p>
            <button
              onClick={() => navigateTo('/guides')}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Explore Guides & Articles →
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-3">
              <Bug className="size-4" />
            </div>
            <h3 className="text-slate-100 font-semibold text-sm mb-1">Direct Bug Report</h3>
            <p className="text-xs text-slate-400 mb-2">Launch your email app with our structured bug template:</p>
            <a
              href={getBugReportMailto()}
              className="text-xs font-medium text-amber-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
              title="Open email client with preset bug template"
            >
              <span>Open Email with Template →</span>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          {submitted ? (
            <div className="py-10 text-center space-y-4">
              <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Message Dispatched to feedback@tableview.dev!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Your email client was prompted with your message details. If your browser blocked the email client or you prefer webmail, you can open it directly in Gmail or copy our address below.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href={gmailWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Open & Send via Gmail</span>
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedEmail ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                  <span>{copiedEmail ? 'Copied: feedback@tableview.dev' : 'Copy feedback@tableview.dev'}</span>
                </button>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Write Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-lg font-bold text-slate-100">Send us a Message</h3>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  To: feedback@tableview.dev
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => {
                    const nextSubject = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      subject: nextSubject,
                      message: nextSubject === 'Bug Report' && (!prev.message || prev.message.trim() === '')
                        ? getBugReportTemplate()
                        : prev.message
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600 transition-colors"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report / Unsupported Schema</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Partnership / Sponsorship">Partnership / Advertising</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Your Message <span className="text-red-400">*</span>
                  </label>
                  {formData.subject === 'Bug Report' && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, message: getBugReportTemplate() }))}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Load standard bug report template"
                    >
                      <FileText className="size-3" />
                      <span>Insert Bug Template</span>
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={formData.subject === 'Bug Report' ? 9 : 5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    formData.subject === 'Bug Report'
                      ? 'Describe the bug or error message...'
                      : 'How can we help you? Describe your question or feedback...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-600 transition-colors resize-none font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="size-3.5" />
                  <span>Submit & Send Email</span>
                </button>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Direct to <code className="text-slate-300">feedback@tableview.dev</code></span>
                  {formData.subject === 'Bug Report' && (
                    <>
                      <span>·</span>
                      <a
                        href={getBugReportMailto()}
                        className="text-amber-400 hover:underline"
                        title="Open default email client"
                      >
                        Open in Mail Client
                      </a>
                    </>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <AdSlot className="mt-8" />
    </div>
  );
};
