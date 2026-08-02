/**
 * Import "Material Tables II" Google Sheet CSV into materials.json.
 *
 * Columns:
 * Game Name, IRL Inspo, Id, Tier, Type, Description, Uses,
 * Tensile Strength, Density, Refractory Index, Abrasiveness, Malleability,
 * Chemical Reactivity, Insulative Value, Cohesion, Fertility, Lustrous Quality
 */
import fs from 'fs';
import path from 'path';

const csvPath =
  process.argv[2] ||
  String.raw`c:\Users\Alex\Downloads\Material Tables II - Sheet1.csv`;
const outPath = 'public/data/materials.json';

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}

const PROPERTY_COLS = [
  { header: 'Tensile Strength', id: 'tensile-strength', name: 'Tensile Strength' },
  { header: 'Density', id: 'density', name: 'Density' },
  { header: 'Refractory Index', id: 'refractory-index', name: 'Refractory Index' },
  { header: 'Abrasiveness', id: 'abrasiveness', name: 'Abrasiveness' },
  { header: 'Malleability', id: 'malleability', name: 'Malleability' },
  {
    header: 'Chemical Reactivity',
    id: 'chemical-reactivity',
    name: 'Chemical Reactivity',
  },
  { header: 'Insulative Value', id: 'insulative-value', name: 'Insulative Value' },
  { header: 'Cohesion', id: 'cohesion', name: 'Cohesion' },
  { header: 'Fertility', id: 'fertility', name: 'Fertility' },
  { header: 'Lustrous Quality', id: 'lustrous-quality', name: 'Lustrous Quality' },
];

const propertyDefinitions = PROPERTY_COLS.map((col) => ({
  id: col.id,
  name: col.name,
  valueType: 'Float',
  min: 0,
  max: 100,
  description: `${col.name} contribution for materials (0–100 authored scale from Material Tables II).`,
  tags: ['material-table', 'float'],
  sourceColumn: col.header,
}));

propertyDefinitions.push({
  id: 'tier',
  name: 'Tier',
  valueType: 'Enum',
  enumOptions: ['I', 'II', 'III', 'IV', 'V'],
  description: 'Material tier band from the spreadsheet (Roman numeral).',
  tags: ['material-table', 'enum'],
  sourceColumn: 'Tier',
});

const text = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(text);
const headers = rows[0].map((h) => h.trim());
const index = Object.fromEntries(headers.map((h, i) => [h, i]));

function cell(row, header) {
  const i = index[header];
  if (i === undefined) return '';
  return String(row[i] ?? '').trim();
}

const records = [];
const usedIds = new Set();

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  if (!row || row.every((c) => !String(c || '').trim())) continue;

  const gameName = cell(row, 'Game Name');
  const irlInspo = cell(row, 'IRL Inspo');
  const type = cell(row, 'Type');
  const description = cell(row, 'Description');
  const uses = cell(row, 'Uses');
  const tier = cell(row, 'Tier');
  const sheetId = cell(row, 'Id');

  // Skip blank template rows (tier-only placeholders at bottom of sheet)
  if (!gameName && !irlInspo && !description && !uses && !type) continue;
  if (!gameName && !irlInspo && !description && !uses) continue;

  const displayName = gameName || irlInspo;
  if (!displayName) continue;

  let id = slugify(sheetId || gameName || irlInspo);
  if (!id) id = `material-${r}`;
  if (usedIds.has(id)) {
    id = `${id}-${slugify(irlInspo || String(r))}`;
  }
  usedIds.add(id);

  const properties = [];
  for (const col of PROPERTY_COLS) {
    const raw = cell(row, col.header);
    if (raw === '') continue;
    const value = Number(raw);
    if (Number.isNaN(value)) continue;
    properties.push({
      propertyId: col.id,
      name: col.name,
      valueType: 'Float',
      min: 0,
      max: 100,
      value,
      isVisibleToPlayer: true,
      isStatic: false,
    });
  }

  if (tier) {
    properties.push({
      propertyId: 'tier',
      name: 'Tier',
      valueType: 'Enum',
      enumOptions: ['I', 'II', 'III', 'IV', 'V'],
      value: tier,
      isVisibleToPlayer: true,
      isStatic: true,
    });
  }

  const category = (type || 'uncategorized').toLowerCase();
  const useList = splitUses(uses);

  records.push({
    kind: 'material',
    id,
    name: displayName,
    gameName: gameName || undefined,
    irlInspo: irlInspo || undefined,
    category,
    tier: tier || undefined,
    description:
      description ||
      `${displayName}${irlInspo && gameName ? ` (inspired by ${irlInspo})` : ''} material.`,
    uses: useList,
    usesRaw: uses || undefined,
    source: 'spreadsheet',
    tags: unique([
      'material',
      category,
      tier ? `tier-${tier.toLowerCase()}` : null,
      gameName ? 'named' : 'irl-named',
      'imported',
    ]),
    linkedSystems: ['Crafting and Item Attributes'],
    properties,
    notes: irlInspo && gameName ? `IRL inspiration: ${irlInspo}.` : undefined,
  });
}

const data = {
  meta: {
    id: 'materials',
    label: 'Materials',
    version: 2,
    description:
      'Materials from Material Tables II spreadsheet. Property bindings follow ItemPropertyValue shape; numeric columns are 0–100 Float properties.',
    sources: [
      'Material Tables II (Google Sheet CSV)',
      'For Review/ITEM_PROPERTY_SYSTEM.md',
      'Trailbound.md / Crafting and Item Attributes',
    ],
    schemaNotes: [
      'kind: material',
      'gameName: in-world name when present; otherwise name falls back to irlInspo',
      'irlInspo: real-world reference material',
      'category: spreadsheet Type (dirt|ore|alloy|stone|…)',
      'tier: Roman numeral band',
      'properties: Float stats from the sheet + optional Tier enum',
      'uses: parsed list of craft/application targets',
    ],
    lastImport: {
      file: path.basename(csvPath),
      at: new Date().toISOString(),
      rowCount: records.length,
    },
  },
  propertyDefinitions,
  records,
};

fs.writeFileSync(outPath, JSON.stringify(data, null, 2));

const byType = {};
for (const rec of records) {
  byType[rec.category] = (byType[rec.category] || 0) + 1;
}
console.log(`Imported ${records.length} materials → ${outPath}`);
console.log('By type:', byType);
console.log(
  'Sample:',
  records.slice(0, 3).map((r) => `${r.id} (${r.category}, ${r.properties.length} props)`),
);

function parseCsv(input) {
  const out = [];
  let row = [];
  let cellValue = '';
  let inQuotes = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cellValue += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cellValue += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cellValue);
      cellValue = '';
    } else if (ch === '\n') {
      row.push(cellValue);
      out.push(row);
      row = [];
      cellValue = '';
    } else if (ch !== '\r') {
      cellValue += ch;
    }
  }
  if (cellValue.length || row.length) {
    row.push(cellValue);
    out.push(row);
  }
  return out;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitUses(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}
