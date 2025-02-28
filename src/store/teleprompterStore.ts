import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formatScript, extractCharacters } from '../lib/scriptFormatter';

export const voicePresets = {
  sherwin: {
    name: 'Sherwin',
    type: 'text',
    description: 'Text-only mode - Read the script yourself'
  },
  nalauiz: {
    name: 'Nalauiz',
    type: 'voice',
    description: 'Voice mode - AI voices read other characters'
  }
} as const;

type VoicePreset = typeof voicePresets[keyof typeof voicePresets];

interface Script {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  characters?: Character[];
  focusedRole?: string;
  settings?: Partial<TeleprompterSettings>;
  analysis?: ScriptAnalysis;
}

interface ScriptAnalysis {
  characters: CharacterAnalysis[];
  themes: string[];
  tone: string;
  lastUpdated: string;
}

interface CharacterAnalysis {
  name: string;
  description: string;
  traits: string[];
  relationships: Record<string, string>;
  lineCount: number;
  mainCharacter: boolean;
}

interface Character {
  name: string;
  color: string;
  voiceId?: string;
  analysis?: CharacterAnalysis;
}

interface TeleprompterSettings {
  wordsPerMinute: number;
  autoScroll: boolean;
  smartPause: boolean;
  highlightColor: string;
  voiceEnabled: boolean;
  language: string;
  narratorVoiceId?: string;
  autoPlayVoices: boolean;
  scrollSyncDelay: number;
  // New settings for controlling what gets read
  readLocations: boolean;
  readActions: boolean;
  readParentheticals: boolean;
}

interface TeleprompterState {
  text: string;
  fontSize: number;
  scrollSpeed: number;
  isPlaying: boolean;
  isMirrorMode: boolean;
  isDarkMode: boolean;
  currentScriptId: string | null;
  savedScripts: Script[];
  characters: Character[];
  focusedRole: string;
  settings: TeleprompterSettings;
  analysis: ScriptAnalysis | null;
  activeTab: 'landing' | 'signup' | 'login' | 'editor' | 'analysis' | 'voices' | 'prompter' | 'settings' | 'credits' | 'faq';
  selectedVoicePreset: VoicePreset;
  isAuthenticated: boolean;
  credits: number;
  subscription: {
    type: 'none' | 'basic' | 'pro';
    expiresAt: string | null;
  };
  
  setText: (text: string) => void;
  setFontSize: (size: number) => void;
  setScrollSpeed: (speed: number) => void;
  togglePlay: () => void;
  toggleMirrorMode: () => void;
  toggleDarkMode: () => void;
  saveCurrentScript: (title: string) => void;
  updateCurrentScript: () => void;
  loadScript: (id: string) => void;
  deleteScript: (id: string) => void;
  createNewScript: () => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (name: string, updates: Partial<Character>) => void;
  removeCharacter: (name: string) => void;
  setFocusedRole: (role: string) => void;
  updateSettings: (settings: Partial<TeleprompterSettings>) => void;
  forceDetectCharacters: () => void;
  setAnalysis: (analysis: ScriptAnalysis) => void;
  setActiveTab: (tab: 'landing' | 'signup' | 'login' | 'editor' | 'analysis' | 'voices' | 'prompter' | 'settings' | 'credits' | 'faq') => void;
  saveAndContinue: () => void;
  continueToVoices: () => void;
  setVoicePreset: (preset: VoicePreset) => void;
  setIsAuthenticated: (value: boolean) => void;
  resetState: () => void;
  addCredits: (amount: number) => void;
  useCredit: () => boolean;
  updateSubscription: (type: 'none' | 'basic' | 'pro', expiresAt: string | null) => void;
}

const defaultSettings: TeleprompterSettings = {
  wordsPerMinute: 150,
  autoScroll: true,
  smartPause: true,
  highlightColor: '#FFD700',
  voiceEnabled: true,
  language: 'en-US',
  narratorVoiceId: undefined,
  autoPlayVoices: true,
  scrollSyncDelay: 500,
  // By default, don't read locations (scene headings), but do read actions and parentheticals
  readLocations: false,
  readActions: true,
  readParentheticals: true
};

