import { supabase } from "@/integrations/supabase/client";

const UUID_REGEX = /^[0-9a-fA-F-]{36}$/;

export const resolvePhotographerUuid = async (routeId?: string): Promise<string | null> => {
  try {
    // 1) If routeId is already a UUID, use it
    if (routeId && UUID_REGEX.test(routeId)) {
      return routeId;
    }

    // 2) If routeId is numeric, try to resolve via photographer_mappings (new_int -> old_uuid)
    if (routeId && /^\d+$/.test(routeId)) {
      const newInt = parseInt(routeId, 10);
      const { data: mapping, error: mappingError } = await supabase
        .from('photographer_mappings')
        .select('old_uuid')
        .eq('new_int', newInt)
        .maybeSingle();

      if (!mappingError && mapping?.old_uuid) {
        return mapping.old_uuid as string;
      }
    }

    // 3) Fallback to the currently authenticated user's photographer profile
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;

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
