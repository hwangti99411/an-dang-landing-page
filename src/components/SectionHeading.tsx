import { motion } from 'framer-motion';

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  description: string;
  align?: 'left' | 'center';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5 }}
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
    >
      <span className="inline-flex rounded-full border border-brand-gold/25 bg-brand-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brand-gold">
        {eyebrow}
      </span>

      <h2 className="section-title mt-5">{title}</h2>

      {/* Subtitle nhỏ */}
      {subtitle && <p className="mt-2 text-sm font-medium text-gray-400">{subtitle}</p>}

      <p className="section-subtitle mt-4">{description}</p>
    </motion.div>
  );
}
