import { useRef, useState } from "react";
import { Plus, Image, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUploadMedia } from "@/hooks/useTalentMedia";
import { useUploadMediaByProfileId } from "@/hooks/useTalentMediaByProfileIdEditable";

interface MediaUploadButtonProps {
  disabled?: boolean;
  externalProfileId?: string;
  externalUserId?: string;
}

export const MediaUploadButton = ({ disabled, externalProfileId, externalUserId }: MediaUploadButtonProps) => {
  const [selectedType, setSelectedType] = useState<"photo" | "video" | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadOwnMedia, isPending: isOwnPending } = useUploadMedia();
  const { mutate: uploadExternalMedia, isPending: isExternalPending } = useUploadMediaByProfileId();

  const isPending = externalProfileId ? isExternalPending : isOwnPending;

  const handleSelectType = (type: "photo" | "video") => {
    setSelectedType(type);
    if (type === "photo") {
      photoInputRef.current?.click();
    } else {
      videoInputRef.current?.click();
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (externalProfileId && externalUserId) {
        uploadExternalMedia({ 
          file, 
          mediaType: type, 
          profileId: externalProfileId, 
          userId: externalUserId 
        });
      } else {
        uploadOwnMedia({ file, mediaType: type });
      }
    }
    // Reset input
    e.target.value = "";
    setSelectedType(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled || isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isPending ? "Caricamento..." : "Aggiungi"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleSelectType("photo")}>
            <Image className="h-4 w-4 mr-2" />
            Foto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSelectType("video")}>
            <Video className="h-4 w-4 mr-2" />
            Video
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFileChange(e, "photo")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => handleFileChange(e, "video")}
      />
    </>
  );
};
