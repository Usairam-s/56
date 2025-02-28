import { supabase } from './supabase';
import { audioBufferManager } from './audioBufferManager';

export class VoiceCache {
  private static instance: VoiceCache;
  private memoryCache: Map<string, { url: string; timestamp: number }>;
  private maxMemoryAge: number;
  private pendingOperations: Map<string, Promise<string | null>>;
  private voiceMetadata: Map<string, { lastUsed: number; useCount: number }>;
  private maxRetries: number;
  private retryDelay: number;

  private constructor() {
    this.memoryCache = new Map();
    this.pendingOperations = new Map();
    this.voiceMetadata = new Map();
    this.maxMemoryAge = 30 * 60 * 1000; // 30 minutes
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }

  static getInstance(): VoiceCache {
    if (!VoiceCache.instance) {
      VoiceCache.instance = new VoiceCache();
    }
    return VoiceCache.instance;
  }

  private async generateHash(text: string, voiceId: string): Promise<string> {
    const data = `${voiceId}:${text}`;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private updateVoiceMetadata(voiceId: string) {
    const now = Date.now();
    const metadata = this.voiceMetadata.get(voiceId) || { lastUsed: now, useCount: 0 };
    metadata.lastUsed = now;
    metadata.useCount++;
    this.voiceMetadata.set(voiceId, metadata);
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;
        
        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  async get(text: string, voiceId: string): Promise<string | null> {
    try {
      const hash = await this.generateHash(text, voiceId);
      this.updateVoiceMetadata(voiceId);

      // Check pending operations
      const pendingOperation = this.pendingOperations.get(hash);
      if (pendingOperation) {
        return pendingOperation;
      }

      // Check memory cache
      const memCache = this.memoryCache.get(hash);
      if (memCache && Date.now() - memCache.timestamp < this.maxMemoryAge) {
        return memCache.url;
      }

      // Create new operation
      const operation = (async () => {
        try {
          // Check Supabase cache with retries
          const { data, error } = await this.retryOperation(() => 
            supabase
              .from('voice_cache')
              .select('audio_data, audio_url')
              .eq('hash', hash)
              .maybeSingle()
          );

          if (error) {
            console.error('Supabase error:', error);
            return null;
          }
          if (!data) return null;

          try {
            // Process audio data
            let audioBuffer: ArrayBuffer;
            
            if (data.audio_data) {
              audioBuffer = data.audio_data;
            } else if (data.audio_url) {
              // Fetch from URL with retries
              const response = await this.retryOperation(async () => {
                const res = await fetch(data.audio_url);
                if (!res.ok) throw new Error('Failed to fetch audio');
                return res;
              });
              audioBuffer = await response.arrayBuffer();
            } else {
              return null;
            }

            // Validate and process audio
            const processedBuffer = await audioBufferManager.validateAndProcessAudio(audioBuffer);
            const blob = await audioBufferManager.createBlobFromBuffer(processedBuffer);
            const url = URL.createObjectURL(blob);
            
            this.memoryCache.set(hash, { url, timestamp: Date.now() });

            // Update analytics
            await this.retryOperation(() =>
              supabase
                .from('voice_cache')
                .update({ 
                  last_accessed: new Date().toISOString(),
                  access_count: supabase.sql`access_count + 1`
                })
                .eq('hash', hash)
            );

            return url;
          } catch (error) {
            console.error('Failed to process cached audio:', error);
            return null;
          }
        } finally {
          this.pendingOperations.delete(hash);
        }
      })();

      this.pendingOperations.set(hash, operation);
      return operation;
    } catch (error) {
      console.error('Error retrieving from voice cache:', error);
      return null;
    }
  }

  async set(text: string, voiceId: string, audioData: ArrayBuffer): Promise<string> {
    try {
      const hash = await this.generateHash(text, voiceId);
      this.updateVoiceMetadata(voiceId);

      // Check pending operations
      const pendingOperation = this.pendingOperations.get(hash);
      if (pendingOperation) {
        const result = await pendingOperation;
        if (result) return result;
      }

      // Create new operation
      const operation = (async () => {
        try {
          // Process and validate audio
          const audioBuffer = await audioBufferManager.validateAndProcessAudio(audioData);
          const blob = await audioBufferManager.createBlobFromBuffer(audioBuffer);
          
          // Store in database with retries
          await this.retryOperation(async () => {
            const { error } = await supabase
              .from('voice_cache')
              .upsert({
                hash,
                voice_id: voiceId,
                text,
                audio_data: audioData,
                last_accessed: new Date().toISOString(),
                access_count: 1,
                metadata: {
                  format: 'audio/mpeg',
                  size: audioData.byteLength,
                  created: new Date().toISOString()
                }
              }, {
                onConflict: 'hash'
              });

            if (error) throw error;
          });

          // Update memory cache
          const url = URL.createObjectURL(blob);
          this.memoryCache.set(hash, { url, timestamp: Date.now() });

          return url;
        } finally {
          this.pendingOperations.delete(hash);
        }
      })();

      this.pendingOperations.set(hash, operation);
      return operation;
    } catch (error) {
      console.error('Error storing in voice cache:', error);
      // Process audio for memory-only cache
      const audioBuffer = await audioBufferManager.validateAndProcessAudio(audioData);
      const blob = await audioBufferManager.createBlobFromBuffer(audioBuffer);
      const url = URL.createObjectURL(blob);
      this.memoryCache.set(hash, { url, timestamp: Date.now() });
      return url;
    }
  }

  async preload(items: Array<{ text: string; voiceId: string }>): Promise<void> {
    try {
      // Sort items by voice metadata (prioritize frequently used voices)
      const sortedItems = items.sort((a, b) => {
        const metadataA = this.voiceMetadata.get(a.voiceId);
        const metadataB = this.voiceMetadata.get(b.voiceId);
        if (!metadataA || !metadataB) return 0;
        return (metadataB.useCount - metadataA.useCount) || 
               (metadataB.lastUsed - metadataA.lastUsed);
      });

      const hashPromises = sortedItems.map(async item => ({
        hash: await this.generateHash(item.text, item.voiceId),
        ...item
      }));

      const hashes = await Promise.all(hashPromises);

      // Check cache status with retries
      const { data, error } = await this.retryOperation(() =>
        supabase
          .from('voice_cache')
          .select('hash')
          .in('hash', hashes.map(h => h.hash))
      );

      if (error) {
        console.error('Error checking voice cache:', error);
        return;
      }

      const cachedHashes = new Set(data?.map(item => item.hash) || []);
      const uncachedItems = hashes.filter(item => !cachedHashes.has(item.hash));

      if (uncachedItems.length === 0) {
        console.log('All voices are already cached');
        return;
      }

      console.log(`Preloading ${uncachedItems.length} uncached voices...`);

      // Group by voice ID for better rate limiting
      const voiceGroups = uncachedItems.reduce((acc, item) => {
        if (!acc[item.voiceId]) {
          acc[item.voiceId] = [];
        }
        acc[item.voiceId].push(item);
        return acc;
      }, {} as Record<string, typeof uncachedItems>);

      // Process each voice group with delays and retries
      for (const [voiceId, items] of Object.entries(voiceGroups)) {
        for (const item of items) {
          try {
            await this.retryOperation(() => this.get(item.text, item.voiceId));
          } catch (error) {
            console.error('Failed to preload voice:', item, error);
          }
          // Add delay between items
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } catch (error) {
      console.error('Error in voice preloading:', error);
    }
  }

  clearMemoryCache(): void {
    for (const { url } of this.memoryCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.memoryCache.clear();
    this.pendingOperations.clear();
  }

  getVoiceStats(): { voiceId: string; useCount: number; lastUsed: number }[] {
    return Array.from(this.voiceMetadata.entries()).map(([voiceId, stats]) => ({
      voiceId,
      useCount: stats.useCount,
      lastUsed: stats.lastUsed
    }));
  }
}

export const voiceCache = VoiceCache.getInstance();