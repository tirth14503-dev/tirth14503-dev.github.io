# The classic MarginGuard homepage

This folder holds the MarginGuard homepage as it was on 26 November 2026, before the "In the margin" redesign.

- Once pushed, it is at `https://tirthalkothari.com/marginguard/classic/`.
- It is marked `noindex` and its canonical address is the main page, so search engines ignore it.
- The same page is also saved in git as the tag `homepage-classic-2026-11-27` (commit `dbc8a91`).

## What is here

- `index.html`: the old page. Only its paths changed, so pictures, the film, the sample files and the Security page are read from one level up (`../media`, `../templates`, `../security.html`).
- `story.css`, `site-motion.css`, `quick-tour.css` and the six `.js` files: copies of the old page's own styles and scripts, so later changes to the main page can't break this copy.

## To switch the main page back

The redesign added new files (`home.css`, `home.js`, `fonts/`, `media/home-*`) and replaced only `marginguard/index.html`. The old page's styles and scripts are still in `marginguard/`. So switching back is one file:

```
git checkout homepage-classic-2026-11-27 -- marginguard/index.html
git commit -m "MarginGuard site: back to the classic homepage"
```

Then push when ready. To keep the tag on GitHub as well: `git push origin homepage-classic-2026-11-27`.

## To remove this copy

Delete this folder and commit. The tag still holds the old page.
