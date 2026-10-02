import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Send } from "lucide-react";
import { TalentWithAttributes } from "@/hooks/useTalents";
import { InviteTalentDialog } from "@/components/invitations/InviteTalentDialog";
import { TalentDetailModal } from "@/components/talents/detail/TalentDetailModal";

interface Props {
  talent: TalentWithAttributes | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
  /** Elenco per navigare tra i profili con le frecce senza chiudere */
  talents?: TalentWithAttributes[];
}

const buildName = (t: TalentWithAttributes) => {
  if (t.stage_name) return t.stage_name;
  return [t.first_name, t.last_name].filter(Boolean).join(" ") || "Senza nome";
};

export const TalentPreviewDrawer = ({ talent: initialTalent, open, onOpenChange, extraAction, talents }: Props) => {
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const list = talents && initialTalent && talents.some((t) => t.id === initialTalent.id) ? talents : null;
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (list && initialTalent) setIndex(list.findIndex((t) => t.id === initialTalent.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTalent?.id, open]);
  const talent = list ? list[index] ?? initialTalent : initialTalent;
  if (!talent) return null;

  const name = buildName(talent);

  return (
    <>
      <TalentDetailModal
        profileIds={list ? list.map((t) => t.id) : [talent.id]}
        index={list ? index : undefined}
        onIndexChange={list ? setIndex : undefined}
        open={open}
        onOpenChange={onOpenChange}
        variant="side"
        showAllMedia
        isOwnerView
        footer={
          <>
            <Button
              size="lg"
              iconPosition="left"
              className="flex-1"
              onClick={() => {
                onOpenChange(false);
                navigate(`/owner/talents/${talent.id}/edit`);
              }}
            >
              <Pencil className="h-5 w-5" />
              Modifica profilo
            </Button>
            {extraAction ? (
              <Button className="flex-1" size="lg" iconPosition="left" variant="secondary" onClick={extraAction.onClick}>
                {extraAction.icon}
                <span>{extraAction.label}</span>
              </Button>
            ) : null}
            <Button className="flex-1" size="lg" iconPosition="left" variant="secondary" onClick={() => setInviteOpen(true)}>
              <Send className="h-5 w-5" />
              Aggiungi a un casting
            </Button>
          </>
        }
      />

      <InviteTalentDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        talentUserId={talent.user_id}
        talentName={name}
        elevated
      />
    </>
  );
};

