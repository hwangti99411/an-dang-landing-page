import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin, SearchX } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { JobItem } from '@/types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function CareersSection({ jobs }: { jobs: JobItem[] }) {
  const { locale } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // loading giả lập trước khi hiện job

    return () => clearTimeout(timer);
  }, [jobs]);

  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  const isAndroid = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  };

  const downloadFile = async (url: string, fileName: string) => {
    try {
      if (isIOS()) {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
        return;
      }

      if (isAndroid()) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }

      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed', err);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (fallbackErr) {
        console.error('Fallback download failed', fallbackErr);
      }
    }
  };

  const normalizeFileName = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const getExtension = (url: string) => {
    return url.split('.').pop()?.split('?')[0] || 'file';
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="careers">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Tuyển dụng' : 'Careers'}
        title={
          locale === 'vi'
            ? 'Gia nhập đội ngũ công nghệ đang tăng tốc.'
            : 'Join a technology team that moves with ambition.'
        }
        description=""
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md animate-pulse"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="h-6 w-40 rounded-full bg-white/10" />
                <div className="h-6 w-24 rounded-full bg-white/10" />
              </div>

              <div className="mt-4 flex gap-3">
                <div className="h-4 w-28 rounded-full bg-white/10" />
                <div className="h-4 w-24 rounded-full bg-white/10" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-4 w-full rounded-full bg-white/10" />
                <div className="h-4 w-11/12 rounded-full bg-white/10" />
                <div className="h-4 w-8/12 rounded-full bg-white/10" />
              </div>

              <div className="mt-6 h-5 w-32 rounded-full bg-white/10" />
            </div>
          ))
        ) : jobs.length > 0 ? (
          jobs
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
            .slice(0, 4)
            .map((job, index) => {
              const isDownloading = downloadingId === job.id;

              return (
                <motion.article
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="group rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-gold/30 hover:shadow-[0_12px_40px_rgba(242,181,68,0.12)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-white leading-snug">
                      {locale === 'vi' ? job.title_vi : job.title_en}
                    </h3>

                    <span className="shrink-0 rounded-full bg-brand-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-gold border border-brand-gold/20">
                      {locale === 'vi' ? job.type_vi : job.type_en}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/65">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} />
                      {locale === 'vi' ? job.location_vi : job.location_en}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <BriefcaseBusiness size={16} />
                      {locale === 'vi' ? job.type_vi : job.type_en}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {locale === 'vi' ? job.description_vi : job.description_en}
                  </p>

                  <button
                    type="button"
                    disabled={!job.jd_file_url || isDownloading}
                    onClick={async () => {
                      if (!job.jd_file_url || isDownloading) return;

                      setDownloadingId(job.id);
                      try {
                        const title = locale === 'vi' ? job.title_vi : job.title_en;
                        const ext = getExtension(job.jd_file_url);
                        const fileName = `${normalizeFileName(title)}-job-AnDangTech.${ext}`;
                        await downloadFile(job.jd_file_url, fileName);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setDownloadingId(null);
                      }
                    }}
                    className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      job.jd_file_url
                        ? 'bg-brand-gold text-black hover:opacity-90'
                        : 'cursor-not-allowed bg-white/10 text-white/35'
                    }`}
                  >
                    {isDownloading && (
                      <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    )}

                    {isDownloading
                      ? locale === 'vi'
                        ? 'Đang tải...'
                        : 'Downloading...'
                      : locale === 'vi'
                        ? 'Xem chi tiết JD'
                        : 'View detail JD'}
                  </button>
                </motion.article>
              );
            })
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2"
          >
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center backdrop-blur-md">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/10 text-brand-gold">
                <SearchX size={28} />
              </div>

              <h3 className="text-xl font-semibold text-white">
                {locale === 'vi' ? 'Hiện chưa có vị trí tuyển dụng' : 'No openings at the moment'}
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                {locale === 'vi'
                  ? 'Hiện tại chúng tôi chưa có vị trí tuyển dụng đang mở. Vui lòng quay lại sau để cập nhật những cơ hội nghề nghiệp mới nhất.'
                  : 'There are currently no open positions. Please check back later for upcoming career opportunities.'}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {!isLoading && jobs.length > 4 && (
        <div className="mt-10 text-center">
          <Link
            to="/careers/details"
            state={{ scrollTo: null }}
            className="inline-flex rounded-full bg-[#f2b544] px-6 py-3 font-semibold text-black transition hover:opacity-90"
          >
            {locale === 'vi' ? 'Xem thêm' : 'See more'}
          </Link>
        </div>
      )}
    </section>
  );
}
