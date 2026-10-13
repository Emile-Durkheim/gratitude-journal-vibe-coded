# Gratitude Journal

A minimal, installable gratitude journal. Each day you write in presses a flower into this week's wreath, and nothing leaves your device.

- **Weekly wreath (home):** the current week as a ring of seven days. Each written day is a pressed flower with one petal per prompt, coloured in as you answer. Tap a day to write or edit it, or step back through earlier weeks.
- **Day page:** the week runs along the top and stays in view while you write, with the open day's flower growing petal by petal. Finishing every prompt sets off a small shower of petals. Pages slide in and out with view transitions.
- **Calendar:** the month view is one tap away, behind the calendar button.
- **Prompts per day, your choice:** pick any number from a research-based library (see [RESEARCH.md](RESEARCH.md)) or write your own. Past entries keep the prompts they were written with.
- **Weekly review:** a second set of prompts for looking back on the week and ahead to the next. It opens from the wreath and from every Sunday, and is highlighted on Sundays. Sunday still has the normal daily prompts.
- **Local only:** everything is stored in your browser's IndexedDB, and the app asks the browser for persistent storage. No accounts, no server, no tracking.
- **Backup:** export your journal as a JSON file and import it on another device (entries merge, newer edits win).
- **Built with Vue 3 and Vite:** single-file components, with motion-v for the springy petals and stamp.
- **Flower press design:** cream paper, EB Garamond for the page and Caveat handwriting for your answers on ruled lines. Tailwind CSS and daisyUI with a custom "press" theme (see `src/index.css`). Fonts are bundled, so it works offline. Animations are switched off when the system asks for reduced motion.
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
