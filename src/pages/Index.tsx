import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";
import { BrowsingGrid } from "@/components/BrowsingGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main>
        <Hero />
        <CategorySection />
        <BrowsingGrid />
        <FeaturedPhotographers />
      </main>
    </div>
  );
};

export default Index;