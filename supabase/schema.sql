create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1,
  company_name_vi text not null,
  company_name_en text not null,
  brand_name text not null,
  logo_url text,
  phone text not null,
  email text not null,
  address_vi text not null,
  address_en text not null,
  hero_badge_vi text not null,
  hero_badge_en text not null,
  hero_title_vi text not null,
  hero_title_en text not null,
  hero_description_vi text not null,
  hero_description_en text not null,
  hero_primary_cta_vi text not null,
  hero_primary_cta_en text not null,
  hero_secondary_cta_vi text not null,
  hero_secondary_cta_en text not null,
  hero_stat_1_value text not null,
  hero_stat_1_label_vi text not null,
  hero_stat_1_label_en text not null,
  hero_stat_2_value text not null,
  hero_stat_2_label_vi text not null,
  hero_stat_2_label_en text not null,
  hero_stat_3_value text not null,
  hero_stat_3_label_vi text not null,
  hero_stat_3_label_en text not null,
  about_eyebrow_vi text not null,
  about_eyebrow_en text not null,
  about_title_vi text not null,
  about_title_en text not null,
  about_description_vi text not null,
  about_description_en text not null,
  footer_summary_vi text not null,
  footer_summary_en text not null,
  footer_copyright_vi text not null,
  footer_copyright_en text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'Code2',
  title_vi text not null,
  title_en text not null,
  description_vi text not null,
  description_en text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_vi text not null,
  role_en text not null,
  company text not null,
  quote_vi text not null,
  quote_en text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_vi text not null,
  question_en text not null,
  answer_vi text not null,
  answer_en text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_vi text not null,
  title_en text not null,
  excerpt_vi text not null,
  excerpt_en text not null,
  content_vi text not null,
  content_en text not null,
  cover_url text,
  category_vi text,
  category_en text,
  published_at timestamptz not null default now(),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title_vi text not null,
  title_en text not null,
  location_vi text not null,
  location_en text not null,
  type_vi text not null,
  type_en text not null,
  description_vi text not null,
  description_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  message text not null,
  service_interest text,
  locale text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  message text not null,
  service_interest text,
  schedule_at timestamptz not null,
  locale text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.posts enable row level security;
alter table public.jobs enable row level security;
alter table public.leads enable row level security;
alter table public.bookings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "public read site_settings" on public.site_settings for select using (true);
create policy "public read services" on public.services for select using (true);
create policy "public read testimonials" on public.testimonials for select using (true);
create policy "public read faqs" on public.faqs for select using (true);
create policy "public read posts" on public.posts for select using (true);
create policy "public read jobs" on public.jobs for select using (true);

create policy "admin manage site_settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage services" on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage testimonials" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage faqs" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy "admin manage jobs" on public.jobs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin view leads" on public.leads for select using (public.is_admin());
create policy "admin view bookings" on public.bookings for select using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public read site assets"
on storage.objects
for select
using (bucket_id = 'site-assets');

create policy "admin upload site assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-assets' and public.is_admin());

create policy "admin update site assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-assets' and public.is_admin())
with check (bucket_id = 'site-assets' and public.is_admin());

create policy "admin delete site assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-assets' and public.is_admin());

