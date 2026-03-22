import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import CatalogPage from './pages/CatalogPage';
import CarDetailPage from './pages/CarDetailPage';
import CallbackPage from './pages/CallbackPage';

export default function App() {
  useEffect(() => {
    // Expand Telegram Mini App
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/car/:id" element={<CarDetailPage />} />
      <Route path="/callback" element={<CallbackPage />} />
    </Routes>
  );
}
