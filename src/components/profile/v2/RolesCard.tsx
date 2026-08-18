import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { TALENT_ROLES, TALENT_ROLE_GROUPS } from "@/lib/profileOptions";
import {
  GroupLabel,
  RolePill,
  SectionCard,
  SectionDivider,
} from "@/components/profile/fields/FormFields";
import { useProfileAutoSave } from "./useProfileAutoSave";

export const RolesCard = () => {
  const { profile, save } = useProfileAutoSave();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    setRoles(profile?.talent_categories ?? []);
  }, [profile]);

  const toggle = (role: string) => {
    const next = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
    setRoles(next);
    save({ talent_categories: next.length > 0 ? next : null });
  };

  return (
    <SectionCard icon={<Tag strokeWidth={1} />} title="Ruoli e talenti">
      {TALENT_ROLE_GROUPS.map((group, index) => (
        <div key={group.key}>
          {index > 0 && <SectionDivider className="mb-6" />}
          <GroupLabel>{group.label}</GroupLabel>
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
  );
};
