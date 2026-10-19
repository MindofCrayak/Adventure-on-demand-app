import React, { useState } from 'react';
import {
  Campaign,
  SessionOutline,
  Handout,
  Secret,
  AdventureMap
} from '../types/ttrpg';
import {
  BookOpen,
  Clock,
  Calendar,
  Sparkles,
  MapPin,
  Shield,
  FileText,
  Key,
  Scroll,
  CheckSquare,
  AlertCircle,
  ChevronRight,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { downloadSingleFile } from '../utils/exportBundle';

interface CampaignOutlinerProps {
  campaign: Campaign;
  onUpdateCampaign: (updated: Campaign) => void;
  onSelectMap?: (map: AdventureMap) => void;
  onNewSketchForSession?: (sessionNum: number) => void;
}

export const CampaignOutliner: React.FC<CampaignOutlinerProps> = ({
  campaign,
  onUpdateCampaign,
  onSelectMap,
  onNewSketchForSession,
}) => {
  const [selectedSessionNum, setSelectedSessionNum] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'sessions' | 'handouts' | 'secrets'>('sessions');

  // Generator form modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [formTitle, setFormTitle] = useState(campaign.title);
  const [formLength, setFormLength] = useState(campaign.sessionLengthHours || 3);
  const [formCount, setFormCount] = useState(campaign.sessionCount || 3);
  const [formLevel, setFormLevel] = useState(campaign.partyLevel || 3);
  const [formTone, setFormTone] = useState(campaign.tone || 'Dark Fantasy');
  const [formSetting, setFormSetting] = useState(campaign.setting || 'Desolate High-Alpine Castle');
  const [formPremise, setFormPremise] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const currentSession = campaign.sessions.find(
    (s) => s.sessionNumber === selectedSessionNum
  ) || campaign.sessions[0];

  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenError('');

    try {
      const response = await fetch('/api/adventure/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          sessionLengthHours: Number(formLength),
          sessionCount: Number(formCount),
          partyLevel: Number(formLevel),
          partySize: campaign.partySize || 4,
          tone: formTone,
          setting: formSetting,
          premise: formPremise,
        }),
      });

      const result = await response.json();
      if (!response.ok && !result.data) {
        throw new Error(result.error || 'Failed to outline campaign');
      }

      const generated = result.data || result.fallback;

      const newCampaign: Campaign = {
        id: `camp-${Date.now()}`,
        title: generated.title || formTitle,
        synopsis: generated.synopsis || 'An epic multi-session journey.',
        tone: formTone,
        setting: formSetting,
        partyLevel: Number(formLevel),
        partySize: campaign.partySize || 4,
        sessionCount: Number(formCount),
        sessionLengthHours: Number(formLength),
        sessions: generated.sessions || [],
        maps: generated.suggestedMaps
          ? generated.suggestedMaps.map((m: any, idx: number) => ({
              id: `map-${Date.now()}-${idx}`,
              name: m.name,
              environment: m.environment || 'dungeon',
              width: m.width || 20,
              height: m.height || 20,
              ambientLighting: m.ambientLighting || 'Dim torches',
              hazards: m.hazards || 'Traps and slick stone',
              tacticalNotes: m.tacticalNotes || 'Tactical encounter area',
              description: m.description || 'Tactical dungeon chamber.',
              rooms: m.rooms || [],
              gridVisible: true,
            }))
          : campaign.maps,
        npcs: generated.initialNpcs
          ? generated.initialNpcs.map((n: any, idx: number) => ({
              id: `npc-${Date.now()}-${idx}`,
              name: n.name,
              title: n.title || 'Wanderer',
              race: n.race || 'Human',
              classOrRole: n.classOrRole || 'Guide',
              tier: n.tier || 'side',
              stats: n.stats || {
                str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
                ac: 11, hp: 20, maxHp: 20, speed: '30 ft.',
              },
              combatAbilities: [],
              flavor: n.flavor || {
                appearance: 'Local resident',
                voiceMannerism: 'Quiet',
                flawOrQuirk: 'Cautious',
                secretMotivation: 'Survival',
                plotHook: 'Has rumors',
                relationshipToParty: 'Neutral',
              },
            }))
          : campaign.npcs,
        items: campaign.items,
        handouts: generated.handouts || [],
        secrets: generated.secrets || [],
      };

      onUpdateCampaign(newCampaign);
      setSelectedSessionNum(1);
      setShowGenerateModal(false);
    } catch (err: any) {
      console.error('Error generating campaign:', err);
      setGenError(err.message || 'Error occurred generating campaign');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadHandout = (handout: Handout) => {
    downloadSingleFile(
      `# ${handout.title}\nAuthor: ${handout.author}\nRecipient: ${handout.recipient}\n\n${handout.textContent}`,
      `${handout.title.toLowerCase().replace(/\s+/g, '_')}_handout.md`
    );
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100">
      {/* Campaign Header & Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-100">
                {campaign.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-1">
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {campaign.sessionCount} Planned Sessions
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-cyan-300 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {campaign.sessionLengthHours} Hours / Session
                </span>
                <span>•</span>
                <span className="text-stone-300">Level {campaign.partyLevel} Party ({campaign.partySize} PCs)</span>
                <span>•</span>
                <span className="text-purple-300 font-serif italic">{campaign.tone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* New Adventure Arc Button */}
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Adventure Arc Generator</span>
        </button>
      </div>

      {/* Campaign Synopsis Card */}
      <div className="mb-6 p-4 bg-stone-950/70 border border-stone-800/80 rounded-xl">
        <span className="text-[11px] uppercase tracking-wider font-mono text-amber-400 font-bold block mb-1">
          Campaign Master Synopsis & Central Dilemma
        </span>
        <p className="text-xs text-stone-300 leading-relaxed font-serif">
          {campaign.synopsis}
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 mb-5">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'sessions'
              ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Session Beat Sheets ({campaign.sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('handouts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'handouts'
              ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Scroll className="w-4 h-4" />
          Player Handouts ({campaign.handouts.length})
        </button>
        <button
          onClick={() => setActiveTab('secrets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'secrets'
              ? 'border-amber-500 text-amber-300 bg-amber-500/10 rounded-t-lg'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Key className="w-4 h-4" />
          DM Secrets & Clues ({campaign.secrets.length})
        </button>
      </div>

      {/* Tab 1: Sessions Beat Sheet & Timeline */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Session Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {campaign.sessions.map((sess) => (
              <button
                key={sess.sessionNumber}
                onClick={() => setSelectedSessionNum(sess.sessionNumber)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedSessionNum === sess.sessionNumber
                    ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-md'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-850'
                }`}
              >
                <span>Session {sess.sessionNumber}</span>
                <span className="text-[10px] opacity-75">({sess.duration})</span>
              </button>
            ))}
          </div>

          {currentSession && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Timeline Beat Sheet */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
                    <div>
                      <h3 className="text-base font-bold font-serif text-stone-100">
                        {currentSession.title}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {currentSession.pacingSummary || `Pacing budgeted strictly for ${currentSession.duration}`}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-stone-900 border border-stone-700 text-amber-300 rounded-md text-xs font-mono font-bold">
                      {currentSession.duration}
                    </span>
                  </div>

                  {/* Beat Sheet Breakdown */}
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                      Chronological Session Beat Sheet
                    </span>
                    {currentSession.timeline.map((beat, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-900/90 border border-stone-800 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">
                            {beat.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                              {beat.timestamp}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                beat.phase === 'hook'
                                  ? 'bg-blue-950 text-blue-300'
                                  : beat.phase === 'combat'
                                  ? 'bg-red-950 text-red-300'
                                  : beat.phase === 'climax'
                                  ? 'bg-purple-950 text-purple-300'
                                  : 'bg-emerald-950 text-emerald-300'
                              }`}
                            >
                              {beat.phase}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed">
                          {beat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Encounters, Objectives, Loot */}
              <div className="lg:col-span-5 space-y-4">
                {/* Key Objectives */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
                    Key Session Objectives
                  </span>
                  <ul className="space-y-2 text-xs">
                    {currentSession.keyObjectives.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-stone-300">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Encounters */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
                    Planned Encounters & Setpieces
                  </span>
                  {currentSession.encounters.map((enc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-900 border border-stone-800 rounded-lg space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-200">
                          {enc.name}
                        </h4>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            enc.difficulty === 'Deadly'
                              ? 'bg-red-900/60 text-red-300'
                              : enc.difficulty === 'Hard'
                              ? 'bg-amber-900/60 text-amber-300'
                              : 'bg-blue-900/60 text-blue-300'
                          }`}
                        >
                          {enc.difficulty} ({enc.type})
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">{enc.summary}</p>
                    </div>
                  ))}
                </div>

                {/* Session Loot */}
                {currentSession.loot && (
                  <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/40">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
                      Session Rewards & Loot
                    </span>
                    <p className="text-xs text-amber-200 font-medium">
                      {currentSession.loot}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Player Handouts */}
      {activeTab === 'handouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaign.handouts.map((h) => (
            <div
              key={h.id}
              className="relative p-6 rounded-xl border shadow-xl flex flex-col justify-between overflow-hidden bg-[#241e17] border-amber-900/50 text-[#f5ebd7]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 10% 20%, rgba(0,0,0,0.15) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)
                `,
              }}
            >
              {/* Blood splatter or burnt edge styling */}
              {h.visualTheme === 'bloodstained' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-900/30 blur-xl pointer-events-none rounded-full" />
              )}

              <div>
                <div className="flex items-center justify-between border-b border-amber-900/40 pb-3 mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-amber-100">
                      {h.title}
                    </h3>
                    <div className="text-xs text-amber-300/80 font-mono mt-0.5">
                      From: <span className="font-semibold">{h.author}</span> • To: <span className="font-semibold">{h.recipient}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    Session {h.sessionNumber || 1}
                  </span>
                </div>

                <div className="font-serif text-xs leading-relaxed italic text-stone-200 whitespace-pre-line p-2">
                  "{h.textContent}"
                </div>
              </div>

              <div className="pt-4 border-t border-amber-900/30 flex items-center justify-between mt-4">
                <span className="text-[10px] text-amber-400/60 font-mono">
                  Theme: {h.visualTheme}
                </span>
                <button
                  onClick={() => downloadHandout(h)}
                  className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800 text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Handout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Secrets & DM Clues */}
      {activeTab === 'secrets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaign.secrets.map((sec) => (
            <div
              key={sec.id}
              className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-stone-200">
                    {sec.title}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    sec.secretLevel === 'Dark Betrayal'
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : sec.secretLevel === 'Campaign Twist'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {sec.secretLevel}
                </span>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {sec.description}
              </p>

              <div className="text-xs space-y-1.5 pt-2 border-t border-stone-850">
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">
                    Discovery Method:
                  </span>
                  <span className="text-stone-300">{sec.discoveryMethod}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">
                    Consequence / Revelation Impact:
                  </span>
                  <span className="text-emerald-300">{sec.revelationImpact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generator Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-serif text-stone-100">
                  Generate Custom Adventure Arc
                </h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Adventure Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. The Sunken Citadel of Karstkeep"
                  required
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Session Length (Hours)
                  </label>
                  <select
                    value={formLength}
                    onChange={(e) => setFormLength(Number(e.target.value))}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={2}>2 Hours (Fast Paced / One-shot)</option>
                    <option value={2.5}>2.5 Hours</option>
                    <option value={3}>3 Hours (Standard)</option>
                    <option value={3.5}>3.5 Hours</option>
                    <option value={4}>4 Hours (Epic Session)</option>
                    <option value={5}>5 Hours (Marathon)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Number of Sessions
                  </label>
                  <select
                    value={formCount}
                    onChange={(e) => setFormCount(Number(e.target.value))}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1 Session (One-Shot)</option>
                    <option value={2}>2 Sessions (Duo Arc)</option>
                    <option value={3}>3 Sessions (Mini Campaign Trilogy)</option>
                    <option value={4}>4 Sessions (Full Arc)</option>
                    <option value={5}>5 Sessions (Extended Arc)</option>
                    <option value={6}>6 Sessions (Grand Quest)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Party Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formLevel}
                    onChange={(e) => setFormLevel(Number(e.target.value))}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1">
                    Campaign Tone
                  </label>
                  <select
                    value={formTone}
                    onChange={(e) => setFormTone(e.target.value)}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Gothic Grimdark">Gothic Grimdark</option>
                    <option value="High Fantasy">High Fantasy</option>
                    <option value="Cosmic / Eldritch Horror">Cosmic / Eldritch Horror</option>
                    <option value="Urban Heist & Intrigue">Urban Heist & Intrigue</option>
                    <option value="Survival & Exploration">Survival & Exploration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  World / Setting Concept
                </label>
                <input
                  type="text"
                  value={formSetting}
                  onChange={(e) => setFormSetting(e.target.value)}
                  placeholder="e.g. Flooded coastal catacombs under a stormy barony"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1">
                  Premise or Inciting Incident
                </label>
                <textarea
                  value={formPremise}
                  onChange={(e) => setFormPremise(e.target.value)}
                  placeholder="e.g. Black water began flowing from the cathedral fountain, and the crypt gates were found forced open from the inside..."
                  rows={3}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-lg p-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {genError && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
                  {genError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                      <span>Forging Multi-Session Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Compile Adventure Arc</span>
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
