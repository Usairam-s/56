import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { voiceManager } from '../lib/voiceManager';
import { LoadingSpinner } from './LoadingSpinner';
import { Volume2, VolumeX, AlertCircle, Check, X, Maximize2, Minimize2, FileText } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';

export const Teleprompter: React.FC = () => {
  const {
    text,
    fontSize,
    scrollSpeed,
    isPlaying,
    isMirrorMode,
    isDarkMode,
    settings,
    characters,
    focusedRole,
    activeTab,
    togglePlay,
    updateSettings
  } = useTeleprompterStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [lastSpokenIndex, setLastSpokenIndex] = useState(-1);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setIsVisible(activeTab === 'prompter');
  }, [activeTab]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Create audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = containerRef.current?.parentElement;
      if (elem) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Process text into HTML (memoized)
  const processText = useMemo(() => {
    if (!text) return '';

    const lines = text.split('\n');
    const formattedLines: string[] = [];
    let lineIndex = 0;
    
    // Add small padding at top to start clean
    formattedLines.push(`<div class="h-1"></div>`);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formattedLines.push('<div class="mb-1"></div>');
        continue;
      }

      // Check for scene headings
      if (/^[A-Z][^a-z:]*$/.test(trimmedLine) || 
          /^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT)/i.test(trimmedLine)) {
        formattedLines.push(`
          <div 
            class="script-line text-gray-400 font-bold mb-1 text-center uppercase tracking-wider scene-heading ${
              currentLineIndex === lineIndex ? 'bg-indigo-500/10 p-1 rounded-lg' : 'p-1'
            }"
            data-line-index="${lineIndex}"
            data-type="location"
          >
            ${trimmedLine}
          </div>
        `);
        lineIndex++;
        continue;
      }

      // Check for technical directions (in parentheses on their own line)
      if (/^\(.*\)$/.test(trimmedLine)) {
        formattedLines.push(`
          <div 
            class="script-line text-gray-500/70 mb-1 italic transition-all duration-300 technical-direction ${
              currentLineIndex === lineIndex ? 'bg-indigo-500/10 p-1 rounded-lg' : 'p-1'
            }"
            data-line-index="${lineIndex}"
            data-type="parenthetical"
          >
            ${trimmedLine}
          </div>
        `);
        lineIndex++;
        continue; 
      }

      // Handle character dialog
      let isCharacterLine = false;
      for (const char of characters) {
        if (!char.name) continue;
        
        const pattern = new RegExp(`^(${char.name}:)(.*)$`);
        const match = trimmedLine.match(pattern);
        
        if (match) {
          isCharacterLine = true;
          const [, charName, dialog] = match;
          const isCurrentCharacter = char.name === focusedRole;
          const isCurrentlyReading = lineIndex === currentLineIndex;
          const isSpeaking = currentSpeaker === char.name;
          const colorClass = char.color?.replace('bg-', 'text-') || 'text-white';
          
          formattedLines.push(`
            <div 
              class="script-line flex flex-col gap-1 mb-2 transition-all duration-300 character-dialog ${
                isCurrentlyReading ? 'bg-indigo-500/20 dark:bg-indigo-500/30 p-2 rounded-lg' : 'p-2'
              }"
              data-line-index="${lineIndex}"
              data-type="dialog"
              data-character="${char.name}"
              data-dialog="${dialog.trim()}"
              ${isCurrentCharacter ? 'data-skip-reading="true"' : ''}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="${colorClass} font-bold text-3xl ${isCurrentCharacter ? 'character-highlight' : ''}">${char.name}</span>
                  ${isCurrentCharacter ? 
                    '<span class="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">Your Line</span>' : 
                    ''
                  }
                </div>
                ${isCurrentlyReading && settings.voiceEnabled && !isCurrentCharacter ? `
                  <div class="flex items-center gap-2">
                    ${isSpeaking ? ` 
                      <span class="text-xs bg-green-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                        <span class="animate-pulse">Speaking...</span>
                      </span>
                    ` : `
                      <span class="text-xs bg-gray-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                        <span>Ready</span>
                      </span>
                    `}
                  </div>
                ` : ''}
              </div>
              <span class="${ 
                isCurrentCharacter 
                  ? 'text-white font-medium text-2xl highlight-text pl-4' 
                  : isCurrentlyReading 
                    ? 'text-white text-xl pl-4' 
                    : 'text-white/80 text-xl pl-4'
              }">
                ${dialog.trim()}
              </span>
            </div>
          `);
          lineIndex++;
          break;
        }
      }

      // Handle action/description (not a character line and not already handled)
      if (!isCharacterLine) {
        formattedLines.push(`
          <div 
            class="script-line text-white/80 mb-2 transition-all duration-300 ${
              currentLineIndex === lineIndex ? 'bg-indigo-500/10 p-2 rounded-lg' : 'p-2'
            }"
            data-line-index="${lineIndex}"
            data-type="action"
          >
            ${trimmedLine}
          </div>
        `);
        lineIndex++;
      }
    }
    
    // Add small padding at end 
    formattedLines.push(`<div class="h-4"></div>`);
    
    return formattedLines.join('');
  }, [text, characters, currentLineIndex, currentSpeaker, focusedRole, settings.voiceEnabled]);

  // Process visible lines for audio - SIMPLIFIED WITH NO CACHING
  useEffect(() => {
    if (!isPlaying || !settings.voiceEnabled || isPlayingAudio || 
        visibleLines.length === 0 || !isVisible) {
      return;
    }

    const currentLineIndex = visibleLines[0];
    
    // Skip if already spoken
    if (currentLineIndex <= lastSpokenIndex) {
      return;
    }

    const processCurrentLine = async () => {
      try {
        const lineElements = containerRef.current?.getElementsByClassName('script-line');
        if (!lineElements) return;

        // Find the current line element
        const currentLine = Array.from(lineElements).find(
          el => parseInt(el.getAttribute('data-line-index') || '-1', 10) === currentLineIndex
        );
        
        if (!currentLine) return;
        
        // Skip if marked to be skipped (user's character)
        const skipReading = currentLine.getAttribute('data-skip-reading') === 'true';
        if (skipReading) {
          setLastSpokenIndex(currentLineIndex);
          return;
        }
        
        const lineType = currentLine.getAttribute('data-type');
        
        // Check if we should read this type of line
        if (
          (lineType === 'location' && !settings.readLocations) || 
          (lineType === 'action' && !settings.readActions) ||
          (lineType === 'parenthetical' && !settings.readParentheticals)
        ) {
          setLastSpokenIndex(currentLineIndex);
          return;
        }
        
        // Process narration (locations, actions, parentheticals)
        if ((lineType === 'location' || lineType === 'action' || lineType === 'parenthetical') && 
            settings.narratorVoiceId) {
          const lineText = currentLine.textContent?.trim();
          if (lineText) {
            try {
              const audioUrl = await voiceManager.getAudio(lineText, settings.narratorVoiceId);
              await playAudio(audioUrl, 'Narrator');
            } catch (error) {
              console.error(`Failed to play ${lineType}:`, error);
            }
          }
        } 
        // Process dialog
        else if (lineType === 'dialog') {
          const characterName = currentLine.getAttribute('data-character');
          const dialogText = currentLine.getAttribute('data-dialog');
          
          if (characterName && dialogText && characterName !== focusedRole) {
            const character = characters.find(c => c.name === characterName);
            if (character?.voiceId) {
              try {
                const audioUrl = await voiceManager.getAudio(dialogText, character.voiceId);
                await playAudio(audioUrl, characterName);
              } catch (error) {
                console.error('Failed to play dialog:', error);
              }
            }
          }
        }
        
        setLastSpokenIndex(currentLineIndex);
      } catch (error) {
        console.error('Error processing line:', error);
        setLastSpokenIndex(currentLineIndex); // Skip this line on error
      }
    };
    
    processCurrentLine();
  }, [visibleLines, isPlaying, settings.voiceEnabled, settings.narratorVoiceId, 
      settings.readLocations, settings.readActions, settings.readParentheticals, 
      isPlayingAudio, characters, focusedRole, lastSpokenIndex, isVisible]);

  // Play audio and return a promise - SIMPLIFIED
  const playAudio = async (url: string, speaker: string): Promise<void> => {
    if (!audioRef.current) return;
    
    try {
      setIsPlayingAudio(true);
      setCurrentSpeaker(speaker);
      
      // Clear any existing source
      audioRef.current.pause();
      audioRef.current.src = '';
      
      // Set the new source and play directly
      audioRef.current.src = url;
      audioRef.current.playbackRate = Math.min(2.0, Math.max(0.5, settings.wordsPerMinute / 150));
      
      // Return a promise that resolves when the audio ends
      await new Promise<void>((resolve) => {
        if (!audioRef.current) {
          resolve();
          return;
        }
        
        const handleEnd = () => {
          cleanup();
          resolve();
        };
        
        const handleError = () => {
          console.log("Audio error - continuing anyway");
          cleanup();
          resolve();
        };
        
        const cleanup = () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('ended', handleEnd);
            audioRef.current.removeEventListener('error', handleError);
          }
        };
        
        audioRef.current.addEventListener('ended', handleEnd);
        audioRef.current.addEventListener('error', handleError);
        
        // Start playback immediately
        audioRef.current.play().catch(e => {
          console.log("Play error:", e);
          handleError();
        });
        
        // Set a short timeout to prevent hanging
        setTimeout(() => {
          cleanup();
          resolve(); // Resolve anyway after timeout
        }, 5000); // 5 second max wait
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlayingAudio(false);
      setCurrentSpeaker(null);
    }
  };

  // Handle scrolling with smooth acceleration
  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    const scroll = () => {
      if (containerRef.current && isReady && isVisible) {
        containerRef.current.scrollTop += (scrollSpeed / 50);
        const lineElements = containerRef.current.getElementsByClassName('script-line');
        if (!lineElements || lineElements.length === 0) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const centerY = containerRect.top + (containerRect.height / 2);
        const visible: number[] = [];

        Array.from(lineElements).forEach((element) => {
          const rect = element.getBoundingClientRect();
          const lineIndex = parseInt(element.getAttribute('data-line-index') || '-1', 10);
          if (rect.top <= centerY && rect.bottom >= centerY && lineIndex !== -1) {
            visible.push(lineIndex);
          }
        });

        if (visible.length > 0 && visible[0] !== currentLineIndex) {
          setCurrentLineIndex(visible[0]);
          setVisibleLines(visible);
        }
      }
    };

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (isPlaying && isReady && isVisible) {
      scrollIntervalRef.current = window.setInterval(scroll, 16);
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isPlaying, scrollSpeed, currentLineIndex, isReady, isVisible]);

  // Reset when starting playback - SIMPLIFIED
  useEffect(() => {
    if (!isPlaying) {
      setIsReady(false);
      setValidationStatus(null);
      
      // 
      // Clear audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      return;
    }

    const startPlayback = async () => {
      setValidationStatus({
        isValid: true,
        message: 'Preparing...'
      });

      try {
        // Basic validation
        if (!text) {
          setValidationStatus({
            isValid: false,
            message: 'Script is empty'
          });
          togglePlay();
          return;
        }

        // Reset scroll position
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
        
        // Reset states
        setLastSpokenIndex(-1);
        setCurrentLineIndex(-1);
        setVoiceError(null);
        setCurrentSpeaker(null);
        setIsPlayingAudio(false);
        
        // Ready immediately
        setIsReady(true);
        
        setValidationStatus({
          isValid: true,
          message: 'Ready'
        });

        // Clear validation status quickly
        setTimeout(() => {
          setValidationStatus(null);
        }, 1000);
      } catch (error) {
        console.error('Playback preparation error:', error);
        setValidationStatus({
          isValid: false,
          message: 'Failed to prepare'
        });
        togglePlay();
      }
    };

    startPlayback();
  }, [isPlaying, text, togglePlay]);

  const handleViewScript = () => {
    // Pause teleprompter when viewing script
    if (isPlaying) {
      togglePlay();
    }
    setShowDocumentPreview(true);
  };

  const toggleVoiceEnabled = () => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled });
    
    // Clear current audio when disabling
    if (settings.voiceEnabled && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlayingAudio(false);
      setCurrentSpeaker(null);
    }
  };

  return (
    <div className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[calc(100vh-8rem)]'}`}>
      <audio ref={audioRef} className="hidden" />
      
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

      {/* Control bar */}
      <div className="absolute top-2 left-0 right-0 z-20 flex items-center justify-between px-4">
        {/* Left side - Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceEnabled}
            className={`flex items-center p-2 rounded-full transition-colors ${
              settings.voiceEnabled 
                ? 'bg-green-600/80 text-white hover:bg-green-700/80'
                : 'bg-gray-600/80 text-white hover:bg-gray-700/80'
            }`}
            title={settings.voiceEnabled ? "Disable Voice" : "Enable Voice"}
          >
            {settings.voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {isPlayingAudio && (
            <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full">
              <LoadingSpinner size="sm" className="text-white" />
              <span className="text-sm">{currentSpeaker} Speaking...</span>
            </div>
          )}
        </div>
        
        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleViewScript}
            className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700/80 transition-colors"
            title="View Script"
          >
            <FileText className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800/80 text-white rounded-full hover:bg-gray-700/80 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validationStatus && ( 
        <div className={`
          absolute top-3 left-1/2 -translate-x-1/2 z-20 
          flex items-center gap-2 px-3 py-1 rounded-full
          ${validationStatus.isValid 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
          }
        `}> 
          {validationStatus.isValid ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{validationStatus.message}</span>
        </div>
      )}

      {/* Error Message */}
      {voiceError && ( 
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{voiceError}</span>
          <button 
            onClick={() => setVoiceError(null)}
            className="ml-1 hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className={`teleprompter-container w-full h-full bg-black text-white overflow-y-auto rounded-lg relative ${
          isMirrorMode ? 'transform scale-x-[-1]' : '' 
        } ${isDarkMode ? 'bg-gray-900' : 'bg-black'}`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '1.4',
          padding: '0.25rem 1rem',
          scrollBehavior: 'smooth'
        }}
      > 
        <div 
          className={`max-w-4xl mx-auto ${isMirrorMode ? 'transform scale-x-[-1]' : ''}`}
          dangerouslySetInnerHTML={{ __html: processText }}
        />
      </div>

      <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <div 
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(to right, 
              transparent 0%, 
              ${settings.highlightColor}88 20%, 
              ${settings.highlightColor}88 80%, 
              transparent 100%
            )`
          }}
        />
      </div>

      {/* Document Preview Modal */}
      {showDocumentPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <DocumentPreview onClose={() => setShowDocumentPreview(false)} />
          </div>
        </div>
      )}
    </div>
  );
};