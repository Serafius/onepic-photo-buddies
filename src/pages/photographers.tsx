import { PhotographersList } from "@/components/PhotographersList";
import { photographers } from "@/lib/data";

export const AllPhotographers = () => {
    return (
        <PhotographersList photographers={photographers} />
    );
};