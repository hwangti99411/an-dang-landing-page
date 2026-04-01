import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { JobItem } from '@/types';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function CareersSection({ jobs }: { jobs: JobItem[] }) {
  const { locale } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadFile = async (url: string, fileName: string) => {
    try {
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
    }
  };

  const normalizeFileName = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, '-') // thay ký tự đặc biệt
      .replace(/(^-|-$)/g, ''); // trim dấu -
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
        description={''}
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {jobs.slice(0, 4).map((job, index) => {
          const isDownloading = downloadingId === job.id;
          return (
            <motion.article
              key={job.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="glass rounded-[1.75rem] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">
                  {locale === 'vi' ? job.title_vi : job.title_en}
                </h3>
                <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-gold">
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
                className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${
                  job.jd_file_url ? 'text-brand-gold' : 'cursor-not-allowed text-white/35'
                }`}
              >
                {isDownloading && (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
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
        })}
      </div>
      {jobs.length > 4 && (
        <div className="mt-10 text-center">
          <Link
            to="/careers/details"
            state={{ scrollTo: null }}
            className="inline-flex rounded-full bg-[#f2b544] px-6 py-3 font-semibold text-black"
          >
            Xem thêm
          </Link>
        </div>
      )}
    </section>
  );
}
