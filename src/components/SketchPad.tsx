import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Upload,
  Sparkles,
  Map as MapIcon,
  User,
  Sword,
  Sliders,
  CheckCircle,
  HelpCircle,
  Grid as GridIcon,
  Maximize2
} from 'lucide-react';
import { AdventureMap, NPC, MagicItem } from '../types/ttrpg';

interface SketchPadProps {
  onMapGenerated: (map: AdventureMap) => void;
  onNPCGenerated: (npc: NPC) => void;
  onItemGenerated: (item: MagicItem) => void;
  onSendToTokenStudio?: (npc: NPC) => void;
  currentTone?: string;
}

export const SketchPad: React.FC<SketchPadProps> = ({
  onMapGenerated,
  onNPCGenerated,
  onItemGenerated,
  onSendToTokenStudio,
  currentTone = 'Dark Fantasy',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'marker'>('pen');
  const [brushColor, setBrushColor] = useState('#f8fafc');
  const [brushSize, setBrushSize] = useState(4);
  const [showGrid, setShowGrid] = useState(true);
  const [targetType, setTargetType] = useState<'map' | 'npc' | 'item'>('map');
  const [sketchNotes, setSketchNotes] = useState('');
  const [tone, setTone] = useState(currentTone);
  const [system, setSystem] = useState('5e / Universal TTRPG');
  const [isForging, setIsForging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [latestResult, setLatestResult] = useState<{
    type: 'map' | 'npc' | 'item';
    data: any;
  } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with dark parchment background
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), currentData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.beginPath();
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = brushSize * 3;
    } else if (tool === 'marker') {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize * 2.5;
    } else {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  // Upload sketch image from computer / camera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image scaled to fit canvas nicely
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
        saveHistoryState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Load sample sketch doodles
  const loadSampleSketch = (sampleType: 'map' | 'npc' | 'item') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (sampleType === 'map') {
      setTargetType('map');
      setSketchNotes('Flooded sunken dungeon with 3 chambers, a central altar chasm, and a secret vault behind room 2.');
      // Draw rough dungeon doodle
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      // Room 1
      ctx.strokeRect(60, 60, 180, 140);
      // Corridor
      ctx.strokeRect(240, 100, 120, 60);
      // Room 2
      ctx.strokeRect(360, 40, 200, 180);
      // Corridor to Hall
      ctx.strokeRect(440, 220, 60, 100);
      // Boss Room
      ctx.beginPath();
      ctx.arc(470, 430, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Annotations
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(450, 410, 40, 40); // Altar
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('1. Entry', 70, 90);
      ctx.fillText('2. Library', 370, 70);
      ctx.fillText('3. Moon Altar', 420, 380);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('~ water ~', 80, 150);
    } else if (sampleType === 'npc') {
      setTargetType('npc');
      setSketchNotes('Blind elven falconer with an iron bird on his shoulder and a raven silk blindfold.');
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;

      // Head and blindfold
      ctx.beginPath();
      ctx.arc(300, 180, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Blindfold
      ctx.fillStyle = '#64748b';
      ctx.fillRect(240, 160, 120, 28);

      // Cloak
      ctx.beginPath();
      ctx.moveTo(240, 240);
      ctx.lineTo(160, 460);
      ctx.lineTo(440, 460);
      ctx.lineTo(360, 240);
      ctx.closePath();
      ctx.stroke();

      // Falcon silhouette on shoulder
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(170, 210, 20, 0, Math.PI * 2);
      ctx.moveTo(150, 210);
      ctx.lineTo(130, 215); // beak
      ctx.moveTo(170, 230);
      ctx.lineTo(160, 280); // body
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '16px sans-serif';
      ctx.fillText('Iron Falcon', 110, 180);
      ctx.fillText('Silk Blindfold', 340, 160);
    } else {
      setTargetType('item');
      setSketchNotes('Obsidian greatsword glowing with embers, cracked pommel shaped like a dragon jaw.');
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;

      // Blade
      ctx.beginPath();
      ctx.moveTo(300, 80);
      ctx.lineTo(330, 340);
      ctx.lineTo(270, 340);
      ctx.closePath();
      ctx.stroke();

      // Guard
      ctx.strokeRect(230, 340, 140, 18);
      // Grip & Pommel
      ctx.strokeRect(290, 358, 20, 70);
      ctx.beginPath();
      ctx.arc(300, 440, 20, 0, Math.PI * 2);
      ctx.stroke();

      // Ember crack details
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(300, 140);
      ctx.lineTo(290, 190);
      ctx.lineTo(310, 240);
      ctx.lineTo(300, 300);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.font = '16px sans-serif';
      ctx.fillText('Embers inside cracks', 340, 210);
    }

    saveHistoryState();
  };

  // Trigger Gemini Multimodal Transformation
  const handleForge = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsForging(true);
    setErrorMsg('');

    try {
      const dataUrl = canvas.toDataURL('image/png');

      const response = await fetch('/api/sketch/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sketchDataUrl: dataUrl,
          type: targetType,
          notes: sketchNotes,
          system,
          tone,
        }),
      });

      const result = await response.json();
      if (!response.ok && !result.data) {
        throw new Error(result.error || 'Failed to transform sketch');
      }

      const generatedData = result.data || result.fallback;
      setLatestResult({
        type: targetType,
        data: generatedData,
      });

      if (targetType === 'map') {
        const newMap: AdventureMap = {
          id: `map-${Date.now()}`,
          name: generatedData.name || 'Forged Tactical Battlemap',
          environment: generatedData.environment || 'dungeon',
          width: generatedData.width || 20,
          height: generatedData.height || 20,
          ambientLighting: generatedData.ambientLighting || 'Dim torchlight',
          hazards: generatedData.hazards || 'None reported',
          tacticalNotes: generatedData.tacticalNotes || 'Tactical layout generated from sketch',
          description: generatedData.description || 'A tactical encounter space forged from hand-drawn blueprint.',
          rooms: generatedData.rooms || [],
          sketchImage: dataUrl,
          gridVisible: true,
        };
        onMapGenerated(newMap);
      } else if (targetType === 'npc') {
        const newNpc: NPC = {
          id: `npc-${Date.now()}`,
          name: generatedData.name || 'Unnamed Wanderer',
          title: generatedData.title || 'Drawn from the Shadows',
          race: generatedData.race || 'Human',
          classOrRole: generatedData.classOrRole || 'Warrior',
          tier: 'main',
          sketchImage: dataUrl,
          stats: generatedData.stats || {
            str: 14, dex: 14, con: 14, int: 10, wis: 12, cha: 12,
            ac: 15, hp: 55, maxHp: 55, speed: '30 ft.', cr: '3', pb: 2,
          },
          combatAbilities: generatedData.combatAbilities || [],
          flavor: generatedData.flavor || {
            appearance: 'Vividly matches the hand-drawn sketch.',
            voiceMannerism: 'Quiet and commanding.',
            flawOrQuirk: 'Cautious of strangers.',
            secretMotivation: 'Hidden agenda.',
            plotHook: 'Seeks travelers for aid.',
            relationshipToParty: 'Observant.',
          },
          tokenStyling: generatedData.tokenStyling || {
            borderColor: '#eab308',
            borderStyle: 'ornate',
            badgeText: 'SKETCHED NPC',
          },
        };
        onNPCGenerated(newNpc);
      } else if (targetType === 'item') {
        const newItem: MagicItem = {
          id: `item-${Date.now()}`,
          name: generatedData.name || 'Forged Relic',
          type: generatedData.type || 'weapon',
          rarity: generatedData.rarity || 'Rare',
          attunement: generatedData.attunement ?? true,
          description: generatedData.description || 'An artifact crafted from sketch design.',
          mechanicalEffects: generatedData.mechanicalEffects || ['Grants +1 to checks.'],
          lore: generatedData.lore || 'Ancient lore forgotten by time.',
          quirkOrCurse: generatedData.quirkOrCurse,
          sketchImage: dataUrl,
        };
        onItemGenerated(newItem);
      }
    } catch (err: any) {
      console.error('Error forging sketch:', err);
      setErrorMsg(err.message || 'An error occurred while forging the sketch');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-amber-100">
              Sketch-to-Campaign Alchemy Forge
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Draw or upload your hand-drawn floorplan, character face, or item doodle. AI vision interprets lines into playable battlemaps, statblocks, or magical relics!
          </p>
        </div>

        {/* Forge Target Selector */}
        <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => setTargetType('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              targetType === 'map'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Tactical Map
          </button>
          <button
            onClick={() => setTargetType('npc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              targetType === 'npc'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            NPC & Stats
          </button>
          <button
            onClick={() => setTargetType('item')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              targetType === 'item'
                ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            Magic Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Canvas & Sketch Tools */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Canvas Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/80 p-2.5 rounded-lg border border-stone-800">
            {/* Tool Selection */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTool('pen')}
                className={`p-2 rounded-md transition-colors ${
                  tool === 'pen' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-stone-400 hover:bg-stone-800'
                }`}
                title="Pen"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTool('marker')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tool === 'marker' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-stone-400 hover:bg-stone-800'
                }`}
                title="Marker (Thick line)"
              >
                Marker
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`p-2 rounded-md transition-colors ${
                  tool === 'eraser' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-stone-400 hover:bg-stone-800'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>

              <div className="h-5 w-px bg-stone-800 mx-1" />

              {/* Color swatches */}
              <div className="flex items-center gap-1">
                {[
                  { color: '#f8fafc', label: 'Ink White' },
                  { color: '#94a3b8', label: 'Stone Gray' },
                  { color: '#f59e0b', label: 'Parchment Gold' },
                  { color: '#ef4444', label: 'Blood Red' },
                  { color: '#38bdf8', label: 'Water Blue' },
                  { color: '#22c55e', label: 'Moss Green' },
                  { color: '#a855f7', label: 'Arcane Violet' },
                ].map((item) => (
                  <button
                    key={item.color}
                    onClick={() => {
                      setBrushColor(item.color);
                      if (tool === 'eraser') setTool('pen');
                    }}
                    style={{ backgroundColor: item.color }}
                    className={`w-5 h-5 rounded-full border transition-transform ${
                      brushColor === item.color && tool !== 'eraser'
                        ? 'scale-125 border-white ring-2 ring-amber-400/50'
                        : 'border-stone-700 opacity-80 hover:opacity-100'
                    }`}
                    title={item.label}
                  />
                ))}
              </div>

              {/* Brush size */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-[10px] text-stone-400">Size:</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-16 h-1 accent-amber-500 bg-stone-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Actions: Grid toggle, Undo, Clear, Upload, Samples */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-md transition-colors ${
                  showGrid ? 'bg-amber-500/20 text-amber-300' : 'text-stone-500 hover:text-stone-300'
                }`}
                title="Toggle Grid Overlay"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleUndo}
                className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-md"
                title="Undo Stroke"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="px-2 py-1 text-xs text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-md"
              >
                Clear
              </button>

              <label className="flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md cursor-pointer border border-stone-700">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo/Scan
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative rounded-xl overflow-hidden border border-stone-800 shadow-inner bg-stone-950 flex items-center justify-center">
            {/* Grid overlay for drafting */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #475569 1px, transparent 1px),
                    linear-gradient(to bottom, #475569 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                }}
              />
            )}

            <canvas
              ref={canvasRef}
              width={600}
              height={450}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full max-h-[460px] object-contain cursor-crosshair touch-none"
            />

            {/* Quick Sample Presets Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-sm p-1.5 rounded-lg border border-stone-800/80 text-[11px]">
              <span className="text-stone-500 font-mono pl-1">Load sketch:</span>
              <button
                onClick={() => loadSampleSketch('map')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded font-medium"
              >
                Crypt Map
              </button>
              <button
                onClick={() => loadSampleSketch('npc')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-cyan-300 rounded font-medium"
              >
                Elven Scout
              </button>
              <button
                onClick={() => loadSampleSketch('item')}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-rose-300 rounded font-medium"
              >
                Ember Blade
              </button>
            </div>
          </div>

          <p className="text-[11px] text-stone-500 italic">
            Tip: You can doodle boxes for rooms and lines for corridors, or draw a character silhouette with clothing/hair details. Gemini will extract layout, hazards, or character traits!
          </p>
        </div>

        {/* Right Column: GM Annotations & Forge Control */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-stone-950/50 p-4 rounded-xl border border-stone-800/80">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5 border-b border-stone-800 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Vision Prompt & Context
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                Your DM Notes / Room Labels
              </label>
              <textarea
                value={sketchNotes}
                onChange={(e) => setSketchNotes(e.target.value)}
                placeholder={
                  targetType === 'map'
                    ? 'e.g., Room 1 is flooded entrance, room 2 has a puzzle door, room 3 is the boss altar over an abyss...'
                    : targetType === 'npc'
                    ? 'e.g., Blindfolded elven scout with pet hawk, speaks in hushed tones, holding secret key...'
                    : 'e.g., Jagged greatsword of petrified brimstone that pulses with embers...'
                }
                rows={4}
                className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Tone & Atmosphere
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Dark Fantasy">Dark Fantasy</option>
                  <option value="High Fantasy">High Fantasy</option>
                  <option value="Gothic Horror">Gothic Horror</option>
                  <option value="Eldritch / Cosmic">Eldritch / Cosmic</option>
                  <option value="Steampunk / Arcane">Steampunk / Arcane</option>
                  <option value="Gritty Low-Magic">Gritty Low-Magic</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-400 mb-1">
                  Rules System
                </label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full text-xs bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="5e / Universal TTRPG">5e / Universal</option>
                  <option value="OSR / Shadowdark">OSR / Shadowdark</option>
                  <option value="Pathfinder 2e">Pathfinder 2e</option>
                  <option value="System Agnostic">System Agnostic</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Forge Button */}
          <div className="pt-2">
            <button
              onClick={handleForge}
              disabled={isForging}
              className={`w-full py-3.5 px-4 rounded-xl font-bold font-serif text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isForging
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 shadow-amber-900/30 hover:shadow-amber-900/50'
              }`}
            >
              {isForging ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Sketch & Forging Asset...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Forge into{' '}
                    {targetType === 'map'
                      ? 'Tactical Battlemap'
                      : targetType === 'npc'
                      ? 'Playable NPC & Statblock'
                      : 'Magic Item'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Latest Result Banner */}
      {latestResult && (
        <div className="mt-6 p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider font-mono text-amber-400 font-bold">
                  Successfully Forged {latestResult.type.toUpperCase()}:
                </span>
                <h4 className="text-base font-bold text-stone-100 font-serif">
                  {latestResult.data.name || 'Unnamed Asset'}
                </h4>
                <p className="text-xs text-stone-400">
                  {latestResult.type === 'map'
                    ? `${latestResult.data.rooms?.length || 0} distinct chambers identified from your sketch.`
                    : latestResult.type === 'npc'
                    ? `${latestResult.data.race} ${latestResult.data.classOrRole} (CR ${latestResult.data.stats?.cr || '3'})`
                    : `${latestResult.data.rarity} ${latestResult.data.type}`}
                </p>
              </div>
            </div>

            {latestResult.type === 'npc' && onSendToTokenStudio && (
              <button
                onClick={() => onSendToTokenStudio(latestResult.data)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Make VTT Token
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
