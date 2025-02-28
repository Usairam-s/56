import React, { useState, useEffect } from "react";
import { LandingPage } from "./LandingPage";
import { SignupPage } from "./SignupPage";
import { TextEditor } from "./TextEditor";
import { Teleprompter } from "./Teleprompter";
import { Controls } from "./Controls";
import { TeleprompterSettings } from "./TeleprompterSettings";
import { ScriptLibrary } from "./ScriptLibrary";
import { CharacterVoiceSelector } from "./CharacterVoiceSelector";
import { CharacterAnalysis } from "./CharacterAnalysis";
import { TokenSystem } from "./TokenSystem";
import { FAQPage } from "./FAQPage";
import { HelpButton } from "./HelpButton";
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
import { SignUPage } from "../pages/SignInPage";
import { Dashbaord } from "../pages/Dashboard";

type Tab =
  | "editor"
  | "analysis"
  | "voices"
  | "prompter"
  | "settings"
  | "credits"
  | "faq";

const App: React.FC = () => {
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

  // Show landing page or signup page if not authenticated
  // if (!isAuthenticated) {
  //   if (activeTab === "signup") return <SignupPage />;
  //   if (activeTab === "faq") return <FAQPage />;
  //   return <LandingPage />;
  // }

  return (
    <>
      {/* Implement routbg */}

      <Router>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashbaord />} />
        </Routes>
      </Router>

      {/* Implement routng */}

      {/* //1 - trash .tsx */}

      {/* //1 - trash .tsx */}
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

export default App;
