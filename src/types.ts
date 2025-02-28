export interface Character {
  name: string;
  color: string;
  voiceId?: string;
}

export interface Script {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  characters: Character[];
  focusedRole?: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}