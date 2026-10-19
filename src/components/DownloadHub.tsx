import React, { useState } from 'react';
import { Campaign, NPC, AdventureMap, Handout } from '../types/ttrpg';
import {
  downloadCampaignZip,
  downloadSingleFile,
  downloadDataUrl,
  generateCampaignMarkdown
} from '../utils/exportBundle';
import { renderTokenToCanvas } from '../utils/tokenRenderer';
import { generateCharacterAvatar } from '../utils/avatarGenerator';
import {
  buildUVTTExport,
  generateRoll20ApiMacro,
  generateRoll20PageSpecs,
  formatRoll20JournalEntry
} from '../utils/uvttExporter';
import {
  Archive,
  Download,
  FileText,
  Map as MapIcon,
  Sparkles,
  Layers,
  CheckCircle,
  FileCode,
  Scroll,
  ExternalLink,
  Code2,
  Sliders,
  Copy,
  Check
} from 'lucide-react';

interface DownloadHubProps {
  campaign: Campaign;
}

export const DownloadHub: React.FC<DownloadHubProps> = ({ campaign }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedMapForRoll20, setSelectedMapForRoll20] = useState<AdventureMap | null>(campaign.maps[0] || null);
  const [copiedMacroId, setCopiedMacroId] = useState<string | null>(null);

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      await downloadCampaignZip(campaign);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export campaign zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleToken = async (npc: NPC) => {
    const canvas = document.createElement('canvas');
    const avatarSrc = npc.avatarUrl || npc.sketchImage || generateCharacterAvatar(npc.name, npc.race, npc.classOrRole, npc.tier);
    const dataUrl = await renderTokenToCanvas(
      canvas,
      avatarSrc,
      npc.tokenStyling || {
        borderColor: npc.tier === 'main' ? '#ef4444' : '#eab308',
        borderStyle: 'ornate',
        badgeText: npc.tier === 'main' ? `CR ${npc.stats.cr || '4'}` : 'NPC',
      },
      512
    );
    downloadDataUrl(dataUrl, `${npc.name.toLowerCase().replace(/\s+/g, '_')}_token.png`);
  };

  const handleDownloadUVTT = (map: AdventureMap) => {
    const uvtt = buildUVTTExport(map);
    downloadSingleFile(
      JSON.stringify(uvtt, null, 2),
      `${map.name.toLowerCase().replace(/\s+/g, '_')}.uvtt`,
      'application/json'
    );
  };

  const handleCopyMacro = (npc: NPC) => {
    const macro = generateRoll20ApiMacro(npc);
    navigator.clipboard.writeText(macro);
    setCopiedMacroId(npc.id);
    setTimeout(() => setCopiedMacroId(null), 2500);
  };

  const handleDownloadMasterGuide = () => {
    const markdown = generateCampaignMarkdown(campaign);
    downloadSingleFile(markdown, `${campaign.title.toLowerCase().replace(/\s+/g, '_')}_master_guide.md`);
  };

  const handleDownloadJsonBackup = () => {
    downloadSingleFile(JSON.stringify(campaign, null, 2), `${campaign.title.toLowerCase().replace(/\s+/g, '_')}_campaign.json`, 'application/json');
  };

  const roll20Specs = selectedMapForRoll20 ? generateRoll20PageSpecs(selectedMapForRoll20) : null;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Archive className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-stone-100">
                  Adventure Export & VTT Binder
                </h2>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
                  &lt;artifact type="Roll20ExportSpec"&gt;
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Dual-track VTT export: Option A (.uvtt Dynamic Lighting + Roll20 1-Click Macros) and Option B (Exact Page Settings & Journal markdown).
              </p>
            </div>
          </div>
        </div>

        {/* Master Zip Download Button */}
        <button
          onClick={handleDownloadAllZip}
          disabled={isZipping}
          className={`py-3 px-5 rounded-xl font-bold font-serif text-xs shadow-xl transition-all flex items-center gap-2 ${
            isZipping
              ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 shadow-amber-900/30'
          }`}
        >
          {isZipping ? (
            <>
              <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              <span>Compiling ZIP Archive & Rendering Tokens...</span>
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              <span>Download Complete Adventure Box (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Adventure Box exported successfully! Includes tokens, master campaign markdown guide, player handouts, and maps.</span>
        </div>
      )}

      {/* Dual-Track VTT Calibration Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track A: Universal VTT (.uvtt) Dynamic Lighting Vectors */}
        <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-purple-500/20 text-purple-300">
                <Code2 className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-200">
                Track A: Universal VTT (.uvtt) Dynamic Lighting
              </h3>
            </div>
            <span className="text-[10px] text-purple-400 font-mono">Roll20 Pro / Foundry</span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Exports geometric Line-of-Sight barrier walls, doors, and ambient lighting vectors compatible with the Roll20 UniversalVTTImporter script and Foundry VTT.
          </p>

          <div className="space-y-2">
            {campaign.maps.map((map) => (
              <div
                key={map.id}
                className="p-3 bg-stone-900 border border-stone-800 rounded-lg flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-stone-200">{map.name}</h4>
                  <span className="text-[10px] font-mono text-stone-400">
                    {map.width}x{map.height} grid • {map.rooms.length} LOS wall loops
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadUVTT(map)}
                  className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700 text-purple-200 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  .uvtt
                </button>
              </div>
            ))}
          </div>

          {/* Roll20 1-Click Character API Macros */}
          <div className="pt-2 border-t border-stone-850 space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase text-stone-400 block">
              Roll20 1-Click Character API Macros (Copy & Paste to Chat):
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {campaign.npcs.map((npc) => (
                <div
                  key={npc.id}
                  className="p-2 bg-stone-900/80 rounded border border-stone-850 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-bold text-stone-200 truncate">{npc.name}</span>
                  <button
                    onClick={() => handleCopyMacro(npc)}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono rounded flex items-center gap-1"
                  >
                    {copiedMacroId === npc.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Macro</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Track B: Exact Roll20 Page Setup Specifications */}
        <div className="p-5 bg-stone-950 rounded-xl border border-stone-800 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-amber-500/20 text-amber-300">
                <Sliders className="w-4 h-4" />
              </span>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-200">
                Track B: Manual Roll20 Page Dimensions
              </h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Standard Drag & Drop</span>
          </div>

          {campaign.maps.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {campaign.maps.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMapForRoll20(m)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    selectedMapForRoll20?.id === m.id
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {roll20Specs && selectedMapForRoll20 && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-stone-900 p-3 rounded-lg border border-stone-850">
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">Grid Scale</span>
                  <span className="font-bold text-stone-200">{roll20Specs.gridSquares}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">Standard 70px/grid</span>
                  <span className="font-bold text-amber-300 font-mono">{roll20Specs.roll20StandardPx}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">HD 140px/grid</span>
                  <span className="font-bold text-purple-300 font-mono">{roll20Specs.roll20HDPx}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-mono text-[10px] uppercase block">Background Tint</span>
                  <span className="font-mono text-stone-300">{roll20Specs.suggestedBackgroundColor}</span>
                </div>
              </div>

              <div className="space-y-1 bg-stone-900/60 p-3 rounded-lg border border-stone-850">
                <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block mb-1">
                  Step-by-Step Setup Guide:
                </span>
                <ol className="space-y-1 text-stone-300 text-[11px]">
                  {roll20Specs.setupSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Individual VTT Tokens Section */}
      <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
        <div className="flex items-center justify-between border-b border-stone-850 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-stone-200">
              Individual VTT Tokens ({campaign.npcs.length})
            </h3>
          </div>
          <span className="text-[10px] text-stone-500 font-mono">
            512x512 Transparent Circular Cutouts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {campaign.npcs.map((npc) => (
            <div
              key={npc.id}
              className="p-3 bg-stone-900 border border-stone-850 rounded-lg flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={
                    npc.avatarUrl ||
                    npc.sketchImage ||
                    generateCharacterAvatar(npc.name, npc.race, npc.classOrRole, npc.tier)
                  }
                  alt={npc.name}
                  className="w-10 h-10 rounded-full object-cover border shrink-0"
                  style={{
                    borderColor: npc.tier === 'main' ? '#ef4444' : '#eab308',
                  }}
                />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-stone-200 truncate">
                    {npc.name}
                  </h5>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    {npc.tier.toUpperCase()} • {npc.classOrRole}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadSingleToken(npc)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg border border-stone-700 shrink-0"
                title="Download VTT Token PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Handouts & Maps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Handouts List */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-stone-200 flex items-center gap-1.5">
              <Scroll className="w-3.5 h-3.5 text-amber-400" />
              Handouts ({campaign.handouts.length})
            </span>
          </div>

          <div className="space-y-2">
            {campaign.handouts.map((h) => {
              const journal = formatRoll20JournalEntry(h);
              return (
                <div
                  key={h.id}
                  className="p-2.5 bg-stone-900 border border-stone-850 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-stone-200 truncate">
                      {h.title}
                    </h5>
                    <span className="text-[10px] text-stone-400 block font-mono truncate">
                      {h.author} ➔ {h.recipient}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      downloadSingleFile(
                        `${journal.inPlayerBio}\n\n---\n\n${journal.inGMNotes}`,
                        `${h.title.toLowerCase().replace(/\s+/g, '_')}_roll20_entry.md`
                      );
                    }}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] rounded border border-stone-700 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    .md
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Maps List */}
        <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-850 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono text-stone-200 flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-emerald-400" />
              Tactical Maps ({campaign.maps.length})
            </span>
          </div>

          <div className="space-y-2">
            {campaign.maps.map((m) => (
              <div
                key={m.id}
                className="p-2.5 bg-stone-900 border border-stone-850 rounded-lg flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-stone-200 truncate">
                    {m.name}
                  </h5>
                  <span className="text-[10px] text-stone-400 block font-mono">
                    {m.environment} • {m.width}x{m.height} grid
                  </span>
                </div>
                <button
                  onClick={() => {
                    const text = `# ${m.name}\nEnvironment: ${m.environment}\n\n${m.description}\n\nRooms:\n${m.rooms.map((r) => `- Area ${r.number}: ${r.name} - ${r.description}`).join('\n')}`;
                    downloadSingleFile(text, `${m.name.toLowerCase().replace(/\s+/g, '_')}_guide.md`);
                  }}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] rounded border border-stone-700 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Guide
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
