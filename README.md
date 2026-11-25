# Legal consultancy site (React + Vite + json-server)

    npm install && npm run dev   # site http://localhost:5173 , admin /admin (admin / admin123), API :3001
    npm run seed                 # reset db.json to defaults (WARNING: erases dashboard edits)

## Structure: one folder per piece, each with its own .jsx + .css

    src/
      styles/       base.css  buttons.css  forms.css  page.css     (global only: reset, variables, buttons, form controls)
      components/   Header Hero Footer Layout Particles Poster Preloader Reveal ScrollUI Tilt
      sections/     SectionShell SectionHead Btn Features Stats About Banner Cards Carousel Faq
                    index.jsx maps section.type -> component
      pages/        Home Packages PackageDetail Booking
      admin/        AdminApp Login Dashboard GeneralEditor HeroEditor BannersEditor SectionsEditor
                    PackagesEditor PagesEditor RequestsView fields (shared inputs)

Add a new section type: create sections/MyType/MyType.jsx + MyType.css, then register it in sections/index.jsx.

## Banners (Dashboard > Banners)
Per banner: photo (upload / URL / default), flip horizontally, text position (start / center / end),
dark overlay %, height, text color, title, text, button, visible, order. "Flip all / Unflip all" for bulk changes.
The live preview uses the same Banner component as the site. The Hero photo has its own flip in Dashboard > Hero.

## v2.1 — redesign notes
- **Header**: Saudi flag beside the language switcher; top bar follows RTL/LTR; header height is a CSS token (`--tb`, `--mb`, `--hh`) so inner pages and package images always start *below* it.
- **Typography**: Arabic = IBM Plex Sans Arabic (body) + Amiri (headings), root size 18px; English = Hanken Grotesk + Cormorant Garamond.
- **Socials**: YouTube removed; Snapchat + TikTok added (set links in Dashboard > Site settings > Contact & social). Back-to-top uses the same gold circle as the social button.
- **Package details page** rebuilt (`pages/PackageDetail`): hero band, cover, in-page nav, trust points, included features, steps, terms, FAQ, related packages, sticky purchase card + mobile buy bar. Copy is editable in Dashboard > Pages content > Package details page; per-package description / duration / badge in Dashboard > Packages.
- **Requests**: every request has `type` = `contact` | `package`, `status` = new | contacted | done | cancelled, internal `notes` and a status `history`. Package requests also store `packageName`, `qty`, `unitPrice`, `total`. Old records without `type` are inferred automatically.
- **Admin**: new shell (grouped sidebar, mobile drawer), Overview with live chart, tabbed Site settings (brand, contact & social, colors, navigation, header/footer, change password), Packages manager with categories, tabbed Pages editor, Requests manager (tabs, search, filters, sort, bulk actions, CSV export, details drawer).
