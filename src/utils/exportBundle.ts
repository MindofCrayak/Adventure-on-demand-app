import JSZip from 'jszip';
import { Campaign, NPC, AdventureMap, Handout } from '../types/ttrpg';
import { renderTokenToCanvas } from './tokenRenderer';
import { generateCharacterAvatar } from './avatarGenerator';

export async function downloadCampaignZip(campaign: Campaign): Promise<void> {
  const zip = new JSZip();

  // 1. Master Guide Markdown Document
  const guideMarkdown = generateCampaignMarkdown(campaign);
  zip.file(`${sanitizeFilename(campaign.title)}_Master_Guide.md`, guideMarkdown);

  // 2. Campaign JSON Backup
  zip.file('campaign_data.json', JSON.stringify(campaign, null, 2));

  // 3. Tokens Folder
  const tokensFolder = zip.folder('vtt_tokens');
  if (tokensFolder) {
    const canvas = document.createElement('canvas');
    for (const npc of campaign.npcs) {
      const avatarSrc = npc.avatarUrl || npc.sketchImage || generateCharacterAvatar(npc.name, npc.race, npc.classOrRole, npc.tier);
      try {
        const tokenDataUrl = await renderTokenToCanvas(canvas, avatarSrc, npc.tokenStyling || {
          borderColor: npc.tier === 'main' ? '#ef4444' : '#eab308',
          borderStyle: npc.tier === 'main' ? 'ornate' : 'minimal',
          badgeText: npc.tier === 'main' ? `CR ${npc.stats.cr || '4'}` : 'NPC',
        }, 512);

        const base64Data = tokenDataUrl.split(',')[1];
        if (base64Data) {
          tokensFolder.file(`${sanitizeFilename(npc.name)}_token.png`, base64Data, { base64: true });
        }
      } catch (err) {
        console.error(`Failed to generate token for ${npc.name}:`, err);
      }
    }
  }

  // 4. Handouts Folder
  const handoutsFolder = zip.folder('player_handouts');
  if (handoutsFolder) {
    for (const handout of campaign.handouts) {
      const text = `# ${handout.title}
*Author: ${handout.author}* | *Recipient: ${handout.recipient}*
---

${handout.textContent}
`;
      handoutsFolder.file(`${sanitizeFilename(handout.title)}.md`, text);
    }
  }

  // 5. Maps Folder
  const mapsFolder = zip.folder('maps');
  if (mapsFolder) {
    for (const map of campaign.maps) {
      const mapMarkdown = `# ${map.name}
**Environment:** ${map.environment} | **Grid Dimensions:** ${map.width}x${map.height} (5ft scale)
**Ambient Lighting:** ${map.ambientLighting}
**Environmental Hazards:** ${map.hazards}
**Tactical GM Notes:** ${map.tacticalNotes}

## Sensory Description (Read Aloud)
> "${map.description}"

## Key Rooms & Encounters
${map.rooms
  .map(
    (r) => `### Room ${r.number}: ${r.name} (${r.w}x${r.h} squares)
- **Description:** ${r.description}
- **Features:** ${r.features.join(', ')}
${r.monsters ? `- **Adversaries:** ${r.monsters}` : ''}
${r.treasure ? `- **Treasure/Loot:** ${r.treasure}` : ''}
`
  )
  .join('\n')}
`;
      mapsFolder.file(`${sanitizeFilename(map.name)}_tactical_guide.md`, mapMarkdown);
    }
  }

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerFileDownload(blob, `${sanitizeFilename(campaign.title)}_Campaign_Module.zip`);
}

export function downloadSingleFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  triggerFileDownload(blob, filename);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function triggerFileDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').toLowerCase();
}

