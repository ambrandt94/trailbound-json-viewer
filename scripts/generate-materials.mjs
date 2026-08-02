import fs from 'fs';

/** Aligns with ChainLink ItemProperty / ItemPropertyValue mental model. */
const propertyDefinitions = [
  {
    id: 'beauty',
    name: 'Beauty',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Aesthetic contribution when this material is visible in a crafted object. Maps to ItemProperty Float with ratio display.',
    tags: ['appearance', 'trade'],
  },
  {
    id: 'durability',
    name: 'Durability',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'How well the material resists wear, breakage, and trail use.',
    tags: ['structure', 'survival'],
  },
  {
    id: 'hardness',
    name: 'Hardness',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'Resistance to cutting, denting, and deformation during craft or impact.',
    tags: ['structure', 'crafting'],
  },
  {
    id: 'weight',
    name: 'Weight',
    valueType: 'Float',
    min: 0,
    max: 100,
    description:
      'Relative mass contribution per unit used in recipes / wagon load math (higher = heavier).',
    tags: ['logistics', 'caravan'],
  },
  {
    id: 'workability',
    name: 'Workability',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'Ease of shaping in crafting minigames; affects time fog and failure risk.',
    tags: ['crafting', 'time'],
  },
  {
    id: 'heat-resistance',
    name: 'Heat Resistance',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'Tolerance for forge, cooking, and biome heat without degrading attributes.',
    tags: ['crafting', 'survival'],
  },
  {
    id: 'flexibility',
    name: 'Flexibility',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'Bend-without-break quality for straps, bows, canvas frames, and bindings.',
    tags: ['structure', 'crafting'],
  },
  {
    id: 'base-value',
    name: 'Base Value',
    valueType: 'Float',
    min: 0,
    max: 100,
    description: 'Baseline trade worth before preference modifiers and settlement demand.',
    tags: ['trade'],
  },
  {
    id: 'grade',
    name: 'Grade',
    valueType: 'Enum',
    enumOptions: ['Poor', 'Common', 'Fine', 'Rare', 'Masterwork'],
    description:
      'Qualitative tier ladder. Enum labels map to a fractional ratio ladder (ItemProperty GetStringEnumValue style).',
    tags: ['quality'],
  },
  {
    id: 'finish',
    name: 'Finish',
    valueType: 'Enum',
    enumOptions: ['Raw', 'Rough', 'Sanded', 'Polished', 'Lacquered'],
    description: 'Surface treatment state commonly applied during craft steps.',
    tags: ['appearance', 'crafting'],
  },
];

function prop(propertyId, values) {
  const def = propertyDefinitions.find((p) => p.id === propertyId);
  if (!def) throw new Error(`Unknown property ${propertyId}`);
  const row = {
    propertyId,
    name: def.name,
    valueType: def.valueType,
    isVisibleToPlayer: values.isVisibleToPlayer !== false,
    isStatic: !!values.isStatic,
  };
  if (def.valueType === 'Float' || def.valueType === 'Int') {
    row.min = values.min ?? def.min ?? 0;
    row.max = values.max ?? def.max ?? 100;
    row.value = values.value;
  } else if (def.valueType === 'Enum') {
    row.enumOptions = def.enumOptions;
    row.value = values.value;
  } else if (def.valueType === 'String') {
    row.value = values.value;
  }
  return row;
}

function material(entry) {
  return {
    kind: 'material',
    ...entry,
    tags: [...new Set([...(entry.tags || []), 'material'])],
  };
}

