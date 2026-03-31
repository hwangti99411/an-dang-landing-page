import type {
  FaqItem,
  JobItem,
  PostItem,
  ServiceItem,
  SiteSettings,
  TestimonialItem,
} from '@/types';

export const fallbackSiteSettings: SiteSettings = {
  id: 1,
  company_name_vi: 'Công ty TNHH Công nghệ Quốc tế An Đăng',
  company_name_en: 'An Dang International Technology Company Limited',
  brand_name: 'An Đăng',
  logo_url: null,
  phone: '0869209068',
  email: 'contact@andanggroup.com',
  address_vi: '63 ngách 46 Linh Quang, Văn Miếu - Quốc Tử Giám, Hà Nội',
  address_en: '63, Alley 46 Linh Quang, Van Mieu - Quoc Tu Giam, Hanoi, Vietnam',
  hero_badge_vi: 'IT Outsourcing & tư vấn giải pháp công nghệ cho doanh nghiệp tăng trưởng',
  hero_badge_en: 'IT outsourcing and technology consulting for growth-focused businesses',
  hero_title_vi:
    'Đối tác công nghệ giúp doanh nghiệp tăng tốc chuyển đổi số, bán hàng và vận hành.',
  hero_title_en:
    'A technology partner helping businesses accelerate digital transformation, sales, and operations.',
  hero_description_vi:
    'An Đăng cung cấp dịch vụ IT outsourcing, phát triển website, hệ thống nội bộ, landing page, tư vấn kiến trúc công nghệ và đội ngũ kỹ sư đồng hành dài hạn cho doanh nghiệp tại Việt Nam và thị trường quốc tế.',
  hero_description_en:
    'An Dang delivers IT outsourcing, corporate websites, internal systems, landing pages, technology architecture consulting, and long-term engineering support for Vietnamese and international businesses.',
  hero_primary_cta_vi: 'Đặt lịch tư vấn',
  hero_primary_cta_en: 'Book consultation',
  hero_secondary_cta_vi: 'Xem dịch vụ',
  hero_secondary_cta_en: 'Explore services',
  hero_stat_1_value: '48h',
  hero_stat_1_label_vi: 'Khởi tạo đề xuất giải pháp ban đầu',
  hero_stat_1_label_en: 'Initial solution proposal turnaround',
  hero_stat_2_value: 'Bilingual',
  hero_stat_2_label_vi: 'Triển khai và hỗ trợ Việt / Anh',
  hero_stat_2_label_en: 'Vietnamese / English delivery and support',
  hero_stat_3_value: 'Cloud-ready',
  hero_stat_3_label_vi: 'Kiến trúc sẵn sàng mở rộng',
  hero_stat_3_label_en: 'Architecture built for scale',
  about_eyebrow_vi: 'Giới thiệu',
  about_eyebrow_en: 'About',
  about_title_vi:
    'An Đăng tập trung vào giải pháp thực chiến, hiệu quả kinh doanh và tiêu chuẩn triển khai chuyên nghiệp.',
  about_title_en:
    'An Dang focuses on practical solutions, measurable business impact, and professional delivery standards.',
  about_description_vi:
    'Chúng tôi đồng hành cùng startup, SME và doanh nghiệp đang cần xây dựng nền tảng công nghệ bài bản: từ website, landing page, CRM mini, dashboard vận hành đến tư vấn roadmap sản phẩm, quy trình kỹ thuật và mở rộng đội ngũ lập trình.',
  about_description_en:
    'We support startups, SMEs, and enterprises that need a stronger technology foundation—from websites, landing pages, mini CRM tools, and operational dashboards to product roadmaps, engineering processes, and team extension.',
  footer_summary_vi:
    'An Đăng xây dựng hình ảnh doanh nghiệp công nghệ hiện đại với năng lực triển khai web, cloud, tư vấn giải pháp và mở rộng đội ngũ kỹ thuật theo nhu cầu thực tế.',
  footer_summary_en:
    'An Dang presents a modern technology brand with strong capabilities in web engineering, cloud delivery, solution consulting, and flexible team extension.',
  footer_copyright_vi: '© 2026 Công ty TNHH Công nghệ Quốc tế An Đăng. All rights reserved.',
  footer_copyright_en:
    '© 2026 An Dang International Technology Company Limited. All rights reserved.',
};

