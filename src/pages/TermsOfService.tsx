import { Scale, CheckCircle2 } from 'lucide-react';
import { AdSlot } from '../components/AdSlot';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-slate-300">
      {/* Header */}
      <div className="mb-10 pb-8 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-950/60 border border-indigo-800 text-indigo-400 mb-4">
          <Scale className="size-3.5" />
          <span>Last Updated: September 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Please read these Terms of Service carefully before using TableView.dev. By accessing or using our website and services, you agree to be bound by these terms.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-10 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            1. Agreement to Terms
          </h2>
          <p className="text-slate-400">
            By accessing or using TableView.dev (the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you must not use our Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            2. Description of Service & Software Architecture
          </h2>
          <p className="text-slate-400 mb-3">
            TableView.dev provides an in-browser utility for viewing, inspecting, querying with DuckDB SQL, and converting tabular file formats (such as Apache Parquet, CSV, TSV, and JSON).
          </p>
          <p className="text-slate-400">
            The client-side core of TableView.dev operates under open developer standards and is licensed under the <strong>MIT License</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            3. Local Processing & Data Ownership
          </h2>
          <p className="text-slate-400 mb-3">
            All data parsing, analytical queries, and document generation occur strictly within your browser sandbox on your device's CPU. TableView.dev never receives, accesses, stores, or transmits your files.
          </p>
          <p className="text-slate-400">
            You retain 100% ownership of and full responsibility for any files and data you process using TableView.dev. You represent and warrant that you possess the necessary rights and permissions to inspect and convert any data files you load into the application.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            4. Acceptable Use Policy
          </h2>
          <p className="text-slate-400 mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Attempt to interfere with or disrupt the integrity or performance of the Service, its servers, or networks.</li>
            <li>Use automated scripts, bots, or scrapers that place an unreasonable load on our hosting infrastructure.</li>
            <li>Reverse-engineer or exploit the service for malicious, unlawful, or harmful activities.</li>
            <li>Violate any applicable local, state, national, or international law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            5. Disclaimer of Warranties
          </h2>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-400 leading-relaxed">
            THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT. TABLEVIEW.DEV DOES NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            6. Limitation of Liability
          </h2>
          <p className="text-slate-400">
            IN NO EVENT SHALL TABLEVIEW.DEV, ITS AUTHORS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            7. Third-Party Links & Advertising
          </h2>
          <p className="text-slate-400">
            Our Service may display third-party advertisements (such as Google AdSense) and links to external third-party websites. We are not responsible for the content, privacy policies, or practices of any third-party websites or services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            8. Changes to Terms
          </h2>
          <p className="text-slate-400">
            We reserve the right to modify or replace these Terms at any time. Any changes will be posted on this page with an updated "Last Updated" date. Your continued use of the Service after any modifications constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-indigo-400" />
            9. Contact Information
          </h2>
          <p className="text-slate-400">
            If you have questions regarding these Terms, please contact us at{' '}
            <a href="mailto:support@tableview.dev" className="text-indigo-400 hover:underline font-medium">
              support@tableview.dev
            </a>.
          </p>
        </section>
      </div>

      <AdSlot className="mt-12" />
    </div>
  );
};
