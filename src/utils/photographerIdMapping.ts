
// Mapping between route IDs (integers) and database UUIDs
export const photographerIdMapping: Record<string, string> = {
  "1": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  // Add more mappings as needed
};

export const getPhotographerUuidFromRouteId = (routeId: string): string | null => {
  return photographerIdMapping[routeId] || null;
};
