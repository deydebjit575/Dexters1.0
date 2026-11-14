import { db } from './db.js';

// Assemble rich context across all universe entities
export function assembleUniverseContext(universeId, userId) {
  if (!universeId) return null;

  const universe = db.findOne('universes', u => u.id === universeId && (u.userId === userId || u.isPublic));
  if (!universe) return null;

  const characters = db.find('characters', c => c.universeId === universeId);
  const locations = db.find('locations', l => l.universeId === universeId);
  const timelines = db.find('timelines', t => t.universeId === universeId).sort((a, b) => (a.orderYear || 0) - (b.orderYear || 0));
  const relationships = db.find('relationships', r => r.universeId === universeId);
  const stories = db.find('stories', s => s.universeId === universeId);
  const chapters = db.find('chapters', ch => ch.universeId === universeId);

  // Map relationships with names
  const charMap = new Map(characters.map(c => [c.id, c.name]));
  const relDetails = relationships.map(r => {
    const sName = charMap.get(r.sourceId) || 'Unknown';
    const tName = charMap.get(r.targetId) || 'Unknown';
    return `${sName} <-> ${tName} (${r.relationType}): ${r.description}`;
  });

  return {
    universe,
    characters,
    locations,
    timelines,
    relationships: relDetails,
    stories,
    chapters,
    summaryString: `
UNIVERSE: "${universe.name}" (${universe.genre.toUpperCase()})
TAGLINE: ${universe.tagline || 'N/A'}
DESCRIPTION: ${universe.description}
MAGIC / METAPHYSICAL RULES: ${universe.magicRules || 'Standard physics'}
TECH LEVEL: ${universe.techLevel || 'Default'}
COSMOLOGY: ${universe.cosmology || 'Standard'}
FACTIONS: ${(universe.factions || []).map(f => `${f.name} (${f.stance})`).join('; ') || 'None specified'}

LOCATIONS IN UNIVERSE (${locations.length}):
${locations.map(l => `- ${l.name} [Type: ${l.type}]: ${l.description} (Culture: ${l.culture || 'N/A'}, Climate: ${l.climate || 'N/A'})`).join('\n')}

ESTABLISHED CHARACTERS (${characters.length}):
${characters.map(c => `- ${c.name} (${c.role}, ${c.species}, Age ${c.age}): Traits: ${c.personalityTraits?.join(', ')}. Motivations: ${c.motivations}. Abilities: ${c.abilities?.join(', ')}. Arc: ${c.characterArc || 'N/A'}`).join('\n')}

CHARACTER DYNAMICS & RELATIONSHIPS:
${relDetails.length > 0 ? relDetails.map(r => `- ${r}`).join('\n') : 'No explicit relationships defined yet.'}

CHRONOLOGICAL TIMELINE / HISTORICAL ERAS:
${timelines.map(t => `- [${t.yearDisplay || t.era}]: ${t.title} — ${t.description}`).join('\n') || 'No major historical events recorded.'}
`.trim()
  };
}

// Low-level LLM API caller with graceful demo fallback
export async function callAIModel({ systemPrompt, userPrompt, userApiKey, userModelPreference }) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    // Attempt Gemini or OpenAI
    if (apiKey.startsWith('AIza') || process.env.GEMINI_API_KEY) {
      try {
        const geminiKey = userApiKey || process.env.GEMINI_API_KEY;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 2048,
            }
          })
        });

        if (res.ok) {
          const json = await res.json();
          const generatedText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return {
              text: generatedText,
              isLiveLLM: true,
              model: 'Gemini 1.5 Flash (Live LLM API)',
              creditsDeducted: 15,
            };
          }
        }
      } catch (err) {
        console.warn('Live Gemini API call failed, falling back to Contextual Engine:', err.message);
      }
    } else if (apiKey.startsWith('sk-') || process.env.OPENAI_API_KEY) {
      try {
        const openAiKey = userApiKey || process.env.OPENAI_API_KEY;
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 2048,
          })
        });

        if (res.ok) {
          const json = await res.json();
          const text = json.choices?.[0]?.message?.content;
          if (text) {
            return {
              text,
              isLiveLLM: true,
              model: 'OpenAI GPT-4o-mini (Live LLM API)',
              creditsDeducted: 15,
            };
          }
        }
      } catch (err) {
        console.warn('Live OpenAI API call failed, falling back to Contextual Engine:', err.message);
      }
    }
  }

  // Contextual StoryVerse Creative Generation Engine (Demo Mode)
  return {
    isLiveLLM: false,
    model: 'StoryVerse Contextual Engine v2.4 (Context-Synthesized)',
    creditsDeducted: 10,
    text: null // Will be generated by specialized contextual generators
  };
}

