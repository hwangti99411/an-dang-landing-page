export type Locale = 'vi' | 'en';

export interface ServiceItem {
  id: string;
  icon: string;
  title_vi: string;
  title_en: string;
  description_vi: string;
  description_en: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role_vi: string;
  role_en: string;
  company: string;
  quote_vi: string;
  quote_en: string;
}

export interface FaqItem {
  id: string;
  question_vi: string;
  question_en: string;
  answer_vi: string;
  answer_en: string;
}

export interface PostItem {
  id: string;
  slug: string;
  title_vi: string;
  title_en: string;
  excerpt_vi: string;
  excerpt_en: string;
  content_vi: string;
  content_en: string;
  cover_url: string | null;
  category_vi: string | null;
  category_en: string | null;
  published_at: string;
  is_featured: boolean;
}

export interface SiteSettings {
  id: number;
  company_name_vi: string;
  company_name_en: string;
  brand_name: string;
  logo_url: string | null;
  phone: string;
  email: string;
  address_vi: string;
  address_en: string;
  hero_badge_vi: string;
  hero_badge_en: string;
  hero_title_vi: string;
  hero_title_en: string;
  hero_description_vi: string;
  hero_description_en: string;
  hero_primary_cta_vi: string;
  hero_primary_cta_en: string;
  hero_secondary_cta_vi: string;
  hero_secondary_cta_en: string;
  hero_stat_1_value: string;
  hero_stat_1_label_vi: string;
  hero_stat_1_label_en: string;
  hero_stat_2_value: string;
  hero_stat_2_label_vi: string;
  hero_stat_2_label_en: string;
  hero_stat_3_value: string;
  hero_stat_3_label_vi: string;
  hero_stat_3_label_en: string;
  about_eyebrow_vi: string;
  about_eyebrow_en: string;
  about_title_vi: string;
  about_title_en: string;
  about_description_vi: string;
  about_description_en: string;
  footer_summary_vi: string;
  footer_summary_en: string;
  footer_copyright_vi: string;
  footer_copyright_en: string;
}

export interface LeadPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  service_interest?: string;
  locale: Locale;
}

export interface BookingPayload extends LeadPayload {
  schedule_at: string;
}

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FORMSPREE_ENDPOINT?: string;
  WEB3FORMS_ACCESS_KEY?: string;
  VITE_COMPANY_NAME?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export type JobItem = {
  id: string;
  title_vi: string;
  title_en: string;
  location_vi: string;
  location_en: string;
  type_vi: string;
  type_en: string;
  salary_vi?: string | null;
  salary_en?: string | null;
  experience_vi?: string | null;
  experience_en?: string | null;
  description_vi: string;
  description_en: string;
  sort?: number | null;
  is_active?: boolean;
  jd_file_url?: string | null;
  jd_file_path?: string | null;
  apply_url?: string | null;
};
