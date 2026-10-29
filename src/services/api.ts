import { ResearchItem, MonitoredChannel, AvailableDate, StorageStats, TranscriptItem, ScriptDraftResult } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function fetchFeeds(params: {
  date?: string;
  platform?: string;
  isSaved?: boolean;
  priorityOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: ResearchItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params.date) query.set('date', params.date);
  if (params.platform && params.platform !== 'ALL') query.set('platform', params.platform);
  if (typeof params.isSaved === 'boolean') query.set('isSaved', String(params.isSaved));
  if (params.priorityOnly) query.set('priorityOnly', 'true');
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE_URL}/research/feed?${query.toString()}`, {
    cache: 'no-store',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch feeds');
  return json.data;
}

export async function fetchAvailableDates(): Promise<AvailableDate[]> {
  const res = await fetch(`${API_BASE_URL}/research/dates`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch dates');
  return json.data;
}

export async function fetchStorageStats(): Promise<StorageStats> {
  const res = await fetch(`${API_BASE_URL}/research/stats`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch stats');
  return json.data;
}

export async function toggleSaveFeed(id: string, isSaved: boolean): Promise<ResearchItem> {
  const res = await fetch(`${API_BASE_URL}/research/${id}/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isSaved }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to toggle save');
  return json.data;
}

export async function triggerManualScrape(slot: string = 'MANUAL'): Promise<{
  totalFetched: number;
  newItemsInserted: number;
}> {
  const res = await fetch(`${API_BASE_URL}/research/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slot }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Scrape failed');
  return json.data;
}

export async function purgeUnsavedFeeds(days: number = 14): Promise<{ deletedCount: number }> {
  const res = await fetch(`${API_BASE_URL}/research/purge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ days }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Purge failed');
  return json.data;
}

export async function fetchChannels(): Promise<MonitoredChannel[]> {
  const res = await fetch(`${API_BASE_URL}/channels`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch channels');
  return json.data;
}

export async function addMonitoredChannel(channel: Partial<MonitoredChannel>): Promise<MonitoredChannel> {
  const res = await fetch(`${API_BASE_URL}/channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channel),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to add channel');
  return json.data;
}

export async function deleteMonitoredChannel(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/channels/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete channel');
}

// ---------------- TRANSCRIPT LAB APIS ----------------

export async function transcribeLink(url: string): Promise<{
  success: boolean;
  data?: TranscriptItem;
  cached?: boolean;
  requiresUploadFallback?: boolean;
  metadata?: any;
  message?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/transcripts/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  return await res.json();
}

export async function uploadAndTranscribeMedia(formData: FormData): Promise<TranscriptItem> {
  const res = await fetch(`${API_BASE_URL}/transcripts/upload`, {
    method: 'POST',
    body: formData,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Upload transcription failed');
  return json.data;
}

export async function generateScriptFromTranscript(
  id: string,
  format: 'SHORT' | 'LONG',
  creatorNotes?: string
): Promise<ScriptDraftResult> {
  const res = await fetch(`${API_BASE_URL}/transcripts/${id}/generate-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ format, creatorNotes }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Script generation failed');
  return json.data;
}

export async function fetchTranscripts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isSaved?: boolean;
}): Promise<{
  items: TranscriptItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (typeof params?.isSaved === 'boolean') query.set('isSaved', String(params.isSaved));

  const res = await fetch(`${API_BASE_URL}/transcripts?${query.toString()}`, {
    cache: 'no-store',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch transcripts');
  return json.data;
}

export async function fetchTranscriptById(id: string): Promise<TranscriptItem> {
  const res = await fetch(`${API_BASE_URL}/transcripts/${id}`, { cache: 'no-store' });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch transcript');
  return json.data;
}

export async function toggleSaveTranscript(id: string, isSaved: boolean): Promise<TranscriptItem> {
  const res = await fetch(`${API_BASE_URL}/transcripts/${id}/save`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isSaved }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to toggle save');
  return json.data;
}

export async function deleteTranscript(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/transcripts/${id}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete transcript');
}
