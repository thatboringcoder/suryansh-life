# Your little corner of the internet

The site is built with Astro and deployed from `main` by the existing Cloudflare Pages project to https://suryansh.life.

## Publish a thought
Create `src/content/blog/my-post/index.md`:

```md
---
title: A title for your thought
description: A short introduction.
pubDate: 2026-10-31
tags: [life]
draft: false
---
Write your post here in Markdown.
```

Set `draft: true` to keep a post off the published site.

## Add work
Create `src/content/projects/my-project/index.md`:

```md
---
title: My project
description: What you are making.
date: 2026-10-31
category: Experiment
tags: [code]
---
The story behind the project.
```

Optional `repoUrl` and `demoUrl` fields add external links. The old Minrock example is preserved at its original URL but omitted from the personal Work list.

## The walking world
`src/scripts/journey.ts` draws the original, stylized school silhouettes. These are artistic interpretations, not replicas of the actual campuses. Scroll, use left/right keys, or select a chapter. Motion respects the visitor's reduced-motion setting. `src/components/life/Sketch.astro` contains the original animated writing and wired-headphone illustrations.

Run `npm ci`, `npm run check`, and `npm run build` before publishing. Use `npm run dev` for local previews. Changes pushed to `main` deploy automatically through the existing Cloudflare GitHub integration.
