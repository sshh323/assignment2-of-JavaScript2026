# Publishing the game on GitHub (Part B)

Follow these steps once. After the first push, every `git push` automatically
runs the workflow (`.github/workflows/deploy.yml`) which runs the tests + lint
and then republishes the game to GitHub Pages.

## 1. Create the repository
1. Log into GitHub → click **+** (top-right) → **New repository**.
2. Name it e.g. `BTH012_a2` (or `bth012-a2`).
3. Choose **Public**.
4. Click **Create repository** (do **not** initialise with a README).

## 2. Push the project
In a terminal (from this project folder, `adventure-game`):

```bash
git init
git add .
git commit -m "Initial commit: The Lost Amulet of Eldergrove"
git branch -M main
git remote add origin https://github.com/<YourUsername>/BTH012_a2.git
git push -u origin main
```

> Note: this project already contains `package.json`, `eslint.config.js`
> (flat config), `vitest.config.js`, `.gitignore`, `.vscode/settings.json` and
> `.github/workflows/deploy.yml` — so there is no need to copy them from the
> example repo. It uses `eslint.config.js` instead of the older `.eslintrc.cjs`;
> both are valid ESLint config files.

## 3. Enable GitHub Pages
1. Open the repo → **Settings** → **Pages** (left menu).
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. (No other change is needed — the workflow already deploys.)

## 4. Trigger the deployment
- Push to `main` (or go to the **Actions** tab and click **Run workflow**).
- Watch the **Actions** tab until the `Deploy to GitHub Pages` workflow is green.

## 5. Verify the game is playable
- The URL is: `https://<YourUsername>.github.io/BTH012_a2/`
- Open it and confirm the welcome screen, movement, and fullscreen all work.

## 6. Submit the URLs in Canvas
1. **Playable game URL:** `https://<YourUsername>.github.io/BTH012_a2/`
2. **Commit URL:** repo → **Commits** tab → click the short commit hash → copy
   that page's URL (this is the URL to your specific commit).

## Troubleshooting
- If the game is blank, open the browser console (F12). A `404` on `src/main.js`
  or `css/style.css` usually means the wrong Pages source; make sure it is set to
  **GitHub Actions**.
- If the workflow fails at `npm ci`, push again or delete the cached lockfile
  issue by running `npm install` locally and committing the updated
  `package-lock.json`.
- The game must be served over HTTP (GitHub Pages does this); opening
  `index.html` directly via `file://` will not work because ES modules are
  blocked on the `file:` origin.
