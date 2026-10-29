export type SourcePlatform = 'YOUTUBE' | 'INSTAGRAM' | 'RSS_NEWS' | 'REDDIT' | 'GOOGLE';

export interface ResearchItem {
  _id: string;
  sourcePlatform: SourcePlatform;
  sourceUrl: string;
  title: string;
  contentSnippet: string;
  authorOrChannel: string;
  isPrioritySource: boolean;
  priorityWeight: number;
  engagementMetrics?: {
    upvotes?: number;
    comments?: number;
    views?: number;
  };
  isSaved: boolean;
  savedAt?: string;
  publishedAt: string;
  createdAt: string;
}

export interface MonitoredChannel {
  _id: string;
  platform: 'YOUTUBE' | 'INSTAGRAM' | 'RSS';
  channelName: string;
  channelUrl: string;
  platformChannelId?: string;
  priorityWeight: number;
  category: string;
  autoTranscribe: boolean;
  isActive: boolean;
  lastPolledAt?: string;
}

export interface AvailableDate {
  date: string;
  count: number;
  savedCount: number;
}

export interface StorageStats {
  totalItems: number;
  savedItems: number;
  unsavedItems: number;
  pendingPurgeCount: number;
  priorityChannelsCount: number;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  timestamp: string;
  speaker?: string;
  textOriginal: string;
  textEnglish?: string;
  textHinglish?: string;
}

export interface TranscriptItem {
  _id: string;
  sourcePlatform: 'YOUTUBE' | 'INSTAGRAM' | 'UPLOAD';
  sourceUrl: string;
  videoId?: string;
  title: string;
  creatorName: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  segments: TranscriptSegment[];
  cleanText: {
    original: string;
    english: string;
    hinglish: string;
  };
  summary: string[];
  keyQuotes: string[];
  suggestedAngles: string[];
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptDraftResult {
  format: 'SHORT' | 'LONG';
  title: string;
  estimatedDuration: string;
  wordCount: number;
  hookOptions?: { id: number; type: string; hook: string }[];
  visualNotes?: string[];
  chapterMarkers?: { timestamp: string; title: string }[];
  scriptText: string;
}
