# Free publishing with GitHub Pages

This website is a static React/Vite app. It does not need the API server, a database, an API key, paid authentication, or a maps API to build or run. The included GitHub Actions workflow builds and publishes it.

## Publish

1. Push this project to a GitHub repository. On GitHub Free, GitHub Pages requires the repository to be public.
2. If your default branch is not named `main`, change the branch in `.github/workflows/deploy-i-choice-food.yml`.
3. In the repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
4. Push a commit to `main`, or open the **Actions** tab and run **Deploy i-choice food to GitHub Pages** manually.
5. When the workflow finishes, open the site URL shown in its deployment summary.

For a project repository, the website uses the `/repository-name/` URL path. A `username.github.io` repository uses the root path. The build also generates a `404.html` copy so the app's favorites route works when opened directly.

## Free-plan notes

- GitHub Pages is available on GitHub Free for public repositories. A private repository requires a paid GitHub plan for Pages.
- GitHub's published limits state a maximum published site size of 1 GB and a soft bandwidth limit of 100 GB per month. Standard Pages source builds also have a soft limit of 10 per hour; this project uses a GitHub Actions deployment workflow.
- The official limits page lists no scheduled expiry date. The site remains subject to GitHub Pages eligibility, repository visibility, account standing, and policy/limit changes.
- GitHub Pages is static hosting only. Favorites stay in each visitor's browser and device; there are no accounts or cross-device sync. Google Maps results open on Google Maps and are not stored or verified by this site.
