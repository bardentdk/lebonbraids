import { createClient } from '@/lib/supabase/server';
import { Hero } from '@/components/public/landing/Hero';
import { ServicesShowcase } from '@/components/public/landing/ServicesShowcase';
import { ProcessSteps } from '@/components/public/landing/ProcessSteps';
import { Testimonials } from '@/components/public/landing/Testimonials';
import { CTASection } from '@/components/public/landing/CTASection';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from('services')
    .select('id, slug, name, short_description, price, duration_minutes, cover_image_url')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('is_featured', { ascending: false })
    .order('total_bookings', { ascending: false })
    .limit(6);

  return (
    <>
      <Hero />
      <ServicesShowcase services={services || []} />
      <ProcessSteps />
      <Testimonials />
      <CTASection />
    </>
  );
}