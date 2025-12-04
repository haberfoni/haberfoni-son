import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AllNewsPage = lazy(() => import('./pages/AllNewsPage'));
const PhotoGalleryPage = lazy(() => import('./pages/PhotoGalleryPage'));
const VideoGalleryPage = lazy(() => import('./pages/VideoGalleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ImprintPage = lazy(() => import('./pages/ImprintPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const KvkkPage = lazy(() => import('./pages/KvkkPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const VideoDetailPage = lazy(() => import('./pages/VideoDetailPage'));
const PhotoDetailPage = lazy(() => import('./pages/PhotoDetailPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Header />
          <main>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/kategori/:categoryName" element={<CategoryPage />} />
                <Route path="/kategori/:category/:slug" element={<NewsDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/tum-haberler" element={<AllNewsPage />} />
                <Route path="/hakkimizda" element={<AboutPage />} />
                <Route path="/kunye" element={<ImprintPage />} />
                <Route path="/iletisim" element={<ContactPage />} />
                <Route path="/reklam" element={<AdvertisePage />} />
                <Route path="/kariyer" element={<CareersPage />} />
                <Route path="/kvkk" element={<KvkkPage />} />
                <Route path="/cerez-politikasi" element={<CookiePolicyPage />} />
                <Route path="/video-galeri" element={<VideoGalleryPage />} />
                <Route path="/video-galeri/:slug" element={<VideoDetailPage />} />
                <Route path="/foto-galeri" element={<PhotoGalleryPage />} />
                <Route path="/foto-galeri/:slug" element={<PhotoDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
