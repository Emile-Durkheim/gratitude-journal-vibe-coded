# Gratitude Journal

A minimal, installable gratitude journal. A month calendar, three prompts per day, and nothing leaves your device.

- **Calendar:** days you've written in are highlighted; tap any past day to write or edit it.
- **Prompts per day, your choice:** pick any number from a research-based library (see [RESEARCH.md](RESEARCH.md)) or write your own. Past entries keep the prompts they were written with.
- **Weekly review:** a second set of prompts for looking back on the week and ahead to the next. It opens from the calendar, and from every Sunday, where the calendar highlights it. Sunday still has the normal daily prompts.
- **Local only:** everything is stored in your browser's IndexedDB, and the app asks the browser for persistent storage. No accounts, no server, no tracking.
- **Backup:** export your journal as a JSON file and import it on another device (entries merge, newer edits win).
- **Bright design:** Tailwind CSS and daisyUI with a custom "sunny" theme (see `src/index.css`).
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

The app is served from `/<repo-name>/`. The workflow passes the repo name as `BASE_PATH`, so renaming the repo needs no code change (locally the default is `/gratitude-journal-vibe-coded/`).
