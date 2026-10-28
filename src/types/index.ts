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
