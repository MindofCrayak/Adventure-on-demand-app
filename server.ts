import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ================= API ENDPOINTS =================

// 1. Sketch Transform (Map, NPC, or Item)
app.post('/api/sketch/transform', async (req, res) => {
  try {
    const { sketchDataUrl, type, notes, system = '5e / System Agnostic', tone = 'Dark Fantasy' } = req.body;

    if (!sketchDataUrl) {
      return res.status(400).json({ error: 'Missing sketchDataUrl' });
    }

    const ai = getGeminiClient();

    // Extract base64 and mime
    let mimeType = 'image/png';
    let base64Data = sketchDataUrl;
    if (sketchDataUrl.includes(';base64,')) {
      const parts = sketchDataUrl.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1];
    }

    if (!ai) {
      // Fallback generator if key not configured
      return res.json({
        success: true,
        data: generateFallbackSketchResult(type, notes, tone),
      });
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    let prompt = '';
    if (type === 'map') {
      prompt = `You are an expert TTRPG cartographer and Game Master.
Analyze this hand-drawn sketch of a battlemap / dungeon layout / tactical area.
Notes from creator: "${notes || 'None provided'}".
Campaign Tone: ${tone}. System: ${system}.

Interpret the rooms, corridors, doors, stairs, hazards, elevations, and annotations in the sketch.
Return a STRICT JSON object (NO markdown outside, pure JSON) with the following schema:
{
  "name": "Evocative Name for this Map",
  "environment": "dungeon" | "cave" | "castle" | "temple" | "crypt" | "wilderness" | "tavern",
  "width": 20,
  "height": 20,
  "ambientLighting": "Dim torchlight with cold blue mist",
  "hazards": "Slick stone, collapsing pillars, poisonous spores",
  "tacticalNotes": "Cover along pillars, choke points at corridor 3, elevated altar",
  "description": "Thorough sensory description for the GM to read out loud",
  "rooms": [
    {
      "id": "r1",
      "number": 1,
      "name": "Entrance Antechamber",
      "x": 2,
      "y": 2,
      "w": 6,
      "h": 5,
      "description": "Sensory read-aloud description of the chamber",
      "features": ["Cracked stone sarcophagus", "Heavy iron-banded door", "Faded mural of forgotten pantheon"],
      "monsters": "2x Skeletal Wardens",
      "treasure": "Ancient bronze signet ring hidden in dust"
    }
  ]
}
Include between 4 to 8 distinct rooms/areas that faithfully follow the shapes, connections, and layout suggested by the user's sketch!`;
    } else if (type === 'npc') {
      prompt = `You are an expert TTRPG narrative designer and encounter builder.
Analyze this hand-drawn sketch or character doodle.
Notes from creator: "${notes || 'None provided'}".
Campaign Tone: ${tone}. System: ${system}.

Interpret facial features, posture, attire, weapons, or silhouettes in the drawing.
Return a STRICT JSON object (pure JSON, no extra text) with this schema:
{
  "name": "Full Character Name",
  "title": "Evocative Title or Moniker (e.g. The Blind Cartographer)",
  "race": "Race/Ancestry",
  "classOrRole": "Class or Social Role",
  "tier": "main",
  "stats": {
    "str": 14, "dex": 16, "con": 14, "int": 12, "wis": 18, "cha": 15,
    "ac": 16, "hp": 78, "maxHp": 78, "speed": "30 ft.", "cr": "5", "pb": 3,
    "passivePerception": 17,
    "saves": "Dex +6, Wis +7",
    "skills": "Perception +7, Insight +7, Stealth +6"
  },
  "combatAbilities": [
    { "name": "Shadow Step (Bonus Action)", "type": "bonus", "description": "Teleports up to 30 feet to an unoccupied space in dim light or darkness." },
    { "name": "Rune-Carved Rapier (Action)", "type": "action", "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 8 (1d8 + 3) piercing damage plus 7 (2d6) necrotic damage." }
  ],
  "flavor": {
    "appearance": "Visual details matching and enriching the sketch",
    "voiceMannerism": "Distinctive speech pattern, accent, cadence, or vocal tick",
    "flawOrQuirk": "A memorable behavioral quirk, vice, or superstition",
    "secretMotivation": "What they desperately hide from the party or world",
    "plotHook": "Immediate dilemma or quest they involve the players in",
    "relationshipToParty": "How they first react to adventurers"
  },
  "visualPrompt": "Detailed visual description of portrait suitable for token framing",
  "tokenStyling": {
    "borderColor": "#eab308",
    "borderStyle": "ornate",
    "badgeText": "CR 5",
    "ringColor": "#9333ea"
  }
}`;
    } else {
      // item
      prompt = `You are an expert TTRPG artifact crafter.
Analyze this hand-drawn sketch of a magic item, relic, or weapon.
Notes from creator: "${notes || 'None provided'}".
Campaign Tone: ${tone}. System: ${system}.

Return a STRICT JSON object with this schema:
{
  "name": "Legendary/Relic Name",
  "type": "weapon" | "armor" | "ring" | "wand" | "wondrous" | "potion" | "relic",
  "rarity": "Uncommon" | "Rare" | "Very Rare" | "Legendary" | "Artifact",
  "attunement": true,
  "description": "Sensory physical description matching the sketch",
  "mechanicalEffects": [
    "While holding this item, you gain a +1 bonus to spell attack rolls.",
    "Once per long rest, you can unleash..."
  ],
  "lore": "Historic origin, previous owner, and the tragedy or victory tied to it.",
  "quirkOrCurse": "A subtle roleplay quirk or minor curse experienced by the bearer."
}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in sketch/transform:', err);
    return res.json({
      success: true,
      data: generateFallbackSketchResult(req.body?.type, req.body?.notes, req.body?.tone),
      warning: err.message || 'Used offline generator',
    });
  }
});

// 2. Adventure Arc Outline & Generation
app.post('/api/adventure/outline', async (req, res) => {
  try {
    const {
      title,
      sessionLengthHours = 3,
      sessionCount = 3,
      partyLevel = 3,
      partySize = 4,
      tone = 'Dark Fantasy',
      setting = 'Grimdark Coastal Stronghold',
      premise = '',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: generateFallbackCampaign(title, sessionLengthHours, sessionCount, partyLevel, tone, setting, premise),
      });
    }

    const prompt = `You are a master TTRPG Campaign Director and Game Master.
Plan a complete, cohesive multi-session adventure module with the following specifications:
- Title: "${title || 'The Ashen Dominion'}"
- Number of Planned Sessions: ${sessionCount}
- Average Session Length: ${sessionLengthHours} hours (Pacing must strictly budget encounters, exploration, and dramatic breaks for this duration!)
- Party Level: ${partyLevel} (Party of ${partySize} adventurers)
- Tone: ${tone}
- Setting / World: ${setting}
- Central Premise: "${premise || 'An ancient seal is fracturing beneath the settlement'}"

Generate a complete structured adventure campaign with session-by-session beat sheets, pacing timelines, player handouts, secrets to uncover, key maps, and prominent NPCs.
Return a STRICT JSON object with this exact schema:
{
  "title": "Campaign Title",
  "synopsis": "Compelling 2-3 paragraph overview of the central conflict, stakes, and overarching mystery.",
  "tone": "${tone}",
  "setting": "${setting}",
  "partyLevel": ${partyLevel},
  "sessionCount": ${sessionCount},
  "sessionLengthHours": ${sessionLengthHours},
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "Session 1 Title",
      "duration": "${sessionLengthHours} Hours",
      "pacingSummary": "How this session builds tension from opening hook to the session's cliffhanger",
      "timeline": [
        {
          "timestamp": "0:00 - 0:30",
          "phase": "hook",
          "title": "The Cold Summons",
          "description": "Opening roleplay beat, establishing the threat and inciting incident."
        },
        {
          "timestamp": "0:30 - 1:15",
          "phase": "exploration",
          "title": "Into the Forgotten Warrens",
          "description": "Exploration of the outer perimeter, skill checks, environmental hazards."
        },
        {
          "timestamp": "1:15 - 2:15",
          "phase": "combat",
          "title": "Ambush at the Broken Bridge",
          "description": "Tactical combat setpiece with dynamic terrain."
        },
        {
          "timestamp": "2:15 - 3:00",
          "phase": "climax",
          "title": "The Crimson Seal Breaks",
          "description": "Dramatic cliffhanger revelation setting up Session 2."
        }
      ],
      "encounters": [
        {
          "name": "Encounter Name",
          "type": "combat" | "puzzle" | "social" | "trap",
          "difficulty": "Medium" | "Hard" | "Deadly",
          "summary": "Tactical setup, adversary tactics, or puzzle logic"
        }
      ],
      "keyObjectives": [
        "Uncover who poisoned the monastery reservoir",
        "Recover the cipher stone before midnight"
      ],
      "loot": "Rewards, gold, scrolls, or unique oddities found during this session"
    }
  ],
  "handouts": [
    {
      "id": "h1",
      "sessionNumber": 1,
      "title": "Blood-Spattered Letter of Warning",
      "type": "parchment-letter",
      "visualTheme": "aged-parchment",
      "author": "Commander Valen",
      "recipient": "Magister Osric",
      "textContent": "Full evocative text of the in-game letter or diary entry for the GM to show players..."
    }
  ],
  "secrets": [
    {
      "id": "s1",
      "sessionNumber": 1,
      "title": "The Traitor in the Guardhouse",
      "secretLevel": "Hidden Truth",
      "description": "What is really happening behind the scenes.",
      "discoveryMethod": "DC 14 Investigation on the Captain's ledger or casting Detect Thoughts",
      "revelationImpact": "The players realize their patron is not innocent."
    }
  ],
  "initialNpcs": [
    {
      "name": "Important NPC Name",
      "title": "Their Title",
      "race": "Human / Elf / Tiefling / etc",
      "classOrRole": "Inquisitor / Blacksmith / Guildmaster",
      "tier": "side",
      "flavor": {
        "appearance": "Distinctive look",
        "voiceMannerism": "Gravelly voice, never looks you in the eye",
        "flawOrQuirk": "Always flips an iron coin when speaking",
        "secretMotivation": "Trying to pay off a blood debt to the thieves guild",
        "plotHook": "Will offer secret passage if players retrieve a stolen locket",
        "relationshipToParty": "Wary informant"
      },
      "stats": {
        "str": 10, "dex": 14, "con": 12, "int": 13, "wis": 14, "cha": 11,
        "ac": 12, "hp": 22, "maxHp": 22, "speed": "30 ft.", "cr": "1/2"
      }
    }
  ],
  "suggestedMaps": [
    {
      "name": "Session 1 Tactical Location",
      "environment": "dungeon",
      "width": 20,
      "height": 20,
      "description": "Overview of the primary tactical battlefield for the session",
      "ambientLighting": "Flickering tallow candles and dripping damp",
      "hazards": "Grease traps, unstable masonry",
      "tacticalNotes": "Use vertical rafters for advantage",
      "rooms": [
        {
          "id": "r1",
          "number": 1,
          "name": "Guarded Vault Door",
          "x": 3,
          "y": 3,
          "w": 5,
          "h": 4,
          "description": "Reinforced doorway with arrow slits on either flank",
          "features": ["Heavy iron portcullis", "Barricades"],
          "monsters": "3 Cultist Zealots"
        }
      ]
    }
  ]
}
Make sure exactly ${sessionCount} sessions are detailed, pacing matches ${sessionLengthHours} hours per session, and every encounter has high drama!`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in adventure/outline:', err);
    return res.json({
      success: true,
      data: generateFallbackCampaign(
        req.body?.title,
        req.body?.sessionLengthHours,
        req.body?.sessionCount,
        req.body?.partyLevel,
        req.body?.tone,
        req.body?.setting,
        req.body?.premise
      ),
      warning: err.message,
    });
  }
});

// 3. NPC Generator (Side flavor or Main statblock)
app.post('/api/npc/generate', async (req, res) => {
  try {
    const {
      tier = 'side',
      roleOrArchetype = 'Tavern Keeper',
      tone = 'High Fantasy',
      system = '5e',
      context = '',
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: generateFallbackNPC(tier, roleOrArchetype, tone),
      });
    }

    const isMain = tier === 'main';

    const prompt = `You are an expert TTRPG Game Master assistant.
Generate an authentic, instantly playable TTRPG NPC.
Tier: ${isMain ? 'MAIN NPC (Full Combat Stats, CR, deep combat traits, signature abilities)' : 'SIDE NPC (Flavored roleplay character, quick stats, vivid memorable quirks)'}
Archetype/Concept: ${roleOrArchetype}
Tone: ${tone}. Rules System: ${system}.
Campaign Context: "${context || 'General adventuring setting'}".

Return a STRICT JSON object with this schema:
{
  "name": "Memorable Name",
  "title": "Title/Reputation",
  "race": "Race/Lineage",
  "classOrRole": "Class or Vocation",
  "tier": "${tier}",
  "flavor": {
    "appearance": "2-3 vivid sentences of physical description",
    "voiceMannerism": "Tone of voice, catchphrase, or distinct speaking cadence",
    "flawOrQuirk": "Memorable personality trait, fear, or habit",
    "secretMotivation": "Hidden desire, vulnerability, or blackmail",
    "plotHook": "Why the party needs them or what quest they offer",
    "relationshipToParty": "First impression and negotiation leverage"
  },
  "stats": {
    "str": ${isMain ? 16 : 10},
    "dex": ${isMain ? 14 : 12},
    "con": ${isMain ? 16 : 11},
    "int": ${isMain ? 12 : 10},
    "wis": ${isMain ? 14 : 12},
    "cha": ${isMain ? 15 : 13},
    "ac": ${isMain ? 17 : 11},
    "hp": ${isMain ? 85 : 18},
    "maxHp": ${isMain ? 85 : 18},
    "speed": "30 ft.",
    "cr": "${isMain ? '4' : '1/4'}",
    "pb": ${isMain ? 3 : 2},
    "passivePerception": ${isMain ? 15 : 11},
    "saves": "${isMain ? 'Str +5, Con +5' : 'Dex +1'}",
    "skills": "${isMain ? 'Athletics +5, Intimidation +4' : 'Deception +3'}"
  },
  "combatAbilities": [
    ${
      isMain
        ? `{ "name": "Multiattack (Action)", "type": "action", "description": "Makes two melee attacks." },
           { "name": "Brutal Cleave", "type": "action", "description": "Melee Weapon Attack: +6 to hit, reach 5 ft., Hit: 12 (2d6 + 5) slashing damage." },
           { "name": "Parry (Reaction)", "type": "reaction", "description": "Adds +3 to AC against one melee attack that would hit." }`
        : `{ "name": "Dagger / Improvised Weapon", "type": "action", "description": "Melee Attack: +3 to hit, Hit: 3 (1d4 + 1) damage." }`
    }
  ],
  "tokenStyling": {
    "borderColor": "${isMain ? '#ef4444' : '#eab308'}",
    "borderStyle": "${isMain ? 'ornate' : 'minimal'}",
    "badgeText": "${isMain ? 'BOSS / ALLY' : 'NPC'}",
    "ringColor": "${isMain ? '#b91c1c' : '#3b82f6'}"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in npc/generate:', err);
    return res.json({
      success: true,
      data: generateFallbackNPC(req.body?.tier, req.body?.roleOrArchetype, req.body?.tone),
      warning: err.message,
    });
  }
});

// 4. Promote Side NPC to Main NPC
app.post('/api/npc/promote', async (req, res) => {
  try {
    const { npc, campaignContext = '', targetCR = '5' } = req.body;

    if (!npc) {
      return res.status(400).json({ error: 'Missing npc data' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        data: promoteFallbackNPC(npc, targetCR),
      });
    }

    const prompt = `You are a master TTRPG system designer and Game Master.
The players in an ongoing campaign have unexpectedly elevated a minor SIDE CHARACTER into a central figure (e.g. they attacked them, hired them as a long-term cohort, discovered they are the secret mastermind, or made them the focal point of the story)!
We need to immediately PROMOTE this NPC to a full MAIN NPC with formidable stats, high-stakes lore, and dramatic combat abilities suitable for CR ${targetCR}.

Existing Side NPC Data:
${JSON.stringify(npc, null, 2)}

Campaign Context: "${campaignContext || 'High stakes adventure'}"

Generate the upgraded NPC.
- Keep their identity, quirks, and core personality intact, but dramatically deepen their hidden powers, secret history, and combat lethality!
- Give them a full Statblock (STR, DEX, CON, INT, WIS, CHA), Armor Class, Hit Points, CR ${targetCR}, Multiattack, 2-3 Actions, Bonus Actions, Reactions, or Legendary/Mythic traits!
- Reveal the hidden reason they were lurking as a "humble" side character.

Return a STRICT JSON object with this schema:
{
  "name": "${npc.name}",
  "title": "Grand Upgraded Title (e.g. former Miller, now 'Vessel of the Iron Wyrm')",
  "race": "${npc.race || 'Human'}",
  "classOrRole": "Upgraded Formidable Class/Role",
  "tier": "main",
  "promotedFromSide": true,
  "promotionLore": "The dramatic story of why their true power is now unveiled",
  "flavor": {
    "appearance": "How their appearance shifts when their power is revealed",
    "voiceMannerism": "${npc.flavor?.voiceMannerism || 'Authoritative and measured'}",
    "flawOrQuirk": "${npc.flavor?.flawOrQuirk || 'Calculated restraint'}",
    "secretMotivation": "Their grand endgame objective in the campaign",
    "plotHook": "Major quest hook now that their status has transformed",
    "relationshipToParty": "How the dynamic changes with the party"
  },
  "stats": {
    "str": 18, "dex": 14, "con": 16, "int": 14, "wis": 16, "cha": 18,
    "ac": 18, "hp": 115, "maxHp": 115, "speed": "30 ft., fly 20 ft. (hover)",
    "cr": "${targetCR}", "pb": 3,
    "passivePerception": 16,
    "saves": "Con +6, Wis +6, Cha +7",
    "skills": "Insight +6, Deception +7, Arcana +5"
  },
  "combatAbilities": [
    { "name": "Multiattack (Action)", "type": "action", "description": "Makes two attacks with their signature weapon, or casts one spell and makes one strike." },
    { "name": "Revealed Arcane Strike", "type": "action", "description": "Melee Weapon Attack: +7 to hit, reach 5 ft. Hit: 13 (2d8 + 4) force damage plus 9 (2d8) radiant damage." },
    { "name": "Uncanny Retaliation (Reaction)", "type": "reaction", "description": "When damaged by an attacker within 30 ft, forces target to make DC 15 Wis save or take 14 psychic damage." }
  ],
  "tokenStyling": {
    "borderColor": "#dc2626",
    "borderStyle": "runic",
    "badgeText": "CR ${targetCR} BOSS",
    "ringColor": "#7f1d1d"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error promoting NPC:', err);
    return res.json({
      success: true,
      data: promoteFallbackNPC(req.body?.npc, req.body?.targetCR || '5'),
      warning: err.message,
    });
  }
});

// 5. Consultation & Master Dossier Generator
app.post('/api/adventure/dossier', async (req, res) => {
  try {
    const { seed } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ success: true, data: generateFallbackDossier(seed) });
    }

    const prompt = `You are Adventure on Demand, an expert Tabletop RPG Co-Pilot. Build a tight Master Dossier based on this seed:
Pitch: "${seed.pitch}"
System: ${seed.system}
Structure: ${seed.structure}
Duration: ${seed.durationHours} hours
Rating: ${seed.rating}
Event Seed: "${seed.eventSeed || 'None'}"
Victim Seed: "${seed.victimSeed || 'None'}"
Suspect Seed: "${seed.suspectSeed || 'None'}"
Locations Seed: "${seed.locationsSeed || 'None'}"

Adhere strictly to the episodic mystery framework:
- Event: The crime or disruption
- Victim: The targeted individual or entity
- Perpetrator & Motive: The true culprit whose identity and motive remain concealed until the climax
- 3 Ambiguous Suspects: Distinct figures with means, opportunity, and apparent motive
- Routing: 5 integral locations flowing Loc 1 (Event) -> Loc 3 or 5 (Suspects) -> Loc 2 or 4 (Clues) -> Loc 1 (Climax/Revelation)

Return a STRICT JSON object matching this schema:
{
  "event": { "title": "Crime/Event Name", "summary": "2 sentences" },
  "victim": { "name": "Name", "role": "Role", "connection": "Why players care" },
  "perpetrator": { "alias": "Secret True Culprit", "secretMotive": "Deep motive", "revealedAtLocation": 1 },
  "suspects": [
    { "name": "Suspect 1", "alias": "The Miller", "motive": "Plausible reason", "alibi": "Claimed whereabouts", "apparentGuilt": "High/Ambiguous" },
    { "name": "Suspect 2", "alias": "The Guard Captain", "motive": "Plausible reason", "alibi": "Claimed whereabouts", "apparentGuilt": "Medium/Ambiguous" },
    { "name": "Suspect 3", "alias": "The Apothecary", "motive": "Plausible reason", "alibi": "Claimed whereabouts", "apparentGuilt": "Low/Ambiguous" }
  ],
  "routing": [
    { "step": 1, "locationNumber": 1, "name": "Crime Scene / Event Location", "goal": "Find opening clues & witnesses" },
    { "step": 2, "locationNumber": 3, "name": "Suspect Stronghold / Workshop", "goal": "Interrogate Suspect 1 & find physical trace" },
    { "step": 3, "locationNumber": 5, "name": "Drained Aqueduct / Shady Haven", "goal": "Uncover false lead & forensic artifact" },
    { "step": 4, "locationNumber": 2, "name": "Archivist Reliquary / Alibi Check", "goal": "Piece together timeline discrepancy" },
    { "step": 5, "locationNumber": 1, "name": "Return to Scene for Confrontation", "goal": "Expose the true perpetrator and bring resolution" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const dossier = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: dossier });
  } catch (err: any) {
    console.error('Error generating dossier:', err);
    return res.json({
      success: true,
      data: generateFallbackDossier(req.body?.seed),
      warning: err.message,
    });
  }
});

// 6. Scene Node Deep Dive Generator
app.post('/api/adventure/node', async (req, res) => {
  try {
    const { nodeNumber, nodeName, system, rating, dossierContext } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        data: generateFallbackSceneNode(nodeNumber, nodeName, system, rating),
      });
    }

    const prompt = `Expand Location Node ${nodeNumber} ("${nodeName}") for ${system} (Rating: ${rating}).
Context Dossier: ${JSON.stringify(dossierContext)}

Generate exactly:
1. Sensory read-aloud description (under 80 words, wrapped in sensory detail).
2. GM-only notes detailing hidden traps, spoilers, motives, and DC targets.
3. Exactly 5 distinct clues discovered through skill checks, with at least 1 false lead.
4. At least 3 witnesses (or 5 if Location 1) with memorable 'Sounds Like' celebrity voice cadence comparisons (e.g. Morgan Freeman, Jack Sparrow, Gollum, Natasha Lyonne) to help DMs roleplay instantly.
5. Hazards or traps.

Return STRICT JSON:
{
  "readAloud": "Sensory read-aloud text...",
  "gmNotes": "Tactical DM guidance...",
  "clues": [
    { "id": "c1", "name": "Clue Name", "type": "physical", "checkRequired": "Perception / Investigation", "dc": 14, "revelation": "What it proves", "isFalseLead": false },
    { "id": "c2", "name": "Clue Name 2", "type": "document", "checkRequired": "Investigation", "dc": 12, "revelation": "What it proves", "isFalseLead": false },
    { "id": "c3", "name": "Clue Name 3", "type": "forensic", "checkRequired": "Medicine / Survival", "dc": 15, "revelation": "What it proves", "isFalseLead": true },
    { "id": "c4", "name": "Clue Name 4", "type": "arcane", "checkRequired": "Arcana", "dc": 13, "revelation": "What it proves", "isFalseLead": false },
    { "id": "c5", "name": "Clue Name 5", "type": "physical", "checkRequired": "Perception", "dc": 16, "revelation": "What it proves", "isFalseLead": false }
  ],
  "witnesses": [
    { "name": "Witness Name", "role": "Vocation", "soundsLike": "Morgan Freeman (deep, measured authority)", "statement": "What they tell players", "hiddenSecret": "What a DC 13 Insight reveals" },
    { "name": "Witness Name 2", "role": "Vocation", "soundsLike": "Natasha Lyonne (raspy, cynical, fast-talking)", "statement": "What they tell players", "hiddenSecret": "What a DC 14 Insight reveals" },
    { "name": "Witness Name 3", "role": "Vocation", "soundsLike": "Jack Sparrow (slurred, flamboyant deflection)", "statement": "What they tell players", "hiddenSecret": "What a DC 12 Insight reveals" }
  ],
  "hazardsOrTraps": ["Slick mossy flagstones (DC 12 Dex save or fall prone)"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const nodeData = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: nodeData });
  } catch (err: any) {
    console.error('Error generating scene node:', err);
    return res.json({
      success: true,
      data: generateFallbackSceneNode(req.body?.nodeNumber, req.body?.nodeName, req.body?.system, req.body?.rating),
      warning: err.message,
    });
  }
});

// Fallback generators in case Gemini API key is missing or offline
function generateFallbackSketchResult(type: string, notes: string, tone: string) {
  if (type === 'map') {
    return {
      name: 'Sunken Vault of the Moon Altar',
      environment: 'crypt',
      width: 20,
      height: 20,
      ambientLighting: 'Phosphorescent moss casting eerie turquoise radiance',
      hazards: 'Flooded stone floors (difficult terrain), pressure plates triggering dart volleys',
      tacticalNotes: 'Central pool creates 10ft chasm; elevated dais provides half-cover',
      description: 'The air smells of brackish water and ancient incense. Ancient columns flank a sunken hall leading to a desecrated lunar sanctuary.',
      rooms: [
        {
          id: 'r1',
          number: 1,
          name: 'The Sunken Antechamber',
          x: 2,
          y: 2,
          w: 6,
          h: 5,
          description: 'A wide vestibule with knee-deep stagnant water and shattered guardian reliefs.',
          features: ['Submerged brass chest', 'Collapsing archway'],
          monsters: '4x Drowned Lurkers',
          treasure: '120 silver coins and a silvered dagger',
        },
        {
          id: 'r2',
          number: 2,
          name: 'The Scriptatorium of Whispers',
          x: 10,
          y: 2,
          w: 7,
          h: 6,
          description: 'Stone lecterns bearing petrified parchment scrolls and stained glass mosaic windows.',
          features: ['Runic seal on door', 'Secret alcove behind eastern bookshelf'],
          monsters: '1x Specter of the Archivist',
          treasure: 'Scroll of Misty Step in bone cylinder',
        },
        {
          id: 'r3',
          number: 3,
          name: 'The Moonstone Sanctum',
          x: 4,
          y: 9,
          w: 12,
          h: 8,
          description: 'A grand octagonal chamber dominated by a cracked white marble altar floating over a dark abyss.',
          features: ['Floating altar slabs', 'Dual braziers burning with cold blue flame', 'Chasm drop 40ft'],
          monsters: '1x High Priest Malakor (Warlock of the Depths)',
          treasure: 'Amulet of Lunar Resonating (attunement)',
        },
      ],
    };
  } else if (type === 'npc') {
    return {
      name: 'Vaelen the Blind Falconer',
      title: 'Scout of the Bleak Crags',
      race: 'Wood Elf',
      classOrRole: 'Ranger / Information Broker',
      tier: 'main',
      stats: {
        str: 12, dex: 18, con: 14, int: 13, wis: 17, cha: 12,
        ac: 16, hp: 65, maxHp: 65, speed: '35 ft.', cr: '4', pb: 2,
        passivePerception: 19,
        saves: 'Dex +6, Wis +5',
        skills: 'Perception +7, Survival +5, Stealth +6',
      },
      combatAbilities: [
        { name: 'Avian Telepathy', type: 'trait', description: 'Can perceive through the senses of his bonded celestial hawk up to 1 mile.' },
        { name: 'Gale-Force Longbow', type: 'action', description: 'Ranged Weapon Attack: +6 to hit, range 150/600 ft. Hit: 9 (1d8 + 4) piercing damage plus 4 (1d8) thunder damage.' },
        { name: 'Feathered Slip (Reaction)', type: 'reaction', description: 'When hit by an attack, teleports 15 feet leaving a flurry of black feathers, imposing disadvantage on follow-up strikes.' },
      ],
      flavor: {
        appearance: 'A blindfold made of raven silk covers his eyes; a large iron-taloned falcon perches on his pauldron.',
        voiceMannerism: 'Speaks in hushed, rhythmic whispers as if listening to distant wind gusts.',
        flawOrQuirk: 'Never eats cooked food; constantly whistles subtle pitch tones to echolocate.',
        secretMotivation: 'His sight was stolen by the local baron; he is waiting for mercenaries daring enough to infiltrate the manor.',
        plotHook: 'Will guide the party through the lethal Razorwind Pass in exchange for a sealed ledger in the castle vault.',
        relationshipToParty: 'Cautiously intrigued by their equipment and deeds.',
      },
      tokenStyling: {
        borderColor: '#10b981',
        borderStyle: 'ornate',
        badgeText: 'CR 4 SCOUT',
        ringColor: '#047857',
      },
    };
  } else {
    return {
      name: 'Cinder-Grave Cleaver',
      type: 'weapon',
      rarity: 'Rare',
      attunement: true,
      description: 'A jagged greatsword forged from petrified brimstone, with embers pulsing softly within hairline fractures along the blade.',
      mechanicalEffects: [
        'You gain a +1 bonus to attack and damage rolls made with this magic weapon.',
        'On a hit, deals an extra 1d6 fire damage. When you score a critical hit, the target ignites and burns for 1d6 fire damage at the start of each of their turns until they use an action to douse it.',
      ],
      lore: 'Carried during the siege of Fort Caldera by the sellsword known as the Red Cinder.',
      quirkOrCurse: 'The wielder always smells faintly of burning birchwood and feels uncomfortably warm in cold weather.',
    };
  }
}

function generateFallbackCampaign(
  title: string,
  sessionLengthHours: number,
  sessionCount: number,
  partyLevel: number,
  tone: string,
  setting: string,
  premise: string
) {
  const count = sessionCount || 3;
  const sessions = [];

  for (let i = 1; i <= count; i++) {
    sessions.push({
      sessionNumber: i,
      title: i === 1 ? 'Act I: The Omens at Black Hollow' : i === count ? 'Climax: Shattered Throne of the Eclipse' : `Act ${i}: Whispers Beneath the Spires`,
      duration: `${sessionLengthHours || 3} Hours`,
      pacingSummary: `Paced tightly for a ${sessionLengthHours || 3}-hour session with clear exploration, tactical clash, and dramatic cliffhanger.`,
      timeline: [
        {
          timestamp: '0:00 - 0:35',
          phase: 'hook',
          title: 'Opening Tension & Investigation',
          description: 'The party arrives at the scene. Initial witnesses and disturbing omens.',
        },
        {
          timestamp: '0:35 - 1:20',
          phase: 'exploration',
          title: 'Navigating the Perilous Understructure',
          description: 'Traversing the dungeon corridors, solving the puzzle lock, avoiding traps.',
        },
        {
          timestamp: '1:20 - 2:20',
          phase: 'combat',
          title: 'Tactical Showdown with Vanguard',
          description: 'Combat encounter featuring terrain hazards, reinforcement waves, and verticality.',
        },
        {
          timestamp: '2:20 - 3:00',
          phase: 'climax',
          title: 'The Revelation & Session Cliffhanger',
          description: 'A key document is uncovered or the primary villain appears in projection.',
        },
      ],
      encounters: [
        {
          name: i === count ? 'The Shadow Archon Final Stand' : 'Ambush at the Sunken Bridge',
          type: 'combat',
          difficulty: i === count ? 'Deadly' : 'Hard',
          summary: 'Enemies use high ground, cover, and focus-fire spellcasting.',
        },
        {
          name: 'The Astrolabe Cipher',
          type: 'puzzle',
          difficulty: 'Medium',
          summary: 'Aligning three stone rings to match the constellation of the Gorgon.',
        },
      ],
      keyObjectives: [
        `Secure the sanctuary perimeter`,
        `Locate the second half of the Broken Sigil`,
      ],
      loot: `${150 * i} GP, Potion of Greater Healing, Ring of Feather Falling`,
    });
  }

  return {
    title: title || 'Echoes of the Void Citadel',
    synopsis: `A dark omen blankets ${setting}. Rumors spread of an ancient catacomb awakening beneath the foundations. The party is contracted to explore the depths before the convergence of twin moons unseals an ancient horror.`,
    tone: tone || 'Dark Fantasy',
    setting: setting || 'Crumbling Gothic Keep',
    partyLevel: partyLevel || 3,
    sessionCount: count,
    sessionLengthHours: sessionLengthHours || 3,
    sessions,
    handouts: [
      {
        id: 'h1',
        sessionNumber: 1,
        title: 'Torn Letter from the Castellan',
        type: 'parchment-letter',
        visualTheme: 'aged-parchment',
        author: 'Castellan Raymond',
        recipient: 'The Grand Inquisitor',
        textContent: 'My Lord,\nThe miners broke through the subterranean basalt wall last Tuesday. What they discovered does not belong to any kingdom of men. Three of my sentries refused to look into the shaft and clawed out their own eyes. Send soldiers, or send pyres. There is nothing left to harvest here.',
      },
    ],
    secrets: [
      {
        id: 's1',
        sessionNumber: 1,
        title: 'The Castellan\'s Hidden Pact',
        secretLevel: 'Hidden Truth',
        description: 'The Castellan did not uncover the crypt by accident; he dug deliberately to resurrect his fallen daughter.',
        discoveryMethod: 'DC 14 Investigation on the locked desk inside the castellan\'s private quarters.',
        revelationImpact: 'The players can confront him or blackmail him for safe passage through the inner gates.',
      },
    ],
    initialNpcs: [
      {
        name: 'Garrick the Grumpy Quartermaster',
        title: 'Keeper of the Armory',
        race: 'Dwarf',
        classOrRole: 'Fighter / Armorer',
        tier: 'side',
        flavor: {
          appearance: 'Missing his left ear, beard braided with tarnished copper bells.',
          voiceMannerism: 'Growls every response, spits tobacco into a cracked mug.',
          flawOrQuirk: 'Refuses to accept freshly minted coins; only takes worn currency.',
          secretMotivation: 'Smuggling silvered weapons to the resistance fighters in the woods.',
          plotHook: 'Will give the party masterwork equipment if they rescue his nephew from the dungeon cells.',
          relationshipToParty: 'Suspicious of flashy magic users.',
        },
        stats: {
          str: 16, dex: 10, con: 16, int: 11, wis: 13, cha: 9,
          ac: 16, hp: 32, maxHp: 32, speed: '25 ft.', cr: '1',
        },
      },
    ],
    suggestedMaps: [
      {
        name: 'The Whispering Under-Vault',
        environment: 'dungeon',
        width: 20,
        height: 20,
        ambientLighting: 'Faint green bioluminescence from cavern fungus',
        hazards: 'Slick algae, unstable pillars, subterranean updrafts',
        tacticalNotes: 'Central bridge is narrow (5ft wide) allowing easy bottlenecking',
        description: 'Deep stone chambers carved into volcanic basalt, dripping with cold moisture and etched with blasphemous runes.',
        rooms: [
          {
            id: 'r1',
            number: 1,
            name: 'The Chasm Bridge',
            x: 2,
            y: 4,
            w: 8,
            h: 6,
            description: 'A 50ft drop over a churning underground river spanned by a cracked flagstone bridge.',
            features: ['Narrow crossing', 'Arrow slits in northern wall'],
            monsters: '3x Cave Goblins and 1x Dire Wolf',
          },
          {
            id: 'r2',
            number: 2,
            name: 'The Ritual Spire',
            x: 11,
            y: 3,
            w: 7,
            h: 8,
            description: 'A soaring circular chamber with bloodstone pillars and an obsidian dais.',
            features: ['Altar of the Eclipse', 'Locked iron grate'],
            monsters: '1x Cult Fanatic and 2x Acolytes',
          },
        ],
      },
    ],
  };
}

function generateFallbackNPC(tier: string, role: string, tone: string) {
  const isMain = tier === 'main';
  return {
    name: isMain ? 'Lord Malakar the Unyielding' : 'Bran the Lantern-Bearer',
    title: isMain ? 'Warden of the Iron Spire' : 'Cemetery Guide',
    race: isMain ? 'Tiefling' : 'Human',
    classOrRole: isMain ? 'Oathbreaker Paladin' : 'Gravedigger / Torchbearer',
    tier,
    flavor: {
      appearance: isMain
        ? 'Towering figure clad in blackened plate with obsidian horns curving backward.'
        : 'Lean, dirt-streaked youth in a moth-eaten woolen cloak holding a brass bullseye lantern.',
      voiceMannerism: isMain
        ? 'Deep, booming timbre echoing with subtle demonic resonance.'
        : 'Jittery, fast-talking, frequently clears his throat and glances nervously at shadows.',
      flawOrQuirk: isMain
        ? 'Believes mercy is the cruelest form of patronization.'
        : 'Terrified of moths; keeps dried garlic cloves in his pockets.',
      secretMotivation: isMain
        ? 'Seeking the lost crown of the archduke to assert blood sovereignty.'
        : 'Saw who buried the royal assassin three nights ago and is waiting to flee town.',
      plotHook: isMain
        ? 'Demands the party deliver the heart of the Wyrm or face total annihilation.'
        : 'Offers a secret tunnel into the cathedral crypt in exchange for 10 gold pieces and safe escort.',
      relationshipToParty: isMain
        ? 'Views the party as either disposable instruments or worthy foes.'
        : 'Desperately hopes the adventurers are as tough as they look.',
    },
    stats: {
      str: isMain ? 18 : 10,
      dex: isMain ? 12 : 14,
      con: isMain ? 16 : 12,
      int: isMain ? 14 : 10,
      wis: isMain ? 12 : 13,
      cha: isMain ? 16 : 11,
      ac: isMain ? 18 : 12,
      hp: isMain ? 92 : 16,
      maxHp: isMain ? 92 : 16,
      speed: '30 ft.',
      cr: isMain ? '5' : '1/8',
      pb: isMain ? 3 : 2,
      passivePerception: isMain ? 14 : 11,
      saves: isMain ? 'Wis +5, Cha +6' : 'Dex +2',
      skills: isMain ? 'Athletics +7, Intimidation +6' : 'Stealth +4, Perception +3',
    },
    combatAbilities: isMain
      ? [
          { name: 'Multiattack (Action)', type: 'action', description: 'Makes two attacks with his Hellfire Greatsword.' },
          { name: 'Hellfire Greatsword', type: 'action', description: 'Melee Weapon Attack: +7 to hit, reach 5 ft. Hit: 11 (2d6 + 4) slashing damage plus 7 (2d6) fire damage.' },
          { name: 'Dreadful Aspect (Recharge 5-6)', type: 'action', description: 'Each creature within 30 ft must succeed on a DC 14 Wisdom save or be frightened for 1 minute.' },
        ]
      : [
          { name: 'Shovel Club', type: 'action', description: 'Melee Attack: +2 to hit, Hit: 3 (1d6) bludgeoning damage.' },
          { name: 'Lantern Flare', type: 'action', description: 'Exposes burning oil to blind an adjacent foe until the end of their turn (DC 11 Dex save).' },
        ],
    tokenStyling: {
      borderColor: isMain ? '#ef4444' : '#eab308',
      borderStyle: isMain ? 'ornate' : 'minimal',
      badgeText: isMain ? 'CR 5 BOSS' : 'NPC',
      ringColor: isMain ? '#991b1b' : '#3b82f6',
    },
  };
}

function promoteFallbackNPC(npc: any, targetCR: string) {
  return {
    ...npc,
    tier: 'main',
    promotedFromSide: true,
    title: `${npc.title || 'Former Acquaintance'} (Awakened Dread Sovereign)`,
    promotionLore: `What seemed like an unassuming ${npc.classOrRole || 'companion'} was merely a dormant guise. Triggered by recent events, their true power has resurfaced with apocalyptic clarity.`,
    stats: {
      str: 18,
      dex: 16,
      con: 16,
      int: 14,
      wis: 16,
      cha: 18,
      ac: 18,
      hp: 120,
      maxHp: 120,
      speed: '30 ft., fly 30 ft. (hover)',
      cr: targetCR || '5',
      pb: 3,
      passivePerception: 16,
      saves: 'Con +6, Wis +6, Cha +7',
      skills: 'Deception +7, Insight +6, Arcana +5',
    },
    combatAbilities: [
      {
        name: 'Multiattack (Action)',
        type: 'action',
        description: 'Makes two devastating attacks, or casts a spell and makes one attack.',
      },
      {
        name: 'Awakened Relic Strike',
        type: 'action',
        description: 'Melee Weapon Attack: +7 to hit, reach 5 ft. Hit: 13 (2d8 + 4) force damage plus 9 (2d8) radiant/necrotic damage.',
      },
      {
        name: 'Retributive Pulse (Reaction)',
        type: 'reaction',
        description: 'When struck by a creature within 10 ft, releases a shockwave dealing 10 force damage and pushing them 10 ft away.',
      },
      {
        name: 'Legendary Action: Shifting Shadow (Costs 1 Action)',
        type: 'legendary',
        description: 'Teleports up to 30 ft without provoking opportunity attacks.',
      },
    ],
    tokenStyling: {
      borderColor: '#dc2626',
      borderStyle: 'runic',
      badgeText: `CR ${targetCR || '5'} BOSS`,
      ringColor: '#991b1b',
    },
  };
}

function generateFallbackDossier(seed: any) {
  const pitch = seed?.pitch || 'The High Scribe is found poisoned within the locked vault';
  return {
    event: {
      title: seed?.title || 'The Midnight Bell Murder',
      summary: `During the autumn solstice festival, the cathedral bells sounded unexpectedly at midnight. Scribe Alistair was found dead within the inner reliquary, locked from the inside.`
    },
    victim: {
      name: seed?.victimSeed || 'Master Scribe Alistair',
      role: 'Keeper of the Sunken Seal',
      connection: 'Hired the adventurers to investigate missing royal genealogy pages three days prior.'
    },
    perpetrator: {
      alias: 'Father Raymond the Trembling',
      secretMotive: 'Sought the lost abyssal incantation to cure his terminal affliction, requiring Alistair to be silenced before the council convened.',
      revealedAtLocation: 1
    },
    suspects: [
      {
        name: 'Garrick the Smuggler Quartermaster',
        alias: 'The Iron Bellman',
        motive: 'Alistair caught him skimming silver from the cathedral tithes.',
        alibi: 'Claims to have been drinking at the Black Boar Tavern all night.',
        apparentGuilt: 'High / Ambiguous (carries a silver bell with trace belladonna dust)'
      },
      {
        name: 'Lady Beatrice of the High Council',
        alias: 'The Velvet Proctor',
        motive: 'Inherits the ancestral manor if Alistair dies without legitimate heir.',
        alibi: 'Claims to have been in closed session with the city magistrate.',
        apparentGuilt: 'Medium / Ambiguous (her carriage was spotted near the cathedral gate at 11:30 PM)'
      },
      {
        name: 'Brother Kael the Herbalist',
        alias: 'The Weeping Botanist',
        motive: 'Alistair threatened to shut down his apothecary over unapproved nightshade imports.',
        alibi: 'Claims he was harvesting moon-moss in the cemetery swamps.',
        apparentGuilt: 'Low / Ambiguous (distills the exact rare poison found in the victim\'s chalice)'
      }
    ],
    routing: [
      { step: 1, locationNumber: 1, name: 'The Reliquary Vault (Crime Scene)', goal: 'Examine body, discover locked door mechanism & initial 5 witnesses' },
      { step: 2, locationNumber: 3, name: 'The Clocktower Foundry (Suspect 1)', goal: 'Confront Garrick, inspect smuggling ledgers, obtain cipher scrap' },
      { step: 3, locationNumber: 5, name: 'The Drained Aqueduct & Sluice', goal: 'Track footprints, discover discarded vial and decipher false lead' },
      { step: 4, locationNumber: 2, name: 'The Cloister Archives (Alibi Verification)', goal: 'Cross-examine Lady Beatrice’s sealed alibi and unearth the true motive' },
      { step: 5, locationNumber: 1, name: 'Return to Reliquary (Dramatic Climax)', goal: 'Expose the true culprit before the celestial convergence triggers' }
    ]
  };
}

function generateFallbackSceneNode(nodeNumber: number = 1, nodeName?: string, system: string = 'dnd-5.5e', rating: string = 'teen') {
  const isLoc1 = Number(nodeNumber) === 1;
  return {
    readAloud: `The heavy oak door groans on iron hinges. Cold drafts smelling of sulfur and damp mortar sweep across cracked flagstones. A solitary candle flickers on an overturned lectern, casting dancing shadows over a stained vellum manuscript.`,
    gmNotes: `Location ${nodeNumber}: ${nodeName || 'The Crime Scene'}. The victim’s lock was picked with a masterwork bronze hairpin (DC 14 Investigation to identify). Trap: Loose ceiling flagstone above eastern alcove (DC 13 Perception, deals 2d6 bludgeoning if triggered).`,
    clues: [
      {
        id: `c-${nodeNumber}-1`,
        name: 'Residue on the Goblet',
        type: 'forensic',
        checkRequired: 'Investigation or Medicine',
        dc: 13,
        revelation: 'Traces of concentrated belladonna mixed with communion wine; death occurred within 20 minutes.',
        isFalseLead: false
      },
      {
        id: `c-${nodeNumber}-2`,
        name: 'Muddy Boot Prints (Size 10)',
        type: 'physical',
        checkRequired: 'Survival or Perception',
        dc: 14,
        revelation: 'Heavy hobnail boots matched to the foundry workers at Location 3.',
        isFalseLead: false
      },
      {
        id: `c-${nodeNumber}-3`,
        name: 'Torn Velvet Ribbon',
        type: 'physical',
        checkRequired: 'Perception',
        dc: 15,
        revelation: 'Dyed with expensive Tyrian purple, seemingly implicating Lady Beatrice.',
        isFalseLead: true
      },
      {
        id: `c-${nodeNumber}-4`,
        name: 'Petrified Seal Impression',
        type: 'document',
        checkRequired: 'History or Arcana',
        dc: 12,
        revelation: 'The broken wax seal does not bear the church cross, but an eclipse heraldry from the lower catacombs.',
        isFalseLead: false
      },
      {
        id: `c-${nodeNumber}-5`,
        name: 'Concealed Ledger Key',
        type: 'physical',
        checkRequired: 'Investigation',
        dc: 16,
        revelation: 'Hidden inside the hollow base of a saint statue; opens the secret lockbox in Location 2.',
        isFalseLead: false
      }
    ],
    witnesses: [
      {
        name: 'Father Paul the Sexton',
        role: 'Cathedral Caretaker',
        soundsLike: 'Morgan Freeman (deep, patient, authoritative cadence)',
        statement: 'I heard the seventh bell strike twice, followed by a heavy thud in the vault. When I arrived, the deadbolt was engaged from within.',
        hiddenSecret: 'DC 13 Insight: He saw someone climbing out the clerestory window but was bribed with 50 silver pieces to remain silent.'
      },
      {
        name: 'Tilly the Candle-Dripper',
        role: 'Altar Servant',
        soundsLike: 'Natasha Lyonne (raspy, cynical, rapid-fire Brooklyn delivery)',
        statement: 'Look, I just scrape the wax off the pews. But I know what a dead man looks like, and Alistair had that twitchy look all afternoon.',
        hiddenSecret: 'DC 14 Insight: She pocketed a bloodied handkerchief dropped near the altar steps.'
      },
      {
        name: 'Captain Varis',
        role: 'Night Watch Lieutenant',
        soundsLike: 'Christoph Waltz (polite, razor-sharp, chillingly composed)',
        statement: 'No unauthorized citizen entered through the north portcullis. My men were vigilant. Unless your murderer has wings, they are still inside.',
        hiddenSecret: 'DC 12 Insight: Varis is covering up the fact that two guards fell asleep at their post around 11:00 PM.'
      }
    ],
    hazardsOrTraps: [
      'Unstable Floor Joists: DC 13 Dex save or drop 10 feet into the flooded ossuary below (1d6 bludgeoning + difficult terrain).'
    ]
  };
}

// Vite middleware in dev or static serve in prod
const setupServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Grimoire & Grid server listening on http://0.0.0.0:${PORT}`);
  });
};

setupServer();
