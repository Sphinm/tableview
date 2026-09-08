import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { navigateTo } from '../lib/router';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    // Client-side simulated dispatch
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-slate-800 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800 text-indigo-400 mb-4">
          <MessageSquare className="size-3.5" />
          <span>We'd Love to Hear From You</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Contact & Support
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Have feedback, found an unsupported Parquet schema, or interested in partnership opportunities? Reach out via the form below or through our direct channels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Contact Channels */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="size-9 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center mb-3">
              <Mail className="size-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Direct Email</h3>
            <p className="text-xs text-slate-400 mb-2">For general support and partnerships:</p>
            <a
              href="mailto:support@tableview.dev"
              className="text-xs font-mono text-indigo-400 hover:underline"
            >
              support@tableview.dev
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="size-9 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center mb-3">
              <MessageSquare className="size-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Feedback & Features</h3>
            <p className="text-xs text-slate-400 mb-2">Request formats or share ideas:</p>
            <a
              href="mailto:feedback@tableview.dev"
              className="text-xs font-mono text-purple-400 hover:underline"
            >
              feedback@tableview.dev
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="size-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center mb-3">
              <HelpCircle className="size-4" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Knowledge Hub</h3>
            <p className="text-xs text-slate-400 mb-2">Check our in-depth guides for common answers:</p>
            <button
              onClick={() => navigateTo('/guides')}
              className="text-xs font-medium text-emerald-400 hover:underline cursor-pointer"
            >
              Explore Guides & Articles →
            </button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800">
          {submitted ? (
            <div className="py-12 text-center">
              <div className="size-12 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Thank You for Your Message!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Your message has been received. If your inquiry requires a response, our developer team will get back to you within 24-48 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Send us a Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Your Name <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email Address <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report">Bug Report / Unsupported Format</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Partnership / Sponsorship">Partnership / Advertising</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Message <span className="text-indigo-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you? Describe the issue or inquiry in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Send className="size-3.5" />
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>

      <AdSlot className="mt-8" />
    </div>
  );
};
