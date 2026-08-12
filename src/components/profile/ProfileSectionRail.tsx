import { Check } from "lucide-react";
import {
  User,
  Phone,
  FileText,
  Ruler,
  Sparkles,
  Briefcase,
  Star,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";

export type ProfileSectionKey =
  | "personal"
  | "contacts"
  | "documents"
  | "appearance"
  | "bio"
  | "work"
  | "roles"
  | "media";

export const PROFILE_SECTIONS: Array<{
  key: ProfileSectionKey;
  label: string;
  icon: typeof User;
  anchors: string[];
}> = [
  { key: "personal", label: "Dati personali", icon: User, anchors: ["basic-info"] },
  { key: "contacts", label: "Contatti e indirizzo", icon: Phone, anchors: ["contact-info", "address"] },
  { key: "documents", label: "Documenti e fiscalità", icon: FileText, anchors: [] },
  { key: "appearance", label: "Aspetto fisico", icon: Ruler, anchors: ["measurements", "physical-features"] },
  { key: "bio", label: "Bio, abilità e lingue", icon: Sparkles, anchors: ["about-me", "languages", "skills"] },
  { key: "work", label: "Lavoro e viaggi", icon: Briefcase, anchors: [] },
  { key: "roles", label: "Ruoli e talenti", icon: Star, anchors: ["talent-roles"] },
  { key: "media", label: "Galleria media", icon: Images, anchors: ["media-gallery"] },
];

type Status = "complete" | "missing" | "optional";

export const anchorToSection = (anchor: string): ProfileSectionKey | undefined =>
  PROFILE_SECTIONS.find((s) => s.anchors.includes(anchor))?.key;

const StatusIndicator = ({ status }: { status: Status }) => {
  if (status === "complete") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-olive/15 text-olive">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "missing" ? "bg-destructive" : "bg-muted-foreground/40"
        )}
      />
    </span>
  );
};

interface ProfileSectionRailProps {
  active: ProfileSectionKey;
  onSelect: (key: ProfileSectionKey) => void;
}

export const ProfileSectionRail = ({ active, onSelect }: ProfileSectionRailProps) => {
  const { missingSections, completedSections } = useProfileCompletion();

  const missingAnchors = new Set(missingSections.map((s) => s.anchor));
  const completedAnchors = new Set(completedSections.map((s) => s.anchor));

  const statusFor = (anchors: string[]): Status => {
    const tracked = anchors.filter(
      (a) => missingAnchors.has(a) || completedAnchors.has(a)
    );
    if (tracked.length === 0) return "optional";
    return tracked.every((a) => !missingAnchors.has(a)) ? "complete" : "missing";
  };

  return (
    <>
      {/* Desktop vertical rail */}
      <nav className="dc-card hidden lg:block p-3">
        <ul className="space-y-1">
          {PROFILE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.key === active;
            return (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => onSelect(section.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-muted/60 text-primary font-medium"
                      : "text-foreground hover:bg-muted/30"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 truncate">{section.label}</span>
                  <StatusIndicator status={statusFor(section.anchors)} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile horizontal scrollable bar */}
      <nav className="lg:hidden -mx-4 px-4 overflow-x-auto">
        <ul className="flex gap-2 w-max pb-1">
          {PROFILE_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = section.key === active;
            return (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => onSelect(section.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-white/30 text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {section.label}
                  <StatusIndicator status={statusFor(section.anchors)} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
