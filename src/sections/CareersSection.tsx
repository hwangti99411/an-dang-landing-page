import { motion } from 'framer-motion';
import { BriefcaseBusiness, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { JobItem } from '@/types';

export function CareersSection({ jobs }: { jobs: JobItem[] }) {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="careers">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Tuyển dụng' : 'Careers'}
        title={locale === 'vi' ? 'Gia nhập đội ngũ công nghệ đang tăng tốc.' : 'Join a technology team that moves with ambition.'}
        description={locale === 'vi' ? 'Section này phù hợp để đăng tin tuyển dụng, thông tin văn hóa công ty và CTA nhận CV.' : 'Use this area for active openings, employer branding, and candidate calls-to-action.'}
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {jobs.map((job, index) => (
          <motion.article
            key={job.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="glass rounded-[1.75rem] p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">{locale === 'vi' ? job.title_vi : job.title_en}</h3>
              <span className="rounded-full bg-brand-gold/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-gold">
                {locale === 'vi' ? job.type_vi : job.type_en}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/65">
              <span className="inline-flex items-center gap-2"><MapPin size={16} />{locale === 'vi' ? job.location_vi : job.location_en}</span>
              <span className="inline-flex items-center gap-2"><BriefcaseBusiness size={16} />{locale === 'vi' ? job.type_vi : job.type_en}</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/70">{locale === 'vi' ? job.description_vi : job.description_en}</p>
            <a href="#contact" className="mt-6 inline-flex text-sm font-medium text-brand-gold">
              {locale === 'vi' ? 'Ứng tuyển / nhận JD' : 'Apply / request JD'}
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
