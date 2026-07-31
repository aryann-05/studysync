import { MainLayout } from "@/components/layout/main-layout";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Benefits } from "@/components/landing/benefits";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <MainLayout>
      <Hero />
      <Features />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <CTA />
    </MainLayout>
  );
}

