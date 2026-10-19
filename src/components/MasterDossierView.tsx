import React, { useState } from 'react';
import { MasterDossier, SupportedRuleset, AdventureSeed, NPC } from '../types/ttrpg';
import { 
  Scroll, 
  User, 
  MapPin, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ChevronRight, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

interface MasterDossierViewProps {
  dossier: MasterDossier;
  system: SupportedRuleset;
  rating: 'teen' | 'mature';
  durationHours: number;
  onSelectNode: (locationNumber: number) => void;
  onSendSuspectToNPCWorkshop?: (suspect: { name: string; alias: string; motive: string }) => void;
}

export const MasterDossierView: React.FC<MasterDossierViewProps> = ({
  dossier,
  system,
  rating,
  durationHours,
  onSelectNode,
  onSendSuspectToNPCWorkshop,
}) => {
  const [showCulpritSpoiler, setShowCulpritSpoiler] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Artifact Tag & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
            &lt;artifact type="Dossier"&gt;
          </span>
          <span className="text-xs text-stone-400 font-mono">
            Episodic Mystery Blueprint • 5-Location Routing
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
            {system.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-amber-300">
            {durationHours}h Session
          </span>
          <span className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
            rating === 'mature' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
          }`}>
            {rating}
          </span>
        </div>
      </div>

      {/* Primary Case Briefing Grid: Event & Victim */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The Event / Inciting Incident */}
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>The Event (Inciting Crime)</span>
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-100">
            {dossier.event.title}
          </h3>
          <p className="text-xs text-stone-300 leading-relaxed font-serif">
            {dossier.event.summary}
          </p>
        </div>

        {/* The Victim / Targeted Entity */}
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-rose-400">
            <User className="w-4 h-4" />
            <span>The Victim / Quest Client</span>
          </div>
          <h3 className="text-lg font-bold font-serif text-stone-100">
            {dossier.victim.name}
          </h3>
          <p className="text-xs text-stone-400 font-mono">
            Role: <span className="text-stone-200">{dossier.victim.role}</span>
          </p>
          <p className="text-xs text-stone-300 leading-relaxed">
            Connection: {dossier.victim.connection}
          </p>
        </div>
      </div>

      {/* Secret Culprit & GM Motive (Hidden Behind Toggle) */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Game Master Secret: True Perpetrator & Motive</span>
          </div>
          <button
            onClick={() => setShowCulpritSpoiler(!showCulpritSpoiler)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-[11px] font-mono text-stone-300 border border-stone-700 transition-colors"
          >
            {showCulpritSpoiler ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showCulpritSpoiler ? 'Hide Secret' : 'Reveal True Culprit'}</span>
          </button>
        </div>

        {showCulpritSpoiler ? (
          <div className="p-3 bg-purple-950/40 border border-purple-900/60 rounded-lg text-xs space-y-1 animate-in fade-in">
            <div className="font-bold text-purple-200">
              True Culprit: <span className="text-amber-300">{dossier.perpetrator.alias}</span> (Revealed at Location {dossier.perpetrator.revealedAtLocation})
            </div>
            <p className="text-stone-300 leading-relaxed">
              Secret Motive: {dossier.perpetrator.secretMotive}
            </p>
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">
            Culprit identity is concealed to prevent GM spoilers. Click reveal to view true identity, hidden motive, and revelation trigger.
          </p>
        )}
      </div>

      {/* 3 Ambiguous Suspects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>3 Ambiguous Suspects (Means, Opportunity, Motive)</span>
          </h3>
          <span className="text-[11px] text-stone-400 font-mono">All 3 possess apparent motives</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dossier.suspects.map((suspect, idx) => (
            <div
              key={idx}
              className="p-4 bg-stone-900 border border-stone-800 rounded-xl space-y-2 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-amber-200 font-serif">
                    {suspect.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800">
                    Suspect #{idx + 1}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-purple-300">
                  Alias: {suspect.alias}
                </div>

                <div className="text-xs space-y-1 pt-1 border-t border-stone-800">
                  <div>
                    <span className="text-stone-500 font-mono text-[10px] uppercase block">Plausible Motive:</span>
                    <span className="text-stone-300">{suspect.motive}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-mono text-[10px] uppercase block">Claimed Alibi:</span>
                    <span className="text-stone-400 italic">"{suspect.alibi}"</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-mono text-[10px] uppercase block">Apparent Guilt:</span>
                    <span className="text-amber-400 text-[11px] font-medium">{suspect.apparentGuilt}</span>
                  </div>
                </div>
              </div>

              {onSendSuspectToNPCWorkshop && (
                <button
                  onClick={() => onSendSuspectToNPCWorkshop(suspect)}
                  className="w-full mt-2 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Build Statblock / Token</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5-Location Investigation Routing */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-stone-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>5-Location Investigation Routing Flow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {dossier.routing.map((route) => (
            <div
              key={route.step}
              onClick={() => onSelectNode(route.locationNumber)}
              className="p-3 bg-stone-900 border border-stone-800 hover:border-amber-500/80 rounded-xl cursor-pointer transition-all hover:bg-stone-850 flex flex-col justify-between space-y-2 group shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    STEP {route.step}
                  </span>
                  <span className="text-stone-500">Loc #{route.locationNumber}</span>
                </div>
                <h4 className="text-xs font-bold text-stone-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {route.name}
                </h4>
                <p className="text-[11px] text-stone-400 mt-1 line-clamp-3">
                  {route.goal}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] text-amber-400 font-mono">
                <span>Inspect Node</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
