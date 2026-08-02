/**
 * Build item-properties.json as a first-class catalog of ItemProperty definitions.
 * Merges Material Tables II property columns with GDD / ITEM_PROPERTY_SYSTEM examples.
 */
import fs from 'fs';

const materials = JSON.parse(fs.readFileSync('public/data/materials.json', 'utf8'));

function usageFor(propertyId) {
  const materialsUsing = [];
  for (const mat of materials.records || []) {
    const hit = (mat.properties || []).some((p) => p.propertyId === propertyId);
    if (hit) materialsUsing.push(mat.id);
  }
  return materialsUsing;
}

function property(entry) {
  const usedByMaterials = entry.usedByMaterials || usageFor(entry.id);
  return {
    kind: 'item-property',
    id: entry.id,
    name: entry.name,
    description: entry.description,
    valueType: entry.valueType,
    min: entry.min,
    max: entry.max,
    enumOptions: entry.enumOptions,
    color: entry.color,
    appliesTo: entry.appliesTo || ['material', 'item'],
    isVisibleToPlayerDefault: entry.isVisibleToPlayerDefault !== false,
    ratioNotes:
      entry.ratioNotes ||
      (entry.valueType === 'Float' || entry.valueType === 'Int'
        ? 'Ratio uses definition min/max (GetRatioValueRaw) or per-binding clamps (GetItemRatioValue).'
        : entry.valueType === 'Enum'
          ? 'Enum labels map to a 0…1 ladder in equal steps (GetStringEnumValue style).'
          : 'String values are descriptive; formulas typically ignore unless custom-mapped.'),
    formulaRole: entry.formulaRole || 'May be weighted in PropertyFormula entries via property id.',
    effectHooks: entry.effectHooks || [],
    sourceColumn: entry.sourceColumn,
    source: entry.source,
    tags: [...new Set([...(entry.tags || []), 'item-property', entry.valueType.toLowerCase()])],
    usedByMaterials,
    usedByMaterialCount: usedByMaterials.length,
    notes: entry.notes,
  };
}

const fromMaterials = (materials.propertyDefinitions || []).map((def) =>
  property({
    ...def,
    appliesTo: def.id === 'tier' ? ['material'] : ['material', 'item'],
    source: 'material-tables-ii',
    tags: [...(def.tags || []), 'material-table', 'imported'],
    effectHooks:
      def.id === 'density'
        ? ['ScaleItemPropertyEffect (possible mass/size visual)']
        : def.id === 'lustrous-quality'
          ? ['MaterialColorValueItemPropertyEffect / MaterialFloatValueItemPropertyEffect']
          : [],
    formulaRole:
      def.id === 'fertility'
        ? 'Useful for horticulture / soil outcome formulas.'
        : def.id === 'tensile-strength' || def.id === 'cohesion'
          ? 'Structural / break-risk formulas for crafted parts and wagons.'
          : undefined,
    description:
      def.description ||
      `${def.name} property definition shared by materials and crafted items.`,
  }),
);

