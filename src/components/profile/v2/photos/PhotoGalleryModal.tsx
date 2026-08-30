import { MediaGalleryModal } from "./MediaGalleryModal";
import type { MediaCategory } from "@/lib/mediaCategories";

interface PhotoGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategory?: MediaCategory;
}

export const PhotoGalleryModal = (props: PhotoGalleryModalProps) => (
  <MediaGalleryModal {...props} kind="photo" />
);

export default PhotoGalleryModal;
