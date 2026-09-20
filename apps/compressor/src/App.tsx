import { useEffect, lazy, Suspense } from 'react';
import { FloatingFeedback, SuiteSwitcher } from '@tableview/ui';
import { CompressorHeader } from './components/CompressorHeader';
import { CookieBanner } from './components/CookieBanner';
import { GlobalLoading } from './components/GlobalLoading';
import { useRouter, updatePageMeta } from './lib/router';
import { FEEDBACK_EMAIL, getBugReportGmailUrl, getBugReportMailto } from './lib/feedback';
import { applyTheme } from './lib/theme';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { STATIC_PAGE_META } from './data/routeMeta';

// Lazy-loaded media tools
const VideoCompressor = lazy(() => import('./pages/VideoCompressor').then(m => ({ default: m.VideoCompressor })));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const MediaToolsHub = lazy(() => import('./pages/MediaToolsHub').then(m => ({ default: m.MediaToolsHub })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));

export function App() {
  const { path, pathname } = useRouter();
  const currentNavPath = pathname || path;

  useEffect(() => {
    applyTheme('light');
  }, []);

  useEffect(() => {
    if (path === '/' || path === '/video-compressor') {
      updatePageMeta(
        'Free In-Browser Video Compressor — 100% Client-Side | TableView',
        'Compress MP4, WebM, and MOV video files directly in your browser with WebAssembly FFmpeg. 100% private, zero uploads.',
        'https://compress.tableview.dev/'
      );
    } else if (path === '/image-compressor') {
      updatePageMeta(
        'Free In-Browser Image Compressor — WebP, PNG, JPEG | TableView',
        'Lossy and lossless client-side image compression with real-time preview and custom quality controls. Zero server uploads.',
        'https://compress.tableview.dev/image-compressor'
      );
    } else if (STATIC_PAGE_META[path]) {
      const meta = STATIC_PAGE_META[path];
      updatePageMeta(meta.title, meta.description, `https://compress.tableview.dev${path}`);
    }
  }, [path]);

  const renderContent = () => {
    if (
      path === '/' ||
      path === '/video-compressor' ||
      path === '/compress-mp4' ||
      path === '/compress-video-for-discord' ||
      path === '/compress-video'
    ) {
      return <VideoCompressor />;
    }
    if (
      path === '/image-compressor' ||
      path === '/compress-png' ||
      path === '/compress-jpg' ||
      path === '/compress-webp' ||
      path === '/compress-image'
    ) {
      return <ImageCompressor />;
    }
    if (path === '/media-tools') {
      return <MediaToolsHub />;
    }
    if (path === '/about') {
      return <About />;
    }
    if (path === '/contact') {
      return <Contact />;
    }
    if (path === '/privacy') {
      return <PrivacyPolicy />;
    }
    if (path === '/terms') {
      return <TermsOfService />;
    }
    if (path === '/disclaimer') {
      return <Disclaimer />;
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
          <FileQuestion className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-100 mb-2">Tool Not Found in Media Suite</h2>
        <p className="text-neutral-400 text-sm max-w-md mb-6">
          Looking for real estate underwriting calculators or Parquet data tools?
        </p>
        <div className="flex gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Video Compressor
          </a>
          <a
            href="https://tableview.dev"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 transition border border-neutral-700"
          >
            Financial Suite (Pro)
          </a>
          <a
            href="https://tools.tableview.dev"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 font-semibold text-sm hover:bg-neutral-700 transition border border-neutral-700"
          >
            Data Tools
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
      <SuiteSwitcher currentSuite="compressor" />
      <CompressorHeader currentPath={currentNavPath} />

      {/* Keyboard users can bypass the nav instead of tabbing through it. */}
      <a href="#main-content" className="skip-link">
        Skip to compressor
      </a>

      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
        <Suspense fallback={<GlobalLoading message="Initializing FFmpeg WebAssembly engine..." />}>
          {renderContent()}
        </Suspense>
      </main>

      <CookieBanner />
      <FloatingFeedback
        getEmailUrl={() => getBugReportMailto()}
        getGmailUrl={() => getBugReportGmailUrl()}
        email={FEEDBACK_EMAIL}
            />
    </div>
  );
}

export default App;
