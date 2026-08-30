# DMV Real Estate Research Institute — website

A static, broadsheet-style website for the DMV Real Estate Research Institute:
independent housing research for Washington, D.C., Maryland, and Northern Virginia.

No build step. Plain HTML + CSS + a little JavaScript. Design borrows the
"housing index" newspaper aesthetic (warm paper, Source Serif 4 / IBM Plex,
double-rule masthead, ticker, DC/MD/VA color coding).

## Pages

```
index.html        Index — ticker, hero chart, regional readings table, programs, briefings
research.html     Research & data — briefings list + open datasets
methodology.html  Full methodology writeup for the repeat-sales index
about.html        About the Institute, what it publishes, disclosures
contact.html      Contact form (mailto) + direct addresses
```

## Supporting files

```
css/styles.css    Design system — tokens at the top (:root)
js/main.js        Nav state, footer year, subscribe/contact handlers,
                  and the home-page ticker + readings table + SVG index chart
data/index.json   The numbers the home page reads at load time
assets/logo.svg   Favicon / mark
```

The home page fetches `./data/index.json` at load, so it must be served over
http(s) — opening `index.html` straight from disk (`file://`) blocks the fetch.

## Run locally

```bash
cd dmvrei
python3 -m http.server 8000
# open http://localhost:8000
```

## Customize

- **Colors / fonts:** `:root` in `css/styles.css`.
- **Index numbers, ticker, readings table:** edit `data/index.json` (keys:
  `asOf`, `baseQuarter`, `series`, `featured`, `ticker`, `readings`).
- **Briefings:** hand-edit the `.brief` blocks in `index.html` / `research.html`;
  replace `href="#"` with your published notes.
- **Contact / email:** search for `dmvrei.org` and `McLean` and replace.
- **Contact form:** currently opens the visitor's mail client. Point
  `form[data-contact]` at a form service (Formspree, Netlify Forms, etc.) and
  adjust the handler in `js/main.js` to capture submissions.
- **Subscribe form:** front-end only. Wire `form.sub-form` to your email
  provider's endpoint.

## Auto-updating the index (optional)

The companion project at `../dmv-index-site` has a `scripts/update-index.js`
and a GitHub Actions workflow that rewrites `data/index.json` on a schedule
(mock random-walk today; swap in a real Bright MLS RESO Web API query once
access is approved). Copy `scripts/` and `.github/workflows/` here if you want
the same job driving this `data/index.json`.

## Deploy

Any static host — GitHub Pages, Netlify, Cloudflare Pages, S3. Upload the folder
as-is; `index.html` is the entry point.

## Notes

Index values, submarket readings, and briefing titles are illustrative
placeholders. Replace them with real, sourced data before publishing.
