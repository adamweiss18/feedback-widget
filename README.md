# @dnosaj/feedback-widget

Drop-in floating feedback widget for React prototypes. Single `<FeedbackWidget />` component, shadow-DOM isolated, talks to the `feedback-service` backend at a URL you provide.

## Install

```bash
npm install github:dnosaj/feedback-widget
# or pin to a tag:
npm install github:dnosaj/feedback-widget#v0.1.0
```

## Use

```tsx
// app/layout.tsx (Next.js App Router)
import { FeedbackWidget } from "@dnosaj/feedback-widget";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <FeedbackWidget
          projectSlug="report-analyzer"
          apiUrl={process.env.NEXT_PUBLIC_FEEDBACK_API_URL}
          userName={session?.user?.name}           // optional
          hideOnPaths={["/login", "/legal"]}       // optional
        />
      </body>
    </html>
  );
}
```

### `.env.local`

```
NEXT_PUBLIC_FEEDBACK_API_URL=https://your-feedback-service.vercel.app
```

## Props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `projectSlug` | string | yes | Must match a row in the service's `projects` table. |
| `apiUrl` | string | at least one | Overrides `NEXT_PUBLIC_FEEDBACK_API_URL`. |
| `userName` | string | no | Pre-fills the name field. Overrides localStorage + URL param. |
| `hideOnPaths` | string[] | no | Suppress the pill on these paths. |
| `position` | `"bottom-right"` \| `"bottom-left"` | no | Default `bottom-right`. |
| `onSubmit` | `(fb) => void` | no | Called after successful submit. |

## Registering a new prototype with the service

In the service's Supabase SQL editor:

```sql
insert into projects (slug, name, allowed_origins)
values ('my-prototype', 'My Prototype', array['https://my-prototype.vercel.app']);
```

`allowed_origins` controls CORS — add every origin where the widget runs (prod URL, preview URLs, localhost).

## What's captured

Every submission includes: page URL, page path, viewport size, user-agent, timestamp, plus the text + category + optional screenshot.

## Keyboard shortcuts

- `⌘⇧F` / `Ctrl⇧F` toggles the panel
- `Esc` closes it

## Deferred to stage 2

- Pen/arrow annotation on screenshots
- Voice capture + transcription
- Three capture modes (anonymous / session pseudonyms / QR handoff)
- Claude Code auto-plan pipeline

See the design spec for the full roadmap.
