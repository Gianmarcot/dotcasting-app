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
import { fiscalStatusOf, isFiscalStatusProblematic } from "@/lib/fiscalStatus";
import { isMinorBirthDate } from "@/lib/guardianship";
import type { RoleTalentWithProfile } from "@/hooks/useRoleTalents";
import { talentName } from "./RoleShortlistRow";

interface Props {
  talents: RoleTalentWithProfile[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: () => void;
}

/** Conferma "Ingaggia": elenco dei selezionati e avvisi su codice fiscale e minori. */
export const EngageDialog = ({ talents, open, onOpenChange, onConfirm }: Props) => {
  const noFiscal = talents.filter((t) => isFiscalStatusProblematic(fiscalStatusOf(t.profile))).length;
  const minors = talents.filter((t) => isMinorBirthDate(t.profile?.birth_date)).length;
  const warnings = [
    noFiscal > 0 && `${noFiscal} ${noFiscal === 1 ? "talent non ha" : "talent non hanno"} un codice fiscale valido.`,
    minors > 0 && `${minors} ${minors === 1 ? "talent è minore" : "talent sono minori"}: l'ingaggio passa dal tutore.`,
  ].filter(Boolean) as string[];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Ingaggiare {talents.length} {talents.length === 1 ? "talent" : "talent"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            L'ingaggio verrà pubblicato e comparirà in "I miei casting" di ciascun talent.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-foreground">
          {talents.map((t) => (
            <li key={t.id}>{talentName(t.profile)}</li>
          ))}
        </ul>
        {warnings.length > 0 && (
          <div className="space-y-1 rounded-2xl bg-[#C88500]/15 p-4 text-sm text-[#C88500]">
            {warnings.map((w) => (
              <p key={w}>{w}</p>
            ))}
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{noFiscal > 0 ? "Ingaggia comunque" : "Ingaggia"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