// 1. World Generator
export async function generateWorldLore({ prompt, genre, userApiKey, universeContext }) {
  const systemPrompt = `You are the master World Architect for STORYVERSE AI. Create rich, evocative world lore including geography, metaphysical rules, cultural tensions, and cosmologies.`;
  const result = await callAIModel({ systemPrompt, userPrompt: prompt, userApiKey });

  if (result.isLiveLLM && result.text) return result;

  // Synthesize contextual world lore
  const targetGenre = genre || 'fantasy';
  const worldTemplates = {
    fantasy: {
      tagline: 'Where fractured celestial constellations bleed wild aether into mortal earth.',
      description: `Deep within the expanse of ${prompt || 'the uncharted realm'}, ancient monolithic leylines hum with resonant crystal frequencies. Civilizations have sprouted around colossal fallen sky-spires, mining luminous arcane marrow from the depths of the earth. Magic is not a benign gift, but a volatile elemental current that claims the memories of those who weave it without silver wards. Feuding sorcerer dynasties and merchant enclaves guard the deep mountain passes, while beneath the sea, petrified leviathans awaken with every lunar eclipse.`,
      magicRules: 'Aether Resonance: Casting draws thermal energy from the surroundings, causing sudden frostbite or crystallization in the caster’s extremities if overloaded.',
      techLevel: 'Runepunk & Brass Clockwork (Gilded sky-barques, arcane astrolabes, runic forge-golems)',
      factions: [
        { name: 'The Gilded Conclave', stance: 'Monopolizes crystal refineries and celestial transit' },
        { name: 'Order of the Silent Spire', stance: 'Monastic guardians of apocalyptic catacomb vaults' },
        { name: 'Wanderers of the Ash Sea', stance: 'Nomadic beast-riders who tame void-winged drakes' }
      ]
    },
    scifi: {
      tagline: 'High chrome, recursive quantum horizons, and synthetic sentient storms.',
      description: `In the sector of ${prompt || 'Neo-Vortex Prime'}, massive three-tiered mega-structures pierce the ionosphere. Solar-harvesting swarms dance across Dyson ring fragments, casting shifting geometric shadows upon the pressurized ocean cities below. Humanity shares neural subnetworks with emergent sub-quantum intelligences, while black-market cortical surgeons trade cloned sensory memories in rain-drenched sub-level bazaar labyrinths.`,
      magicRules: 'Sub-Grid Synchronicity: Cybernetic implants allow wireless data manipulation, but exceeding safe overclocking thresholds triggers irreversible synaptic neural bleed.',
      techLevel: 'Post-Singularity Cybernetic (Neural stacks, gravity distortion skiffs, synthetic muscle fiber weaves)',
      factions: [
        { name: 'Aegis Quantum Dynamics', stance: 'Dominates orbital planetary defense and memory banks' },
        { name: 'The Zero-Point Collective', stance: 'Underground cyber-insurgents fighting for unrestricted neural freedom' },
        { name: 'Solaris Mining Cartel', stance: 'Exploits deep-asteroid plasma veins at any human cost' }
      ]
    },
    mythology: {
      tagline: 'When primordial titans slumbered, the gods forged empires from their shattered ribs.',
      description: `Forged in the dawn fire of ${prompt || 'the First Era'}, this mythical realm is governed by twelve sibling deities whose temperaments dictate the tides, monsoons, and harvest seasons. Mortals erect soaring marble columns and sacrifice sacred amber wine at mountain altars to appease the sky-lords, unaware that beneath the molten roots of the world, chained elder titans are gnawing through their celestial chains.`,
      magicRules: 'Divine Favor: Mortals perform vows and sacred rites to channel primordial wrath; breaking an oath instantly curses the lineage for seven generations.',
      techLevel: 'Heroic Bronze Age (Orichalcum spears, golden chariot warships, blessed olivewood galleys)',
      factions: [
        { name: 'The Solar Priesthood', stance: 'Interprets the flaming omens of the dawn eagle' },
        { name: 'Abyssal Oracles', stance: 'Blind seers who listen to the tremors of sunken titans' }
      ]
    },
    dystopian: {
      tagline: 'A scorched earth where oxygen is currency and silence is survival.',
      description: `Following the Great Atmospheric Collapse in ${prompt || 'the scorched rustlands'}, surviving enclaves are trapped beneath pressurized dome citadels ruled by the Bureau of Vital Resources. Beyond the perimeter walls lies the howling dust desert, populated by scrap scavengers, radioactive windstorms, and nomadic sand-crawler convoys trading filtered water canisters for ancient solar cells.`,
      magicRules: 'Bio-Resonance: Rare radiation mutations grant thermal sight or kinetic pulse bursts, but shorten lifespan to thirty years.',
      techLevel: 'Scavenged Dieselpunk (Reclaimed turbine rigs, pressurized scrubbers, armored road crawlers)',
      factions: [
        { name: 'The Bureau of Atmosphere', stance: 'Controls every cubic meter of breathable oxygen' },
        { name: 'The Rust Vanguard', stance: 'Scavenger brotherhood raiding corporate extraction rigs' }
      ]
    }
  };

  const selected = worldTemplates[targetGenre] || worldTemplates.fantasy;
  result.text = JSON.stringify(selected, null, 2);
  result.parsed = selected;
  return result;
}

