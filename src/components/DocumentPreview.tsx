import React, { useState, useEffect, useRef } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { FileText, Download, Printer, Copy, Check, Eye, ChevronDown, ChevronUp, X, Maximize2, Minimize2 } from 'lucide-react';

interface DocumentPreviewProps {
  onClose?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ onClose }) => {
  const { text, focusedRole, characters } = useTeleprompterStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'character'>('all');
  const previewRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  
  // Filter text for the active character if in character mode
  const filteredText = activeTab === 'character' && focusedRole 
    ? getCharacterLines(text, focusedRole) 
    : text;

  // Create styled document content
  const formattedContent = processScriptContent(filteredText);

  useEffect(() => {
    // Handle fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (previewRef.current) {
        previewRef.current.requestFullscreen().catch(err => {
          console.error('Fullscreen error:', err);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(filteredText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const downloadAsTxt = () => {
    const fileName = `script_${focusedRole || 'full'}_${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([filteredText], { type: 'text/plain' });
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
    
    // Create a styled document for printing
    const doc = iframe.contentDocument;
    if (!doc) return;
    
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Script - ${focusedRole || 'Full'}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              line-height: 1.5;
              padding: 1.5cm;
              color: #000;
              max-width: 21cm;
              margin: 0 auto;
            }
            
            .scene-heading {
              font-weight: bold;
              text-transform: uppercase;
              margin-top: 2em;
              margin-bottom: 1em;
            }
            
            .action {
              margin-bottom: 1em;
            }
            
            .character {
              margin-top: 1.5em;
              margin-left: 5em;
              text-transform: uppercase;
              font-weight: bold;
            }
            
            .dialog {
              margin-left: 3em;
              margin-right: 5em;
              margin-bottom: 1em;
            }
            
            .parenthetical {
              margin-left: 3.5em;
              margin-right: 5em;
              font-style: italic;
            }
            
            .current-character {
              color: #3949ab;
              text-decoration: underline;
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
          ${formattedContent}
        </body>
      </html>
    `);
    doc.close();
    
    // Print the document
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 500);
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
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
          {/* Tabs and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'all' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
              >
                Full Script
              </button>
              <button
                onClick={() => setActiveTab('character')}
                disabled={!focusedRole}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'character' 
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                  ${!focusedRole ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {focusedRole ? `${focusedRole}'s Lines` : 'Character View'} 
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
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </div>
              {activeTab === 'character' && focusedRole && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Showing only {focusedRole}'s lines
                </span>
              )}
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 max-h-[60vh] overflow-y-auto font-mono text-gray-800 dark:text-gray-200 script-preview">
              <style jsx="true">{`
                .script-preview .scene-heading {
                  font-family: 'Courier New', monospace;
                  font-weight: bold;
                  text-transform: uppercase;
                  margin-top: 1.5em;
                  margin-bottom: 1em;
                  color: #6b7280;
                }
                
                .script-preview .action {
                  font-family: 'Courier New', monospace;
                  margin-bottom: 1em;
                }
                
                .script-preview .character {
                  font-family: 'Courier New', monospace;
                  font-weight: bold;
                  margin-top: 1.5em;
                  margin-left: 20%;
                  color: #4b5563;
                }
                
                .script-preview .dialog {
                  font-family: 'Courier New', monospace;
                  margin-left: 10%;
                  margin-right: 10%;
                  margin-bottom: 1em;
                }
                
                .script-preview .parenthetical {
                  font-family: 'Courier New', monospace;
                  margin-left: 15%;
                  margin-right: 10%;
                  font-style: italic;
                  color: #6b7280;
                }
                
                .script-preview .current-character {
                  color: #4f46e5;
                  font-weight: bold;
                }
              `}</style>
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Process script content with proper HTML formatting
function processScriptContent(text: string): string {
  if (!text) return '<p class="text-gray-400 italic">No content to display</p>';
  
  // Format script with HTML
  const lines = text.split('\n');
  const formattedLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Add empty line
      formattedLines.push('<div class="h-4"></div>');
      continue;
    }
    
    // Check for scene headings (INT./EXT.)
    if (/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT)/i.test(line)) {
      formattedLines.push(`<div class="scene-heading">${line}</div>`);
      continue;
    }
    
    // Check for character name
    const charMatch = line.match(/^([A-Z][A-Z\s\-'.]*?):\s*(.*)$/);
    if (charMatch) {
      const [, charName, dialog] = charMatch;
      formattedLines.push(`<div class="character">${charName}:</div>`);
      if (dialog) {
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
}

// Extract only the character's lines and relevant context
function getCharacterLines(text: string, characterName: string): string {
  if (!text || !characterName) return '';
  
  const lines = text.split('\n');
  const resultLines: string[] = [];
  let includeNext = false;
  let lastSceneHeading = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Always include scene headings for context
    if (/^(INT\.|EXT\.|I\/E|INT\/EXT|INT-EXT)/i.test(line)) {
      if (resultLines.length > 0 && resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      resultLines.push(line);
      lastSceneHeading = line;
      includeNext = false;
      continue;
    }
    
    // Check if this is the character's line
    const isCharacterLine = new RegExp(`^${characterName}:\\s*`).test(line);
    
    if (isCharacterLine) {
      // If this is the first character line after a scene heading, add an empty line
      if (resultLines.length > 0 && 
          !resultLines[resultLines.length - 1].startsWith(characterName) && 
          resultLines[resultLines.length - 1] !== '') {
        resultLines.push('');
      }
      
      resultLines.push(line);
      includeNext = true;
      continue;
    }
    
    // Include parentheticals after character lines
    if (includeNext && /^\(.*\)$/.test(line)) {
      resultLines.push(line);
      continue;
    }
    
    // Check if another character is speaking
    const otherCharMatch = line.match(/^([A-Z][A-Z\s\-'.]*?):\s*(.*)$/);
    if (otherCharMatch) {
      // Include the line but mark that we don't include the next line unless it's a parenthetical
      if (includeNext) {
        resultLines.push(line);
        includeNext = false;
      }
      continue;
    }
    
    // For other non-empty lines, include if they follow the character's dialog
    if (includeNext && line) {
      resultLines.push(line);
    }
  }
  
  return resultLines.join('\n');
}