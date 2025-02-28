import React from 'react';
import { useTeleprompterStore } from '../store/teleprompterStore';
import { Bot, MessageSquare } from 'lucide-react';

export const AssistantSelector: React.FC = () => {
  const { 
    selectedAssistant, 
    setSelectedAssistant,
    text,
    setText
  } = useTeleprompterStore();

  const handleAssistantSelect = (assistant: string) => {
    setSelectedAssistant(assistant);
    
    // If there's no text, add a sample dialog
    if (!text.trim()) {
      const sampleDialog = `JOHN: Hello there!
MARY: Hi John, how are you?
JOHN: I'm doing great, thanks for asking.
MARY: That's wonderful to hear.`;
      
      setText(sampleDialog);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Bot className="w-6 h-6 text-indigo-600" />
        Select Voice Assistant
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleAssistantSelect('sherwin')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedAssistant === 'sherwin'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Sherwin</h3>
          </div>
          <p className="text-sm text-gray-600">
            Text-only mode - Prompter and voice features disabled
          </p>
        </button>

        <button
          onClick={() => handleAssistantSelect('nalauiz')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedAssistant === 'nalauiz'
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-200 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-800">Nalauiz</h3>
          </div>
          <p className="text-sm text-gray-600">
            Full features - Prompter + voice enabled
          </p>
        </button>
      </div>
    </div>
  );
};