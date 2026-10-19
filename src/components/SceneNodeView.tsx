import React, { useState } from 'react';
import { SceneNode, SupportedRuleset, SceneClue, SceneWitness } from '../types/ttrpg';
import { 
  ShieldAlert, 
  Search, 
  MessageSquare, 
  AlertOctagon, 
  Map as MapIcon, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  Key, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface SceneNodeViewProps {
  nodes: SceneNode[];
  activeLocationNumber: number;
  onSelectLocationNumber: (num: number) => void;
  system: SupportedRuleset;
  onJumpToTacticalMap?: (locationNumber: number, locationName: string) => void;
}

export const SceneNodeView: React.FC<SceneNodeViewProps> = ({
  nodes,
  activeLocationNumber,
  onSelectLocationNumber,
  system,
  onJumpToTacticalMap,
}) => {
  const currentNode = nodes.find((n) => n.locationNumber === activeLocationNumber) || nodes[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 5-Location Tab Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-800">
        {[1, 2, 3, 4, 5].map((locNum) => {
          const node = nodes.find((n) => n.locationNumber === locNum);
          const isActive = activeLocationNumber === locNum;
          return (
            <button
              key={locNum}
              onClick={() => onSelectLocationNumber(locNum)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-md'
                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-850'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-stone-950/60 text-[10px] flex items-center justify-center font-bold">
                {locNum}
              </span>
              <span>{node?.name || `Location ${locNum}`}</span>
            </button>
          );
        })}
      </div>

      {currentNode ? (
        <div className="space-y-6">
          {/* Node Header & Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-850 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
                  &lt;artifact id="node-{currentNode.locationNumber}" type="SceneNode"&gt;
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Location #{currentNode.locationNumber} • {system.toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-stone-100 mt-1">
                {currentNode.name}
              </h2>
            </div>

            {onJumpToTacticalMap && (
              <button
                onClick={() => onJumpToTacticalMap(currentNode.locationNumber, currentNode.name)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-100 text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
              >
                <MapIcon className="w-4 h-4" />
                <span>Open Tactical Battlemap</span>
              </button>
            )}
          </div>

          {/* Read-Aloud Sensory Box {{descriptive ...}} */}
          <div className="p-4 rounded-xl bg-stone-900/95 border-l-4 border-amber-500 border-stone-800 shadow-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
              <Volume2 className="w-4 h-4" />
              <span>Read-Aloud Sensory Prose (Speak to Players)</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 font-serif italic leading-relaxed pl-1">
              "{currentNode.readAloud}"
            </p>
          </div>

          {/* Game Master Secret Notes {{note ...}} */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-purple-400">
              <Key className="w-4 h-4" />
              <span>Game Master Secrets, Tactics & Hidden Targets</span>
            </div>
            <p className="text-xs text-stone-300 font-mono leading-relaxed">
              {currentNode.gmNotes}
            </p>
          </div>

          {/* 5 Clues Discovery Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                <span>5 Clues & Discoveries Matrix</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                Physical, Forensic, Document, Arcane
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-900 border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Clue</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Check Required</th>
                    <th className="py-2.5 px-3">DC</th>
                    <th className="py-2.5 px-3">Revelation / Meaning</th>
                    <th className="py-2.5 px-3">Lead Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850">
                  {currentNode.clues.map((clue) => (
                    <tr key={clue.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-stone-200">
                        {clue.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] uppercase text-stone-400">
                        {clue.type}
                      </td>
                      <td className="py-2.5 px-3 text-stone-300 font-mono">
                        {clue.checkRequired}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">
                        DC {clue.dc}
                      </td>
                      <td className="py-2.5 px-3 text-stone-300">
                        {clue.revelation}
                      </td>
                      <td className="py-2.5 px-3">
                        {clue.isFalseLead ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            FALSE LEAD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            TRUE CLUE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Witnesses & Celebrity Speech Cadences */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Witnesses & Instant Voice Roleplay Cadences</span>
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">
                {currentNode.witnesses.length} Interrogable Witnesses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentNode.witnesses.map((w, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2 shadow-lg"
                >
                  <div className="border-b border-stone-800 pb-2">
                    <h4 className="font-bold text-sm text-stone-100 font-serif">
                      {w.name}
                    </h4>
                    <span className="text-[11px] font-mono text-stone-400">
                      {w.role}
                    </span>
                  </div>

                  {/* Sounds Like Comparison Box */}
                  <div className="p-2 bg-stone-950 border border-amber-900/40 rounded-lg">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block mb-0.5">
                      Sounds Like:
                    </span>
                    <p className="text-xs text-amber-200 font-serif italic">
                      "{w.soundsLike}"
                    </p>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <div>
                      <span className="text-[10px] font-mono text-stone-500 uppercase block">Public Statement:</span>
                      <p className="text-stone-300 italic">"{w.statement}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase block">Insight Secret:</span>
                      <p className="text-purple-300">{w.hiddenSecret}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Hazards */}
          {currentNode.hazardsOrTraps && currentNode.hazardsOrTraps.length > 0 && (
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-red-400 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>Location Hazards & Traps</span>
              </span>
              <ul className="text-xs text-red-200 space-y-1 list-disc list-inside">
                {currentNode.hazardsOrTraps.map((hz, idx) => (
                  <li key={idx}>{hz}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-stone-500">
          No Scene Node selected.
        </div>
      )}
    </div>
  );
};
