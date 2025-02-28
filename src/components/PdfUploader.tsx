import React, { useState, useRef, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { FileUp, AlertCircle, Check, Loader2, File, BookOpen, X, Scan, FileText, Image } from 'lucide-react';
import { extractScriptTitle } from '../lib/scriptFormatter';
import { extractTextFromImage, formatScriptWithAI } from '../lib/openai';
import { pdfToImages } from '../lib/pdfProcessor';

interface PdfUploaderProps {
  onUpload?: () => void;
  onTitleExtracted?: (title: string) => void;
  compact?: boolean;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ 
  onUpload, 
  onTitleExtracted,
  compact = false
}) => {
  const { 
    setText,
    saveCurrentScript 
  } = useTeleprompterStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [formattedText, setFormattedText] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [formatMode, setFormatMode] = useState<'standard' | 'teleprompter'>('standard');
  
  // For safety, we'll have a timeout to prevent hanging
  const processingTimeoutRef = useRef<number | null>(null);

  // Function to clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // Process uploaded file contents
  const processFileContent = async (rawText: string): Promise<string> => {
    try {
      setProcessingStage('Formatting script...');
      setProcessingProgress(75);
      
      try {
        // Format using AI
        const formattedScript = await formatScriptWithAI(rawText);
        setFormattedText(formattedScript);
        return formattedScript;
      } catch (error) {
        console.error('AI formatting failed:', error);
        // Clean text to handle encoding issues
        const cleanedText = rawText
          .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFFFE\uFFFF]/g, ' ')
          .replace(/\uD83D[\uDC00-\uDFFF]|\uD83C[\uDC00-\uDFFF]|\uFFFD/g, ' ')
          .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u2000-\u206F\u20A0-\u20CF\u2100-\u214F]/g, ' ');
        
        // Use basic formatting as fallback
        setFormattedText(cleanedText);
        return cleanedText;
      }
    } catch (err) {
      console.error('Error formatting script:', err);
      // Still return the cleaned text as a fallback
      return rawText.replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFFFE\uFFFF]/g, ' ');
    }
  };

  const handlePdfFile = async (file: File) => {
    try {
      setFilename(file.name);
      setProcessingStage('Converting PDF to images...');
      setProcessingProgress(10);
      
      // Extract title from filename
      const scriptTitle = file.name.replace(/\.[^/.]+$/, "");
      if (onTitleExtracted) {
        onTitleExtracted(scriptTitle);
      }
      
      // Create a safety timeout
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
      
      processingTimeoutRef.current = window.setTimeout(() => {
        setIsLoading(false);
        setError('Processing timeout. The PDF might be too complex or large. Try a smaller file or extract the text manually.');
      }, 60000); // 1 minute timeout for PDFs, reduced from 3 minutes
      
      // Convert PDF to images
      const images = await pdfToImages(file);
      setTotalPages(images.length);
      setProcessingProgress(30);
      
      // Process each page with Vision API
      let extractedText = '';
      for (let i = 0; i < images.length; i++) {
        setCurrentPage(i + 1);
        setProcessingStage(`Analyzing page ${i + 1} of ${images.length} with AI...`);
        setProcessingProgress(30 + Math.floor((i / images.length) * 40));
        
        // Extract text from current page
        const pageText = await extractTextFromImage(images[i]);
        extractedText += pageText + "\n\n";
      }
      
      // Clear the timeout since processing completed
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      
      setProcessingProgress(70);
      setProcessingStage('Formatting script...');
      
      // Store raw content
      setFileContents(extractedText);
      
      // Format the extracted text
      const formattedScript = await processFileContent(extractedText);
      
      // Set the formatted text in the store
      setText(formattedScript);
      
      // Auto-save the script with the extracted title
      setTimeout(() => {
        saveCurrentScript(scriptTitle);
      }, 500);
      
      setSuccess(true);
      setProcessingProgress(100);
      
      // Call onUpload callback
      setTimeout(() => {
        if (onUpload) onUpload();
      }, 1000);
    } catch (error) {
      console.error('PDF processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextFile = async (file: File) => {
    try {
      setProcessingStage('Reading text file...');
      setProcessingProgress(50);
      
      // Read text file
      const scriptText = await file.text();
      
      // Store raw content
      setFileContents(scriptText);
      
      // Format script text
      setProcessingStage('Formatting script...');
      const formattedScript = await processFileContent(scriptText);
      
      // Set the formatted text
      setText(formattedScript);
      
      // Auto-save the script with the file name as title
      const scriptTitle = file.name.replace(/\.[^/.]+$/, "");
      if (onTitleExtracted) {
        onTitleExtracted(scriptTitle);
      }
      
      setTimeout(() => {
        saveCurrentScript(scriptTitle);
      }, 500);
      
      setSuccess(true);
      setProcessingProgress(100);
      
      // Call onUpload callback
      setTimeout(() => {
        if (onUpload) onUpload();
      }, 1000);
    } catch (error) {
      console.error('Text file reading error:', error);
      setError(error instanceof Error ? error.message : 'Failed to read text file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    // Set initial states
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setFilename(file.name);
    setProcessingProgress(0);
    setFormattedText(null);
    setFileContents(null);
    setCurrentPage(0);
    setTotalPages(0);

    try {
      // Validate file type
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
      
      if (!isPdf && !isTxt) {
        throw new Error('Please upload a PDF or plain text (.txt) file');
      }

      // Auto-detect format mode based on filename
      if (file.name.toLowerCase().includes('script') || 
          file.name.toLowerCase().includes('screenplay') ||
          file.name.toLowerCase().includes('teleprompter')) {
        setFormatMode('teleprompter');
      } else {
        setFormatMode('standard');
      }

      if (isTxt) {
        await handleTextFile(file);
      } else if (isPdf) {
        await handlePdfFile(file);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setProcessingProgress(0);
    } finally {
      setIsLoading(false);
      setDragActive(false);
      
      // Clear any hanging timeout
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRetry = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handlePasteText = () => {
    // Use fileContents if available (raw text before formatting)
    if (fileContents) {
      setText(fileContents);
      setSuccess(true);
      if (onUpload) onUpload();
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id="script-upload-compact"
        />
        <label
          htmlFor="script-upload-compact"
          className={`
            w-full flex items-center justify-center gap-2 px-3 py-2 
            rounded-lg cursor-pointer transition-colors
            ${isLoading 
              ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span className="text-sm">Upload Script</span>
            </>
          )}
        </label>
        
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <p>Upload successful!</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"> 
      <div className="flex items-center gap-2 mb-4">
        <FileUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          Upload Script File
        </h3>
      </div>

      <div className="space-y-4">
        <div 
          className="relative"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="script-upload"
          />
          <label
            htmlFor="script-upload"
            className={`
              flex flex-col items-center justify-center gap-4 w-full py-8 px-4 
              border-2 border-dashed rounded-lg cursor-pointer
              transition-all duration-200
              ${isLoading 
                ? 'border-indigo-300 bg-indigo-50/50 cursor-not-allowed' 
                : dragActive
                  ? 'border-indigo-500 bg-indigo-50/50 scale-102 shadow-md'
                  : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-md'
              }
              dark:border-indigo-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30
            `}
          >
            {isLoading ? (
              <>
                <div className="relative p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-2">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-base text-gray-700 dark:text-gray-200 font-medium">
                    Processing {filename}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-2">
                    {processingStage}
                  </p>
                  
                  {totalPages > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Page {currentPage} of {totalPages}
                    </p>
                  )}
                  
                  {/* Progress bar */}
                  <div className="w-full max-w-xs mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    {processingProgress}% Complete
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-2">
                  <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="text-base text-gray-800 dark:text-gray-200 font-medium">
                    Drop your script file here or click to upload
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4 text-sm">
                    Your script will be automatically formatted
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm text-sm">
                      <File className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">TXT</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm text-sm">
                      <Image className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">PDF</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </label>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
            <Check className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Upload successful!</p>
              <p className="mt-1 text-sm">Script has been extracted, formatted, and saved to your library.</p>
            </div>
          </div>
        )}

        {/* Display sample of formatted text preview */}
        {formattedText && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Preview:
              </h4>
              {fileContents && (
                <button
                  onClick={handlePasteText}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                >
                  Use raw text instead
                </button>
              )}
            </div>
            <div className="max-h-24 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 font-mono p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
              {formattedText.slice(0, 500)}
              {formattedText.length > 500 && '...'}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-indigo-600" />
            How It Works:
          </h4>
          <div className="pl-4 space-y-1">
            <p className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-600 flex-shrink-0" />
              <span><strong>Text files:</strong> Directly imported and automatically formatted</span>
            </p>
            <p className="flex items-center gap-1">
              <Scan className="w-3 h-3 text-indigo-600 flex-shrink-0" />
              <span><strong>PDF files:</strong> Scanned with AI to extract text</span>
            </p>
          </div>
          <p>• AI vision technology handles PDF scripts that traditional extractors would fail on</p>
          <p>• Character names are automatically detected (written in ALL CAPS followed by colon)</p>
        </div>

        {error && (
          <div className="flex justify-center">
            <button 
              onClick={handleRetry}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};