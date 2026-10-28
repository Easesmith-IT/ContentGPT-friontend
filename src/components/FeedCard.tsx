'use client';

import React, { useState } from 'react';
import { ExternalLink, Star, Youtube, Instagram, MessageSquare, Globe, Newspaper, Clock, ThumbsUp, MessageCircle, Eye, ShieldCheck, Copy, Check } from 'lucide-react';
import { ResearchItem } from '../types';

interface FeedCardProps {
  item: ResearchItem;
  isCompact?: boolean;
  onToggleSave: (id: string, currentSaved: boolean) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item, isCompact = false, onToggleSave }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.sourceUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getPlatformDetails = (platform: string) => {
    switch (platform) {
      case 'YOUTUBE':
        return {
          icon: <Youtube className="w-3.5 h-3.5 text-red-400" />,
          label: 'YouTube',
          border: 'border-red-500/20',
          bg: 'bg-red-500/10',
          text: 'text-red-300',
        };
      case 'INSTAGRAM':
        return {
          icon: <Instagram className="w-3.5 h-3.5 text-pink-400" />,
          label: 'Instagram',
          border: 'border-pink-500/20',
          bg: 'bg-pink-500/10',
          text: 'text-pink-300',
        };
      case 'REDDIT':
        return {
          icon: <MessageSquare className="w-3.5 h-3.5 text-orange-400" />,
          label: 'Reddit',
          border: 'border-orange-500/20',
          bg: 'bg-orange-500/10',
          text: 'text-orange-300',
        };
      case 'GOOGLE':
        return {
          icon: <Newspaper className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Google News',
          border: 'border-blue-500/20',
          bg: 'bg-blue-500/10',
          text: 'text-blue-300',
        };
      default:
        return {
          icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Sports Outlet',
          border: 'border-emerald-500/20',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-300',
        };
    }
  };

  const platform = getPlatformDetails(item.sourcePlatform);
  const formattedDate = new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // COMPACT VIEW (Fast mobile/desktop headline skimmer)
  if (isCompact) {
    return (
      <div
        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
          item.isSaved
            ? 'border-pink-500/40 bg-[#121624]'
            : 'border-gray-800/80 bg-[#0f131f]/80 hover:bg-[#121726] hover:border-gray-700'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="shrink-0">{platform.icon}</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-medium text-white truncate hover:text-pink-300 transition-colors">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="truncate max-w-[120px]">{item.authorOrChannel}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              {item.isPrioritySource && (
                <span className="text-pink-300 text-[10px] font-bold">★ Priority</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleSave(item._id, item.isSaved)}
            className={`p-2 rounded-xl border transition-colors ${
              item.isSaved
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                : 'text-gray-400 border-gray-800 hover:text-pink-300 hover:bg-gray-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
          </button>

          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-pink-500/15 hover:bg-pink-500 text-pink-300 hover:text-white border border-pink-500/30 transition-colors"
            title="Visit real source"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // DETAILED VIEW (Rich card with snippet, badges, metrics, and actions)
  return (
    <div
      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 bg-[#0f131f]/85 hover:bg-[#121726] flex flex-col justify-between ${
        item.isSaved
          ? 'border-pink-500/40 shadow-sm shadow-pink-500/10 bg-gradient-to-b from-pink-500/[0.04] to-transparent'
          : 'border-gray-800/90 hover:border-gray-700/90'
      }`}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Platform Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${platform.bg} ${platform.border} ${platform.text}`}
            >
              {platform.icon}
              <span>{platform.label}</span>
            </span>

            {/* Author/Channel */}
            <span className="text-[11px] font-medium text-gray-400 truncate max-w-[140px] sm:max-w-[180px]">
              {item.authorOrChannel}
            </span>

            {/* Priority Badge */}
            {item.isPrioritySource && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 text-pink-300 border border-pink-500/30">
                <span>★ {item.priorityWeight}x</span>
              </span>
            )}
          </div>

          {/* Top Right: Bookmark Button */}
          <button
            onClick={() => onToggleSave(item._id, item.isSaved)}
            title={item.isSaved ? 'Saved in Vault (Click to unsave)' : 'Save to Vault (Protect from 14-day auto-purge)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors active:scale-95 ${
              item.isSaved
                ? 'bg-pink-500/20 text-pink-200 border-pink-400/50 hover:bg-pink-500/30'
                : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-pink-300 hover:bg-gray-850'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
            <span className="hidden sm:inline">{item.isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-white mb-2 leading-snug group-hover:text-pink-300 transition-colors">
          {item.title}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {item.contentSnippet}
        </p>
      </div>

      {/* Card Footer: Metadata, Copy Link & "Visit Real Source" */}
      <div className="pt-3 border-t border-gray-800/80">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>{formattedDate}</span>
          </span>

          {/* Engagement metrics */}
          {item.engagementMetrics && (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              {item.engagementMetrics.upvotes !== undefined && item.engagementMetrics.upvotes > 0 && (
                <span className="flex items-center gap-1" title="Upvotes">
                  <ThumbsUp className="w-3 h-3 text-orange-400" />
                  <span>{item.engagementMetrics.upvotes.toLocaleString()}</span>
                </span>
              )}
              {item.engagementMetrics.comments !== undefined && item.engagementMetrics.comments > 0 && (
                <span className="flex items-center gap-1" title="Comments">
                  <MessageCircle className="w-3 h-3 text-pink-400" />
                  <span>{item.engagementMetrics.comments.toLocaleString()}</span>
                </span>
              )}
              {item.engagementMetrics.views !== undefined && item.engagementMetrics.views > 0 && (
                <span className="flex items-center gap-1" title="Views">
                  <Eye className="w-3 h-3 text-purple-400" />
                  <span>{item.engagementMetrics.views.toLocaleString()}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Copy Link & Visit Real Source (Baby Pink CTA) */}
        <div className="flex items-center gap-2">
          {/* Copy link button */}
          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-400 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
            title="Copy source link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Primary CTA: Visit Real Source */}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-pink-500/15 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 text-pink-300 hover:text-white border border-pink-500/30 hover:border-transparent text-xs font-semibold transition-all shadow-sm active:scale-95 text-center min-h-[38px]"
          >
            <span>Visit Real Source</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
