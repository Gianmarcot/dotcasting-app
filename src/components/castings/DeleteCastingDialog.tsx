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
import { it } from "@/lib/i18n";
import type { CastingWithRelations } from "@/hooks/useCastings";

interface DeleteCastingDialogProps {
  casting: CastingWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteCastingDialog = ({
  casting,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteCastingDialogProps) => {
  const applicationsCount = casting?.applications?.[0]?.count ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminare questo casting?</AlertDialogTitle>
          <AlertDialogDescription>
            Stai per eliminare <strong>"{casting?.title}"</strong>.
            {applicationsCount > 0 && (
              <>
                <br />
                <span className="text-destructive">
                  Attenzione: ci sono {applicationsCount} candidature associate che verranno eliminate.
                </span>
              </>
            )}
            <br />
            Questa azione non può essere annullata.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {it.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? it.common.loading : it.common.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
