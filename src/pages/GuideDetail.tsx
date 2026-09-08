import { useState } from 'react';
import { guidesData, type GuideItem } from '../data/guides';
import { navigateTo } from '../lib/router';
import {
  Clock,
  Calendar,
  User,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  Share2,
  Check,
  Table,
  ChevronDown
} from 'lucide-react';
import { AdSlot } from '../components/AdSlot';

interface GuideDetailProps {
  slug?: string;
}

export const GuideDetail = ({ slug }: GuideDetailProps) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const guide: GuideItem | undefined = guidesData.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <BookOpen className="size-12 text-slate-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Guide Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          The requested technical guide could not be found or may have been updated.
        </p>
        <button
          onClick={() => navigateTo('/guides')}
          className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="size-3.5" />
          Back to Guides Hub
        </button>
      </div>
    );
  }

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Find other guides for related recommendations
  const relatedGuides = guidesData.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-slate-300">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <a
          href="/guides"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/guides');
          }}
          className="hover:text-slate-200 transition-colors"
        >
          Guides
        </a>
        <ChevronRight className="size-3 shrink-0" />
        <span className="text-slate-400 truncate max-w-xs">{guide.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-10 pb-8 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
            {guide.category}
          </span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : <Share2 className="size-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight mb-4">
          {guide.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
          {guide.excerpt}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400 pt-4 border-t border-slate-900">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-slate-400" />
            <span>{guide.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 text-slate-400" />
            <span>{guide.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-slate-400" />
            <span>{guide.readTime}</span>
          </div>
        </div>
      </header>

      {/* Table of contents quick jumps */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 mb-10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-indigo-400" />
          Table of Contents
        </h3>
        <ul className="space-y-1.5 text-xs">
          {guide.sections.map((section, idx) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(section.id);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', `#${section.id}`);
                  }
                }}
                className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                <span>{section.heading}</span>
              </a>
            </li>
          ))}
          {guide.faqs && guide.faqs.length > 0 && (
            <li>
              <a
                href="#faqs"
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById('faqs');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', '#faqs');
                  }
                }}
                className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="text-slate-400 font-mono text-[11px]">{guide.sections.length + 1}.</span>
                <span>Frequently Asked Questions</span>
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Article Sections */}
      <div className="space-y-12 leading-relaxed text-sm text-slate-300">
        {guide.sections.map((section, sectionIdx) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
              {section.heading}
            </h2>

            <div className="space-y-3.5 text-slate-400 text-xs sm:text-sm">
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Code Block if available */}
            {section.code && (
              <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] uppercase tracking-wider">{section.code.language}</span>
                  <button
                    onClick={() => handleCopyCode(section.code!.code, sectionIdx)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
                  >
                    {copiedCodeIndex === sectionIdx ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <span>Copy Code</span>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  <code>{section.code.code}</code>
                </pre>
              </div>
            )}

            {/* Table if available */}
            {section.table && (
              <div className="mt-6 rounded-xl border border-slate-800 overflow-x-auto bg-slate-900/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-200">
                      {section.table.headers.map((h, hIdx) => (
                        <th key={hIdx} className="p-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-400">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}

        {/* Mid-Article AdSlot */}
        <AdSlot />

        {/* FAQ Section */}
        {guide.faqs && guide.faqs.length > 0 && (
          <section id="faqs" className="scroll-mt-24 pt-6 border-t border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {guide.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-medium text-slate-200">{faq.q}</span>
                      <ChevronDown
                        className={`size-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-slate-200' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* CTA Box to Workbench */}
      <div className="my-12 p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div>
          <h3 className="text-base font-bold text-slate-100 mb-1.5 flex items-center gap-2">
            <Table className="size-4 text-slate-400" />
            Inspect Parquet Files Instantly
          </h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            Need to inspect schemas or convert Parquet to Excel? TableView runs 100% locally in your browser with zero server uploads.
          </p>
        </div>
        <button
          onClick={() => navigateTo('/')}
          className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap cursor-pointer"
        >
          Open TableView Workbench →
        </button>
      </div>

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <div className="pt-8 border-t border-slate-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Related Technical Guides
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedGuides.map((rel) => (
              <a
                key={rel.id}
                href={`/guides/${rel.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(`/guides/${rel.slug}`);
                }}
                className="block p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
              >
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                  {rel.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-slate-300 transition-colors line-clamp-1 mb-1">
                  {rel.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {rel.excerpt}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
