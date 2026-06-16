---
name: Team management
description: Multi-user team invitations and role management for staff in /owner/settings Account tab
type: feature
---
Only Admins can manage team. Owners see only personal account (email + password change).

- Table `team_invitations` (email, role owner|admin, token, expires_at 7d, status pending|accepted|revoked|expired). RLS: only admins manage. Unique pending email index.
- RPCs: `get_invitation_by_token` (public), `list_team_members`, `update_member_role`, `remove_team_member` (admin-only, block removing last admin / self).
- Edge functions: `invite-team-member` (admin creates invite, returns accept URL — email infra not configured so URL is shown in dialog for copy/share), `accept-team-invitation` (public, creates user via admin API, assigns role).
- UI: `TeamMembersSection` rendered inside `AccountSection` only when `userRole === 'admin'`.
- Route `/accept-invitation?token=...` (public) for new member to set password.
