import React, { useState, useRef, useEffect } from 'react';
import {
  AdventureMap,
  RoomData,
} from '../types/ttrpg';
import {
  Eye,
  EyeOff,
  Grid,
  Download,
  ShieldAlert,
  Skull,
  Coins,
  Compass,
  Layers,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { downloadDataUrl } from '../utils/exportBundle';

interface BattlemapViewerProps {
  map: AdventureMap;
  onUpdateMap?: (updatedMap: AdventureMap) => void;
}

export const BattlemapViewer: React.FC<BattlemapViewerProps> = ({ map, onUpdateMap }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(
    map.rooms && map.rooms.length > 0 ? map.rooms[0] : null
  );
  const [showFogOfWar, setShowFogOfWar] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gridSize = 28; // pixels per grid square
  const canvasWidth = Math.max(map.width * gridSize, 560);
  const canvasHeight = Math.max(map.height * gridSize, 480);

  // Redraw procedural tactical battlemap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 1. Background Void / Rock Unexcavated
    ctx.fillStyle = map.environment === 'crypt' ? '#0f172a' : map.environment === 'cave' ? '#1c1917' : '#18181b';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Subtle stone texture
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      const rx = Math.random() * canvasWidth;
      const ry = Math.random() * canvasHeight;
      const rw = Math.random() * 8 + 2;
      ctx.fillRect(rx, ry, rw, rw);
    }

    // 2. Draw Rooms & Corridors
    map.rooms.forEach((room) => {
      const rx = room.x * gridSize;
      const ry = room.y * gridSize;
      const rw = room.w * gridSize;
      const rh = room.h * gridSize;

      const isSelected = selectedRoom?.id === room.id;
      const isHovered = hoveredRoomId === room.id;

      // Floor fill
      ctx.fillStyle = map.environment === 'crypt'
        ? (isSelected ? '#1e293b' : '#131e32')
        : (isSelected ? '#292524' : '#1f1e1d');
      ctx.fillRect(rx, ry, rw, rh);

      // Floor grid within room
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let gx = rx; gx <= rx + rw; gx += gridSize) {
          ctx.beginPath();
          ctx.moveTo(gx, ry);
          ctx.lineTo(gx, ry + rh);
          ctx.stroke();
        }
        for (let gy = ry; gy <= ry + rh; gy += gridSize) {
          ctx.beginPath();
          ctx.moveTo(rx, gy);
          ctx.lineTo(rx + rw, gy);
          ctx.stroke();
        }
      }

      // Walls / Border
      ctx.strokeStyle = isSelected
        ? '#f59e0b'
        : isHovered
        ? '#e2e8f0'
        : '#64748b';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(rx, ry, rw, rh);

      // Room Number Marker / Token
      const centerX = rx + rw / 2;
      const centerY = ry + rh / 2;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#f59e0b' : '#334155';
      ctx.fill();
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#18181b' : '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(room.number), centerX, centerY);
      ctx.restore();

      // Room Name Label
      ctx.fillStyle = isSelected ? '#fef08a' : '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, centerX, centerY + 25);
    });

    // 3. Fog of war mask if enabled
    if (showFogOfWar && selectedRoom) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Clear illuminated circle for selected room
      const srx = selectedRoom.x * gridSize;
      const sry = selectedRoom.y * gridSize;
      const srw = selectedRoom.w * gridSize;
      const srh = selectedRoom.h * gridSize;
      const scx = srx + srw / 2;
      const scy = sry + srh / 2;
      const radius = Math.max(srw, srh) * 0.8;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(scx, scy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [map, selectedRoom, hoveredRoomId, showFogOfWar, showGrid]);

  // Click canvas to select room
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check which room was clicked
    for (const room of map.rooms) {
      const rx = room.x * gridSize;
      const ry = room.y * gridSize;
      const rw = room.w * gridSize;
      const rh = room.h * gridSize;
      if (clickX >= rx && clickX <= rx + rw && clickY >= ry && clickY <= ry + rh) {
        setSelectedRoom(room);
        return;
      }
    }
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    downloadDataUrl(dataUrl, `${map.name.toLowerCase().replace(/\s+/g, '_')}_battlemap.png`);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-2xl text-stone-100">
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold font-serif text-stone-100">
                {map.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                <span className="uppercase tracking-wider font-mono text-emerald-400 font-medium">
                  {map.environment}
                </span>
                <span>•</span>
                <span>{map.width}x{map.height} Grid Squares (5ft scale)</span>
                <span>•</span>
                <span>{map.rooms.length} Defined Tactical Areas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showGrid
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
            title="Toggle Grid (5ft)"
          >
            <Grid className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setShowFogOfWar(!showFogOfWar)}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              showFogOfWar
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
            title="Toggle Fog of War (Player view simulation)"
          >
            {showFogOfWar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Fog of War
          </button>
          <button
            onClick={handleExportPNG}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Export Map PNG
          </button>
        </div>
      </div>

      {/* Main Grid: Tactical Canvas + Room Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Battlemap Canvas Viewport */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative bg-stone-950 rounded-xl border border-stone-800 overflow-hidden shadow-inner flex items-center justify-center p-2">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-h-[480px] w-full object-contain cursor-pointer rounded-lg"
            />

            {/* Quick room selector pills overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 overflow-x-auto bg-stone-950/80 backdrop-blur-md p-1.5 rounded-lg border border-stone-800/80">
              <span className="text-[11px] font-mono text-stone-500 pl-1">Rooms:</span>
              {map.rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r)}
                  onMouseEnter={() => setHoveredRoomId(r.id)}
                  onMouseLeave={() => setHoveredRoomId(null)}
                  className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors flex items-center gap-1 ${
                    selectedRoom?.id === r.id
                      ? 'bg-amber-500 text-stone-950 font-bold shadow'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-stone-800 text-stone-200 text-[10px] flex items-center justify-center font-bold">
                    {r.number}
                  </span>
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Environmental Sensory Bar */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950/60 p-3 rounded-lg border border-stone-800">
            <div>
              <span className="text-stone-400 font-medium block">Lighting:</span>
              <span className="text-stone-200">{map.ambientLighting}</span>
            </div>
            <div>
              <span className="text-stone-400 font-medium block">Environmental Hazards:</span>
              <span className="text-rose-300">{map.hazards}</span>
            </div>
          </div>
        </div>

        {/* Room Inspector & GM Tactical Notes */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {selectedRoom ? (
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center">
                    {selectedRoom.number}
                  </span>
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-100">
                      {selectedRoom.name}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-400">
                      Dimensions: {selectedRoom.w} x {selectedRoom.h} squares ({(selectedRoom.w * 5)}ft x {(selectedRoom.h * 5)}ft)
                    </span>
                  </div>
                </div>
              </div>

              {/* Read Aloud Box */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-mono text-amber-400 font-bold block mb-1">
                  GM Read Aloud (To Players)
                </span>
                <blockquote className="p-3 bg-stone-900/90 border-l-2 border-amber-500 rounded-r-lg text-xs italic text-stone-300 leading-relaxed font-serif">
                  "{selectedRoom.description}"
                </blockquote>
              </div>

              {/* Room Features */}
              {selectedRoom.features && selectedRoom.features.length > 0 && (
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-stone-400 font-bold block mb-1">
                    Notable Features & Traps
                  </span>
                  <ul className="text-xs space-y-1 text-stone-300">
                    {selectedRoom.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Adversaries & Encounters */}
              {selectedRoom.monsters && (
                <div className="p-3 bg-red-950/30 border border-red-900/40 rounded-lg">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-1">
                    <Skull className="w-3.5 h-3.5" />
                    <span>Adversaries / Guardians</span>
                  </div>
                  <p className="text-xs text-red-200">{selectedRoom.monsters}</p>
                </div>
              )}

              {/* Treasure & Loot */}
              {selectedRoom.treasure && (
                <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Treasure / Hidden Lore</span>
                  </div>
                  <p className="text-xs text-amber-200">{selectedRoom.treasure}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-stone-950 rounded-xl border border-stone-800 text-center text-stone-400 text-xs">
              Click any numbered room on the tactical map to inspect descriptions, monsters, and traps.
            </div>
          )}

          {/* Tactical GM Notes */}
          <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800/80 text-xs">
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider font-mono block mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Tactical DM Recommendations
            </span>
            <p className="text-stone-400 leading-relaxed">
              {map.tacticalNotes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
