import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "@/hooks/use-toast";
import type { MediaCategory } from "@/lib/mediaCategories";
import { compressImage } from "@/lib/media/compressImage";

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
const MAX_MEDIA_COUNT = 100;

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

export const useTalentMedia = () => {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ["talent-media", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("talent_media")
        .select("*")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TalentMedia[];
    },
    enabled: !!profile?.id,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({
      file,
      mediaType,
      title,
      category,
    }: {
      file: File | Blob;
      mediaType: "photo" | "video";
      title?: string;
      category?: MediaCategory;
    }) => {
      if (!profile?.id || !profile?.user_id) {
        throw new Error("Profilo non trovato");
      }

      // Validate file size
      const maxSize = mediaType === "photo" ? MAX_PHOTOS_SIZE : MAX_VIDEO_SIZE;
      if (file.size > maxSize) {
        const maxMB = maxSize / (1024 * 1024);
        throw new Error(`Il file supera la dimensione massima di ${maxMB}MB`);
      }

      // Validate file type (only for File objects, not Blobs from crop)
      if (file instanceof File) {
        const allowedTypes =
          mediaType === "photo" ? ALLOWED_PHOTO_TYPES : ALLOWED_VIDEO_TYPES;
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Tipo di file non supportato: ${file.type}`);
        }
      }

      // Compress photos before upload (videos pass through unchanged)
      const fileToUpload = mediaType === "photo" ? await compressImage(file, "gallery") : file;

      // Generate unique filename
      const fileExt = fileToUpload instanceof File ? fileToUpload.name.split(".").pop() : "jpg";
      const fileName = `${profile.user_id}/${mediaType}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("talent-media")
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("talent-media")
        .getPublicUrl(fileName);

      // Get max sort_order for this category
      const { data: maxOrderData } = await supabase
        .from("talent_media")
        .select("sort_order")
        .eq("profile_id", profile.id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.sort_order ?? -1) + 1;

      // Insert record
      const insertData = {
        profile_id: profile.id,
        media_type: mediaType,
        url: urlData.publicUrl,
        title: title || null,
        sort_order: nextOrder,
        ...(category ? { category } : {}),
      };

      const { data, error: insertError } = await supabase
        .from("talent_media")
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-media"] });
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

export const useReplaceMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      mediaId,
      oldUrl,
      newFile,
      userId,
    }: {
      mediaId: string;
      oldUrl: string;
      newFile: Blob;
      userId: string;
    }) => {
      // Delete old file from storage
      const url = new URL(oldUrl);
      const pathParts = url.pathname.split("/talent-media/");
      if (pathParts.length > 1) {
        await supabase.storage.from("talent-media").remove([pathParts[1]]);
      }

      // Upload new file
      // Compress crop before upload
      const compressed = await compressImage(newFile, "gallery");
      const fileName = `${userId}/photo/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("talent-media")
        .upload(fileName, compressed);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("talent-media")
        .getPublicUrl(fileName);

      // Update record
      const { error: updateError } = await supabase
        .from("talent_media")
        .update({ url: urlData.publicUrl })
        .eq("id", mediaId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-media"] });
      toast({ title: "Foto aggiornata", description: "Il ritaglio è stato salvato." });
    },
    onError: (error: Error) => {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: TalentMedia) => {
      // Extract file path from URL
      const url = new URL(media.url);
      const pathParts = url.pathname.split("/talent-media/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from("talent-media").remove([filePath]);
      }

      const { error } = await supabase
        .from("talent_media")
        .delete()
        .eq("id", media.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-media"] });
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

export const useUpdateMediaOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedMedia: { id: string; sort_order: number }[]) => {
      const updates = orderedMedia.map(({ id, sort_order }) =>
        supabase
          .from("talent_media")
          .update({ sort_order })
          .eq("id", id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["talent-media"] });
    },
  });
};
