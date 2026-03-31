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
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100); // delay để đảm bảo DOM render xong
      }
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
