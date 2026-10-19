import { UVTTData, AdventureMap, NPC, Handout } from '../types/ttrpg';

/**
 * OPTION A: Build Universal VTT (.uvtt / .dd2vtt) data structure
 * Accepted by Roll20 Pro via the UniversalVTTImporter script, Foundry VTT, and Arkenforge.
 */
export function buildUVTTExport(map: AdventureMap, base64Image?: string): UVTTData {
  const pps = 70; // 70px per grid square baseline
  const losLines: Array<Array<{ x: number; y: number }>> = [];
  const portals: any[] = [];
  const lights: any[] = [];

  // Generate sight-blocking perimeter walls from room definitions
  map.rooms.forEach((room) => {
    const x1 = room.x;
    const y1 = room.y;
    const x2 = room.x + room.w;
    const y2 = room.y + room.h;

    // Wall loop
    losLines.push([
      { x: x1, y: y1 },
      { x: x2, y: y1 },
      { x: x2, y: y2 },
      { x: x1, y: y2 },
      { x: x1, y: y1 },
    ]);

    // Simulated central chamber torchlight
    lights.push({
      position: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
      range: 4,
      color: '#f59e0b',
      intensity: 0.85,
    });
  });

  return {
    format: 0.2,
    resolution: {
      map_size: { x: map.width, y: map.height },
      pixels_per_grid: pps,
    },
    line_of_sight: losLines,
    portals,
    lights,
  };
}

/**
 * OPTION A: Generate Roll20 1-Click API Chat Macros for Pro GMs
 */
export function generateRoll20ApiMacro(npc: NPC): string {
  return `!create-character --name "${npc.name}" --bio "${npc.flavor.appearance} | Speaks like: ${npc.flavor.voiceMannerism}" --avatar "${npc.avatarUrl || ''}" --hp ${npc.stats.hp} --maxhp ${npc.stats.maxHp} --ac ${npc.stats.ac}`;
}

/**
 * OPTION B: Generate Exact Roll20 Page Setup Specifications
 * Perfect for DMs dragging map PNGs directly onto the map layer.
 */
export function generateRoll20PageSpecs(map: AdventureMap) {
  const widthPx = map.width * 70;
  const heightPx = map.height * 70;
  const widthHDPx = map.width * 140;
  const heightHDPx = map.height * 140;

  return {
    gridSquares: `${map.width} x ${map.height} squares (5ft scale)`,
    roll20StandardPx: `${widthPx}px x ${heightPx}px (at 70px/grid)`,
    roll20HDPx: `${widthHDPx}px x ${heightHDPx}px (at 140px/grid)`,
    cellScale: '1.0 (70px per unit)',
    suggestedBackgroundColor: '#18181b',
    setupSteps: [
      `1. In Roll20, create a new page and open Page Settings.`,
      `2. Set Page Dimensions to Width = ${map.width} units, Height = ${map.height} units.`,
      `3. Set Background Color to #18181b and Grid Cell Size to 1.0 (70px).`,
      `4. Switch to the 'Map & Background' layer and drag the downloaded map image onto the canvas.`,
      `5. Right click the image -> Advanced -> Set Dimensions -> Choose Pixels -> Enter ${widthPx}w x ${heightPx}h.`
    ]
  };
}

/**
 * OPTION B: Formatted Plaintext Markdown for Roll20 Journal Tabs
 * Separates player-facing text from GM private secrets.
 */
export function formatRoll20JournalEntry(handout: Handout): { inPlayerBio: string; inGMNotes: string } {
  return {
    inPlayerBio: `### ${handout.title}\n*Author: ${handout.author}*\n*Recipient: ${handout.recipient}*\n\n> "${handout.textContent}"`,
    inGMNotes: `**DM Clue / Forensic Verification Notes:**\n- Authentic hand-written document.\n- Handout theme: ${handout.visualTheme}.\n- Reveals connections to suspect alibis when cross-examined.`
  };
}