insert into public.site_settings (
  id,
  company_name_vi,
  company_name_en,
  brand_name,
  logo_url,
  phone,
  email,
  address_vi,
  address_en,
  hero_badge_vi,
  hero_badge_en,
  hero_title_vi,
  hero_title_en,
  hero_description_vi,
  hero_description_en,
  hero_primary_cta_vi,
  hero_primary_cta_en,
  hero_secondary_cta_vi,
  hero_secondary_cta_en,
  hero_stat_1_value,
  hero_stat_1_label_vi,
  hero_stat_1_label_en,
  hero_stat_2_value,
  hero_stat_2_label_vi,
  hero_stat_2_label_en,
  hero_stat_3_value,
  hero_stat_3_label_vi,
  hero_stat_3_label_en,
  about_eyebrow_vi,
  about_eyebrow_en,
  about_title_vi,
  about_title_en,
  about_description_vi,
  about_description_en,
  footer_summary_vi,
  footer_summary_en,
  footer_copyright_vi,
  footer_copyright_en
)
values (
  1,
  'Công ty TNHH Công nghệ Quốc tế An Đăng',
  'An Dang International Technology Company Limited',
  'An Đăng',
  null,
  '0869209068',
  'contact@andanggroup.com',
  '63 ngách 46 Linh Quang, Văn Miếu - Quốc Tử Giám, Hà Nội',
  '63, Alley 46 Linh Quang, Van Mieu - Quoc Tu Giam, Hanoi, Vietnam',
  'IT Outsourcing & tư vấn giải pháp công nghệ cho doanh nghiệp tăng trưởng',
  'IT outsourcing and technology consulting for growth-focused businesses',
  'Đối tác công nghệ giúp doanh nghiệp tăng tốc chuyển đổi số, bán hàng và vận hành.',
  'A technology partner helping businesses accelerate digital transformation, sales, and operations.',
  'An Đăng cung cấp dịch vụ IT outsourcing, phát triển website, hệ thống nội bộ, landing page, tư vấn kiến trúc công nghệ và đội ngũ kỹ sư đồng hành dài hạn cho doanh nghiệp tại Việt Nam và thị trường quốc tế.',
  'An Dang delivers IT outsourcing, corporate websites, internal systems, landing pages, technology architecture consulting, and long-term engineering support for Vietnamese and international businesses.',
  'Đặt lịch tư vấn',
  'Book consultation',
  'Xem dịch vụ',
  'Explore services',
  '48h',
  'Khởi tạo đề xuất giải pháp ban đầu',
  'Initial solution proposal turnaround',
  'Bilingual',
  'Triển khai và hỗ trợ Việt / Anh',
  'Vietnamese / English delivery and support',
  'Cloud-ready',
  'Kiến trúc sẵn sàng mở rộng',
  'Architecture built for scale',
  'Giới thiệu',
  'About',
  'An Đăng tập trung vào giải pháp thực chiến, hiệu quả kinh doanh và tiêu chuẩn triển khai chuyên nghiệp.',
  'An Dang focuses on practical solutions, measurable business impact, and professional delivery standards.',
  'Chúng tôi đồng hành cùng startup, SME và doanh nghiệp đang cần xây dựng nền tảng công nghệ bài bản: từ website, landing page, CRM mini, dashboard vận hành đến tư vấn roadmap sản phẩm, quy trình kỹ thuật và mở rộng đội ngũ lập trình.',
  'We support startups, SMEs, and enterprises that need a stronger technology foundation—from websites, landing pages, mini CRM tools, and operational dashboards to product roadmaps, engineering processes, and team extension.',
  'An Đăng xây dựng hình ảnh doanh nghiệp công nghệ hiện đại với năng lực triển khai web, cloud, tư vấn giải pháp và mở rộng đội ngũ kỹ thuật theo nhu cầu thực tế.',
  'An Dang presents a modern technology brand with strong capabilities in web engineering, cloud delivery, solution consulting, and flexible team extension.',
  '© 2026 Công ty TNHH Công nghệ Quốc tế An Đăng. All rights reserved.',
  '© 2026 An Dang International Technology Company Limited. All rights reserved.'
)
on conflict (id) do update set
  company_name_vi = excluded.company_name_vi,
  company_name_en = excluded.company_name_en,
  brand_name = excluded.brand_name,
  phone = excluded.phone,
  email = excluded.email,
  address_vi = excluded.address_vi,
  address_en = excluded.address_en,
  hero_badge_vi = excluded.hero_badge_vi,
  hero_badge_en = excluded.hero_badge_en,
  hero_title_vi = excluded.hero_title_vi,
  hero_title_en = excluded.hero_title_en,
  hero_description_vi = excluded.hero_description_vi,
  hero_description_en = excluded.hero_description_en,
  hero_primary_cta_vi = excluded.hero_primary_cta_vi,
  hero_primary_cta_en = excluded.hero_primary_cta_en,
  hero_secondary_cta_vi = excluded.hero_secondary_cta_vi,
  hero_secondary_cta_en = excluded.hero_secondary_cta_en,
  hero_stat_1_value = excluded.hero_stat_1_value,
  hero_stat_1_label_vi = excluded.hero_stat_1_label_vi,
  hero_stat_1_label_en = excluded.hero_stat_1_label_en,
  hero_stat_2_value = excluded.hero_stat_2_value,
  hero_stat_2_label_vi = excluded.hero_stat_2_label_vi,
  hero_stat_2_label_en = excluded.hero_stat_2_label_en,
  hero_stat_3_value = excluded.hero_stat_3_value,
  hero_stat_3_label_vi = excluded.hero_stat_3_label_vi,
  hero_stat_3_label_en = excluded.hero_stat_3_label_en,
  about_eyebrow_vi = excluded.about_eyebrow_vi,
  about_eyebrow_en = excluded.about_eyebrow_en,
  about_title_vi = excluded.about_title_vi,
  about_title_en = excluded.about_title_en,
  about_description_vi = excluded.about_description_vi,
  about_description_en = excluded.about_description_en,
  footer_summary_vi = excluded.footer_summary_vi,
  footer_summary_en = excluded.footer_summary_en,
  footer_copyright_vi = excluded.footer_copyright_vi,
  footer_copyright_en = excluded.footer_copyright_en,
  updated_at = now();

