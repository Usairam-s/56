import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { getVoices } from '../lib/elevenlabs';
import { 
  Mic, Volume2, AlertCircle, Check, User, RefreshCw,
  BookOpen, ArrowRightCircle, Play, VolumeX, Bot, X,
  ChevronLeft, ToggleLeft, ToggleRight
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { voicePresets } from '../store/teleprompterStore';

interface Voice {
  voice_id: string;
  name: string;
  preview_url: string;
  labels?: {
    gender?: string;
  };
}

export const CharacterVoiceSelector: React.FC = () => {
  const { 
    characters,
    updateCharacter,
    settings,
    updateSettings,
    focusedRole,
    setActiveTab,
    selectedVoicePreset,
    setVoicePreset,
    text,
    saveAndContinue
  } = useTeleprompterStore();

  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load voices on component mount 
useEffect(() => {
    loadVoices();
  }, []);

  // Auto-assign voices when they're loaded
  useEffect(() => {
    if (voices.length > 0 && characters.length > 0 && !loading) {
      autoAssignVoices();
    }
  }, [voices, characters, loading]);

  // Validate basic requirements before allowing to continue
  useEffect(() => {
    // Check if text is available
    if (!text || text.trim().length === 0) {
      setValidationError('No script content. Please add a script first.');
    } 
    // Check if a role is selected
    else if (!focusedRole) {
      setValidationError('No role selected. Please choose your character.');
    } 
    // If voice mode is enabled, check if voices are assigned
    else if (selectedVoicePreset.type === 'voice' && characters.length > 0) {
      const otherCharacters = characters.filter(c => c.name !== focusedRole);
      const unassignedCharacters = otherCharacters.filter(c => !c.voiceId);
      
      if (unassignedCharacters.length > 0 && otherCharacters.length > 0) {
        setValidationError('Some characters don\'t have voice assignments.');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [text, focusedRole, characters, selectedVoicePreset]);

  const loadVoices = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch voices
      const availableVoices = await getVoices();
      
      // Add fallback voices if API fails or returns empty array
      if (!availableVoices || availableVoices.length === 0) {
        const fallbackVoices = [
          {
            voice_id: 'fallback-male-1',
            name: 'Male Voice 1',
            preview_url: '',
            labels: { gender: 'male' }
          },
          {
            voice_id: 'fallback-female-1',
            name: 'Female Voice 1',
            preview_url: '',
            labels: { gender: 'female' }
          },
          {
            voice_id: 'fallback-male-2',
            name: 'Male Voice 2',
            preview_url: '',
            labels: { gender: 'male' }
          },
          {
            voice_id: 'fallback-female-2',
            name: 'Female Voice 2',
            preview_url: '',
            labels: { gender: 'female' }
          }
        ];
        setVoices(fallbackVoices);
      } else {
        setVoices(availableVoices);
      }
    } catch (error: any) {
      console.error('Failed to load voices:', error);
      setError('Failed to load voices. Using fallback voices instead.');
      
      // Add fallback voices in case of API error
      const fallbackVoices = [
        {
          voice_id: 'fallback-male-1',
          name: 'Male Voice 1',
          preview_url: '',
          labels: { gender: 'male' }
        },
        {
          voice_id: 'fallback-female-1',
          name: 'Female Voice 1',
          preview_url: '',
          labels: { gender: 'female' }
        },
        {
          voice_id: 'fallback-male-2',
          name: 'Male Voice 2',
          preview_url: '',
          labels: { gender: 'male' }
        },
        {
          voice_id: 'fallback-female-2',
          name: 'Female Voice 2',
          preview_url: '',
          labels: { gender: 'female' }
        }
      ];
      
      setVoices(fallbackVoices);
    } finally {
      setLoading(false);
    }
  };

  const autoAssignVoices = () => {
    // Skip if no characters or voices
    if (characters.length === 0 || voices.length === 0) return;

    // Split voices by gender
    const maleVoices = voices.filter(v => 
      v.labels?.gender?.toLowerCase() === 'male'
    );
    const femaleVoices = voices.filter(v => 
      v.labels?.gender?.toLowerCase() === 'female'
    );
    const otherVoices = voices.filter(v => 
      !v.labels?.gender || (v.labels.gender.toLowerCase() !== 'male' && v.labels.gender.toLowerCase() !== 'female')
    );

    // Get next voice based on preferred gender
    const getNextVoice = (index, preferredGender) => {
      const preferredVoices = preferredGender === 'male' ? maleVoices : femaleVoices;
      const backupVoices = preferredGender === 'male' ? femaleVoices : maleVoices;
      
      if (preferredVoices.length > 0) {
        return preferredVoices[index % preferredVoices.length].voice_id;
      } else if (backupVoices.length > 0) {
        return backupVoices[index % backupVoices.length].voice_id;
      } else if (otherVoices.length > 0) {
        return otherVoices[index % otherVoices.length].voice_id;
      } else {
        return voices[index % voices.length].voice_id;
      }
    };

    // Assign narrator voice if needed
    if (!settings.narratorVoiceId && voices.length > 0) {
      const neutralVoice = voices.find(v => !v.labels?.gender) || voices[0];
      updateSettings({ narratorVoiceId: neutralVoice.voice_id });
    }

    // Auto-assign voices to characters
    let maleIndex = 0;
    let femaleIndex = 0;
    
    characters.forEach((char) => {
      // Skip focused role (user's character)
      if (char.name === focusedRole) return;
      
      // Skip if already has voice
      if (char.voiceId) return;
      
      // Simple gender detection based on name
      const name = char.name.toLowerCase();
      const femaleIndicators = ['she', 'her', 'ms', 'mrs', 'miss', 'mother', 'sister', 'daughter', 'girl', 'woman'];
      
      let preferredGender = 'male';
      if (femaleIndicators.some(indicator => name.includes(indicator))) {
        preferredGender = 'female';
      }
      
      // Assign voice
      const voiceId = getNextVoice(
        preferredGender === 'male' ? maleIndex++ : femaleIndex++, 
        preferredGender
      );
      
      updateCharacter(char.name, { voiceId });
    });

    // Enable voice if we have voices
    if (voices.length > 0) {
      updateSettings({ voiceEnabled: true });
    }
  };

  const handleVoicePresetChange = (preset: typeof voicePresets[keyof typeof voicePresets]) => {
    setVoicePreset(preset);
    
    // Update voice setting based on preset
    updateSettings({ voiceEnabled: preset.type === 'voice' });
  };

  const handleVoiceChange = (characterName: string, voiceId: string) => {
    updateCharacter(characterName, { voiceId });
    if (!settings.voiceEnabled && voiceId) {
      updateSettings({ voiceEnabled: true });
    }
  };

  const playPreview = async (characterName: string, previewUrl: string) => {
    try {
      if (!previewUrl) {
        setError('No preview available for this voice');
        return;
      }
      
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = '';
      }
      
      setActivePreview(characterName);
      const audio = new Audio(previewUrl);
      
      audio.onended = () => {
        setActivePreview(null);
      };
      
      setPreviewAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('Failed to play preview:', error);
      setActivePreview(null);
      setError('Failed to play voice preview');
    }
  };

  const handleContinue = () => {
    if (validationError) return;
    
    // Save current state
    saveAndContinue();
    setSaveStatus('Saving...');
    
    setTimeout(() => {
      setSaveStatus('Saved!');
      setTimeout(() => {
        setSaveStatus(null);
        setActiveTab('prompter');
      }, 500);
    }, 500);
  };

  const handleBack = () => {
    setActiveTab('analysis');
  };

  // Toggle advanced voice settings
  const toggleVoiceOption = (settingName: string, value: boolean) => {
    updateSettings({ [settingName]: value });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4">
        <LoadingSpinner size="lg" />
        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading voices...</span>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
          This may take a moment as we're setting up voice options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation and Status */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              title="Back to Analysis"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Mic className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Voice Assignment
            </h2>
            
            {saveStatus && (
              <span className={`
                px-3 py-1 rounded text-sm font-medium ml-3
                ${saveStatus === 'Saving...' 
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' 
                  : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                }
              `}>
                {saveStatus === 'Saving...' ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Check className="w-4 h-4 inline mr-1" />
                )}
                {saveStatus}
              </span>
            )}
          </div>
          
          {/* Single Start Reading button */}
          <button
            onClick={handleContinue}
            disabled={!!validationError}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all
              ${validationError 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 shadow-sm'
              }
            `}
            title={validationError || 'Start reading your script'}
          >
            <Play className="w-4 h-4" />
            <span>Start Reading</span>
          </button>
        </div>
        
        {validationError && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{validationError}</p>
          </div>
        )}
      </div>

      {/* Voice Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handleVoicePresetChange(voicePresets.sherwin)}
          className={`p-5 rounded-xl transition-all ${
            selectedVoicePreset.name === 'Sherwin'
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-full ${selectedVoicePreset.name === 'Sherwin' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Text Only</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Read all lines yourself</p>
            </div>
            {selectedVoicePreset.name === 'Sherwin' && (
              <Check className="w-5 h-5 text-green-500 ml-auto" />
            )}
          </div>
        </button>

        <button
          onClick={() => handleVoicePresetChange(voicePresets.nalauiz)}
          className={`p-5 rounded-xl transition-all ${
            selectedVoicePreset.name === 'Nalauiz'
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-full ${selectedVoicePreset.name === 'Nalauiz' ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Volume2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">Voice Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI voices for other characters</p>
            </div>
            {selectedVoicePreset.name === 'Nalauiz' && (
              <Check className="w-5 h-5 text-green-500 ml-auto" />
            )}
          </div>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Advanced Voice Controls */}
      {selectedVoicePreset.type === 'voice' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Voice Reading Options
          </h3>
          
          <div className="space-y-3">
            {/* Read Locations Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Read Location Descriptions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read scene headings like "INT. COFFEE SHOP - MORNING"
                </p>
              </div>
              <button 
                onClick={() => toggleVoiceOption('readLocations', !settings.readLocations)}
                className="text-indigo-600 dark:text-indigo-400"
                aria-label={settings.readLocations ? "Enabled" : "Disabled"}
              >
                {settings.readLocations ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </div>
            
            {/* Read Action Descriptions Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Read Action Descriptions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read scene descriptions and action lines
                </p>
              </div>
              <button 
                onClick={() => toggleVoiceOption('readActions', !settings.readActions)}
                className="text-indigo-600 dark:text-indigo-400"
                aria-label={settings.readActions ? "Enabled" : "Disabled"}
              >
                {settings.readActions ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </div>
            
            {/* Read Parentheticals Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Read Parentheticals</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read character instructions like "(laughing)" or "(confused)"
                </p>
              </div>
              <button 
                onClick={() => toggleVoiceOption('readParentheticals', !settings.readParentheticals)}
                className="text-indigo-600 dark:text-indigo-400"
                aria-label={settings.readParentheticals ? "Enabled" : "Disabled"}
              >
                {settings.readParentheticals ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Assignments */}
      {selectedVoicePreset.type === 'voice' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Characters and Voices
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
                className={`p-2 rounded-lg transition-colors ${settings.voiceEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                title={settings.voiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
              >
                {settings.voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              
              <button
                onClick={loadVoices}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Refresh Voices"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            {/* Your Role */}
            <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Your Role</h4>
              </div>
              <div className="flex items-center gap-3 ml-3">
                <span className={`text-2xl font-bold ${focusedRole ? characters.find(c => c.name === focusedRole)?.color.replace('bg-', 'text-') || 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {focusedRole || 'No character selected'}
                </span>
                <span className="text-sm bg-green-600 text-white px-2 py-0.5 rounded">
                  You speak this role
                </span>
              </div>
            </div>
            
            {/* Narrator Voice */}
            <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Narrator Voice</h4>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={settings.narratorVoiceId || ''}
                  onChange={(e) => updateSettings({ narratorVoiceId: e.target.value })}
                  className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="">Select narrator voice</option>
                  {voices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                
                {settings.narratorVoiceId && (
                  <button
                    onClick={() => {
                      const voice = voices.find(v => v.voice_id === settings.narratorVoiceId);
                      if (voice?.preview_url) {
                        playPreview('narrator', voice.preview_url);
                      }
                    }}
                    disabled={activePreview === 'narrator'}
                    className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    title="Preview Voice"
                  >
                    {activePreview === 'narrator' ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Character Voices */}
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Other Characters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {characters.filter(char => char.name !== focusedRole).map((character) => (
                <div 
                  key={character.name}
                  className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xl font-bold ${character.color.replace('bg-', 'text-')}`}>
                      {character.name}
                    </span>
                    {character.voiceId && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        Voice assigned
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={character.voiceId || ''}
                      onChange={(e) => handleVoiceChange(character.name, e.target.value)}
                      className="flex-1 p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      <option value="">Select voice</option>
                      {voices.map((voice) => (
                        <option key={voice.voice_id} value={voice.voice_id}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                    
                    {character.voiceId && (
                      <button
                        onClick={() => {
                          const voice = voices.find(v => v.voice_id === character.voiceId);
                          if (voice?.preview_url) {
                            playPreview(character.name, voice.preview_url);
                          }
                        }}
                        disabled={activePreview === character.name}
                        className="p-2 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                      >
                        {activePreview === character.name ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Only show the Load More button when we have characters */}
      {characters.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadVoices}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load More Voices</span>
          </button>
        </div>
      )}
    </div>
  );
};