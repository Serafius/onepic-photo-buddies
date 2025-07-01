import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Photographer } from "@/lib/data";
import { ArrowRight, Camera, Clock, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PhotographersList = ({ photographers }: { photographers: Photographer[] }) => {
    const navigate = useNavigate();

    return (
        <section className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4 text-primary">Featured Photographers</h2>
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {photographers.map((photographer) => (
                    <Card
                        key={photographer.id}
                        className="group overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer border-0 shadow-sm hover:shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm"
                        onClick={() => navigate(`/photographer/${photographer.id}`)}
                    >
                        <div className="p-6">
                            <div className="flex items-start space-x-4">
                                {/* Profile Image with Enhanced Styling */}
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md group-hover:border-primary/40 transition-colors">
                                        <img
                                            src={photographer.image}
                                            alt={photographer.name}
                                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    {/* Online Status Indicator */}
                                    <div className="absolute -top-0 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm"></div>
                                </div>
                                {/* Content Section */}
                                <div className="flex-1 min-w-0">
                                    {/* Header with Name and Rating */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex flex-col space-y-1 mt-1 justify-evenly">
                                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                                                {photographer.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground flex items-center mt-0.5">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {photographer.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="ml-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                                {photographer.rating}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Specialty Badge */}
                                    <Badge
                                        variant="secondary"
                                        className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
                                    >
                                        {photographer.specialty}
                                    </Badge>
                                    {/* Additional Info Row */}
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
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}