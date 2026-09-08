import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';
import { navigateTo } from '../lib/router';

export const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Page Header */}
      <div className="mb-10 pb-8 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-400 mb-4">
          <Shield className="size-3.5" />
          <span>Last Updated: September 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          At TableView.dev, we prioritize your data confidentiality and privacy above all else. This policy explains our 100% client-side data handling model, how cookies and third-party advertising services (including Google AdSense) operate, and your legal privacy rights.
        </p>
      </div>

      {/* Core Privacy Highlight Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm mb-12">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 shrink-0 mt-0.5">
            <Lock className="size-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-1.5">
              The 100% Client-Side Sandbox Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When you drag, drop, or open an Apache Parquet, CSV, TSV, or JSON file in TableView.dev, <strong>zero bytes are uploaded to our servers</strong>. All file parsing, DuckDB SQL execution, and Excel conversions happen entirely inside your local browser memory via WebAssembly (Wasm). Your confidential business data never leaves your computer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            1. Information We Collect
          </h2>
          <p className="mb-3 text-slate-400">
            Because our core application operates entirely client-side, TableView.dev does not collect, store, or view the contents of your datasets. However, like most web applications, we may receive limited technical information automatically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>Web Server Log Data:</strong> Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), referring/exit pages, platform type, and date/time stamps provided by our static hosting infrastructure (e.g., Cloudflare Pages).</li>
            <li><strong>Aggregated Anonymous Usage:</strong> Non-personally identifiable diagnostic events (e.g., page load latencies, unhandled runtime errors) to maintain system reliability.</li>
            <li><strong>Direct Communications:</strong> If you contact us via email, we collect your email address and any message details you provide to respond to your inquiry.</li>
          </ul>
        </section>

        <section id="advertising" className="scroll-mt-24">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Eye className="size-5 text-indigo-400" />
            2. Google AdSense & Third-Party Advertising
          </h2>
          <p className="mb-3 text-slate-400">
            To provide free, high-performance web tooling without charging subscriptions, we partner with third-party advertising vendors, including Google AdSense.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs sm:text-sm text-slate-400 mb-4">
            <p>
              • <strong>Third-party vendors, including Google, use cookies</strong> to serve ads based on a user's prior visits to your website or other websites on the Internet.
            </p>
            <p>
              • <strong>Google's use of advertising cookies</strong> enables it and its partners to serve ads to users based on their visit to TableView.dev and/or other sites on the Internet.
            </p>
            <p>
              • Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline font-medium"
              >
                Google Ads Settings
              </a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline font-medium"
              >
                www.aboutads.info
              </a>.
            </p>
          </div>
          <p className="text-slate-400">
            These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on TableView.dev, which are sent directly to your browser. They automatically receive your IP address when this occurs. TableView.dev has no access to or control over these cookies used by third-party advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <FileText className="size-5 text-indigo-400" />
            3. Cookies and Web Storage
          </h2>
          <p className="mb-3 text-slate-400">
            Cookies are small files stored on your computer. TableView.dev uses cookies and browser local storage strictly for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Remembering your UI preferences (e.g., table page size, SQL console layout).</li>
            <li>Ad delivery and frequency capping governed by Google AdSense policies.</li>
            <li>Security filtering and DDoS prevention managed by Cloudflare CDN.</li>
          </ul>
          <p className="mt-3 text-slate-400">
            You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">
            4. General Data Protection Regulation (GDPR) Rights
          </h2>
          <p className="mb-3 text-slate-400">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data under certain conditions.</li>
            <li><strong>The right to restrict or object to processing:</strong> You have the right to object to our processing of your personal data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">
            5. California Consumer Privacy Act (CCPA / CPRA)
          </h2>
          <p className="mb-3 text-slate-400">
            Under the California Consumer Privacy Act (CCPA), California consumers have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Request that a business disclose the categories and specific pieces of personal data collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells or shares a consumer's personal data, not sell or share the consumer's personal data. <strong>TableView.dev does not sell user personal data.</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">
            6. Children's Information
          </h2>
          <p className="text-slate-400">
            Another part of our priority is adding protection for children while using the internet. TableView.dev does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-3">
            7. Contact Us
          </h2>
          <p className="text-slate-400">
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us by email at{' '}
            <a href="mailto:privacy@tableview.dev" className="text-indigo-400 hover:underline font-medium">
              privacy@tableview.dev
            </a>{' '}
            or visit our{' '}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('/contact');
              }}
              className="text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              Contact Page
            </a>.
          </p>
        </section>
      </div>

      <AdSlot className="mt-12" />
    </div>
  );
};