export const fallbackServices: ServiceItem[] = [
  {
    id: '1',
    icon: 'Code2',
    title_vi: 'IT Outsourcing theo nhu cầu',
    title_en: 'Flexible IT Outsourcing',
    description_vi:
      'Bổ sung nhanh đội ngũ frontend, backend, mobile, QA và DevOps cho dự án ngắn hạn hoặc dài hạn với quy trình phối hợp minh bạch.',
    description_en:
      'Quickly extend your team with frontend, backend, mobile, QA, and DevOps engineers for short- or long-term engagements with transparent collaboration.',
  },
  {
    id: '2',
    icon: 'BrainCircuit',
    title_vi: 'Tư vấn giải pháp công nghệ',
    title_en: 'Technology Solution Consulting',
    description_vi:
      'Đánh giá hiện trạng, phân tích bài toán, đề xuất kiến trúc hệ thống, roadmap triển khai và định hướng đầu tư công nghệ phù hợp.',
    description_en:
      'Assess current challenges, propose system architecture, build delivery roadmaps, and recommend the right technology investment direction.',
  },
  {
    id: '3',
    icon: 'Globe2',
    title_vi: 'Website doanh nghiệp & landing page',
    title_en: 'Corporate Websites & Landing Pages',
    description_vi:
      'Thiết kế và phát triển website chuẩn thương hiệu, tối ưu trải nghiệm, hiệu suất, SEO cơ bản và khả năng thu lead cho doanh nghiệp.',
    description_en:
      'Design and build branded websites optimized for user experience, performance, basic SEO, and lead generation.',
  },
  {
    id: '4',
    icon: 'ShieldCheck',
    title_vi: 'Vận hành, QA và tối ưu hệ thống',
    title_en: 'QA, Operations & Optimization',
    description_vi:
      'Chuẩn hóa testing, quy trình release, giám sát vận hành và cải thiện tính ổn định, bảo mật, tốc độ cho hệ thống đang chạy.',
    description_en:
      'Standardize testing and releases, monitor operations, and improve the stability, security, and performance of live systems.',
  },
];

export const fallbackTestimonials: TestimonialItem[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Khang',
    role_vi: 'Nhà sáng lập',
    role_en: 'Founder',
    company: 'Chuỗi bán lẻ nội địa',
    quote_vi:
      'An Đăng giúp chúng tôi hoàn thiện landing page chiến dịch và dashboard theo dõi lead nhanh, giao tiếp rõ ràng và làm việc rất sát business.',
    quote_en:
      'An Dang helped us launch our campaign landing page and lead tracking dashboard quickly, with clear communication and strong business alignment.',
  },
  {
    id: '2',
    name: 'Lê Thu Phương',
    role_vi: 'Giám đốc vận hành',
    role_en: 'Operations Director',
    company: 'Doanh nghiệp dịch vụ',
    quote_vi:
      'Điểm mạnh là tư duy giải pháp và khả năng đưa ra hướng triển khai thực tế thay vì chỉ nói về công nghệ.',
    quote_en:
      'Their strength is solution thinking and the ability to recommend practical execution paths instead of talking about tech in the abstract.',
  },
  {
    id: '3',
    name: 'David Tran',
    role_vi: 'Product Manager',
    role_en: 'Product Manager',
    company: 'Cross-border SaaS',
    quote_vi:
      'Đội ngũ bilingual, phản hồi nhanh và chủ động trong cả giai đoạn tư vấn lẫn triển khai kỹ thuật.',
    quote_en:
      'The team is bilingual, responsive, and proactive throughout both the consulting and engineering phases.',
  },
];

export const fallbackFaqs: FaqItem[] = [
  {
    id: '1',
    question_vi: 'An Đăng phù hợp với nhóm khách hàng nào?',
    question_en: 'What kinds of clients are a fit for An Dang?',
    answer_vi:
      'Chúng tôi phù hợp với startup, SME, doanh nghiệp dịch vụ, thương mại và các đơn vị cần triển khai nhanh website, hệ thống nội bộ hoặc mở rộng đội ngũ kỹ thuật.',
    answer_en:
      'We are a good fit for startups, SMEs, service businesses, commerce brands, and teams that need websites, internal tools, or engineering capacity fast.',
  },
  {
    id: '2',
    question_vi: 'Có thể thuê theo dự án hoặc theo nhân sự mở rộng không?',
    question_en: 'Can we engage you per project or as an extended team?',
    answer_vi:
      'Có. An Đăng hỗ trợ cả mô hình fixed-scope theo dự án và dedicated team / team extension tùy mục tiêu của doanh nghiệp.',
    answer_en:
      'Yes. We support both fixed-scope project delivery and dedicated team or team-extension models depending on your goals.',
  },
  {
    id: '3',
    question_vi: 'Website có quản trị nội dung và song ngữ không?',
    question_en: 'Will the website support content management and bilingual content?',
    answer_vi:
      'Có. Hệ thống có trang admin quản lý nội dung, bài viết, hình ảnh và hỗ trợ đầy đủ tiếng Việt / tiếng Anh.',
    answer_en:
      'Yes. The system includes an admin panel for content and article management, image uploads, and full Vietnamese / English support.',
  },
];

