import React, { useState } from 'react';
import { initialCampaign } from './data/sampleCampaign';
import { 
  Campaign, 
  AdventureMap, 
  NPC, 
  MagicItem, 
  TokenStyling, 
  SupportedRuleset, 
  AdventureSeed, 
  MasterDossier, 
  SceneNode 
} from './types/ttrpg';
import { NavigationHeader, MainNavTab } from './components/NavigationHeader';
import { DualIntakeLanding } from './components/DualIntakeLanding';
import { MasterDossierView } from './components/MasterDossierView';
import { SceneNodeView } from './components/SceneNodeView';
import { CampaignOutliner } from './components/CampaignOutliner';
import { SketchPad } from './components/SketchPad';
import { BattlemapViewer } from './components/BattlemapViewer';
import { NPCManager } from './components/NPCManager';
import { VTTTokenStudio } from './components/VTTTokenStudio';
import { DownloadHub } from './components/DownloadHub';
import { BottomConsultationDock } from './components/BottomConsultationDock';
import {
  Scroll,
  Sparkles,
  Check,
  X,
  Sliders,
  FolderOpen,
  Plus,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function App() {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);
  const [activeTab, setActiveTab] = useState<MainNavTab>('dossier');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showIntake, setShowIntake] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string>(campaign.maps[0]?.id || '');
  const [tokenTargetNpcId, setTokenTargetNpcId] = useState<string>(campaign.npcs[0]?.id || '');
  const [activeLocationNum, setActiveLocationNum] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  // System & ruleset state
  const [ruleset, setRuleset] = useState<SupportedRuleset>('dnd-5.5e');
  const [rating, setRating] = useState<'teen' | 'mature'>('teen');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Suggestion chips for bottom dock
  const suggestionChips = [
    'Add secret tunnel to Location 3',
    'Plant a false lead pointing to Suspect 2',
    'Promote Garrick to a CR 6 Boss',
    'Generate Roll20 dynamic lighting map',
    'Switch ruleset to Pathfinder 2e'
  ];

  // Initialize new adventure from Dual Intake
  const handleInitializeAdventure = async (seed: AdventureSeed) => {
    setIsProcessing(true);
    setRuleset(seed.system);
    setRating(seed.rating);

    try {
      const response = await fetch('/api/adventure/dossier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });

      const result = await response.json();
      const dossier: MasterDossier = result.data;

      // Also generate initial 5 scene nodes
      const nodes: SceneNode[] = [];
      for (const route of dossier.routing) {
        try {
          const nodeRes = await fetch('/api/adventure/node', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nodeNumber: route.locationNumber,
              nodeName: route.name,
              system: seed.system,
              rating: seed.rating,
              dossierContext: dossier,
            }),
          });
          const nodeData = await nodeRes.json();
          nodes.push({
            id: `node-${route.locationNumber}`,
            locationNumber: route.locationNumber,
            name: route.name,
            ...nodeData.data,
          });
        } catch {
          // fallback node is handled server-side
        }
      }

      const newCampaign: Campaign = {
        ...campaign,
        id: `camp-${Date.now()}`,
        title: seed.title || 'Adventure on Demand',
        synopsis: dossier.event.summary,
        tone: seed.rating === 'mature' ? 'Grimdark Carnage' : 'Heroic Mystery',
        sessionCount: 3,
        sessionLengthHours: seed.durationHours,
        partyLevel: seed.partyLevel,
        partySize: seed.partySize,
        dossier,
        nodes: nodes.length > 0 ? nodes : campaign.nodes,
      };

      setCampaign(newCampaign);
      setShowIntake(false);
      setActiveTab('dossier');
      showToast(`Master Dossier & 5-Location Blueprint compiled for ${seed.system.toUpperCase()}!`);
    } catch (err: any) {
      console.error('Error generating adventure:', err);
      showToast('Adventure initialized with local offline blueprint');
    } finally {
      setIsProcessing(false);
    }
  };

  // Co-Pilot Chat / Direct Instruction from bottom dock
  const handleDockMessage = async (msg: string) => {
    showToast(`Co-Pilot updated: "${msg}"`);
    // If user asks to promote an NPC or add clue, we can navigate or execute
    const lower = msg.toLowerCase();
    if (lower.includes('map')) {
      setActiveTab('maps');
    } else if (lower.includes('token')) {
      setActiveTab('tokens');
    } else if (lower.includes('boss') || lower.includes('npc')) {
      setActiveTab('npcs');
    } else if (lower.includes('node') || lower.includes('location')) {
      setActiveTab('nodes');
    } else if (lower.includes('export')) {
      setActiveTab('export');
    }
  };

  // Handlers for newly forged assets
  const handleMapGenerated = (newMap: AdventureMap) => {
    setCampaign((prev) => ({
      ...prev,
      maps: [newMap, ...prev.maps],
    }));
    setSelectedMapId(newMap.id);
    setActiveTab('maps');
    showToast(`Tactical Map "${newMap.name}" forged & added to campaign!`);
  };

  const handleNPCGenerated = (newNpc: NPC) => {
    setCampaign((prev) => ({
      ...prev,
      npcs: [newNpc, ...prev.npcs],
    }));
    setTokenTargetNpcId(newNpc.id);
    showToast(`NPC "${newNpc.name}" created!`);
  };

  const handleItemGenerated = (newItem: MagicItem) => {
    setCampaign((prev) => ({
      ...prev,
      items: [newItem, ...prev.items],
    }));
    showToast(`Magic Item "${newItem.name}" added to campaign!`);
  };

  const handleUpdateNPCTokenStyling = (npcId: string, styling: TokenStyling) => {
    setCampaign((prev) => ({
      ...prev,
      npcs: prev.npcs.map((n) => (n.id === npcId ? { ...n, tokenStyling: styling } : n)),
    }));
    showToast('Token styling saved to campaign character!');
  };

  const handleSendToTokenStudio = (npc: NPC) => {
    if (!campaign.npcs.some((n) => n.id === npc.id)) {
      setCampaign((prev) => ({ ...prev, npcs: [npc, ...prev.npcs] }));
    }
    setTokenTargetNpcId(npc.id);
    setActiveTab('tokens');
  };

  const activeMap = campaign.maps.find((m) => m.id === selectedMapId) || campaign.maps[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      theme === 'dark' ? 'bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950' : 'bg-[#f4efe6] text-stone-900 selection:bg-amber-700 selection:text-white'
    }`}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-14 right-4 z-50 bg-stone-900 border border-amber-500/80 shadow-2xl rounded-xl px-4 py-3 text-xs text-amber-200 flex items-center gap-2 animate-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <NavigationHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDrawer={() => setShowDrawer(true)}
        onOpenProfile={() => setShowSettings(true)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        campaignTitle={campaign.title}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
        {/* If user clicked New Adventure Pitch */}
        {showIntake ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center max-w-4xl mx-auto">
              <span className="text-xs text-stone-400 font-mono">Conversational Intake (Turn 1)</span>
              <button
                onClick={() => setShowIntake(false)}
                className="text-xs text-stone-400 hover:text-stone-200 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Return to Active Module</span>
              </button>
            </div>
            <DualIntakeLanding
              onInitializeAdventure={handleInitializeAdventure}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          <>
            {/* Tab 1: Master Dossier */}
            {activeTab === 'dossier' && (
              <div className="space-y-4">
                {campaign.dossier ? (
                  <MasterDossierView
                    dossier={campaign.dossier}
                    system={ruleset}
                    rating={rating}
                    durationHours={campaign.sessionLengthHours}
                    onSelectNode={(locNum) => {
                      setActiveLocationNum(locNum);
                      setActiveTab('nodes');
                    }}
                    onSendSuspectToNPCWorkshop={(suspect) => {
                      const newNpc: NPC = {
                        id: `npc-${Date.now()}`,
                        name: suspect.name,
                        title: suspect.alias,
                        race: 'Human',
                        classOrRole: 'Suspect',
                        tier: 'main',
                        stats: {
                          str: 14, dex: 14, con: 14, int: 12, wis: 14, cha: 14,
                          ac: 14, hp: 45, maxHp: 45, speed: '30 ft.', cr: '3',
                        },
                        combatAbilities: [],
                        flavor: {
                          appearance: `Known as ${suspect.alias}.`,
                          voiceMannerism: 'Defensive, sharp alibi.',
                          flawOrQuirk: suspect.motive,
                          secretMotivation: 'Hiding involvement.',
                          plotHook: 'Can be interrogated.',
                          relationshipToParty: 'Wary.',
                        },
                      };
                      handleNPCGenerated(newNpc);
                      setActiveTab('npcs');
                    }}
                  />
                ) : (
                  <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <p className="text-xs text-stone-400">No Master Dossier compiled yet.</p>
                    <button
                      onClick={() => setShowIntake(true)}
                      className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
                    >
                      Start New Pitch Intake
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Scene Nodes (5) */}
            {activeTab === 'nodes' && (
              <div className="space-y-4">
                {campaign.nodes && campaign.nodes.length > 0 ? (
                  <SceneNodeView
                    nodes={campaign.nodes}
                    activeLocationNumber={activeLocationNum}
                    onSelectLocationNumber={setActiveLocationNum}
                    system={ruleset}
                    onJumpToTacticalMap={(locNum, locName) => {
                      setActiveTab('maps');
                      showToast(`Navigated to Tactical Map for Location ${locNum}: ${locName}`);
                    }}
                  />
                ) : (
                  <div className="p-8 text-center bg-stone-900 border border-stone-800 rounded-xl space-y-3">
                    <p className="text-xs text-stone-400">Scene nodes have not been generated yet.</p>
                    <button
                      onClick={() => setShowIntake(true)}
                      className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
                    >
                      Compile Adventure Blueprint
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Tactical Maps */}
            {activeTab === 'maps' && (
              <div className="space-y-4">
                {campaign.maps.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-stone-900/60 p-2 rounded-xl border border-stone-850">
                    <span className="text-xs font-mono text-stone-400 pl-2">Select Map:</span>
                    {campaign.maps.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMapId(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          selectedMapId === m.id
                            ? 'bg-amber-500 text-stone-950 font-bold shadow'
                            : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
                {activeMap ? (
                  <BattlemapViewer
                    map={activeMap}
                    onUpdateMap={(updated) => {
                      setCampaign((prev) => ({
                        ...prev,
                        maps: prev.maps.map((m) => (m.id === updated.id ? updated : m)),
                      }));
                    }}
                  />
                ) : (
                  <div className="p-8 text-center bg-stone-900 rounded-xl border border-stone-800 text-stone-400">
                    No tactical maps available. Use the Sketch Alchemy tab to transform a sketch into a map!
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: NPCs & Bosses */}
            {activeTab === 'npcs' && (
              <NPCManager
                npcs={campaign.npcs}
                onAddNPC={handleNPCGenerated}
                onUpdateNPC={(updated) => {
                  setCampaign((prev) => ({
                    ...prev,
                    npcs: prev.npcs.map((n) => (n.id === updated.id ? updated : n)),
                  }));
                  showToast(`Updated NPC "${updated.name}"!`);
                }}
                onSendToTokenStudio={handleSendToTokenStudio}
                campaignContext={campaign.synopsis}
              />
            )}

            {/* Tab 5: VTT Tokens */}
            {activeTab === 'tokens' && (
              <VTTTokenStudio
                npcs={campaign.npcs}
                selectedNpcId={tokenTargetNpcId}
                onUpdateNPCTokenStyling={handleUpdateNPCTokenStyling}
              />
            )}

            {/* Tab 6: Sketch Alchemy */}
            {activeTab === 'sketch' && (
              <SketchPad
                onMapGenerated={handleMapGenerated}
                onNPCGenerated={handleNPCGenerated}
                onItemGenerated={handleItemGenerated}
                onSendToTokenStudio={handleSendToTokenStudio}
                currentTone={campaign.tone}
              />
            )}

            {/* Tab 7: Clues & Handouts */}
            {activeTab === 'handouts' && (
              <CampaignOutliner
                campaign={campaign}
                onUpdateCampaign={(updated) => {
                  setCampaign(updated);
                  showToast('Campaign adventure arc updated!');
                }}
                onSelectMap={(map) => {
                  setSelectedMapId(map.id);
                  setActiveTab('maps');
                }}
              />
            )}

            {/* Tab 8: Export Binder */}
            {activeTab === 'export' && <DownloadHub campaign={campaign} />}
          </>
        )}
      </main>

      {/* Floating Bottom Consultation Dock */}
      <BottomConsultationDock
        suggestionChips={suggestionChips}
        onSelectChip={(chip) => handleDockMessage(chip)}
        onSubmitMessage={handleDockMessage}
        onUploadSketch={(file) => {
          setActiveTab('sketch');
          showToast(`File "${file.name}" ready in Sketch Alchemy!`);
        }}
        onOpenParameters={() => setShowSettings(true)}
        isGenerating={isProcessing}
      />

      {/* Saved Adventures Drawer Modal */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start animate-in fade-in">
          <div className="bg-stone-900 border-r border-stone-800 w-80 h-full p-5 space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-bold text-base text-stone-100">
                    Campaign Modules
                  </h3>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => {
                  setShowIntake(true);
                  setShowDrawer(false);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Adventure Pitch</span>
              </button>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                  Active Adventure Module
                </span>
                <div className="p-3 bg-stone-950 rounded-xl border border-amber-500/50 shadow">
                  <h4 className="font-bold text-xs text-amber-200 font-serif">
                    {campaign.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                    {campaign.synopsis}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                    <span>{ruleset.toUpperCase()}</span>
                    <span>•</span>
                    <span>{campaign.sessionLengthHours}h session</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 font-mono border-t border-stone-800 pt-3">
              Adventure on Demand • Modular Artifact Engine
            </div>
          </div>
        </div>
      )}

      {/* Model & Ruleset Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold font-serif text-stone-100">
                  Game System & Calibration
                </h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Active Ruleset Calibration
                </label>
                <select
                  value={ruleset}
                  onChange={(e) => {
                    setRuleset(e.target.value as SupportedRuleset);
                    showToast(`Ruleset updated to ${e.target.value.toUpperCase()}`);
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="dnd-5.5e">D&D 5.5e (2024 Revision Baseline)</option>
                  <option value="pf2e">Pathfinder 2e (3-Action Notation)</option>
                  <option value="fate">FATE Core / Condensed (Aspects & Stunts)</option>
                  <option value="kids-on-bikes">Kids on Bikes (Stat Dice)</option>
                  <option value="vampire-v5">Vampire: The Masquerade V5 (Hunger & Disciplines)</option>
                  <option value="cofd">Chronicles of Darkness</option>
                  <option value="tales-from-the-loop">Tales from the Loop</option>
                  <option value="fallout-2d20">Fallout 2d20 (S.P.E.C.I.A.L.)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Content Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="teen">Teen (14+) - Balanced Fantasy</option>
                  <option value="mature">Mature - Carnage, Horror & Gritty Violence</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
