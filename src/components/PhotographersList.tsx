import { Star, MapPin, Camera, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Photographer {
  id: string;
  name: string;
  image: string;
  rating: number;
  specialty: string;
  location: string;
}

interface PhotographerListProps {
  photographers: Photographer[];
  size: "compact" | "detailed";
  title?: string;
}

export const PhotographerList = ({ photographers, size, title }: PhotographerListProps) => {
  const navigate = useNavigate();
  const isCompact = size === "compact";

  return (
    <section className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm sticky top-24">
      <h1 className="text-xl font-semibold mb-4 p-4 text-primary text-center">
        {title}
      </h1>
      
      <div className={`space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto`}>
        {photographers.map((photographer) => (
          <Card
            key={photographer.id}
            className={`
              overflow-hidden transition-all duration-300 cursor-pointer border-0
              ${isCompact 
                ? "hover:scale-[0.99] shadow-md hover:shadow-lg glass-card" 
                : "group mx-2 w-[3/4] hover:scale-[1] shadow-sm hover:shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm"
              }
            `}
            onClick={() => navigate(`/photographer/${photographer.id}`)}
          >
            <div className={isCompact ? "p-4 flex items-center space-x-4" : "flex items-center space-x-4 p-6"}>
              {/* Profile Image */}
              <div className={`
                ${isCompact 
                  ? "w-16 h-16 rounded-full border-2 border-primary/10" 
                  : "relative w-40 h-40 rounded-2xl border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors"
                } 
                overflow-hidden
              `}>
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className={`
                    object-cover w-full h-full
                    ${!isCompact && "group-hover:scale-110 transition-transform duration-300"}
                  `}
                />
                {!isCompact && (
                  <div className="absolute top-0 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                )}
              </div>

              {/* Content Section */}
              <div className={isCompact ? "flex-1" : "flex-1 min-w-0"}>
                <div className={`
                  flex ${isCompact ? "items-center justify-between" : "items-start justify-between mb-2"}
                `}>
                  <div className={isCompact ? "" : "flex flex-col space-y-1 mt-1 justify-evenly"}>
                    <h3 className={`
                      ${isCompact 
                        ? "font-semibold text-primary" 
                        : "font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate"
                      }
                    `}>
                      {photographer.name}
                    </h3>
                    {!isCompact && (
                      <p className="text-sm text-muted-foreground flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1" />
                        {photographer.location}
                      </p>
                    )}
                  </div>

                  <div className={`
                    flex items-center
                    ${isCompact 
                      ? "" 
                      : "bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full"
                    }
                  `}>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className={`
                      ml-1 ${isCompact ? "text-sm" : "text-sm font-medium text-yellow-700 dark:text-yellow-400"}
                    `}>
                      {photographer.rating}
                    </span>
                  </div>
                </div>

                <Badge 
                  variant="secondary" 
                  className={`
                    ${isCompact 
                      ? "mt-1 bg-primary/5" 
                      : "mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                    }
                  `}
                >
                  {photographer.specialty}
                </Badge>

                {isCompact ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {photographer.location}
                  </p>
                ) : (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Camera className="w-3 h-3 mr-1" />
                        {'50+'} projects
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Available
                      </span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};