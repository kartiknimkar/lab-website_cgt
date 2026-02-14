# Cocucci Lab Website

Animated, single-page lab website for Dr. Emanuele Cocucci (The Ohio State University).

## Local preview

Open `index.html` directly in a browser.

## Publish on GitHub Pages

1. Create an empty GitHub repository.
2. Add the remote:
   `git remote add origin git@github.com:<your-username>/<repo-name>.git`
3. Push:
   `git push -u origin main`
4. In GitHub repo settings, ensure Pages uses **GitHub Actions** as the source.

The included workflow (`.github/workflows/pages.yml`) deploys the site on each push to `main`.