insert into public.services (icon, title_vi, title_en, description_vi, description_en)
values
('Code2','IT Outsourcing theo nhu cầu','Flexible IT Outsourcing','Bổ sung nhanh đội ngũ frontend, backend, mobile, QA và DevOps cho dự án ngắn hạn hoặc dài hạn với quy trình phối hợp minh bạch.','Quickly extend your team with frontend, backend, mobile, QA, and DevOps engineers for short- or long-term engagements with transparent collaboration.'),
('BrainCircuit','Tư vấn giải pháp công nghệ','Technology Solution Consulting','Đánh giá hiện trạng, phân tích bài toán, đề xuất kiến trúc hệ thống, roadmap triển khai và định hướng đầu tư công nghệ phù hợp.','Assess current challenges, propose system architecture, build delivery roadmaps, and recommend the right technology investment direction.'),
('Globe2','Website doanh nghiệp & landing page','Corporate Websites & Landing Pages','Thiết kế và phát triển website chuẩn thương hiệu, tối ưu trải nghiệm, hiệu suất, SEO cơ bản và khả năng thu lead cho doanh nghiệp.','Design and build branded websites optimized for user experience, performance, basic SEO, and lead generation.'),
('ShieldCheck','Vận hành, QA và tối ưu hệ thống','QA, Operations & Optimization','Chuẩn hóa testing, quy trình release, giám sát vận hành và cải thiện tính ổn định, bảo mật, tốc độ cho hệ thống đang chạy.','Standardize testing and releases, monitor operations, and improve the stability, security, and performance of live systems.')
on conflict do nothing;

insert into public.testimonials (name, role_vi, role_en, company, quote_vi, quote_en)
values
('Nguyễn Minh Khang','Nhà sáng lập','Founder','Chuỗi bán lẻ nội địa','An Đăng giúp chúng tôi hoàn thiện landing page chiến dịch và dashboard theo dõi lead nhanh, giao tiếp rõ ràng và làm việc rất sát business.','An Dang helped us launch our campaign landing page and lead tracking dashboard quickly, with clear communication and strong business alignment.'),
('Lê Thu Phương','Giám đốc vận hành','Operations Director','Doanh nghiệp dịch vụ','Điểm mạnh là tư duy giải pháp và khả năng đưa ra hướng triển khai thực tế thay vì chỉ nói về công nghệ.','Their strength is solution thinking and the ability to recommend practical execution paths instead of talking about tech in the abstract.'),
('David Tran','Product Manager','Product Manager','Cross-border SaaS','Đội ngũ bilingual, phản hồi nhanh và chủ động trong cả giai đoạn tư vấn lẫn triển khai kỹ thuật.','The team is bilingual, responsive, and proactive throughout both the consulting and engineering phases.')
on conflict do nothing;

insert into public.faqs (question_vi, question_en, answer_vi, answer_en)
values
('An Đăng phù hợp với nhóm khách hàng nào?','What kinds of clients are a fit for An Dang?','Chúng tôi phù hợp với startup, SME, doanh nghiệp dịch vụ, thương mại và các đơn vị cần triển khai nhanh website, hệ thống nội bộ hoặc mở rộng đội ngũ kỹ thuật.','We are a good fit for startups, SMEs, service businesses, commerce brands, and teams that need websites, internal tools, or engineering capacity fast.'),
('Có thể thuê theo dự án hoặc theo nhân sự mở rộng không?','Can we engage you per project or as an extended team?','Có. An Đăng hỗ trợ cả mô hình fixed-scope theo dự án và dedicated team / team extension tùy mục tiêu của doanh nghiệp.','Yes. We support both fixed-scope project delivery and dedicated team or team-extension models depending on your goals.'),
('Website có quản trị nội dung và song ngữ không?','Will the website support content management and bilingual content?','Có. Hệ thống có trang admin quản lý nội dung, bài viết, hình ảnh và hỗ trợ đầy đủ tiếng Việt / tiếng Anh.','Yes. The system includes an admin panel for content and article management, image uploads, and full Vietnamese / English support.')
on conflict do nothing;

