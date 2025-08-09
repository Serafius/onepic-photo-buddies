import { useParams } from "react-router-dom";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { PhotographerHeader } from "@/components/PhotographerHeader";
import { getPhotographerUuidFromRouteId } from "@/utils/photographerIdMapping";

export const PhotographerPortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const photographerUuid = id ? getPhotographerUuidFromRouteId(id) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <PhotographerHeader photographerId={photographerUuid || undefined} routeId={id} />
      <BrowsingGrid photographerId={photographerUuid || undefined} />
    </div>
  );
};
