# Mobile check of the "Modifica shortlist" window

## Goal
Make sure the "Modifica shortlist" window works well on a phone (390px wide) and on a tablet (768px), in every part.

## What I check (in the preview, without saving anything to the real shortlist)
1. **Opening and frame**: the window slides up from the bottom, fills the screen, nothing spills sideways, the "Chiudi" button is reachable and doesn't cover the title.
2. **Database / Shortlist tabs**: switching between them, readable counters, no content hidden.
3. **Search, Filtri, requirement pills**: the field fills the full width, the pills wrap without overflow, the filter panel opens inside the screen, "Solo CF validi" and Reset sit at the bottom without overlapping.
4. **Ordering and List/Grid view**: the controls stay on one row or wrap neatly; the grid uses 2 columns, with no names cut off badly.
5. **List rows**: photo, name (new 16px), city/age, CF/Minore labels and requirements indicator laid out without overlapping; touch areas of at least 44px.
6. **"Seleziona tutti"**: visible and easy to tap.
7. **Dragging on touch**: a long press doesn't block scrolling; on a phone the shortlist sits in another tab, so dragging doesn't make sense there, and I'd turn it off below 1024px (you add with the tick).
8. **Save bar and notifications**: the bar stays visible above the phone's bottom edge (safe area), doesn't cover the last row, and the notifications appear above the bar.
9. **Exit-without-saving warning**: the two buttons stacked fit inside the screen.
10. **Talent preview**: from the enlarge icon or a tap on the row, it opens in full screen and closes properly.

## Expected result
Fixes only where the check finds a problem, then before/after screenshots at 390px and 768px. At the end I'll give you a short list of what I fixed and what was already fine.

## Technical details
- Playwright with a 390x844 and 768x1024 viewport, session restored, role with requirements.
- Likely areas: `TalentPicker.tsx` (toolbar, DropArea, `pb` for the SaveBar plus `env(safe-area-inset-bottom)`), `TalentFilterBar.tsx`, `TalentRow.tsx`, `SaveBar`, `.dc-dialog-fullscreen`.
- Turn off `TouchSensor`/drag when the shortlist tab is separate (< lg).
- No real saving during the tests (close with "Esci senza salvare").
