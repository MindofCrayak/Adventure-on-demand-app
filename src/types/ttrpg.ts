export type SupportedRuleset =
  | 'dnd-5.5e'
  | 'pf2e'
  | 'fate'
  | 'kids-on-bikes'
  | 'vampire-v5'
  | 'cofd'
  | 'tales-from-the-loop'
  | 'fallout-2d20';

export type AdventureStructure =
  | 'procedural-mystery'
  | 'heist-infiltration'
  | 'dungeon-delve'
  | 'survival-hex'
  | 'siege-defense';

export interface UVTTLight {
  position: { x: number; y: number };
  range: number;
  color: string;
  intensity: number;
}

export interface UVTTPortal {
  position: { x: number; y: number };
  bounds: [{ x: number; y: number }, { x: number; y: number }];
  closed: boolean;
  freemove: boolean;
}

export interface UVTTData {
  format: number;
  resolution: { map_size: { x: number; y: number }; pixels_per_grid: number };
  line_of_sight: Array<Array<{ x: number; y: number }>>;
  portals: UVTTPortal[];
  lights: UVTTLight[];
}

export interface MapLayerConfig {
  terrain: boolean;
  walls: boolean;
  scatter: boolean;
  lighting: boolean;
  roof: boolean;
  weather: boolean;
  dynamicLighting: boolean;
  filterMode: 'day' | 'night' | 'sepia' | 'cyber';
}

export interface AdventureSeed {
  title: string;
  pitch: string;
  system: SupportedRuleset;
  structure: AdventureStructure;
  durationHours: number;
  partyLevel: number;
  partySize: number;
  rating: 'teen' | 'mature';
  eventSeed?: string;
  victimSeed?: string;
  suspectSeed?: string;
  locationsSeed?: string;
}

export interface MasterDossier {
  event: { title: string; summary: string };
  victim: { name: string; role: string; connection: string };
  perpetrator: { alias: string; secretMotive: string; revealedAtLocation: number };
  suspects: Array<{
    name: string;
    alias: string;
    motive: string;
    alibi: string;
    apparentGuilt: string;
  }>;
  routing: Array<{
    step: number;
    locationNumber: number;
    name: string;
    goal: string;
  }>;
}

export interface SceneClue {
  id: string;
  name: string;
  type: 'physical' | 'forensic' | 'document' | 'arcane';
  checkRequired: string;
  dc: number | string;
  revelation: string;
  isFalseLead: boolean;
}

export interface SceneWitness {
  name: string;
  role: string;
  soundsLike: string;
  statement: string;
  hiddenSecret: string;
}

export interface SceneNode {
  id: string;
  locationNumber: number;
  name: string;
  readAloud: string;
  gmNotes: string;
  clues: SceneClue[];
  witnesses: SceneWitness[];
  hazardsOrTraps: string[];
}

export interface CampaignState {
  seed: AdventureSeed;
  dossier: MasterDossier;
  nodes: SceneNode[];
  activeNodeId?: string;
}

export interface RoomData {
  id: string;
  number: number;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
  features: string[];
  monsters?: string;
  treasure?: string;
}

export interface AdventureMap {
  id: string;
  name: string;
  environment: 'dungeon' | 'cave' | 'castle' | 'temple' | 'crypt' | 'wilderness' | 'tavern';
  width: number;
  height: number;
  ambientLighting: string;
  hazards: string;
  tacticalNotes: string;
  description: string;
  rooms: RoomData[];
  sketchImage?: string;
  gridVisible?: boolean;
}

export interface StatBlock {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  ac: number;
  hp: number;
  maxHp: number;
  speed: string;
  cr?: string;
  pb?: number;
  passivePerception?: number;
  saves?: string;
  skills?: string;
}

export interface CombatAbility {
  name: string;
  type: 'action' | 'bonus' | 'reaction' | 'legendary' | 'trait';
  description: string;
}

export interface TokenStyling {
  borderColor: string;
  borderStyle: 'ornate' | 'minimal' | 'runic' | 'spikes' | 'double';
  ringThickness?: number;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  tint?: string;
  badgeText?: string;
  ringColor?: string;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  race: string;
  classOrRole: string;
  tier: 'side' | 'main';
  promotedFromSide?: boolean;
  promotionLore?: string;
  avatarUrl?: string;
  sketchImage?: string;
  stats: StatBlock;
  combatAbilities: CombatAbility[];
  flavor: {
    appearance: string;
    voiceMannerism: string;
    flawOrQuirk: string;
    secretMotivation: string;
    plotHook: string;
    relationshipToParty: string;
  };
  tokenStyling?: TokenStyling;
  notes?: string;
}

export interface MagicItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'ring' | 'wand' | 'wondrous' | 'potion' | 'relic';
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';
  attunement: boolean;
  description: string;
  mechanicalEffects: string[];
  lore: string;
  quirkOrCurse?: string;
  sketchImage?: string;
}

export interface Handout {
  id: string;
  sessionNumber?: number;
  title: string;
  type: 'parchment-letter' | 'torn-journal' | 'bounty-poster' | 'ancient-decree' | 'cryptic-map';
  visualTheme: 'aged-parchment' | 'bloodstained' | 'wax-sealed' | 'charred-edges';
  author: string;
  recipient: string;
  textContent: string;
}

export interface Secret {
  id: string;
  sessionNumber?: number;
  title: string;
  secretLevel: 'Minor Rumor' | 'Hidden Truth' | 'Campaign Twist' | 'Dark Betrayal';
  description: string;
  discoveryMethod: string;
  revelationImpact: string;
}

export interface SessionTimelineBeat {
  timestamp: string;
  phase: 'hook' | 'exploration' | 'combat' | 'roleplay' | 'climax';
  title: string;
  description: string;
}

export interface SessionEncounter {
  name: string;
  type: 'combat' | 'puzzle' | 'social' | 'trap';
  difficulty: string;
  summary: string;
}

export interface SessionOutline {
  sessionNumber: number;
  title: string;
  duration: string;
  pacingSummary?: string;
  timeline: SessionTimelineBeat[];
  encounters: SessionEncounter[];
  keyObjectives: string[];
  loot?: string;
  mapIds?: string[];
  handoutIds?: string[];
  secretIds?: string[];
}

export interface Campaign {
  id: string;
  title: string;
  synopsis: string;
  tone: string;
  setting: string;
  partyLevel: number;
  partySize: number;
  sessionCount: number;
  sessionLengthHours: number;
  sessions: SessionOutline[];
  maps: AdventureMap[];
  npcs: NPC[];
  items: MagicItem[];
  handouts: Handout[];
  secrets: Secret[];
  dossier?: MasterDossier;
  nodes?: SceneNode[];
}
