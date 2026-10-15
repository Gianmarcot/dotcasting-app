# AGENTS.md

## Toasts

- All toasts use sonner (`import { toast } from "sonner"`), styled globally in `src/components/ui/sonner.tsx` (dark top-right, red variant for errors); the legacy shadcn `use-toast`/`toaster`/`toast` files are deleted and must not be reintroduced. Why: consistent toasts across roles.

## Styling

- Raw color variables (`--ink`, `--cream`, `--cream-dark`, `--grey-*`, `--brand-*`, mapped as `var(--x)` in `tailwind.config.ts`) support plain classes but NOT slash opacity (`text-cream/70` silently fails). Use token classes with `opacity-*` or parseable Tailwind colors. Why: raw variables cannot generate alpha modifiers.
- Admin toolbars/filter bars sitting directly on the cream page background wrap their fields in `<Surface variant="raised">` (white `--field-bg`, transparent wrapper). Use it for any field that would otherwise be cream-on-cream; inside white cards keep the default surface. Why: contrast and portal consistency.
- Round avatars crop with `object-[50%_25%]` (`AvatarImage` default; also use on raw avatars). Why: faces usually sit above the photo centre.

## Layout

- Admin page content is capped at `max-w-[1600px]` on a wrapper that also carries `@container` (`OwnerLayout`). Responsive layouts inside admin pages choose column counts with container variants (`@[1280px]:grid-cols-5`, `@[960px]:grid-cols-4`) instead of viewport breakpoints. Why: actual content width governs layout.
- `@container` and `@[…]:` variants need the `@tailwindcss/container-queries` plugin (registered in `tailwind.config.ts`); without it Tailwind 3.4 emits no `container-type` and they silently do nothing.
- Talent profile previews share one detail implementation: fullscreen is side-by-side, the square-edged side drawer stacks `100dvh` media above data. The modal owns the fixed bottom bar and publishes its height as `--dc-bar-h` for bottom padding. Why: consistent previews and unobstructed thumbnails.
- Talent and admin profile editing share the v2 single-column form; `ProfileFormProvider` selects self-service or external-profile data through an optional profile ID, while admin-only controls are layered onto the shared cards. Why: prevent role divergence.
- Profile photos open through the shared `MediaLightbox`; owner/admin contexts enable its private rating panel, while talent contexts keep ratings hidden. Why: consistent inspection and private ratings.
- Talent selection flows (shortlist picker, round wizard step 1) render `TalentSelectionPanel`, a modal-agnostic two-column panel that is generic on the source identifier (profile id or role_talent id) and returns an ordered selection; `TalentPicker` and `RoundWizardDialog` only wrap it in `FullscreenSheet`. Round talent order persists in `casting_round_talents.position` (fallback `created_at`); role compatibility scoring lives in `src/lib/roleMatch.ts`. Why: shared selection UI and persistent round order.
- The casting details drawer (`CastingSidePanel`) is window-edge flush: its own `border-l border-border` is the separator (no rounded corners even in overlay), it spans `100dvh` and reaches the window's right edge via `--panel-extra`, with content capped at 352px. Open state lives in `useCastingDetailsPanel` so the host page can show a header action while closed; host pages cancel the admin wrapper padding (`md:-mt-16 md:-mb-8` root, `md:pt-16` content column). Why: the drawer must reach window edges.
- List rows sharing the page with the casting details drawer (`RoleCard`) wrap in `@container` and switch stacked/inline layouts with `@[640px]:` variants, never `md:`. Why: drawer reduces row width. Avatar stacks come from the shared `TalentAvatarStack`: `md` inline, `sm` when stacked, toggled by `@[640px]:` display classes.
- The owner sidebar has a collapsed mode (72px, icons with tooltips, favorites hidden) stored separately from the expanded width (256–384px) in `useOwnerSidebarWidth`; toggle via the edge chevron (`CastingSidePanel` style) or the 164px drag snap; double-click resets width. Why: states persist, so expanding restores the chosen width.
- Shortlist state is derived: engaged = `published_to_talent`, excluded = `role_talents.excluded`; `talent_status`/`company_status` are deprecated. Requirements: per-item met/unmet/missing via `evaluateRequirements` (`roleMatch.ts`). Why: actions drive state.

## Menu surfaces

- All menu families use shared `.dc-menu` anatomy and explicit `data-surface` from React context on portal content; selects, search and filters are normal, actions compact. Why: portals must preserve the trigger surface.
- Search/multiple values use `SearchSelect` (Popover + Command), never nested Select; action submenus use `MenuSubLevel` to cap depth at two levels. Why: preserve accessible selection and navigation semantics.
- Interactive menu regression scenarios live in `MenuScenarios`, mounted in Design System. Why: exercise portals, dark surfaces, overflow and dialogs without changing live data.
