import React from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import {
  Settings,
  Monitor,
  Moon,
  Sun,
  Volume2,
  Type,
  FastForward,
  Languages,
  Palette,
  Users,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Mic
} from 'lucide-react';

export const TeleprompterSettings: React.FC = () => {
  const {
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    isDarkMode,
    toggleDarkMode,
    isMirrorMode,
    toggleMirrorMode,
    settings,
    updateSettings,
    characters,
    focusedRole,
    setFocusedRole
  } = useTeleprompterStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg space-y-6">
      {/* Character Selection */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Users className="w-5 h-5 text-indigo-600" />
          Your Role
        </h3>
        <div className="space-y-4">
          <select
            value={focusedRole}
            onChange={(e) => setFocusedRole(e.target.value)}
            className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Choose your character...</option>
            {characters.map((char) => (
              <option key={char.name} value={char.name}>
                {char.name}
              </option>
            ))}
          </select>
          {focusedRole && (
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              You will read the lines for {focusedRole}
            </p>
          )}
          {characters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {characters.map((char) => (
                <button
                  key={char.name}
                  onClick={() => setFocusedRole(char.name)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm
                    ${char.color.replace('bg-', 'bg-opacity-20 text-')}
                    ${char.name === focusedRole ? 'ring-2 ring-indigo-500 font-medium' : ''}
                    hover:ring-2 hover:ring-indigo-300 transition-all
                  `}
                >
                  {char.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Reading Options */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Volume2 className="w-5 h-5 text-indigo-600" />
          Voice Reading Settings
        </h3>
        <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          {/* Voice Enabled Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Voice
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn on/off all AI voice readings
              </p>
            </div>
            <button
              onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
              className="text-indigo-600 dark:text-indigo-400"
              aria-label={settings.voiceEnabled ? "Enabled" : "Disabled"}
            >
              {settings.voiceEnabled ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>
          
          {/* Read Location Descriptions Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Read Location Descriptions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Read scene headings like "INT. COFFEE SHOP - MORNING"
              </p>
            </div>
            <button
              onClick={() => updateSettings({ readLocations: !settings.readLocations })}
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
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Read Action Descriptions
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Read scene descriptions and action narratives
              </p>
            </div>
            <button
              onClick={() => updateSettings({ readActions: !settings.readActions })}
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
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Read Parentheticals
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Read character instructions like "(laughing)" or "(confused)"
              </p>
            </div>
            <button
              onClick={() => updateSettings({ readParentheticals: !settings.readParentheticals })}
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

      {/* Display Settings */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Type className="w-5 h-5 text-indigo-600" />
          Display
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Font Size
            </label>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {fontSize}px
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Highlight Color
            </label>
            <input
              type="color"
              value={settings.highlightColor}
              onChange={(e) => updateSettings({ highlightColor: e.target.value })}
              className="w-full h-8 rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Scroll Settings */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <FastForward className="w-5 h-5 text-indigo-600" />
          Scrolling
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Scroll Speed
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {scrollSpeed}%
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Words Per Minute
            </label>
            <input
              type="range"
              min="80"
              max="200"
              value={settings.wordsPerMinute}
              onChange={(e) => updateSettings({ wordsPerMinute: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {settings.wordsPerMinute} WPM
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-scroll
            </label>
            <button
              onClick={() => updateSettings({ autoScroll: !settings.autoScroll })}
              className="text-indigo-600 dark:text-indigo-400"
              aria-label={settings.autoScroll ? "Enabled" : "Disabled"}
            >
              {settings.autoScroll ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Smart Pause
            </label>
            <button
              onClick={() => updateSettings({ smartPause: !settings.smartPause })}
              className="text-indigo-600 dark:text-indigo-400"
              aria-label={settings.smartPause ? "Enabled" : "Disabled"}
            >
              {settings.smartPause ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Display Modes */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          <Monitor className="w-5 h-5 text-indigo-600" />
          Display Modes
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mirror Mode
            </label>
            <button
              onClick={toggleMirrorMode}
              className="text-indigo-600 dark:text-indigo-400"
              aria-label={isMirrorMode ? "Enabled" : "Disabled"}
            >
              {isMirrorMode ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </label>
            <button
              onClick={toggleDarkMode}
              className="text-indigo-600 dark:text-indigo-400"
              aria-label={isDarkMode ? "Enabled" : "Disabled"}
            >
              {isDarkMode ? (
                <ToggleRight className="w-10 h-10" />
              ) : (
                <ToggleLeft className="w-10 h-10" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};