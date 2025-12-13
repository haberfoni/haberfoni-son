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
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import NewsListPage from './pages/admin/NewsListPage';
import NewsEditPage from './pages/admin/NewsEditPage';
import PhotoGalleryListPage from './pages/admin/PhotoGalleryListPage';
import PhotoGalleryEditPage from './pages/admin/PhotoGalleryEditPage';
import VideoGalleryListPage from './pages/admin/VideoGalleryListPage';
import VideoGalleryEditPage from './pages/admin/VideoGalleryEditPage';
import SubscribersPage from './pages/admin/SubscribersPage';
import UsersPage from './pages/admin/UsersPage';
import CommentsPage from './pages/admin/CommentsPage';
import AdsPage from './pages/admin/AdsPage';
import HomeLayoutPage from './pages/admin/HomeLayoutPage';
import HeadlinesPage from './pages/admin/HeadlinesPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import TagsPage from './pages/admin/TagsPage';
import RedirectsPage from './pages/admin/RedirectsPage';
import SeoFilesPage from './pages/admin/SeoFilesPage';
import SettingsPage from './pages/admin/SettingsPage';
import EmailSettingsPage from './pages/admin/EmailSettingsPage';
import PagesPage from './pages/admin/PagesPage';
import PageEditPage from './pages/admin/PageEditPage';
import FooterLinksPage from './pages/admin/FooterLinksPage';
import ContactMessagesPage from './pages/admin/ContactMessagesPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import SetupGuidePage from './pages/admin/SetupGuidePage';

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
                <Route path="/kategori/:category/:slug" element={<NewsDetailPage />} />
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
                <Route path="/foto-galeri" element={<PhotoGalleryPage />} />
                <Route path="/foto-galeri/:slug" element={<PhotoDetailPage />} />
                <Route path="/kurumsal/:slug" element={<DynamicPage />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
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
              <Route path="/sitemap.xml" element={<SitemapPage />} />
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