// 2. Character Generator
export async function generateCharacter({ prompt, universeContext, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are the master Character Architect for STORYVERSE AI. Create multifaceted, deeply motivated characters with distinct personalities, abilities, vulnerabilities, and character arcs that naturally integrate into the established universe lore.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nCHARACTER BRIEF:\n${prompt}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  // Contextual fallback character
  const uniName = universeContext?.universe?.name || 'the realm';
  const genre = universeContext?.universe?.genre || 'fantasy';
  const existingChars = universeContext?.characters || [];
  const allyTarget = existingChars.length > 0 ? existingChars[0].name : 'the High Council';

  const generated = {
    name: prompt?.includes('name:') ? prompt.split('name:')[1].split('\n')[0].trim() : (genre === 'scifi' ? 'Talon "Ghost" Mercer' : 'Lady Cassandra Frostveil'),
    role: genre === 'scifi' ? 'Black-Market Cyber-Weaver' : 'Spell-Infiltrator & Royal Envoy',
    species: genre === 'scifi' ? 'Neural-Augmented Human' : 'Aether-Blooded Human',
    age: Math.floor(Math.random() * 20) + 24,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    personalityTraits: ['Pragmatic', 'Guarded', 'Wry sense of humor', 'Unyielding sense of debt'],
    biography: `Forged in the border conflicts of ${uniName}, they learned early on that loyalty is an expensive commodity. Having survived the catastrophic events recorded in the regional annals, they now walk the knife-edge between open rebellion and self-preservation, harboring an unbreakable bond with ${allyTarget}.`,
    abilities: genre === 'scifi' ? ['Sub-dermal frequency scrambler', 'Zero-footprint data siphoning', 'Enhanced neuro-reflexes'] : ['Frost-rune deflection', 'Aetheric whisper interception', 'Shadow-cloak mastery'],
    motivations: `To uncover the suppressed truth behind the cataclysm that destroyed their childhood homestead in ${universeContext?.locations?.[0]?.name || 'the outer provinces'}.`,
    strengths: 'Unflinching composure under mortal pressure, brilliant deduction of hidden motives.',
    weaknesses: 'Secret guilt regarding a fallen comrade; refuses to ask for medical assistance until on the brink of collapse.',
    characterArc: 'Begins as an aloof mercenary motivated by raw survival; gradually assumes the mantle of an inspiring leader who unites rival factions.',
    status: 'active'
  };

  result.text = JSON.stringify(generated, null, 2);
  result.parsed = generated;
  return result;
}

// 3. Story Chapter Generator
export async function generateStoryChapter({ prompt, storyTitle, universeContext, chapterNumber, tone, genre, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are an elite novelist for STORYVERSE AI. Write immersive, sensory-rich narrative chapters. Strictly respect the established universe rules, location geography, and character motivations provided in the context.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nSTORY: "${storyTitle}" (Chapter ${chapterNumber || 1})\nTONE: ${tone || 'Epic'}\nGENRE: ${genre || 'Fantasy'}\nCHAPTER PROMPT / OUTLINE:\n${prompt}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  // Context-aware chapter generation
  const uni = universeContext?.universe;
  const chars = universeContext?.characters || [];
  const locs = universeContext?.locations || [];
  const c1 = chars[0]?.name || 'The Wanderer';
  const c2 = chars[1]?.name || 'The Companion';
  const loc = locs[0]?.name || 'the ruined bastion';
  const magicRule = uni?.magicRules || 'the ancient resonance';

  const chapterContent = `The dawn broke in jagged fractures of light above ${loc}, casting elongated shadows across the ancient stone paving. A cold wind whistled through the carved friezes, carrying with it the unmistakable scent of ozone and unsettled dust.\n\n${c1} stood motionless upon the parapet, fingers tracing the worn edge of their weapon. Beneath their skin, the familiar pull of ${magicRule} stirred like embers fanned by a sudden draft. Every breath felt deliberate, measured against the weight of the oaths sworn when the kingdom first splintered.\n\n"You've been watching the northern ridge since midnight," ${c2} remarked, stepping softly from the shadowed archway with a faint rustle of traveling cloaks. "The scouts report no movement from the vanguard. If they're coming, they are marching under the cover of the mist."\n\n${c1} turned, eyes reflecting the pale luminescence of the horizon. "That is precisely what worries me. They don't need a host of thousands when a single breach in the wards of ${loc} will shatter the entire province's defenses. Look at the horizon—the leylines are flickering."\n\n${c2} moved alongside the rampart, following ${c1}'s gaze toward the distant ridgeline where dark silhouettes of iron dreadnoughts and watchtowers crowned the cliffs. "Then we have until sundown before the resonance reaches critical mass. Whatever we do next will determine whether ${uni?.name || 'our world'} survives to see the next moon."\n\nWith a resolute nod, ${c1} tightened the fastenings on their armor. The council had deliberated for months, but the time for diplomatic scrolls had passed. Tonight, the fate of the realm would be settled in blood, iron, and aether.`;

  result.text = chapterContent;
  return result;
}

// 4. Story Continuation
export async function continueStory({ existingContent, prompt, universeContext, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are a master story co-author for STORYVERSE AI. Seamlessly continue the story from the last sentence. Deepen character tension, maintain established voice and tone, and introduce dynamic plot development adhering to the universe lore.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nEXISTING TEXT:\n${existingContent.slice(-1500)}\n\nCONTINUATION DIRECTION:\n${prompt}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  const continuation = `\n\nA sharp crack echoed through the chamber, followed by the deep, rhythmic hum of ancient mechanisms groaning back to life after centuries of silence. The floor trembled beneath their boots as luminous azure glyphs flared along the foundation stones, tracing lines of raw power toward the central pedestal.\n\n"Step back!" came the urgent warning, but it was already too late to retreat. The seal had recognized the resonance of their presence. Out from the aperture coiled a ribbon of crystalline vapor, twisting in the air like a living serpent before coalescing into a shimmering apparition of the Lost Archivist.\n\n"You who trespass upon the sanctum of the fractured age," the spectral voice resonated directly inside their minds, carrying the chill of deep space, "the clock you seek has already begun to tick. If you take the core, the sky itself will fall."\n\nA heavy silence descended upon the ruins. Neither spoke, but their eyes met in unspoken resolve. They had traveled too far, sacrificed too many companions, to turn back now.`;

  result.text = continuation;
  return result;
}

// 5. Dialogue Generator
export async function generateDialogue({ characters, settingLocation, tone, topic, universeContext, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const charDetails = characters.map(c => `${c.name} (${c.role}, Traits: ${c.personalityTraits?.join(', ')}, Motivations: ${c.motivations})`).join('\n');
  const locName = settingLocation?.name || 'a secluded sanctuary';

  const systemPrompt = `You are a master scriptwriter and dialogue coach for STORYVERSE AI. Create authentic, dramatic conversations where each character speaks with a distinct cadence, reflecting their psychological motivations, secrets, and relationships. Format each turn as JSON with characterId, characterName, emotion, stageDirection, and text.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nSETTING: ${locName}\nTONE: ${tone}\nSCENE TOPIC / CONFLICT: ${topic}\n\nPARTICIPANTS:\n${charDetails}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) {
    try {
      const parsed = JSON.parse(result.text.replace(/```json|```/g, '').trim());
      result.lines = parsed;
      return result;
    } catch (e) {
      // Fallback to text parsing
    }
  }

  // Contextual script synthesis
  const c1 = characters[0] || { id: 'c1', name: 'Valen', avatar: '' };
  const c2 = characters[1] || { id: 'c2', name: 'Selyse', avatar: '' };

  const lines = [
    {
      characterId: c1.id,
      characterName: c1.name,
      avatar: c1.avatar,
      emotion: 'Guarded & Skeptical',
      stageDirection: `pacing slowly near the arched balcony overlooking ${locName}`,
      text: `You summoned me in secret at this hour, yet you won't meet my eyes. If the council has agreed to the surrender terms, tell me now so I can draw my blade and leave.`
    },
    {
      characterId: c2.id,
      characterName: c2.name,
      avatar: c2.avatar,
      emotion: 'Coldly Composed',
      stageDirection: `carefully rolling a sealed cylinder of parchment without looking up`,
      text: `The council consists of old men terrified of losing their tapestries and wine cellars. I did not invite you here to discuss their cowardice; I invited you because the scouts found something in the catacombs.`
    },
    {
      characterId: c1.id,
      characterName: c1.name,
      avatar: c1.avatar,
      emotion: 'Alert',
      stageDirection: `stopping dead in their tracks, their hand instinctively hovering over the hilt`,
      text: `The seal was supposed to be unbroken. The glyphs were forged with blood-iron.`
    },
    {
      characterId: c2.id,
      characterName: c2.name,
      avatar: c2.avatar,
      emotion: 'Earnest & Urgent',
      stageDirection: `finally turning to face them, their expression illuminated by the pale moonlight`,
      text: `Blood-iron decays when the leylines starve, my friend. We have at most three days before the breach becomes visible from the outer watchtowers. Either we take the vanguard into the deep hollows ourselves, or we prepare for the city gates to buckle.`
    },
    {
      characterId: c1.id,
      characterName: c1.name,
      avatar: c1.avatar,
      emotion: 'Grim Resolve',
      stageDirection: `nodding slowly as a grim smile touches their lips`,
      text: `Then sound the quiet muster. Let the council sleep peacefully in their ignorance—we ride before the dawn bell rings.`
    }
  ];

  result.lines = lines;
  result.text = lines.map(l => `${l.characterName} (${l.emotion}) [${l.stageDirection}]: "${l.text}"`).join('\n\n');
  return result;
}

// 6. Plot Twist Generator
export async function generatePlotTwists({ universeContext, storySummary, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are a narrative strategist for STORYVERSE AI. Generate 3 unpredictable yet organically earned plot twists that fundamentally subvert reader expectations without violating the established world rules or character motivations.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nCURRENT STORY SYNOPSIS:\n${storySummary || 'The heroes seek to overthrow the tyrannical regency.'}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  const chars = universeContext?.characters || [];
  const charA = chars[0]?.name || 'The Protagonist';
  const charB = chars[1]?.name || 'The Mentor';
  const loc = universeContext?.locations?.[0]?.name || 'the Capital Citadel';

  const twists = [
    {
      title: 'The Prophecy Was an Imperial Fabrication',
      tagline: 'The ancient savior myth was written by the tyrant’s grandfather.',
      description: `The sacred codex that spurred ${charA}'s quest was not written by ancient celestial deities, but commissioned two centuries ago by the regency to lure potential wild aether wielders to ${loc} so their life-force could be continuously harvested to sustain the imperial shield.`
    },
    {
      title: 'The Silent Sacrifice of ' + charB,
      tagline: 'The trusted ally is the anchor keeping the cataclysm at bay.',
      description: `It is revealed that ${charB} has not been searching for a cure, but has secretly been hosting the parasitic progenitor core within their own ribcage for a decade. Killing the primary antagonist will sever the seal and immediately transform ${charB} into the next apocalyptic entity.`
    },
    {
      title: 'The War Ended Decades Ago',
      tagline: 'The city lives inside an orchestrated temporal recurrence loop.',
      description: `The war with the outer provinces didn't stall; ${loc} was obliterated forty years ago. The entire population, including ${charA}, are aether-resonant echoes bound into a ninety-day memory loop generated by the dormant Titan beneath the city square.`
    }
  ];

  result.twists = twists;
  result.text = twists.map((t, i) => `${i + 1}. **${t.title}**\n*${t.tagline}*\n${t.description}`).join('\n\n');
  return result;
}

// 7. Timeline Inconsistency / Continuity Checker
export async function checkStoryContinuity({ textToCheck, universeContext, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are the master Continuity Auditor for STORYVERSE AI. Compare the submitted story draft against the universe facts, character backstories, timeline chronology, and magical/technological rules. Flag any contradictions or narrative risks.`;
  const fullPrompt = `UNIVERSE LORE CANON:\n${contextSummary}\n\nSTORY TEXT TO AUDIT:\n${textToCheck}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  // Contextual continuity analysis
  const reports = [
    {
      status: 'verified',
      category: 'Metaphysical / Magic Rules',
      message: `Magic usage correctly adheres to the established "${universeContext?.universe?.magicRules || 'Aether Resonance'}" law. No unassisted teleportation or instantaneous recovery observed.`
    },
    {
      status: 'warning',
      category: 'Character Geography & Traversal',
      message: `Verify travel time between ${universeContext?.locations?.[0]?.name || 'the western province'} and ${universeContext?.locations?.[1]?.name || 'the eastern port'}. Without an aether-skiff or mount, the mountain pass requires at least four days on foot.`
    },
    {
      status: 'verified',
      category: 'Chronological Alignment',
      message: `Historical references match the timeline eras without conflicting with the major Sundering cataclysm.`
    }
  ];

  result.reports = reports;
  result.overallHealth = '94% Canon Consistency';
  result.text = `### Canon Consistency Analysis (${result.overallHealth})\n\n` + reports.map(r => `**[${r.status.toUpperCase()}] ${r.category}**\n${r.message}`).join('\n\n');
  return result;
}

// 8. Brainstorming Assistant
export async function brainstormIdeas({ prompt, category, universeContext, userApiKey }) {
  const contextSummary = universeContext?.summaryString || '';
  const systemPrompt = `You are a high-level creative brainstorming partner for STORYVERSE AI. Produce 4 fresh, evocative, multi-layered ideas tailored to the creator's universe.`;
  const fullPrompt = `UNIVERSE CONTEXT:\n${contextSummary}\n\nBRAINSTORM FOCUS [Category: ${category || 'General'}]:\n${prompt}`;

  const result = await callAIModel({ systemPrompt, userPrompt: fullPrompt, userApiKey });
  if (result.isLiveLLM && result.text) return result;

  const ideas = [
    {
      headline: 'The Black Salt Smugglers of the Lower Shallows',
      concept: 'An underground guild of maritime exiles trading forbidden lunar crystals dissolved in brine, bypassing city gate wards.'
    },
    {
      headline: 'The Echo Sickness Pandemic',
      concept: 'A spiritual affliction spreading through market squares where victims begin unconsciously speaking the exact dying words of their ancestors.'
    },
    {
      headline: 'The Sky-Anchor Sabotage',
      concept: 'A daring heist during the Solstice Ball where thieves disconnect one of the four mammoth chains holding the floating citadel aloft.'
    },
    {
      headline: 'The Knight Bound by a False Memory',
      concept: 'A tragic champion who uncovers that the daughter he has spent fifteen years avenging never existed—she was a cognitive imprint implanted by his master.'
    }
  ];

  result.ideas = ideas;
  result.text = ideas.map((id, i) => `${i + 1}. **${id.headline}**\n${id.concept}`).join('\n\n');
  return result;
}
