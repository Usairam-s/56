import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { 
  Bot, ArrowRight, Check, User, Mic,
  AlertCircle, Wand2
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { analyzeScript } from '../lib/openai';

export const CharacterAnalysis: React.FC = () => {
  const { 
    text,
    characters,
    focusedRole,
    setFocusedRole,
    updateSettings,
    setActiveTab,
    forceDetectCharacters
  } = useTeleprompterStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisTimeout, setAnalysisTimeout] = useState<NodeJS.Timeout | null>(null);

  // Perform script analysis when component mounts
  useEffect(() => {
    if (!text || isAnalyzing) return;
    
    const performAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        setError(null);
        
        // Set timeout to fallback to basic detection after 15 seconds
        const timeout = setTimeout(() => {
          console.log('Analysis taking longer than expected, using basic detection');
          setIsAnalyzing(false);
          setError('Using basic character detection');
          forceDetectCharacters();
        }, 15000);
        
        setAnalysisTimeout(timeout);
        
        // Try to analyze script
        const analysis = await analyzeScript(text);
        
        // Clear timeout as analysis completed
        clearTimeout(timeout);
        
        if (!analysis || analysis.length === 0) {
          // Fallback to basic detection
          forceDetectCharacters();
        }
      } catch (err) {
        console.error('Analysis failed:', err);
        setError('Using basic character detection');
        forceDetectCharacters();
      } finally {
        setIsAnalyzing(false);
        if (analysisTimeout) {
          clearTimeout(analysisTimeout);
        }
      }
    };

    performAnalysis();
  }, [text, isAnalyzing, forceDetectCharacters]);

  const handleRoleSelect = (role: string) => {
    setFocusedRole(role);
    updateSettings({ voiceEnabled: true });
  };

  const handleContinue = () => {
    if (!focusedRole) return;
    setActiveTab('voices');
  };

  // Loading state
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
        <div className="relative">
          <Bot className="w-16 h-16 text-indigo-200 dark:text-indigo-900" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="md" className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Analyzing Your Script
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Detecting characters and dialog patterns...
          </p>
        </div>
      </div>
    );
  }

  // Error state with fallback
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-700 dark:text-yellow-300">Character Detection Notice</h3>
            <p className="text-yellow-600 dark:text-yellow-400">{error}</p>
          </div>
        </div>
        
        {/* Show detected characters */}
        {characters && characters.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Wand2 className="w-6 h-6 text-indigo-600" />
              Select Your Character
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <div 
                  key={char.name}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${char.name === focusedRole
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }
                  `}
                  onClick={() => handleRoleSelect(char.name)}
                >
                  <h3 className="font-semibold text-2xl mb-2 flex items-center justify-between">
                    {char.name}
                    {char.name === focusedRole && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </h3>
                  <button
                    onClick={() => handleRoleSelect(char.name)}
                    className={`
                      w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-all
                      ${char.name === focusedRole
                        ? 'bg-green-600 text-white'
                        : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200'
                      }
                    `}
                  >
                    {char.name === focusedRole ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        Selected
                      </span>
                    ) : (
                      <span>Choose This Role</span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {focusedRole && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleContinue}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-lg"
                >
                  <Mic className="w-5 h-5" />
                  <span>Continue to Voice Selection</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // No characters detected
  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
          No Characters Detected
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
          We couldn't detect any characters in your script. Please make sure your script includes character dialog in the format "CHARACTER: dialog".
        </p>
        <button
          onClick={() => forceDetectCharacters()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <Wand2 className="w-5 h-5" />
          Try Basic Detection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 z-50 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-indigo-600" />
            Select Your Character
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {focusedRole 
              ? `Selected Role: ${focusedRole}`
              : 'Choose which character you want to read'
            }
          </p>
        </div>
        
        {focusedRole && (
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm"
          >
            <Mic className="w-5 h-5" />
            <span>Continue</span>
          </button>
        )}
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char) => (
          <div 
            key={char.name}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${char.name === focusedRole
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-sm'
              }
            `}
            onClick={() => handleRoleSelect(char.name)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className={`w-5 h-5 ${char.name === focusedRole ? 'text-green-500' : 'text-indigo-600'}`} />
                <h3 className="font-semibold text-2xl text-gray-800 dark:text-gray-200">
                  {char.name}
                </h3>
              </div>
              {char.name === focusedRole && (
                <span className="flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  Your Role
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRoleSelect(char.name);
              }}
              className={`
                w-full mt-2 py-2 px-4 rounded-lg text-sm font-medium transition-all
                ${char.name === focusedRole
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200'
                }
              `}
            >
              {char.name === focusedRole ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Selected
                </span>
              ) : (
                <span>Choose This Role</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};