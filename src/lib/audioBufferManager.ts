export class AudioBufferManager {
  private static instance: AudioBufferManager;
  private audioContext: AudioContext | null;
  private minAudioSize: number;
  private maxAudioSize: number;
  private fallbackSampleRate: number;

  private constructor() {
    this.audioContext = null;
    this.minAudioSize = 1024; // 1KB minimum
    this.maxAudioSize = 10 * 1024 * 1024; // 10MB maximum
    this.fallbackSampleRate = 44100; // Standard sample rate
  }

  static getInstance(): AudioBufferManager {
    if (!AudioBufferManager.instance) {
      AudioBufferManager.instance = new AudioBufferManager();
    }
    return AudioBufferManager.instance;
  }

  private getAudioContext(): AudioContext {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext({
          sampleRate: this.fallbackSampleRate
        });
      }
      return this.audioContext;
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      throw new Error('Audio playback is not supported in this browser');
    }
  }

  private validateAudioSize(buffer: ArrayBuffer): boolean {
    return buffer.byteLength >= this.minAudioSize && buffer.byteLength <= this.maxAudioSize;
  }

  private validateAudioContent(buffer: ArrayBuffer): boolean {
    try {
      // Check first few bytes for valid audio headers
      const view = new DataView(buffer);
      
      // Check for RIFF header (WAV)
      if (buffer.byteLength >= 12) {
        const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
        if (riff === 'RIFF') {
          return true;
        }
      }
      
      // Check for ID3 header (MP3)
      if (buffer.byteLength >= 10) {
        const id3 = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
        if (id3 === 'ID3') {
          return true;
        }
      }
      
      // Check for Ogg header
      if (buffer.byteLength >= 4) {
        const ogg = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
        if (ogg === 'OggS') {
          return true;
        }
      }
      
      // No valid audio header found
      return false;
    } catch (error) {
      console.error('Audio content validation error:', error);
      return false;
    }
  }

  async validateAndProcessAudio(buffer: ArrayBuffer): Promise<AudioBuffer> {
    try {
      // Don't process empty buffers
      if (!buffer || buffer.byteLength === 0) {
        console.warn('Empty audio buffer received');
        return this.createSilentBuffer();
      }
      
      // Validate size
      if (!this.validateAudioSize(buffer)) {
        console.warn(`Audio size validation failed: ${buffer.byteLength} bytes`);
        return this.createSilentBuffer();
      }
      
      // Validate content format
      if (!this.validateAudioContent(buffer)) {
        console.warn('Invalid audio format detected');
        return this.createSilentBuffer();
      }

      const audioContext = this.getAudioContext();
      
      try {
        // Try to decode the audio data
        return await new Promise<AudioBuffer>((resolve, reject) => {
          // Set a timeout to prevent hanging
          const timeout = setTimeout(() => {
            reject(new Error('Audio decoding timeout'));
          }, 5000);
          
          try {
            audioContext.decodeAudioData(
              buffer,
              (decodedData) => {
                clearTimeout(timeout);
                
                // Check if the decoded data is valid
                if (decodedData && decodedData.length > 0 && decodedData.numberOfChannels > 0) {
                  resolve(decodedData);
                } else {
                  reject(new Error('Decoded audio is empty or invalid'));
                }
              },
              (error) => {
                clearTimeout(timeout);
                reject(error);
              }
            );
          } catch (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });
      } catch (error) {
        console.error('Audio decoding failed:', error);
        return this.createSilentBuffer();
      }
    } catch (error) {
      console.error('Audio validation failed:', error);
      return this.createSilentBuffer();
    }
  }

  private createSilentBuffer(): AudioBuffer {
    try {
      const audioContext = this.getAudioContext();
      const sampleRate = audioContext.sampleRate;
      const duration = 0.5; // 0.5 seconds
      const channels = 2; // Stereo
      const frameCount = Math.round(sampleRate * duration);
      
      const buffer = audioContext.createBuffer(channels, frameCount, sampleRate);
      
      // Fill with silence (all zeros)
      for (let channel = 0; channel < channels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = 0;
        }
      }
      
      return buffer;
    } catch (error) {
      console.error('Failed to create silent buffer:', error);
      
      // Last resort: create a minimalist AudioBuffer directly
      return new AudioBuffer({
        length: this.fallbackSampleRate / 2, // 0.5 seconds
        numberOfChannels: 2,
        sampleRate: this.fallbackSampleRate
      });
    }
  }

  async createBlobFromBuffer(audioBuffer: AudioBuffer): Promise<Blob> {
    try {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numberOfChannels * 2;
      const buffer = new ArrayBuffer(44 + length);
      const view = new DataView(buffer);
      const sampleRate = audioBuffer.sampleRate;
      
      // Write WAV header
      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, length, true);

      // Write audio data
      const offset = 44;
      let index = 0;

      try {
        for (let i = 0; i < numberOfChannels; i++) {
          // Extract channel data - using try/catch for each operation to avoid errors
          try {
            const channelData = new Float32Array(audioBuffer.length);
            
            try {
              audioBuffer.copyFromChannel(channelData, i, 0);
            } catch (e) {
              console.warn('Error copying channel data:', e);
              // Fill with zeros if copy fails
              channelData.fill(0);
            }
            
            // Write each sample to the buffer
            for (let j = 0; j < channelData.length; j++) {
              if (index + 2 <= buffer.byteLength - offset) {
                const sample = Math.max(-1, Math.min(1, channelData[j]));
                view.setInt16(offset + index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                index += 2;
              }
            }
          } catch (channelError) {
            console.warn('Error processing channel:', channelError);
          }
        }
      } catch (error) {
        console.error('Error writing audio data:', error);
        // Fill remaining buffer with silence
        for (let i = index; i < length; i += 2) {
          if (offset + i < buffer.byteLength) {
            view.setInt16(offset + i, 0, true);
          }
        }
      }

      return new Blob([buffer], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error creating blob from buffer:', error);
      
      // Return an empty WAV file as fallback
      const emptyWav = this.createEmptyWav();
      return new Blob([emptyWav], { type: 'audio/wav' });
    }
  }

  private createEmptyWav(): ArrayBuffer {
    try {
      // Create a short silent WAV file (0.5 seconds)
      const sampleRate = this.fallbackSampleRate;
      const numChannels = 2;
      const bitsPerSample = 16;
      const duration = 0.5; // seconds
      const numSamples = Math.floor(sampleRate * duration);
      const dataSize = numSamples * numChannels * (bitsPerSample / 8);
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);
      
      // RIFF chunk descriptor
      view.setUint8(0, 'R'.charCodeAt(0));
      view.setUint8(1, 'I'.charCodeAt(0));
      view.setUint8(2, 'F'.charCodeAt(0));
      view.setUint8(3, 'F'.charCodeAt(0));
      view.setUint32(4, 36 + dataSize, true);
      view.setUint8(8, 'W'.charCodeAt(0));
      view.setUint8(9, 'A'.charCodeAt(0));
      view.setUint8(10, 'V'.charCodeAt(0));
      view.setUint8(11, 'E'.charCodeAt(0));
      
      // fmt sub-chunk
      view.setUint8(12, 'f'.charCodeAt(0));
      view.setUint8(13, 'm'.charCodeAt(0));
      view.setUint8(14, 't'.charCodeAt(0));
      view.setUint8(15, ' '.charCodeAt(0));
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
      view.setUint16(32, numChannels * (bitsPerSample / 8), true);
      view.setUint16(34, bitsPerSample, true);
      
      // data sub-chunk
      view.setUint8(36, 'd'.charCodeAt(0));
      view.setUint8(37, 'a'.charCodeAt(0));
      view.setUint8(38, 't'.charCodeAt(0));
      view.setUint8(39, 'a'.charCodeAt(0));
      view.setUint32(40, dataSize, true);
      
      // Fill with silence (all zeros)
      for (let i = 44; i < buffer.byteLength; i++) {
        view.setUint8(i, 0);
      }
      
      return buffer;
    } catch (error) {
      console.error('Failed to create empty WAV:', error);
      
      // Create an absolute minimal WAV file (44 bytes header + 4 bytes of silence)
      const minimalBuffer = new ArrayBuffer(48);
      const view = new DataView(minimalBuffer);
      
      // Just write the RIFF header and minimal data
      const str = 'RIFF____WAVEfmt ____PCMdata____';
      for (let i = 0; i < str.length; i++) {
        if (str[i] !== '_') {
          view.setUint8(i, str.charCodeAt(i));
        }
      }
      
      return minimalBuffer;
    }
  }
}

export const audioBufferManager = AudioBufferManager.getInstance();