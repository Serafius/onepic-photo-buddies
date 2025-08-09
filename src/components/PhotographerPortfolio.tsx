import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BrowsingGrid } from "@/components/BrowsingGrid";
import { PhotographerHeader } from "@/components/PhotographerHeader";
import { resolvePhotographerUuid } from "@/utils/resolvePhotographerId";

export const PhotographerPortfolio = () => {
  const { id } = useParams<{ id: string }>();
  const [resolvedUuid, setResolvedUuid] = useState<string | null>(null);
  const isNumeric = !!(id && /^\d+$/.test(id));

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id) {
        setResolvedUuid(null);
        return;
      }
      if (isNumeric) {
        const uuid = await resolvePhotographerUuid(id);
        if (active) setResolvedUuid(uuid);
      } else {
        // Already a UUID in the route
        setResolvedUuid(id);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isNumeric]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PhotographerHeader photographerId={resolvedUuid || undefined} routeId={isNumeric ? id : undefined} />
      <BrowsingGrid photographerId={resolvedUuid || (isNumeric ? id : undefined)} />
    </div>
  );
};
