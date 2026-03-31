import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils';
import type { PostItem } from '@/types';

export function NewsSection({ posts }: { posts: PostItem[] }) {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="news">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Tin tức' : 'News'}
        title={
          locale === 'vi'
            ? 'Cập nhật doanh nghiệp, góc nhìn công nghệ và thông tin tuyển dụng.'
            : 'Company updates, technology insights, and hiring announcements.'
        }
        description={
          locale === 'vi'
            ? 'Danh sách bài viết lấy từ Supabase. Hỗ trợ upload ảnh cover qua Supabase Storage ngay trong admin.'
            : 'Posts are loaded from Supabase. Cover images can be uploaded directly through Supabase Storage in the admin panel.'
        }
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {posts.slice(0, 3).map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="glass flex h-full flex-col overflow-hidden rounded-[1.75rem]"
          >
            {post.cover_url ? (
              <img
                src={post.cover_url}
                alt={locale === 'vi' ? post.title_vi : post.title_en}
                className="h-52 w-full object-cover"
              />
            ) : (
              <div className="h-52 bg-[linear-gradient(135deg,rgba(248,191,80,0.16),rgba(221,76,12,0.14),rgba(154,4,10,0.28))]" />
            )}
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-brand-gold">
                <span>
                  {locale === 'vi'
                    ? (post.category_vi ?? 'Tin doanh nghiệp')
                    : (post.category_en ?? 'Company news')}
                </span>
                <span>{formatDate(post.published_at, locale)}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">
                {locale === 'vi' ? post.title_vi : post.title_en}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-white/68">
                {locale === 'vi' ? post.excerpt_vi : post.excerpt_en}
              </p>
              <Link
                to={`/news/${post.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-gold"
              >
                {locale === 'vi' ? 'Xem chi tiết' : 'Read more'}
                <ArrowRight size={16} />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
