import { synthesizeSpeech } from './elevenlabs';

class VoiceManager {
  private static instance: VoiceManager;
  private silentAudioUrl: string | null;

  private constructor() {
    this.silentAudioUrl = null;
    this.createSilentAudio();
  }

  static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  async getAudio(text: string, voiceId: string): Promise<string> {
    try {
      // Basic validation
      if (!text || !text.trim() || !voiceId) {
        console.log("Missing text or voiceId, returning silent audio");
        return this.getSilentAudio();
      }

      // For fallback voices, return silent audio immediately 
      if (voiceId.startsWith('fallback-')) {
        return this.getSilentAudio();
      }

      // Sanitize text
      const sanitizedText = this.sanitizeText(text);
      if (!sanitizedText) {
        return this.getSilentAudio();
      }
      
      // DIRECT GENERATION - NO CACHING
      const audioData = await synthesizeSpeech(sanitizedText, voiceId);
      
      // Create blob URL (always fresh)
      const blob = new Blob([audioData], { type: 'audio/mpeg' });
      return URL.createObjectURL(blob);
      
    } catch (error) {
      console.warn("Error in getAudio:", error);
      return this.getSilentAudio();
    }
  }

  // Get silent audio URL for fallbacks
  async getSilentAudio(): Promise<string> {
    if (this.silentAudioUrl) {
      return this.silentAudioUrl;
    }
    return this.createSilentAudio();
  }

  // Sanitize text to prevent errors
  private sanitizeText(text: string): string {
    try {
      if (!text) return '';
      
      return text
        .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F]/g, ' ') // Keep only basic Latin characters
        .replace(/\s+/g, ' ')                               // Normalize whitespace
        .trim()
        .substring(0, 150);                                 // Limit length even more
    } catch (e) {
      console.warn("Error sanitizing text:", e);
      return '';
    }
  }

  // Create a silent WAV file for fallbacks
  private async createSilentAudio(): Promise<string> {
    // Create a silent WAV file
    const sampleRate = 44100;
    const seconds = 0.5;
    const numChannels = 2; // Stereo for better compatibility
    const bitsPerSample = 16;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = Math.floor(sampleRate * seconds) * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');
    
    // Format chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    
    // Data chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Silent data (all zeros)
    for (let i = 0; i < dataSize; i++) {
      view.setUint8(44 + i, 0);
    }
    
    // Create URL
    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    this.silentAudioUrl = url;
    return url;
  }

  // Utility to write strings to DataView
  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // Clear the cache
  clearCache(): void {
    // Revoke silent audio URL
    if (this.silentAudioUrl) {
      URL.revokeObjectURL(this.silentAudioUrl);
      this.silentAudioUrl = null;
    }
  }
}

export const voiceManager = VoiceManager.getInstance();