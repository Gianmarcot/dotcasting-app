import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { MediaCategory } from "@/lib/mediaCategories";

export interface TalentMedia {
  id: string;
  profile_id: string;
  media_type: "photo" | "video";
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  sort_order: number;
  category: string;
  created_at: string;
  updated_at: string;
}

const MAX_PHOTOS_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_MEDIA_COUNT = 20;

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export const useTalentMediaByProfileIdEditable = (profileId: string | null | undefined) => {
  return useQuery({
    queryKey: ["talent-media", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("talent_media")
        .select("*")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TalentMedia[];
    },
    enabled: !!profileId,
  });
};

export const useUploadMediaByProfileId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      userId,
      file,
      mediaType,
      title,
    }: {
      profileId: string;
      userId: string;
      file: File;
      mediaType: "photo" | "video";
      title?: string;
    }) => {
      if (!profileId || !userId) {
        throw new Error("Profilo non trovato");
      }

      // Validate file size
      const maxSize = mediaType === "photo" ? MAX_PHOTOS_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const maxMB = maxSize / (1024 * 1024);
        throw new Error(`Il file supera la dimensione massima di ${maxMB}MB`);
      }

      // Validate file type
      const allowedTypes =
        mediaType === "photo" ? ALLOWED_PHOTO_TYPES : ALLOWED_VIDEO_TYPES;
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo di file non supportato: ${file.type}`);
      }

      // Check media count limit
      const { count, error: countError } = await supabase
        .from("talent_media")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", profileId);

      if (countError) throw countError;
      if ((count || 0) >= MAX_MEDIA_COUNT) {
        throw new Error(`Hai raggiunto il limite massimo di ${MAX_MEDIA_COUNT} media`);
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${mediaType}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("talent-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("talent-media")
        .getPublicUrl(fileName);

      // Get max sort_order
      const { data: maxOrderData } = await supabase
        .from("talent_media")
        .select("sort_order")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.sort_order ?? -1) + 1;

      // Insert record
      const { data, error: insertError } = await supabase
        .from("talent_media")
        .insert({
          profile_id: profileId,
          media_type: mediaType,
          url: urlData.publicUrl,
          title: title || null,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-media", variables.profileId] });
      toast({
        title: "Media caricato",
        description: "Il file è stato caricato con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMediaByProfileId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ media, profileId }: { media: TalentMedia; profileId: string }) => {
      // Extract file path from URL
      const url = new URL(media.url);
      const pathParts = url.pathname.split("/talent-media/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        // Delete from storage
        await supabase.storage.from("talent-media").remove([filePath]);
      }

      // Delete record
      const { error } = await supabase
        .from("talent_media")
        .delete()
        .eq("id", media.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["talent-media", variables.profileId] });
      toast({
        title: "Media eliminato",
        description: "Il file è stato eliminato con successo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
