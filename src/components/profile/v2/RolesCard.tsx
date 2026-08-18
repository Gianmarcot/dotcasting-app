import { Tag } from "lucide-react";
import { TALENT_ROLES, TALENT_ROLE_GROUPS } from "@/lib/profileOptions";
import {
  GroupHeading,
  RolePill,
  SectionCard,
  SectionDivider,
} from "@/components/profile/fields/FormFields";
import { useProfileForm } from "./ProfileFormContext";

export const RolesCard = () => {
  const { arr, set } = useProfileForm();
  const roles = arr("p", "talent_categories");

  const toggle = (role: string) => {
    const next = roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role];
    set("p", "talent_categories", next);
  };

  return (
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
  );
};
