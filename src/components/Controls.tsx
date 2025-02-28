import React from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  RotateCcw,
  StepBack,
  StepForward,
  Gauge
} from 'lucide-react';

export const Controls: React.FC = () => {
  const {
    isPlaying,
    fontSize,
    scrollSpeed,
    settings,
    togglePlay,
    setFontSize,
    setScrollSpeed,
    updateSettings
  } = useTeleprompterStore();

  const adjustSpeed = (delta: number) => {
    setScrollSpeed(Math.max(1, Math.min(200, scrollSpeed + delta)));
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(Math.max(16, Math.min(72, fontSize + delta)));
  };

  const resetScroll = () => {
    const container = document.querySelector('.teleprompter-container');
    if (container) {
      container.scrollTop = 0;
    }
  };

  return (
    <div className="controls-bar">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={resetScroll}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Reset to Start"
          >
            <RotateCcw className="w-5 h-5 text-white/80" />
          </button>

          <div className="flex items-center">
            <button
              onClick={() => adjustSpeed(-10)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Decrease Speed"
            >
              <Rewind className="w-5 h-5 text-white/80" />
            </button>

            <button
              onClick={togglePlay}
              className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white mx-2 transition-colors transform hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => adjustSpeed(10)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Increase Speed"
            >
              <FastForward className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => adjustFontSize(-2)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-5 h-5 text-white/80" />
            </button>
            <span className="text-sm text-white/80 min-w-[3ch] text-center">
              {fontSize}
            </span>
            <button
              onClick={() => adjustFontSize(2)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Increase Font Size"
            >
              <ZoomIn className="w-5 h-5 text-white/80" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80">Speed</span>
            <input
              type="range"
              min="1"
              max="200"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(Number(e.target.value))}
              className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-white/80 min-w-[3ch]">
              {scrollSpeed}%
            </span>
          </div>

          <button
            onClick={() => setScrollSpeed(200)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors transform hover:scale-105 active:scale-95"
            title="Max Speed"
          >
            <Gauge className="w-4 h-4" />
            <span className="text-sm">Max</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
              settings.voiceEnabled ? 'text-indigo-400' : 'text-white/80'
            }`}
            title={settings.voiceEnabled ? 'Disable Voice' : 'Enable Voice'}
          >
            {settings.voiceEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button
              onClick={() => {}}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Previous Character"
            >
              <StepBack className="w-5 h-5 text-white/80" />
            </button>

            <button
              onClick={() => {}}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Next Character"
            >
              <StepForward className="w-5 h-5 text-white/80" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button
              onClick={() => {}}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Previous Scene"
            >
              <SkipBack className="w-5 h-5 text-white/80" />
            </button>

            <button
              onClick={() => {}}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Next Scene"
            >
              <SkipForward className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};