# AGENTS.md

## Styling

- Primitive colors declared as raw CSS variables (`--ink`, `--cream`, `--cream-dark`, `--grey-*`, `--brand-*`, mapped in `tailwind.config.ts` as `var(--x)`) generate `text-cream`, `bg-ink`, etc. but NOT the slash opacity variants (`text-cream/70` is never emitted, so the element silently falls back to inherited color). Use a plain token class plus an `opacity-*` utility (`text-cream opacity-70 hover:opacity-100`) or a real Tailwind color (`text-white/70`, as `ModalNavBar` does). Why: alpha modifiers need parseable channels, and `var(--x)` provides none.
- Admin toolbars/filter bars sitting directly on the cream page background wrap their fields in `<Surface variant="raised">` (white `--field-bg`, transparent wrapper). Use it for any field that would otherwise be cream-on-cream; inside white cards keep the default surface. Why: fields on the page background need contrast, and the variant propagates to Select portal menus via React context.
- Round avatars crop with `object-[50%_25%]` (default in `AvatarImage`; add it to any raw round `<img>` avatar). Why: faces usually sit above the photo centre.
