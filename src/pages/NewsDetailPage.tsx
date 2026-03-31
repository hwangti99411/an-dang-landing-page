import { Link, useParams } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { usePublicContent } from '@/hooks/usePublicContent';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/utils';

export function NewsDetailPage() {
  const { slug } = useParams();
  const { settings, posts } = usePublicContent();
  const { locale } = useLanguage();
  const post = posts.find((item) => item.slug === slug) ?? posts[0];

  if (!post) return null;

  return (
    <div>
      <Navbar settings={settings} />
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <Link to="/" className="text-sm text-brand-gold">
          ← {locale === 'vi' ? 'Quay lại trang chủ' : 'Back to home'}
        </Link>
        <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8">
          {post.cover_url && (
            <img
              src={post.cover_url}
              alt={locale === 'vi' ? post.title_vi : post.title_en}
              className="mb-8 h-72 w-full rounded-[1.5rem] object-cover"
            />
          )}
          <div className="text-xs uppercase tracking-[0.25em] text-brand-gold">
            {locale === 'vi' ? post.category_vi : post.category_en} ·{' '}
            {formatDate(post.published_at, locale)}
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-white">
            {locale === 'vi' ? post.title_vi : post.title_en}
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/70">
            {locale === 'vi' ? post.excerpt_vi : post.excerpt_en}
          </p>
          <div className="mt-10 whitespace-pre-line text-sm leading-8 text-white/75">
            {locale === 'vi' ? post.content_vi : post.content_en}
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
