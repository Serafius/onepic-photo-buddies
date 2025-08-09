import { supabase } from "@/integrations/supabase/client";

const UUID_REGEX = /^[0-9a-fA-F-]{36}$/;

export const resolvePhotographerUuid = async (routeId?: string): Promise<string | null> => {
  try {
    // 1) If routeId is already a UUID, use it
    if (routeId && UUID_REGEX.test(routeId)) {
      return routeId;
    }

    // Get current user once (used in multiple branches)
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;
    const userEmail = userRes?.user?.email?.toLowerCase() ?? null;

    // 2) If routeId is numeric, try mapping, then legacy -> new linkage
    if (routeId && /^\d+$/.test(routeId)) {
      const newInt = parseInt(routeId, 10);

      // 2a) Try to resolve via photographer_mappings (new_int -> old_uuid)
      const { data: mapping, error: mappingError } = await supabase
        .from('photographer_mappings')
        .select('old_uuid')
        .eq('new_int', newInt)
        .maybeSingle();

      if (!mappingError && mapping?.old_uuid) {
        return mapping.old_uuid as string;
      }

      // 2b) If mapping not found, and the current user is authenticated, try to
      // link the legacy Photographers row (capital P) to a new photographers UUID row
      if (userId) {
        // If the user already has a photographers row, use it
        const { data: existingPhotographer } = await supabase
          .from('photographers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (existingPhotographer?.id) {
          return existingPhotographer.id as string;
        }

        // Fetch the legacy Photographers row for this numeric id
        const { data: legacy, error: legacyError } = await supabase
          .from('Photographers')
          .select('email, name, profession, location, bio')
          .eq('id', newInt)
          .maybeSingle();

        // Only allow linkage if the legacy email matches the current user's email
        if (!legacyError && legacy && legacy.email && userEmail && legacy.email.toLowerCase() === userEmail) {
          const insertPayload: any = {
            user_id: userId,
            name: legacy.name || userEmail.split('@')[0],
            specialty: legacy.profession || null,
            location: legacy.location || null,
            bio: legacy.bio || null,
            hourly_rate: 0,
          };

          const { data: created, error: createError } = await supabase
            .from('photographers')
            .insert(insertPayload)
            .select('id')
            .single();

          if (!createError && created?.id) {
            return created.id as string;
          }
        }
      }
    }

    // 3) Fallback to the currently authenticated user's photographer profile
    if (userId) {
      const { data: photographer, error: photographerError } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!photographerError && photographer?.id) {
        return photographer.id as string;
      }
    }

    return null;
  } catch (e) {
    console.error('Error resolving photographer UUID:', e);
    return null;
  }
};
