import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { FeaturedPhotographers } from "@/components/FeaturedPhotographers";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedPhotographers />
      </main>
    </div>
  );
};

export default Index;