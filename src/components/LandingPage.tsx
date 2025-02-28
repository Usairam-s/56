import React, { useState, useEffect } from "react";
import { useTeleprompterStore } from "../store/teleprompterStore";
import { supabase } from "../lib/supabase";
import {
  Mic,
  Star,
  Clock,
  Users,
  Bot,
  Brain,
  Sparkles,
  Award,
  Zap,
  Heart,
  ArrowRight,
  Volume2,
  Play,
  Settings2,
  FileText,
  Mail,
  Lock,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { Navigate, useNavigate } from "react-router-dom";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Professional Actor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    quote:
      "This tool has revolutionized my audition prep. I can focus on my performance while the AI handles all other characters perfectly.",
  },
  {
    name: "Michael Chen",
    role: "Casting Director",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    quote:
      "The voice synthesis quality is incredible. It helps actors deliver more natural performances during self-tapes.",
  },
  {
    name: "Emily Rodriguez",
    role: "Acting Coach",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    quote:
      "My students have seen remarkable improvement in their scene work using this as a practice tool.",
  },
];

const features = [
  {
    icon: <Bot className="w-6 h-6 text-indigo-600" />,
    title: "AI Scene Partner",
    description:
      "Professional-grade voice synthesis for all characters, giving you a realistic scene partner experience.",
  },
  {
    icon: <Brain className="w-6 h-6 text-indigo-600" />,
    title: "Smart Script Analysis",
    description:
      "Automatic character detection, relationship mapping, and emotional context analysis.",
  },
  {
    icon: <Clock className="w-6 h-6 text-indigo-600" />,
    title: "Save Hours of Prep",
    description:
      "No more recording other characters' lines or asking friends to read with you.",
  },
  {
    icon: <Volume2 className="w-6 h-6 text-indigo-600" />,
    title: "Natural Voice Synthesis",
    description:
      "High-quality AI voices with emotion and proper pacing for authentic dialogue.",
  },
  {
    icon: <Settings2 className="w-6 h-6 text-indigo-600" />,
    title: "Professional Controls",
    description:
      "Adjustable speed, font size, and smart pause features for perfect timing.",
  },
  {
    icon: <FileText className="w-6 h-6 text-indigo-600" />,
    title: "Script Management",
    description:
      "Save and organize your scripts with character assignments and voice settings.",
  },
];

const benefits = [
  {
    title: "Actors",
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    points: [
      "Practice with realistic scene partners 24/7",
      "Perfect your timing and reactions",
      "Record better self-tapes",
      "Save time on audition prep",
    ],
  },
  {
    title: "Casting Directors",
    icon: <Users className="w-8 h-8 text-blue-500" />,
    points: [
      "Get better self-tape submissions",
      "Actors come more prepared",
      "Easier remote casting process",
      "Professional-grade tools",
    ],
  },
  {
    title: "Agencies",
    icon: <Award className="w-8 h-8 text-purple-500" />,
    points: [
      "Help clients deliver better auditions",
      "Increase booking rates",
      "Professional development tool",
      "Stand out from other agencies",
    ],
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const { setText, setActiveTab, isAuthenticated, setIsAuthenticated } =
    useTeleprompterStore();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //chekc for auth first

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [setIsAuthenticated]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  //check for auth first

  // Screenshots for slider
  const screenshots = [
    {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200",
      title: "Smart Script Editor",
      description: "Professional-grade script formatting with AI assistance",
    },
    {
      url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200",
      title: "Character Analysis",
      description: "Automatic character detection and relationship mapping",
    },
    {
      url: "https://images.unsplash.com/photo-1485846147915-69f12fbd03b9?w=1200",
      title: "Voice Synthesis",
      description: "High-quality AI voices for realistic scene practice",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        setIsAuthenticated(true);
        setActiveTab("editor");
      } else {
        throw new Error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    setActiveTab("signup");

    navigate("/signup");
  };

  const handleGetStarted = () => {
    // Direct to signup page
    setActiveTab("signup");
    navigate("/signup");
  };

  const handleWatchDemo = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load a demo script
      const demoScript = `INT. COFFEE SHOP - MORNING

A cozy coffee shop bustles with morning activity. Sunlight streams through large windows.

SARAH: Good morning! Can I get a cappuccino, please?

BARISTA: Of course! That'll be $4.50. Would you like anything else?

SARAH: Actually, yes. Could you add a blueberry muffin?

JAMES: Sarah? Is that you? I haven't seen you in ages!

SARAH: James! What a surprise! How have you been?`;

      // Skip authentication for demo
      setIsAuthenticated(true);
      setText(demoScript);
      setActiveTab("prompter");
    } catch (error) {
      console.error("Demo error:", error);
      setError("Failed to start demo. Please try signing up instead.");
      // Fallback to signup
      setActiveTab("signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="absolute z-30 top-0 right-0 p-4 flex items-center gap-4">
        <button
          onClick={() => {
            // setShowLogin(!showLogin);
            navigate("/signin"); // Redirects to /signup
          }}
          className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Sign In
        </button>
        <button
          onClick={handleSignUp}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign Up
        </button>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome Back
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your email"
                    required
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowLogin(false);
                    handleSignUp();
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Your Ultimate
              <span className="text-indigo-600 dark:text-indigo-400 block">
                Audition Co-Pilot
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
              Professional-grade scene partner tool with AI voices, smart script
              analysis, and perfect timing control.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Get Started</span>
                  </>
                )}
              </button>
              <button
                onClick={handleWatchDemo}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors border-2 border-indigo-600 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Loading Demo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Try Demo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Screenshot Slider */}
        <div className="mt-16 relative overflow-hidden rounded-xl shadow-2xl max-w-4xl mx-auto">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {screenshots.map((screenshot, index) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                <img
                  src={screenshot.url}
                  alt={screenshot.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {screenshot.title}
                  </h3>
                  <p className="text-gray-200">{screenshot.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Everything You Need for Perfect Auditions
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Professional tools designed for serious actors and industry
                professionals.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Benefits for Everyone
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Designed to improve the audition process for the entire
                industry.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {benefit.icon}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {benefit.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                      >
                        <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-24 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Loved by Industry Professionals
              </h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                See what actors, casting directors, and agencies are saying.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 italic">
                    "{testimonial.quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 bg-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Ready to Transform Your Audition Process?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                <span>Get Started Now</span>
              </button>
              <button
                onClick={handleWatchDemo}
                className="px-8 py-4 bg-transparent text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors border-2 border-white flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Heart className="w-5 h-5" />
                )}
                <span>Try Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
