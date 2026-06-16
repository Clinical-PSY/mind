import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProcessSection from "@/components/ProcessSection";
import ServicesSection from "@/components/ServicesSection";
import TeamSection from "@/components/TeamSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import PortfolioSection from "@/components/PortfolioSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ProcessSection />
        <ServicesSection />
        <TeamSection />
        <TestimonialsSection />
        <PartnersSection />
        <PortfolioSection />
        <FaqSection />
        <ContactSection />
        <LocationSection />
      </main>
      <Footer />
    </>
  );
}
