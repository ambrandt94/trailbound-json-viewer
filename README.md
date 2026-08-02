# Trailbound Data Viewer

Angular tool for browsing, filtering, tagging, comparing, and visualizing Trailbound JSON datasets. Skills, materials, and item properties ship as the first catalog categories; add more by dropping JSON under `public/data/` and registering them in `public/data/catalog.json`.

## Live site

https://ambrandt94.github.io/trailbound-json-viewer/

Deployed from `main` via GitHub Actions (`.github/workflows/deploy-pages.yml`). In the repo **Settings → Pages**, set **Source** to **GitHub Actions** (not “Deploy from a branch”).

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200/`.

Production / Pages build:

```bash
npm run build:pages
```

## Data layout

- `public/data/catalog.json` — dataset registry (id, label, path, field mappings)
- `public/data/skills.json` — skills professions + common skills
- `public/data/materials.json` — materials + shared `propertyDefinitions` (ItemProperty-style)
- `public/data/item-properties.json` — first-class ItemProperty definitions (schema catalog)

Supported payload shapes:

- `{ "meta": {}, "records": [ ... ] }` (optional extras like `propertyDefinitions`)
- `{ "items": [ ... ] }` / `{ "data": [ ... ] }`
- bare `[ ... ]` arrays

Records should include an id, a title field, and optionally a `tags` array for search/filter.

## Materials

Aligned with `For Review/ITEM_PROPERTY_SYSTEM.md`:

- Global `propertyDefinitions` (Float / Int / String / Enum, ranges, enum ladders)
- Per-material `properties` bindings (value, clamps, visibility/static flags)
- Categories, gather methods, biomes, linked skills

Seed examples are tagged `generated` + `example` until the Google Sheet is imported:

```bash
# After exporting the sheet as CSV to public/data/materials-source.csv
npm run import:materials
# or
node scripts/import-materials-csv.mjs path/to/export.csv
```

Regenerate the Item Properties catalog (pulls from materials + GDD extras):

```bash
npm run generate:item-properties
```

## Skills notes

- Canon professions come from `For Review/Skills.md`
- AI-drafted professions/commons are tagged `generated` so you can filter them out
- Each skill includes a `description` plus `possibleGridNodes` (workshop ideas for a future sphere-grid JSON)
- Sphere-grid layout/shapes are intentionally not stored on skill assets yet
- Also includes `skillTypes`, OT/5e `influences`, subskills, and common links
- Regenerate with `npm run generate:skills`

## Fonts

Toolbar switcher: Capriola, Poppins, Sen, Ubuntu (persisted in localStorage).
