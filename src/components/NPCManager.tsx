import React, { useState } from 'react';
import { NPC, StatBlock, CombatAbility } from '../types/ttrpg';
import { generateCharacterAvatar } from '../utils/avatarGenerator';
import { downloadSingleFile } from '../utils/exportBundle';
import {
  Users,
  Shield,
  Heart,
  Zap,
  Sword,
  Sparkles,
  ArrowUpCircle,
  Eye,
  Plus,
  Compass,
  FileDown,
  ChevronRight,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface NPCManagerProps {
  npcs: NPC[];
  onAddNPC: (npc: NPC) => void;
  onUpdateNPC: (npc: NPC) => void;
  onSendToTokenStudio: (npc: NPC) => void;
  campaignContext?: string;
}

export const NPCManager: React.FC<NPCManagerProps> = ({
  npcs,
  onAddNPC,
  onUpdateNPC,
  onSendToTokenStudio,
  campaignContext = '',
}) => {
  const [selectedNpcId, setSelectedNpcId] = useState<string>(npcs[0]?.id || '');
  const [filterTier, setFilterTier] = useState<'all' | 'main' | 'side'>('all');

  // Promotion modal
  const [promotingNpc, setPromotingNpc] = useState<NPC | null>(null);
  const [targetCR, setTargetCR] = useState('5');
  const [isPromoting, setIsPromoting] = useState(false);

  // New NPC modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTier, setNewTier] = useState<'side' | 'main'>('side');
  const [newArchetype, setNewArchetype] = useState('Grizzled Informant');
  const [newTone, setNewTone] = useState('Dark Fantasy');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedNpc = npcs.find((n) => n.id === selectedNpcId) || npcs[0];

  const filteredNPCs = npcs.filter((n) => {
    if (filterTier === 'all') return true;
    return n.tier === filterTier;
  });

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Promote Side NPC to Main NPC
  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingNpc) return;

    setIsPromoting(true);
    try {
      const response = await fetch('/api/npc/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          npc: promotingNpc,
          campaignContext,
          targetCR,
        }),
      });

      const result = await response.json();
      const upgradedData = result.data || result.fallback;

      const upgradedNPC: NPC = {
        ...promotingNpc,
        ...upgradedData,
        tier: 'main',
        promotedFromSide: true,
      };

      onUpdateNPC(upgradedNPC);
      setSelectedNpcId(upgradedNPC.id);
      setPromotingNpc(null);
    } catch (err) {
      console.error('Failed to promote NPC:', err);
    } finally {
      setIsPromoting(false);
    }
  };

  // Generate a brand new NPC
  const handleCreateNPC = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/npc/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: newTier,
          roleOrArchetype: newArchetype,
          tone: newTone,
          context: campaignContext,
        }),
      });

      const result = await response.json();
      const generated = result.data || result.fallback;

      const newNPC: NPC = {
        id: `npc-${Date.now()}`,
        name: generated.name || 'Wandering Soul',
        title: generated.title || 'Unknown Entity',
        race: generated.race || 'Human',
        classOrRole: generated.classOrRole || newArchetype,
        tier: newTier,
        stats: generated.stats || {
          str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
          ac: 10, hp: 20, maxHp: 20, speed: '30 ft.',
        },
        combatAbilities: generated.combatAbilities || [],
        flavor: generated.flavor || {
          appearance: 'A distinct character.',
          voiceMannerism: 'Standard.',
          flawOrQuirk: 'Peculiar habit.',
          secretMotivation: 'Private goals.',
          plotHook: 'Can be spoken with.',
          relationshipToParty: 'Neutral.',
        },
        tokenStyling: generated.tokenStyling,
      };

      onAddNPC(newNPC);
      setSelectedNpcId(newNPC.id);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to generate NPC:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportStatblock = (n: NPC) => {
    const text = `# ${n.name}
*${n.race} ${n.classOrRole} (${n.title})*
**Tier:** ${n.tier.toUpperCase()}${n.promotedFromSide ? ' (PROMOTED AWAKENED NPC)' : ''}

**AC:** ${n.stats.ac} | **HP:** ${n.stats.hp} | **Speed:** ${n.stats.speed} | **CR:** ${n.stats.cr || 'N/A'}
STR: ${n.stats.str} (${getModifier(n.stats.str)}) | DEX: ${n.stats.dex} (${getModifier(n.stats.dex)}) | CON: ${n.stats.con} (${getModifier(n.stats.con)})
INT: ${n.stats.int} (${getModifier(n.stats.int)}) | WIS: ${n.stats.wis} (${getModifier(n.stats.wis)}) | CHA: ${n.stats.cha} (${getModifier(n.stats.cha)})

## Roleplay Notes
- **Appearance:** ${n.flavor.appearance}
- **Voice/Mannerism:** ${n.flavor.voiceMannerism}
- **Quirk/Flaw:** ${n.flavor.flawOrQuirk}
- **Secret Motivation:** ${n.flavor.secretMotivation}
- **Plot Hook:** ${n.flavor.plotHook}

## Combat Actions & Traits
${n.combatAbilities.map((a) => `- **${a.name} [${a.type}]:** ${a.description}`).join('\n')}
`;
    downloadSingleFile(text, `${n.name.toLowerCase().replace(/\s+/g, '_')}_statblock.md`);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-100">
                Dramatis Personae & Statblock Workshop
              </h2>
              <p className="text-xs text-stone-400">
                Generate memorable side characters or lethal bosses. Need stats fast because players latched onto a random peasant? Promote them to a Main Boss in 1 click!
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setFilterTier('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterTier === 'all' ? 'bg-stone-800 text-stone-100 font-bold' : 'text-stone-400'
              }`}
            >
              All ({npcs.length})
            </button>
            <button
              onClick={() => setFilterTier('main')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterTier === 'main' ? 'bg-red-900/60 text-red-200 font-bold' : 'text-stone-400'
              }`}
            >
              Main ({npcs.filter((n) => n.tier === 'main').length})
            </button>
            <button
              onClick={() => setFilterTier('side')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterTier === 'side' ? 'bg-amber-900/60 text-amber-200 font-bold' : 'text-stone-400'
              }`}
            >
              Side ({npcs.filter((n) => n.tier === 'side').length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-100 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New NPC</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: NPC Roster List */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
          {filteredNPCs.map((npc) => {
            const isSelected = selectedNpc?.id === npc.id;
            const avatarSrc = npc.avatarUrl || npc.sketchImage || generateCharacterAvatar(npc.name, npc.race, npc.classOrRole, npc.tier);

            return (
              <div
                key={npc.id}
                onClick={() => setSelectedNpcId(npc.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  isSelected
                    ? 'bg-stone-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-950/60 border-stone-850 hover:bg-stone-850'
                }`}
              >
                <img
                  src={avatarSrc}
                  alt={npc.name}
                  className="w-11 h-11 rounded-full object-cover border-2 shrink-0"
                  style={{
                    borderColor: npc.tier === 'main' ? '#ef4444' : '#eab308',
                  }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-stone-100 truncate">
                      {npc.name}
                    </h4>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        npc.tier === 'main'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {npc.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">
                    {npc.race} • {npc.classOrRole}
                  </p>
                  {npc.stats.cr && (
                    <span className="text-[10px] text-amber-400/80 font-mono">
                      CR {npc.stats.cr}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Detailed Statblock & Promotion Card */}
        <div className="lg:col-span-8">
          {selectedNpc ? (
            <div className="bg-stone-950 rounded-xl border border-stone-800 p-5 space-y-5">
              {/* Top Banner: Name, Title, Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={
                      selectedNpc.avatarUrl ||
                      selectedNpc.sketchImage ||
                      generateCharacterAvatar(
                        selectedNpc.name,
                        selectedNpc.race,
                        selectedNpc.classOrRole,
                        selectedNpc.tier
                      )
                    }
                    alt={selectedNpc.name}
                    className="w-16 h-16 rounded-full object-cover border-2 shadow-lg"
                    style={{
                      borderColor: selectedNpc.tier === 'main' ? '#ef4444' : '#eab308',
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-xl text-stone-100">
                        {selectedNpc.name}
                      </h3>
                      {selectedNpc.promotedFromSide && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-amber-600 text-stone-950 font-bold text-[10px] rounded-full uppercase tracking-wider font-mono">
                          Promoted Boss
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400/90 font-serif italic">
                      {selectedNpc.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {selectedNpc.race} {selectedNpc.classOrRole}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedNpc.tier === 'side' && (
                    <button
                      onClick={() => setPromotingNpc(selectedNpc)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-stone-100 font-bold text-xs rounded-lg transition-all shadow flex items-center gap-1.5"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>Promote to Main NPC</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSendToTokenStudio(selectedNpc)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Make VTT Token
                  </button>

                  <button
                    onClick={() => handleExportStatblock(selectedNpc)}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 rounded-lg text-xs"
                    title="Export Statblock Markdown"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Promotion True Lore if applicable */}
              {selectedNpc.promotionLore && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-200">
                  <span className="font-bold uppercase tracking-wider font-mono text-red-400 block mb-1">
                    Awakened Secret History:
                  </span>
                  {selectedNpc.promotionLore}
                </div>
              )}

              {/* D&D / TTRPG Core Vital Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-center">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">
                    Armor Class
                  </span>
                  <span className="text-base font-bold text-stone-100 font-mono">
                    {selectedNpc.stats.ac}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">
                    Hit Points
                  </span>
                  <span className="text-base font-bold text-rose-400 font-mono">
                    {selectedNpc.stats.hp} / {selectedNpc.stats.maxHp}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">
                    Speed
                  </span>
                  <span className="text-base font-bold text-stone-100 font-mono">
                    {selectedNpc.stats.speed}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase block">
                    Challenge Rating
                  </span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {selectedNpc.stats.cr ? `CR ${selectedNpc.stats.cr}` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* 6 Ability Scores Bar */}
              <div className="grid grid-cols-6 gap-2 bg-stone-900/40 p-2.5 rounded-xl border border-stone-800/80 text-center">
                {[
                  { label: 'STR', val: selectedNpc.stats.str },
                  { label: 'DEX', val: selectedNpc.stats.dex },
                  { label: 'CON', val: selectedNpc.stats.con },
                  { label: 'INT', val: selectedNpc.stats.int },
                  { label: 'WIS', val: selectedNpc.stats.wis },
                  { label: 'CHA', val: selectedNpc.stats.cha },
                ].map((ab) => (
                  <div key={ab.label} className="p-1.5 rounded-lg bg-stone-950/70 border border-stone-850">
                    <span className="text-[10px] font-mono text-stone-400 block font-bold">
                      {ab.label}
                    </span>
                    <div className="text-sm font-bold text-stone-100 font-mono">
                      {ab.val}
                    </div>
                    <span className="text-[11px] font-mono text-amber-400">
                      {getModifier(ab.val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Combat Traits & Actions */}
              {selectedNpc.combatAbilities && selectedNpc.combatAbilities.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-red-400" />
                    Combat Abilities & Actions
                  </span>
                  <div className="space-y-2">
                    {selectedNpc.combatAbilities.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-200">
                            {act.name}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-stone-800 text-stone-400">
                            {act.type}
                          </span>
                        </div>
                        <p className="text-stone-300 leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roleplay Flavor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-900/60 p-4 rounded-xl border border-stone-800">
                <div>
                  <span className="text-stone-400 font-mono text-[10px] uppercase block mb-0.5">
                    Appearance:
                  </span>
                  <p className="text-stone-300">{selectedNpc.flavor.appearance}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-mono text-[10px] uppercase block mb-0.5">
                    Voice & Mannerism:
                  </span>
                  <p className="text-stone-300">{selectedNpc.flavor.voiceMannerism}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-mono text-[10px] uppercase block mb-0.5">
                    Memorable Quirk / Flaw:
                  </span>
                  <p className="text-amber-200">{selectedNpc.flavor.flawOrQuirk}</p>
                </div>
                <div>
                  <span className="text-stone-400 font-mono text-[10px] uppercase block mb-0.5">
                    Secret Motivation:
                  </span>
                  <p className="text-purple-300">{selectedNpc.flavor.secretMotivation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-500">No NPC selected</div>
          )}
        </div>
      </div>

      {/* Promotion Modal */}
      {promotingNpc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-red-700/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold font-serif text-stone-100">
                  Promote "{promotingNpc.name}" to Main Boss / Ally
                </h3>
              </div>
              <button
                onClick={() => setPromotingNpc(null)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Did your party suddenly attack, hire, or latch onto this minor side character?
              Gemini will immediately awaken their secret identity, giving them lethal combat stats, multiattacks, legendary tactics, and plot revelations!
            </p>

            <form onSubmit={handlePromote} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Target Challenge Rating (CR)
                </label>
                <select
                  value={targetCR}
                  onChange={(e) => setTargetCR(e.target.value)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-red-500"
                >
                  <option value="3">CR 3 (Dangerous Lieutenant / Tier 1 Boss)</option>
                  <option value="5">CR 5 (Formidable Adversary / Arc Climax)</option>
                  <option value="8">CR 8 (Deadly Mastermind / High Danger)</option>
                  <option value="12">CR 12 (Mythic Overlord)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setPromotingNpc(null)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoting}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-100 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                >
                  {isPromoting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-100 border-t-transparent rounded-full animate-spin" />
                      <span>Awakening Secret Powers & Stats...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Awaken to Main NPC</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create NPC Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-serif text-stone-100">
                  Generate NPC
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNPC} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  NPC Depth / Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTier('side')}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                      newTier === 'side'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span>Side NPC</span>
                    <span className="block text-[10px] text-stone-500 font-normal mt-0.5">
                      Vivid flavor, quirks & quick stats
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTier('main')}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                      newTier === 'main'
                        ? 'bg-red-500/20 border-red-500 text-red-200 font-bold'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <span>Main NPC</span>
                    <span className="block text-[10px] text-stone-500 font-normal mt-0.5">
                      Full CR statblock, actions & tactics
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Role / Archetype
                </label>
                <input
                  type="text"
                  value={newArchetype}
                  onChange={(e) => setNewArchetype(e.target.value)}
                  placeholder="e.g. Blind Cartographer, Corrupt Captain, Arcane Smuggler"
                  required
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Tone
                </label>
                <select
                  value={newTone}
                  onChange={(e) => setNewTone(e.target.value)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Dark Fantasy">Dark Fantasy</option>
                  <option value="High Fantasy">High Fantasy</option>
                  <option value="Gothic Horror">Gothic Horror</option>
                  <option value="Grimy Underworld">Grimy Underworld</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-stone-100 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-100 border-t-transparent rounded-full animate-spin" />
                      <span>Generating NPC...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Forge NPC</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
