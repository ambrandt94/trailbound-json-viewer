import fs from 'fs';

const profession = (p) => ({ kind: 'profession', ...p });
const common = (p) => ({ kind: 'common', ...p });

const data = {
  meta: {
    id: 'skills',
    label: 'Skills',
    version: 3,
    description:
      'Trailbound skill professions with focused subskills and shared common skills. Canon entries come from For Review/Skills.md; generated entries expand coverage from the GDD, Oregon Trail survival fantasy, and D&D 5e skill/ability framing. Sphere-grid layout lives in a separate JSON later — skills only list possible node ideas.',
    schemaNotes: [
      'kind: profession | common',
      'description: required short summary of what the skill covers',
      'subskills: expertise branches within a profession',
      'commonSkillIds: shared attributes that can be trained via this profession',
      'skillTypes.passive / skillTypes.active: always-on vs player-triggered expressions',
      'possibleGridNodes: workshop list of node ideas for a future sphere-grid file (type: branch|passive|active|common-link|motif|gateway|milestone|design-note)',
      'influences.oregonTrail / influences.dnd5e: separate design lenses — not 1:1 ports',
      "tags: free-form labels for search/filter (always include 'generated' on AI drafts)",
    ],
  },
  records: [],
};

/** @param {string[]} passive @param {string[]} active */
const skillTypes = (passive, active) => ({ passive, active });

/** @param {object|null} grid @deprecated harvested into possibleGridNodes then stripped */
const sphereGrid = (grid) => grid;

/** @param {string|object} oregonTrail @param {string|object} dnd5e */
const influences = (oregonTrail, dnd5e) => ({ oregonTrail, dnd5e });

data.records.push(
  profession({
    id: 'cooking',
    name: 'Cooking',
    role: 'Cook',
    source: 'for-review',
    description:
      'Prepare meals from camp stores and POI ingredients. Minigame performance shapes attributes like doneness, seasoning, and perceived quality rather than a single 0–100 score.',
    tags: ['profession', 'crafting', 'food', 'camp', 'canon'],
    linkedSystems: ['Crafting and Item Attributes', 'Minigame Systems', 'Caravan Operations'],
    subskills: [
      { id: 'baking', name: 'Baking', description: 'Breads, pastries, and oven-controlled recipes.' },
      {
        id: 'grilling',
        name: 'Grilling',
        description: 'Direct-heat cooking; heat and timing set doneness attributes.',
      },
      {
        id: 'butchery',
        name: 'Butchery',
        description: 'Breakdown of game and livestock into usable cuts and byproducts.',
      },
      {
        id: 'brewing',
        name: 'Brewing',
        description: 'Ferments, teas, and trail beverages with shelf-life tradeoffs.',
      },
    ],
    commonSkillIds: ['plant-identification', 'fire-tending', 'artisanship', 'organization'],
    skillTypes: skillTypes(
      [
        'Ration yield floor — leftovers and scrap stretch further',
        'Spoilage foresight — better estimate when stores will turn',
        'Preference memory — remember party doneness/taste likes',
      ],
      [
        'Cook meal (Mess Kit / Stoke the Hearth chains)',
        'Preserve batch — smoke, salt, or pickle for the road',
        'Field butcher — convert a fresh kill into packable cuts',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        baking: 'circle',
        grilling: 'diamond',
        butchery: 'square',
        brewing: 'oval',
      },
      iconIdeas: [
        'skillet / flame for grilling nodes',
        'loaf / oven for baking',
        'cleaver for butchery gates',
        'kettle / bottle for brewing',
        'shared fire-tending oval satellites around the grid rim',
      ],
      layoutNotes:
        'Multiple start points: camp cook vs trail butcher. Recipe squares unlock after heat-control diamonds.',
    }),
    influences: influences(
      {
        lens: 'Rations, hunting meat conversion, and the daily pressure of feeding the party before miles resume.',
        beats: [
          'Ration modes (filling / meager / bare) as cooking-efficiency tradeoffs',
          'Bad water or spoiled food cascading into illness checks',
          'Trading post ingredients as rare recipe unlocks',
        ],
      },
      {
        lens: "Cook's utensils as tool proficiency; Constitution-adjacent endurance for long kitchen days; Wisdom for taste/judgment.",
        beats: [
          "Treat recipes like 'prepared' options for the day",
          'Tool proficiency (cookware) gating advanced techniques',
          "Passive 'kitchen sense' akin to Passive Perception for doneness",
        ],
        abilityAnchors: ['Wisdom', 'Constitution'],
      },
    ),
  }),
  profession({
    id: 'animal-handling',
    name: 'Animal Handling',
    role: 'Animal Handler',
    source: 'for-review',
    description:
      'Train, care for, ride, and hunt with beasts that support caravan life and specialty animal-handling expeditions.',
    tags: ['profession', 'animals', 'caravan', 'specialty', 'canon'],
    linkedSystems: ['Caravan Operations', 'Biomes', 'Traversal and Routes'],
    subskills: [
      {
        id: 'taming-training',
        name: 'Taming / Training',
        description: 'Bonding, command reliability, and work roles for animals.',
      },
      { id: 'riding', name: 'Riding', description: 'Mount control, stamina pacing, and mounted traversal.' },
      {
        id: 'animal-care',
        name: 'Animal Care',
        description: 'Health, feeding, shelter, and morale of caravan beasts.',
      },
      {
        id: 'hunting',
        name: 'Hunting',
        description: 'Tracking and harvesting wild game for food and materials.',
      },
    ],
    commonSkillIds: ['tracking-animal', 'identification-animal', 'endurance', 'perception'],
    skillTypes: skillTypes(
      [
        'Herd calm — lower spook chance during storms and gunfire',
        'Pace empathy — animals telegraph exhaustion earlier',
        'Feed efficiency — less fodder waste on long legs',
      ],
      [
        'Hunt for the party (aim/scarcity trade like classic trail hunting)',
        'Calm beast — active intervention when mounts panic',
        'Drive / hitch — seat animals into wagon roles',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'taming-training': 'star',
        riding: 'diamond',
        'animal-care': 'circle',
        hunting: 'triangle',
      },
      iconIdeas: [
        'ox / horse silhouette for care passives',
        'reins for riding actives',
        'paw print for tracking satellites',
        'bow-and-hare for hunting branch',
      ],
      layoutNotes: 'Hunting branch pivots toward Ranged Combat via triangle gateways.',
    }),
    influences: influences(
      {
        lens: 'Oxen health, hunting for food, and the cruelty of losing draft animals mid-journey.',
        beats: [
          'Injured ox slowing the whole column',
          'Hunt screens with ammo vs meat risk',
          'Resting animals vs making miles',
        ],
      },
      {
        lens: 'Direct map to the Animal Handling skill; Wisdom primary; Ranger/Druid fantasy without locking a class.',
        beats: [
          'Wisdom (Animal Handling) checks for calm/train',
          'Advantage-like bonds with familiar species',
          'Mount combat as optional active layer',
        ],
        abilityAnchors: ['Wisdom'],
      },
    ),
  }),
  profession({
    id: 'scouting',
    name: 'Scouting',
    role: 'Scout',
    source: 'for-review',
    description:
      "Route foresight, climate navigation, and threat awareness. Racial and background perks may bias terrain bonuses without changing the skill's hire value.",
    tags: ['profession', 'exploration', 'navigation', 'canon'],
    linkedSystems: ['Traversal and Routes', 'Biomes', 'Time and Scheduling'],
    subskills: [
      {
        id: 'nav-common',
        name: 'Navigation — Common Climates',
        description: 'Reliable routing through temperate and familiar biomes.',
      },
      {
        id: 'nav-exotic',
        name: 'Navigation — Exotic Climates',
        description: 'Unusual biomes and cultural route customs.',
      },
      {
        id: 'nav-harsh',
        name: 'Navigation — Harsh Climates',
        description: 'Snow, desert, storm, and high-risk terrain legs.',
      },
      {
        id: 'nav-settlements',
        name: 'Navigation — Settlements',
        description: 'Urban approaches, local guides, and civil route law.',
      },
    ],
    commonSkillIds: [
      'tracking-human',
      'tracking-animal',
      'tracking-monster',
      'weather-sense',
      'perception',
    ],
    skillTypes: skillTypes(
      [
        'Landmark memory — fewer wrong turns between known points',
        'Weather tell — earlier storm/flood warnings',
        'Ambush periphery — subtle threat pips on the route UI',
      ],
      [
        'Survey ahead — spend time units to reveal the next leg',
        'Choose pace recommendation for the party',
        'Cut alternate path when the main trail is blocked',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'nav-common': 'circle',
        'nav-exotic': 'diamond',
        'nav-harsh': 'star',
        'nav-settlements': 'square',
      },
      iconIdeas: [
        'compass rose as grid center',
        'biome glyphs (snowflake, dune, canopy) on climate branches',
        'settlement pin for civil navigation',
        'eye icon for perception ovals',
      ],
      layoutNotes: 'Climate branches radiate like a compass; harsh climates are deeper star nodes.',
    }),
    influences: influences(
      {
        lens: 'Trail decisions, landmarks, fording choices, and the fog of not knowing the next stretch.',
        beats: [
          'Landmark checklist fantasy',
          'Wrong turn / lost days as skill failure',
          'Scout ahead before committing the wagons',
        ],
      },
      {
        lens: 'Survival + Perception + Navigator tools; Passive Perception as route-threat awareness.',
        beats: [
          'Wisdom (Survival) for overland navigation',
          "Passive Perception-style 'trail awareness' score",
          "Expertise fantasy on a favored biome (like Ranger's terrain)",
        ],
        abilityAnchors: ['Wisdom', 'Intelligence'],
      },
    ),
  }),
  profession({
    id: 'history',
    name: 'History',
    role: 'Historian',
    source: 'for-review',
    description:
      'Recover, interpret, and narrate the past — from tomb sites to living oral guides — unlocking lore, translations, and POI context.',
    tags: ['profession', 'lore', 'exploration', 'social', 'canon'],
    linkedSystems: ['Points of Interest', 'Minigame Systems'],
    subskills: [
      {
        id: 'tomb-raider',
        name: 'Tomb Raider',
        description: 'Safe excavation and reading of sealed sites and ruins.',
      },
      { id: 'translation', name: 'Translation', description: 'Scripts, dialects, and cipher recovery.' },
      {
        id: 'guide',
        name: 'Guide',
        description: 'Turning historical knowledge into practical route and camp advice.',
      },
    ],
    commonSkillIds: ['memory', 'communication', 'reading', 'focus'],
    skillTypes: skillTypes(
      [
        'Ruin literacy — auto-label known architectural styles',
        'Oral recall — retain NPC lore without reopening journals',
        'Context tooltips on landmarks you have studied',
      ],
      [
        'Translate inscription / cipher minigame',
        'Lecture / guide — convert lore into party buffs or route tips',
        'Careful excavation (artifact brushing close-up)',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: { 'tomb-raider': 'diamond', translation: 'square', guide: 'circle' },
      iconIdeas: ['scroll', 'quill', 'ruined arch', 'magnifying glass over glyph'],
      layoutNotes: 'Translation squares gate tomb-raider diamonds; guide circles are outward social spokes.',
    }),
    influences: influences(
      {
        lens: 'Trail guides, forts, and named landmarks as knowledge that shortens danger.',
        beats: [
          'Talking to locals at forts for route intel',
          'Historical shortcuts that skip deadly terrain',
          'Journal entries as permanent trail memory',
        ],
      },
      {
        lens: 'Intelligence (History) and related knowledge skills; Investigation adjacency for sites.',
        beats: [
          'Knowledge checks revealing hidden POI options',
          'Languages / scripts as unlockable tool-like proficiencies',
          'Lore dumps as rewarded active spends, not walls of text',
        ],
        abilityAnchors: ['Intelligence'],
      },
    ),
  }),
  profession({
    id: 'illusions',
    name: 'Illusions',
    role: 'Magician',
    source: 'for-review',
    description:
      'Performative and practical illusion craft for distraction, spectacle, and soft social influence. Subskill tree still open for design.',
    notes: "Original draft left subskills as '?'; proposed starter branches for workshopping.",
    tags: ['profession', 'magic', 'social', 'performance', 'canon', 'wip'],
    linkedSystems: ['Minigame Systems', 'Caravan Operations'],
    subskills: [
      {
        id: 'glamour',
        name: 'Glamour',
        description: 'Short-lived sensory overlays for stagecraft or negotiation.',
      },
      {
        id: 'misdirection',
        name: 'Misdirection',
        description: 'Attention shifts that aid stealth, theft prevention, or escape.',
      },
      {
        id: 'sigilcraft',
        name: 'Sigilcraft',
        description: 'Prepared glyphs that trigger illusion effects under conditions.',
      },
    ],
    commonSkillIds: ['charisma', 'sleight-of-hand', 'perception', 'focus'],
    skillTypes: skillTypes(
      [
        'Stage presence — audiences start friendlier',
        'Tell resistance — harder for others to spot your tells while performing',
        'Sigil durability — prepared glyphs last longer on the trail',
      ],
      [
        'Cast glamour — short active sensory overlay',
        'Misdirect — force a re-roll / attention shift in social or stealth scenes',
        'Inscribe sigil — place a delayed illusion trigger',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'star',
      branchShapes: { glamour: 'diamond', misdirection: 'triangle', sigilcraft: 'square' },
      iconIdeas: ['masks', 'spark burst', 'mirror shard', 'rune circle'],
      layoutNotes: 'Center star is signature showmanship; prepared sigils are square gates with limited slots.',
    }),
    influences: influences(
      {
        lens: 'Camp entertainment and trading-post charisma more than wagon mechanics — spectacle that buys goodwill.',
        beats: ['Morale shows at camp', 'Bluffing river-toll agents', 'Distraction during theft or escape'],
      },
      {
        lens: 'Illusion school fantasy; Charisma casting; Performance / Deception / Sleight of Hand trio.',
        beats: [
          'Spell slots → limited daily glamours (or time-unit costs)',
          'Concentration-like upkeep while traveling',
          'Cantrips-as-passives vs leveled actives',
        ],
        abilityAnchors: ['Charisma'],
      },
    ),
  }),
  profession({
    id: 'carpentry',
    name: 'Carpentry',
    role: 'Carpenter',
    source: 'for-review',
    description:
      'Wood shaping from whittled tokens to furniture and structural architecture for camps and cart fittings.',
    tags: ['profession', 'crafting', 'wood', 'camp', 'canon'],
    linkedSystems: ['Crafting and Item Attributes', 'Caravan Operations'],
    subskills: [
      {
        id: 'whittling-sculpting',
        name: 'Whittling / Sculpting',
        description: 'Fine detail work, charms, and decorative forms.',
      },
      {
        id: 'furniture',
        name: 'Furniture',
        description: 'Camp and settlement furniture with durability and beauty attributes.',
      },
      {
        id: 'architecture',
        name: 'Architecture',
        description: 'Larger structures, scaffolding, and load-bearing joins.',
      },
      {
        id: 'medium',
        name: 'Medium',
        description: 'Material choice and finishing for different wood mediums.',
      },
    ],
    commonSkillIds: ['artisanship', 'tool-handling', 'material-sense', 'spatial-reasoning'],
    skillTypes: skillTypes(
      [
        'Join quality floor — fewer catastrophic structural failures',
        'Beauty bias — decorative work trends higher beauty attributes',
        'Scrap thrift — offcuts still usable',
      ],
      [
        'Craft / repair wooden part',
        'Reinforce wagon frame (emergency brace)',
        'Build temporary scaffold or shelter frame',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'whittling-sculpting': 'circle',
        furniture: 'square',
        architecture: 'diamond',
        medium: 'oval',
      },
      iconIdeas: ['saw', 'chisel', 'beam joint', 'whittle curl'],
      layoutNotes: 'Medium ovals are shared material-sense satellites; architecture diamonds are deep investments.',
    }),
    influences: influences(
      {
        lens: 'Wagon repairs, replacement tongues/axles, and making camp livable.',
        beats: ['Broken wagon event → carpentry save', 'Spare parts crafting', 'Fort building fantasy'],
      },
      {
        lens: "Artisan tool proficiency (carpenter's tools); Strength for heavy timber, Dexterity for fine work.",
        beats: [
          "Tool proficiency gates advanced nodes",
          "Strength (Athletics) assist when raising frames",
          'Magic-item-adjacent masterwork as star nodes',
        ],
        abilityAnchors: ['Strength', 'Dexterity', 'Intelligence'],
      },
    ),
  }),
  profession({
    id: 'martial-combat',
    name: 'Martial Combat',
    role: 'Martial Fighter',
    source: 'for-review',
    description:
      'Close-quarters fighting for caravan defense, escorts, and threat encounters. Draft placeholder expanded for workshopping.',
    notes: 'Listed without subskills in For Review; subskills proposed.',
    tags: ['profession', 'combat', 'defense', 'canon', 'wip'],
    linkedSystems: ['Caravan Operations', 'Traversal and Routes'],
    subskills: [
      { id: 'blades', name: 'Blades', description: 'Swords, knives, and edged weapon forms.' },
      { id: 'bludgeons', name: 'Bludgeons', description: 'Maces, staves, and impact weapons.' },
      {
        id: 'unarmed',
        name: 'Unarmed',
        description: 'Grapples, strikes, and restraint without weapons.',
      },
      {
        id: 'formation',
        name: 'Formation',
        description: 'Coordinated defense with other fighters and wagon hardpoints.',
      },
    ],
    commonSkillIds: ['strength', 'endurance', 'perception', 'steady-hand'],
    skillTypes: skillTypes(
      [
        'Guard stance — better default defense when assigned to watch',
        'Armor familiarity — reduced fatigue in worn kits',
        'Threat assessment — read enemy reach/weapon at a glance',
      ],
      [
        'Strike / clash actions in combat encounters',
        'Hold the line — formation active that shields wagons',
        'Disarm / restrain for nonlethal outcomes',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: { blades: 'diamond', bludgeons: 'diamond', unarmed: 'circle', formation: 'triangle' },
      iconIdeas: ['crossed swords', 'shield boss', 'fist', 'wagon barricade'],
      layoutNotes: 'Weapon diamonds unlock active techniques; formation triangles bridge to Leadership.',
    }),
    influences: influences(
      {
        lens: 'Bandit fights and defending the circle of wagons — rare but decisive.',
        beats: ['Ambush on the trail', 'Guard duty at night', 'Escort contracts between forts'],
      },
      {
        lens: 'Weapon / armor proficiencies, Fighting Styles, Action/Bonus Action/Reaction vocabulary.',
        beats: [
          'Map actives to action economy without full CR math',
          'Strength vs Dexterity weapon tracks',
          'Second Wind–like recovery as an endurance active',
        ],
        abilityAnchors: ['Strength', 'Dexterity', 'Constitution'],
      },
    ),
  }),
  profession({
    id: 'ranged-combat',
    name: 'Ranged Combat',
    role: 'Marksman',
    source: 'for-review',
    description:
      'Projectile and thrown weapons for hunting support and standoff defense along the trail.',
    notes: 'Listed without subskills in For Review; subskills proposed.',
    tags: ['profession', 'combat', 'hunting', 'defense', 'canon', 'wip'],
    linkedSystems: ['Caravan Operations', 'Biomes'],
    subskills: [
      { id: 'bows', name: 'Bows', description: 'Draw strength, ranging, and shot selection.' },
      {
        id: 'crossbows',
        name: 'Crossbows',
        description: 'Reload discipline and fortified wagon firing positions.',
      },
      {
        id: 'thrown',
        name: 'Thrown',
        description: 'Knives, spears, and improvised projectiles.',
      },
      {
        id: 'spotting',
        name: 'Spotting',
        description: 'Calling targets and wind/elevation for allies.',
      },
    ],
    commonSkillIds: ['perception', 'steady-hand', 'focus', 'endurance'],
    skillTypes: skillTypes(
      [
        'Ammo discipline — less waste on panic fire',
        'Range estimation — clearer distance readouts',
        'Steady breath — reduced sway after movement',
      ],
      [
        'Aimed shot / volley',
        'Hunting shot with scarcity risk (miss = spooked game)',
        'Call mark — spotting active that buffs allies',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: { bows: 'diamond', crossbows: 'square', thrown: 'circle', spotting: 'oval' },
      iconIdeas: ['bow arc', 'bolt', 'crosshair', 'wind feather'],
      layoutNotes: 'Crossbow squares emphasize wagon hardpoint setups; spotting ovals shared with Scouting.',
    }),
    influences: influences(
      {
        lens: 'Hunting screens, bullets/powder as scarce resources, and choosing not to shoot.',
        beats: [
          'Ammo inventory anxiety',
          'Overhunting moral/mechanical waste',
          'Shooting from wagon cover',
        ],
      },
      {
        lens: 'Dexterity attack fantasy; Sharpshooter-like risk nodes; Archery fighting style.',
        beats: [
          'Dexterity (primary) with Wisdom for spotting',
          'Cover / long-range disadvantage as readable UI',
          'Hunter extras without locking Ranger class',
        ],
        abilityAnchors: ['Dexterity', 'Wisdom'],
      },
    ),
  }),
);

