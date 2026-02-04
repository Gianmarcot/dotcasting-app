import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, Banknote } from "lucide-react";
import { format } from "date-fns";
import { it as itLocale } from "date-fns/locale";

interface CastingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  casting: {
    id: string;
    title: string;
    category: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    locations?: string[] | null;
    compensation_type?: string | null;
    compensation_amount?: number | null;
    currency?: string | null;
    company: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export const CastingDetailDialog = ({ open, onOpenChange, casting }: CastingDetailDialogProps) => {
  if (!casting) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{casting.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category & Company */}
          <div className="flex flex-wrap items-center gap-2">
            {casting.category && (
              <Badge variant="secondary">{casting.category}</Badge>
            )}
            {casting.company && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {casting.company.name}
              </span>
            )}
          </div>

          {/* Dates */}
          {(casting.start_date || casting.end_date) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {casting.start_date && format(new Date(casting.start_date), "d MMMM yyyy", { locale: itLocale })}
                {casting.start_date && casting.end_date && " - "}
                {casting.end_date && format(new Date(casting.end_date), "d MMMM yyyy", { locale: itLocale })}
              </span>
            </div>
          )}

          {/* Locations */}
          {casting.locations && casting.locations.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5" />
              <span>{casting.locations.join(", ")}</span>
            </div>
          )}

          {/* Compensation */}
          {casting.compensation_type && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span>
                {casting.compensation_type}
                {casting.compensation_amount && ` - ${casting.compensation_amount} ${casting.currency || "EUR"}`}
              </span>
            </div>
          )}

          {/* Description */}
          {casting.description && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Descrizione</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {casting.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