const gddExtras = [
  property({
    id: 'beauty',
    name: 'Beauty',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Aesthetic quality of a crafted or natural object. Trade value and cultural preference often key off this property (Trailbound.md statue example; may also use an Enum ladder Hideous→Immaculate).',
    appliesTo: ['item', 'material'],
    source: 'gdd',
    tags: ['appearance', 'trade', 'preference', 'generated'],
    color: '#c9a227',
    effectHooks: ['MaterialColorValueItemPropertyEffect', 'UI badges'],
    formulaRole: 'Common weight in appraisal / mercantile PropertyFormula sets.',
    notes: 'GDD also allows an enum range from Hideous to Immaculate as an alternate authored form.',
    usedByMaterials: [],
  }),
  property({
    id: 'beauty-grade',
    name: 'Beauty Grade',
    valueType: 'Enum',
    enumOptions: ['Hideous', 'Plain', 'Pleasant', 'Elegant', 'Immaculate'],
    description:
      'Discrete beauty ladder alternate to the 0–100 Beauty float — same design space, different ValueType.',
    appliesTo: ['item'],
    source: 'gdd',
    tags: ['appearance', 'trade', 'enum', 'generated'],
    color: '#c9a227',
    usedByMaterials: [],
  }),
  property({
    id: 'durability',
    name: 'Durability',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'How long an item withstands trail use, wear, and damage before failing. Distinct from material tensile/cohesion contributors that feed into it at craft time.',
    appliesTo: ['item'],
    source: 'gdd',
    tags: ['structure', 'survival', 'generated'],
    formulaRole: 'Maintenance cost and break-chance formulas.',
    usedByMaterials: [],
  }),
  property({
    id: 'doneness',
    name: 'Doneness',
    valueType: 'Enum',
    enumOptions: ['Raw', 'Rare', 'Medium', 'Well', 'Burnt'],
    description:
      'Cooking outcome attribute driven by heat/time minigames. Preference is character-specific — not a universal quality bar (Crafting and Item Attributes).',
    appliesTo: ['item', 'food'],
    source: 'gdd',
    tags: ['food', 'cooking', 'minigame', 'preference', 'generated'],
    effectHooks: ['MaterialColorValueItemPropertyEffect (sear/char visuals)'],
    formulaRole: 'Usually preference-matched rather than maximized.',
    usedByMaterials: [],
  }),
  property({
    id: 'base-value',
    name: 'Base Value',
    valueType: 'Float',
    min: 0,
    max: 1000,
    description:
      'Baseline trade worth before settlement demand and preference modifiers. Often a formula output over beauty, rarity, and material inputs rather than a single authored constant.',
    appliesTo: ['item', 'material'],
    source: 'gdd',
    tags: ['trade', 'generated'],
    usedByMaterials: [],
  }),
  property({
    id: 'toxicity',
    name: 'Toxicity',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Harmful contaminant level — relevant for contaminated soil, bad water, and alchemy reagents. High values gate safe use.',
    appliesTo: ['material', 'item', 'food'],
    source: 'generated',
    tags: ['survival', 'alchemy', 'generated'],
    formulaRole: 'Disease / purification checks; invert in formulas where “clean” is desired.',
    usedByMaterials: [],
    notes: 'Contaminated Soil in Material Tables implies this axis even when not a sheet column.',
  }),
  property({
    id: 'sharpness',
    name: 'Sharpness',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Edge quality for tools and weapons. Obsidian’s sheet notes call out extreme sharpness potential.',
    appliesTo: ['item'],
    source: 'generated',
    tags: ['combat', 'tools', 'generated'],
    usedByMaterials: [],
  }),
  property({
    id: 'weather-resistance',
    name: 'Weather Resistance',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Resistance to rain, sun, and trail exposure. Frequently referenced in material descriptions even when not a dedicated sheet column.',
    appliesTo: ['material', 'item'],
    source: 'generated',
    tags: ['survival', 'structure', 'generated'],
    usedByMaterials: [],
  }),
];

const byId = new Map();
for (const rec of [...fromMaterials, ...gddExtras]) {
  byId.set(rec.id, rec);
}

const records = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));

const data = {
  meta: {
    id: 'item-properties',
    label: 'Item Properties',
    version: 1,
    description:
      'Global ItemProperty definitions (schema): value kinds, ranges/enum ladders, formula/effect hooks, and which materials currently bind them. Mirrors ChainLink ItemProperty assets; bindings live on materials/items as ItemPropertyValue rows.',
    sources: [
      'For Review/ITEM_PROPERTY_SYSTEM.md',
      'Material Tables II (via materials.json propertyDefinitions)',
      'Trailbound.md / Crafting and Item Attributes',
    ],
    schemaNotes: [
      'kind: item-property',
      'valueType: Float | Int | String | Enum',
      'min/max: definition-level clamps for numeric types',
      'enumOptions: ordered labels; ratio ladder = index / (count-1)',
      'appliesTo: entity domains that may attach this property',
      'usedByMaterials: material record ids currently binding this property',
      'Maps to ScriptableObject ItemProperty (Id from asset name, ValueType, ranges, EnumStringOptions, color)',
    ],
  },
  records,
};

fs.writeFileSync('public/data/item-properties.json', JSON.stringify(data, null, 2));
console.log(
  `Wrote ${records.length} item properties (${fromMaterials.length} from materials, ${gddExtras.length} GDD/generated extras)`,
);
