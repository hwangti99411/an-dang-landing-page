import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicContent } from '@/hooks/usePublicContent';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Link, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styled/careers.css';

export function CareersDetailPage() {
  const location = useLocation();
  const { settings, jobs } = usePublicContent();
  const { locale } = useLanguage();
  const { id } = useParams();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

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

  useEffect(() => {
    const targetId = String(id || location.state?.scrollTo || '');

    if (!targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!jobs?.length) return;

    const el = document.getElementById(targetId);
    if (!el) return;

    const navbar = document.getElementById('navbar');
    const offset = navbar?.offsetHeight ?? 80;

    const top = el.getBoundingClientRect().top + window.scrollY - offset - 100;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });

    const highlightTimer = setTimeout(() => {
      setActiveJobId(targetId);

      setTimeout(() => {
        setActiveJobId(null);
      }, 2500);
    }, 500);

    return () => clearTimeout(highlightTimer);
  }, [id, location.state, jobs]);

  return (
    <div>
      <Navbar settings={settings} />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="careers">
        <Link to="/careers" state={{ scrollTo: 'careers' }} className="text-sm text-brand-gold">
          <div style={{ marginBottom: 20 }}>
            ← {locale === 'vi' ? 'Quay lại trang chủ' : 'Back to home'}
          </div>
        </Link>
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
          {jobs.map((job, index) => {
            const isActive = activeJobId === job.id;
            return (
              <div id={job.id} key={job.id}>
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={
                    isActive ? { duration: 0.6, repeat: 1 } : { duration: 0.4, delay: index * 0.08 }
                  }
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            '0 0 0 0 rgba(212,175,55,0)',
                            '0 0 0 2px rgba(212,175,55,0.6)',
                            '0 0 0 6px rgba(212,175,55,0.18)',
                            '0 0 0 2px rgba(212,175,55,0.6)',
                            '0 0 0 0 rgba(212,175,55,0)',
                          ],
                        }
                      : {
                          boxShadow: '0 0 0 0 rgba(212,175,55,0)',
                        }
                  }
                  className="glass flex flex-col overflow-hidden rounded-[1.5rem] p-5 md:p-6 transition hover:-translate-y-1 hover:border-brand-gold/30 min-h-[240px] md:min-h-[260px] xl:h-[260px]"
                >
                  <Link to={`/careers/details/${job.id}`} className="block flex-1 min-h-0">
                    <div className="flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <h3 className="text-[18px] leading-[1.35] font-semibold text-white md:text-[22px] xl:text-xl">
                        {locale === 'vi' ? job.title_vi : job.title_en}
                      </h3>
                      <span className="w-fit shrink-0 rounded-full bg-brand-gold/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-brand-gold md:text-xs">
                        {locale === 'vi' ? job.type_vi : job.type_en}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-white/65 md:text-sm">
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} />
                        {locale === 'vi' ? job.location_vi : job.location_en}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness size={16} />
                        {locale === 'vi' ? job.type_vi : job.type_en}
                      </span>
                    </div>
                    <div className="mt-4 overflow-hidden">
                      <p className="job-desc text-sm leading-7 text-white/70">
                        {locale === 'vi' ? job.description_vi : job.description_en}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!job.jd_file_url) return;

                      const title = locale === 'vi' ? job.title_vi : job.title_en;
                      const ext = getExtension(job.jd_file_url);
                      const fileName = `${normalizeFileName(title)}-job-AnDangTech.${ext}`;

                      downloadFile(job.jd_file_url, fileName);
                    }}
                    className={`mt-5 shrink-0 inline-flex text-sm font-medium ${
                      job.jd_file_url ? 'text-brand-gold' : 'cursor-not-allowed text-white/35'
                    }`}
                  >
                    {locale === 'vi' ? 'Ứng tuyển / nhận JD' : 'Apply / request JD'}
                  </button>
                </motion.article>
              </div>
            );
          })}
        </div>
      </section>
      <Footer settings={settings} />
    </div>
  );
}
