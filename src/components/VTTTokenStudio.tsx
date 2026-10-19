import React, { useState, useRef, useEffect } from 'react';
import { NPC, TokenStyling } from '../types/ttrpg';
import { renderTokenToCanvas } from '../utils/tokenRenderer';
import { generateCharacterAvatar } from '../utils/avatarGenerator';
import { downloadDataUrl } from '../utils/exportBundle';
import {
  Download,
  Sparkles,
  Sliders,
  Move,
  ZoomIn,
  Palette,
  Shield,
  Layers,
  Check,
  Upload,
  UserCheck
} from 'lucide-react';

interface VTTTokenStudioProps {
  npcs: NPC[];
  selectedNpcId?: string;
  onUpdateNPCTokenStyling?: (npcId: string, styling: TokenStyling) => void;
}

export const VTTTokenStudio: React.FC<VTTTokenStudioProps> = ({
  npcs,
  selectedNpcId,
  onUpdateNPCTokenStyling,
}) => {
  const activeNpc = npcs.find((n) => n.id === selectedNpcId) || npcs[0] || null;
  const [currentNpcId, setCurrentNpcId] = useState<string>(activeNpc?.id || '');

  const npc = npcs.find((n) => n.id === currentNpcId) || activeNpc;

  // Token customizer state
  const [borderColor, setBorderColor] = useState(npc?.tokenStyling?.borderColor || '#eab308');
  const [borderStyle, setBorderStyle] = useState<TokenStyling['borderStyle']>(
    npc?.tokenStyling?.borderStyle || 'ornate'
  );
  const [ringThickness, setRingThickness] = useState(npc?.tokenStyling?.ringThickness || 18);
  const [zoom, setZoom] = useState(npc?.tokenStyling?.zoom || 1);
  const [offsetX, setOffsetX] = useState(npc?.tokenStyling?.offsetX || 0);
  const [offsetY, setOffsetY] = useState(npc?.tokenStyling?.offsetY || 0);
  const [badgeText, setBadgeText] = useState(
    npc?.tokenStyling?.badgeText || (npc?.tier === 'main' ? `CR ${npc?.stats.cr || '4'}` : 'NPC')
  );
  const [ringColor, setRingColor] = useState(npc?.tokenStyling?.ringColor || '#18181b');
  const [tokenResolution, setTokenResolution] = useState<number>(512);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync when selecting a different NPC
  useEffect(() => {
    if (npc) {
      setBorderColor(npc.tokenStyling?.borderColor || (npc.tier === 'main' ? '#ef4444' : '#eab308'));
      setBorderStyle(npc.tokenStyling?.borderStyle || (npc.tier === 'main' ? 'runic' : 'ornate'));
      setRingThickness(npc.tokenStyling?.ringThickness || 18);
      setZoom(npc.tokenStyling?.zoom || 1);
      setOffsetX(npc.tokenStyling?.offsetX || 0);
      setOffsetY(npc.tokenStyling?.offsetY || 0);
      setBadgeText(
        npc.tokenStyling?.badgeText || (npc.tier === 'main' ? `CR ${npc.stats.cr || '4'}` : 'NPC')
      );
      setRingColor(npc.tokenStyling?.ringColor || '#18181b');
      setCustomImage(null);
    }
  }, [currentNpcId]);

  // Redraw token on live canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !npc) return;

    const avatarSrc = customImage || npc.avatarUrl || npc.sketchImage || generateCharacterAvatar(npc.name, npc.race, npc.classOrRole, npc.tier);

    renderTokenToCanvas(
      canvas,
      avatarSrc,
      {
        borderColor,
        borderStyle,
        ringThickness,
        zoom,
        offsetX,
        offsetY,
        badgeText,
        ringColor,
      },
      tokenResolution
    );
  }, [
    npc,
    customImage,
    borderColor,
    borderStyle,
    ringThickness,
    zoom,
    offsetX,
    offsetY,
    badgeText,
    ringColor,
    tokenResolution,
  ]);

  // Drag to reposition portrait
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadToken = () => {
    const canvas = canvasRef.current;
    if (!canvas || !npc) return;
    const dataUrl = canvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, `${npc.name.toLowerCase().replace(/\s+/g, '_')}_vtt_token.png`);
  };

  const handleSaveToNpc = () => {
    if (!npc || !onUpdateNPCTokenStyling) return;
    onUpdateNPCTokenStyling(npc.id, {
      borderColor,
      borderStyle,
      ringThickness,
      zoom,
      offsetX,
      offsetY,
      badgeText,
      ringColor,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  if (!npc) {
    return (
      <div className="p-8 bg-stone-900 border border-stone-800 rounded-xl text-center text-stone-400">
        No NPCs available yet. Generate an NPC or campaign first!
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-100">
                VTT Token Forge
              </h2>
              <p className="text-xs text-stone-400">
                Create circular, framed VTT tokens ready for Roll20, Foundry VTT, Fantasy Grounds, or Owlbear Rodeo.
              </p>
            </div>
          </div>
        </div>

        {/* NPC Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-400">Target NPC:</label>
          <select
            value={currentNpcId}
            onChange={(e) => setCurrentNpcId(e.target.value)}
            className="text-xs bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
          >
            {npcs.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.tier.toUpperCase()} - {n.classOrRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Token Canvas Viewport */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4 bg-stone-950 p-6 rounded-xl border border-stone-800 shadow-inner">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-widest">
            VTT Alpha-Transparent Preview
          </span>

          <div
            className="relative rounded-full p-2 border-2 border-dashed border-stone-800 hover:border-amber-500/50 transition-colors"
            style={{
              backgroundImage: `
                radial-gradient(#27272a 15%, transparent 16%),
                radial-gradient(#27272a 15%, transparent 16%)
              `,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-72 h-72 rounded-full cursor-grab active:cursor-grabbing shadow-2xl"
              title="Click and drag to pan portrait"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Move className="w-3.5 h-3.5 text-amber-400" />
            <span>Click and drag preview to adjust character position</span>
          </div>

          {/* Download & Save Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
            <button
              onClick={handleDownloadToken}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Token PNG
            </button>

            {onUpdateNPCTokenStyling && (
              <button
                onClick={handleSaveToNpc}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Saved to NPC!</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Save to Campaign</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Customization Controls */}
        <div className="lg:col-span-7 space-y-5 bg-stone-950/60 p-5 rounded-xl border border-stone-800">
          {/* Preset Border Metallic Styles */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              Border Ring Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ornate', label: 'Gold Filigree', color: '#eab308' },
                { id: 'runic', label: 'Runic Inscribed', color: '#dc2626' },
                { id: 'spikes', label: 'Dark Spikes', color: '#71717a' },
                { id: 'minimal', label: 'Clean Sleek', color: '#38bdf8' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    setBorderStyle(style.id as any);
                    setBorderColor(style.color);
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                    borderStyle === style.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full mb-1.5"
                    style={{ backgroundColor: style.color }}
                  />
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ring Color Swatches */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-400" />
              Ring Metallic Tint
            </label>
            <div className="flex items-center gap-2">
              {[
                { name: 'Gilded Gold', color: '#eab308' },
                { name: 'Blood Crimson', color: '#ef4444' },
                { name: 'Silvered Platinum', color: '#e2e8f0' },
                { name: 'Arcane Amethyst', color: '#a855f7' },
                { name: 'Emerald Grove', color: '#10b981' },
                { name: 'Iron Dark', color: '#52525b' },
                { name: 'Cyan Mystic', color: '#06b6d4' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setBorderColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`w-7 h-7 rounded-full border transition-transform ${
                    borderColor === c.color
                      ? 'scale-125 border-white ring-2 ring-amber-400'
                      : 'border-stone-700 opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Sliders: Zoom & Ring Thickness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" /> Zoom Level
                </span>
                <span className="font-mono text-amber-400">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 accent-amber-500 bg-stone-800 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
                <span>Ring Thickness</span>
                <span className="font-mono text-amber-400">{ringThickness}px</span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                step="2"
                value={ringThickness}
                onChange={(e) => setRingThickness(Number(e.target.value))}
                className="w-full h-1.5 accent-amber-500 bg-stone-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Nameplate Ribbon Text */}
          <div>
            <label className="text-xs font-bold text-stone-300 block mb-1">
              Nameplate Ribbon Text (Leave blank to omit)
            </label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="e.g. BOSS, CR 5, or Character Name"
              className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Resolution & Custom Image Override */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Resolution:</span>
              {[256, 512, 1024].map((res) => (
                <button
                  key={res}
                  onClick={() => setTokenResolution(res)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium border ${
                    tokenResolution === res
                      ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                  }`}
                >
                  {res}x{res}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg text-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Use Custom Portrait Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
