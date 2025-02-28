import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  User, 
  Play, 
  Settings,
  Mic,
  Bot,
  FileText,
  ToggleLeft,
  X,
  Sparkles,
  ScrollText
} from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: React.ReactNode;
  icon?: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 text-left flex items-center justify-between transition-colors
          ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-gray-800 dark:text-gray-200">{question}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="text-gray-600 dark:text-gray-300">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

interface HelpFAQProps {
  onClose: () => void;
}

export const HelpFAQ: React.FC<HelpFAQProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">How It Works</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Teleprompter Pro helps you practice scripts with AI-powered voices that read other character lines while you speak your own. Here's how to use it:
          </p>
          
          <div className="space-y-2">
            <FAQItem
              question="How do I get started?"
              answer={
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Upload or paste your script in the Editor tab</li>
                  <li>Go to Analysis tab to select which character you'll play</li>
                  <li>In the Voices tab, assign AI voices to other characters</li>
                  <li>Start reading in the Prompter tab</li>
                </ol>
              }
              icon={<Play className="w-5 h-5 text-green-600 dark:text-green-400" />}
            />
            
            <FAQItem
              question="How do voice assignments work?"
              answer={
                <div className="space-y-2">
                  <p>You can choose between two modes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Text Only:</strong> No AI voices, you read everything yourself</li>
                    <li><strong>Voice Mode:</strong> AI voices read other characters while you read your own lines</li>
                  </ul>
                  <p className="mt-2">In Voice mode, assign voices to each character and customize what gets read:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Toggle location descriptions (INT./EXT. headers)</li>
                    <li>Toggle action descriptions (narration)</li>
                    <li>Toggle parentheticals like (laughing)</li>
                  </ul>
                </div>
              }
              icon={<Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            />
            
            <FAQItem
              question="What script format should I use?"
              answer={
                <div className="space-y-2">
                  <p>Your script should follow standard screenplay format:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Scene headings:</strong> INT./EXT. LOCATION - TIME</li>
                    <li><strong>Character names:</strong> NAME: followed by their dialog</li>
                    <li><strong>Action descriptions:</strong> Regular paragraphs describing action</li>
                    <li><strong>Parentheticals:</strong> (actions or tone) in parentheses</li>
                  </ul>
                  <p className="mt-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    Example:<br />
                    INT. COFFEE SHOP - MORNING<br /><br />
                    Sarah sits at a table, looking at her phone.<br /><br />
                    JOHN: Hey, Sarah! Mind if I join you?<br /><br />
                    SARAH: (surprised) Oh! Hi John. Please, have a seat.
                  </p>
                </div>
              }
              icon={<FileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
            />
            
            <FAQItem
              question="How do I control playback speed?"
              answer={
                <div className="space-y-2">
                  <p>You can adjust both scrolling speed and voice speed:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Use the scroll speed slider at the bottom of the prompter</li>
                    <li>Set words per minute (WPM) in Settings to control voice speed</li>
                    <li>Press space bar to play/pause</li>
                    <li>Click the Max button to temporarily speed up</li>
                  </ul>
                  <p className="mt-2">Your speech setting for voice playback is separate from the scroll speed, so you can optimize both separately.</p>
                </div>
              }
              icon={<Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            />
            
            <FAQItem
              question="How does character detection work?"
              answer={
                <div className="space-y-2">
                  <p>The app automatically detects characters from your script by looking for the format:</p>
                  <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono">CHARACTER NAME: Dialog text</p>
                  <p>Characters should be written in ALL CAPS or First Letter Capitalized followed by a colon.</p>
                  <p className="mt-2">If character detection fails:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure each character's name is followed by a colon</li>
                    <li>Check for consistent spelling of character names</li>
                    <li>Use the "Basic Detection" button if needed</li>
                  </ul>
                </div>
              }
              icon={<Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            />
            
            <FAQItem
              question="Why isn't the voice reading certain parts?"
              answer={
                <div className="space-y-2">
                  <p>Check these common issues:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Voice might be disabled (toggle the speaker icon)</li>
                    <li>You may need to select which parts to read in the Voice tab:</li>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Location descriptions (INT./EXT. headers)</li>
                      <li>Action descriptions (narration)</li>
                      <li>Parentheticals like (laughing)</li>
                    </ul>
                    <li>Your selected character's lines are never read by AI</li>
                    <li>Some characters might not have voices assigned</li>
                  </ul>
                </div>
              }
              icon={<Mic className="w-5 h-5 text-red-600 dark:text-red-400" />}
            />
            
            <FAQItem
              question="Can I save my scripts and settings?"
              answer={
                <div className="space-y-2">
                  <p>Yes! The app automatically saves:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your current script</li>
                    <li>Character assignments</li>
                    <li>Voice settings</li>
                    <li>Display preferences</li>
                  </ul>
                  <p className="mt-2">You can access your saved scripts in the Script Library section.</p>
                </div>
              }
              icon={<ScrollText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};