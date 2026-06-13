---
Task ID: 2
Agent: Main Agent
Task: Fix Unicode rendering issues, un-omit diagrams, upgrade archon gates, add pronunciations

Work Log:
- Diagnosed Unicode rendering issues from screenshots: Greek ciphers, symbols, middle dots showing as raw escape sequences
- Root cause: Greek Unicode characters in SVG text elements and HTML not rendering properly with loaded fonts
- Replaced ALL Greek cipher names with Latin transliterations (e.g., "Αβρασαξ" → "Abrasax")
- Replaced Unicode symbols (⚔, ✠, ≋, ▲, etc.) with actual SVG shapes (path-based crosses)
- Replaced Greek header subtitle with Latin transliteration "Biblos tou Ieu"
- Changed middle dots from \u00b7 to &middot; HTML entities
- Added pronunciation guides for ALL 60 treasury Fathers, ciphers, watchers, and passwords
- Added pronunciations to Archon gate names and passwords (e.g., [PAR-ah-faks], [EE-ah-oh SAH-bah-oth])
- Un-omitted all diagrams - all 60 treasuries now show seal diagrams (was: only Jeu 2-28 had diagrams)
- Upgraded Archon Gates: added arch-shaped gate outlines, individual seal complexity, pronunciation guides for gate names and passwords
- Added .pron and .watcher-pron CSS classes for pronunciation styling

Stage Summary:
- Zero Unicode escape sequences visible anywhere on the site
- All special characters render properly as intended glyphs
- All 60 treasuries have seal diagrams
- Pronunciations added for Father names, ciphers, watchers, passwords, archon gates
- Archon gates upgraded with arch shapes, progressive seal complexity, and pronunciations
- Build passes, all browser tests pass
