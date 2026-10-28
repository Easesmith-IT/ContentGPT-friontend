'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { AvailableDate } from '../types';

interface DaySelectorProps {
  dates: AvailableDate[];
  selectedDate: string; // 'ALL' or 'YYYY-MM-DD'
  onSelectDate: (date: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-[#0f131f]/90 border border-gray-800/80 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-pink-400" />
          <span>Scraping Timeline</span>
        </div>
        <span className="text-[11px] text-gray-400 hidden sm:inline">
          Filter feed by date fetched
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {/* All Days button */}
        <button
          onClick={() => onSelectDate('ALL')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 ${
            selectedDate === 'ALL'
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-md shadow-pink-500/20 border border-pink-400/40'
              : 'bg-gray-900/90 hover:bg-gray-800 text-gray-300 border border-gray-800/80'
          }`}
        >
          <span>All Days</span>
        </button>

        {/* Dynamic Dates from Database */}
        {dates.map((d) => {
          const isToday = d.date === todayStr;
          const isSelected = selectedDate === d.date;

          const parts = d.date.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const shortMonth = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
          const displayLabel = isToday ? 'Today' : `${shortMonth} ${parts[2]}`;

          return (
            <button
              key={d.date}
              onClick={() => onSelectDate(d.date)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 border ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400/60 font-semibold shadow-md shadow-pink-500/20'
                  : 'bg-gray-900/90 hover:bg-gray-800 text-gray-300 border-gray-800/80'
              }`}
            >
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{displayLabel}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-pink-700/80 text-pink-100' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {d.count}
              </span>
              {d.savedCount > 0 && (
                <span className="text-pink-300 text-[10px] font-bold" title={`${d.savedCount} saved items`}>
                  ★{d.savedCount}
                </span>
              )}
            </button>
          );
        })}

        {dates.length === 0 && (
          <div className="text-xs text-gray-400 py-1.5 px-2 italic">
            No history yet. Tap "Scrape Now" to fetch today's top sports topics!
          </div>
        )}
      </div>
    </div>
  );
};