const generated = [
  {
    id: 'mining',
    name: 'Mining',
    role: 'Miner',
    description:
      'Extract ore, stone, and gemstones. Sphere-grid nodes may cover tool tiers, gem finds, and quality retention while breaking harder materials.',
    tags: ['profession', 'gathering', 'resources', 'generated'],
    linkedSystems: ['Crafting and Item Attributes', 'Points of Interest'],
    subskills: [
      { id: 'prospecting', name: 'Prospecting', description: 'Reading veins and choosing dig sites.' },
      {
        id: 'extraction',
        name: 'Extraction',
        description: 'Efficient breakage and haul without wasting ore quality.',
      },
      {
        id: 'gemcraft-sense',
        name: 'Gemcraft Sense',
        description: 'Spotting and preserving gemstone pockets.',
      },
      { id: 'tunnel-safety', name: 'Tunnel Safety', description: 'Supports, air, and collapse avoidance.' },
    ],
    commonSkillIds: ['material-sense', 'tool-handling', 'strength', 'endurance'],
    skillTypes: skillTypes(
      ['Vein intuition', 'Tool wear foresight', 'Dust/collapse peripheral warnings'],
      ['Prospect sweep', 'Extract seam', 'Shore tunnel'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        prospecting: 'circle',
        extraction: 'diamond',
        'gemcraft-sense': 'star',
        'tunnel-safety': 'square',
      },
      iconIdeas: ['pickaxe', 'ore chunk', 'gem glint', 'timber support'],
      layoutNotes: 'Tool-tier squares gate deeper extraction diamonds.',
    }),
    influences: influences(
      {
        lens: 'Less classic OT, more westward prospecting fantasy — side trails to claim sites.',
        beats: ['Detour days for a claim', 'Cave-ins as trail disasters', 'Ore as trade cargo'],
      },
      {
        lens: "Strength + tool proficiency; Dungeoneer's pack fantasy for delves.",
        beats: ["Strength (Athletics) for haul", 'Investigation for gem pockets'],
        abilityAnchors: ['Strength', 'Wisdom'],
      },
    ),
  },
  {
    id: 'smithing',
    name: 'Smithing',
    role: 'Smith',
    description:
      'Forge tools, fittings, and weapons from refined metals. Heat control and hammer timing map to durability and edge attributes.',
    tags: ['profession', 'crafting', 'metal', 'workshop', 'generated'],
    linkedSystems: ['Crafting and Item Attributes', 'Minigame Systems', 'Caravan Operations'],
    subskills: [
      {
        id: 'tool-forging',
        name: 'Tool Forging',
        description: 'Axes, picks, hammers, and camp implements.',
      },
      {
        id: 'weapon-forging',
        name: 'Weapon Forging',
        description: 'Blades and heads with combat-ready attributes.',
      },
      {
        id: 'fitting-hardware',
        name: 'Fitting Hardware',
        description: 'Nails, brackets, axle parts, and wagon ironwork.',
      },
      {
        id: 'heat-control',
        name: 'Heat Control',
        description: 'Furnace and forge temperature mastery (ties to Stoke the Hearth-style play).',
      },
    ],
    commonSkillIds: ['fire-tending', 'artisanship', 'strength', 'material-sense'],
    skillTypes: skillTypes(
      ['Temper judgment', 'Heat color literacy', 'Repair estimate accuracy'],
      ['Forge piece', 'Re-temper emergency repair', 'Stoke forge minigame'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'tool-forging': 'square',
        'weapon-forging': 'diamond',
        'fitting-hardware': 'circle',
        'heat-control': 'star',
      },
      iconIdeas: ['anvil', 'hammer', 'bellows', 'horseshoe / axle ring'],
      layoutNotes: 'Heat-control stars radiate into every forging branch.',
    }),
    influences: influences(
      {
        lens: 'Blacksmith stops at forts; replacing critical iron wagon parts.',
        beats: ['Fort smith as NPC fallback', 'Mobile forge cart fantasy', 'Nail/shortage events'],
      },
      {
        lens: "Smith's tools proficiency; magic weapon crafting as endgame stars.",
        beats: ['Tool proficiency gates', 'Rare material components as reagents'],
        abilityAnchors: ['Strength', 'Intelligence'],
      },
    ),
  },
  {
    id: 'foraging',
    name: 'Foraging',
    role: 'Forager',
    description:
      'Gather wild plants, fungi, and trail foods across biomes, feeding cooking and medicine loops.',
    tags: ['profession', 'gathering', 'food', 'biomes', 'generated'],
    linkedSystems: ['Biomes', 'Crafting and Item Attributes', 'Caravan Operations'],
    subskills: [
      { id: 'edibles', name: 'Edibles', description: 'Safe food plants and seasonal windows.' },
      {
        id: 'medicinals',
        name: 'Medicinals',
        description: 'Herbs suited for treatments and poultices.',
      },
      { id: 'fiber-dyes', name: 'Fiber & Dyes', description: 'Materials for textiles and coloring.' },
      {
        id: 'toxin-sense',
        name: 'Toxin Sense',
        description: 'Avoiding lookalikes and contaminated patches.',
      },
    ],
    commonSkillIds: ['plant-identification', 'perception', 'weather-sense', 'organization'],
    skillTypes: skillTypes(
      ['Seasonal calendar sense', 'Lookalike warnings', 'Patch memory on revisited routes'],
      ['Forage sweep (time-unit spend)', 'Harvest medicinal', 'Test unknown plant carefully'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        edibles: 'circle',
        medicinals: 'diamond',
        'fiber-dyes': 'square',
        'toxin-sense': 'triangle',
      },
      iconIdeas: ['leaf cluster', 'berry', 'mortar herb', 'warning skull-leaf'],
      layoutNotes: 'Toxin-sense triangles gate risky exotic edibles.',
    }),
    influences: influences(
      {
        lens: 'Living off the land when rations run short; berries vs dysentery risk.',
        beats: ['Forage vs march time', 'Poisonous plant failure state', 'Seasonal scarcity'],
      },
      {
        lens: 'Wisdom (Survival / Nature) gathering; herbalism kit adjacency.',
        beats: ['Nature checks for identification', 'Herbalism kit for medicinals'],
        abilityAnchors: ['Wisdom'],
      },
    ),
  },
  {
    id: 'medicine',
    name: 'Medicine',
    role: 'Medic',
    description:
      'Treat injuries, illness, and exhaustion from Red Zone overwork, poor upkeep, or trail hazards.',
    tags: ['profession', 'support', 'camp', 'survival', 'generated'],
    linkedSystems: ['Time and Scheduling', 'Minigame Systems', 'Caravan Operations'],
    subskills: [
      {
        id: 'field-aid',
        name: 'Field Aid',
        description: 'Stabilize wounds and trauma on the trail.',
      },
      {
        id: 'disease-care',
        name: 'Disease Care',
        description: 'Sickness from neglect, water, or pests.',
      },
      {
        id: 'recovery',
        name: 'Recovery',
        description: 'Exhaustion, Rust, and long convalescence plans.',
      },
      {
        id: 'triage',
        name: 'Triage',
        description: 'Prioritizing limited time units across multiple patients.',
      },
    ],
    commonSkillIds: ['plant-identification', 'focus', 'communication', 'patience'],
    skillTypes: skillTypes(
      [
        'Symptom literacy — clearer illness readouts',
        'Infection risk floor',
        'Recovery schedule accuracy (Time Fog lift on care tasks)',
      ],
      [
        'Treat wound / disease',
        'Administer rest plan',
        'Quarantine decision for contagious cases',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'field-aid': 'diamond',
        'disease-care': 'star',
        recovery: 'circle',
        triage: 'triangle',
      },
      iconIdeas: ['caduceus-lite / cross kit', 'thermometer', 'bandage', 'bedroll'],
      layoutNotes: 'Disease-care stars are Oregon Trail–critical; triage triangles link to Leadership.',
    }),
    influences: influences(
      {
        lens: 'The iconic trail illness loop — cholera, exhaustion, injury — and the doctor occupation fantasy.',
        beats: [
          'Named illnesses with care trees',
          'Rest vs press-on with a sick companion',
          'Medicine as scarce inventory',
        ],
      },
      {
        lens: 'Wisdom (Medicine); healer kit; short-rest / long-rest recovery pacing.',
        beats: [
          'Healer kit charges as actives',
          'Hit-dice-like recovery spends',
          'Diagnosis as Investigation/Medicine hybrid',
        ],
        abilityAnchors: ['Wisdom'],
      },
    ),
  },
  {
    id: 'mercantile',
    name: 'Mercantile',
    role: 'Merchant',
    description:
      'Buy, sell, and match goods to buyer preferences. Crafted quality is multidimensional — the same item can be prized by one customer and wrong for another.',
    tags: ['profession', 'trade', 'social', 'caravan', 'generated'],
    linkedSystems: ['Caravan Operations', 'Crafting and Item Attributes'],
    subskills: [
      { id: 'appraisal', name: 'Appraisal', description: 'Reading material value and hidden flaws.' },
      { id: 'haggling', name: 'Haggling', description: 'Price discovery and concession timing.' },
      {
        id: 'market-sense',
        name: 'Market Sense',
        description: 'Demand by settlement, culture, and species preference.',
      },
      {
        id: 'caravan-ledger',
        name: 'Caravan Ledger',
        description: 'Profit tracking across long expeditions.',
      },
    ],
    commonSkillIds: ['negotiation', 'charisma', 'organization', 'resource-accounting'],
    skillTypes: skillTypes(
      ['Price intuition', 'Preference matching hints', 'Ledger accuracy'],
      ['Open trade', 'Haggle round', 'Commission buy order'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        appraisal: 'circle',
        haggling: 'diamond',
        'market-sense': 'star',
        'caravan-ledger': 'square',
      },
      iconIdeas: ['scales', 'coin purse', 'ledger book', 'handshake'],
      layoutNotes: 'Market-sense stars are regional; ledger squares are management satellites.',
    }),
    influences: influences(
      {
        lens: 'Trading posts, buying supplies before the long haul, selling scavenged goods.',
        beats: ['Fort price lists', 'Bulk supply buys', 'Cash vs barter'],
      },
      {
        lens: 'Persuasion / Deception for deals; Intelligence for appraisal; background Merchant.',
        beats: ['Charisma (Persuasion) haggling', 'Insight to read merchants'],
        abilityAnchors: ['Charisma', 'Intelligence'],
      },
    ),
  },
  {
    id: 'wagonwright',
    name: 'Wagonwright',
    role: 'Wagonwright',
    description:
      'Build and maintain carts, axles, canvas, and hardpoints that define caravan composition and specialization.',
    tags: ['profession', 'crafting', 'caravan', 'maintenance', 'generated'],
    linkedSystems: ['Caravan Operations', 'Minigame Systems', 'Traversal and Routes'],
    subskills: [
      { id: 'chassis', name: 'Chassis', description: 'Frames, load ratings, and cart roles.' },
      {
        id: 'axle-wheel',
        name: 'Axle & Wheel',
        description: 'Friction management (Axle Grease) and break risk.',
      },
      {
        id: 'canvas-rigging',
        name: 'Canvas & Rigging',
        description: 'Covers, ties, and weatherproofing (Patchwork Quilt).',
      },
      {
        id: 'hardpoints',
        name: 'Hardpoints',
        description: 'Mounts for workshops, defense, or specialty gear.',
      },
    ],
    commonSkillIds: ['tool-handling', 'material-sense', 'spatial-reasoning', 'artisanship'],
    skillTypes: skillTypes(
      ['Breakdown foresight', 'Load rating clarity', 'Weatherproofing floor'],
      ['Repair axle/wheel (Axle Grease)', 'Patch canvas', 'Install hardpoint'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        chassis: 'square',
        'axle-wheel': 'diamond',
        'canvas-rigging': 'circle',
        hardpoints: 'star',
      },
      iconIdeas: ['wagon side-view', 'wheel', 'grease pot', 'canvas arch'],
      layoutNotes: 'Axle diamonds are high-frequency actives; hardpoint stars unlock cart roles.',
    }),
    influences: influences(
      {
        lens: 'The wagon itself as the protagonist machine — breakdowns, spare parts, caulk for rivers.',
        beats: ['Broken wheel/axle events', 'Caulking before deep fords', 'Spare part inventory'],
      },
      {
        lens: "Cartwright / woodcarver's tools; vehicle rules as soft inspiration for cart HP.",
        beats: ['Object HP for wagons', 'Tool proficiency for repairs'],
        abilityAnchors: ['Intelligence', 'Strength'],
      },
    ),
  },
  {
    id: 'survival',
    name: 'Survival',
    role: 'Survivalist',
    description:
      'Campcraft, shelter, water, and fleet-level survival accounting awareness for long journeys under resource pressure.',
    tags: ['profession', 'camp', 'survival', 'caravan', 'generated'],
    linkedSystems: ['Caravan Operations', 'Time and Scheduling', 'Biomes'],
    subskills: [
      { id: 'shelter', name: 'Shelter', description: 'Campsites that resist weather and pests.' },
      {
        id: 'watercraft',
        name: 'Watercraft',
        description: 'Finding, siphoning, and filtering water (Siphon & Filter).',
      },
      {
        id: 'fuel',
        name: 'Fuel',
        description: 'Gathering and rationing burnables for heat and cooking.',
      },
      {
        id: 'fleet-upkeep',
        name: 'Fleet Upkeep',
        description: 'Understanding background survival needs on large expeditions.',
      },
    ],
    commonSkillIds: ['fire-tending', 'weather-sense', 'organization', 'resource-accounting'],
    skillTypes: skillTypes(
      ['Exposure warnings', 'Water purity intuition', 'Camp risk summary'],
      ['Make camp', 'Purify water', 'Set watch / fire plan'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        shelter: 'circle',
        watercraft: 'diamond',
        fuel: 'square',
        'fleet-upkeep': 'oval',
      },
      iconIdeas: ['tent', 'water drop + filter', 'firewood', 'clipboard tally'],
      layoutNotes: 'Fleet-upkeep ovals are leadership-shared satellites.',
    }),
    influences: influences(
      {
        lens: 'Core Oregon Trail fantasy — weather, water, food, morale, and making miles.',
        beats: ['Weather events', 'Bad water', 'Pace vs health', 'Camp every night'],
      },
      {
        lens: 'Wisdom (Survival) as the umbrella skill; Ranger/Outlander backgrounds.',
        beats: ['Survival checks for campsite quality', 'Natural explorer-like biome comfort'],
        abilityAnchors: ['Wisdom', 'Constitution'],
      },
    ),
  },
  {
    id: 'tailoring',
    name: 'Tailoring',
    role: 'Tailor',
    description:
      'Repair and create clothing, canvas patches, and soft goods that affect beauty, durability, and weather protection.',
    tags: ['profession', 'crafting', 'textiles', 'camp', 'generated'],
    linkedSystems: ['Minigame Systems', 'Crafting and Item Attributes'],
    subskills: [
      { id: 'mending', name: 'Mending', description: 'Fast repairs under tension constraints.' },
      {
        id: 'garmenting',
        name: 'Garmenting',
        description: 'Fitted clothing with cultural and climate variants.',
      },
      {
        id: 'upholstery',
        name: 'Upholstery',
        description: 'Wagon interiors and padded fittings.',
      },
      {
        id: 'patternwork',
        name: 'Patternwork',
        description: 'Cutting efficiency and waste reduction.',
      },
    ],
    commonSkillIds: ['artisanship', 'steady-hand', 'patience', 'material-sense'],
    skillTypes: skillTypes(
      ['Cold/weather resist floor on worn pieces', 'Tear warnings', 'Fit comfort'],
      ['Mend (Patchwork Quilt)', 'Sew garment', 'Reinforce canvas'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        mending: 'diamond',
        garmenting: 'circle',
        upholstery: 'square',
        patternwork: 'oval',
      },
      iconIdeas: ['needle', 'spool', 'patch square', 'coat silhouette'],
      layoutNotes: 'Mending diamonds are frequent trail actives.',
    }),
    influences: influences(
      {
        lens: 'Clothes wearing out; blankets and canvas as survival gear.',
        beats: ['Clothing condition', 'Weather protection', 'Trade fine clothes at settlements'],
      },
      {
        lens: "Weaver's / tailor's tools; cold weather gear as item bonuses.",
        beats: ['Tool proficiency', 'Climate clothing as equipment slots'],
        abilityAnchors: ['Dexterity'],
      },
    ),
  },
  {
    id: 'salvage',
    name: 'Salvage',
    role: 'Salvager',
    description:
      'Recover parts, open locked caches, and calibrate found devices at points of interest.',
    tags: ['profession', 'exploration', 'resources', 'poi', 'generated'],
    linkedSystems: ['Points of Interest', 'Minigame Systems', 'Crafting and Item Attributes'],
    subskills: [
      { id: 'lockwork', name: 'Lockwork', description: "Locks and dials (Scavenger's Dial)." },
      {
        id: 'disassembly',
        name: 'Disassembly',
        description: 'Breaking assemblies into reusable components.',
      },
      {
        id: 'reclamation',
        name: 'Reclamation',
        description: 'Cleaning and grading recovered materials.',
      },
      {
        id: 'jury-rig',
        name: 'Jury-Rig',
        description: 'Temporary fixes that buy time until proper repair.',
      },
    ],
    commonSkillIds: ['sleight-of-hand', 'tool-handling', 'perception', 'material-sense'],
    skillTypes: skillTypes(
      ['Cache tell — notice salvageable wrecks', 'Part grade foresight'],
      ["Pick / calibrate (Scavenger's Dial)", 'Strip wreck', 'Jury-rig repair'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        lockwork: 'diamond',
        disassembly: 'square',
        reclamation: 'circle',
        'jury-rig': 'triangle',
      },
      iconIdeas: ['lock dial', 'wrench', 'scrap pile', 'tape/bind icon'],
      layoutNotes: 'Jury-rig triangles bridge to Wagonwright and Engineering.',
    }),
    influences: influences(
      {
        lens: 'Abandoned wagons and forts as loot — take what you can haul.',
        beats: ['Looting wrecks', 'Weight limits on salvage', 'Broken gear as parts'],
      },
      {
        lens: "Thieves' tools + tinker's tools; Dexterity (Sleight of Hand).",
        beats: ['Lockpicking actives', 'Improvised tools'],
        abilityAnchors: ['Dexterity', 'Intelligence'],
      },
    ),
  },
  {
    id: 'leadership',
    name: 'Leadership',
    role: 'Caravan Leader',
    description:
      'Delegate NPC chores, set day plans, and buy back personal time units for mastery while the caravan runs in parallel.',
    tags: ['profession', 'social', 'caravan', 'management', 'generated'],
    linkedSystems: ['Caravan Operations', 'Time and Scheduling'],
    subskills: [
      {
        id: 'delegation',
        name: 'Delegation',
        description: 'Assigning tasks NPCs can automate vs. those needing oversight.',
      },
      {
        id: 'morale',
        name: 'Morale',
        description: 'Keeping the company willing under pressure.',
      },
      {
        id: 'scheduling',
        name: 'Scheduling',
        description: 'Day plans under Time Fog and efficiency curves.',
      },
      {
        id: 'conflict',
        name: 'Conflict',
        description: 'Resolving disputes before they cost time or supplies.',
      },
    ],
    commonSkillIds: ['communication', 'charisma', 'morale-sense', 'time-sense'],
    skillTypes: skillTypes(
      ['Party morale visibility', 'Delegation reliability', 'Schedule fog reduction'],
      ['Issue orders for the day', 'Rally / speech', 'Mediate dispute'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'star',
      branchShapes: {
        delegation: 'square',
        morale: 'diamond',
        scheduling: 'circle',
        conflict: 'triangle',
      },
      iconIdeas: ['banner', 'megaphone / horn', 'calendar', 'balanced scales'],
      layoutNotes: 'Center star is captain identity; scheduling circles lift Time Fog.',
    }),
    influences: influences(
      {
        lens: 'You are the wagon captain setting pace, rations, and who rests.',
        beats: ['Pace dial', 'Ration dial', 'Party complaints', 'Who dies / who you leave'],
      },
      {
        lens: 'Charisma (Persuasion/Intimidation); Battle Master / Command-like party buffs.',
        beats: ['Help action as delegation fantasy', 'Inspiration-like morale spends'],
        abilityAnchors: ['Charisma', 'Wisdom'],
      },
    ),
  },
  {
    id: 'horticulture',
    name: 'Horticulture',
    role: 'Grower',
    description:
      'Cultivate portable plots, seed stores, and settlement gardens that stabilize food and medicinal supply.',
    tags: ['profession', 'crafting', 'food', 'settlement', 'generated'],
    linkedSystems: ['Biomes', 'Caravan Operations', 'Crafting and Item Attributes'],
    subskills: [
      {
        id: 'soilcraft',
        name: 'Soilcraft',
        description: 'Soil health and container growing on the move.',
      },
      {
        id: 'crop-cycles',
        name: 'Crop Cycles',
        description: 'Timing plantings to route seasons.',
      },
      {
        id: 'pest-control',
        name: 'Pest Control',
        description: 'Protecting stores (Pest Shakedown adjacency).',
      },
      {
        id: 'seed-banking',
        name: 'Seed Banking',
        description: 'Preserving cultivars across biomes.',
      },
    ],
    commonSkillIds: ['plant-identification', 'patience', 'organization', 'weather-sense'],
    skillTypes: skillTypes(
      ['Growth ETA clarity', 'Pest risk pips', 'Season match hints'],
      ['Tend plot', 'Harvest', 'Pest Shakedown'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        soilcraft: 'circle',
        'crop-cycles': 'oval',
        'pest-control': 'diamond',
        'seed-banking': 'square',
      },
      iconIdeas: ['sprout', 'planter box', 'bug', 'seed pouch'],
      layoutNotes: 'Slower grid — many passives, few high-impact harvest diamonds.',
    }),
    influences: influences(
      {
        lens: 'Settlement farming after arrival; less daily OT, more homestead endgame.',
        beats: ['Plant at a fort stay', 'Lose crops to weather', 'Seed as cargo'],
      },
      {
        lens: 'Nature proficiency; downtime crafting seasons.',
        beats: ['Downtime days = growth ticks', 'Nature checks for soil'],
        abilityAnchors: ['Wisdom', 'Intelligence'],
      },
    ),
  },
  {
    id: 'leatherworking',
    name: 'Leatherworking',
    role: 'Leatherworker',
    description:
      'Cure hides and craft straps, armor pieces, and soft containers from hunted or traded skins.',
    tags: ['profession', 'crafting', 'animals', 'gear', 'generated'],
    linkedSystems: ['Crafting and Item Attributes', 'Caravan Operations'],
    subskills: [
      { id: 'tanning', name: 'Tanning', description: 'Curing hides for durability and feel.' },
      {
        id: 'strapwork',
        name: 'Strapwork',
        description: 'Harnesses, belts, and fastening systems.',
      },
      {
        id: 'soft-armor',
        name: 'Soft Armor',
        description: 'Protective garments with mobility tradeoffs.',
      },
      {
        id: 'containers',
        name: 'Containers',
        description: 'Bags and cases that interact with storage puzzles.',
      },
    ],
    commonSkillIds: ['artisanship', 'material-sense', 'tool-handling', 'patience'],
    skillTypes: skillTypes(
      ['Hide grade literacy', 'Strap failure warnings'],
      ['Tan hide', 'Craft harness/armor', 'Stitch container'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        tanning: 'circle',
        strapwork: 'square',
        'soft-armor': 'diamond',
        containers: 'oval',
      },
      iconIdeas: ['hide', 'awl', 'chestpiece', 'satchel'],
      layoutNotes: 'Hunting → leatherworking pipeline via triangle gates from Animal Handling.',
    }),
    influences: influences(
      {
        lens: 'Using every part of the hunt; harnesses for oxen.',
        beats: ['Hide as byproduct of hunting', 'Broken harness events'],
      },
      {
        lens: "Leatherworker's tools; light/medium armor crafting.",
        beats: ['Armor categories as milestones', 'Tool proficiency'],
        abilityAnchors: ['Dexterity', 'Intelligence'],
      },
    ),
  },
  {
    id: 'masonry',
    name: 'Masonry',
    role: 'Mason',
    description: 'Work stone for fortifications, POI restoration, and heavy settlement builds.',
    tags: ['profession', 'crafting', 'stone', 'settlement', 'generated'],
    linkedSystems: ['Points of Interest', 'Crafting and Item Attributes'],
    subskills: [
      { id: 'cutting', name: 'Cutting', description: 'Shaping blocks and fitted stones.' },
      {
        id: 'setting',
        name: 'Setting',
        description: 'Load-bearing placement and mortar timing.',
      },
      {
        id: 'restoration',
        name: 'Restoration',
        description: 'Repairing ruins without losing historical value.',
      },
      {
        id: 'defensive-works',
        name: 'Defensive Works',
        description: 'Temporary barriers and camp fortification.',
      },
    ],
    commonSkillIds: ['strength', 'spatial-reasoning', 'material-sense', 'patience'],
    skillTypes: skillTypes(
      ['Structural integrity read', 'Mortar timing window clarity'],
      ['Cut stone', 'Set wall', 'Raise hasty barricade'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        cutting: 'square',
        setting: 'diamond',
        restoration: 'star',
        'defensive-works': 'triangle',
      },
      iconIdeas: ['chisel', 'keystone', 'ruined wall', 'palisade'],
      layoutNotes: 'Restoration stars bridge History; defensive triangles bridge Martial Combat.',
    }),
    influences: influences(
      {
        lens: 'Forts as safe hubs; building lasting places after the trail.',
        beats: ['Fort walls', 'Repairing waystations', 'Rockslides clearing'],
      },
      {
        lens: "Mason's tools; Strength (Athletics) for heavy placement.",
        beats: ['Object HP for walls', 'Tool proficiency'],
        abilityAnchors: ['Strength', 'Intelligence'],
      },
    ),
  },
  {
    id: 'performance',
    name: 'Performance',
    role: 'Performer',
    description:
      'Music, theater, and spectacle for specialty performance caravans — revenue, morale, and soft power in settlements.',
    tags: ['profession', 'social', 'specialty', 'caravan', 'generated'],
    linkedSystems: ['Caravan Operations', 'Minigame Systems'],
    subskills: [
      { id: 'music', name: 'Music', description: 'Instruments and ensemble timing.' },
      { id: 'stagecraft', name: 'Stagecraft', description: 'Sets, cues, and crowd flow.' },
      {
        id: 'storytelling',
        name: 'Storytelling',
        description: 'Narratives that sell shows and open doors.',
      },
      {
        id: 'crowdwork',
        name: 'Crowdwork',
        description: 'Reading audiences and defusing hecklers.',
      },
    ],
    commonSkillIds: ['charisma', 'communication', 'memory', 'sleight-of-hand'],
    skillTypes: skillTypes(
      ['Crowd warmth', 'Setlist memory', 'Morale aura at camp'],
      ['Perform set', 'Story hour', 'Call-and-response rally'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'star',
      branchShapes: {
        music: 'diamond',
        stagecraft: 'square',
        storytelling: 'circle',
        crowdwork: 'triangle',
      },
      iconIdeas: ['lute', 'masks', 'spotlight', 'clapping hands'],
      layoutNotes: 'Overlaps Illusions via misdirection triangles.',
    }),
    influences: influences(
      {
        lens: 'Campfire songs and fort entertainment for cash and morale.',
        beats: ['Play for supper', 'Morale bump after a show', 'Reputation in towns'],
      },
      {
        lens: 'Charisma (Performance); bardic inspiration as morale active.',
        beats: ['Bardic inspiration → ally buff spends', 'Instrument tool proficiency'],
        abilityAnchors: ['Charisma'],
      },
    ),
  },
  {
    id: 'engineering',
    name: 'Engineering',
    role: 'Engineer',
    description:
      'Mechanical problem-solving for winches, pulleys, bridges, and trail obstacles that need more than brute force.',
    tags: ['profession', 'crafting', 'traversal', 'problem-solving', 'generated'],
    linkedSystems: ['Minigame Systems', 'Traversal and Routes'],
    subskills: [
      {
        id: 'rigging',
        name: 'Rigging',
        description: 'Winch & Pulley recoveries and tension management.',
      },
      {
        id: 'bridging',
        name: 'Bridging',
        description: 'Temporary crossings and high-line setups.',
      },
      { id: 'mechanisms', name: 'Mechanisms', description: 'Gears, locks, and simple machines.' },
      {
        id: 'field-survey',
        name: 'Field Survey',
        description: 'Measuring spans, grades, and load limits.',
      },
    ],
    commonSkillIds: ['spatial-reasoning', 'tool-handling', 'focus', 'resource-accounting'],
    skillTypes: skillTypes(
      ['Load limit clarity', 'Tension warning pips', 'Grade estimation'],
      ['Winch & Pulley recovery', 'Raise temporary bridge', 'Survey span'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        rigging: 'diamond',
        bridging: 'star',
        mechanisms: 'square',
        'field-survey': 'circle',
      },
      iconIdeas: ['pulley', 'bridge span', 'gear', 'survey scope'],
      layoutNotes: 'Bridging stars are rare route-openers; rigging diamonds are common trail saves.',
    }),
    influences: influences(
      {
        lens: 'Getting wagons unstuck, crossing gaps, improvising when the trail breaks.',
        beats: ['Stuck in mud', 'Broken bridge detour', 'Lowering wagons down grades'],
      },
      {
        lens: "Tinker's tools / carpenter's tools; Intelligence (Investigation) for devices.",
        beats: ['Improvised structures', 'Object interaction puzzles'],
        abilityAnchors: ['Intelligence', 'Strength'],
      },
    ),
  },
  {
    id: 'diplomacy',
    name: 'Diplomacy',
    role: 'Diplomat',
    description:
      'Negotiate passage, contracts, and cultural friction with settlements, factions, and rival caravans.',
    tags: ['profession', 'social', 'factions', 'trade', 'generated'],
    linkedSystems: ['Caravan Operations', 'Factions Index'],
    subskills: [
      { id: 'etiquette', name: 'Etiquette', description: 'Customs that open or close doors.' },
      {
        id: 'treaties',
        name: 'Treaties',
        description: 'Formal agreements with lasting route effects.',
      },
      { id: 'mediation', name: 'Mediation', description: 'Third-party conflict resolution.' },
      {
        id: 'intel',
        name: 'Intel',
        description: 'Reading motives without open confrontation.',
      },
    ],
    commonSkillIds: ['charisma', 'communication', 'negotiation', 'memory'],
    skillTypes: skillTypes(
      ['Faction standing clarity', 'Etiquette warnings', 'Rumor credibility'],
      ['Open talks', 'Draft treaty', 'Mediate'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        etiquette: 'circle',
        treaties: 'star',
        mediation: 'diamond',
        intel: 'oval',
      },
      iconIdeas: ['olive branch', 'sealed letter', 'two masks talking', 'ear / whisper'],
      layoutNotes: 'Treaty stars are campaign-long; intel ovals shared with Insight.',
    }),
    influences: influences(
      {
        lens: 'Talking past tolls, tribal encounters, and fort governors instead of shooting.',
        beats: ['Peaceful encounter options', 'Guides for hire', 'Reputation between forts'],
      },
      {
        lens: 'Persuasion / Insight / Deception triad; social encounter structure.',
        beats: ['Social combat-lite', 'Insight vs Deception', 'Faction renown'],
        abilityAnchors: ['Charisma', 'Wisdom'],
      },
    ),
  },
  {
    id: 'stealth',
    name: 'Stealth',
    role: 'Infiltrator',
    description:
      'Quiet movement, concealment, and low-profile approach for scouting hostile ground or avoiding tolls and ambushes.',
    tags: ['profession', 'exploration', 'combat-adjacent', 'generated'],
    linkedSystems: ['Traversal and Routes', 'Biomes', 'Scouting'],
    subskills: [
      {
        id: 'concealment',
        name: 'Concealment',
        description: 'Camouflage against biome backdrops.',
      },
      { id: 'silent-move', name: 'Silent Move', description: 'Noise discipline on approach.' },
      {
        id: 'shadowing',
        name: 'Shadowing',
        description: 'Following targets without being noticed.',
      },
      { id: 'escape', name: 'Escape', description: 'Breaking contact when spotted.' },
    ],
    commonSkillIds: ['perception', 'sleight-of-hand', 'endurance', 'weather-sense'],
    skillTypes: skillTypes(
      ['Noise footprint reduction', 'Biome camo match', 'Detection foresight'],
      ['Sneak approach', 'Hide party/wagon off-trail', 'Break contact'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        concealment: 'circle',
        'silent-move': 'diamond',
        shadowing: 'oval',
        escape: 'triangle',
      },
      iconIdeas: ['hooded figure', 'footprint fade', 'eye slash', 'smoke puff'],
      layoutNotes: 'Escape triangles pivot into Athletics / Scouting.',
    }),
    influences: influences(
      {
        lens: 'Avoiding bandits and hostile encounters by not being seen — OT often forced fights; this is the opt-out craft.',
        beats: ['Hide wagon off-road', 'Scout without alerting', 'Night approaches to forts'],
      },
      {
        lens: 'Dexterity (Stealth); Pass Without Trace–like passives; light/obscurement rules soft-mapped.',
        beats: ['Hide action', 'Advantage in darkness/cover', 'Group stealth rules'],
        abilityAnchors: ['Dexterity'],
      },
    ),
  },
  {
    id: 'alchemy',
    name: 'Alchemy',
    role: 'Alchemist',
    description:
      'Brew reagents, treatments, and volatile compounds that alter crafting outcomes, medicine, or trail hazards.',
    tags: ['profession', 'crafting', 'magic-adjacent', 'support', 'generated'],
    linkedSystems: ['Crafting and Item Attributes', 'Medicine', 'Minigame Systems'],
    subskills: [
      { id: 'reagents', name: 'Reagents', description: 'Stabilizing base ingredients.' },
      { id: 'potions', name: 'Potions', description: 'Consumables with timed effects.' },
      {
        id: 'catalysts',
        name: 'Catalysts',
        description: 'Additives that shift crafting attribute outcomes.',
      },
      {
        id: 'volatiles',
        name: 'Volatiles',
        description: 'High-risk compounds with storage constraints.',
      },
    ],
    commonSkillIds: ['plant-identification', 'focus', 'organization', 'patience'],
    skillTypes: skillTypes(
      ['Brew stability', 'Shelf-life foresight', 'Contamination warnings'],
      ['Brew potion', 'Apply catalyst to craft', 'Deploy volatile (risky)'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        reagents: 'circle',
        potions: 'diamond',
        catalysts: 'square',
        volatiles: 'star',
      },
      iconIdeas: ['retort', 'vial', 'spark flask', 'mortar'],
      layoutNotes: 'Volatile stars are capped and dangerous cargo.',
    }),
    influences: influences(
      {
        lens: 'Medicine bottles and snake-oil fantasy at trading posts; risk of bad tonics.',
        beats: ['Buy medicine', 'Fake cures', 'Explosive cargo mishaps'],
      },
      {
        lens: "Alchemist's supplies; potion crafting downtime; Transmutation stone fantasy light.",
        beats: ['Brewing during downtime', 'Experimental concoctions'],
        abilityAnchors: ['Intelligence', 'Wisdom'],
      },
    ),
  },
  {
    id: 'woodcutting',
    name: 'Woodcutting',
    role: 'Woodcutter',
    description: 'Fell and process timber for fuel, carpentry stock, and emergency trail clears.',
    tags: ['profession', 'gathering', 'wood', 'resources', 'generated'],
    linkedSystems: ['Carpentry', 'Survival', 'Traversal and Routes'],
    subskills: [
      { id: 'felling', name: 'Felling', description: 'Safe drops and directional control.' },
      {
        id: 'bucking',
        name: 'Bucking',
        description: 'Sectioning trunks for haul and drying.',
      },
      {
        id: 'seasoning',
        name: 'Seasoning',
        description: 'Drying wood for quality craft inputs.',
      },
      {
        id: 'trail-clear',
        name: 'Trail Clear',
        description: 'Removing blowdowns that block wagons.',
      },
    ],
    commonSkillIds: ['strength', 'tool-handling', 'endurance', 'material-sense'],
    skillTypes: skillTypes(
      ['Wood quality read', 'Fall direction foresight'],
      ['Fell tree', 'Clear trail blockage', 'Process lumber'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        felling: 'diamond',
        bucking: 'circle',
        seasoning: 'oval',
        'trail-clear': 'triangle',
      },
      iconIdeas: ['axe', 'stump', 'log stack', 'blocked path'],
      layoutNotes: 'Trail-clear triangles are emergency route openers.',
    }),
    influences: influences(
      {
        lens: 'Fuel gathering and clearing the trail after storms.',
        beats: ['Chop for firewood', 'Fallen tree blocks path', 'Spare tongue timber'],
      },
      {
        lens: 'Strength (Athletics); woodcarver tools adjacency.',
        beats: ['Athletics for felling contests', 'Tool durability'],
        abilityAnchors: ['Strength'],
      },
    ),
  },
  {
    id: 'fishing',
    name: 'Fishing',
    role: 'Angler',
    description: 'Harvest aquatic food sources along rivers, coasts, and wetland routes.',
    tags: ['profession', 'gathering', 'food', 'biomes', 'generated'],
    linkedSystems: ['Biomes', 'Cooking', 'Caravan Operations'],
    subskills: [
      { id: 'line-fishing', name: 'Line Fishing', description: 'Patience and lure selection.' },
      { id: 'netting', name: 'Netting', description: 'Bulk catches with gear upkeep.' },
      { id: 'spearing', name: 'Spearing', description: 'Shallow-water active harvest.' },
      {
        id: 'preservation',
        name: 'Preservation',
        description: 'Salting, smoking, and spoilage control.',
      },
    ],
    commonSkillIds: ['perception', 'patience', 'weather-sense', 'organization'],
    skillTypes: skillTypes(
      ['Bite intuition', 'Spoil timer clarity'],
      ['Cast / fish', 'Net sweep', 'Preserve catch'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'line-fishing': 'circle',
        netting: 'square',
        spearing: 'diamond',
        preservation: 'oval',
      },
      iconIdeas: ['hook', 'net', 'fish', 'smokehouse'],
      layoutNotes: 'River-adjacent profession; bridges Fordcraft via water ovals.',
    }),
    influences: influences(
      {
        lens: 'River stops as food opportunities between wagon miles.',
        beats: ['Fish while resting oxen', 'River camp meals', 'Flood muddies fishing'],
      },
      {
        lens: 'Wisdom (Survival) fishing kits; downtime food source.',
        beats: ['Survival checks for fishing', 'Tool: fishing tackle'],
        abilityAnchors: ['Wisdom', 'Dexterity'],
      },
    ),
  },
  {
    id: 'painting',
    name: 'Painting',
    role: 'Painter',
    description:
      'Fine and applied arts that feed beauty attributes on crafted goods and performance sets. Shares Artisanship with carpentry and cooking.',
    tags: ['profession', 'crafting', 'art', 'social', 'generated'],
    linkedSystems: ['Crafting and Item Attributes', 'Performance'],
    subskills: [
      { id: 'illustration', name: 'Illustration', description: 'Maps, signs, and record sketches.' },
      {
        id: 'decoration',
        name: 'Decoration',
        description: 'Finishes that raise beauty attributes.',
      },
      {
        id: 'murals',
        name: 'Murals',
        description: 'Large settlement and caravan displays.',
      },
      { id: 'pigments', name: 'Pigments', description: 'Making and mixing lasting colors.' },
    ],
    commonSkillIds: ['artisanship', 'perception', 'steady-hand', 'patience'],
    skillTypes: skillTypes(
      ['Beauty attribute bias', 'Pigment fade foresight'],
      ['Paint finish', 'Sketch map/record', 'Raise mural'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        illustration: 'circle',
        decoration: 'diamond',
        murals: 'star',
        pigments: 'square',
      },
      iconIdeas: ['brush', 'palette', 'framed panel', 'pigment pot'],
      layoutNotes: 'Decoration diamonds bolt onto other craft grids as beauty satellites.',
    }),
    influences: influences(
      {
        lens: 'Wagon art and journal sketches of landmarks — memory of the trail.',
        beats: ['Paint the wagon', 'Sketch landmarks', 'Sell art at forts'],
      },
      {
        lens: "Painter's supplies; Performance adjacency for murals.",
        beats: ['Tool proficiency', 'Craft beautiful items for higher sale'],
        abilityAnchors: ['Dexterity', 'Charisma'],
      },
    ),
  },
  {
    id: 'logistics',
    name: 'Logistics',
    role: 'Quartermaster',
    description:
      'Pack, weigh, and rearrange limited wagon space — Tetris Trunk mastery — so fragility, weight, and access stay sane.',
    tags: ['profession', 'caravan', 'management', 'camp', 'generated'],
    linkedSystems: ['Caravan Operations', 'Minigame Systems'],
    subskills: [
      {
        id: 'packing',
        name: 'Packing',
        description: 'Spatial puzzles for oddly shaped cargo.',
      },
      { id: 'weight-balance', name: 'Weight Balance', description: 'Axle loads and tip risk.' },
      {
        id: 'inventory',
        name: 'Inventory',
        description: 'Knowing what you have without unpacking everything.',
      },
      {
        id: 'priority-access',
        name: 'Priority Access',
        description: 'Keeping daily-use goods reachable.',
      },
    ],
    commonSkillIds: ['organization', 'spatial-reasoning', 'resource-accounting', 'patience'],
    skillTypes: skillTypes(
      ['Weight UI clarity', 'Fragility warnings', 'Find-item speed'],
      ['Repack (Tetris Trunk)', 'Rebalance load', 'Emergency dig-out of buried item'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        packing: 'diamond',
        'weight-balance': 'square',
        inventory: 'circle',
        'priority-access': 'oval',
      },
      iconIdeas: ['crate grid', 'scale', 'checklist', 'quick-access pouch'],
      layoutNotes: 'Packing diamonds are the signature minigame mastery track.',
    }),
    influences: influences(
      {
        lens: 'Hundreds of pounds of food, ammo, and spare parts — carry capacity is destiny.',
        beats: ['Pound limits', 'Dumping goods to cross mountains', 'Buying too much at forts'],
      },
      {
        lens: 'Encumbrance rules made fun; Intelligence inventory mastery.',
        beats: ['Encumbrance tiers', 'Bag of Holding fantasy as star myth nodes'],
        abilityAnchors: ['Intelligence', 'Strength'],
      },
    ),
  },
  // --- Oregon Trail–forward & D&D 5e–forward gap fillers ---
  {
    id: 'fordcraft',
    name: 'Fordcraft',
    role: 'Ford Guide',
    description:
      'Judge depth, caulk and float wagons, ferry bargains, and get a column across water without drowning cargo or people.',
    tags: ['profession', 'traversal', 'water', 'oregon-trail', 'generated'],
    linkedSystems: ['Traversal and Routes', 'Wagonwright', 'Caravan Operations'],
    subskills: [
      {
        id: 'depth-reading',
        name: 'Depth Reading',
        description: 'Sounding poles, current tells, and seasonal river memory.',
      },
      {
        id: 'caulk-float',
        name: 'Caulk & Float',
        description: 'Seal and buoy wagons for deep crossings.',
      },
      {
        id: 'ferry-craft',
        name: 'Ferry Craft',
        description: 'Negotiate and operate ferry crossings safely.',
      },
      {
        id: 'haul-line',
        name: 'Haul Line',
        description: 'Ropes, anchors, and recovery when a wagon takes water.',
      },
    ],
    commonSkillIds: ['perception', 'weather-sense', 'strength', 'resource-accounting'],
    skillTypes: skillTypes(
      [
        'Crossing risk summary before you commit',
        'Current/season intuition',
        'Cargo waterproofing floor',
      ],
      [
        'Sound the ford',
        'Caulk wagons',
        'Lead crossing / call ferry',
        'Rescue foundering wagon',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'depth-reading': 'circle',
        'caulk-float': 'diamond',
        'ferry-craft': 'square',
        'haul-line': 'star',
      },
      iconIdeas: [
        'wavy water line under a wagon silhouette',
        'caulking iron',
        'ferry rope',
        'sounding pole',
      ],
      layoutNotes:
        'Signature Oregon Trail profession. Depth-reading circles are cheap entry; haul-line stars are clutch rescues.',
    }),
    influences: influences(
      {
        lens: 'The iconic river-crossing decision: ford, caulk, or ferry — with drowning on the line.',
        beats: [
          'Depth check fantasy',
          'Caulk days as time cost',
          'Ferry fees vs risk',
          'Losing oxen/wagons mid-stream',
        ],
      },
      {
        lens: 'Strength (Athletics) for hauling; Wisdom (Survival) for reading water; vehicle peril rules.',
        beats: [
          'Group checks for crossings',
          'Athletics to not be swept away',
          'Tool: navigator kit / rope',
        ],
        abilityAnchors: ['Wisdom', 'Strength'],
      },
    ),
  },
  {
    id: 'trail-hardiness',
    name: 'Trail Hardiness',
    role: 'Trail Doctor-Adjacent / Camp Hygienist',
    description:
      'Prevent and weather the grind of disease, bad water, pace injury, and morale collapse that defines long overland travel.',
    tags: ['profession', 'survival', 'health', 'oregon-trail', 'generated'],
    linkedSystems: ['Time and Scheduling', 'Medicine', 'Caravan Operations'],
    subskills: [
      {
        id: 'hygiene-discipline',
        name: 'Hygiene Discipline',
        description: 'Water rules, dish care, and pest habits that stop illness before Medicine is needed.',
      },
      {
        id: 'pace-conditioning',
        name: 'Pace Conditioning',
        description: 'Train bodies for strenuous miles without tipping into Red Zone collapse.',
      },
      {
        id: 'ailment-recognition',
        name: 'Ailment Recognition',
        description: 'Name early symptoms of classic trail sicknesses to care trees.',
      },
      {
        id: 'party-resilience',
        name: 'Party Resilience',
        description: 'Shared habits that raise the whole column’s baseline toughness.',
      },
    ],
    commonSkillIds: ['endurance', 'organization', 'morale-sense', 'patience'],
    skillTypes: skillTypes(
      [
        'Illness risk floor for the party',
        'Earlier symptom pips',
        'Pace injury resistance',
      ],
      [
        'Enforce hygiene routine',
        'Set conditioning drills',
        'Flag quarantine early',
      ],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'hygiene-discipline': 'circle',
        'pace-conditioning': 'diamond',
        'ailment-recognition': 'triangle',
        'party-resilience': 'star',
      },
      iconIdeas: ['water droplet + check', 'boot print', 'thermometer', 'linked figures'],
      layoutNotes:
        'Prevention-first grid that feeds Medicine. Ailment triangles are gateways into disease-care stars on the Medicine grid.',
    }),
    influences: influences(
      {
        lens: 'Dysentery, cholera, exhaustion, and the doctor profession — survival as attrition.',
        beats: [
          'Named ailments',
          'Rest vs miles while sick',
          'Clean water discipline',
          'Grave markers as failure poetry',
        ],
      },
      {
        lens: 'Constitution saving throws; exhaustion levels; Medicine as partner skill.',
        beats: [
          'Exhaustion track soft-map to Red Zone',
          'Con saves vs disease',
          'Prevention passives vs Medicine actives',
        ],
        abilityAnchors: ['Constitution', 'Wisdom'],
      },
    ),
  },
  {
    id: 'athletics',
    name: 'Athletics',
    role: 'Athlete / Hauler',
    description:
      'Climbing, lifting, forced marches, and body control for trail obstacles — High-Line crossings, stuck wagons, and sheer physical days.',
    tags: ['profession', 'physical', 'traversal', 'dnd5e', 'generated'],
    linkedSystems: ['Minigame Systems', 'Traversal and Routes', 'Time and Scheduling'],
    subskills: [
      { id: 'climbing', name: 'Climbing', description: 'Ascents, roofs, and cliff assists.' },
      { id: 'hauling', name: 'Hauling', description: 'Deadlifts of cargo, stuck wheels, and winch assist by muscle.' },
      {
        id: 'forced-march',
        name: 'Forced March',
        description: 'Push miles under fatigue with controlled risk.',
      },
      {
        id: 'tumbling-recover',
        name: 'Tumbling Recover',
        description: 'Fall mitigation and getting back up under load.',
      },
    ],
    commonSkillIds: ['strength', 'endurance', 'steady-hand', 'perception'],
    skillTypes: skillTypes(
      ['Carry capacity bias', 'Climb speed / stamina floor', 'Fall damage reduction'],
      ['Climb / High-Line', 'Shoulder the wagon', 'Forced march push', 'Brace & lift'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        climbing: 'diamond',
        hauling: 'square',
        'forced-march': 'star',
        'tumbling-recover': 'circle',
      },
      iconIdeas: ['flexed arm', 'rope climb', 'boot with speed lines', 'shoulder yoke'],
      layoutNotes: 'Bridges Engineering (muscle on pulleys) and Fordcraft (haul lines).',
    }),
    influences: influences(
      {
        lens: 'Manhandling wagons, walking beside oxen, and mountain grades that punish soft bodies.',
        beats: ['Walk to spare animals', 'Push wagons uphill', 'Exhaustion from pace'],
      },
      {
        lens: 'Strength (Athletics) as a first-class skill — climbing, jumping, lifting.',
        beats: ['Athletics checks', 'Jump distances', 'Grapple adjacency with Martial'],
        abilityAnchors: ['Strength', 'Constitution'],
      },
    ),
  },
  {
    id: 'acrobatics',
    name: 'Acrobatics',
    role: 'Acrobat',
    description:
      'Balance, precision movement, and precarious crossings — tightropes, wagon roofs in storms, and narrow ledges.',
    tags: ['profession', 'physical', 'traversal', 'dnd5e', 'generated'],
    linkedSystems: ['Minigame Systems', 'Traversal and Routes'],
    subskills: [
      {
        id: 'balance-line',
        name: 'Balance Line',
        description: 'High-Line Tightrope and storm-roof work.',
      },
      {
        id: 'precision-traverse',
        name: 'Precision Traverse',
        description: 'Narrow beams, cart tops, and cluttered decks.',
      },
      {
        id: 'evasive-footwork',
        name: 'Evasive Footwork',
        description: 'Slip past grabs, bites, and crowded melees.',
      },
      {
        id: 'landing-control',
        name: 'Landing Control',
        description: 'Safe drops from wagons, walls, and short cliffs.',
      },
    ],
    commonSkillIds: ['steady-hand', 'perception', 'endurance', 'sleight-of-hand'],
    skillTypes: skillTypes(
      ['Balance meter stability', 'Slip chance reduction', 'Quiet landing'],
      ['Walk the line (High-Line)', 'Roof repair in wind', 'Tumble through threat'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'balance-line': 'diamond',
        'precision-traverse': 'circle',
        'evasive-footwork': 'triangle',
        'landing-control': 'oval',
      },
      iconIdeas: ['tightrope walker', 'swirl balance pip', 'boot on beam', 'feather fall puff'],
      layoutNotes: 'Evasive triangles bridge Stealth and Martial; balance diamonds are minigame masters.',
    }),
    influences: influences(
      {
        lens: 'Less classic OT, more physical peril on broken bridges and storm-damaged wagons.',
        beats: ['Cross damaged spans', 'Repair canvas in wind', 'Rescue from ledges'],
      },
      {
        lens: 'Dexterity (Acrobatics); escape grapples; fancy footwork without full casters.',
        beats: ['Acrobatics vs Athletics split', 'Dexterity saves for balance'],
        abilityAnchors: ['Dexterity'],
      },
    ),
  },
  {
    id: 'insight',
    name: 'Insight',
    role: 'Reader',
    description:
      'Sense motives, bluffs, and unspoken needs — the social Perception for people, contracts, and camp tension.',
    tags: ['profession', 'social', 'mental', 'dnd5e', 'generated'],
    linkedSystems: ['Diplomacy', 'Leadership', 'Mercantile'],
    subskills: [
      {
        id: 'motive-reading',
        name: 'Motive Reading',
        description: 'Spot what someone wants beneath what they say.',
      },
      {
        id: 'bluff-sense',
        name: 'Bluff Sense',
        description: 'Catch lies, false guides, and bad deals.',
      },
      {
        id: 'tension-mapping',
        name: 'Tension Mapping',
        description: 'Feel which party bonds will snap under pressure.',
      },
      {
        id: 'counsel',
        name: 'Counsel',
        description: 'Turn readings into advice others will actually take.',
      },
    ],
    commonSkillIds: ['perception', 'communication', 'memory', 'patience'],
    skillTypes: skillTypes(
      ['Passive motive hints on key NPCs', 'Camp tension meter clarity', 'Deal smell-test'],
      ['Read the room', 'Challenge a bluff', 'Private counsel'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'motive-reading': 'circle',
        'bluff-sense': 'diamond',
        'tension-mapping': 'oval',
        counsel: 'star',
      },
      iconIdeas: ['eye over heart', 'broken mask', 'tangled threads', 'whisper'],
      layoutNotes: 'Many ovals are true passives (Passive Insight). Diamonds are contested reads.',
    }),
    influences: influences(
      {
        lens: 'Spotting bad guides, dishonest traders, and party members about to snap.',
        beats: ['Fake shortcuts', 'Swindling merchants', 'Morale arguments'],
      },
      {
        lens: 'Wisdom (Insight); Passive Insight as a named score like Passive Perception.',
        beats: ['Contested Insight vs Deception', 'Passive Insight floor', 'Social encounter structure'],
        abilityAnchors: ['Wisdom'],
      },
    ),
  },
  {
    id: 'investigation',
    name: 'Investigation',
    role: 'Investigator',
    description:
      'Deliberate search, deduction, and scene-reading at POIs — finding what Perception notices but cannot explain.',
    tags: ['profession', 'exploration', 'mental', 'dnd5e', 'generated'],
    linkedSystems: ['Points of Interest', 'Minigame Systems', 'History'],
    subskills: [
      {
        id: 'scene-search',
        name: 'Scene Search',
        description: 'Methodical sweeps of rooms, wrecks, and camps.',
      },
      {
        id: 'deduction',
        name: 'Deduction',
        description: 'Connect clues into actionable theories.',
      },
      {
        id: 'trap-analysis',
        name: 'Trap Analysis',
        description: 'Understand mechanisms before triggering them.',
      },
      {
        id: 'record-keeping',
        name: 'Record Keeping',
        description: 'Case files, sketches, and evidence that persist.',
      },
    ],
    commonSkillIds: ['perception', 'focus', 'reading', 'memory'],
    skillTypes: skillTypes(
      ['Clue highlighter on revisited scenes', 'Inconsistency pings', 'Search completeness meter'],
      ['Search area (time spend)', 'Deduce link', 'Disarm/analyze trap with Salvage'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        'scene-search': 'diamond',
        deduction: 'star',
        'trap-analysis': 'triangle',
        'record-keeping': 'square',
      },
      iconIdeas: ['magnifier', 'pin board', 'footprint + question', 'notebook'],
      layoutNotes: 'Trap triangles gateway into Salvage lockwork; deduction stars unlock unique POI routes.',
    }),
    influences: influences(
      {
        lens: 'Searching abandoned forts and wrecks carefully instead of grabbing blindly.',
        beats: ['Hidden caches', 'What happened here?', 'Avoiding trapped supplies'],
      },
      {
        lens: 'Intelligence (Investigation) distinct from Wisdom (Perception).',
        beats: [
          'Perception notices; Investigation explains',
          'Search actions',
          'Dungeon/POI clue chains',
        ],
        abilityAnchors: ['Intelligence'],
      },
    ),
  },
  {
    id: 'arcana',
    name: 'Arcana',
    role: 'Arcanist',
    description:
      'Theory and recognition of magic, anomalies, and enchanted craft — the knowledge spine behind Illusions and Alchemy.',
    tags: ['profession', 'magic', 'knowledge', 'dnd5e', 'generated'],
    linkedSystems: ['Illusions', 'Alchemy', 'Points of Interest'],
    subskills: [
      {
        id: 'phenomena',
        name: 'Phenomena',
        description: 'Identify wild magic weather, curses, and weird biomes.',
      },
      {
        id: 'item-lore',
        name: 'Item Lore',
        description: 'Recognize enchanted or anomalous objects.',
      },
      {
        id: 'ward-theory',
        name: 'Ward Theory',
        description: 'Understand protections, circles, and anti-magic folklore.',
      },
      {
        id: 'ritual-forms',
        name: 'Ritual Forms',
        description: 'Long-form procedures that are safe but slow.',
      },
    ],
    commonSkillIds: ['reading', 'focus', 'memory', 'perception'],
    skillTypes: skillTypes(
      ['Anomaly labels on map/POI', 'Enchanted item tells', 'Safer ritual windows'],
      ['Identify phenomenon', 'Analyze item', 'Perform ritual (long time-unit cost)'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'star',
      branchShapes: {
        phenomena: 'circle',
        'item-lore': 'diamond',
        'ward-theory': 'square',
        'ritual-forms': 'oval',
      },
      iconIdeas: ['spiral glyph', 'sparking tome', 'ward circle', 'floating rune'],
      layoutNotes: 'Knowledge-first magic grid; Illusions remains the performative caster track.',
    }),
    influences: influences(
      {
        lens: 'Trail superstition and strange landmarks — less OT core, more weird-west spice.',
        beats: ['Cursed sites', 'Charm peddlers', 'Omens before storms'],
      },
      {
        lens: 'Intelligence (Arcana); Identify rituals; school recognition.',
        beats: ['Arcana checks', 'Identify as downtime/active', 'Spell scroll literacy'],
        abilityAnchors: ['Intelligence'],
      },
    ),
  },
  {
    id: 'religion',
    name: 'Religion',
    role: 'Devoted Scholar / Chaplain',
    description:
      'Rites, sacred geography, and consolation — cultural fluency with temples, omens, and the stories that keep a company together.',
    tags: ['profession', 'social', 'knowledge', 'dnd5e', 'generated'],
    linkedSystems: ['Diplomacy', 'History', 'Leadership'],
    subskills: [
      {
        id: 'rites',
        name: 'Rites',
        description: 'Funerals, blessings, and travel liturgies.',
      },
      {
        id: 'sacred-geography',
        name: 'Sacred Geography',
        description: 'Know holy sites, taboos, and pilgrimage routes.',
      },
      {
        id: 'consolation',
        name: 'Consolation',
        description: 'Steady the living after loss on the trail.',
      },
      {
        id: 'omen-literacy',
        name: 'Omen Literacy',
        description: 'Interpret cultural signs without forcing one cosmology.',
      },
    ],
    commonSkillIds: ['memory', 'communication', 'charisma', 'patience'],
    skillTypes: skillTypes(
      ['Taboo warnings near sacred ground', 'Funeral/morale recovery bias', 'Faction rite familiarity'],
      ['Lead rite', 'Bless departure', 'Console companion', 'Read omen'],
    ),
    sphereGrid: sphereGrid({
      applicable: true,
      primaryShape: 'hex',
      branchShapes: {
        rites: 'diamond',
        'sacred-geography': 'square',
        consolation: 'star',
        'omen-literacy': 'circle',
      },
      iconIdeas: ['simple shrine', 'candle', 'folded hands', 'path shrine marker'],
      layoutNotes: 'Consolation stars are post-tragedy actives; geography squares unlock diplomatic options.',
    }),
    influences: influences(
      {
        lens: 'Graves beside the trail, Sunday rest, and cultural respect at unfamiliar settlements.',
        beats: ['Burial moments', 'Rest days', 'Offending locals via ignorance'],
      },
      {
        lens: 'Intelligence (Religion); support caster fantasy without requiring gods as mechanics.',
        beats: ['Religion checks for rites', 'Ceremonies as social tools', 'Channel divinity–like rare stars'],
        abilityAnchors: ['Intelligence', 'Wisdom', 'Charisma'],
      },
    ),
  },
];

