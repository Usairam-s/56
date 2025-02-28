import React, { useState, useRef, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { 
  FileText, Download, Printer, Copy, Check, X, 
  Maximize2, Minimize2, ChevronDown, ChevronUp,
  Settings2, BookOpen, ArrowRight, Mic
} from 'lucide-react';

interface ScriptPreviewProps {
  onClose: () => void;
  format?: 'standard' | 'teleprompter';
}

export const ScriptPreview: React.FC<ScriptPreviewProps> = ({ 
  onClose,
  format = 'standard'
}) => {
  const { text, focusedRole, characters } = useTeleprompterStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formatType, setFormatType] = useState<'standard' | 'teleprompter'>(format);
  const previewRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Handle screen size monitoring
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Process text into formatted HTML
  const processScriptContent = (text: string): string => {
    if (!text) return '<p class="text-gray-400 italic">No content to display</p>';
    
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        formattedLines.push('<div class="h-4"></div>');
        continue;
      }
      
      // Check for scene headings (INT./EXT.)
      if (/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT)/i.test(line)) {
        formattedLines.push(`<div class="scene-heading">${line.toUpperCase()}</div>`);
        continue;
      }
      
      // Check for character names with dialog
      const charMatch = line.match(/^([A-Z][A-Z\s\-'.]*?):\s*(.*)$/);
      if (charMatch) {
        const [, charName, dialog] = charMatch;
        // Check if this is the focused character
        const isCurrentCharacter = charName === focusedRole;
        const characterColor = characters.find(c => c.name === charName)?.color || '';
        const colorClass = characterColor ? characterColor.replace('bg-', 'text-') : '';
        
        if (formatType === 'teleprompter') {
          // In teleprompter format, character names and dialog are on the same line for compactness
          formattedLines.push(`
            <div class="teleprompter-line ${isCurrentCharacter ? 'current-character-line' : ''}">
              <span class="teleprompter-character ${isCurrentCharacter ? 'current-character' : ''} ${colorClass}">${charName}:</span>
              <span class="teleprompter-dialog">${dialog}</span>
            </div>
          `);
        } else {
          // Standard screenplay format with separate lines
          formattedLines.push(`<div class="character ${isCurrentCharacter ? 'current-character' : ''} ${colorClass}">${charName}:</div>`);
          formattedLines.push(`<div class="dialog">${dialog}</div>`);
        }
        continue;
      }
      
      // Check for parentheticals
      if (/^\(.*\)$/.test(line)) {
        formattedLines.push(`<div class="parenthetical">${line}</div>`);
        continue;
      }
      
      // Default to action/description
      formattedLines.push(`<div class="action">${line}</div>`);
    }
    
    return formattedLines.join('\n');
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && previewRef.current) {
      previewRef.current.requestFullscreen().catch(err => {
        console.error('Error requesting fullscreen:', err);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
    setIsFullscreen(!isFullscreen);
  };

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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadAsTxt = () => {
    const fileName = `script_${focusedRole || 'full'}_${formatType}_${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const print = () => {
    const iframe = printFrameRef.current;
    if (!iframe) return;
    
    const doc = iframe.contentDocument;
    if (!doc) return;
    
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Script - ${focusedRole || 'Full'} (${formatType})</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              line-height: 1.5;
              padding: 1.5cm;
              color: #000;
              max-width: 21cm;
              margin: 0 auto;
            }
            
            ${getPreviewStyles()}
            
            .teleprompter-line {
              margin-bottom: 1em;
            }
            
            .teleprompter-character {
              font-weight: bold;
              margin-right: 0.5em;
            }
            
            .current-character-line {
              background-color: #f0f7ff;
              padding: 0.25em;
              border-radius: 0.25em;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 1.5cm;
              }
              
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${processScriptContent(text)}
        </body>
      </html>
    `);
    doc.close();
    
    // Print the document
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 500);
  };

  // Dynamic script preview styles based on format type
  const getPreviewStyles = () => {
    // Base styles common to both formats
    const baseStyles = `
      .scene-heading {
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 1.5em;
        margin-bottom: 1em;
        color: ${formatType === 'standard' ? '#6b7280' : '#4b5563'};
      }
      
      .action {
        margin-bottom: 1em;
      }
      
      .current-character {
        color: #4f46e5;
        text-decoration: underline;
      }
    `;
    
    // Format-specific styles
    const formatStyles = formatType === 'standard' 
      ? `
        .character {
          margin-top: 1.5em;
          margin-left: 3.5em;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .dialog {
          margin-left: 2em;
          margin-right: 3em;
          margin-bottom: 1em;
        }
        
        .parenthetical {
          margin-left: 2.5em;
          margin-right: 3em;
          font-style: italic;
          color: #6b7280;
        }
      `
      : `
        .character {
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .dialog {
          margin-left: 1em;
          margin-bottom: 1em;
        }
        
        .parenthetical {
          margin-left: 1.5em;
          font-style: italic;
          color: #6b7280;
        }
        
        .teleprompter-line {
          margin-bottom: 0.75em;
          line-height: 1.6;
        }
        
        .teleprompter-character {
          font-weight: bold;
          margin-right: 0.5em;
        }
        
        .current-character-line {
          background-color: rgba(79, 70, 229, 0.1);
          padding: 0.25em 0.5em;
          border-radius: 0.25em;
          display: inline-block;
        }
      `;
      
    // Screen size-specific adjustments
    const responsiveStyles = screenSize.width < 768 
      ? `
        .character {
          margin-left: ${formatType === 'standard' ? '1.5em' : '0'};
        }
        
        .dialog {
          margin-left: ${formatType === 'standard' ? '1em' : '0.5em'};
          margin-right: ${formatType === 'standard' ? '1em' : '0'};
        }
        
        .parenthetical {
          margin-left: ${formatType === 'standard' ? '1.25em' : '0.75em'};
          margin-right: ${formatType === 'standard' ? '1em' : '0'};
        }
      `
      : '';
    
    return baseStyles + formatStyles + responsiveStyles;
  };

  return (
    <div 
      ref={previewRef}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}
      `}
    >
      {/* Hidden print frame */}
      <iframe ref={printFrameRef} className="hidden" title="Print Frame" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Script Preview
            {focusedRole && ` (${focusedRole}'s View)`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Format Selection */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setFormatType('standard')}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1
                  ${formatType === 'standard' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                <BookOpen className="w-4 h-4" />
                <span>Screenplay Format</span>
              </button>
              <button
                onClick={() => setFormatType('teleprompter')}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1
                  ${formatType === 'teleprompter' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                <Mic className="w-4 h-4" />
                <span>Teleprompter Format</span>
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={downloadAsTxt}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={print}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b dark:border-gray-600 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Settings2 className="w-4 h-4" />
                <span>Format: {formatType === 'standard' ? 'Screenplay' : 'Teleprompter'}</span>
              </div>
              {focusedRole && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Highlighted: {focusedRole}'s lines
                </span>
              )}
            </div>
            <div 
              ref={contentRef}
              className="script-preview-container p-6 bg-white dark:bg-gray-800 max-h-[60vh] overflow-y-auto font-mono text-gray-800 dark:text-gray-200"
            >
              <style>
                {getPreviewStyles()}
              </style>
              <div className={`format-${formatType}`} dangerouslySetInnerHTML={{ __html: processScriptContent(text) }} />
            </div>
          </div>
          
          {/* Preview Guide */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              <p><strong>Screenplay Format:</strong> Standard screenplay formatting following industry conventions</p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              <p><strong>Teleprompter Format:</strong> Optimized for reading with clearer character names and more compact layout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};