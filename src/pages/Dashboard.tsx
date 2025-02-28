import React, { useState, useEffect } from "react";

// import { ScriptLibrary } from "./ScriptLibrary";

import { useTeleprompterStore } from "../store/teleprompterStore";
import { supabase } from "../lib/supabase";
//implementing routng

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//implementing routing
import {
  ScrollText,
  Mic,
  Check,
  Settings as SettingsIcon,
  Maximize2,
  Minimize2,
  Edit3,
  Play,
  Bot,
  ArrowRight,
  ChevronRight,
  Brain,
  Volume2,
  VolumeX,
  Home,
  LogOut,
  Coins,
  User,
  HelpCircle,
} from "lucide-react";

import { SignInPage } from "../pages/SignInPage";
import { HelpButton } from "../components/HelpButton";
import { TextEditor } from "../components/TextEditor";
import { CharacterAnalysis } from "../components/CharacterAnalysis";
import { CharacterVoiceSelector } from "../components/CharacterVoiceSelector";
import { Teleprompter } from "../components/Teleprompter";
import { TeleprompterSettings } from "../components/TeleprompterSettings";
import { TokenSystem } from "../components/TokenSystem";
import { FAQPage } from "../components/FAQPage";
import { Controls } from "../components/Controls";

type Tab =
  | "editor"
  | "analysis"
  | "voices"
  | "prompter"
  | "settings"
  | "credits"
  | "faq";

export const Dashbaord: React.FC = () => {
  const {
    isDarkMode,
    settings,
    text,
    characters,
    focusedRole,
    activeTab,
    setActiveTab,
    updateSettings,
    isAuthenticated,
    setIsAuthenticated,
  } = useTeleprompterStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // Check authentication status on load
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setActiveTab("landing");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setIsAuthenticated, setActiveTab]);

  // Calculate current step
  useEffect(() => {
    if (!text) {
      setCurrentStep(1);
    } else if (!characters.length) {
      setCurrentStep(2);
    } else if (!focusedRole) {
      setCurrentStep(3);
    } else if (!characters.some((c) => c.voiceId)) {
      setCurrentStep(4);
    } else {
      setCurrentStep(5);
    }
  }, [text, characters, focusedRole]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setActiveTab("landing");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleHomeClick = () => {
    setActiveTab("landing");
  };

  return (
    <>
      <div
        className={`${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}
        style={{ minHeight: "100vh" }}
      >
        <div className="container mx-auto px-2 max-w-7xl">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2 sticky top-0 z-50 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Teleprompter Pro
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Professional Script Reader
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleHomeClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Home"
              >
                <Home className="w-5 h-5" />
              </button>

              {/* Help Button */}
              <HelpButton />

              <button
                onClick={() => setActiveTab("credits")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                title="Credits"
              >
                <Coins className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  updateSettings({ voiceEnabled: !settings.voiceEnabled })
                }
                className={`
        p-2 rounded-lg transition-colors
        ${
          settings.voiceEnabled
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
        }
      `}
                title={settings.voiceEnabled ? "Disable Voice" : "Enable Voice"}
              >
                {settings.voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors ml-1"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Current Settings Summary - more compact */}
          <div className="mb-3 p-2 bg-indigo-50/50 dark:bg-indigo-900/20 backdrop-blur-sm rounded-lg border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Voice Enabled: {settings.voiceEnabled ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ScrollText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {settings.wordsPerMinute} WPM
                </span>
              </div>
              {focusedRole && (
                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-lg">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Your Role: {focusedRole}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs - more compact */}
          <div className="flex flex-wrap items-center gap-1 mb-3 p-2 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg sticky top-16 z-40">
            <TabButton
              tab="editor"
              icon={<Edit3 className="w-5 h-5" />}
              label="Editor"
              step={1}
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
              currentStep={currentStep}
            />
            <TabButton
              tab="analysis"
              icon={<Brain className="w-5 h-5" />}
              label="Analysis"
              disabled={!text}
              step={2}
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
              currentStep={currentStep}
            />
            <TabButton
              tab="voices"
              icon={<Mic className="w-5 h-5" />}
              label="Voices"
              disabled={!characters.length}
              step={3}
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
              currentStep={currentStep}
            />
            <TabButton
              tab="prompter"
              icon={<Play className="w-5 h-5" />}
              label="Prompter"
              disabled={!text || !focusedRole}
              step={4}
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
              currentStep={currentStep}
            />
            <TabButton
              tab="settings"
              icon={<SettingsIcon className="w-5 h-5" />}
              label="Settings"
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
            />
            <TabButton
              tab="credits"
              icon={<Coins className="w-5 h-5" />}
              label="Credits"
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
            />
            <TabButton
              tab="faq"
              icon={<HelpCircle className="w-5 h-5" />}
              label="FAQ"
              activeTab={activeTab}
              //@ts-ignore
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Main Content - scrollable container */}
          <div
            className="relative"
            style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}
          >
            <div
              className={`
    ${activeTab === "editor" ? "block" : "hidden"}
  `}
            >
              <TextEditor />
            </div>

            <div
              className={`
    ${activeTab === "analysis" ? "block" : "hidden"}
  `}
            >
              <CharacterAnalysis />
            </div>

            <div
              className={`
    ${activeTab === "voices" ? "block" : "hidden"}
  `}
            >
              <CharacterVoiceSelector />
            </div>

            <div
              className={`
    ${activeTab === "prompter" ? "block" : "hidden"}
  `}
            >
              <Teleprompter />
            </div>

            <div
              className={`
    ${activeTab === "settings" ? "block" : "hidden"}
  `}
            >
              <TeleprompterSettings />
            </div>

            <div
              className={`
    ${activeTab === "credits" ? "block" : "hidden"}
  `}
            >
              <TokenSystem />
            </div>

            <div
              className={`
    ${activeTab === "faq" ? "block" : "hidden"}
  `}
            >
              <FAQPage />
            </div>
          </div>

          {/* Bottom Controls - only show on prompter tab */}
          {activeTab === "prompter" && (
            <div className="h-14">
              <Controls />
            </div>
          )}
        </div>
      </div>
      ;
    </>
  );
};

interface TabButtonProps {
  tab: Tab;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  step?: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep?: number;
}

const TabButton: React.FC<TabButtonProps> = ({
  tab,
  icon,
  label,
  disabled = false,
  step,
  activeTab,
  setActiveTab,
  currentStep,
}) => (
  <button
    onClick={() => !disabled && setActiveTab(tab)}
    disabled={disabled}
    className={`
      relative flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-300 compact-button
      ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800/50"
          : activeTab === tab
          ? "bg-indigo-600 text-white shadow-md transform hover:scale-105"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
      }
    `}
  >
    {icon}
    <span className="font-medium hidden sm:inline text-sm">{label}</span>
    {step && currentStep && (
      <div
        className={`
        absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full 
        flex items-center justify-center text-xs font-bold
        ${
          currentStep > step
            ? "bg-green-500 text-white"
            : currentStep === step
            ? "bg-orange-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
        }
      `}
      >
        {step}
      </div>
    )}
  </button>
);