for (const g of generated) {
  data.records.push(profession({ ...g, source: 'generated' }));
}

const commons = [
  {
    id: 'plant-identification',
    name: 'Plant Identification',
    source: 'for-review',
    description:
      'Recognize plants for food, medicine, dyes, and toxins. Shared by cooking, foraging, medicine, alchemy, and horticulture.',
    tags: ['common', 'knowledge', 'biomes', 'canon'],
    usedBy: ['cooking', 'foraging', 'medicine', 'alchemy', 'horticulture'],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Nature',
    oregonTrailNote: 'Berry vs poison decision quality.',
    sphereGrid: {
      applicable: true,
      primaryShape: 'oval',
      iconIdeas: ['leaf card', 'shared satellite node on craft grids'],
      layoutNotes: 'Appears as rim ovals on multiple profession grids.',
    },
    skillTypes: skillTypes(
      ['Auto-label known plants', 'Toxin warnings'],
      ['Inspect unknown specimen'],
    ),
  },
  {
    id: 'fire-tending',
    name: 'Fire Tending',
    source: 'for-review',
    description: 'Control heat sources for cooking, smithing, camp warmth, and furnace work.',
    tags: ['common', 'camp', 'crafting', 'canon'],
    usedBy: ['cooking', 'smithing', 'survival'],
    activation: 'hybrid',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Survival',
    oregonTrailNote: 'Campfires, warmth, and cooking heat under weather pressure.',
    sphereGrid: {
      applicable: true,
      primaryShape: 'oval',
      iconIdeas: ['flame pip'],
      layoutNotes: 'Shared oval between Cooking, Smithing, Survival.',
    },
    skillTypes: skillTypes(
      ['Heat stability', 'Fuel efficiency'],
      ['Stoke / bank fire', 'Stoke the Hearth minigame'],
    ),
  },
  {
    id: 'artisanship',
    name: 'Artisanship',
    source: 'for-review',
    description:
      'Shared craft sense and finishing quality across painting, carpentry, cooking, and related trades.',
    tags: ['common', 'crafting', 'canon'],
    usedBy: ['cooking', 'carpentry', 'smithing', 'tailoring', 'leatherworking', 'painting'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: "Artisan's tools",
    oregonTrailNote: 'Quality of repaired gear and trade goods.',
    sphereGrid: {
      applicable: true,
      primaryShape: 'oval',
      iconIdeas: ['compass + brush hybrid'],
      layoutNotes: 'Beauty/quality satellite shared across craft hexes.',
    },
    skillTypes: skillTypes(['Finish quality floor', 'Style consistency'], ['Apply finishing pass']),
  },
  {
    id: 'organization',
    name: 'Organization',
    source: 'for-review',
    description: 'Keep tools, ingredients, and stores ordered — reduces time waste and spoilage.',
    tags: ['common', 'camp', 'management', 'canon'],
    usedBy: [
      'cooking',
      'mercantile',
      'survival',
      'foraging',
      'alchemy',
      'logistics',
      'horticulture',
      'trail-hardiness',
    ],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: 'Investigation (inventory)',
    oregonTrailNote: 'Knowing how many pounds of food remain.',
    sphereGrid: {
      applicable: true,
      primaryShape: 'oval',
      iconIdeas: ['sorted crates'],
      layoutNotes: 'Logistics and Survival rim nodes.',
    },
    skillTypes: skillTypes(['Find-time reduction', 'Spoil visibility'], ['Reorganize stores']),
  },
  {
    id: 'tracking-animal',
    name: 'Tracking — Animal',
    source: 'for-review',
    description: 'Read animal sign for hunting, husbandry, and scouting.',
    tags: ['common', 'exploration', 'animals', 'canon'],
    usedBy: ['animal-handling', 'scouting'],
    activation: 'hybrid',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Survival',
    oregonTrailNote: 'Finding game before the hunt screen.',
    sphereGrid: {
      applicable: true,
      primaryShape: 'oval',
      iconIdeas: ['paw print'],
    },
    skillTypes: skillTypes(['Sign highlighter'], ['Follow spoor']),
  },
  {
    id: 'tracking-human',
    name: 'Tracking — Human',
    source: 'for-review',
    description: 'Follow people, caravans, and civil traffic.',
    tags: ['common', 'exploration', 'canon'],
    usedBy: ['scouting'],
    activation: 'hybrid',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Survival',
    oregonTrailNote: 'Following other parties / finding forts.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['boot print'] },
    skillTypes: skillTypes(['Trail freshness read'], ['Follow party sign']),
  },
  {
    id: 'tracking-monster',
    name: 'Tracking — Monster',
    source: 'for-review',
    description: 'Identify and follow unnatural or dangerous creature sign.',
    tags: ['common', 'exploration', 'combat-adjacent', 'canon'],
    usedBy: ['scouting'],
    activation: 'hybrid',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Survival',
    oregonTrailNote: 'Predator threats beyond bandits.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['claw gouge'] },
    skillTypes: skillTypes(['Threat sign warnings'], ['Hunt monster trail']),
  },
  {
    id: 'identification-animal',
    name: 'Identification — Animal',
    source: 'for-review',
    description: 'Species knowledge for care, threat assessment, and trade.',
    tags: ['common', 'animals', 'knowledge', 'canon'],
    usedBy: ['animal-handling'],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Animal Handling / Nature',
    oregonTrailNote: 'Ox vs mule vs horse suitability.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['beast silhouette card'] },
    skillTypes: skillTypes(['Species labels', 'Temperament hints'], ['Study specimen']),
  },
  {
    id: 'memory',
    name: 'Memory',
    source: 'for-review',
    description: 'Retain routes, lore, scripts, songs, and agreements.',
    tags: ['common', 'knowledge', 'social', 'canon'],
    usedBy: ['history', 'performance', 'diplomacy', 'insight', 'investigation', 'arcana', 'religion'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: 'History / recall',
    oregonTrailNote: 'Landmark and journal recall.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['knotted string / journal'] },
    skillTypes: skillTypes(['Auto-journal highlights', 'Landmark recall'], ['Recite / recall lore']),
  },
  {
    id: 'communication',
    name: 'Communication',
    source: 'for-review',
    description: 'Clear instruction, storytelling, and cross-cultural exchange.',
    tags: ['common', 'social', 'canon'],
    usedBy: ['history', 'leadership', 'medicine', 'performance', 'diplomacy', 'insight', 'religion'],
    activation: 'hybrid',
    dndAbility: 'Charisma',
    dndSkillAnalog: 'Persuasion / Performance',
    oregonTrailNote: 'Talking at forts and with the party.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['speech marks'] },
    skillTypes: skillTypes(['Instruction clarity', 'Translation ease'], ['Address group', 'Explain plan']),
  },
  {
    id: 'reading',
    name: 'Reading',
    source: 'for-review',
    description: 'Literacy for ledgers, inscriptions, recipes, and maps.',
    tags: ['common', 'knowledge', 'canon'],
    usedBy: ['history', 'investigation', 'arcana'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: 'Literacy / History',
    oregonTrailNote: 'Guidebooks and fort notices.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['open book'] },
    skillTypes: skillTypes(['Text comprehension speed'], ['Study document']),
  },
  {
    id: 'charisma',
    name: 'Charisma',
    source: 'for-review',
    description: 'Presence that softens negotiations, performances, and illusions.',
    tags: ['common', 'social', 'canon'],
    usedBy: ['illusions', 'mercantile', 'leadership', 'performance', 'diplomacy', 'religion'],
    activation: 'passive',
    dndAbility: 'Charisma',
    dndSkillAnalog: 'Ability score',
    oregonTrailNote: 'Better prices and calmer party talks.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['radiant bust'] },
    skillTypes: skillTypes(['First impression bias', 'Audience warmth'], []),
  },
  {
    id: 'sleight-of-hand',
    name: 'Sleight of Hand',
    source: 'for-review',
    description:
      'Fine manual deception and precise finger work for locks, tricks, and delicate salvage.',
    tags: ['common', 'dexterity', 'canon'],
    usedBy: ['illusions', 'salvage', 'performance', 'stealth', 'acrobatics'],
    activation: 'hybrid',
    dndAbility: 'Dexterity',
    dndSkillAnalog: 'Sleight of Hand',
    oregonTrailNote: 'Delicate repairs and quiet pocket work.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['dexterous fingers'] },
    skillTypes: skillTypes(['Fumble reduction'], ['Palm / plant', 'Fine manipulation']),
  },
  {
    id: 'endurance',
    name: 'Endurance',
    source: 'generated',
    description: 'Sustain effort across long days, marches, and physical trades.',
    tags: ['common', 'physical', 'generated'],
    usedBy: [
      'animal-handling',
      'martial-combat',
      'ranged-combat',
      'mining',
      'woodcutting',
      'stealth',
      'trail-hardiness',
      'athletics',
      'acrobatics',
      'fordcraft',
    ],
    activation: 'passive',
    dndAbility: 'Constitution',
    dndSkillAnalog: 'Constitution checks / exhaustion resist',
    oregonTrailNote: 'Pace and sickness resistance backbone.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['lungs / heart pip'] },
    skillTypes: skillTypes(['Fatigue gain reduction', 'Recovery quality'], []),
  },
  {
    id: 'perception',
    name: 'Perception',
    source: 'generated',
    description: 'Notice details in terrain, craft, threats, and social tells.',
    tags: ['common', 'senses', 'generated'],
    usedBy: [
      'animal-handling',
      'scouting',
      'martial-combat',
      'ranged-combat',
      'foraging',
      'salvage',
      'stealth',
      'fishing',
      'painting',
      'illusions',
      'fordcraft',
      'athletics',
      'acrobatics',
      'insight',
      'investigation',
      'arcana',
    ],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Perception (incl. Passive Perception)',
    oregonTrailNote: 'Spotting landmarks, hazards, and ambushes.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['open eye'] },
    skillTypes: skillTypes(['Passive notice floor', 'Hazard pips'], ['Focus look']),
  },
  {
    id: 'strength',
    name: 'Strength',
    source: 'generated',
    description: 'Raw force for combat, mining, masonry, and heavy trail work.',
    tags: ['common', 'physical', 'generated'],
    usedBy: [
      'martial-combat',
      'mining',
      'smithing',
      'masonry',
      'woodcutting',
      'athletics',
      'fordcraft',
    ],
    activation: 'hybrid',
    dndAbility: 'Strength',
    dndSkillAnalog: 'Athletics / attack',
    oregonTrailNote: 'Pushing wagons and hauling drowned freights.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['weight stone'] },
    skillTypes: skillTypes(['Carry bias', 'Break DC floor'], ['Power lift / shove']),
  },
  {
    id: 'focus',
    name: 'Focus',
    source: 'generated',
    description: 'Concentration for grids, calibrations, and error-sensitive tasks.',
    tags: ['common', 'mental', 'generated'],
    usedBy: [
      'history',
      'illusions',
      'ranged-combat',
      'medicine',
      'engineering',
      'alchemy',
      'investigation',
      'arcana',
    ],
    activation: 'hybrid',
    dndAbility: 'Intelligence',
    dndSkillAnalog: 'Concentration / Investigation',
    oregonTrailNote: 'Careful tasks under stress (caulking, doctoring).',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['crosshair mind'] },
    skillTypes: skillTypes(['Minigame timing forgiveness', 'Interrupt resistance'], ['Deep focus spend']),
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    source: 'generated',
    description: 'Structured bargaining beyond raw charisma.',
    tags: ['common', 'social', 'trade', 'generated'],
    usedBy: ['mercantile', 'diplomacy'],
    activation: 'hybrid',
    dndAbility: 'Charisma',
    dndSkillAnalog: 'Persuasion',
    oregonTrailNote: 'Fort prices and ferry fees.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['handshake'] },
    skillTypes: skillTypes(['Price band clarity'], ['Open haggle']),
  },
  {
    id: 'spatial-reasoning',
    name: 'Spatial Reasoning',
    source: 'generated',
    description: 'Mental models for packing, joins, spans, and structure.',
    tags: ['common', 'mental', 'crafting', 'generated'],
    usedBy: ['carpentry', 'wagonwright', 'masonry', 'engineering', 'logistics'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: "Artisan's tools / Investigation",
    oregonTrailNote: 'Loading the wagon without tipping.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['isometric cubes'] },
    skillTypes: skillTypes(['Pack preview accuracy', 'Join preview'], []),
  },
  {
    id: 'material-sense',
    name: 'Material Sense',
    source: 'generated',
    description: 'Feel grain, metal temper, hide quality, and stone integrity.',
    tags: ['common', 'crafting', 'generated'],
    usedBy: [
      'carpentry',
      'mining',
      'smithing',
      'wagonwright',
      'salvage',
      'leatherworking',
      'masonry',
      'woodcutting',
      'tailoring',
    ],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: "Artisan's tools",
    oregonTrailNote: 'Judging spare parts and trade goods.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['grain swatch'] },
    skillTypes: skillTypes(['Grade labels', 'Flaw detection'], ['Inspect material']),
  },
  {
    id: 'tool-handling',
    name: 'Tool Handling',
    source: 'generated',
    description: 'Efficient, safe use of profession tools across tiers.',
    tags: ['common', 'crafting', 'generated'],
    usedBy: [
      'carpentry',
      'mining',
      'wagonwright',
      'salvage',
      'leatherworking',
      'engineering',
      'woodcutting',
    ],
    activation: 'hybrid',
    dndAbility: 'Dexterity',
    dndSkillAnalog: 'Tool proficiency',
    oregonTrailNote: 'Axes, grease, caulking tools, kits.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['generic tool'], layoutNotes: 'Often paired with square tool-gate nodes.' },
    skillTypes: skillTypes(['Tool wear reduction', 'Tier unlock readiness'], ['Use specialized tool']),
  },
  {
    id: 'weather-sense',
    name: 'Weather Sense',
    source: 'generated',
    description: 'Anticipate storms, heat, and seasonal shifts that change route and camp risk.',
    tags: ['common', 'exploration', 'biomes', 'generated'],
    usedBy: [
      'scouting',
      'foraging',
      'survival',
      'horticulture',
      'stealth',
      'fishing',
      'fordcraft',
    ],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Survival',
    oregonTrailNote: 'Classic weather events that ruin days.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['cloud sun'] },
    skillTypes: skillTypes(['Forecast window', 'Storm early warning'], []),
  },
  {
    id: 'morale-sense',
    name: 'Morale Sense',
    source: 'generated',
    description: 'Read company mood and intervene before productivity collapses.',
    tags: ['common', 'social', 'caravan', 'generated'],
    usedBy: ['leadership', 'trail-hardiness'],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: 'Insight',
    oregonTrailNote: 'Party complaints and willingness to continue.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['mood faces'] },
    skillTypes: skillTypes(['Morale meter clarity', 'Break-risk pips'], []),
  },
  {
    id: 'time-sense',
    name: 'Time Sense',
    source: 'generated',
    description:
      'Estimate task costs through Time Fog; improves with relevant skill grid progress.',
    tags: ['common', 'management', 'time', 'generated'],
    usedBy: ['leadership'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: '— (custom; closest to planning / Investigation)',
    oregonTrailNote: 'Knowing if you can reach the next fort before supplies run out.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['hourglass'] },
    skillTypes: skillTypes(['Tighter time-cost ranges', 'Day-plan confidence'], []),
  },
  {
    id: 'resource-accounting',
    name: 'Resource Accounting',
    source: 'generated',
    description: 'Track consumption, reserves, and survival math for people and fleets.',
    tags: ['common', 'management', 'caravan', 'generated'],
    usedBy: ['mercantile', 'survival', 'engineering', 'logistics', 'fordcraft'],
    activation: 'passive',
    dndAbility: 'Intelligence',
    dndSkillAnalog: '— (custom ledger skill)',
    oregonTrailNote: 'Pounds of food, bullets, and cash.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['abacus / tally'] },
    skillTypes: skillTypes(['Burn-rate estimates', 'Shortage warnings'], ['Audit inventory']),
  },
  {
    id: 'patience',
    name: 'Patience',
    source: 'generated',
    description: 'Steady pacing for medicine, crafts, horticulture, and fishing.',
    tags: ['common', 'mental', 'generated'],
    usedBy: [
      'medicine',
      'tailoring',
      'horticulture',
      'leatherworking',
      'masonry',
      'alchemy',
      'fishing',
      'painting',
      'logistics',
      'trail-hardiness',
      'insight',
    ],
    activation: 'passive',
    dndAbility: 'Wisdom',
    dndSkillAnalog: '— (temperament; supports many checks)',
    oregonTrailNote: 'Not rushing a ford or a diagnosis.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['still water'] },
    skillTypes: skillTypes(['Rush penalty reduction', 'Wait-action efficiency'], []),
  },
  {
    id: 'steady-hand',
    name: 'Steady Hand',
    source: 'generated',
    description: 'Fine motor control for marks, stitches, brushwork, and delicate repairs.',
    tags: ['common', 'dexterity', 'generated'],
    usedBy: [
      'martial-combat',
      'ranged-combat',
      'tailoring',
      'painting',
      'athletics',
      'acrobatics',
    ],
    activation: 'hybrid',
    dndAbility: 'Dexterity',
    dndSkillAnalog: 'Sleight of Hand / ranged attack',
    oregonTrailNote: 'Careful shooting and repairs.',
    sphereGrid: { applicable: true, primaryShape: 'oval', iconIdeas: ['steady crosshair'] },
    skillTypes: skillTypes(['Sway reduction', 'Fine craft crit floor'], ['Steady aim spend']),
  },
];

for (const c of commons) {
  data.records.push(common(c));
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function titleCaseId(id) {
  return String(id)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildPossibleGridNodes(record) {
  const nodes = [];
  const seen = new Set();

  const add = (node) => {
    const id = node.id || slugify(node.name);
    if (!id || seen.has(id)) return;
    seen.add(id);
    nodes.push({
      id,
      name: node.name,
      type: node.type,
      description: node.description,
    });
  };

  const description =
    typeof record.description === 'string' && record.description.trim()
      ? record.description.trim()
      : `${record.name} skill for Trailbound progression.`;

  add({
    id: `${record.id}-core`,
    name: `${record.name} Core`,
    type: 'milestone',
    description,
  });

  for (const sub of record.subskills || []) {
    add({
      id: `branch-${sub.id}`,
      name: sub.name,
      type: 'branch',
      description:
        sub.description ||
        `Expertise branch within ${record.name}: ${sub.name}.`,
    });
  }

  for (const passive of record.skillTypes?.passive || []) {
    add({
      id: `passive-${slugify(passive)}`,
      name: passive.length > 56 ? `${passive.slice(0, 53)}…` : passive,
      type: 'passive',
      description: passive,
    });
  }

  for (const active of record.skillTypes?.active || []) {
    add({
      id: `active-${slugify(active)}`,
      name: active.length > 56 ? `${active.slice(0, 53)}…` : active,
      type: 'active',
      description: active,
    });
  }

  for (const commonId of record.commonSkillIds || []) {
    add({
      id: `common-${commonId}`,
      name: titleCaseId(commonId),
      type: 'common-link',
      description: `Shared common-skill node trainable through ${record.name}, linking to ${commonId}.`,
    });
  }

  const legacyGrid = record.sphereGrid;
  if (legacyGrid && typeof legacyGrid === 'object') {
    for (const idea of legacyGrid.iconIdeas || []) {
      add({
        id: `motif-${slugify(idea)}`,
        name: idea,
        type: 'motif',
        description: `Candidate motif or imagery for a ${record.name} grid node: ${idea}.`,
      });
    }
    if (typeof legacyGrid.layoutNotes === 'string' && legacyGrid.layoutNotes.trim()) {
      add({
        id: `${record.id}-structure-note`,
        name: 'Grid structure note',
        type: 'design-note',
        description: legacyGrid.layoutNotes.trim(),
      });
    }
  }

  if (record.kind === 'common') {
    add({
      id: `${record.id}-rank`,
      name: `${record.name} Rank`,
      type: 'passive',
      description: `Incremental ranks of ${record.name} earned while advancing linked professions.`,
    });
    for (const professionId of record.usedBy || []) {
      add({
        id: `via-${professionId}`,
        name: `Via ${titleCaseId(professionId)}`,
        type: 'gateway',
        description: `Gateway node for training ${record.name} on the ${titleCaseId(professionId)} profession grid.`,
      });
    }
  }

  return nodes;
}

for (const record of data.records) {
  if (typeof record.description !== 'string' || !record.description.trim()) {
    record.description = `${record.name} — Trailbound skill entry pending a fuller write-up.`;
  }

  for (const sub of record.subskills || []) {
    if (typeof sub.description !== 'string' || !sub.description.trim()) {
      sub.description = `Expertise area within ${record.name}.`;
    }
  }

  record.possibleGridNodes = buildPossibleGridNodes(record);
  delete record.sphereGrid;
}

fs.writeFileSync('public/data/skills.json', JSON.stringify(data, null, 2));
const professions = data.records.filter((r) => r.kind === 'profession');
const commonsOut = data.records.filter((r) => r.kind === 'common');
const generatedCount = data.records.filter((r) => (r.tags || []).includes('generated')).length;
const nodeCount = data.records.reduce(
  (sum, r) => sum + (r.possibleGridNodes?.length || 0),
  0,
);
console.log(
  `Wrote ${data.records.length} records (${professions.length} professions, ${commonsOut.length} commons)`,
);
console.log(
  `generated tag: ${generatedCount}; possibleGridNodes: ${nodeCount}; OT lenses: ${professions.filter((r) => r.influences?.oregonTrail).length}; 5e lenses: ${professions.filter((r) => r.influences?.dnd5e).length}`,
);
