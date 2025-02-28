import axios from 'axios';
import { RateLimiter } from './rateLimiter';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Very simple rate limiter - 5 requests per minute
const rateLimiter = new RateLimiter(5, 60000);

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Create a silent audio buffer as fallback
const createSilentAudio = (): ArrayBuffer => {
  const sampleRate = 44100;
  const duration = 0.5; // 0.5 seconds of silence
  const numChannels = 2; // Stereo
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = Math.floor(sampleRate * duration) * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize); // WAV header + data
  const view = new DataView(buffer);
  
  // Write WAV header
  // "RIFF" chunk
  view.setUint8(0, 82); // 'R'
  view.setUint8(1, 73); // 'I'
  view.setUint8(2, 70); // 'F'
  view.setUint8(3, 70); // 'F'
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  // "WAVE" chunk
  view.setUint8(8, 87);  // 'W'
  view.setUint8(9, 65);  // 'A'
  view.setUint8(10, 86); // 'V'
  view.setUint8(11, 69); // 'E'
  // "fmt " chunk
  view.setUint8(12, 102); // 'f'
  view.setUint8(13, 109); // 'm'
  view.setUint8(14, 116); // 't'
  view.setUint8(15, 32);  // ' '
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // format (1 = PCM)
  view.setUint16(22, numChannels, true); // channels
  view.setUint32(24, sampleRate, true); // sample rate
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true); // block align
  view.setUint16(34, bytesPerSample * 8, true); // bits per sample
  // "data" chunk
  view.setUint8(36, 100); // 'd'
  view.setUint8(37, 97);  // 'a'
  view.setUint8(38, 116); // 't'
  view.setUint8(39, 97);  // 'a'
  view.setUint32(40, dataSize, true); // data chunk size
  
  // Fill with silence (zeros)
  for (let i = 44; i < buffer.byteLength; i++) {
    view.setUint8(i, 0);
  }
  
  return buffer;
};

const validateApiKey = () => {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.log("No API key found, using fallback voices");
    return '';
  }
  
  return apiKey;
};

export const getVoices = async () => {
  try {
    const apiKey = validateApiKey();
    if (!apiKey) {
      return getFallbackVoices();
    }

    // Wait for rate limiter
    await rateLimiter.acquire();

    try {
      const response = await axios.get(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      if (!response.data.voices || !Array.isArray(response.data.voices)) {
        console.warn('Invalid response format from ElevenLabs API');
        return getFallbackVoices();
      }

      return response.data.voices;
    } catch (error) {
      // Provide fallback voices in case of API failure
      console.error('ElevenLabs API Error, using fallback voices:', error);
      return getFallbackVoices();
    }
  } catch (error) {
    console.error('Failed to get voices:', error);
    return getFallbackVoices();
  }
};

const getFallbackVoices = () => {
  console.log("Using fallback voices instead of API");
  return [
    {
      voice_id: 'fallback-male-1',
      name: 'Male Voice 1 (Fallback)',
      preview_url: '',
      labels: { gender: 'male' }
    },
    {
      voice_id: 'fallback-female-1',
      name: 'Female Voice 1 (Fallback)',
      preview_url: '',
      labels: { gender: 'female' }
    },
    {
      voice_id: 'fallback-male-2',
      name: 'Male Voice 2 (Fallback)',
      preview_url: '',
      labels: { gender: 'male' }
    },
    {
      voice_id: 'fallback-female-2',
      name: 'Female Voice 2 (Fallback)',
      preview_url: '',
      labels: { gender: 'female' }
    }
  ];
};

// Simple direct voice synthesis - no caching
export const synthesizeSpeech = async (
  text: string,
  voiceId: string,
  settings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true
  }
) => {
  try {
    // Check API key
    const apiKey = validateApiKey();
    if (!apiKey) {
      console.log("No API key, returning silent audio");
      return createSilentAudio();
    }

    // Validate inputs
    if (!text || !text.trim()) {
      console.warn('Empty text provided for synthesis');
      return createSilentAudio();
    }

    if (!voiceId) {
      console.warn('No voice ID provided for synthesis');
      return createSilentAudio();
    }
    
    // For fallback voices, return a silent audio
    if (voiceId.startsWith('fallback-')) {
      console.log("Fallback voice, returning silent audio");
      return createSilentAudio();
    }

    // Wait for rate limiter
    await rateLimiter.acquire();

    try {
      // Simplify text - keep it very short
      const cleanText = text.substring(0, 100).trim();
      
      // Make API request - simple and direct
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          text: cleanText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: settings
        },
        {
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: 10000 // Shorter timeout
        }
      );

      if (!response.data || response.data.byteLength === 0) {
        console.warn('Empty audio data received from ElevenLabs API');
        return createSilentAudio();
      }

      return response.data;
    } catch (apiError) {
      console.error('ElevenLabs API Error during synthesis:', apiError);
      return createSilentAudio();
    }
  } catch (error) {
    console.error('Failed to synthesize speech:', error);
    return createSilentAudio();
  }
};