insert into public.posts (slug, title_vi, title_en, excerpt_vi, excerpt_en, content_vi, content_en, cover_url, category_vi, category_en, published_at, is_featured)
values
('an-dang-gioi-thieu-dich-vu-it-outsourcing-va-tu-van-cong-nghe','An Đăng giới thiệu dịch vụ IT Outsourcing và tư vấn công nghệ cho doanh nghiệp đang tăng trưởng','An Dang introduces IT outsourcing and technology consulting services for growing businesses','Doanh nghiệp cần tăng tốc bán hàng và vận hành có thể bắt đầu từ website, landing page, hệ thống nội bộ và đội ngũ kỹ thuật linh hoạt.','Companies looking to accelerate sales and operations can start with websites, landing pages, internal systems, and flexible engineering support.','Công ty TNHH Công nghệ Quốc tế An Đăng tập trung vào nhóm dịch vụ có tính ứng dụng cao cho doanh nghiệp: IT outsourcing, tư vấn giải pháp công nghệ, phát triển website, landing page, dashboard quản trị và các hệ thống nội bộ. Mục tiêu là giúp doanh nghiệp triển khai nhanh, tối ưu chi phí và có nền tảng sẵn sàng mở rộng trong giai đoạn tăng trưởng.','An Dang International Technology Company Limited focuses on high-impact services for businesses: IT outsourcing, technology consulting, websites, landing pages, admin dashboards, and internal systems. The goal is to help businesses launch faster, optimize cost, and build a foundation that can scale during growth.',null,'Tin công ty','Company news','2026-03-20T09:00:00.000Z',true),
('vi-sao-doanh-nghiep-nen-dau-tu-landing-page-chuan-chuyen-doi','Vì sao doanh nghiệp nên đầu tư landing page chuẩn chuyển đổi ngay từ giai đoạn đầu?','Why should businesses invest in conversion-focused landing pages early?','Landing page không chỉ để đẹp mà còn là công cụ đo lường hiệu quả marketing, bán hàng và chăm sóc lead.','A landing page is not just for branding—it is a measurable tool for marketing, sales, and lead nurturing.','Với nhiều doanh nghiệp vừa và nhỏ, landing page là điểm chạm đầu tiên với khách hàng. Một landing page tốt cần rõ dịch vụ, mạnh về niềm tin, tối ưu hành trình chuyển đổi và có khả năng kết nối với CRM hoặc công cụ quản lý lead. Đây là lý do An Đăng tập trung vào cả thiết kế lẫn hạ tầng quản trị phía sau.','For many small and medium-sized businesses, the landing page is the first meaningful customer touchpoint. A strong page must communicate services clearly, build trust, optimize the conversion journey, and connect to CRM or lead management workflows. That is why An Dang focuses on both design and backend operations.',null,'Góc nhìn','Insights','2026-03-24T09:00:00.000Z',false)
on conflict (slug) do nothing;

insert into public.jobs (title_vi, title_en, location_vi, location_en, type_vi, type_en, description_vi, description_en, is_active)
values
('Frontend React Developer','Frontend React Developer','Hà Nội / Hybrid','Hanoi / Hybrid','Toàn thời gian','Full-time','Tham gia xây dựng website doanh nghiệp, landing page, dashboard quản trị và trải nghiệm frontend hiện đại với React, TypeScript và cloud services.','Build corporate websites, landing pages, admin dashboards, and modern frontend experiences using React, TypeScript, and cloud services.',true),
('Business Analyst / Presales IT','Business Analyst / IT Presales','Hà Nội','Hanoi','Bán thời gian / Full-time','Part-time / Full-time','Làm việc với khách hàng để phân tích nhu cầu, viết proposal sơ bộ và hỗ trợ định nghĩa giải pháp công nghệ phù hợp.','Work with clients to analyze needs, prepare initial proposals, and help define suitable technology solutions.',true)
on conflict do nothing;
