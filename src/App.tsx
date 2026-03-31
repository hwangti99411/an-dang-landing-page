import { Route, Routes } from 'react-router-dom';
import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';
import { NewsDetailPage } from '@/pages/NewsDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/news/:slug" element={<NewsDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
