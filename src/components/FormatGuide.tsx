import React, { useState } from 'react';
import { BookOpen, FileText, User, MessageSquare, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface FormatGuideProps {
  expanded?: boolean;
}

export const FormatGuide: React.FC<FormatGuideProps> = ({ expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const sections = [
    {
      icon: <FileText className="w-4 h-4 text-indigo-600" />,
      title: "Text Files",
      description: "Directly imported and automatically formatted",
    },
    {
      icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
      title: "PDF Files",
      description: "AI-powered scanning and text extraction",
      features: [
        "Advanced OCR technology",
        "Format preservation",
        "Automatic cleanup"
      ]
    },
    {
      icon: <User className="w-4 h-4 text-indigo-600" />,
      title: "Character Detection",
      description: "Automatic character name detection",
      format: "ALL CAPS followed by colon (:)"
    },
    {
      icon: <MessageSquare className="w-4 h-4 text-indigo-600" />,
      title: "Script Elements",
      items: [
        {
          label: "Scene Headings",
          format: "INT./EXT. LOCATION - TIME"
        },
        {
          label: "Character Names",
          format: "ALL CAPS:"
        },
        {
          label: "Parentheticals",
          format: "(action or tone)"
        },
        {
          label: "Dialog",
          format: "Regular text below character"
        }
      ]
    }
  ];

  if (!isExpanded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            Script Format Guide
          </h3>
          <button
            onClick={() => setIsExpanded(true)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {sections[3].items?.map((item, i) => (
            <p key={i} className="flex items-start">
              <span className="mr-1">•</span>
              <span className="font-medium">{item.label}:</span>
              <span className="ml-1">{item.format}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          Script Format Guide
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 space-y-4">
        {sections.map((section, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              {section.icon}
              <h4 className="text-sm font-medium">{section.title}</h4>
            </div>
            
            <div className="ml-6 space-y-2 text-xs">
              <p className="text-gray-600 dark:text-gray-400">
                {section.description}
              </p>
              
              {section.features && (
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  {section.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-indigo-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              
              {section.format && (
                <div className="text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                  <code className="text-indigo-600 dark:text-indigo-400">
                    {section.format}
                  </code>
                </div>
              )}
              
              {section.items && (
                <div className="space-y-1">
                  {section.items.map((item, j) => (
                    <div key={j} className="text-xs">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {item.label}:
                      </span>
                      <code className="ml-1 text-indigo-600 dark:text-indigo-400">
                        {item.format}
                      </code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};