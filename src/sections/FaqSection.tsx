import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import type { FaqItem } from '@/types';

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const { locale } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="FAQ"
        title={
          locale === 'vi'
            ? 'Những câu hỏi thường gặp trước khi bắt đầu.'
            : 'Questions clients ask before getting started.'
        }
        description={''}
        align="center"
      />
      <div className="mt-10 space-y-4">
        {faqs.map((item) => {
          const open = openId === item.id;
          return (
            <div key={item.id} className="glass overflow-hidden rounded-3xl">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-base font-medium text-white">
                  {locale === 'vi' ? item.question_vi : item.question_en}
                </span>
                <ChevronDown className={cn('transition', open && 'rotate-180')} size={18} />
              </button>
              {open && (
                <div className="px-5 pb-5 text-sm leading-7 text-white/70">
                  {locale === 'vi' ? item.answer_vi : item.answer_en}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
