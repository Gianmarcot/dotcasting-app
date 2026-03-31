import { useState, useRef, useCallback } from "react";
import { ImageIcon, Plus, Video, Image, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import {
  useTalentMedia,
  useUploadMedia,
  useDeleteMedia,
  useUpdateMediaOrder,
  useReplaceMediaFile,
  type TalentMedia,
} from "@/hooks/useTalentMedia";
import {
  useTalentMediaByProfileIdEditable,
  useDeleteMediaByProfileId,
  type TalentMedia as TalentMediaType,
} from "@/hooks/useTalentMediaByProfileIdEditable";
import { useMediaRatingsForProfile, type MediaRating } from "@/hooks/useMediaRatings";
import { useAuth } from "@/contexts/AuthContext";
import { MediaGridItem } from "./MediaGridItem";
import { MediaLightbox } from "./MediaLightbox";
import { ImageCropModal } from "./ImageCropModal";
import { MEDIA_CATEGORIES, isPhotoCategory, type MediaCategory } from "@/lib/mediaCategories";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

interface MediaGallerySectionProps {
  externalProfileId?: string;
  externalUserId?: string;
  isOwnerView?: boolean;
  showDeleteButton?: boolean;
}

export const MediaGallerySection = ({
  externalProfileId,
  externalUserId,
  isOwnerView = false,
  showDeleteButton = true,
}: MediaGallerySectionProps) => {
  const { user } = useAuth();
  const { data: ownMedia, isLoading: ownLoading } = useTalentMedia();
  const { data: externalMedia, isLoading: externalLoading } =
    useTalentMediaByProfileIdEditable(externalProfileId);
  const { mutate: deleteOwnMedia, isPending: isOwnDeleting } = useDeleteMedia();
  const { mutate: deleteExternalMedia, isPending: isExternalDeleting } =
    useDeleteMediaByProfileId();
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: updateOrder } = useUpdateMediaOrder();
  const { mutate: replaceFile, isPending: isReplacing } = useReplaceMediaFile();
  const { data: ownerRatings } = useMediaRatingsForProfile(
    isOwnerView ? externalProfileId : null
  );

  const media = externalProfileId ? externalMedia : ownMedia;
  const isLoading = externalProfileId ? externalLoading : ownLoading;
  const isDeleting = externalProfileId ? isExternalDeleting : isOwnDeleting;

  const [activeTab, setActiveTab] = useState<string>("main_photos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<TalentMedia[]>([]);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<TalentMedia | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Ratings map
  const ratingsMap = new Map<string, MediaRating>();
  if (ownerRatings) {
    ownerRatings.forEach((r) => ratingsMap.set(r.media_id, r));
  }

  // Filter media by category
  const getMediaForCategory = useCallback(
    (cat: string) =>
      (media || []).filter((m) => (m as any).category === cat).sort((a, b) => a.sort_order - b.sort_order),
    [media]
  );

  const currentCatMedia = getMediaForCategory(activeTab);
  const currentCatDef = MEDIA_CATEGORIES.find((c) => c.key === activeTab);
  const isPhotoCat = isPhotoCategory(activeTab);

  // Handle upload
  const handleUploadClick = () => {
    if (isPhotoCat) {
      fileInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (isPhotoCat) {
      // Open crop modal
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setPendingUploadFile(file);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct upload for video
      uploadMedia({
        file,
        mediaType: "video",
        category: activeTab as MediaCategory,
      });
    }
  };

  const handleCropComplete = (blob: Blob) => {
    if (cropTarget) {
      // Re-crop existing photo
      replaceFile(
        {
          mediaId: cropTarget.id,
          oldUrl: cropTarget.url,
          newFile: blob,
          userId: user?.id || "",
        },
        {
          onSuccess: () => {
            setCropSrc(null);
            setCropTarget(null);
          },
        }
      );
    } else {
      // New upload
      uploadMedia(
        {
          file: blob as any,
          mediaType: "photo",
          category: activeTab as MediaCategory,
        },
        {
          onSuccess: () => {
            setCropSrc(null);
            setPendingUploadFile(null);
          },
        }
      );
    }
  };

  const handleCropExisting = (mediaItem: TalentMedia) => {
    setCropTarget(mediaItem);
    setCropSrc(mediaItem.url);
  };

  const handleDelete = (mediaItem: TalentMedia | TalentMediaType) => {
    if (externalProfileId) {
      deleteExternalMedia({
        media: mediaItem as TalentMediaType,
        profileId: externalProfileId,
      });
    } else {
      deleteOwnMedia(mediaItem as TalentMedia);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const items = [...currentCatMedia];
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    updateOrder(
      reordered.map((item, idx) => ({ id: item.id, sort_order: idx }))
    );
  };

  const openLightbox = (catMedia: TalentMedia[], index: number) => {
    setLightboxMedia(catMedia);
    setLightboxIndex(index);
  };

  const mainPhotosMedia = getMediaForCategory("main_photos");
  const mainPhotosCount = mainPhotosMedia.length;
  const mainPhotosMin = 4;
  const mainPhotosProgress = Math.min((mainPhotosCount / mainPhotosMin) * 100, 100);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galleria Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galleria Media
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-6 px-6">
              <TabsList className="w-max mb-4">
                {MEDIA_CATEGORIES.map((cat) => {
                  const count = getMediaForCategory(cat.key).length;
                  return (
                    <TabsTrigger key={cat.key} value={cat.key} className="text-xs sm:text-sm whitespace-nowrap">
                      {cat.label}
                      <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem] justify-center">
                        {count}
                      </Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {MEDIA_CATEGORIES.map((cat) => {
              const catMedia = getMediaForCategory(cat.key);
              const isMain = cat.key === "main_photos";

              return (
                <TabsContent key={cat.key} value={cat.key}>
                  {/* Main photos progress */}
                  {isMain && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {mainPhotosCount}/{mainPhotosMin} foto caricate
                        </span>
                        {mainPhotosCount < mainPhotosMin && (
                          <Badge variant="destructive" className="text-xs">
                            Minimo {mainPhotosMin} foto richieste
                          </Badge>
                        )}
                        {mainPhotosCount >= mainPhotosMin && (
                          <Badge className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            Requisito soddisfatto
                          </Badge>
                        )}
                      </div>
                      <Progress value={mainPhotosProgress} className="h-2" />
                    </div>
                  )}

                  {/* Upload button */}
                  {showDeleteButton && (
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadClick}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        {isPhotoCat ? "Aggiungi foto" : "Aggiungi video"}
                      </Button>
                    </div>
                  )}

                  {/* Media grid */}
                  {catMedia.length > 0 ? (
                    isPhotoCat && showDeleteButton ? (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={catMedia.map((m) => m.id)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {catMedia.map((item, index) => (
                              <MediaGridItem
                                key={item.id}
                                media={item}
                                onDelete={showDeleteButton ? handleDelete : undefined}
                                onCrop={showDeleteButton ? handleCropExisting : undefined}
                                onClick={() => openLightbox(catMedia, index)}
                                isDeleting={isDeleting}
                                isOwnerView={isOwnerView}
                                ownerRating={ratingsMap.get(item.id)}
                                showDeleteButton={showDeleteButton}
                                enableDrag={true}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {catMedia.map((item, index) => (
                          <MediaGridItem
                            key={item.id}
                            media={item}
                            onDelete={showDeleteButton ? handleDelete : undefined}
                            onCrop={
                              showDeleteButton && isPhotoCat
                                ? handleCropExisting
                                : undefined
                            }
                            onClick={() => openLightbox(catMedia, index)}
                            isDeleting={isDeleting}
                            isOwnerView={isOwnerView}
                            ownerRating={ratingsMap.get(item.id)}
                            showDeleteButton={showDeleteButton}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg py-12 text-center text-muted-foreground">
                      {isPhotoCat ? (
                        <Image className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      ) : (
                        <Video className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      )}
                      <p className="text-sm">Nessun contenuto in questa categoria.</p>
                      {showDeleteButton && (
                        <p className="text-xs mt-1 text-muted-foreground/70">
                          Clicca "Aggiungi" per caricare.
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Crop Modal */}
      {cropSrc && (
        <ImageCropModal
          open={!!cropSrc}
          onClose={() => {
            setCropSrc(null);
            setPendingUploadFile(null);
            setCropTarget(null);
          }}
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          isSaving={isUploading || isReplacing}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxMedia.length > 0 && (
        <MediaLightbox
          media={lightboxMedia}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          isOwnerView={isOwnerView}
          ratingsMap={ratingsMap}
        />
      )}
    </>
  );
};
