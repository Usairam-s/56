import React, { useState, useEffect, useRef } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { RecentScripts } from './RecentScripts';
import { FormatGuide } from './FormatGuide';
import { PdfUploader } from './PdfUploader';
import { ScriptPreview } from './ScriptPreview';
import { Type, ChevronDown, ChevronUp, Bot, Save, Sparkles, AlertCircle, ArrowRight, RefreshCw, Maximize2, Minimize2, ArrowRightCircle, Plus, FileText, Pencil, ChevronRight, ChevronLeft, Upload, FileUp, X, Check, FileType, AlignCenter, BookOpen, Mic, Eye, Download, Printer, Settings2, Info, HelpCircle, MailQuestion as QuestionMark } from 'lucide-react';
import { analyzeScript } from '../lib/openai';
import { useDebounce } from '../hooks/useDebounce';
import { LoadingSpinner } from './LoadingSpinner';
import { formatScript, extractScriptTitle, formatForTeleprompter } from '../lib/scriptFormatter';

export const TextEditor: React.FC = () => {
  const { 
    text, 
    setText, 
    currentScriptId,
    savedScripts,
    saveCurrentScript,
    updateCurrentScript,
    forceDetectCharacters,
    setAnalysis,
    saveAndContinue,
    setActiveTab
  } = useTeleprompterStore();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showPdfUploader, setShowPdfUploader] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [isNewDocument, setIsNewDocument] = useState(true);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);
  const [formatType, setFormatType] = useState<'standard' | 'teleprompter'>('standard');
  const [lastEditTime, setLastEditTime] = useState<number>(Date.now());
  const [autoSaveTimerId, setAutoSaveTimerId] = useState<NodeJS.Timeout | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formatError, setFormatError] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [autoFormat, setAutoFormat] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [showRecentScripts, setShowRecentScripts] = useState(true);

  // Auto-save when text changes
  const debouncedText = useDebounce(text || '', 2000);

  // Update last edit time whenever text changes
  useEffect(() => {
    if (text) {
      setLastEditTime(Date.now());
    }
  }, [text]);

  // Auto-save logic
  useEffect(() => {
    if (!autoSaveEnabled) return;

    // Clear any existing timers
    if (autoSaveTimerId) {
      clearTimeout(autoSaveTimerId);
    }

    // Don't save empty or very short content
    if (!debouncedText || debouncedText.trim().length < 10) {
      return;
    }

    // If script already has an ID, update it
    if (currentScriptId) {
      updateCurrentScript();
      setAutoSaveIndicator('Auto-saved');
      setLastSaveTime(new Date());
      setTimeout(() => setAutoSaveIndicator(''), 2000);
      return;
    }

    // For new scripts (without ID), we'll auto-save after a delay
    const timerId = setTimeout(() => {
      // Only auto-save if content is meaningful and no save dialog is open
      if (debouncedText.trim().length >= 10 && !showSaveDialog && !currentScriptId) {
        // Generate a title if needed
        const generatedTitle = extractScriptTitle(debouncedText);
        if (generatedTitle && generatedTitle !== 'Untitled Script') {
          saveCurrentScript(generatedTitle);
          setAutoSaveIndicator('Script saved');
          setLastSaveTime(new Date());
          setTimeout(() => setAutoSaveIndicator(''), 2000);
        } else {
          // If we can't generate a good title, prompt the user to save
          setScriptTitle(generatedTitle);
          setShowSaveDialog(true);
        }
      }
    }, 10000); // 10 seconds of inactivity before auto-saving new scripts

    setAutoSaveTimerId(timerId);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [debouncedText, currentScriptId, showSaveDialog, updateCurrentScript, saveCurrentScript, autoSaveEnabled]);

  // Start with PDF uploader by default for new users
  useEffect(() => {
    // Only show PDF uploader if there's no text and it's a new document
    const hasText = Boolean(text && text.trim().length > 0);
    setShowPdfUploader(!hasText && isNewDocument);
    
    // Show editor whenever there's text or user wants to create a new script
    setShowEditor(hasText || !isNewDocument);
  }, [text, isNewDocument]);

  // Handle fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  const handleTextChange = (newText: string) => {
    try {
      if (!newText) {
        setText('');
        return;
      }

      let cleanedText = newText
        .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFFFE\uFFFF]/g, ' ') // Remove control chars and replacement chars
        .replace(/\uD83D[\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uFFFD/g, ' '); // Remove broken emoji
      
      // Auto-format if enabled
      if (autoFormat) {
        cleanedText = formatScript(cleanedText);
      }
      
      setText(cleanedText);
      
      // Hide PDF uploader once the user starts typing
      setShowPdfUploader(false);
      setShowEditor(true);
      setUploadComplete(false);
    } catch (error) {
      console.error('Error cleaning text:', error);
      // If cleaning fails, just use the raw text
      setText(newText);
    }
  };

  const handleFormatScript = () => {
    const currentText = text || ''; // Handle null/undefined text
    if (!currentText.trim()) return;
    
    setIsFormatting(true);
    setFormatSuccess(false);
    setFormatError(false);
    
    // Format using OpenAI
    formatScriptWithAI(currentText)
      .then(formattedText => {
        setText(formattedText);
        setFormatSuccess(true);
        setTimeout(() => setFormatSuccess(false), 2000);
      })
      .catch(error => {
        console.error('AI formatting error:', error);
        setFormatError(true);
        setTimeout(() => setFormatError(false), 2000);
        
        // Fallback to basic formatting
        try {
          const basicFormatted = formatScript(currentText);
          setText(basicFormatted);
        } catch (e) {
          console.error('Basic formatting also failed:', e);
        }
      })
      .finally(() => {
        setIsFormatting(false);
      });
  };

  // Placeholder for the actual implementation
  const formatScriptWithAI = async (text: string): Promise<string> => {
    // This would typically call your OpenAI API endpoint
    // For now, just use the basic formatter
    return formatScript(text);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardText = e.clipboardData.getData('text');
    try {
      // Remove any non-printable characters or broken Unicode from clipboard text
      const cleanedText = clipboardText
        .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFFFE\uFFFF]/g, ' ') // Remove control chars
        .replace(/\uD83D[\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uFFFD/g, ' ') // Remove emojis
        .replace(/([A-Z][A-Z\s]+)(?:\s+)([A-Z][A-Z\s]+):/g, '$1 $2:') // Fix split character names
        .replace(/\s*\(CONT'D\)\s*/gi, '') // Remove CONT'D markers
        .replace(/\s+/g, ' '); // Normalize spaces
        
      handleTextChange(cleanedText);
    } catch (error) {
      console.error('Error handling paste:', error);
      // Fallback to direct text insertion
      setText(clipboardText);
    }
  };

  const handleSave = () => {
    if (!currentScriptId) {
      // Try to generate a title from the script content
      if (!scriptTitle && text) {
        setScriptTitle(extractScriptTitle(text || ''));
      }
      setShowSaveDialog(true);
    } else {
      updateCurrentScript();
      setAutoSaveIndicator('Saved');
      setLastSaveTime(new Date());
      setTimeout(() => setAutoSaveIndicator(''), 2000);
    }
  };

  const handleSaveNew = () => {
    if (scriptTitle.trim()) {
      saveCurrentScript(scriptTitle);
      setScriptTitle('');
      setShowSaveDialog(false);
      setAutoSaveIndicator('Saved');
      setLastSaveTime(new Date());
      setTimeout(() => setAutoSaveIndicator(''), 2000);
    }
  };

  const handleNewScript = () => {
    setText('');
    setScriptTitle('');
    setIsNewDocument(true);
    setShowPdfUploader(true);
    setShowEditor(false);
    setUploadComplete(false);
    setAnalysisError(null);
  };

  const handleCreateBlankScript = () => {
    setText('');
    setScriptTitle('');
    setIsNewDocument(false);
    setShowPdfUploader(false);
    setShowEditor(true);
    setUploadComplete(false);
    setAnalysisError(null);
  };

  const handleAnalyze = async () => {
    // Use optional chaining and nullish coalescing for safe access
    const currentText = text || '';
    if (!currentText.trim()) {
      setAnalysisError('Please enter a script first');
      return;
    }
    
    // Save current script before analyzing if it's not saved yet
    if (!currentScriptId && currentText.trim().length >= 10) {
      const autoTitle = extractScriptTitle(currentText);
      saveCurrentScript(autoTitle);
    }
    
    setShowPdfUploader(false);
    saveAndContinue();
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Basic character detection as fallback
      forceDetectCharacters();
      
      // Switch to analysis tab right away
      setActiveTab('analysis');
    } catch (error: any) {
      console.error('Failed to analyze script:', error);
      setAnalysisError(error?.message || 'Failed to analyze the script. Basic character detection will be used instead.');
      
      // Continue to analysis tab with basic detection
      setTimeout(() => {
        setActiveTab('analysis');
      }, 1000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadComplete = () => {
    setShowPdfUploader(false);
    setShowEditor(true);
    setUploadComplete(true);
    
    // Extract title from current text if we don't have one yet
    if (!scriptTitle && text) {
      const extractedTitle = extractScriptTitle(text || '');
      setScriptTitle(extractedTitle);
      // Auto-save with the extracted title
      if (extractedTitle !== 'Untitled Script') {
        setTimeout(() => {
          saveCurrentScript(extractedTitle);
          setAutoSaveIndicator('Saved');
          setLastSaveTime(new Date());
          setTimeout(() => setAutoSaveIndicator(''), 2000);
        }, 1000);
      }
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="container mx-auto p-2">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Script Editor
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                <QuestionMark className="w-3 h-3" />
                <span>Format Guide</span>
              </button>
              {autoSaveIndicator && (
                <span className="text-xs text-green-600 dark:text-green-400 ml-2 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {autoSaveIndicator}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Top Action Buttons */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg">
            {/* Format Button */}
            <div className="flex items-center">
              <button
                onClick={handleFormatScript}
                disabled={isFormatting || !text || (!text || !text.trim().length) || autoFormat}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs
                  ${isFormatting || !text || (!text || !text.trim().length) || autoFormat
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200'
                  }
                `}
              >
                {isFormatting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="hidden sm:inline">Formatting...</span>
                  </>
                ) : (
                  <>
                    <AlignCenter className="w-4 h-4" />
                    <span className="hidden sm:inline">Format</span>
                  </>
                )}
              </button>
            </div>

            {/* Format Type Group */}
            <div className="flex gap-1">
              <button
                onClick={() => setFormatType('standard')}
                className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                  formatType === 'standard'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
                title="Standard screenplay format"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Standard</span>
              </button>
              
              <button
                onClick={() => setFormatType('teleprompter')}
                className={`px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                  formatType === 'teleprompter'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
                title="Optimized for teleprompter reading"
              >
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Teleprompter</span>
              </button>
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={togglePreview}
            disabled={!text || (!text || !text.trim().length)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs
              ${!text || (!text || !text.trim().length)
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200'
              }
            `}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!text || (!text || !text.trim().length)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs
              ${!text || (!text || !text.trim().length)
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Recent Scripts Component - Collapsible */}
      <div className="mb-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Recent Scripts
          </h3>
          <button
            onClick={() => setShowRecentScripts(!showRecentScripts)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showRecentScripts ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {showRecentScripts && (
          <div className="p-2">
            <RecentScripts />
          </div>
        )}
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2 mb-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Auto-format Toggle */}
        <button
          onClick={() => setAutoFormat(!autoFormat)}
          className={`
            px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1
            ${autoFormat
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }
          `}
        >
          <Check className="w-3 h-3" />
          <span>Auto-Format</span>
        </button>

        {/* Auto-save Toggle */}
        <button
          onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
          className={`
            px-2 py-1 text-xs rounded-lg transition-colors flex items-center gap-1
            ${autoSaveEnabled
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }
          `}
        >
          <Check className="w-3 h-3" />
          <span>Auto-Save</span>
        </button>

        {/* Create New Script Button */}
        <button
          onClick={handleNewScript}
          className="px-2 py-1 text-xs rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          <span>New Script</span>
        </button>

        {/* New Analyze Button (only show if text exists) */}
        {text && (text && text.trim().length > 0) && (
          <button
            onClick={handleAnalyze}
            className="ml-auto px-2 py-1 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 shadow-sm"
          >
            <Bot className="w-3 h-3" />
            <span>Analyze & Continue</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Format Guide (Collapsible) */}
      {showFormatGuide && (
        <div className="mb-3">
          <FormatGuide expanded={false} />
        </div>
      )}

      {/* Main Content Area - Full Width */}
      <div className="grid grid-cols-1 gap-3">
        {/* Editor */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex gap-1 p-2">
                <button
                  onClick={() => {
                    setShowPdfUploader(false);
                    setShowEditor(true);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                    showEditor && !showPdfUploader
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Editor</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowPdfUploader(true);
                    setShowEditor(false);
                  }}
                  className={`px-3 py-1 rounded-lg transition-colors text-xs ${
                    showPdfUploader
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <FileUp className="w-4 h-4" />
                    <span>Import Script</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="p-3">
              {showPdfUploader && (
                <div className="space-y-2">
                  <PdfUploader 
                    onUpload={handleUploadComplete} 
                    onTitleExtracted={setScriptTitle}
                  />
                </div>
              )}

              {showEditor && (
                <div className="space-y-2">
                  <textarea
                    value={text || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    onPaste={handlePaste}
                    className="w-full h-[calc(100vh-22rem)] font-mono text-base leading-relaxed p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 script-editor prompter-text screenplay-format"
                    placeholder={`Start writing your script here...

INT. COFFEE SHOP - MORNING

A cozy coffee shop bustles with morning activity. Sunlight streams through large windows.

SARAH: Good morning! Can I get a cappuccino, please?

BARISTA: Of course! That'll be $4.50. Would you like anything else?

SARAH: Actually, yes. Could you add a blueberry muffin?
                         (checking her phone)
                That's all, thanks!`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Next Steps for editor */}
          {text && (text && text.trim().length > 0) && (
            <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                Next Steps
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Script</span>
                </button>
                <button
                  onClick={handleAnalyze}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span>Analyze & Continue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format Success/Error Messages */}
      {(formatSuccess || formatError) && (
        <div className={`
          p-3 rounded-lg mt-3 flex items-center gap-2 text-sm
          ${formatSuccess 
            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }
        `}>
          {formatSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Script formatted successfully</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Failed to format script. Please try again.</span>
            </>
          )}
          <button 
            onClick={() => {
              setFormatSuccess(false);
              setFormatError(false);
            }}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl">
            <ScriptPreview 
              onClose={togglePreview} 
              format={formatType}
            />
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Save Your Script
            </h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="script-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Script Title
                </label>
                <input
                  id="script-title"
                  type="text"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter a title for your script"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!scriptTitle.trim()}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};