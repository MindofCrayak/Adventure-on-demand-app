import React, { useState } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Paperclip, 
  Settings2, 
  Send, 
  PlusCircle, 
  Flame, 
  ShieldCheck 
} from 'lucide-react';

interface ConsultationDockProps {
  suggestionChips: string[];
  onSelectChip: (chip: string) => void;
  onSubmitMessage: (msg: string) => void;
  onUploadSketch: (file: File) => void;
  onOpenParameters: () => void;
  isGenerating: boolean;
}

export const BottomConsultationDock: React.FC<ConsultationDockProps> = ({
  suggestionChips,
  onSelectChip,
  onSubmitMessage,
  onUploadSketch,
  onOpenParameters,
  isGenerating
}) => {
  const [inputVal, setInputVal] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isGenerating) return;
    onSubmitMessage(inputVal);
    setInputVal('');
  };

  const handleVoiceToggle = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is unavailable in this browser.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (e: any) => {
      const speechText = e.results[0][0].transcript;
      setInputVal((prev) => (prev ? `${prev} ${speechText}` : speechText));
    };
    recognition.start();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadSketch(file);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-stone-950 via-stone-950/95 to-transparent pt-3 pb-3 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Dynamic Contextual Suggestion Chips */}
        {suggestionChips.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectChip(chip)}
                className="px-2.5 py-1 rounded-full bg-stone-900/90 border border-stone-700/80 hover:border-amber-400 text-stone-300 hover:text-amber-200 text-[11px] font-medium whitespace-nowrap transition-all shadow-sm flex items-center gap-1 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="bg-stone-900/95 border border-stone-800 rounded-2xl p-2 flex items-center gap-2 shadow-2xl backdrop-blur-md"
        >
          <button
            type="button"
            onClick={onOpenParameters}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-xl transition-colors shrink-0"
            title="Adjust Model Parameters & System"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <label className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors shrink-0">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              accept="image/*,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Instruct Co-Pilot (e.g. 'Add a secret tunnel to Room 2', 'Make Suspect 3 an elf')..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:text-amber-400'
            }`}
            title="Dictate with voice"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputVal.trim() || isGenerating}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 rounded-xl font-bold transition-transform active:scale-95 shrink-0 shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
