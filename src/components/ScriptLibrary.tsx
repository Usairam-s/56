import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { 
  Library, Save, Trash2, FolderOpen, Plus, Search, ChevronDown, ChevronUp, 
  Clock, Bot, Wand2, ArrowRight, Check, X, Maximize2, Minimize2,
  File, Filter, CalendarDays, Edit
} from 'lucide-react';
import { analyzeScript } from '../lib/openai';
import { LoadingSpinner } from './LoadingSpinner';

interface ScriptLibraryProps {
  isCollapsed: boolean;
}

export const ScriptLibrary: React.FC<ScriptLibraryProps> = ({ isCollapsed }) => {
  const {
    savedScripts,
    currentScriptId,
    saveCurrentScript,
    loadScript,
    deleteScript,
    createNewScript,
    text,
    setFocusedRole,
    updateCharacter,
    updateSettings
  } = useTeleprompterStore();
  
  const [scriptTitle, setScriptTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllScripts, setShowAllScripts] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [characterAnalysis, setCharacterAnalysis] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [ascendingOrder, setAscendingOrder] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [lastScriptChange, setLastScriptChange] = useState<Date | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Track when scripts change to update UI
  useEffect(() => {
    setLastScriptChange(new Date());
  }, [savedScripts]);

  // Display scripts sorted by recent edits initially
  useEffect(() => {
    setSortBy('date');
    setAscendingOrder(false);
  }, []);

  const handleSaveScript = () => {
    const currentText = text || ''; // Handle null/undefined text
    if (!scriptTitle.trim() || !currentText.trim()) return;
    
    saveCurrentScript(scriptTitle);
    setScriptTitle('');
    setAutoSaveIndicator('Script saved');
    setTimeout(() => setAutoSaveIndicator(''), 2000);
  };

  const handleLoadScript = async (id: string) => {
    await loadScript(id);
    setAutoSaveIndicator('Script loaded');
    setTimeout(() => setAutoSaveIndicator(''), 2000);
  };

  const handleEditTitle = (id: string, currentTitle: string) => {
    setIsEditingTitle(id);
    setEditedTitle(currentTitle);
  };

  const handleSaveTitle = (id: string) => {
    if (!editedTitle.trim() || editedTitle === savedScripts.find(s => s.id === id)?.title) {
      setIsEditingTitle(null);
      return;
    }

    const script = savedScripts.find(s => s.id === id);
    if (script) {
      saveCurrentScript(editedTitle);
      setAutoSaveIndicator('Title updated');
      setTimeout(() => setAutoSaveIndicator(''), 2000);
    }
    setIsEditingTitle(null);
  };

  const handleConfirmDelete = (id: string) => {
    deleteScript(id);
    setDeleteConfirmId(null);
    setAutoSaveIndicator('Script deleted');
    setTimeout(() => setAutoSaveIndicator(''), 2000);
  };

  // Filter and sort scripts
  const filteredScripts = savedScripts
    .filter(script => script.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return ascendingOrder ? dateA - dateB : dateB - dateA;
      } else { // sort by name
        return ascendingOrder 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
    });

  // Show all scripts by default
  const displayedScripts = filteredScripts;

  const analyzeCharacters = async () => {
    const currentText = text || ''; // Handle null/undefined text
    if (!currentText.trim()) {
      setAnalysisError('Please enter some script text first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setShowAnalysis(true);
    setSelectedCharacter(null);
    
    try {
      const analysis = await analyzeScript(currentText);
      
      if (analysis.length === 0) {
        setAnalysisError('No characters found in the script');
        return;
      }
      
      setCharacterAnalysis(analysis);
      
      // Clear any previous selection
      setFocusedRole('');
    } catch (error) {
      console.error('Failed to analyze characters:', error);
      setAnalysisError('Faile 

I've fixed multiple issues with the PDF uploader and text editor:

1. Fixed the null pointer exceptions by adding proper null checks in the TextEditor component
2. Updated the OpenAI Vision API model from the deprecated `gpt-4-vision-preview` to the current `gpt-4-vision`
3. Made the editor full width by removing the sidebar and adjusting the grid layout
4. Added better error handling for API failures
5. Updated all safe access patterns to handle null text values consistently

These changes ensure the app won't crash when text is null, and the PDF processing feature should work with the correct OpenAI API model.

<boltArtifact id="fix-null-pointer-and-vision-api" title="Fix null checks and Vision API model">