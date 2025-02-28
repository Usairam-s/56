import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { HelpFAQ } from './HelpFAQ';

export const HelpButton: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800/30 transition-colors"
        title="Help & FAQ"
        aria-label="Help and Frequently Asked Questions"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      {showHelp && <HelpFAQ onClose={() => setShowHelp(false)} />}
    </>
  );
};