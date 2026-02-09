import { MarketingNavbar } from "./components/MarketingNavbar";
import { HeroSection } from "./components/HeroSection";
import { SocialProofSection } from "./components/SocialProofSection";
import { StatsSection } from "./components/StatsSection";
import { ModulesSection } from "./components/ModulesSection";
import { BentoFeaturesSection } from "./components/BentoFeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { FAQSection } from "./components/FAQSection";
import { CTASection } from "./components/CTASection";
import { MarketingFooter } from "./components/MarketingFooter";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0015]">
      <MarketingNavbar />
      <HeroSection />
      <SocialProofSection />
      <StatsSection />
      <ModulesSection />
      <BentoFeaturesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
