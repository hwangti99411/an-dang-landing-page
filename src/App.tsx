import { Route, Routes } from 'react-router-dom';
import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';
import { NewsDetailPage } from '@/pages/NewsDetailPage';
import { CareersDetailPage } from '@/pages/CareersDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<HomePage />} />
      <Route path="/services" element={<HomePage />} />
      <Route path="/projects" element={<HomePage />} />
      <Route path="/news" element={<HomePage />} />
      <Route path="/careers" element={<HomePage />} />
      <Route path="/contact" element={<HomePage />} />
      <Route path="/careers/details" element={<CareersDetailPage />} />
      <Route path="/careers/details/:id" element={<CareersDetailPage />} />
      <Route path="/news/:slug" element={<NewsDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
