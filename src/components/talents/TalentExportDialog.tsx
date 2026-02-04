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
    { id: "gallery", label: "Galleria media (solo elenco)", enabled: false },
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
      let yPos = 20;
      const lineHeight = 7;
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const fullName =
        [talent.first_name, talent.last_name].filter(Boolean).join(" ") ||
        "Senza nome";

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(fullName, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Photo placeholder (we can't easily embed the actual image without more complex handling)
      if (isEnabled("photo") && talent.profile_photo_url) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(128);
        doc.text(`Foto profilo: ${talent.profile_photo_url}`, margin, yPos);
        doc.setTextColor(0);
        yPos += lineHeight * 2;
      }

      // Personal info
      if (isEnabled("personal")) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Informazioni personali", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        const age = calculateAge(talent.birth_date);
        const location = [talent.city, talent.country].filter(Boolean).join(", ");

        if (location) {
          doc.text(`Località: ${location}`, margin, yPos);
          yPos += lineHeight;
        }
        if (age) {
          doc.text(`Età: ${age} anni`, margin, yPos);
          yPos += lineHeight;
        }
        if (talent.gender) {
          doc.text(`Genere: ${genderLabels[talent.gender] || talent.gender}`, margin, yPos);
          yPos += lineHeight;
        }
        yPos += 5;
      }

      // Bio
      if (isEnabled("bio") && talent.bio) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Chi sono", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const bioLines = doc.splitTextToSize(talent.bio, contentWidth);
        doc.text(bioLines, margin, yPos);
        yPos += bioLines.length * lineHeight + 5;
      }

      // Categories
      if (isEnabled("categories") && talent.talent_categories?.length) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Categorie", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(talent.talent_categories.join(", "), margin, yPos);
        yPos += lineHeight + 5;
      }

      // Physical attributes
      if (isEnabled("physical") && talent.attributes) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Caratteristiche fisiche", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        if (talent.attributes.height) {
          doc.text(`Altezza: ${talent.attributes.height} cm`, margin, yPos);
          yPos += lineHeight;
        }
        if (talent.attributes.weight) {
          doc.text(`Peso: ${talent.attributes.weight} kg`, margin, yPos);
          yPos += lineHeight;
        }
        if (talent.attributes.hair_color) {
          doc.text(
            `Colore capelli: ${hairColorLabels[talent.attributes.hair_color] || talent.attributes.hair_color}`,
            margin,
            yPos
          );
          yPos += lineHeight;
        }
        if (talent.attributes.eye_color) {
          doc.text(
            `Colore occhi: ${eyeColorLabels[talent.attributes.eye_color] || talent.attributes.eye_color}`,
            margin,
            yPos
          );
          yPos += lineHeight;
        }
        yPos += 5;
      }

      // Skills
      if (isEnabled("skills") && talent.attributes?.skills?.length) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Competenze", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const skillsText = doc.splitTextToSize(
          talent.attributes.skills.join(", "),
          contentWidth
        );
        doc.text(skillsText, margin, yPos);
        yPos += skillsText.length * lineHeight + 5;
      }

      // Languages
      if (isEnabled("languages") && talent.attributes?.languages?.length) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Lingue", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(talent.attributes.languages.join(", "), margin, yPos);
        yPos += lineHeight + 5;
      }

      // Gallery list
      if (isEnabled("gallery") && media.length > 0) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Galleria media", margin, yPos);
        yPos += lineHeight + 2;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        media.forEach((item, index) => {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          const label = item.title || `Media ${index + 1}`;
          const type = item.media_type === "video" ? "Video" : "Foto";
          doc.text(`${index + 1}. ${label} (${type})`, margin, yPos);
          yPos += lineHeight;
        });
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Generato il ${new Date().toLocaleDateString("it-IT")}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generazione...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Scarica PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
