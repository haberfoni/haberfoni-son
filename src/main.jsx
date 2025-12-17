import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Self-hosted fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/900.css';
import { HelmetProvider } from 'react-helmet-async';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h1>Bir hata oluştu.</h1>
          <pre style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <button onClick={() => window.location.href = '/'}>Ana Sayfaya Dön</button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
