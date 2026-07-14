import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  useCastingClientPasswordStatus,
  useSetCastingClientPassword,
} from "@/hooks/useCastingClientPassword";

interface Props {
  castingId: string;
}

export const ClientPasswordCard = ({ castingId }: Props) => {
  const { data: hasPassword } = useCastingClientPasswordStatus(castingId);
  const setPwd = useSetCastingClientPassword();
  const [value, setValue] = useState("");

  const save = async () => {
    const pwd = value.trim();
    if (pwd.length < 4) {
      toast({
        title: "Password troppo corta",
        description: "Usa almeno 4 caratteri.",
        variant: "destructive",
      });
      return;
    }
    try {
      await setPwd.mutateAsync({ castingId, password: pwd });
      setValue("");
      toast({ title: "Password salvata" });
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message, variant: "destructive" });
    }
  };

  const remove = async () => {
    try {
      await setPwd.mutateAsync({ castingId, password: null });
      setValue("");
      toast({ title: "Password rimossa" });
    } catch (e: any) {
      toast({ title: "Errore", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="dc-card p-6 space-y-4">
      <Lock className="h-5 w-5 text-foreground" />
      <div className="space-y-2">
        <h3 className="text-base font-display uppercase tracking-wider text-foreground">
          Password cliente
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Comunica la password al cliente insieme al link. Senza password il
          cliente vede ma non può confermare i talent.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="client-pwd" className="sr-only">
          Password cliente
        </Label>
        <Input
          id="client-pwd"
          type="password"
          placeholder={hasPassword ? "Nuova password" : "Imposta password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="new-password"
          
        />
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={save} disabled={setPwd.isPending || !value} size="md">
          {setPwd.isPending ? (
            <Loader2 className="animate-spin" />
          ) : null}
          Salva
        </Button>
        {hasPassword && (
          <button
            type="button"
            onClick={remove}
            disabled={setPwd.isPending}
            className="dc-link-action text-sm"
          >
            Rimuovi
          </button>
        )}
      </div>
    </div>
  );
};
