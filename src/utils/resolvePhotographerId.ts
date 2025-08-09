
import { supabase } from "@/integrations/supabase/client";

const UUID_REGEX = /^[0-9a-fA-F-]{36}$/;

export const resolvePhotographerUuid = async (routeId?: string): Promise<string | null> => {
  try {
    // Fetch current user info early so we can create/link records when needed
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id ?? null;
    const userEmail = userRes?.user?.email?.toLowerCase() ?? null;

    // 1) If routeId looks like a UUID, ensure it exists in photographers; otherwise fallback to user's photographers row
    if (routeId && UUID_REGEX.test(routeId)) {
      // Check if a photographers row already exists with this UUID
      const { data: existingByUuid } = await supabase
        .from('photographers')
        .select('id')
        .eq('id', routeId)
        .maybeSingle();

      if (existingByUuid?.id) {
        return existingByUuid.id as string;
      }

      // If not found, and the user is authenticated, return/create their photographers row
      if (userId) {
        const { data: existingByUser } = await supabase
          .from('photographers')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existingByUser?.id) {
          return existingByUser.id as string;
        }

        if (userEmail) {
          const { data: created } = await supabase
            .from('photographers')
            .insert({
              user_id: userId,
              name: userEmail.split('@')[0],
              hourly_rate: 0,
            })
            .select('id')
            .single();

          if (created?.id) {
            return created.id as string;
          }
        }
      }

      return null;
    }

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

        // If a matching legacy row exists for this numeric id and email, link it; otherwise create a fresh profile for the current user
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
        } else if (userEmail) {
          // No matching legacy row; create a minimal photographers profile for this user
          const minimalPayload: any = {
            user_id: userId,
            name: userEmail.split('@')[0],
            hourly_rate: 0,
          };

          const { data: createdMinimal, error: createMinimalError } = await supabase
            .from('photographers')
            .insert(minimalPayload)
            .select('id')
            .single();

          if (!createMinimalError && createdMinimal?.id) {
            return createdMinimal.id as string;
          }
        }
      }
    }

    // 3) Fallback: if the user is authenticated, ensure they have a photographers profile
    if (userId) {
      const { data: photographer, error: photographerError } = await supabase
        .from('photographers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!photographerError && photographer?.id) {
        return photographer.id as string;
      }

      // Create a minimal profile if none exists yet
      if (userEmail) {
        const { data: created, error: createError } = await supabase
          .from('photographers')
          .insert({
            user_id: userId,
            name: userEmail.split('@')[0],
            hourly_rate: 0,
          })
          .select('id')
          .single();

        if (!createError && created?.id) {
          return created.id as string;
        }
      }
    }

    return null;
  } catch (e) {
    console.error('Error resolving photographer UUID:', e);
    return null;
  }
};
