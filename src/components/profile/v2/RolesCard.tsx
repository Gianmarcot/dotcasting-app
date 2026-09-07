import { useState } from "react";
import { Tag } from "lucide-react";
import { TALENT_ROLES, TALENT_ROLE_GROUPS } from "@/lib/profileOptions";
import {
  GroupHeading,
  RolePill,
  SectionCard,
  SectionDivider,
} from "@/components/profile/fields/FormFields";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProfileForm } from "./ProfileFormContext";
import {
  PHYSICAL_FIELD_LABELS,
  visiblePhotoCategories,
  visiblePhysicalFields,
  visibleVideoCategories,
} from "@/lib/roleVisibility";
import { getCategoryLabel } from "@/lib/mediaCategories";
import { isAdultBirthDate } from "@/lib/guardianship";

interface LostItems {
  photos: string[];
  videos: string[];
  fields: string[];
}

const hasLoss = (lost: LostItems) =>
  lost.photos.length + lost.videos.length + lost.fields.length > 0;

export const RolesCard = () => {
  const { arr, set, str } = useProfileForm();
  const roles = arr("p", "talent_categories");
  const gender = str("p", "gender") || null;
  const isAdult = isAdultBirthDate(str("p", "birth_date") || null);

  const [pending, setPending] = useState<{ role: string; next: string[]; lost: LostItems } | null>(
    null
  );

  const diff = (next: string[]): LostItems => {
    const ctx = { isAdult, gender };
    const removed = (before: string[], after: string[]) =>
      before.filter((k) => !after.includes(k));
    return {
      photos: removed(visiblePhotoCategories(roles), visiblePhotoCategories(next)).map(
        getCategoryLabel
      ),
      videos: removed(visibleVideoCategories(roles), visibleVideoCategories(next)).map(
        getCategoryLabel
      ),
      fields: removed(
        visiblePhysicalFields({ roles, ...ctx }),
        visiblePhysicalFields({ roles: next, ...ctx })
      ).map((k) => PHYSICAL_FIELD_LABELS[k] ?? k),
    };
  };

  const toggle = (role: string) => {
    if (!roles.includes(role)) {
      set("p", "talent_categories", [...roles, role]);
      return;
    }
    const next = roles.filter((r) => r !== role);
    const lost = diff(next);
    if (hasLoss(lost)) {
      setPending({ role, next, lost });
      return;
    }
    set("p", "talent_categories", next);
  };

  const confirmRemoval = () => {
    if (pending) set("p", "talent_categories", pending.next);
    setPending(null);
  };

  const lines = pending
    ? [
        pending.lost.photos.length
          ? `Foto: ${pending.lost.photos.join(", ")}`
          : null,
        pending.lost.videos.length ? `Video: ${pending.lost.videos.join(", ")}` : null,
        pending.lost.fields.length
          ? `Dati del profilo: ${pending.lost.fields.join(", ")}`
          : null,
      ].filter(Boolean)
    : [];

  return (
    <>
      <SectionCard icon={<Tag strokeWidth={1} />} title="Ruoli e talenti">
        {TALENT_ROLE_GROUPS.map((group, index) => (
          <div key={group.key}>
            {index > 0 && <SectionDivider />}
            <GroupHeading>{group.label}</GroupHeading>
            <div className="flex flex-wrap gap-2">
              {TALENT_ROLES[group.key].map((role) => (
                <RolePill
                  key={role}
                  label={role}
                  selected={roles.includes(role)}
                  onToggle={() => toggle(role)}
                />
              ))}
            </div>
          </div>
        ))}
      </SectionCard>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alcune sezioni non saranno più visibili</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Togliendo «{pending?.role}» queste sezioni smetteranno di comparire nel tuo
                  profilo:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {lines.map((line) => (
                    <li key={line as string}>{line}</li>
                  ))}
                </ul>
                <p>
                  Nulla viene eliminato: i file e i dati già inseriti restano salvati e tornano
                  disponibili se riselezioni il ruolo.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantieni il ruolo</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoval}>Togli il ruolo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
