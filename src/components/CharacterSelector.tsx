import React from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { User, Check, Volume2, VolumeX, ArrowRight } from 'lucide-react';

export const CharacterSelector: React.FC = () => {
  const { 
    characters, 
    focusedRole, 
    setFocusedRole,
    settings,
    updateSettings
  } = useTeleprompterStore();

  const handleRoleSelect = (name: string) => {
    setFocusedRole(name);
    updateSettings({ voiceEnabled: true });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char) => (
          <button
            key={char.name}
            onClick={() => handleRoleSelect(char.name)}
            className={`
              p-4 rounded-lg transition-all text-left
              ${char.name === focusedRole
                ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className={char.color.replace('bg-', 'text-')} />
                <span className="font-medium">{char.name}</span>
              </div>
              {char.name === focusedRole ? (
                <div className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Selected
                </div>
              ) : char.voiceId ? (
                <Volume2 className="w-4 h-4 text-green-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
            </div>
            {char.analysis && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {char.analysis.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {char.analysis.traits.map((trait, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Next Button */}
      {focusedRole && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => window.location.hash = '#prompter'}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>Continue to Teleprompter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};