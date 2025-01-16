import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20">
      <div className="container px-6 py-16 mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-8 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Find Your Perfect Photographer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with talented photographers for your special moments. Book easily, capture memories forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="hover-scale text-lg">
              Browse Photographers
            </Button>
            <Button size="lg" variant="outline" className="hover-scale text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};