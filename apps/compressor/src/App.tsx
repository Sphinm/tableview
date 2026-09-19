import { useEffect, useState, lazy, Suspense } from 'react';
import { SuiteSwitcher } from '@tableview/ui';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CookieBanner } from './components/CookieBanner';
import { GlobalLoading } from './components/GlobalLoading';
import { AuthProvider } from './lib/authContext';
import { AuthModal } from './components/AuthModal';
import { GoogleOneTap } from './components/GoogleOneTap';
import { useRouter, updatePageMeta } from './lib/router';
import { applyTheme } from './lib/theme';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { STATIC_PAGE_META } from './data/routeMeta';

// Lazy-loaded media tools
const VideoCompressor = lazy(() => import('./pages/VideoCompressor').then(m => ({ default: m.VideoCompressor })));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const MediaToolsHub = lazy(() => import('./pages/MediaToolsHub').then(m => ({ default: m.MediaToolsHub })));
const GuidesHub = lazy(() => import('./pages/GuidesHub').then(m => ({ default: m.GuidesHub })));
const GuideDetail = lazy(() => import('./pages/GuideDetail').then(m => ({ default: m.GuideDetail })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })));
const Disclaimer = lazy(() => import('./pages/Disclaimer').then(m => ({ default: m.Disclaimer })));

export function App() {
  const { path, slug, pathname } = useRouter();
  const currentNavPath = pathname || path;
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tableview_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('tableview_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    applyTheme('light');
  }, []);

  useEffect(() => {
    if (path === '/' || path === '/video-compressor') {
      updatePageMeta(
        'Free In-Browser Video Compressor — Zero Uploads | TableView',
        'Compress MP4, WebM, and MOV video files directly in your browser with WebAssembly FFmpeg. 100% private and fast.',
        'https://compress.tableview.dev/'
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
    if (path === '/guides') {
      return <GuidesHub />;
    }
    if (path.startsWith('/guides/') && slug) {
      return <GuideDetail slug={slug} />;
    }
    if (path === '/about') {
      return <About />;
    }
    if (path === '/contact') {
      return <Contact />;
    }
    if (path === '/privacy-policy') {
      return <PrivacyPolicy />;
    }
    if (path === '/terms-of-service') {
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-neutral-950 font-semibold text-sm hover:bg-purple-400 transition"
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
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
        <SuiteSwitcher currentSuite="compressor" />
        <Header currentPath={currentNavPath} />

        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentPath={currentNavPath}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebar}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 overflow-y-auto min-w-0">
            <Suspense fallback={<GlobalLoading message="Initializing FFmpeg engine..." />}>
              {renderContent()}
            </Suspense>
          </main>
        </div>

        <AuthModal />
        <GoogleOneTap />
        <CookieBanner />
      </div>
    </AuthProvider>
  );
}

export default App;
