import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { TalentWithAttributes, calculateAge } from "@/hooks/useTalents";
import { TalentMedia } from "@/hooks/useTalentMediaByProfileId";
import { jsPDF } from "jspdf";

interface TalentExportDialogProps {
  talent: TalentWithAttributes;
  media: TalentMedia[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExportSection {
  id: string;
  label: string;
  enabled: boolean;
}

const genderLabels: Record<string, string> = {
  male: "Uomo",
  female: "Donna",
  other: "Altro",
};

const hairColorLabels: Record<string, string> = {
  black: "Neri",
  brown: "Castani",
  blonde: "Biondi",
  red: "Rossi",
  gray: "Grigi",
  white: "Bianchi",
};

const eyeColorLabels: Record<string, string> = {
  brown: "Marroni",
  blue: "Azzurri",
  green: "Verdi",
  hazel: "Nocciola",
  gray: "Grigi",
};

// Brand colors (HSL converted to RGB)
const COLORS = {
  olive: { r: 85, g: 83, b: 65 }, // Primary olive/dark green
  cream: { r: 252, g: 249, b: 243 }, // Background cream
  bordeaux: { r: 128, g: 47, b: 47 }, // Accent bordeaux
  text: { r: 38, g: 37, b: 34 }, // Dark text
  muted: { r: 120, g: 118, b: 110 }, // Muted text
};

// Load image as base64
const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const TalentExportDialog = ({
  talent,
  media,
  open,
  onOpenChange,
}: TalentExportDialogProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [sections, setSections] = useState<ExportSection[]>([
    { id: "photo", label: "Foto profilo", enabled: true },
    { id: "personal", label: "Informazioni personali", enabled: true },
    { id: "bio", label: "Biografia", enabled: true },
    { id: "categories", label: "Categorie", enabled: true },
    { id: "physical", label: "Caratteristiche fisiche", enabled: true },
    { id: "skills", label: "Competenze", enabled: true },
    { id: "languages", label: "Lingue", enabled: true },
    { id: "gallery", label: "Galleria media", enabled: true },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const isEnabled = (id: string) => sections.find((s) => s.id === id)?.enabled;

  const generatePDF = async () => {
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 0;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const fullName =
        [talent.first_name, talent.last_name].filter(Boolean).join(" ") ||
        "Senza nome";

      // Helper function to add page background
      const addBackground = () => {
        doc.setFillColor(COLORS.cream.r, COLORS.cream.g, COLORS.cream.b);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      };

      // Helper to check and add new page
      const checkNewPage = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - 20) {
          doc.addPage();
          addBackground();
          yPos = 20;
          return true;
        }
        return false;
      };

      // Helper to draw section header
      const drawSectionHeader = (title: string) => {
        checkNewPage(20);
        doc.setFillColor(COLORS.olive.r, COLORS.olive.g, COLORS.olive.b);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 5, yPos + 7);
        doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
        yPos += 15;
      };

      // Helper to draw info row
      const drawInfoRow = (label: string, value: string) => {
        checkNewPage(10);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        doc.text(label, margin + 5, yPos);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
        doc.text(value, margin + 50, yPos);
        yPos += 7;
      };

      // Helper to draw badge
      const drawBadge = (text: string, x: number, y: number, filled = false): number => {
        const padding = 4;
        doc.setFontSize(9);
        const textWidth = doc.getTextWidth(text);
        const badgeWidth = textWidth + padding * 2;
        
        if (filled) {
          doc.setFillColor(COLORS.bordeaux.r, COLORS.bordeaux.g, COLORS.bordeaux.b);
          doc.roundedRect(x, y - 5, badgeWidth, 8, 2, 2, "F");
          doc.setTextColor(255, 255, 255);
        } else {
          doc.setDrawColor(COLORS.olive.r, COLORS.olive.g, COLORS.olive.b);
          doc.roundedRect(x, y - 5, badgeWidth, 8, 2, 2, "S");
          doc.setTextColor(COLORS.olive.r, COLORS.olive.g, COLORS.olive.b);
        }
        
        doc.text(text, x + padding, y);
        doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
        
        return badgeWidth + 4;
      };

      // Start PDF
      addBackground();

      // Header bar
      doc.setFillColor(COLORS.olive.r, COLORS.olive.g, COLORS.olive.b);
      doc.rect(0, 0, pageWidth, 45, "F");

      // Load and add profile photo
      let photoLoaded = false;
      if (isEnabled("photo") && talent.profile_photo_url) {
        try {
          const photoBase64 = await loadImageAsBase64(talent.profile_photo_url);
          if (photoBase64) {
            // Draw circular mask effect with white border
            doc.setFillColor(255, 255, 255);
            doc.circle(margin + 20, 45, 22, "F");
            doc.addImage(photoBase64, "JPEG", margin + 2, 25, 36, 36);
            photoLoaded = true;
          }
        } catch (e) {
          console.log("Could not load profile photo");
        }
      }

      // Name and location in header
      const nameX = photoLoaded ? margin + 50 : margin + 10;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, nameX, 22);

      const age = calculateAge(talent.birth_date);
      const location = [talent.city, talent.country].filter(Boolean).join(", ");
      const subtitle = [location, age ? `${age} anni` : null].filter(Boolean).join(" • ");
      
      if (subtitle) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(subtitle, nameX, 32);
      }

