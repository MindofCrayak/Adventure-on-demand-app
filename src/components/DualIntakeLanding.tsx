import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Paperclip, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Dice5, 
  Send 
} from 'lucide-react';
import { AdventureSeed, SupportedRuleset, AdventureStructure } from '../types/ttrpg';

interface DualIntakeProps {
  onInitializeAdventure: (seed: AdventureSeed) => void;
  isProcessing: boolean;
}

export const DualIntakeLanding: React.FC<DualIntakeProps> = ({
  onInitializeAdventure,
  isProcessing
}) => {
  const [pitch, setPitch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Form State
  const [system, setSystem] = useState<SupportedRuleset>('dnd-5.5e');
  const [structure, setStructure] = useState<AdventureStructure>('procedural-mystery');
  const [duration, setDuration] = useState(3);
  const [partyLevel, setPartyLevel] = useState(3);
  const [partySize, setPartySize] = useState(4);
  const [rating, setRating] = useState<'teen' | 'mature'>('teen');
  
  // Structured Seeds
  const [eventSeed, setEventSeed] = useState('');
  const [victimSeed, setVictimSeed] = useState('');
  const [suspectSeed, setSuspectSeed] = useState('');
  const [locationsSeed, setLocationsSeed] = useState('');

  // Speech Recognition
  const toggleSpeech = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPitch((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;
    onInitializeAdventure({
      title: pitch.slice(0, 36) || 'Untitled Adventure',
      pitch,
      system,
      structure,
      durationHours: duration,
      partyLevel,
      partySize,
      rating,
      eventSeed,
      victimSeed,
      suspectSeed,
      locationsSeed
    });
  };

  const handleRandomSpark = () => {
    const sparks = [
      "A high-ranking inquisitor is found dead inside a locked cathedral vault during the autumn solstice.",
      "The guildmaster of the sky-docks was pushed off his airship; 3 dock lieutenants each hold a forged will.",
      "A subterranean crypt spring is flowing with black venom, threatening the settlement's water supply.",
      "A wealthy neonate vampire turns to ash at a mortal high-society masquerade ball."
    ];
    setPitch(sparks[Math.floor(Math.random() * sparks.length)]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Adventure On Demand • Tactical Co-Pilot</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-100 tracking-tight">
          Turn Napkin Scribbles & Sparks Into Playable Sessions
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto leading-relaxed">
          Produce modular mystery dossiers, tactical multi-layer battlemaps, and VTT handouts ready for Roll20 and physical tables.
        </p>
      </div>

      {/* Pathway A: The Rapid Pitch Bar */}
      <form onSubmit={handleSimpleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 shadow-2xl space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            placeholder="What's your pitch? (e.g., Murder at the airship docks, 5.5e, 3 hours)..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl py-3 pl-4 pr-32 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSpeech}
              className={`p-2 rounded-lg transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleRandomSpark}
              className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors"
              title="Random Prompt Spark"
            >
              <Dice5 className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isProcessing || !pitch.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 rounded-lg font-bold transition-transform active:scale-95 shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick-Pill Selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-500 font-mono">System:</span>
            {(['dnd-5.5e', 'pf2e', 'fate', 'kids-on-bikes', 'vampire-v5'] as SupportedRuleset[]).map((sys) => (
              <button
                key={sys}
                type="button"
                onClick={() => setSystem(sys)}
                className={`px-2 py-0.5 rounded-full border transition-colors ${
                  system === sys 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                {sys.replace('-', ' ').toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-stone-500 font-mono">{duration}h Session • Tier {partyLevel}</span>
        </div>
      </form>

      {/* Pathway B: Expandable Structured Intake Accordion */}
      <div className="border border-stone-850 rounded-2xl bg-stone-900/60 overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-stone-300 hover:text-amber-300 transition-colors bg-stone-950/40"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Have strict plans or homebrew notes? Open Detailed Intake</span>
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-5 space-y-4 border-t border-stone-800 text-xs text-stone-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Game System</label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value as SupportedRuleset)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="dnd-5.5e">D&D 5.5e (2024 Revision)</option>
                  <option value="pf2e">Pathfinder 2e</option>
                  <option value="fate">FATE Core / Condensed</option>
                  <option value="kids-on-bikes">Kids on Bikes</option>
                  <option value="vampire-v5">Vampire: The Masquerade (V5)</option>
                  <option value="cofd">Chronicles of Darkness</option>
                  <option value="tales-from-the-loop">Tales from the Loop</option>
                  <option value="fallout-2d20">Fallout 2d20</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Archetype Framework</label>
                <select
                  value={structure}
                  onChange={(e) => setStructure(e.target.value as AdventureStructure)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="procedural-mystery">Procedural Mystery (5 Locations)</option>
                  <option value="heist-infiltration">Heist / Infiltration Mission</option>
                  <option value="dungeon-delve">Tactical Dungeon Descent</option>
                  <option value="survival-hex">Wilderness / Ruins Survival</option>
                  <option value="siege-defense">Holdout / Siege Defense</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Content Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="teen">Teen (14+) - Balanced Fantasy</option>
                  <option value="mature">Mature - Carnage, Horror & Gritty Violence</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">The Event / Inciting Incident (Optional)</label>
                <input
                  type="text"
                  value={eventSeed}
                  onChange={(e) => setEventSeed(e.target.value)}
                  placeholder="e.g. Theft of the Sun Relic from the High Scribe"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">The Victim / Client (Optional)</label>
                <input
                  type="text"
                  value={victimSeed}
                  onChange={(e) => setVictimSeed(e.target.value)}
                  placeholder="e.g. High Priest Raymond, found comatose"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Suspects or Factions (Optional)</label>
                <input
                  type="text"
                  value={suspectSeed}
                  onChange={(e) => setSuspectSeed(e.target.value)}
                  placeholder="e.g. The Mayor, The Smuggler Quartermaster, The Exiled Acolyte"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Key Locations or Routing Ideas (Optional)</label>
                <input
                  type="text"
                  value={locationsSeed}
                  onChange={(e) => setLocationsSeed(e.target.value)}
                  placeholder="e.g. Clocktower, Bell Foundry, Drained Aqueduct"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSimpleSubmit}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Compile Adventure Blueprint</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
