import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'storyverse.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultSchema = {
  users: [],
  universes: [],
  characters: [],
  relationships: [],
  locations: [],
  timelines: [],
  stories: [],
  chapters: [],
  dialogues: [],
  branchingStories: [],
  communityPosts: [],
  subscriptions: [],
  aiUsageLogs: [],
};

class Database {
  constructor() {
    this.data = { ...defaultSchema };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...defaultSchema, ...JSON.parse(raw) };
      } else {
        this.data = { ...defaultSchema };
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error loading DB, initializing default schema:', err);
      this.data = { ...defaultSchema };
      this.seedInitialData();
      this.save();
    }
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('storyverse123', salt);

    const demoUser = {
      id: 'user_demo_01',
      name: 'Elena Rostova',
      penName: 'Archivist Elena',
      email: 'demo@storyverse.ai',
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Worldbuilder, sci-fi novelist, and narrative game designer. Exploring recursive universes and quantum fantasy realms.',
      plan: 'creator', // 'explorer' | 'creator' | 'studio'
      credits: 850,
      maxCredits: 1000,
      apiKey: '',
      preferredAIModel: 'auto',
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(demoUser);

    // Universe 1: Aethelgard (High Fantasy)
    const uni1 = {
      id: 'uni_aethelgard_01',
      userId: demoUser.id,
      name: 'The Shattered Realm of Aethelgard',
      tagline: 'Where fractured celestial moons bleed wild aether into mortal earth.',
      genre: 'fantasy',
      themeColor: '#7549E8',
      description: 'Aethelgard is a world scarred by the Celestial Sundering, three millennia ago when the Twin Moons fractured. Shards of luminescent aether-glass fell to the ground, giving rise to wild magics, floating monoliths, and ancient sorcerer dynasties fighting over crystal leylines.',
      magicRules: 'Aetheric Resonance: Sorcery requires attunement to lunar crystalline shards. Casting draws spiritual heat from the caster; overuse causes crystallization of the veins (The Vitreous Blight).',
      techLevel: 'Archaic Arcane (Runepunk medieval with crystal skyships and arcane golems)',
      cosmology: 'Two fractured moons (Selene and Umbra) orbiting an indigo horizon. The void between stars whispers forgotten genealogies.',
      factions: [
        { name: 'Order of the Pale Veil', stance: 'Scholarly inquisitors who seal wild rifts' },
        { name: 'Crystal Reavers of Thalor', stance: 'Pirates harnessing storm sails and lunar glass' },
        { name: 'The Ashen Regency', stance: 'Militaristic empire seeking to reunite the broken provinces' }
      ],
      isPublic: true,
      likes: 142,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Characters for Aethelgard
    const char1 = {
      id: 'char_valen_01',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'Prince Valen Shadowthorn',
      role: 'Protagonist / Heir to the Sunken Crown',
      species: 'Human (Aether-Touched)',
      age: 26,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      personalityTraits: ['Brooding', 'Strategist', 'Deeply loyal', 'Haunted by prophecies'],
      biography: 'Exiled prince of the Sunken Spires. After his royal family was assassinated by the Ashen Regency, Valen bonded with a fractured Umbra moon-shard, granting him shadow-veil manipulation at the cost of slow crystal spread on his left arm.',
      abilities: ['Shadow-step traversal', 'Umbral blade manifestation', 'Leyline resonance sensing'],
      motivations: 'Reclaim the Sunken Spires and dismantle the Ashen Regency without succumbing to the Vitreous Blight.',
      strengths: 'Peerless duelist, tactical thinker, unbreakable will.',
      weaknesses: 'Physical agony from crystal corruption; struggles to trust allies completely.',
      characterArc: 'From vengeful outcast to a monarch who learns to sacrifice personal vengeance for enduring peace.',
      status: 'active',
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    };

    const char2 = {
      id: 'char_selyse_02',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'High Archivist Selyse Vane',
      role: 'Deuteragonist / Rogue Inquisitor',
      species: 'Human',
      age: 29,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      personalityTraits: ['Analytical', 'Inquisitive', 'Morally gray', 'Sharp-witted'],
      biography: 'Former grand librarian of the Order of the Pale Veil. She stole the Forbidden Codices after discovering that the Sundering was not an accident of nature, but a calculated purge by the Regency.',
      abilities: ['Aether glyph encryption', 'Temporal echo detection', 'Ward dissolution'],
      motivations: 'Unearth the true history of the Moons and find an absolute cure for the Vitreous Blight.',
      strengths: 'Encyclopedic knowledge of ancient runes, unmatched counter-magic mastery.',
      weaknesses: 'Physically frail, easily distracted by ancient relics in peril.',
      characterArc: 'Learning that knowledge without empathy leads to tyranny.',
      status: 'active',
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };

    const char3 = {
      id: 'char_korath_03',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'Korath the Stoneguard',
      role: 'Shield-Brother & Veteran',
      species: 'Gilded Titanborn',
      age: 48,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      personalityTraits: ['Stoic', 'Dry humor', 'Fiercely protective', 'Honorable'],
      biography: 'Last surviving commander of the Gilded Vanguard. He served Valen’s father and swore a death-oath upon the shattered altar to keep Valen breathing until the dawn star rises once more.',
      abilities: ['Earth-resonance grounding', 'Siege-breaking brute force', 'Aether-suppression aura'],
      motivations: 'Protect Valen and atone for the night he failed to save the King.',
      strengths: 'Immense physical endurance, absolute tactical defense.',
      weaknesses: 'Slow in agile combat, deeply superstitious about lunar eclipses.',
      characterArc: 'Finding personal purpose beyond obsolete oaths of servitude.',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    };

    // Locations for Aethelgard
    const loc1 = {
      id: 'loc_citadel_01',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'The Citadel of Dawn',
      type: 'kingdom',
      coordinates: { x: 280, y: 180 },
      description: 'A colossal mountain fortress carved directly from incandescent quartz. Its towers refract the sunlight into radiant shields that keep the Ashen Regency’s siege beasts at bay.',
      climate: 'Temperate alpine with luminous crystal fog',
      politicalSystem: 'Elected Council of Sun-Keepers',
      culture: 'Veneration of solar harmony, grand glass-blowing guilds, choral hymnody',
      defense: 'Prismatic wall of light and three legions of Solar Dragoons',
      connections: ['loc_sunken_02', 'loc_whispering_03'],
      createdAt: new Date(Date.now() - 28 * 86400000).toISOString(),
    };

    const loc2 = {
      id: 'loc_sunken_02',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'Sunken Spires of Thalor',
      type: 'ruins',
      coordinates: { x: 520, y: 340 },
      description: 'An ancient coastal city submerged beneath turquoise tide waters when the moon fell. Only the high crystal spires and bell towers rise above the waves, now inhabited by sea scavengers and aether-divers.',
      climate: 'Oceanic tides with electric bioluminescent storms',
      politicalSystem: 'Lawless haven ruled by pirate captains and artifact brokers',
      culture: 'Diving rituals, maritime barter, oceanic shanties of lost dynasties',
      defense: 'Submerged razor reefs and trained abyssal leviathans',
      connections: ['loc_citadel_01', 'loc_whispering_03', 'loc_frostfall_04'],
      createdAt: new Date(Date.now() - 27 * 86400000).toISOString(),
    };

    const loc3 = {
      id: 'loc_whispering_03',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'The Whispering Hollows',
      type: 'sanctuary',
      coordinates: { x: 180, y: 460 },
      description: 'An ethereal petrified forest where trees made of silver glass capture voices of those who passed through centuries prior. The Order of the Pale Veil maintains secret listening posts here.',
      climate: 'Perpetual twilight, gentle hum of resonant wind',
      politicalSystem: 'Monastic neutrality governed by the Silent Priests',
      culture: 'Strict silence, archival meditation, memory-weaving',
      defense: 'Illusory mist mazes that trap unwanted intruders in waking dreams',
      connections: ['loc_citadel_01', 'loc_sunken_02'],
      createdAt: new Date(Date.now() - 26 * 86400000).toISOString(),
    };

    const loc4 = {
      id: 'loc_frostfall_04',
      universeId: uni1.id,
      userId: demoUser.id,
      name: 'Frostfall Peak & The Ashen Gates',
      type: 'city',
      coordinates: { x: 680, y: 160 },
      description: 'The grim volcanic-ice fortress of the Ashen Regency, built on a dormant magma fissure capped by black ice. Giant smoke smelters forge iron-plated dreadnoughts day and night.',
      climate: 'Sub-zero blizzards mingled with sulfured volcanic ash',
      politicalSystem: 'Authoritarian Imperial Dictatorship',
      culture: 'Military meritocracy, Spartan discipline, state-mandated machine veneration',
      defense: 'Heavy twin-barrel rail mortars and obsidian trench barricades',
      connections: ['loc_sunken_02'],
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    };

    // Relationships
    const rels = [
      {
        id: 'rel_01',
        universeId: uni1.id,
        sourceId: char1.id,
        targetId: char2.id,
        relationType: 'ally',
        description: 'Bound by the stolen Codices; Selyse guides Valen’s corrupting shard while he protects her from Veil assassins.',
        strength: 85,
      },
      {
        id: 'rel_02',
        universeId: uni1.id,
        sourceId: char1.id,
        targetId: char3.id,
        relationType: 'family',
        description: 'Korath is a surrogate father and shield-brother; would gladly give his life to see Valen crowned.',
        strength: 95,
      },
      {
        id: 'rel_03',
        universeId: uni1.id,
        sourceId: char2.id,
        targetId: char3.id,
        relationType: 'complex',
        description: 'Korath distrusts her secretive scholar methods, but respects her tactical cunning in battle.',
        strength: 60,
      },
    ];

    // Timelines
    const timelines = [
      {
        id: 'time_01',
        universeId: uni1.id,
        userId: demoUser.id,
        title: 'The Great Celestial Sundering',
        era: 'Age of Fractures',
        orderYear: -3000,
        yearDisplay: '3000 BS (Before Sundering)',
        description: 'The Twin Moons clash in orbit. Umbra shatters, raining crystal fire across the globe and sinking the Golden Empire of Thalor.',
        significance: 'Origin of wild aether magic, creation of the Vitreous Blight, and reshaping of modern geography.',
        relatedCharacterIds: [],
        relatedLocationIds: [loc2.id],
        conflictWarning: null,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'time_02',
        universeId: uni1.id,
        userId: demoUser.id,
        title: 'The Fall of the Sunken Spires',
        era: 'Reign of Ash',
        orderYear: -10,
        yearDisplay: 'Year 2894 AS',
        description: 'The Ashen Regency deploys iron dreadnoughts to bombard the Thalor dynasty. King Alden is slain; Prince Valen is smuggled out by Korath.',
        significance: 'Extinction of the royal lineage except Valen; Regency takes control of the aether-quarries.',
        relatedCharacterIds: [char1.id, char3.id],
        relatedLocationIds: [loc2.id, loc4.id],
        conflictWarning: null,
        createdAt: new Date(Date.now() - 24 * 86400000).toISOString(),
      },
      {
        id: 'time_03',
        universeId: uni1.id,
        userId: demoUser.id,
        title: 'Heist of the Forbidden Codices',
        era: 'Current Age',
        orderYear: -1,
        yearDisplay: 'Year 2903 AS',
        description: 'Selyse Vane breaks into the Pale Veil Vaults, retrieving the true prophecy of the Lunar Convergence.',
        significance: 'Begins the manhunt that unites Selyse and Valen at the Whispering Hollows.',
        relatedCharacterIds: [char2.id],
        relatedLocationIds: [loc3.id],
        conflictWarning: null,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'time_04',
        universeId: uni1.id,
        userId: demoUser.id,
        title: 'The Battle of the Whispering Mist',
        era: 'Current Age',
        orderYear: 0,
        yearDisplay: 'Present Day',
        description: 'Valen, Korath, and Selyse hold the pass against Imperial Black Inquisitors, unleashing a resonant aether shockwave.',
        significance: 'First public display of Valen’s Umbral shard abilities, exposing his survival to the Regency.',
        relatedCharacterIds: [char1.id, char2.id, char3.id],
        relatedLocationIds: [loc3.id],
        conflictWarning: null,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];

    // Story 1
    const story1 = {
      id: 'story_aethelgard_01',
      universeId: uni1.id,
      userId: demoUser.id,
      title: 'Echoes of the Fractured Moon',
      synopsis: 'When the exiled Prince Valen uncovers an ancient prophecy deciphered by a rogue archivist, he must decide whether to save his own soul from crystal corruption or burn his kingdom to reclaim it.',
      genre: 'fantasy',
      tone: 'Epic & Melancholic',
      targetWordCount: 50000,
      status: 'in_progress',
      isPublic: true,
      likes: 89,
      views: 1240,
      bookmarks: 45,
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const chapter1 = {
      id: 'chap_01',
      storyId: story1.id,
      universeId: uni1.id,
      userId: demoUser.id,
      chapterNumber: 1,
      title: 'The Vitreous Oath',
      content: `The wind sweeping through the Whispering Hollows tasted of ozone and pulverized silver.\n\nValen adjusted the heavy leather vambrace over his left arm, grimacing as the dark crystalline tendrils pulsed beneath his skin. With each beat of his mortal heart, the Umbra shard rooted deeper, a cold ember promising vengeance at the toll of his humanity.\n\n"If you keep touching it, the resonance will wake every Hound within five leagues," Selyse muttered without lifting her gaze from the brass-bound astrolabe spread across the petrified stump.\n\n"Let them come," Korath rumbled from the tree line, grinding the tip of his titan-gilded maul into the crystalline loam. "My hammer hasn't tasted Imperial iron since the tide turned red at Thalor."\n\nValen stepped into the clearing, the twilight glow catching the sharp edges of his jaw. "The Regency isn't hunting us with ordinary soldiers, Korath. The Grand Inquisitor has deployed the Vitreous Skiffs. They fly on stolen lunar glass."\n\nSelyse traced a fingertip over the parchment's glowing blue margin. "And according to the codex, those skiffs are heading directly for the Sunken Spires. If they reach the Moon Vault before we do, there won't be an Aethelgard left to liberate."\n\nValen looked toward the jagged silhouettes of the eastern mountains where the ruined spires slept under the waves. The time for hiding in shadows was over.`,
      wordCount: 224,
      summary: 'Valen, Selyse, and Korath confer in the Whispering Hollows, realizing the Ashen Regency is racing toward the Sunken Spires to plunder the Moon Vault.',
      autoSavedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    // Dialogue sample
    const dialogue1 = {
      id: 'diag_01',
      universeId: uni1.id,
      userId: demoUser.id,
      title: 'Confrontation at the Glass Tree',
      settingLocationId: loc3.id,
      tone: 'Tense & Philosophical',
      characterIds: [char1.id, char2.id],
      lines: [
        {
          characterId: char1.id,
          characterName: char1.name,
          avatar: char1.avatar,
          emotion: 'Defiant',
          stageDirection: 'flexing his crystal-laced fingers in the moonlight',
          text: 'You ask me to measure my hatred, Selyse. But every time I close my eyes, I hear the towers crashing into the surf at Thalor. My blood belongs to that ruin.'
        },
        {
          characterId: char2.id,
          characterName: char2.name,
          avatar: char2.avatar,
          emotion: 'Coldly Rational',
          stageDirection: 'carefully rolling the parchment without meeting his eyes',
          text: 'Vengeance is an inefficient fuel, Your Grace. It burns hot, turns your lungs to ash, and leaves the enemy sitting upon your father\'s throne while you rot into a monument of quartz.'
        },
        {
          characterId: char1.id,
          characterName: char1.name,
          avatar: char1.avatar,
          emotion: 'Somber',
          stageDirection: 'stepping closer, his voice dropping to a whisper',
          text: 'Then give me a weapon that doesn\'t require my heart as collateral.'
        },
        {
          characterId: char2.id,
          characterName: char2.name,
          avatar: char2.avatar,
          emotion: 'Earnest',
          stageDirection: 'looking up directly into his dark eyes',
          text: 'That is precisely why I stole the Codices. Now hold still and let me examine the runes along your collarbone before the frost takes your throat.'
        }
      ],
      notes: 'Reveals the deep friction between Valen’s raw trauma and Selyse’s academic detachment.',
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    };

    // Branching interactive story
    const branching1 = {
      id: 'branch_01',
      universeId: uni1.id,
      userId: demoUser.id,
      title: 'Infiltration of the Moon Vault',
      synopsis: 'Lead Prince Valen through the submerged ruins of Thalor. Will you breach the vault by stealth, ignite the aether-wells, or parley with the pirate barons?',
      isPublic: true,
      startNodeId: 'node_01',
      nodes: [
        {
          id: 'node_01',
          title: 'The Tides of Thalor',
          content: 'You stand atop the half-submerged bell tower of Thalor. Below you, the turquoise waves foam against ancient marble. Two patrol boats of the Ashen Regency are anchored near the watergate, their spotlights cutting through the misty spray.',
          choices: [
            { text: 'Dive into the shadowed waters and slip in through the drainage conduit', targetNodeId: 'node_02' },
            { text: 'Unleash an Umbral shockwave to disable the patrol boats simultaneously', targetNodeId: 'node_03' },
            { text: 'Signal the Crystal Reavers waiting on the outer reef for a coordinated strike', targetNodeId: 'node_04' }
          ]
        },
        {
          id: 'node_02',
          title: 'The Submerged Conduit',
          content: 'The frigid salt water stings your skin, but your Umbra shard responds to the chill, glowing with faint sapphire radiance. You emerge inside the lower archive catacombs. Selyse whispers that the vault seals are ancient and intact, but a ward trap is active.',
          choices: [
            { text: 'Have Selyse systematically dismantle the lunar glyphs', targetNodeId: 'node_05' },
            { text: 'Force the heavy stone portal with Korath\'s titan maul', targetNodeId: 'node_06' }
          ]
        },
        {
          id: 'node_03',
          title: 'Umbral Overload',
          content: 'You drop your vambrace and channel the dark lunar shard. Black lightning arcs across the waves! Both skiffs lose power, but the shockwave sends a jolt of sharp crystalline agony through your chest. Blood drips from your fingertips.',
          choices: [
            { text: 'Push through the pain and sprint into the Vault before reinforcements arrive', targetNodeId: 'node_05' },
            { text: 'Pause to let Selyse apply an aether-binding tourniquet', targetNodeId: 'node_06' }
          ]
        },
        {
          id: 'node_04',
          title: 'The Pirate Fleet Attacks',
          content: 'Red flare shells illuminate the sea! The Crystal Reavers charge with harp-cannons singing. In the ensuing chaos, the garrison is overwhelmed, but Captain Vex demands half of whatever lies within the Moon Vault as payment.',
          choices: [
            { text: 'Agree to the split to secure their heavy artillery for the interior breach', targetNodeId: 'node_05' },
            { text: 'Remind Captain Vex of his family\'s ancient fealty to the Sunken Crown', targetNodeId: 'node_06' }
          ]
        },
        {
          id: 'node_05',
          title: 'The Heart of the Moon (Victory)',
          content: 'The ancient vault yields! Inside rests the Prime Core of Selene, humming with clean celestial power that calms the burning crystal in your veins. With this artifact, the liberation of Aethelgard has truly begun.',
          choices: []
        },
        {
          id: 'node_06',
          title: 'The Regency Ambush (Complication)',
          content: 'The delay proves costly. Grand Inquisitor Kael steps from the shadows with twenty heavy arbalesters. "A touching reunion, Prince Valen," he sneers. Your back is to the sealed vault, but Korath raises his shield with a ferocious roar.',
          choices: []
        }
      ],
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    };

    // Push entities
    this.data.universes.push(uni1);
    this.data.characters.push(char1, char2, char3);
    this.data.locations.push(loc1, loc2, loc3, loc4);
    this.data.relationships.push(...rels);
    this.data.timelines.push(...timelines);
    this.data.stories.push(story1);
    this.data.chapters.push(chapter1);
    this.data.dialogues.push(dialogue1);
    this.data.branchingStories.push(branching1);

    // Universe 2: Neo-Cyberia 2184 (Cyberpunk Sci-Fi)
    const uni2 = {
      id: 'uni_cyberia_02',
      userId: demoUser.id,
      name: 'Neo-Cyberia 2184: The Sub-Grid',
      tagline: 'High chrome, deep shadows, and rogue neural artificial intelligences.',
      genre: 'scifi',
      themeColor: '#20A5D8',
      description: 'Built upon the flooded ruins of old Northern Eurasia, Neo-Cyberia is a vertical arcology of three hundred levels. Synthetic rain washes neon-lit alleys where corporate megacorps trade wetware, neural memories, and bio-cybernetic hacks.',
      magicRules: 'Sub-Grid Protocol: Wetware implants can manipulate electromagnetic fields and wireless neural nets. Going beyond 80% cyber-synchronicity triggers Neural Bleed—where synthetic and human memories cross-pollinate.',
      techLevel: 'Post-Singularity Cyberpunk (Neural cortical stacks, anti-grav hover skiffs, synthetic wetware, quantum AGI)',
      cosmology: 'Perpetual overcast acid sky. Orbital mirror arrays project simulated daylight into top-tier penthouses while the undercity drowns in perpetual twilight.',
      factions: [
        { name: 'OmniCorp Dynamics', stance: 'Monopolizes cortical neural tech and bio-cloning' },
        { name: 'The Zero-Day Syndicate', stance: 'Underground cyber-insurgents fighting for open-source consciousness' },
        { name: 'Kuroshio Enforcers', stance: 'Cybernetically augmented mercenaries maintaining corporate order' }
      ],
      isPublic: true,
      likes: 98,
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const charSciFi1 = {
      id: 'char_kaelen_04',
      universeId: uni2.id,
      userId: demoUser.id,
      name: 'Kaelen Voss',
      role: 'Ex-Corpo Neural Infiltrator',
      species: 'Cyborg / Enhanced Human',
      age: 31,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      personalityTraits: ['Cynical', 'Hyper-perceptive', 'Caffeine addict', 'Code virtuoso'],
      biography: 'Former chief offensive hacker for OmniCorp Dynamics. After discovering their project to overwrite dissident memories with corporate advertising arrays, he erased his biometric records and disappeared into the Sub-Grid.',
      abilities: ['Direct neural bus jack-in', 'Sub-second optical camouflage', 'Thermal overclocking'],
      motivations: 'Leak the OmniCorp "Tabula Rasa" firmware to the open net before their hit squads zero his cortical stack.',
      strengths: 'Peerless cybersecurity breach specialist, lightning reflexes under fire.',
      weaknesses: 'Severe Neural Bleed episodes; requires synthetic neuro-stabilizers daily.',
      characterArc: 'Transitioning from a lone survivalist into the architect of digital revolution.',
      status: 'active',
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
    };

    const charSciFi2 = {
      id: 'char_mara_05',
      universeId: uni2.id,
      userId: demoUser.id,
      name: 'Mara "Chrome-Fang" Jin',
      role: 'Sub-Grid Street Ronin & Smuggler',
      species: 'Enhanced Human',
      age: 27,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      personalityTraits: ['Fearless', 'Sarcastic', 'Loyal to the crew', 'Streetwise'],
      biography: 'Raised in the neon gutter of Level -14. She modified her arms with carbon-weave muscle fibers and mantis blades to survive corporate sweeps. Now runs illicit quantum drive deliveries.',
      abilities: ['High-frequency blade lethality', 'Kinetic wall-running', 'Acrobatic evade'],
      motivations: 'Earn enough credits to buy orbital colony passage for her younger brother.',
      strengths: 'Deadly close-quarters assassin, intimately knows every sewage duct and vent in Neo-Cyberia.',
      weaknesses: 'Impulsive; will risk everything for street orphans in crossfire.',
      characterArc: 'Learning that escaping to the orbital colonies is an illusion if the system remains untouched.',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    const locSciFi1 = {
      id: 'loc_skyline_05',
      universeId: uni2.id,
      userId: demoUser.id,
      name: 'District 0: The Skyline Spire',
      type: 'city',
      coordinates: { x: 300, y: 150 },
      description: 'A 2-kilometer-high carbon monolith piercing the smog. Home to the billionaire executive caste, botanical gardens under artificial glass domes, and high-frequency quantum trading nodes.',
      climate: 'Filtered conditioned air, perpetual synthetic balmy summer',
      politicalSystem: 'Boardroom Plutocracy',
      culture: 'Hyper-minimalist luxury, synthetic immortality cults, designer genes',
      defense: 'Automated hunter-killer drone swarms and particle perimeter beams',
      connections: ['loc_neon_06'],
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    };

    const locSciFi2 = {
      id: 'loc_neon_06',
      universeId: uni2.id,
      userId: demoUser.id,
      name: 'Neon Alley (Level -04)',
      type: 'city',
      coordinates: { x: 500, y: 350 },
      description: 'The beating, congested heart of the lower city. Rain-slick asphalt, noodle stalls bathed in flickering holographic dragons, black-market cyber clinics, and rogue AI brokers.',
      climate: 'Humid, acidic rain dripping from upper air condensers',
      politicalSystem: 'Syndicate turf alliances',
      culture: 'Cyber-punk street fashion, synthetic synthwave clubs, crypto-barter',
      defense: 'Gang lookouts, jury-rigged EMP traps, and labyrinthine alleys',
      connections: ['loc_skyline_05'],
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    };

    const relSciFi = [
      {
        id: 'rel_04',
        universeId: uni2.id,
        sourceId: charSciFi1.id,
        targetId: charSciFi2.id,
        relationType: 'ally',
        description: 'Kaelen hacks the security grids; Mara clears the physical obstacles with her blades.',
        strength: 90,
      }
    ];

    this.data.universes.push(uni2);
    this.data.characters.push(charSciFi1, charSciFi2);
    this.data.locations.push(locSciFi1, locSciFi2);
    this.data.relationships.push(...relSciFi);

    // Community posts
    this.data.communityPosts.push(
      {
        id: 'post_01',
        userId: demoUser.id,
        authorName: demoUser.name,
        authorAvatar: demoUser.avatar,
        type: 'universe',
        itemId: uni1.id,
        title: uni1.name,
        summary: uni1.description,
        genre: uni1.genre,
        likes: 142,
        bookmarks: 56,
        views: 2400,
        tags: ['High Fantasy', 'Lunar Magic', 'Shattered Worlds'],
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'post_02',
        userId: demoUser.id,
        authorName: demoUser.name,
        authorAvatar: demoUser.avatar,
        type: 'story',
        itemId: story1.id,
        title: story1.title,
        summary: story1.synopsis,
        genre: story1.genre,
        likes: 89,
        bookmarks: 34,
        views: 1240,
        tags: ['Grimdark', 'Epic Fantasy', 'Crystal Blight'],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'post_03',
        userId: demoUser.id,
        authorName: demoUser.name,
        authorAvatar: demoUser.avatar,
        type: 'universe',
        itemId: uni2.id,
        title: uni2.name,
        summary: uni2.description,
        genre: uni2.genre,
        likes: 98,
        bookmarks: 41,
        views: 1850,
        tags: ['Cyberpunk', 'Neural Net', 'Dystopian'],
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      }
    );

    // AI usage log seeds
    this.data.aiUsageLogs.push(
      {
        id: 'log_01',
        userId: demoUser.id,
        universeId: uni1.id,
        actionType: 'Chapter Generation',
        promptPreview: 'Write Chapter 1 showing Valen inspecting his corrupted arm in Whispering Hollows...',
        tokens: 850,
        creditsDeducted: 15,
        model: 'StoryVerse Contextual Engine v2',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'log_02',
        userId: demoUser.id,
        universeId: uni1.id,
        actionType: 'Dialogue Simulation',
        promptPreview: 'Generate philosophical debate between Prince Valen and Selyse Vane regarding vengeance...',
        tokens: 520,
        creditsDeducted: 10,
        model: 'StoryVerse Contextual Engine v2',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    );
  }

  // Generic Helpers
  find(collection, predicate) {
    return this.data[collection]?.filter(predicate) || [];
  }

  findOne(collection, predicate) {
    return this.data[collection]?.find(predicate) || null;
  }

  findById(collection, id) {
    return this.data[collection]?.find(item => item.id === id) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    const record = {
      id: item.id || `${collection.slice(0, 4)}_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
      createdAt: new Date().toISOString(),
      ...item,
    };
    this.data[collection].push(record);
    this.save();
    return record;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => item.id !== id);
    if (this.data[collection].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
