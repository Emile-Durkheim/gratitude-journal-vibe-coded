# Gratitude Journal

A minimal, installable gratitude journal. A month calendar, three prompts per day, and nothing leaves your device.

- **Calendar:** days you've written in are highlighted; tap any past day to write or edit it.
- **Three prompts a day:** answers save automatically as you type.
- **Custom prompts:** change the wording of the three prompts in Settings. Past entries keep the prompts they were written with.
- **Local only:** everything is stored in your browser's `localStorage`. No accounts, no server, no tracking.
- **Backup:** export your journal as a JSON file and import it on another device (entries merge, newer edits win).
- **Works offline** and can be installed to your home screen.

## Development

```sh
npm install
npm run dev     # local dev server
npm test        # unit tests
npm run build   # production build in dist/
```

## Deployment

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`. In the repo's **Settings → Pages**, the source must be **GitHub Actions**.

The app is served from `/gratitude-journal/`; if you rename the repo, update `base` in `vite.config.ts`.