const records = [
  material({
    id: 'oak-wood',
    name: 'Oak Wood',
    category: 'wood',
    description:
      'Dense hardwood stock for furniture, cart frames, and structural joins. Contributes durability and moderate beauty; heavy for wagon loads.',
    source: 'generated',
    tags: ['wood', 'organic', 'crafting', 'caravan', 'generated', 'example'],
    linkedSkills: ['carpentry', 'wagonwright', 'woodcutting'],
    linkedSystems: ['Crafting and Item Attributes', 'Caravan Operations'],
    gatherMethods: ['woodcutting', 'salvage'],
    biomes: ['temperate-forest', 'settlement-yards'],
    properties: [
      prop('beauty', { value: 45 }),
      prop('durability', { value: 72 }),
      prop('hardness', { value: 68 }),
      prop('weight', { value: 62 }),
      prop('workability', { value: 55 }),
      prop('heat-resistance', { value: 35 }),
      prop('flexibility', { value: 28 }),
      prop('base-value', { value: 40 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Raw' }),
    ],
    notes:
      'Example material seeded from ITEM_PROPERTY_SYSTEM + GDD. Replace/extend from the materials spreadsheet when imported.',
  }),
  material({
    id: 'pine-wood',
    name: 'Pine Wood',
    category: 'wood',
    description:
      'Lighter softwood for crates, temporary braces, and quick camp builds. Easier to work; wears faster on the trail.',
    source: 'generated',
    tags: ['wood', 'organic', 'crafting', 'camp', 'generated', 'example'],
    linkedSkills: ['carpentry', 'survival', 'woodcutting'],
    linkedSystems: ['Crafting and Item Attributes', 'Caravan Operations'],
    gatherMethods: ['woodcutting'],
    biomes: ['boreal', 'temperate-forest'],
    properties: [
      prop('beauty', { value: 30 }),
      prop('durability', { value: 42 }),
      prop('hardness', { value: 35 }),
      prop('weight', { value: 38 }),
      prop('workability', { value: 78 }),
      prop('heat-resistance', { value: 25 }),
      prop('flexibility', { value: 40 }),
      prop('base-value', { value: 22 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Raw' }),
    ],
  }),
  material({
    id: 'iron-ingot',
    name: 'Iron Ingot',
    category: 'metal',
    description:
      'Refined iron bars for tools, fittings, nails, and weapon heads. High durability and hardness; poor flexibility.',
    source: 'generated',
    tags: ['metal', 'refined', 'crafting', 'workshop', 'generated', 'example'],
    linkedSkills: ['smithing', 'mining', 'wagonwright'],
    linkedSystems: ['Crafting and Item Attributes', 'Minigame Systems'],
    gatherMethods: ['mining', 'salvage'],
    biomes: ['mountain', 'industrial-poi'],
    properties: [
      prop('beauty', { value: 25 }),
      prop('durability', { value: 85 }),
      prop('hardness', { value: 80 }),
      prop('weight', { value: 78 }),
      prop('workability', { value: 40 }),
      prop('heat-resistance', { value: 70 }),
      prop('flexibility', { value: 12 }),
      prop('base-value', { value: 58 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Rough' }),
    ],
  }),
  material({
    id: 'copper-ingot',
    name: 'Copper Ingot',
    category: 'metal',
    description:
      'Softer workable metal for fittings, decorative inlay, and early tools. Warms beauty scores on finished goods.',
    source: 'generated',
    tags: ['metal', 'refined', 'crafting', 'art', 'generated', 'example'],
    linkedSkills: ['smithing', 'mining', 'painting'],
    linkedSystems: ['Crafting and Item Attributes'],
    gatherMethods: ['mining'],
    biomes: ['hill-country', 'mountain'],
    properties: [
      prop('beauty', { value: 55 }),
      prop('durability', { value: 50 }),
      prop('hardness', { value: 45 }),
      prop('weight', { value: 70 }),
      prop('workability', { value: 72 }),
      prop('heat-resistance', { value: 55 }),
      prop('flexibility', { value: 30 }),
      prop('base-value', { value: 48 }),
      prop('grade', { value: 'Fine' }),
      prop('finish', { value: 'Sanded' }),
    ],
  }),
  material({
    id: 'granite',
    name: 'Granite',
    category: 'stone',
    description:
      'Heavy building stone for fortification, POI restoration, and durable settlement work.',
    source: 'generated',
    tags: ['stone', 'settlement', 'crafting', 'generated', 'example'],
    linkedSkills: ['masonry', 'mining'],
    linkedSystems: ['Crafting and Item Attributes', 'Points of Interest'],
    gatherMethods: ['mining'],
    biomes: ['mountain', 'quarry-poi'],
    properties: [
      prop('beauty', { value: 40 }),
      prop('durability', { value: 92 }),
      prop('hardness', { value: 90 }),
      prop('weight', { value: 95 }),
      prop('workability', { value: 22 }),
      prop('heat-resistance', { value: 88 }),
      prop('flexibility', { value: 5 }),
      prop('base-value', { value: 35 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Rough' }),
    ],
  }),
  material({
    id: 'ox-hide',
    name: 'Ox Hide',
    category: 'organic',
    description:
      'Thick hide for harnesses, soft armor, and cargo covers after tanning. Flexible and trail-durable.',
    source: 'generated',
    tags: ['organic', 'animal', 'leather', 'caravan', 'generated', 'example'],
    linkedSkills: ['leatherworking', 'animal-handling', 'tailoring'],
    linkedSystems: ['Crafting and Item Attributes', 'Caravan Operations'],
    gatherMethods: ['hunting', 'animal-care'],
    biomes: ['grassland', 'trail'],
    properties: [
      prop('beauty', { value: 35 }),
      prop('durability', { value: 65 }),
      prop('hardness', { value: 30 }),
      prop('weight', { value: 40 }),
      prop('workability', { value: 58 }),
      prop('heat-resistance', { value: 30 }),
      prop('flexibility', { value: 75 }),
      prop('base-value', { value: 44 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Raw' }),
    ],
  }),
  material({
    id: 'linen-cloth',
    name: 'Linen Cloth',
    category: 'textile',
    description:
      'Light woven cloth for garments, patches, and wagon canvas repairs. High workability; modest durability.',
    source: 'generated',
    tags: ['textile', 'fiber', 'camp', 'crafting', 'generated', 'example'],
    linkedSkills: ['tailoring', 'foraging', 'horticulture'],
    linkedSystems: ['Crafting and Item Attributes', 'Minigame Systems'],
    gatherMethods: ['foraging', 'trade'],
    biomes: ['farmland', 'settlement'],
    properties: [
      prop('beauty', { value: 50 }),
      prop('durability', { value: 38 }),
      prop('hardness', { value: 10 }),
      prop('weight', { value: 15 }),
      prop('workability', { value: 82 }),
      prop('heat-resistance', { value: 20 }),
      prop('flexibility', { value: 88 }),
      prop('base-value', { value: 30 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Sanded' }),
    ],
  }),
  material({
    id: 'coal',
    name: 'Coal',
    category: 'mineral',
    description:
      'Fuel stock for forges, hearths, and cold biomes. Low structural use; high heat contribution.',
    source: 'generated',
    tags: ['mineral', 'fuel', 'workshop', 'survival', 'generated', 'example'],
    linkedSkills: ['smithing', 'survival', 'mining'],
    linkedSystems: ['Minigame Systems', 'Caravan Operations'],
    gatherMethods: ['mining', 'foraging'],
    biomes: ['mountain', 'industrial-poi'],
    properties: [
      prop('beauty', { value: 5 }),
      prop('durability', { value: 20 }),
      prop('hardness', { value: 25 }),
      prop('weight', { value: 45 }),
      prop('workability', { value: 60 }),
      prop('heat-resistance', { value: 15 }),
      prop('flexibility', { value: 5 }),
      prop('base-value', { value: 28 }),
      prop('grade', { value: 'Common' }),
      prop('finish', { value: 'Raw' }),
    ],
  }),
  material({
    id: 'darkwood',
    name: 'Darkwood',
    category: 'wood',
    description:
      'Dense, deep-toned timber favored in some cultures for decor. Boosts beauty; heavier and rarer than oak.',
    source: 'generated',
    tags: ['wood', 'organic', 'art', 'preference', 'generated', 'example'],
    linkedSkills: ['carpentry', 'painting', 'mercantile'],
    linkedSystems: ['Crafting and Item Attributes'],
    gatherMethods: ['woodcutting', 'trade'],
    biomes: ['deep-forest', 'exotic'],
    preferenceNotes:
      'Example of preference coupling from Trailbound.md — some peoples (e.g. orcish tastes in the GDD note) may prefer dark wood decor, raising effective trade value without changing the property schema.',
    properties: [
      prop('beauty', { value: 78 }),
      prop('durability', { value: 70 }),
      prop('hardness', { value: 74 }),
      prop('weight', { value: 70 }),
      prop('workability', { value: 48 }),
      prop('heat-resistance', { value: 40 }),
      prop('flexibility', { value: 22 }),
      prop('base-value', { value: 72 }),
      prop('grade', { value: 'Fine' }),
      prop('finish', { value: 'Polished' }),
    ],
  }),
  material({
    id: 'river-clay',
    name: 'River Clay',
    category: 'ceramic',
    description:
      'Malleable clay for vessels, seals, and kiln-fired parts. High workability before firing; fragile until cured.',
    source: 'generated',
    tags: ['ceramic', 'crafting', 'water', 'generated', 'example'],
    linkedSkills: ['survival', 'fordcraft', 'alchemy'],
    linkedSystems: ['Crafting and Item Attributes', 'Biomes'],
    gatherMethods: ['foraging', 'fordcraft'],
    biomes: ['riverland', 'wetland'],
    properties: [
      prop('beauty', { value: 28 }),
      prop('durability', { value: 18 }),
      prop('hardness', { value: 12 }),
      prop('weight', { value: 50 }),
      prop('workability', { value: 90 }),
      prop('heat-resistance', { value: 45 }),
      prop('flexibility', { value: 55 }),
      prop('base-value', { value: 18 }),
      prop('grade', { value: 'Poor' }),
      prop('finish', { value: 'Raw' }),
    ],
  }),
];

const data = {
  meta: {
    id: 'materials',
    label: 'Materials',
    version: 1,
    description:
      'Build and craft materials that contribute typed properties to items. Schema mirrors ChainLink ItemProperty / ItemPropertyValue (definitions + per-material bindings). Seed examples are tagged generated/example until the Google Sheet is imported.',
    sources: [
      'For Review/ITEM_PROPERTY_SYSTEM.md',
      'Trailbound.md (Item Attributes & Variable Crafting)',
      'Wiki/04 Systems/Crafting and Item Attributes.md',
      'Google Sheet pending import: 1A_6T2eGVGhaaEYCB7vla-uUqDX9VeP1vRoA22ifVDMg',
    ],
    schemaNotes: [
      'kind: material',
      'propertyDefinitions: global ItemProperty-like schema (Float|Int|String|Enum)',
      'records[].properties: ItemPropertyValue-like bindings (propertyId, valueType, value, min/max, flags)',
      'category: wood|metal|stone|organic|textile|mineral|ceramic|composite|…',
      'Enum values use label strings; runtime can map to 0..1 ladders like GetStringEnumValue',
      "tags: include 'generated' on AI drafts; 'example' marks spreadsheet-pending seeds",
    ],
  },
  propertyDefinitions,
  records,
};

fs.writeFileSync('public/data/materials.json', JSON.stringify(data, null, 2));
console.log(
  `Wrote materials.json: ${records.length} materials, ${propertyDefinitions.length} property definitions`,
);
