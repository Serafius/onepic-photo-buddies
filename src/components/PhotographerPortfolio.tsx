import { useParams } from "react-router-dom";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { getPhotographerUuidFromRouteId } from "@/utils/photographerIdMapping";

export const PhotographerPortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const photographerUuid = id ? getPhotographerUuidFromRouteId(id) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <BrowsingGrid photographerId={photographerUuid || undefined} />
    </div>
  );
};
