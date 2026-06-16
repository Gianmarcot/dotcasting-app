import { useState } from "react";
import { Loader2, Lock, LockOpen } from "lucide-react";
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
  const { data: hasPassword, isLoading } = useCastingClientPasswordStatus(castingId);
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
    <div className="dc-card p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        {hasPassword ? (
          <Lock className="h-4 w-4 text-[#729128]" />
        ) : (
          <LockOpen className="h-4 w-4 text-muted-foreground" />
        )}
        <h3 className="text-sm font-medium">Password cliente</h3>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            {hasPassword ? "Impostata" : "Nessuna password"}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Comunica la password al cliente insieme al link. Senza password il cliente
        vede ma non può confermare i talent.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 space-y-1">
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
        <div className="flex gap-2">
          <Button onClick={save} disabled={setPwd.isPending || !value}>
            {setPwd.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Salva
          </Button>
          {hasPassword && (
            <Button
              variant="outline"
              onClick={remove}
              disabled={setPwd.isPending}
            >
              Rimuovi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
