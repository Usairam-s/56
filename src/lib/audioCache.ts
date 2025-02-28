interface CachedAudio {
  url: string;
  timestamp: number;
  data: ArrayBuffer;
}

class AudioCache {
  private static instance: AudioCache;
  private cache: Map<string, CachedAudio>;
  private maxSize: number;
  private currentSize: number;
  private maxAge: number;

  private constructor() {
    this.cache = new Map();
    this.maxSize = 100 * 1024 * 1024; // 100MB
    this.currentSize = 0;
    this.maxAge = 30 * 60 * 1000; // 30 minutes

    // Clean cache periodically
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  static getInstance(): AudioCache {
    if (!AudioCache.instance) {
      AudioCache.instance = new AudioCache();
    }
    return AudioCache.instance;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, audio] of this.cache.entries()) {
      if (now - audio.timestamp > this.maxAge) {
        this.currentSize -= audio.data.byteLength;
        URL.revokeObjectURL(audio.url);
        this.cache.delete(key);
      }
    }
  }

  private makeRoom(size: number) {
    if (this.currentSize + size <= this.maxSize) return;

    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    while (this.currentSize + size > this.maxSize && entries.length > 0) {
      const [key, audio] = entries.shift()!;
      this.currentSize -= audio.data.byteLength;
      URL.revokeObjectURL(audio.url);
      this.cache.delete(key);
    }
  }

  set(key: string, data: ArrayBuffer): string {
    // Remove old entry if it exists
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.data.byteLength;
      URL.revokeObjectURL(existing.url);
    }

    this.makeRoom(data.byteLength);
    
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    
    this.cache.set(key, {
      url,
      timestamp: Date.now(),
      data
    });
    
    this.currentSize += data.byteLength;
    return url;
  }

  get(key: string): string | null {
    const audio = this.cache.get(key);
    if (!audio) return null;
    
    // Update timestamp on access
    audio.timestamp = Date.now();
    return audio.url;
  }

  clear() {
    for (const audio of this.cache.values()) {
      URL.revokeObjectURL(audio.url);
    }
    this.cache.clear();
    this.currentSize = 0;
  }
}

export const audioCache = AudioCache.getInstance();