# An Đăng Landing Page

Landing page song ngữ Việt/Anh cho **Công ty TNHH Công nghệ Quốc tế An Đăng**, xây bằng:

- Vite + React + TypeScript
- Hono API
- Cloudflare Workers
- Supabase Database + Auth + Storage
- TailwindCSS + Framer Motion

## Tính năng chính

- Landing page hoàn chỉnh, responsive desktop / tablet / mobile
- Tone giao diện sang trọng, hiện đại, công nghệ
- Admin CMS đăng nhập bằng Supabase Auth
- CRUD cho bài viết, dịch vụ, feedback, FAQ
- CMS đầy đủ hơn cho:
  - Hero
  - About
  - Footer
  - thông tin liên hệ
  - logo doanh nghiệp
- Upload logo và ảnh cover bài viết bằng **Supabase Storage** (`site-assets` bucket)
- Form lead và đặt lịch tư vấn qua Hono API
- Seed dữ liệu thực tế theo hồ sơ công ty An Đăng

## Cài đặt local

```bash
npm install
cp .env.example .env
npm run dev
```

## Biến môi trường

Điền vào `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase setup

### 1. Chạy schema

Mở SQL Editor của Supabase và chạy file:

```sql
supabase/schema.sql
```

Schema này sẽ tạo:

- `site_settings`
- `services`
- `testimonials`
- `faqs`
- `posts`
- `jobs`
- `leads`
- `bookings`
- `profiles`
- storage bucket `site-assets`
- RLS policies cho public read + admin manage

### 2. Tạo user admin

- Vào **Authentication > Users** tạo tài khoản admin
- Lấy `uuid` user đó rồi insert vào bảng `profiles`

Ví dụ:

```sql
insert into public.profiles (id, full_name, role)
values ('YOUR_AUTH_USER_ID', 'Admin An Dang', 'admin')
on conflict (id) do update set role = 'admin';
```

### 3. Upload logo / ảnh bài viết

- Đăng nhập `/admin`
- Tab **Site settings** để upload logo
- Tab **Posts** để upload ảnh cover bài viết

## Chạy Cloudflare

```bash
npm run build
npm run cf:dev
npm run cf:deploy
```

## Cấu trúc đáng chú ý

- `src/pages/AdminPage.tsx`: CMS admin
- `src/hooks/usePublicContent.ts`: tải dữ liệu public từ Supabase
- `src/lib/storage.ts`: helper upload Supabase Storage
- `src/sections/HeroSection.tsx`: hero dùng dữ liệu CMS
- `src/sections/AboutSection.tsx`: about dùng dữ liệu CMS
- `src/components/Footer.tsx`: footer dùng dữ liệu CMS
- `supabase/schema.sql`: database + storage + seed

## Ghi chú

- Project đang dùng `HashRouter` để deploy tĩnh / Cloudflare dễ hơn.
- Nếu bạn có logo thật, chỉ cần vào admin upload logo là giao diện sẽ đổi ngay.
- Nếu muốn, bạn có thể mở rộng tiếp để quản trị cả Projects, Benefits, Careers hoặc đa ngôn ngữ sâu hơn theo từng block.