export function generateCampaignMarkdown(campaign: Campaign): string {
  return `# ${campaign.title}
*A ${campaign.sessionCount}-Session Adventure Arc for Level ${campaign.partyLevel} Characters*
**Tone:** ${campaign.tone} | **Setting:** ${campaign.setting}
**Session Duration:** ~${campaign.sessionLengthHours} Hours per session | **Target Party Size:** ${campaign.partySize} Players

---

## Campaign Synopsis & Central Conflict
${campaign.synopsis}

---

## Session-by-Session Master Breakdown

${campaign.sessions
  .map(
    (s) => `### Session ${s.sessionNumber}: ${s.title}
*Planned Duration: ${s.duration}*
${s.pacingSummary ? `**Pacing Strategy:** ${s.pacingSummary}\n` : ''}
#### Beat Sheet & Timeline
${s.timeline.map((t) => `- **[${t.timestamp}] [${t.phase.toUpperCase()}] ${t.title}:** ${t.description}`).join('\n')}

#### Key Encounters
${s.encounters.map((e) => `- **${e.name}** (${e.type.toUpperCase()} - ${e.difficulty}): ${e.summary}`).join('\n')}

#### Key Objectives
${s.keyObjectives.map((o) => `- [ ] ${o}`).join('\n')}

${s.loot ? `**Session Rewards & Loot:** ${s.loot}\n` : ''}
---
`
  )
  .join('\n')}

## Dramatis Personae (NPCs & Adversaries)

${campaign.npcs
  .map(
    (n) => `### ${n.name} (${n.title})
*${n.race} ${n.classOrRole} — Tier: ${n.tier.toUpperCase()}${n.promotedFromSide ? ' (PROMOTED AWAKENED NPC)' : ''}*

**Armor Class:** ${n.stats.ac} | **Hit Points:** ${n.stats.hp} (${n.stats.maxHp}) | **Speed:** ${n.stats.speed} | **CR:** ${n.stats.cr || 'N/A'}
**STR:** ${n.stats.str} | **DEX:** ${n.stats.dex} | **CON:** ${n.stats.con} | **INT:** ${n.stats.int} | **WIS:** ${n.stats.wis} | **CHA:** ${n.stats.cha}
${n.stats.saves ? `**Saves:** ${n.stats.saves} | ` : ''}${n.stats.skills ? `**Skills:** ${n.stats.skills}` : ''}

#### Roleplay & Lore
- **Appearance:** ${n.flavor.appearance}
- **Voice/Mannerism:** ${n.flavor.voiceMannerism}
- **Quirk/Flaw:** ${n.flavor.flawOrQuirk}
- **Secret Motivation:** ${n.flavor.secretMotivation}
- **Plot Hook:** ${n.flavor.plotHook}
${n.promotionLore ? `\n> **True Awakening Lore:** ${n.promotionLore}\n` : ''}

#### Actions & Combat Traits
${n.combatAbilities.map((a) => `- **${a.name} [${a.type}]:** ${a.description}`).join('\n')}
`
  )
  .join('\n---\n\n')}

## Tactical Locations & Maps

${campaign.maps
  .map(
    (m) => `### ${m.name}
*Environment:* ${m.environment} | *Scale:* ${m.width}x${m.height} grid
*Lighting:* ${m.ambientLighting} | *Hazards:* ${m.hazards}
*Tactical Notes:* ${m.tacticalNotes}

> "${m.description}"

${m.rooms.map((r) => `#### Area ${r.number}: ${r.name}
${r.description}
- Features: ${r.features.join(', ')}
${r.monsters ? `- Monsters: ${r.monsters}` : ''}
${r.treasure ? `- Treasure: ${r.treasure}` : ''}`).join('\n\n')}
`
  )
  .join('\n---\n\n')}

## Player Handouts

${campaign.handouts
  .map(
    (h) => `### Handout: ${h.title} (Session ${h.sessionNumber || 1})
*Author:* ${h.author} | *Recipient:* ${h.recipient}

\`\`\`
${h.textContent}
\`\`\`
`
  )
  .join('\n')}

## Secrets & DM Clues

${campaign.secrets
  .map(
    (sec) => `- **[${sec.secretLevel}] ${sec.title}:** ${sec.description}
  *Discovery:* ${sec.discoveryMethod}
  *Impact:* ${sec.revelationImpact}`
  )
  .join('\n\n')}
`;
}
