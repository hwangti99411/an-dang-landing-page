import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { HomePage } from '@/pages/HomePage';
import { NewsDetailPage } from '@/pages/NewsDetailPage';
import { CareersDetailPage } from '@/pages/CareersDetailPage';
import CMSPage from '@/pages/CMSPage';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/services" element={<HomePage />} />
        <Route path="/projects" element={<HomePage />} />
        <Route path="/news" element={<HomePage />} />
        <Route path="/careers" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/careers/list" element={<CareersDetailPage />} />
        <Route path="/careers/list/:id" element={<CareersDetailPage />} />
        <Route path="/news/:slug" element={<NewsDetailPage />} />
        <Route path="/admin" element={<CMSPage />} />
      </Routes>
    </>
  );
}