const initialState = {
  text: '',
  fontSize: 32,
  scrollSpeed: 50,
  isPlaying: false,
  isMirrorMode: false,
  isDarkMode: true,
  currentScriptId: null,
  savedScripts: [],
  characters: [],
  focusedRole: '',
  settings: defaultSettings,
  analysis: null,
  activeTab: 'landing',
  selectedVoicePreset: voicePresets.sherwin,
  isAuthenticated: false,
  credits: 0,
  subscription: {
    type: 'none',
    expiresAt: null
  }
};

export const useTeleprompterStore = create<TeleprompterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setText: (text) => {
        const state = get();
        
        // Only process character detection if text has changed significantly
        // or if there are no characters detected yet
        const shouldDetectCharacters = state.characters.length === 0 || 
          (Math.abs(text.length - state.text.length) > 50);
        
        set({ text });
        
        if (shouldDetectCharacters) {
          const newCharacters = extractCharacters(text);
          
          const existingCharacters = new Map(state.characters.map(c => [c.name, c]));
          const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
            'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
            'bg-rose-500', 'bg-emerald-500'
          ];

          const updatedCharacters = newCharacters.map((name, index) => {
            const existing = existingCharacters.get(name);
            if (existing) return existing;
            return {
              name,
              color: colors[index % colors.length]
            };
          });

          set({
            characters: updatedCharacters,
            settings: {
              ...state.settings,
              voiceEnabled: true
            }
          });
        }

        if (state.currentScriptId) {
          state.updateCurrentScript();
        }
      },

      setFontSize: (fontSize) => set({ fontSize }),
      setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      toggleMirrorMode: () => set((state) => ({ isMirrorMode: !state.isMirrorMode })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      saveCurrentScript: (title) => {
        const state = get();
        const now = new Date().toISOString();
        let autoSaveIndicator = '';
        
        // Check if the title already exists
        const existingScript = state.savedScripts.find(s => 
          s.title.toLowerCase() === title.toLowerCase() && s.id !== state.currentScriptId
        );
        
        // If exists and not current script, append a number
        let finalTitle = title;
        if (existingScript) {
          let counter = 1;
          while (state.savedScripts.some(s => 
            s.title.toLowerCase() === `${title} (${counter})`.toLowerCase() && 
            s.id !== state.currentScriptId
          )) {
            counter++;
          }
          finalTitle = `${title} (${counter})`;
        }
        
        // If updating existing script
        if (state.currentScriptId) {
          const updatedScripts = state.savedScripts.map(script => 
            script.id === state.currentScriptId
              ? { 
                  ...script, 
                  title: finalTitle,
                  content: state.text,
                  updatedAt: now,
                  characters: state.characters,
                  focusedRole: state.focusedRole,
                  settings: state.settings,
                  analysis: state.analysis
                }
              : script
          );
          
          set({ savedScripts: updatedScripts });
          autoSaveIndicator = 'Script updated';
          return;
        }
        
        // Creating new script
        const id = Date.now().toString();
        const newScript = {
          id,
          title: finalTitle,
          content: state.text,
          updatedAt: now,
          characters: state.characters,
          focusedRole: state.focusedRole,
          settings: state.settings,
          analysis: state.analysis
        };

        set({
          savedScripts: [...state.savedScripts, newScript],
          currentScriptId: id
        });
        autoSaveIndicator = 'Script saved';
        
        // Show save indicator briefly
        const indicator = document.createElement('div');
        indicator.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        indicator.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>${autoSaveIndicator}`;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
      },

      updateCurrentScript: () => {
        const state = get();
        if (!state.currentScriptId) return;
        
        const updatedScripts = state.savedScripts.map(script => 
          script.id === state.currentScriptId
            ? { 
                ...script, 
                content: state.text,
                updatedAt: new Date().toISOString(),
                characters: state.characters,
                focusedRole: state.focusedRole,
                settings: state.settings,
                analysis: state.analysis
              }
            : script
        );
        
        set({ savedScripts: updatedScripts });
        
        // Show save indicator
        const indicator = document.createElement('div');
        indicator.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        indicator.innerHTML = `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Auto-saved`;
        document.body.appendChild(indicator);
        setTimeout(() => indicator.remove(), 2000);
      },
      
      loadScript: (id) => {
        const state = get();
        const script = state.savedScripts.find(s => s.id === id);
        if (script) {
          // Keep characters that have voices assigned
          const existingCharactersWithVoices = new Map(
            state.characters
              .filter(c => c.voiceId)
              .map(c => [c.name, c])
          );
          
          // Get characters from the script or extract from content
          const characters = script.characters || 
            extractCharacters(script.content).map((name, index) => {
              // Check if we have this character with a voice
              const existing = existingCharactersWithVoices.get(name);
              if (existing) return existing;
              
              // Otherwise create a new one
              return {
                name,
                color: ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
                       'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
                       'bg-rose-500', 'bg-emerald-500'][index % 10]
              };
            });
          
          set({
            text: script.content,
            currentScriptId: script.id,
            characters,
            focusedRole: script.focusedRole || '',
            settings: {
              ...state.settings,
              ...(script.settings || {}),
              voiceEnabled: true
            },
            analysis: script.analysis || null
          });
        }
      },
      
      deleteScript: (id) => set((state) => ({
        savedScripts: state.savedScripts.filter(s => s.id !== id),
        currentScriptId: state.currentScriptId === id ? null : state.currentScriptId,
        text: state.currentScriptId === id ? '' : state.text,
        characters: state.currentScriptId === id ? [] : state.characters,
        focusedRole: state.currentScriptId === id ? '' : state.focusedRole,
        analysis: state.currentScriptId === id ? null : state.analysis
      })),
      
      createNewScript: () => set({
        text: '',
        currentScriptId: null,
        characters: [],
        focusedRole: '',
        settings: defaultSettings,
        analysis: null
      }),
      
      addCharacter: (character) => set((state) => {
        if (!state.characters.find(c => c.name === character.name)) {
          const newCharacters = [...state.characters, character];
          return {
            characters: newCharacters,
            settings: {
              ...state.settings,
              voiceEnabled: true
            }
          };
        }
        return state;
      }),

      updateCharacter: (name, updates) => set((state) => {
        const updatedCharacters = state.characters.map(char =>
          char.name === name ? { ...char, ...updates } : char
        );
        
        const newSettings = {
          ...state.settings,
          voiceEnabled: true
        };
        
        if (state.currentScriptId) {
          const updatedScripts = state.savedScripts.map(script =>
            script.id === state.currentScriptId
              ? { 
                  ...script, 
                  characters: updatedCharacters,
                  settings: newSettings
                }
              : script
          );
          return {
            characters: updatedCharacters,
            savedScripts: updatedScripts,
            settings: newSettings
          };
        }
        
        return { 
          characters: updatedCharacters,
          settings: newSettings
        };
      }),
      
      removeCharacter: (name) => set((state) => {
        const newCharacters = state.characters.filter(c => c.name !== name);
        const newFocusedRole = state.focusedRole === name 
          ? (newCharacters[0]?.name || '') 
          : state.focusedRole;
        
        return {
          characters: newCharacters,
          focusedRole: newFocusedRole
        };
      }),
      
      setFocusedRole: (role) => set((state) => {
        if (!role || state.characters.find(c => c.name === role)) {
          const newState = { 
            focusedRole: role,
            settings: {
              ...state.settings,
              voiceEnabled: true
            }
          };
          
          if (state.currentScriptId) {
            const updatedScripts = state.savedScripts.map(script =>
              script.id === state.currentScriptId
                ? { 
                    ...script, 
                    focusedRole: role,
                    settings: newState.settings
                  }
                : script
            );
            return { ...newState, savedScripts: updatedScripts };
          }
          
          return newState;
        }
        return state;
      }),
      
      updateSettings: (newSettings) => set((state) => {
        const updatedSettings = { ...state.settings, ...newSettings };
        
        if (state.currentScriptId) {
          const updatedScripts = state.savedScripts.map(script =>
            script.id === state.currentScriptId
              ? { ...script, settings: updatedSettings }
              : script
          );
          return {
            settings: updatedSettings,
            savedScripts: updatedScripts
          };
        }
        
        return { settings: updatedSettings };
      }),

      setAnalysis: (analysis) => {
        const state = get();
        set({ analysis });

        const updatedCharacters = state.characters.map(char => {
          const charAnalysis = analysis.characters.find(a => a.name === char.name);
          return charAnalysis ? { ...char, analysis: charAnalysis } : char;
        });

        set({ characters: updatedCharacters });

        if (state.currentScriptId) {
          const updatedScripts = state.savedScripts.map(script =>
            script.id === state.currentScriptId
              ? { ...script, analysis }
              : script
          );
          set({ savedScripts: updatedScripts });
        }
      },

      forceDetectCharacters: () => {
        const state = get();
        const newCharacters = extractCharacters(state.text);
        const existingCharacters = new Map(state.characters.map(c => [c.name, c]));
        const colors = [
          'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
          'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500',
          'bg-rose-500', 'bg-emerald-500'
        ];

        const updatedCharacters = newCharacters.map((name, index) => {
          const existing = existingCharacters.get(name);
          if (existing) return existing;
          return {
            name,
            color: colors[index % colors.length]
          };
        });

        set({
          characters: updatedCharacters,
          settings: {
            ...state.settings,
            voiceEnabled: true
          }
        });

        if (state.currentScriptId) {
          state.updateCurrentScript();
        }
      },

      setActiveTab: (tab) => set({ activeTab: tab }),

      saveAndContinue: () => {
        const state = get();
        
        // If script isn't saved yet and has content, auto-save it with generated title
        if (!state.currentScriptId && state.text.trim().length > 10) {
          const generatedTitle = extractScriptTitle(state.text);
          if (generatedTitle && generatedTitle !== 'Untitled Script') {
            state.saveCurrentScript(generatedTitle);
          }
        } else if (state.currentScriptId) {
          state.updateCurrentScript();
        }
      },

      continueToVoices: () => {
        const state = get();
        state.saveAndContinue();
        set({ activeTab: 'voices' });
      },

      setVoicePreset: (preset) => {
        set({ selectedVoicePreset: preset });
      },

      setIsAuthenticated: (value) => {
        if (!value) {
          // Reset state when logging out
          set({
            ...initialState,
            isDarkMode: get().isDarkMode, // Preserve dark mode preference
            isAuthenticated: false,
            activeTab: 'landing'
          });
        } else {
          set({ isAuthenticated: true });
        }
      },

      resetState: () => set(initialState),

      addCredits: (amount) => set(state => ({
        credits: state.credits + amount
      })),

      useCredit: () => {
        const state = get();
        if (state.subscription.type === 'pro' || state.credits > 0) {
          if (state.subscription.type !== 'pro') {
            set(state => ({ credits: state.credits - 1 }));
          }
          return true;
        }
        return false;
      },

      updateSubscription: (type, expiresAt) => set({
        subscription: { type, expiresAt }
      })
    }),
    {
      name: 'teleprompter-storage',
      partialize: (state) => ({
        savedScripts: state.savedScripts,
        characters: state.characters,
        focusedRole: state.focusedRole,
        settings: state.settings,
        isDarkMode: state.isDarkMode,
        currentScriptId: state.currentScriptId,
        analysis: state.analysis,
        activeTab: state.activeTab,
        selectedVoicePreset: state.selectedVoicePreset,
        isAuthenticated: state.isAuthenticated,
        credits: state.credits,
        subscription: state.subscription
      })
    }
  )
);