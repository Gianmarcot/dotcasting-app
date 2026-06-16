---
name: Team management
description: Multi-user team invitations and role management for staff in /owner/settings Account tab
type: feature
---
Owners and Admins manage the team. Editors do NOT have access to team management.

- Roles handled: `owner`, `admin`, `editor`. Editors get full content access (via `public.is_staff()` helper used in RLS) but cannot manage the team and cannot delete accounts.
- Table `team_invitations` (email, role owner|admin|editor, token, expires_at 7d, status pending|accepted|revoked|expired). RLS: only team managers (admin/owner) manage.
- Helpers: `is_team_manager()` = admin OR owner; `is_staff(uid)` = admin OR owner OR editor.
- RPCs: `get_invitation_by_token` (public), `list_team_members` (returns owner/admin/editor), `update_member_role`/`remove_team_member` (gated by is_team_manager, block removing last admin / self, accept owner|admin|editor as target role).
- Edge functions: `invite-team-member` (admin/owner creates invite for owner|admin|editor, returns accept URL — email infra not configured so URL is shown in dialog for copy/share), `accept-team-invitation` (public, creates user via admin API, assigns role).
- UI: `TeamMembersSection` rendered inside `AccountSection` only when `userRole === 'admin' || 'owner'`.
- Route `/accept-invitation?token=...` (public) for new member to set password.
