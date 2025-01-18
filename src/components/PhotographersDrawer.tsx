import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

const photographers = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Wedding Photography",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    location: "New York, NY",
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Portrait Photography",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    location: "Los Angeles, CA",
  },
  {
    id: 3,
    name: "Emma Davis",
    specialty: "Event Photography",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67",
    location: "Chicago, IL",
  },
  {
    id: 4,
    name: "John Smith",
    specialty: "Landscape Photography",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
    location: "Seattle, WA",
  },
  {
    id: 5,
    name: "Lisa Wong",
    specialty: "Fashion Photography",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    location: "Miami, FL",
  },
  {
    id: 6,
    name: "David Miller",
    specialty: "Product Photography",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    location: "Austin, TX",
  },
];

export const PhotographersDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="fixed right-4 top-24 z-50">
          <Users className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Photographers</DrawerTitle>
          <DrawerDescription>Browse our talented photographers</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="h-[calc(85vh-120px)] px-4">
          <div className="space-y-4 pb-4">
            {photographers.map((photographer) => (
              <div
                key={photographer.id}
                className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <Avatar>
                  <AvatarImage src={photographer.image} alt={photographer.name} />
                  <AvatarFallback>{photographer.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium leading-none">{photographer.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {photographer.specialty}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-500">★</span>
                    <span className="text-sm">{photographer.rating}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {photographer.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};