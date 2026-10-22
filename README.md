# FlowDeck

A fast, private, local-first project manager. One HTML file, one script, one stylesheet — no build step, no backend, no tracking. Installs as a PWA and works offline.

## What it does

- **One-line quick add** — press `⌘K` / `Ctrl K` and type `Ship pricing page fri 2-4pm #design !high @mk +launch`. Dates, times, durations, project, priority, people, tags and repeats are parsed out.
- **Auto-scheduling** — give a date without a time and FlowDeck drops the task into the first free slot. **Plan my day** (`P`) pulls overdue and backlog work into today's gaps, highest priority first.
- **Board** — To do / In progress / Review / Done with drag-and-drop (mouse anywhere on the card, touch via the ⋮⋮ handle), per-project filter.
- **Schedule** — week strip, hour timeline with a live "now" line; tap an empty hour to add a task there.
- **Focus timer** — 25m, 50m or task-length sessions; real focus time feeds the Performance view.
- **Performance** — focus heatmap (month/year) or daily bars (week), completion rate, streak, time by project.
- **Tasks** — notes, subtasks, tags, members, priority, status, drafts, recurring (daily / weekdays / weekly), duplicate, undo on every destructive action.
- **Reminders** — optional start-time notifications while the app is open.
- **Dark mode**, full desktop layout with sidebar (≥ 900px), phone layout below.
- **Command palette** for navigation, search across tasks/notes/tags, and every action.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl K`, `/` | Command palette & quick add (`⇧↵` opens the full form) |
| `N` | New task |
| `P` | Plan my day |
| `1`–`5` | Home, Board, Schedule, Performance, Projects |
| `T` | Toggle dark mode |
| `F` | Pause / resume focus |
| `?` | Shortcuts & syntax |

## Quick-add syntax

| Write | Means |
| --- | --- |
| `today`, `tomorrow`, `fri`, `next monday`, `24 oct`, `in 3 days`, `2026-11-02`, `tonight` | date |
| `3pm`, `at 9`, `14:30`, `2-4pm`, `11-1pm`, `noon` | time / range |
| `for 45m`, `for 2h` | duration |
| `#design`, `#ds` | project (fuzzy, initials work) |
| `!high`, `!`, `p1` · `!low`, `p3` | priority |
| `@mk`, `@me` | assignee |
| `+research` | tag |
| `every weekday`, `daily`, `every fri` | repeat |

## Data & privacy

Everything lives in your browser's `localStorage` (`flowdeck.v2`). Data from v1 (`flowdeck.v1`) is migrated automatically on first load. Export/Import JSON from **Projects → settings**. Imported files are validated and sanitised (colours, lengths, enums) before use, all text is HTML-escaped on render, and a strict Content-Security-Policy blocks inline/third-party scripts.

Clearing site data erases your projects — export regularly.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

The service worker only registers on `https://` or `localhost`.
