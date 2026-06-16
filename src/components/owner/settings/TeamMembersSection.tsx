import { useState } from "react";
import { Copy, Trash2, UserPlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTeamMembers,
  useTeamInvitations,
  useInviteMember,
  useRevokeInvitation,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/useTeamMembers";

const roleLabel = (r: "owner" | "admin") => (r === "admin" ? "Admin" : "Owner");

export const TeamMembersSection = () => {
  const { user } = useAuth();
  const { data: members = [], isLoading: lm } = useTeamMembers();
  const { data: invitations = [], isLoading: li } = useTeamInvitations();
  const invite = useInviteMember();
  const revoke = useRevokeInvitation();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin">("owner");
  const [linkDialog, setLinkDialog] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; email: string } | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) return;
    const res = await invite.mutateAsync({ email: email.trim(), role });
    setEmail("");
    setRole("owner");
    setInviteOpen(false);
    setLinkDialog(res.accept_url);
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiato");
  };

  return (
    <div className="space-y-6">
      <div className="dc-card p-6 md:p-8 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-tenor uppercase tracking-wide text-lg text-foreground">
              Gestione team
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Invita altri membri dello staff e gestisci i loro ruoli.
            </p>
          </div>
          <Button onClick={() => setInviteOpen(true)} className="rounded-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Invita membro
          </Button>
        </div>

        {/* Active members */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Membri attivi</h4>
          {lm ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nessun membro trovato.</p>
          ) : (
            <div className="divide-y border rounded-2xl overflow-hidden">
              {members.map((m) => {
                const isSelf = m.user_id === user?.id;
                return (
                  <div
                    key={m.user_id}
                    className="flex items-center gap-3 px-4 py-3 flex-wrap"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.last_sign_in_at
                          ? `Ultimo accesso ${new Date(m.last_sign_in_at).toLocaleDateString("it-IT")}`
                          : "Mai effettuato accesso"}
                        {isSelf && " · Tu"}
                      </p>
                    </div>
                    <Select
                      value={m.role}
                      onValueChange={(v) =>
                        updateRole.mutate({ user_id: m.user_id, new_role: v as any })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSelf}
                      onClick={() => setRemoveTarget({ id: m.user_id, email: m.email })}
                      title={isSelf ? "Non puoi rimuovere te stesso" : "Rimuovi membro"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending invitations */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Inviti in sospeso</h4>
          {li ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nessun invito in sospeso.</p>
          ) : (
            <div className="divide-y border rounded-2xl overflow-hidden">
              {invitations.map((inv) => {
                const url = `${window.location.origin}/accept-invitation?token=${inv.token}`;
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Scade il {new Date(inv.expires_at).toLocaleDateString("it-IT")}
                      </p>
                    </div>
                    <Badge variant="secondary">{roleLabel(inv.role)}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyLink(url)}
                      title="Copia link di invito"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revoke.mutate(inv.id)}
                      title="Revoca invito"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invita un nuovo membro</DialogTitle>
            <DialogDescription>
              Riceverai un link di invito da inviare al nuovo membro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@agenzia.it"
              />
            </div>
            <div className="space-y-2">
              <Label>Ruolo</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner — accesso al backoffice</SelectItem>
                  <SelectItem value="admin">
                    Admin — accesso completo e gestione team
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleInvite} disabled={invite.isPending}>
              {invite.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crea invito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link dialog (post-invite) */}
      <Dialog open={!!linkDialog} onOpenChange={(o) => !o && setLinkDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invito creato</DialogTitle>
            <DialogDescription>
              Condividi questo link con il nuovo membro. Il link scade tra 7 giorni.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={linkDialog ?? ""} readOnly />
            <Button onClick={() => linkDialog && copyLink(linkDialog)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setLinkDialog(null)}>Chiudi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rimuovere il membro?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget?.email} perderà l'accesso al backoffice. L'azione è
              irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeTarget) removeMember.mutate(removeTarget.id);
                setRemoveTarget(null);
              }}
            >
              Rimuovi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