      // Categories in header
      if (isEnabled("categories") && talent.talent_categories?.length) {
        let catX = nameX;
        doc.setFontSize(9);
        talent.talent_categories.slice(0, 4).forEach((cat) => {
          const catWidth = doc.getTextWidth(cat) + 8;
          doc.setFillColor(255, 255, 255, 0.2);
          doc.setDrawColor(255, 255, 255);
          doc.roundedRect(catX, 35, catWidth, 7, 2, 2, "S");
          doc.setTextColor(255, 255, 255);
          doc.text(cat, catX + 4, 40);
          catX += catWidth + 4;
        });
      }

      yPos = photoLoaded ? 75 : 55;

      // Bio section
      if (isEnabled("bio") && talent.bio) {
        drawSectionHeader("Chi sono");
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const bioLines = doc.splitTextToSize(talent.bio, contentWidth - 10);
        checkNewPage(bioLines.length * 5 + 5);
        doc.text(bioLines, margin + 5, yPos);
        yPos += bioLines.length * 5 + 10;
      }

      // Personal info section
      if (isEnabled("personal")) {
        drawSectionHeader("Informazioni personali");
        
        if (location) drawInfoRow("Località:", location);
        if (age) drawInfoRow("Età:", `${age} anni`);
        if (talent.gender) {
          drawInfoRow("Genere:", genderLabels[talent.gender] || talent.gender);
        }
        yPos += 5;
      }

      // Physical attributes section
      if (isEnabled("physical") && talent.attributes) {
        const hasPhysical = talent.attributes.height || talent.attributes.weight || 
                           talent.attributes.hair_color || talent.attributes.eye_color;
        
        if (hasPhysical) {
          drawSectionHeader("Caratteristiche fisiche");
          
          if (talent.attributes.height) {
            drawInfoRow("Altezza:", `${talent.attributes.height} cm`);
          }
          if (talent.attributes.weight) {
            drawInfoRow("Peso:", `${talent.attributes.weight} kg`);
          }
          if (talent.attributes.hair_color) {
            drawInfoRow("Capelli:", hairColorLabels[talent.attributes.hair_color] || talent.attributes.hair_color);
          }
          if (talent.attributes.eye_color) {
            drawInfoRow("Occhi:", eyeColorLabels[talent.attributes.eye_color] || talent.attributes.eye_color);
          }
          yPos += 5;
        }
      }

      // Skills section
      if (isEnabled("skills") && talent.attributes?.skills?.length) {
        drawSectionHeader("Competenze");
        
        let skillX = margin + 5;
        let skillY = yPos;
        const maxWidth = contentWidth - 10;
        
        for (const skill of talent.attributes.skills) {
          const badgeWidth = doc.getTextWidth(skill) + 12;
          if (skillX + badgeWidth > margin + maxWidth) {
            skillX = margin + 5;
            skillY += 10;
            checkNewPage(15);
          }
          skillX += drawBadge(skill, skillX, skillY);
        }
        yPos = skillY + 15;
      }

      // Languages section
      if (isEnabled("languages") && talent.attributes?.languages?.length) {
        drawSectionHeader("Lingue");
        
        let langX = margin + 5;
        for (const lang of talent.attributes.languages) {
          langX += drawBadge(lang, langX, yPos, true);
        }
        yPos += 15;
      }

      // Gallery section with actual images
      if (isEnabled("gallery") && media.length > 0) {
        const photos = media.filter((m) => m.media_type !== "video").slice(0, 6);
        
        if (photos.length > 0) {
          checkNewPage(80);
          drawSectionHeader("Galleria");

          const imgSize = 45;
          const imgGap = 5;
          const imgsPerRow = 3;
          let imgX = margin + 5;
          let imgY = yPos;
          let imgCount = 0;

          for (const photo of photos) {
            try {
              const imgBase64 = await loadImageAsBase64(photo.url);
              if (imgBase64) {
                // Check for new page
                if (imgY + imgSize > pageHeight - 20) {
                  doc.addPage();
                  addBackground();
                  imgY = 20;
                  imgX = margin + 5;
                  imgCount = 0;
                }

                // Draw image with border
                doc.setDrawColor(COLORS.olive.r, COLORS.olive.g, COLORS.olive.b);
                doc.setLineWidth(0.5);
                doc.roundedRect(imgX - 1, imgY - 1, imgSize + 2, imgSize + 2, 2, 2, "S");
                doc.addImage(imgBase64, "JPEG", imgX, imgY, imgSize, imgSize);

                imgCount++;
                if (imgCount % imgsPerRow === 0) {
                  imgX = margin + 5;
                  imgY += imgSize + imgGap;
                } else {
                  imgX += imgSize + imgGap;
                }
              }
            } catch (e) {
              console.log("Could not load gallery image");
            }
          }

          yPos = imgY + imgSize + 10;
        }
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
      doc.text(
        `Generato il ${new Date().toLocaleDateString("it-IT")} • Casting Sparkle Pro`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Save
      const fileName = `${fullName.replace(/\s+/g, "_")}_profilo.pdf`;
      doc.save(fileName);

      onOpenChange(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Esporta profilo in PDF</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Seleziona le sezioni da includere nel PDF:
          </p>

          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center space-x-3">
                <Checkbox
                  id={section.id}
                  checked={section.enabled}
                  onCheckedChange={() => toggleSection(section.id)}
                />
                <Label
                  htmlFor={section.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {section.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={generatePDF} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generazione...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Scarica PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
