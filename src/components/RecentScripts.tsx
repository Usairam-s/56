import React, { useState, useEffect } from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { 
  FileText, Clock, Check, ChevronRight, Edit, Trash2, X, Calendar, 
  Users, RefreshCw, ChevronDown, ChevronUp, Plus
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

export const RecentScripts: React.FC = () => {
  const { 
    savedScripts, 
    loadScript, 
    deleteScript,
    currentScriptId,
    setText,
    createNewScript
  } = useTeleprompterStore();
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const SCRIPTS_TO_SHOW = 3; // Default number of scripts to show

  // Sort scripts by last updated
  const sortedScripts = [...savedScripts].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Limit scripts based on showAll state
  const displayedScripts = showAll ? sortedScripts : sortedScripts.slice(0, SCRIPTS_TO_SHOW);

  const handleLoadScript = async (id: string) => {
    setLoadStatus(id);
    await loadScript(id);
    setTimeout(() => setLoadStatus(null), 1000);
  };

  const handleDeleteScript = (id: string) => {
    if (deleteConfirm === id) {
      deleteScript(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      // Auto-clear after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Visual feedback when refreshing the scripts list
  const handleRefreshScripts = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };
  
  if (refreshing) {
    return (
      <div className="flex items-center justify-center py-6">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (sortedScripts.length === 0) {
    return (
      <div className="text-center py-4 px-2">
        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          No recent scripts found
        </p>
        <button
          onClick={createNewScript}
          className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Create New Script
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs text-gray-500 dark:text-gray-400">
          {savedScripts.length} script{savedScripts.length !== 1 ? 's' : ''} total
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={createNewScript}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="New Script"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefreshScripts}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        {displayedScripts.map((script) => (
          <div 
            key={script.id}
            className={`
              group flex items-center justify-between p-2 rounded-lg transition-all mb-2
              ${script.id === currentScriptId
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700'
              }
            `}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className={`
                w-4 h-4 flex-shrink-0
                ${script.id === currentScriptId 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-gray-400'
                }
              `} />
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate flex items-center gap-1">
                  {script.title}
                  {script.id === currentScriptId && (
                    <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Current
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(script.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {script.content?.split(/\s+/)?.length || 0} words
                  </span>
                  {script.characters?.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {script.characters.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleLoadScript(script.id)}
                className={`
                  p-1 rounded-lg transition-colors flex items-center gap-1
                  ${loadStatus === script.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title="Load Script"
              >
                {loadStatus === script.id ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="text-xs">Loaded</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-xs">Load</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDeleteScript(script.id)}
                className={`
                  p-1 rounded-lg transition-colors flex items-center gap-1
                  ${deleteConfirm === script.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
                title="Delete Script"
              >
                {deleteConfirm === script.id ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="text-xs">Confirm</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    <span className="text-xs">Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {/* Show More/Less Button */}
        {sortedScripts.length > SCRIPTS_TO_SHOW && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 py-1.5 px-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center gap-1 text-xs"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Show {sortedScripts.length - SCRIPTS_TO_SHOW} More</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};