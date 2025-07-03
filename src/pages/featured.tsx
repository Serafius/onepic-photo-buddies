import { PhotographerList } from "@/components/PhotographersList";
import { photographers } from "@/lib/data";

export const FeaturedPhotographers = () => {
    return (
        <PhotographerList
            photographers={photographers}
            size="detailed"
            title="Top Rated Photographers"
        />
    );
};