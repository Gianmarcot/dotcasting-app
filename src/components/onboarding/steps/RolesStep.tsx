import { TALENT_ROLES, TALENT_ROLE_GROUPS } from "@/lib/profileOptions";
import {
  GroupHeading,
  RolePill,
  SectionDivider,
} from "@/components/profile/fields/FormFields";

export const RolesStep = ({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (role: string) => void;
}) => (
  <div>
    {TALENT_ROLE_GROUPS.map((group, index) => (
      <div key={group.key}>
        {index > 0 && <SectionDivider />}
        <GroupHeading>{group.label}</GroupHeading>
        <div className="flex flex-wrap gap-2">
          {TALENT_ROLES[group.key].map((role) => (
            <RolePill
              key={role}
              label={role}
              selected={selected.includes(role)}
              onToggle={() => onToggle(role)}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);
