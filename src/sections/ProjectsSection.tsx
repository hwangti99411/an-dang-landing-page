import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProjectsSection() {
  const { locale } = useLanguage();
  const projects =
    locale === 'vi'
      ? [
          [
            'Nền tảng bán hàng B2B',
            'Website + dashboard + CRM mini cho doanh nghiệp phân phối thiết bị công nghiệp.',
            'Tăng 32% tỉ lệ gửi yêu cầu báo giá',
          ],
          [
            'Hệ thống tuyển dụng nội bộ',
            'Cổng tuyển dụng song ngữ tích hợp quản lý ứng viên và quy trình phỏng vấn.',
            'Giảm 45% thời gian xử lý hồ sơ',
          ],
          [
            'Landing page chiến dịch',
            'Microsite cao cấp cho chương trình ra mắt dịch vụ, tối ưu lead form và lịch hẹn.',
            'Tăng 2.3 lần số lượng lead chất lượng',
          ],
        ]
      : [
          [
            'B2B sales platform',
            'Website, dashboard, and mini CRM for an industrial distribution company.',
            '32% increase in quotation requests',
          ],
          [
            'Internal hiring system',
            'Bilingual recruiting portal with applicant tracking and interview workflows.',
            '45% less hiring admin time',
          ],
          [
            'Campaign landing page',
            'Premium microsite for a service launch campaign with lead capture and booking flow.',
            '2.3x more qualified leads',
          ],
        ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="projects">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Dự án / khách hàng' : 'Projects / clients'}
        title={
          locale === 'vi'
            ? 'Một số mô hình triển khai tiêu biểu.'
            : 'A few representative delivery models.'
        }
        description={
          ""
        }
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {projects.map(([title, desc, metric], index) => (
          <motion.article
            key={title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="glass rounded-[1.75rem] p-6"
          >
            <div className="text-xs uppercase tracking-[0.25em] text-brand-gold">
              Case Study 0{index + 1}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/68">{desc}</p>
            <div className="mt-6 rounded-2xl border border-brand-gold/15 bg-brand-gold/10 px-4 py-3 text-sm font-medium text-brand-gold">
              {metric}
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
