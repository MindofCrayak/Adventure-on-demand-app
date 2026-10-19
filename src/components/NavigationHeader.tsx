import React, { useRef } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  User, 
  Scroll, 
  Map as MapIcon, 
  Users, 
  FileText, 
  ShieldAlert, 
  Sparkles,
  Download,
  PenTool,
  Coins
} from 'lucide-react';

export type MainNavTab = 'dossier' | 'nodes' | 'maps' | 'npcs' | 'handouts' | 'tokens' | 'sketch' | 'export';

interface NavigationHeaderProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenDrawer: () => void;
  onOpenProfile: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  campaignTitle: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
  onOpenProfile,
  theme,
  onToggleTheme,
  campaignTitle
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const tabs = [
    { id: 'dossier', label: 'Master Dossier', icon: Scroll },
    { id: 'nodes', label: 'Scene Nodes (5)', icon: ShieldAlert },
    { id: 'maps', label: 'Tactical Maps', icon: MapIcon },
    { id: 'npcs', label: 'NPCs & Bosses', icon: Users },
    { id: 'tokens', label: 'VTT Tokens', icon: Sparkles },
    { id: 'sketch', label: 'Sketch Alchemy', icon: PenTool },
    { id: 'handouts', label: 'Clues & Handouts', icon: FileText },
    { id: 'export', label: 'Export Binder', icon: Download },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-850">
      {/* Upper Control Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-850 rounded-lg transition-colors"
            title="Saved Adventures Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-stone-950 text-xs shadow-md">
              AoD
            </span>
            <div className="leading-tight">
              <h2 className="text-sm font-bold font-serif text-amber-100 truncate max-w-[180px] sm:max-w-xs">
                {campaignTitle || 'Adventure on Demand'}
              </h2>
              <span className="text-[10px] text-stone-400 font-mono">TTRPG VTT Co-Pilot</span>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle & Profile Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-850 rounded-lg transition-colors"
            title="Toggle Light / Dark Parchment"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenProfile}
            className="p-1.5 rounded-full border border-stone-700 bg-stone-900 text-stone-300 hover:border-amber-400 transition-colors"
            title="Account & API Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally Draggable / Scrollable Tab Strip */}
      <div 
        ref={scrollRef}
        className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 border-t border-stone-900/60 touch-pan-x"
      >
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id as MainNavTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all font-medium ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