export const fallbackPosts: PostItem[] = [
  {
    id: '1',
    slug: 'an-dang-gioi-thieu-dich-vu-it-outsourcing-va-tu-van-cong-nghe',
    title_vi:
      'An Đăng giới thiệu dịch vụ IT Outsourcing và tư vấn công nghệ cho doanh nghiệp đang tăng trưởng',
    title_en:
      'An Dang introduces IT outsourcing and technology consulting services for growing businesses',
    excerpt_vi:
      'Doanh nghiệp cần tăng tốc bán hàng và vận hành có thể bắt đầu từ website, landing page, hệ thống nội bộ và đội ngũ kỹ thuật linh hoạt.',
    excerpt_en:
      'Companies looking to accelerate sales and operations can start with websites, landing pages, internal systems, and flexible engineering support.',
    content_vi:
      'Công ty TNHH Công nghệ Quốc tế An Đăng tập trung vào nhóm dịch vụ có tính ứng dụng cao cho doanh nghiệp: IT outsourcing, tư vấn giải pháp công nghệ, phát triển website, landing page, dashboard quản trị và các hệ thống nội bộ. Mục tiêu là giúp doanh nghiệp triển khai nhanh, tối ưu chi phí và có nền tảng sẵn sàng mở rộng trong giai đoạn tăng trưởng.',
    content_en:
      'An Dang International Technology Company Limited focuses on high-impact services for businesses: IT outsourcing, technology consulting, websites, landing pages, admin dashboards, and internal systems. The goal is to help businesses launch faster, optimize cost, and build a foundation that can scale during growth.',
    cover_url: null,
    category_vi: 'Tin công ty',
    category_en: 'Company news',
    published_at: '2026-03-20T09:00:00.000Z',
    is_featured: true,
  },
  {
    id: '2',
    slug: 'vi-sao-doanh-nghiep-nen-dau-tu-landing-page-chuan-chuyen-doi',
    title_vi: 'Vì sao doanh nghiệp nên đầu tư landing page chuẩn chuyển đổi ngay từ giai đoạn đầu?',
    title_en: 'Why should businesses invest in conversion-focused landing pages early?',
    excerpt_vi:
      'Landing page không chỉ để đẹp mà còn là công cụ đo lường hiệu quả marketing, bán hàng và chăm sóc lead.',
    excerpt_en:
      'A landing page is not just for branding—it is a measurable tool for marketing, sales, and lead nurturing.',
    content_vi:
      'Với nhiều doanh nghiệp vừa và nhỏ, landing page là điểm chạm đầu tiên với khách hàng. Một landing page tốt cần rõ dịch vụ, mạnh về niềm tin, tối ưu hành trình chuyển đổi và có khả năng kết nối với CRM hoặc công cụ quản lý lead. Đây là lý do An Đăng tập trung vào cả thiết kế lẫn hạ tầng quản trị phía sau.',
    content_en:
      'For many small and medium-sized businesses, the landing page is the first meaningful customer touchpoint. A strong page must communicate services clearly, build trust, optimize the conversion journey, and connect to CRM or lead management workflows. That is why An Dang focuses on both design and backend operations.',
    cover_url: null,
    category_vi: 'Góc nhìn',
    category_en: 'Insights',
    published_at: '2026-03-24T09:00:00.000Z',
    is_featured: false,
  },
];

export const fallbackJobs: JobItem[] = [
  {
    id: '1',
    title_vi: 'Frontend React Developer',
    title_en: 'Frontend React Developer',
    location_vi: 'Hà Nội / Hybrid',
    location_en: 'Hanoi / Hybrid',
    type_vi: 'Toàn thời gian',
    type_en: 'Full-time',
    description_vi:
      'Tham gia xây dựng website doanh nghiệp, landing page, dashboard quản trị và trải nghiệm frontend hiện đại với React, TypeScript và cloud services.',
    description_en:
      'Build corporate websites, landing pages, admin dashboards, and modern frontend experiences using React, TypeScript, and cloud services.',
    is_active: true,
  },
  {
    id: '2',
    title_vi: 'Business Analyst / Presales IT',
    title_en: 'Business Analyst / IT Presales',
    location_vi: 'Hà Nội',
    location_en: 'Hanoi',
    type_vi: 'Bán thời gian / Full-time',
    type_en: 'Part-time / Full-time',
    description_vi:
      'Làm việc với khách hàng để phân tích nhu cầu, viết proposal sơ bộ và hỗ trợ định nghĩa giải pháp công nghệ phù hợp.',
    description_en:
      'Work with clients to analyze needs, prepare initial proposals, and help define suitable technology solutions.',
    is_active: true,
  },
];
