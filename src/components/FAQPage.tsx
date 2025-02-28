import React from 'react';
import { ArrowRight, Bot, Mic, Sparkles, Settings, Play, Volume as VolumeUp, ScrollText, ChevronRight, User, FileText, FileUp, Volume2, Brain, PlaySquare, Book, BookOpen, RefreshCw, Key } from 'lucide-react';

export const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Teleprompter Pro: Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about practicing scripts with AI voice partners
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8 pb-2">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
              <PlaySquare className="w-8 h-8 mr-3" />
              How Teleprompter Pro Works
            </h2>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
              <div className="bg-indigo-600 text-white p-5">
                <h3 className="text-xl font-bold">The Basic Workflow</h3>
              </div>
              <div className="p-6">
                <ol className="space-y-4">
                  <li className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-3 flex-shrink-0 mt-0.5">1</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Import Your Script</p>
                      <p className="text-gray-600 dark:text-gray-400">Upload a PDF or text file containing your script, or paste it directly into the editor.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-3 flex-shrink-0 mt-0.5">2</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Choose Your Role</p>
                      <p className="text-gray-600 dark:text-gray-400">The app automatically detects characters from your script. Select which character you'll be playing.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-3 flex-shrink-0 mt-0.5">3</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Assign Voices</p>
                      <p className="text-gray-600 dark:text-gray-400">Choose from a library of high-quality AI voices and assign them to the other characters in your script.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold mr-3 flex-shrink-0 mt-0.5">4</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Start Reading</p>
                      <p className="text-gray-600 dark:text-gray-400">The teleprompter will display your script and play AI voices for other characters while you read your own lines.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Volume2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Voice Technology</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our app uses advanced AI voice synthesis to create natural-sounding character voices. Each voice is carefully optimized for dialog delivery.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Diverse voice options for different characters</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Control which elements are read aloud</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Adjustable speech rate for perfect timing</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Smart Script Analysis</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our system automatically analyzes your script to identify characters, dialog patterns, and structure for the best reading experience.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Automatic character detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Intelligent formatting of scene elements</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Support for standard screenplay format</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature FAQ Section */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8 pb-2">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
              <Key className="w-8 h-8 mr-3" />
              Common Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h3 className="bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center">
                <FileUp className="w-5 h-5 mr-2" />
                How do I upload my script?
              </h3>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-400">
                  You can upload your script in several ways:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>PDF Upload:</strong> Click the "Import Script" tab and upload a PDF file. The system will process the text automatically.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Text File:</strong> You can upload a .txt file containing your script.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Copy/Paste:</strong> Use the Editor tab to paste your script directly.</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm">
                  <p><strong>Tip:</strong> For best results, ensure your script follows standard screenplay format with character names followed by colons.</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h3 className="bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                What if the character detection doesn't work?
              </h3>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-400">
                  Character detection works best with standard screenplay format where character names are in ALL CAPS or First Letter Capitalized followed by a colon. If detection fails:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Check your script format to ensure character names are followed by colons (e.g., "JOHN:" or "Sarah:")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Use the "Basic Detection" button in the Analysis tab to trigger simpler character detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Edit your script to ensure consistent character naming</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h3 className="bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                How do I control what gets read by the AI voices?
              </h3>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-400">
                  You have complete control over which parts of the script are read aloud:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Voice Mode/Text Mode:</strong> Choose between AI voices for characters or text-only mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Read Location Descriptions:</strong> Toggle whether scene headings (INT/EXT) should be read</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Read Action Descriptions:</strong> Toggle narration of action paragraphs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Read Parentheticals:</strong> Toggle reading of (action instructions)</span>
                  </li>
                </ul>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  You'll find these controls in the Voice tab. Your character's lines are never read by the AI.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h3 className="bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                How do I adjust speed and settings?
              </h3>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-400">
                  You can customize the teleprompter experience in several ways:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Scroll Speed:</strong> Use the slider in the control bar to adjust how fast text scrolls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Font Size:</strong> Adjust text size for better readability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Words Per Minute:</strong> Set your preferred reading pace in the Settings tab</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Mirror Mode:</strong> Flip text horizontally for use with teleprompter hardware</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400"><strong>Dark/Light Mode:</strong> Change the visual theme for comfort</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <h3 className="bg-indigo-50 dark:bg-indigo-900/30 p-4 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center">
                <ScrollText className="w-5 h-5 mr-2" />
                How are my scripts saved?
              </h3>
              <div className="p-5">
                <p className="text-gray-600 dark:text-gray-400">
                  The app automatically saves your work as you go:
                </p>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Scripts are automatically saved to your account when you make significant changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Voice assignments and character selections are saved with each script</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">You can access your script library to reopen previous scripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">Settings and preferences persist between sessions</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm">
                  <p><strong>Note:</strong> Your data is securely stored and only accessible to your account.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Script Format Guide */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8 pb-2">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
              <Book className="w-8 h-8 mr-3" />
              Script Format Guide
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recommended Format</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Scene Headings</h4>
                      <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-gray-600 dark:text-gray-300">INT. COFFEE SHOP - MORNING</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Action Description</h4>
                      <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-gray-600 dark:text-gray-300">John enters, looking around nervously.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Character Dialog</h4>
                      <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-gray-600 dark:text-gray-300">JOHN: Hey, have you been waiting long?</p>
                      <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono mt-2 text-gray-600 dark:text-gray-300">SARAH: (checking watch) About twenty minutes.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Format Tips</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Character Names:</strong> Followed by a colon, preferably in ALL CAPS or Title Case</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Scene Headings:</strong> Start with INT. or EXT.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Parentheticals:</strong> Put action instructions in (parentheses)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Line Spacing:</strong> Use blank lines between different elements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400"><strong>Consistency:</strong> Use the same name spelling throughout</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Don't worry if your script isn't perfectly formatted - the app includes automatic formatting tools!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8 pb-2">
            <h2 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Still Have Questions?</h2>
          </div>

          <div className="bg-indigo-600 text-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">We're Here to Help</h3>
            <p className="text-indigo-100 mb-6 max-w-md mx-auto">
              If you can't find the answer to your question, our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                Contact Support
              </button>
              <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-800 transition-colors shadow-sm">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};