import { MarketingNavbar } from "./components/MarketingNavbar";
import { HeroSection } from "./components/HeroSection";
import { ModulesSection } from "./components/ModulesSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { CTASection } from "./components/CTASection";
import { MarketingFooter } from "./components/MarketingFooter";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0a0015]">
      <MarketingNavbar />
      <HeroSection />
      <ModulesSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
