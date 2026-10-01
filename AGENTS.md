# AGENTS.md

## Styling

- Primitive colors declared as raw CSS variables (`--ink`, `--cream`, `--cream-dark`, `--grey-*`, `--brand-*`, mapped in `tailwind.config.ts` as `var(--x)`) generate `text-cream`, `bg-ink`, etc. but NOT the slash opacity variants (`text-cream/70` is never emitted, so the element silently falls back to inherited color). Use a plain token class plus an `opacity-*` utility (`text-cream opacity-70 hover:opacity-100`) or a real Tailwind color (`text-white/70`, as `ModalNavBar` does). Why: alpha modifiers need parseable channels, and `var(--x)` provides none.
- Admin toolbars/filter bars sitting directly on the cream page background wrap their fields in `<Surface variant="raised">` (white `--field-bg`, transparent wrapper). Use it for any field that would otherwise be cream-on-cream; inside white cards keep the default surface. Why: fields on the page background need contrast, and the variant propagates to Select portal menus via React context.
- Round avatars crop with `object-[50%_25%]` (default in `AvatarImage`; add it to any raw round `<img>` avatar). Why: faces usually sit above the photo centre.

## Layout

- Admin page content is capped at `max-w-[1600px]` on a wrapper that also carries `@container` (`OwnerLayout`). Responsive layouts inside admin pages choose column counts with container variants (`@[1280px]:grid-cols-5`, `@[960px]:grid-cols-4`) instead of viewport breakpoints. Why: the sidebar and the width cap make the viewport a poor proxy for the space a page actually has.
- Container-query utilities need the `@tailwindcss/container-queries` plugin, registered in `tailwind.config.ts`; Tailwind 3.4 core never emits `container-type`, so `@container` and `@[…]:` variants silently do nothing without it.
- Talent profile previews share one detail implementation with layout variants: fullscreen uses side-by-side media/data, while the square-edged side drawer stacks a `100dvh` media section above auto-height data. The detail modal owns the fixed bottom action bar (its width is the drawer width) and publishes its measured height as `--dc-bar-h`, which the media and data sections add to their bottom padding. Why: profile content and media behavior must remain identical across talent and admin previews, and a fixed action bar must never cover the media thumbnails.
- Talent and admin profile editing share the v2 single-column form; `ProfileFormProvider` selects self-service or external-profile data through an optional profile ID, while admin-only controls are layered onto the shared cards. Why: fields, validation, and media behavior must not diverge between the two roles.
