'use client';

import React from 'react';
import { Newspaper, Star, Users, RefreshCw } from 'lucide-react';

interface MobileBottomNavProps {
  isSavedOnly: boolean;
  onToggleSaved: (saved: boolean) => void;
  onOpenChannels: () => void;
  onScrape: () => void;
  isScraping: boolean;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isSavedOnly,
  onToggleSaved,
  onOpenChannels,
  onScrape,
  isScraping,
  savedCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f18]/95 backdrop-blur-lg border-t border-gray-800/80 px-4 py-2 flex items-center justify-around shadow-2xl">
      {/* All Feeds Tab */}
      <button
        onClick={() => onToggleSaved(false)}
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          !isSavedOnly ? 'text-pink-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Newspaper className="w-5 h-5" />
        <span className="text-[10px]">All Feeds</span>
      </button>

      {/* Saved Vault Tab */}
      <button
        onClick={() => onToggleSaved(true)}
        className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
          isSavedOnly ? 'text-pink-400 font-semibold' : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Star className={`w-5 h-5 ${isSavedOnly ? 'fill-pink-400' : ''}`} />
        <span className="text-[10px]">Saved Vault</span>
        {savedCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-pink-500/40">
            {savedCount > 99 ? '99+' : savedCount}
          </span>
        )}
      </button>

      {/* Priority Creators Tab */}
      <button
        onClick={onOpenChannels}
        className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-pink-300 transition-colors"
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px]">Creators</span>
      </button>

      {/* Quick Scrape Button */}
      <button
        onClick={onScrape}
        disabled={isScraping}
        className="flex flex-col items-center gap-1 py-1 px-3 text-gray-400 hover:text-pink-400 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-5 h-5 ${isScraping ? 'animate-spin text-pink-400' : ''}`} />
        <span className="text-[10px]">{isScraping ? 'Scraping' : 'Refresh'}</span>
      </button>
    </nav>
  );
};
