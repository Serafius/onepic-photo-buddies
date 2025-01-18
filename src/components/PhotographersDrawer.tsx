import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

const photographers = [
  {
    id: 1,
    name: "Sarah Johnson",
    specialty: "Wedding Photography",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    initials: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Portrait Photography",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    initials: "MC",
  },
  {
    id: 3,
    name: "Emma Davis",
    specialty: "Event Photography",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    initials: "ED",
  },
  {
    id: 4,
    name: "David Wilson",
    specialty: "Landscape Photography",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    initials: "DW",
  },
  {
    id: 5,
    name: "Lisa Brown",
    specialty: "Fashion Photography",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    initials: "LB",
  },
  {
    id: 6,
    name: "John Smith",
    specialty: "Street Photography",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    initials: "JS",
  },
];

export const PhotographersDrawer = () => {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      <Drawer direction="left">
        <DrawerTrigger asChild>
          <button className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg hover:bg-white/90 transition-colors">
            <div className="flex flex-col gap-1.5">
              <div className="w-6 h-0.5 bg-primary rounded-full"></div>
              <div className="w-6 h-0.5 bg-primary rounded-full"></div>
            </div>
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh] w-[300px] right-0 left-auto rounded-l-xl">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Photographers</h2>
            <ScrollArea className="h-[calc(80vh-8rem)] rounded-lg">
              <div className="space-y-4 p-2">
                {photographers.map((photographer) => (
                  <div
                    key={photographer.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarImage src={photographer.avatar} alt={photographer.name} />
                      <AvatarFallback>{photographer.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{photographer.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {photographer.specialty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};