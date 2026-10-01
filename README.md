# Saeed Peyman: Portfolio

Personal portfolio for Saeed Peyman, a software and data engineer based in Nashville, Tennessee. Live at **<https://speyyman.github.io>**.

Built with **HTML5, CSS3 and vanilla JavaScript**: no frameworks, no build step, no dependencies.

## Pages

- **Home**: introduction, featured projects and services
- **About**: background, experience, education and working values
- **Portfolio**: six engineering case studies, filterable by Data, Backend & APIs and Architecture
- **Skills**: technical skills, domains worked in, services and process
- **Contact**: email and social links, a contact form and a short FAQ

## Features

- Light/dark mode that follows the OS setting, remembers the visitor's choice and doesn't flash the wrong theme on load
- Responsive from 320px phones to wide desktops, with a hamburger menu below 960px
- Scroll-reveal animations, page fade transitions and a first-visit loading animation, all disabled for `prefers-reduced-motion`
- Accessible by design: skip link, landmarks, logical heading order, ARIA labels/states, visible focus styles and a keyboard-operable menu
- SEO: unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, JSON-LD `Person` schema, `sitemap.xml` and `robots.txt`
- Works without JavaScript

## Folder structure

```
.
├── index.html               Home page
├── pages/
│   ├── about.html
│   ├── portfolio.html
│   ├── skills.html
│   └── contact.html
├── css/
│   ├── style.css            Design tokens, components, themes
│   └── responsive.css       Tablet & mobile breakpoints
├── js/
│   ├── script.js            Theme, nav, animations, filters, transitions
│   └── form-handler.js      Contact form validation & submission
├── images/                  Project illustrations, avatar, favicon, social image
├── sitemap.xml
├── robots.txt
└── README.md
```

## Run it locally

Use a local web server rather than opening the file directly, so links and fonts behave as they do in production.

```bash
py -m http.server 8000      # Windows (macOS/Linux: python3 -m http.server 8000)
```

Then open <http://localhost:8000>.

## Editing content

- **Projects**: edit the `<article class="project-card">` blocks in `pages/portfolio.html` (and the three featured ones on `index.html`). Set `data-category` to `data`, `backend` or `architecture` so the filters work. To add a category, add a matching `<button class="filter-btn" data-filter="…">`.
- **Experience and education**: plain `timeline__item` blocks in `pages/about.html`.
- **Skills and services**: tag lists and cards in `pages/skills.html`.
- **Colours**: CSS variables at the top of `css/style.css` (`:root` for light mode, `[data-theme="dark"]` for dark mode).
- **Images**: replace `images/avatar.svg` with a photo (4:5 ratio, e.g. 960×1200) when you have one, and regenerate `images/og-image.png` (1200×630) if the headline changes.

### Contact form

With no `data-endpoint` on the form, submitting opens the visitor's email app with the message pre-filled, addressed to `data-fallback-email`. To receive messages directly instead, create an endpoint with a service such as [Formspree](https://formspree.io) and set it in `pages/contact.html`:

```html
<form id="contact-form" ... data-endpoint="https://formspree.io/f/your-id">
```

## Deploying

The site is served by **GitHub Pages** from the `main` branch, `/ (root)` of the `speyyman/speyyman.github.io` repository (*Settings → Pages*). Pushing to `main` redeploys it.

After changing pages, keep `sitemap.xml` (including `<lastmod>`) in sync.
