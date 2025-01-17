import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";
import { BrowsingGrid } from "@/components/BrowsingGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CategorySection />
              <BrowsingGrid />
            </div>
            <div className="lg:col-span-1">
              <FeaturedPhotographers />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;