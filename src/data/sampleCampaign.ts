import { Campaign } from '../types/ttrpg';

export const initialCampaign: Campaign = {
  id: 'camp-default-1',
  title: 'Crypt of the Eclipse Sovereign',
  synopsis: `Beneath the crumbling foundations of Karstkeep Cathedral lies a forgotten subterranean sepulcher sealed during the Black Moon of 412. When seismic tremors shatter the sanctum wards, subterranean entities begin corrupting the local waterways. The adventurers must delve through the flooded catacombs, decipher lunar puzzle locks, and neutralize the slumbering Shadow Archon before the approaching celestial convergence completes its resurrection.`,
  tone: 'Gothic Grimdark',
  setting: 'Desolate Mist-Shrouded Highlands',
  partyLevel: 3,
  partySize: 4,
  sessionCount: 3,
  sessionLengthHours: 3,
  sessions: [
    {
      sessionNumber: 1,
      title: 'Act I: The Weeping Catacombs',
      duration: '3 Hours',
      pacingSummary: 'Tightly paces the discovery of the poisoned aqueduct, an ominous descent into flooded crypts, and an intense vanguard ambush.',
      timeline: [
        {
          timestamp: '0:00 - 0:35',
          phase: 'hook',
          title: 'The Blighted Fountain & Summons',
          description: 'The party witnesses church bells tolling as black ichor pours from the town fountain. Father Raymond contracts them for immediate subterranean reconnaissance.',
        },
        {
          timestamp: '0:35 - 1:25',
          phase: 'exploration',
          title: 'Breaching the Submerged Gate',
          description: 'Navigating knee-deep brackish water, decoding petrified murals, and bypassing an ancient scythe pendulum trap (DC 13 Dex).',
        },
        {
          timestamp: '1:25 - 2:20',
          phase: 'combat',
          title: 'Battle at the Broken Sarcophagus Dais',
          description: 'Four Drowned Ghouls burst from murky water led by a Skeletal Crypt Warden who attempts to shove adventurers into a 15ft deep sluice channel.',
        },
        {
          timestamp: '2:20 - 3:00',
          phase: 'climax',
          title: 'The Broken Silver Seal',
          description: 'The party discovers the central vault door forced open from the inside. A bloody journal belonging to the town mayor is pinned to the stone with a cult dagger.',
        },
      ],
      encounters: [
        {
          name: 'The Flooded Sluice Ambush',
          type: 'combat',
          difficulty: 'Medium',
          summary: 'Drowned Ghouls grapple PCs under murky water (DC 12 Athletics to escape drowning risk); elevated stone ledges grant advantage on ranged attacks.',
        },
        {
          name: 'The Runic Pressure Gate',
          type: 'puzzle',
          difficulty: 'Medium',
          summary: 'Stepping on glyphs corresponding to the phases of the moon from crescent to eclipse disarms the crushing stone block.',
        },
      ],
      keyObjectives: [
        'Locate the contamination source in the upper catacombs',
        'Recover the missing cathedral excavation team',
        'Secure the antechamber before nightfall',
      ],
      loot: '140 Silver Pieces, 2x Potions of Healing, Bone-carved Wand of Secrets',
      mapIds: ['map-1'],
      handoutIds: ['handout-1'],
      secretIds: ['secret-1'],
    },
    {
      sessionNumber: 2,
      title: 'Act II: The Hall of Blackened Glass',
      duration: '3 Hours',
      pacingSummary: 'Focuses on stealth, deciphering ancient prophecies, and surviving the trap-laden gauntlet of the eclipse acolytes.',
      timeline: [
        {
          timestamp: '0:00 - 0:40',
          phase: 'exploration',
          title: 'The Whispering Scriptatorium',
          description: 'Ancient archives where stone busts whisper forgotten crimes. Finding the lunar key requires matching book codices.',
        },
        {
          timestamp: '0:40 - 1:40',
          phase: 'roleplay',
          title: 'Parley with the Bound Inquisitor',
          description: 'An imprisoned shadow inquisitor offers passage in exchange for severing their spectral chains.',
        },
        {
          timestamp: '1:40 - 2:30',
          phase: 'combat',
          title: 'The Mirror-Phantasm Clash',
          description: 'Cult fanatics shatter stained obsidian glass, summoning shadowy duplicates of the adventurers.',
        },
        {
          timestamp: '2:30 - 3:00',
          phase: 'climax',
          title: 'The Great Gate Unsealing',
          description: 'Distant chanting shakes the cavern walls as the eclipse reaches totality.',
        },
      ],
      encounters: [
        {
          name: 'The Obsidian Stalker Pack',
          type: 'combat',
          difficulty: 'Hard',
          summary: 'Stalkers meld into shadow zones (stealth check DC 16); PCs must light braziers to strip their magic resistance.',
        },
      ],
      keyObjectives: [
        'Retrieve the Moonstone Key from the reliquary',
        'Sever the ritual conduits feeding the lower vault',
      ],
      loot: 'Pactbound Ring of the Eclipse, 300 GP, Scroll of Silence',
    },
    {
      sessionNumber: 3,
      title: 'Act III: Climax at the Eclipse Chasm',
      duration: '3 Hours',
      pacingSummary: 'A high-octane dungeon finale featuring an environmental countdown, multi-stage boss combat, and campaign resolution.',
      timeline: [
        {
          timestamp: '0:00 - 0:30',
          phase: 'hook',
          title: 'Descent into the Void Well',
          description: 'Spiraling down floating obsidian stones over an endless abyss.',
        },
        {
          timestamp: '0:30 - 1:15',
          phase: 'exploration',
          title: 'The Resonating Pillars',
          description: 'Party must shatter four ritual crystals while fending off flying wraiths.',
        },
        {
          timestamp: '1:15 - 2:30',
          phase: 'combat',
          title: 'Showdown with the Shadow Archon',
          description: 'Dynamic boss battle with lair actions: eclipse darkness waves, collapsing floating platforms, and necrotic tendrils.',
        },
        {
          timestamp: '2:30 - 3:00',
          phase: 'climax',
          title: 'The Dawn Shatters the Gloom',
          description: 'The sanctuary collapses as sunlight pierces through the cracked ceiling; escape skill challenge and epilogue.',
        },
      ],
      encounters: [
        {
          name: 'The Shadow Archon (Boss Encounter)',
          type: 'combat',
          difficulty: 'Deadly',
          summary: 'Phase 1: Runic barrier deflects spells; Phase 2: Dual shadow blades with misty teleportation; Lair: Falling stalactites on count 20.',
        },
      ],
      keyObjectives: [
        'Disrupt the 4 Void Anchors before turn 5',
        'Defeat or reseal the Shadow Archon',
        'Escape before the cavern roof collapses',
      ],
      loot: 'The Eclipse Crown (Legendary Relic), 800 GP, Gem of True Seeing',
    },
  ],
  maps: [
    {
      id: 'map-1',
      name: 'The Sunken Catacombs of Karstkeep',
      environment: 'crypt',
      width: 22,
      height: 18,
      ambientLighting: 'Pale green phosphorescent moss and cold dripping mist',
      hazards: 'Flooded floors (half speed), jagged limestone stalagmites, scythe traps',
      tacticalNotes: 'Narrow bridges channel choke points; central dais provides 3/4 cover against ranged attacks',
      description: 'Ancient subterranean hall carved from cold blue-grey granite. Stagnant knee-deep water ripples with every step. Sarcophagi line the walls like silent sentinels.',
      gridVisible: true,
      rooms: [
        {
          id: 'r1',
          number: 1,
          name: 'Flooded Entry Vestibule',
          x: 2,
          y: 2,
          w: 6,
          h: 5,
          description: 'Water pours from cracked ceiling conduits. Smashed iron gates hang loosely from their hinges.',
          features: ['Water valve wheel', 'Ancient Latin warnings carved in stone', 'Shattered holy water basin'],
          monsters: '3x Drowned Crawlers',
          treasure: 'Pouch containing 45 silver coins and an ivory holy symbol',
        },
        {
          id: 'r2',
          number: 2,
          name: 'The Pillar Sluice Channel',
          x: 9,
          y: 2,
          w: 11,
          h: 5,
          description: 'Four thick octagonal columns support a vaulted groin ceiling. A deep fast-flowing canal cuts through the center.',
          features: ['Slick mossy bridge', 'Arrow slits in eastern wall', 'Rotting timber barricades'],
          monsters: '1x Crypt Warden and 2x Skeleton Archers',
          treasure: 'Silvered shortsword in ornate scabbard',
        },
        {
          id: 'r3',
          number: 3,
          name: 'The Desecrated Lunar Altar',
          x: 4,
          y: 9,
          w: 14,
          h: 7,
          description: 'A massive circular sanctuary dominated by an obsidian dais carved with celestial constellations. Dark liquid bubbles up from the central altar bowl.',
          features: ['Floating rune-stones', 'Dual brass braziers of blue fire', 'Concealed trapdoor under north dais'],
          monsters: 'High Priest Malakor & 2 Cult Zealots',
          treasure: 'Amulet of the Eclipse, ritual dagger, potion of psychic resistance',
        },
      ],
    },
  ],
  npcs: [
    {
      id: 'npc-1',
      name: 'Father Raymond the Trembling',
      title: 'Curator of the Karstkeep Reliquary',
      race: 'Human',
      classOrRole: 'Cleric / Archivist',
      tier: 'side',
      stats: {
        str: 10,
        dex: 11,
        con: 12,
        int: 14,
        wis: 15,
        cha: 13,
        ac: 12,
        hp: 19,
        maxHp: 19,
        speed: '30 ft.',
        cr: '1/4',
        pb: 2,
        passivePerception: 14,
        saves: 'Wis +4, Cha +3',
        skills: 'Religion +4, History +4, Insight +4',
      },
      combatAbilities: [
        {
          name: 'Sacred Flame (Cantrip)',
          type: 'action',
          description: 'Flame-like radiance descends on a target within 60 ft. DC 12 Dex save or 1d8 radiant damage. No benefit from cover.',
        },
        {
          name: 'Trembling Benediction',
          type: 'bonus',
          description: 'Grants an ally within 30 ft an extra 1d4 on their next saving throw.',
        },
      ],
      flavor: {
        appearance: 'Thinning silver hair, ink-stained fingernails, wears heavy wool vestments smelling of frankincense and old vellum.',
        voiceMannerism: 'Halting, stammering whisper that drops to a paranoid mutter when mentioning the catacombs.',
        flawOrQuirk: 'Obsessively touches the silver prayer beads around his neck when anyone draws a blade.',
        secretMotivation: 'Accidentally unlocked the subterranean vault three weeks ago while searching for a lost manuscript.',
        plotHook: 'Will decipher any ancient scripture found in the dungeon for free if the party promises not to reveal his complicity.',
        relationshipToParty: 'Views them as his only salvation before the cathedral council investigates.',
      },
      tokenStyling: {
        borderColor: '#eab308',
        borderStyle: 'ornate',
        badgeText: 'PATRON',
        ringColor: '#ca8a04',
      },
    },
    {
      id: 'npc-2',
      name: 'High Priest Malakor the Eclipse-Born',
      title: 'Herald of the Void convergence',
      race: 'Tiefling',
      classOrRole: 'Warlock of the End Stars',
      tier: 'main',
      stats: {
        str: 14,
        dex: 16,
        con: 16,
        int: 15,
        wis: 14,
        cha: 18,
        ac: 16,
        hp: 84,
        maxHp: 84,
        speed: '30 ft.',
        cr: '5',
        pb: 3,
        passivePerception: 15,
        saves: 'Wis +5, Cha +7',
        skills: 'Arcana +5, Deception +7, Intimidation +7',
      },
      combatAbilities: [
        {
          name: 'Multiattack (Action)',
          type: 'action',
          description: 'Malakor makes two Eldritch Scythe strikes or casts Eldritch Blast (2 beams) and uses Shadow Step.',
        },
        {
          name: 'Eldritch Scythe',
          type: 'action',
          description: 'Melee Spell Attack: +7 to hit, reach 10 ft., one target. Hit: 13 (2d8 + 4) force damage plus 7 (2d6) necrotic damage.',
        },
        {
          name: 'Shadow Step (Bonus Action)',
          type: 'bonus',
          description: 'Teleports up to 30 feet to an unoccupied space in dim light or darkness with advantage on next attack.',
        },
        {
          name: 'Shield of Screaming Souls (Reaction)',
          type: 'reaction',
          description: 'When hit by an attack, gains +4 AC until start of next turn; if the attack misses, the attacker takes 7 psychic damage.',
        },
      ],
      flavor: {
        appearance: 'Pale skin with branching obsidian veins, crowned with curled ram horns; draped in celestial robes of star-speckled velvet.',
        voiceMannerism: 'Melodic, serene baritone that remains chillingly calm even during lethal combat.',
        flawOrQuirk: 'Speaks of the impending cataclysm as a benevolent mercy, pitying the mortal world.',
        secretMotivation: 'Seeks to extinguish the sun to end mortality and pain across the planes.',
        plotHook: 'Can be persuaded to delay the ritual if the party presents the lost Seal of the Lunar Archon.',
        relationshipToParty: 'Considers them magnificent playthings destined to join his court of shades.',
      },
      tokenStyling: {
        borderColor: '#dc2626',
        borderStyle: 'runic',
        badgeText: 'BOSS CR 5',
        ringColor: '#991b1b',
      },
    },
  ],
  items: [
    {
      id: 'item-1',
      name: 'Eclipse Blade of Karstkeep',
      type: 'weapon',
      rarity: 'Rare',
      attunement: true,
      description: 'A curved falchion forged of meteor iron that absorbs surrounding candlelight. The edge glows with twilight amethyst hue when undead or fiends are within 60 feet.',
      mechanicalEffects: [
        'You gain a +1 bonus to attack and damage rolls made with this magic weapon.',
        'While in dim light or darkness, weapon attacks score a critical hit on a roll of 19 or 20.',
        'Once per long rest, you can swing the blade to cast Darkness centered on yourself without concentration.',
      ],
      lore: 'Carried by the Shadow Guard of Karstkeep during the Siege of Mourning.',
      quirkOrCurse: 'The wielder’s shadow constantly lags half a second behind their actual body movements.',
    },
  ],
  handouts: [
    {
      id: 'handout-1',
      sessionNumber: 1,
      title: 'Blood-Stained Confession of Mayor Alistair',
      type: 'parchment-letter',
      visualTheme: 'bloodstained',
      author: 'Mayor Alistair Vance',
      recipient: 'Whoever finds my remains',
      textContent: `Forgive me. The sickness in my lungs was worsening, and the apothecary gave me no more than two winters. When the pale gentleman offered health in exchange for unsealing the crypt drains, I convinced myself it was merely superstitious rubble.

The ward was broken three midnights ago. When the stone split, the sound was not rock grinding on rock—it was a deep intake of breath from beneath the earth.

Do not trust Father Raymond. He was there beside me when the first seal cracked. May the gods have mercy on our souls.`,
    },
  ],
  secrets: [
    {
      id: 'secret-1',
      sessionNumber: 1,
      title: 'Father Raymond’s Duplicity',
      secretLevel: 'Hidden Truth',
      description: 'Father Raymond claims to be an innocent victim, but was secretly extorted by Mayor Alistair to supply holy keys for the subterranean excavation.',
      discoveryMethod: 'DC 14 Investigation on the cathedral ledgers or successfully confronting him with the Mayor’s bloodstained confession letter.',
      revelationImpact: 'The players can force Raymond into revealing the secret bypass tunnel directly to Room 3, avoiding the drowned ghoul ambushes.',
    },
    {
      id: 'secret-2',
      sessionNumber: 2,
      title: 'The Eclipse Weakness',
      secretLevel: 'Campaign Twist',
      description: 'High Priest Malakor’s warlock invulnerability is bound to the four obsidian lanterns in the central sanctum. Extinguishing them strips his necrotic immunity.',
      discoveryMethod: 'DC 15 Arcana check when studying the murals in the scriptatorium or casting Detect Magic on the ritual circle.',
      revelationImpact: 'Turns an almost unwinnable boss fight into a tactical puzzle encounter where rogue/monk can run around snuffling lanterns.',
    },
  ],
  dossier: {
    event: {
      title: 'The Blighted Cathedral Vault Breach',
      summary: 'The sealed sepulcher below Karstkeep was forced open from within, and black ichor began pouring into the town fountains.'
    },
    victim: {
      name: 'Master Scribe Alistair',
      role: 'Keeper of the Sunken Seal',
      connection: 'Commissioned the adventuring party after finding his research sanctum ransacked.'
    },
    perpetrator: {
      alias: 'Father Raymond the Trembling',
      secretMotive: 'Extorted by Mayor Alistair to obtain forbidden healing, but now trapped by an awaken warlock pact.',
      revealedAtLocation: 1
    },
    suspects: [
      {
        name: 'Garrick the Armory Smuggler',
        alias: 'The Iron Bellman',
        motive: 'Threatened with execution if Alistair exposed his illicit silver weapon trade.',
        alibi: 'Claims he was loading cargo at the outer dry-docks with three apprentices.',
        apparentGuilt: 'High / Ambiguous (carries a key matching the outer drainage gate)'
      },
      {
        name: 'Lady Beatrice Vance',
        alias: 'The Velvet Proctor',
        motive: 'Inherits the entire cathedral estate and mining rights upon Alistair’s demise.',
        alibi: 'Claims she was attending high council banquet in the upper borough.',
        apparentGuilt: 'Medium / Ambiguous (her coachman was seen washing bloodied mud from her wheels)'
      },
      {
        name: 'Brother Kael',
        alias: 'The Weeping Botanist',
        motive: 'Banned from the apothecary gardens after cultivating toxic moon-moss.',
        alibi: 'Claims he was praying in the cemetery chapel until dawn.',
        apparentGuilt: 'Low / Ambiguous (identified the subterranean toxin within minutes of exposure)'
      }
    ],
    routing: [
      { step: 1, locationNumber: 1, name: 'The Weeping Catacomb Vault (Crime Scene)', goal: 'Examine breach, gather initial clues, interview 5 cathedral witnesses' },
      { step: 2, locationNumber: 3, name: 'Garrick\'s Iron Foundry & Armory', goal: 'Confront Garrick, search smuggler hideout, find poisoned crossbolt' },
      { step: 3, locationNumber: 5, name: 'The Drained Aqueduct Sluice', goal: 'Investigate black ichor source, decipher false lead, survive crawler ambush' },
      { step: 4, locationNumber: 2, name: 'The Whispering Scriptatorium & Reliquary', goal: 'Verify Lady Beatrice’s alibi, discover hidden journal of the pact' },
      { step: 5, locationNumber: 1, name: 'Return to Catacomb Altar for Climax', goal: 'Confront Father Raymond before the eclipse completes the awakening' }
    ]
  },
  nodes: [
    {
      id: 'node-1',
      locationNumber: 1,
      name: 'The Weeping Catacomb Vault',
      readAloud: 'Cold drafts smelling of sulfur and wet granite sweep through the shattered iron portcullis. Black water laps against cracked flagstones where broken wax seals lie scattered like drops of dried blood.',
      gmNotes: 'Crime scene of the initial breach. The deadbolt was sheared with pneumatic force from the inside. Trap: Pressure plate triggering pendulum blade at entrance (DC 13 Perception to spot, DC 13 Dex save or 2d6 slashing).',
      clues: [
        { id: 'c1-1', name: 'Sheared Bronze Deadbolt', type: 'physical', checkRequired: 'Investigation', dc: 13, revelation: 'The vault door was unlocked with a genuine master key before being blasted off hinges.', isFalseLead: false },
        { id: 'c1-2', name: 'Muddy Footprints (Size 10)', type: 'physical', checkRequired: 'Survival', dc: 14, revelation: 'Matches heavy hobnail boots made exclusively at Garrick\'s Foundry.', isFalseLead: false },
        { id: 'c1-3', name: 'Torn Velvet Scarf', type: 'physical', checkRequired: 'Perception', dc: 15, revelation: 'Purple silk with house crest of Beatrice, deliberately planted near the door.', isFalseLead: true },
        { id: 'c1-4', name: 'Alchemical Residue in Well', type: 'forensic', checkRequired: 'Medicine or Arcana', dc: 12, revelation: 'The black water is infused with distilled nightshade and abyssal bile.', isFalseLead: false },
        { id: 'c1-5', name: 'Hidden Hollow Relic Base', type: 'physical', checkRequired: 'Investigation', dc: 16, revelation: 'Concealed compartment contains a ledger missing its final three pages.', isFalseLead: false }
      ],
      witnesses: [
        { name: 'Father Paul the Sexton', role: 'Cathedral Caretaker', soundsLike: 'Morgan Freeman (deep, patient, authoritative resonance)', statement: 'The bells rang three times backwards at midnight. When I arrived, the lock was already melting.', hiddenSecret: 'DC 13 Insight: He saw Father Raymond sprinting toward the river clutching a velvet box.' },
        { name: 'Tilly the Candle-Dripper', role: 'Altar Servant', soundsLike: 'Natasha Lyonne (raspy, cynical, rapid-fire Brooklyn delivery)', statement: 'I mind my own wax and wick, but somebody was moving heavy crates down here before dusk.', hiddenSecret: 'DC 14 Insight: She hid a broken bronze hairpin dropped by the intruder.' },
        { name: 'Captain Varis', role: 'Watch Lieutenant', soundsLike: 'Christoph Waltz (polite, razor-sharp, chillingly composed)', statement: 'The city gate was locked. Whoever breached this sepulcher was already inside our walls.', hiddenSecret: 'DC 12 Insight: Varis is covering up that sentries took a bribe from Garrick.' },
        { name: 'Milo the Beggar Boy', role: 'Street Urchin', soundsLike: 'Gollum (raspy, wheezing, conspiratorial whisper)', statement: 'The shiny lady in the velvet carriage dropped silver in the ditch, yes she did!', hiddenSecret: 'DC 11 Insight: He was paid 5 copper to yell about the carriage.' },
        { name: 'Old Mother Greta', role: 'Weaver', soundsLike: 'Natasha Lyonne (grumpy, gravelly tavern dialect)', statement: 'The water in my dye tubs turned black as pitch right after the chimes.', hiddenSecret: 'DC 13 Insight: She knows the secret storm-drain path into Location 5.' }
      ],
      hazardsOrTraps: [
        'Pendulum Scythe Trap: DC 13 Dex save or take 2d6 slashing damage.',
        'Slick Algae Flagstones: Moving faster than half speed requires DC 12 Acrobatics or fall prone.'
      ]
    },
    {
      id: 'node-2',
      locationNumber: 2,
      name: 'The Whispering Scriptatorium & Reliquary',
      readAloud: 'Rows of towering oak bookshelves groan under the weight of illuminated manuscripts. Stone gargoyles jut from the vaulted ceiling, their hollow mouths murmuring faint echoes with every gust of wind.',
      gmNotes: 'Alibi verification for Lady Beatrice. Contains the historical records of the Eclipse Pact. Trap: Glyphs of warding on the third archivist ledger (DC 14 Arcana to disarm, deals 3d8 cold damage).',
      clues: [
        { id: 'c2-1', name: 'Forged Tithe Registry', type: 'document', checkRequired: 'Investigation', dc: 13, revelation: 'Signatures for the last 6 months do not match Alistair\'s handwriting.', isFalseLead: false },
        { id: 'c2-2', name: 'Burned Parchment in Grate', type: 'physical', checkRequired: 'Perception', dc: 14, revelation: 'Fragment reveals correspondence between Father Raymond and an unknown warlock patron.', isFalseLead: false },
        { id: 'c2-3', name: 'Empty Poison Decanter', type: 'forensic', checkRequired: 'Medicine', dc: 15, revelation: 'Faint smell of elderflower, which masks the scent of concentrated nightshade.', isFalseLead: false },
        { id: 'c2-4', name: 'Heraldic Wax Stamp', type: 'physical', checkRequired: 'History', dc: 12, revelation: 'The crest belongs to the Vance family, but was reported stolen two years ago.', isFalseLead: true },
        { id: 'c2-5', name: 'Murmuring Gargoyle Spoke', type: 'arcane', checkRequired: 'Arcana', dc: 16, revelation: 'The enchanted gargoyle recorded the exact words spoken by the visitor at 11:15 PM.', isFalseLead: false }
      ],
      witnesses: [
        { name: 'Archivist Oswald', role: 'Head Librarian', soundsLike: 'David Attenborough (whispering, scholarly, contemplative)', statement: 'Lady Beatrice was indeed reading the land deeds in the south reading room until nearly midnight.', hiddenSecret: 'DC 13 Insight: Oswald was paid to forge the library guest log.' },
        { name: 'Sister Theresa', role: 'Illuminator', soundsLike: 'Natasha Lyonne (sharp, sarcastic, stressed)', statement: 'Someone rummaged through the ancestral drawer and spilled red ink everywhere.', hiddenSecret: 'DC 14 Insight: It was not ink; it was dried dragon blood.' },
        { name: 'Barnaby the Bound Scrivener', role: 'Copyist', soundsLike: 'Jack Sparrow (slurred, flamboyant, constantly distracted)', statement: 'I swear on my quill, I saw a winged shadow glide across the stained glass window!', hiddenSecret: 'DC 12 Insight: He was drunk on altar wine, but the shadow was genuine.' }
      ],
      hazardsOrTraps: [
        'Glyph of Warding: DC 14 Arcana to detect; explodes for 3d8 cold damage.',
        'Collapsing Bookcase: If shaken, DC 12 Dex save or pinned under books.'
      ]
    },
    {
      id: 'node-3',
      locationNumber: 3,
      name: 'Garrick\'s Iron Foundry & Armory',
      readAloud: 'Searing heat and the deafening rhythm of steam-hammers reverberate through the foundry floor. Sparks cascade over stacks of blackened chainmail and crates marked with smugglers’ runes.',
      gmNotes: 'Garrick\'s stronghold. Garrick is defensive and will attempt to bribe or intimidate the party. If combat breaks out, two foundry bruisers assist him.',
      clues: [
        { id: 'c3-1', name: 'Crate of Silvered Crossbolts', type: 'physical', checkRequired: 'Investigation', dc: 13, revelation: 'Identical to the bolts recovered from the cathedral outer gate.', isFalseLead: false },
        { id: 'c3-2', name: 'Garrick\'s Smuggling Ledger', type: 'document', checkRequired: 'Investigation', dc: 14, revelation: 'Shows payments received from someone signed as "R" for quiet deliveries.', isFalseLead: false },
        { id: 'c3-3', name: 'Black Velvet Glove', type: 'physical', checkRequired: 'Perception', dc: 15, revelation: 'Found in the coal bin; planted to incriminate Lady Beatrice.', isFalseLead: true },
        { id: 'c3-4', name: 'Bloodied Apron in Locker', type: 'forensic', checkRequired: 'Medicine', dc: 12, revelation: 'Blood on the apron is animal pig blood from lunch, not human.', isFalseLead: false },
        { id: 'c3-5', name: 'Hidden Tunnel under Crucible', type: 'physical', checkRequired: 'Perception', dc: 16, revelation: 'Direct secret passage leading into Location 5 (The Drained Aqueduct).', isFalseLead: false }
      ],
      witnesses: [
        { name: 'Garrick the Quartermaster', role: 'Foundry Boss', soundsLike: 'Sean Connery (gravelly, assertive, Scottish brogue)', statement: 'I make bolts for the watch. Who shoots them isn’t my business. Now get out before my hammer slips.', hiddenSecret: 'DC 14 Insight: He knows who commissioned the bolts and will confess if threatened with treason.' },
        { name: 'Brant the Bellows-Pumper', role: 'Apprentice', soundsLike: 'Michael Caine (weary, working-class Cockney)', statement: 'The boss had a private visitor late last night. Dressed like a priest, smelled like rot.', hiddenSecret: 'DC 12 Insight: Brant saw the visitor drop a silver rosary into the coal bin.' },
        { name: 'Kip the Metal-Caster', role: 'Foundry Hand', soundsLike: 'Jack Sparrow (evasive, twitchy, sarcastic)', statement: 'I saw nothing, mate! Not a thing except molten iron and good honest sweat!', hiddenSecret: 'DC 13 Insight: Kip was ordered to melt down the murder weapon.' }
      ],
      hazardsOrTraps: [
        'Molten Iron Vat: Knocking a creature into the sluice deals 4d10 fire damage.',
        'Steam Vent: Bursting steam pipe imposes blindness for 1 round on DC 13 Dex fail.'
      ]
    },
    {
      id: 'node-4',
      locationNumber: 4,
      name: 'Lady Beatrice’s Manor & Conservatory',
      readAloud: 'High arched glass panes overlook manicured rose hedges cloaked in dense night fog. Inside, velvet settees and marble busts create an aura of aristocratic elegance, punctuated by the ticking of a grandfather clock.',
      gmNotes: 'Social interrogation setpiece. Lady Beatrice will attempt to charm and mislead the party. Insight checks reveal she is terrified of something hunting her.',
      clues: [
        { id: 'c4-1', name: 'Intercepted Letter from Mayor', type: 'document', checkRequired: 'Investigation', dc: 14, revelation: 'The Mayor warned Beatrice that Father Raymond was losing his mind to dark magic.', isFalseLead: false },
        { id: 'c4-2', name: 'Mud on Carriage Wheel Spokes', type: 'forensic', checkRequired: 'Survival', dc: 13, revelation: 'Soil sample matches the cemetery marshes, not the cathedral grounds.', isFalseLead: false },
        { id: 'c4-3', name: 'Stolen Vial of Nightshade', type: 'physical', checkRequired: 'Perception', dc: 15, revelation: 'An empty vial labeled Brother Kael found in her desk drawer; she claims it was planted.', isFalseLead: true },
        { id: 'c4-4', name: 'Financial Deed of Transfer', type: 'document', checkRequired: 'Insight or History', dc: 12, revelation: 'Shows she was actually bailing out Alistair’s debts, not profiting from his demise.', isFalseLead: false },
        { id: 'c4-5', name: 'Concealed Safe behind Painting', type: 'physical', checkRequired: 'Investigation', dc: 16, revelation: 'Contains the original unbroken seal of Karstkeep from 412.', isFalseLead: false }
      ],
      witnesses: [
        { name: 'Lady Beatrice Vance', role: 'Council Aristocrat', soundsLike: 'Cate Blanchett (regal, icy, dangerously articulate)', statement: 'Do you truly believe I would ruin my gowns in a foul crypt? Look to the holy men who preach poverty while hoarding relics.', hiddenSecret: 'DC 15 Insight: She knows Father Raymond made a demonic pact and is terrified he will target her next.' },
        { name: 'Higgins the Butler', role: 'Head of House', soundsLike: 'Anthony Hopkins (calm, chillingly polite, impeccably formal)', statement: 'Her Ladyship did not depart the premises after ten o\'clock. I served her lavender tea myself.', hiddenSecret: 'DC 13 Insight: Higgins was ordered to burn a bloodstained cloak.' },
        { name: 'Fiona the Parlor Maid', role: 'Chambermaid', soundsLike: 'Natasha Lyonne (sharp-tongued, nervous, candid)', statement: 'She’s been having nightmares every full moon. Shouting about an archon with bleeding eyes.', hiddenSecret: 'DC 12 Insight: Fiona overheard Father Raymond threatening Beatrice two weeks ago.' }
      ],
      hazardsOrTraps: [
        'Guard Mastiffs: Two trained war mastiffs patrol the courtyard.',
        'Poison Needle Lock: DC 14 Dex save on the desk safe or take 2d6 poison.'
      ]
    },
    {
      id: 'node-5',
      locationNumber: 5,
      name: 'The Drained Aqueduct & Sluice',
      readAloud: 'Stagnant black water drips from crumbling brick arches into a subterranean drainage basin. Bones of drowned animals protrude from the thick silt, and the air is thick with the stench of decomposing river algae.',
      gmNotes: 'Forensic hotspot and tactical combat zone. 4 Drowned Lurkers hide beneath the black water, waiting to ambush investigators.',
      clues: [
        { id: 'c5-1', name: 'Discarded Bone-Carved Wand', type: 'arcane', checkRequired: 'Arcana', dc: 13, revelation: 'Radiates necromantic resonance; matches the wand Father Raymond kept on his mantle.', isFalseLead: false },
        { id: 'c5-2', name: 'Drag Marks in Mud Silt', type: 'physical', checkRequired: 'Survival', dc: 14, revelation: 'Heavy chest dragged from the cathedral catacombs down to the river landing.', isFalseLead: false },
        { id: 'c5-3', name: 'Gold Signet with Guild Mark', type: 'physical', checkRequired: 'Investigation', dc: 15, revelation: 'Bears the blacksmith guild mark; Garrick dropped it while running.', isFalseLead: true },
        { id: 'c5-4', name: 'Venom Reservoir Barrel', type: 'forensic', checkRequired: 'Medicine', dc: 12, revelation: 'Poured into the city water supply to create panic and mask the crypt heist.', isFalseLead: false },
        { id: 'c5-5', name: 'Secret Overflow Sluice Gate', type: 'physical', checkRequired: 'Perception', dc: 16, revelation: 'Leads directly into the crypt altar chamber for the surprise climax.', isFalseLead: false }
      ],
      witnesses: [
        { name: 'Brother Kael the Herbalist', role: 'Swamp Forager', soundsLike: 'Gollum (raspy, frantic, desperate for truth)', statement: 'I came to collect the marsh-reeds, yes! But the water was weeping black blood! I saw the shadow with the robes!', hiddenSecret: 'DC 13 Insight: Kael was forced by Raymond to synthesize the initial sleep draught.' },
        { name: 'Snaggle-Tooth Ned', role: 'Smuggler Lookout', soundsLike: 'Jack Sparrow (drunken swagger, cheerful deceit)', statement: 'Nothing came through these pipes except rat-fish and rain, mate! Scout\'s honor!', hiddenSecret: 'DC 12 Insight: Ned helped load the looted reliquary crates onto a skiff.' },
        { name: 'Warden Thorne', role: 'Aqueduct Guard', soundsLike: 'Morgan Freeman (weary, stoic, resigned)', statement: 'The sluice gates were opened from the control chamber above. Only a priest with the brass key had access.', hiddenSecret: 'DC 14 Insight: Thorne saw Raymond open the gates and was too terrified of the curses to intervene.' }
      ],
      hazardsOrTraps: [
        'Submerged Grate Chasm: DC 13 Dex save or sucked into overflow pipe (1d8 bludgeoning + drowning risk).',
        'Rot Gas Pocket: DC 12 Con save or poisoned for 1 hour.'
      ]
    }
  ]
};

