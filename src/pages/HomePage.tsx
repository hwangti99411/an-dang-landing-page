import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { usePublicContent } from '@/hooks/usePublicContent';
import { AboutSection } from '@/sections/AboutSection';
import { BenefitsSection } from '@/sections/BenefitsSection';
import { CareersSection } from '@/sections/CareersSection';
import { ContactSection } from '@/sections/ContactSection';
import { FaqSection } from '@/sections/FaqSection';
import { HeroSection } from '@/sections/HeroSection';
import { NewsSection } from '@/sections/NewsSection';
import { ProjectsSection } from '@/sections/ProjectsSection';
import { ServicesSection } from '@/sections/ServicesSection';
import { TestimonialsSection } from '@/sections/TestimonialsSection';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function HomePage() {
  const { settings, services, testimonials, faqs, posts, jobs } = usePublicContent();

  const location = useLocation();

  useEffect(() => {
    if (!location.state?.scrollTo) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const scrollWithOffset = () => {
        const el = document.getElementById(location.state.scrollTo);
        const navbar = document.getElementById('navbar');
        if (!el) return;

        const offset = navbar?.offsetHeight ?? 80;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: 'smooth',
        });
      };

      const timer = setTimeout(scrollWithOffset, 120);

      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div>
      <Navbar settings={settings} />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <ServicesSection services={services} />
      <BenefitsSection />
      <ProjectsSection />
      <TestimonialsSection testimonials={testimonials} />
      <NewsSection posts={posts} />
      <CareersSection jobs={jobs} />
      <FaqSection faqs={faqs} />
      <ContactSection settings={settings} />
      <Footer settings={settings} />
    </div>
  );
}
