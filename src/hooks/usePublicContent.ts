import { useEffect, useState } from 'react';
import {
  fallbackFaqs,
  fallbackJobs,
  fallbackPosts,
  fallbackServices,
  fallbackSiteSettings,
  fallbackTestimonials,
} from '@/data/fallback';
import { supabase } from '@/lib/supabase';
import type {
  FaqItem,
  JobItem,
  PostItem,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '@/types';

interface PublicContentState {
  settings: SiteSettings;
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  posts: PostItem[];
  jobs: JobItem[];
  loading: boolean;
}

export function usePublicContent() {
  const [state, setState] = useState<PublicContentState>({
    settings: fallbackSiteSettings,
    services: fallbackServices,
    testimonials: fallbackTestimonials,
    faqs: fallbackFaqs,
    posts: fallbackPosts,
    jobs: fallbackJobs,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const [settingsRes, servicesRes, testimonialsRes, faqsRes, postsRes, jobsRes] =
        await Promise.all([
          supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
          supabase.from('services').select('*').order('created_at', { ascending: true }),
          supabase.from('testimonials').select('*').order('created_at', { ascending: true }),
          supabase.from('faqs').select('*').order('created_at', { ascending: true }),
          supabase.from('posts').select('*').order('published_at', { ascending: false }),
          supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
        ]);

      if (!mounted) return;

      setState({
        settings: (settingsRes.data as SiteSettings | null) ?? fallbackSiteSettings,
        services: servicesRes.data?.length ? (servicesRes.data as ServiceItem[]) : fallbackServices,
        testimonials: testimonialsRes.data?.length
          ? (testimonialsRes.data as TestimonialItem[])
          : fallbackTestimonials,
        faqs: faqsRes.data?.length ? (faqsRes.data as FaqItem[]) : fallbackFaqs,
        posts: postsRes.data?.length ? (postsRes.data as PostItem[]) : fallbackPosts,
        jobs: jobsRes.data?.length ? (jobsRes.data as JobItem[]) : fallbackJobs,
        loading: false,
      });
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
