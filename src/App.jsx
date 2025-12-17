import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import RedirectHandler from './components/RedirectHandler';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Admin Import
// Admin Lazy Imports
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const NewsListPage = lazy(() => import('./pages/admin/NewsListPage'));
const NewsEditPage = lazy(() => import('./pages/admin/NewsEditPage'));
const PhotoGalleryListPage = lazy(() => import('./pages/admin/PhotoGalleryListPage'));
const PhotoGalleryEditPage = lazy(() => import('./pages/admin/PhotoGalleryEditPage'));
const VideoGalleryListPage = lazy(() => import('./pages/admin/VideoGalleryListPage'));
const VideoGalleryEditPage = lazy(() => import('./pages/admin/VideoGalleryEditPage'));
const SubscribersPage = lazy(() => import('./pages/admin/SubscribersPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const CommentsPage = lazy(() => import('./pages/admin/CommentsPage'));
const AdsPage = lazy(() => import('./pages/admin/AdsPage'));
const HomeLayoutPage = lazy(() => import('./pages/admin/HomeLayoutPage'));
const HeadlinesPage = lazy(() => import('./pages/admin/HeadlinesPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const TagsPage = lazy(() => import('./pages/admin/TagsPage'));
const RedirectsPage = lazy(() => import('./pages/admin/RedirectsPage'));
const SeoFilesPage = lazy(() => import('./pages/admin/SeoFilesPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const EmailSettingsPage = lazy(() => import('./pages/admin/EmailSettingsPage'));
const PagesPage = lazy(() => import('./pages/admin/PagesPage'));
const PageEditPage = lazy(() => import('./pages/admin/PageEditPage'));
const FooterLinksPage = lazy(() => import('./pages/admin/FooterLinksPage'));
const ContactMessagesPage = lazy(() => import('./pages/admin/ContactMessagesPage'));
const ActivityLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage'));
const SetupGuidePage = lazy(() => import('./pages/admin/SetupGuidePage'));

// Public Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const TagPage = lazy(() => import('./pages/TagPage'));
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
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const TextFilePage = lazy(() => import('./pages/TextFilePage'));
const DynamicPage = lazy(() => import('./pages/DynamicPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Popup Ad Component
import PopupAd from './components/PopupAd';
import SiteWarning from './components/SiteWarning';

// Layouts
const PublicLayout = () => (
  <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
    <SiteWarning />
    <PopupAd />
    <Header />
    <main>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <Router>
            <RedirectHandler />
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/kategori/:categoryName" element={<CategoryPage />} />
                {/* Support both URL patterns */}
                <Route path="/kategori/:category/:slug" element={<NewsDetailPage />} />
                <Route path="/:category/:slug/:id" element={<NewsDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/etiket/:tagSlug" element={<TagPage />} />
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
                <Route path="/video-galeri/:slug/:id" element={<VideoDetailPage />} />

                <Route path="/foto-galeri" element={<PhotoGalleryPage />} />
                <Route path="/foto-galeri/:slug" element={<PhotoDetailPage />} />
                <Route path="/foto-galeri/:slug/:id" element={<PhotoDetailPage />} />
                <Route path="/kurumsal/:slug" element={<DynamicPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              } />
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                </Suspense>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="news" element={<NewsListPage />} />
                <Route path="news/new" element={<NewsEditPage />} />
                <Route path="news/edit/:id" element={<NewsEditPage />} />

                <Route path="photo-galleries" element={<PhotoGalleryListPage />} />
                <Route path="photo-galleries/new" element={<PhotoGalleryEditPage />} />
                <Route path="photo-galleries/edit/:id" element={<PhotoGalleryEditPage />} />

                <Route path="video-galleries" element={<VideoGalleryListPage />} />
                <Route path="video-galleries/new" element={<VideoGalleryEditPage />} />
                <Route path="video-galleries/edit/:id" element={<VideoGalleryEditPage />} />

                <Route path="subscribers" element={<SubscribersPage />} />
                <Route path="users" element={<UsersPage />} />

                <Route path="contact-messages" element={<ContactMessagesPage />} />
                <Route path="comments" element={<CommentsPage />} />
                <Route path="ads" element={<AdsPage />} />
                <Route path="home-layout" element={<HomeLayoutPage />} />
                <Route path="headlines" element={<HeadlinesPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="pages" element={<PagesPage />} />
                <Route path="pages/new" element={<PageEditPage />} />
                <Route path="pages/edit/:id" element={<PageEditPage />} />
                <Route path="footer-links" element={<FooterLinksPage />} />
                <Route path="tags" element={<TagsPage />} />
                <Route path="redirects" element={<RedirectsPage />} />
                <Route path="seo" element={<SeoFilesPage />} />
                <Route path="email-settings" element={<EmailSettingsPage />} />
                <Route path="activity-logs" element={<ActivityLogsPage />} />
                <Route path="setup-guide" element={<SetupGuidePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* System Routes */}
              <Route path="/sitemap.xml" element={<SitemapPage type="sitemap" />} />
              <Route path="/sitemap-news.xml" element={<SitemapPage type="news-sitemap" />} />
              <Route path="/rss.xml" element={<SitemapPage type="rss" />} />
              <Route path="/robots.txt" element={<TextFilePage type="robots" />} />
              <Route path="/ads.txt" element={<TextFilePage type="ads" />} />

              {/* Dynamic Pages (Must be last before 404) */}
              <Route path="/:slug" element={<DynamicPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SiteSettingsProvider>
    </HelmetProvider>
  );
}

export default App;
