# FlowDeck template library

Each file here is one ready-to-use project plan. FlowDeck loads every file listed in `index.json`, shows it in **Start from a template**, and turns it into a dated Gantt from the start date you pick.

## Add a template

1. Create `your-template-id.json` in this folder (lowercase letters, digits and dashes only).
2. Add the file name to `index.json`.
3. Open a pull request.

You can also build the plan in FlowDeck, open its Gantt, choose **Save as template**, then **Download JSON** from the template gallery.

## Schema

```json
{
  "id": "agent-harness",
  "version": 1,
  "name": "Agent harness development",
  "icon": "🛠️",
  "color": "#2f6fb3",
  "category": "AI / Agents",
  "desc": "One or two sentences shown in the gallery.",
  "phases": [
    { "name": "Foundations", "tasks": [
      { "key": "reqs",  "title": "Use cases & guardrail policy", "days": 3, "priority": "High" },
      { "key": "arch",  "title": "Harness architecture", "days": 4, "after": ["reqs"] },
      { "key": "m-arch", "title": "Architecture approved", "milestone": true, "after": ["arch"] }
    ]}
  ]
}
```

| Field | Meaning |
| --- | --- |
| `key` | Unique id inside the template, used by `after`. |
| `days` | Duration in working days (Mon–Fri when the project skips weekends). |
| `milestone` | `true` for a zero-length checkpoint (drawn as ◆). |
| `after` | Keys this task waits for (finish → start). Omit to follow the previous task in the file; use `[]` to start on day one. |
| `offset` | Optional earliest start, in working days after the project start. |
| `priority` | `Low`, `Medium` or `High`. |
| `subtasks`, `tags`, `notes` | Optional extras copied onto each task. |

Limits: 30 phases, 400 tasks, 365 days per task. Everything is validated on load, so a malformed file is skipped rather than breaking the app.
