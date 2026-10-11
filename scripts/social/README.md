# Social autopilot

Makes a week of Pinterest and Instagram posts from the recipes, and queues
them in Buffer. The plan behind it is the "Solo Supper social autopilot" doc.

## What it makes each week

| When (UK time) | Where | What |
| --- | --- | --- |
| Every day, 20:00 | Pinterest | A recipe pin, or a use-up pin on Wednesday and Saturday |
| Tuesday, 18:30 | Instagram | A 5-slide carousel: the dish, ingredients, method, the pack it shares with another recipe, and a call to action |
| Friday, 18:30 | Instagram, and Pinterest at 20:00 | An 8-second vertical video: Veo animates the recipe photo, then the title and link are added |

Recipes are not repeated within 12 weeks (`social/history.json`). The links
page for the Instagram bio, `/links/`, is rewritten each week.

## Files

- `make-week.js` makes the posts. `plan.js` picks them, `copy.js` writes the text
  (Gemini, with templates as a fallback), `render.js` draws the images and
  `video.js` makes the video (Veo, with a photo zoom as a fallback).
- `publish-week.js` queues a week in Buffer; `--check` only reads Buffer's settings.
- `social-weekly.yml` is the GitHub Actions workflow. GitHub only runs it from
  `.github/workflows/`, so copy it there once.

Images and videos are not kept on `main`. They go to the `social-media` branch
(the last five weeks only), which Cloudflare Pages publishes at
https://social-media.solo-supper.pages.dev, so Buffer can fetch them.

## Settings (GitHub, Settings > Secrets and variables > Actions)

- Secrets: `GEMINI_API_KEY`, `BUFFER_API_KEY`.
- Variable `SOCIAL_AUTOPUBLISH`: set to `true` when the Saturday run should queue
  posts in Buffer straight away. Until then it only makes a preview.
- Variable `SOCIAL_MEDIA_BASE` (optional): a different address for the media.

## Running it by hand

Actions > Social autopilot > Run workflow, then pick a mode:
`preview`, `publish`, `queue-existing` (queue a week already made) or
`check-buffer`.

Locally: `cd scripts/social && npm install`, then
`node make-week.js --out ../../social-media-out --week 2026-10-19`.
