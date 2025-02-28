// import React, { useState } from "react";
// import { useTeleprompterStore } from "../store/teleprompterStore";
// import { supabase } from "../lib/supabase";
// import {
//   Lock,
//   Mail,
//   ArrowRight,
//   Star,
//   Users,
//   Bot,
//   Volume2,
//   Brain,
//   Sparkles,
//   AlertCircle,
// } from "lucide-react";
// import { LoadingSpinner } from "../components/LoadingSpinner";

// const benefits = [
//   {
//     icon: <Bot className="w-5 h-5 text-indigo-600" />,
//     title: "AI Scene Partner",
//     description: "Practice with realistic AI voices",
//   },
//   {
//     icon: <Volume2 className="w-5 h-5 text-indigo-600" />,
//     title: "Voice Synthesis",
//     description: "Professional-grade character voices",
//   },
//   {
//     icon: <Brain className="w-5 h-5 text-indigo-600" />,
//     title: "Smart Analysis",
//     description: "Automatic character detection",
//   },
// ];

// export const SignUpPage: React.FC = () => {
//   const { setActiveTab, setIsAuthenticated, setText } = useTeleprompterStore();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Add sign in handler
//   const handleSignIn = () => {
//     setActiveTab("landing");
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Sign up with Supabase
//       const { data: signUpData, error: signUpError } =
//         await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             emailRedirectTo: window.location.origin,
//           },
//         });

//       if (signUpError) {
//         throw signUpError;
//       }

//       // Skip sign-in step for now and just set authenticated
//       if (signUpData.user) {
//         // Load a sample script
//         const sampleScript = `INT. RESTAURANT - NIGHT

// JJ sits down with his parents: his dad, DR. SHERWIN JAMSHIDI (50s, distinguished and charming) and his mom DR. VANESSA JAMSHIDI (50s, ageless beauty with superhuman discipline). A WAITER is taking their order.

// SHERWIN: I'll have the steak, medium rare. And when I say medium-rare, I mean between rare and medium. Pink-ish, not freshly slaughtered.

// JJ: Dad, I think he gets it.

// SHERWIN: Better to be specific.

// VANESSA: The kale salad for me, no pecorino, no croutons, dressing on the side. Thank you.

// JJ: Just coffee for me, thanks.

// VANESSA: Are you sure, honey? You're looking quite thin. (to the waiter) He'll have the steak, too.

// JJ: Mom!

// But the waiter nods and takes off.

// JJ: I can't stay long. I have track practice.

// VANESSA: Well, then you need protein. I can't have my son running around on an empty stomach.

// JJ: I'm fine, mom. Do you know I take care of myself 10 months out of the year without you guys, right?

// SHERWIN: And look what happens to you when you're left to your own devices. Malnourished and failing biology.

// JJ: And here I was worried that you two would be dramatic. (then) It was a C! One time! And I pulled my grade back up with extra credit.

// VANESSA: There's no need to shout, Julian.

// JJ: I'm not— (gives up) Sorry. It's just -- some parents might be happy that their son got a full ride to UVA. It's a great school, you know.

// VANESSA: Of course we are thrilled about that, honey. It has a great pre-med program -- in fact, we should set you up with some of our former colleagues in Virginia. Ken Andersen still runs the cardiology department over there, doesn't he, Sherwin?

// SHERWIN: I think he does. But I always saw Julian as more of an orthopedic surgery kind of man, don't you think?

// VANESSA: That does tie in with his athletic interests. You know what they say, they're the jocks of the medical field.

// Sherwin chuckles. JJ's growing frustration goes unnoticed (or ignored) by both his parents. They look up as he stands.

// JJ: I think I might actually be an impediment to this conversation, so, I'm gonna go.

// VANESSA: Oh -- you are so sensitive. Sit down. We're going to have a lovely lunch with our son who we never get to see.

// JJ hesitates. Then sits back down. Vanessa smiles and pats him on the shoulder.

// VANESSA: Now, tell us more about this boyfriend of yours. Is he a good student?

// Off JJ, another parental battle lost.`;

//         setText(sampleScript);
//         setIsAuthenticated(true);
//         setActiveTab("editor");
//       } else {
//         throw new Error("Signup failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Signup error:", error);
//       setError(error instanceof Error ? error.message : "Failed to sign up");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackToLanding = () => {
//     setActiveTab("landing");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//       {/* Left side - Form */}
//       <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
//         <div className="mx-auto w-full max-w-sm lg:w-96">
//           <div className="text-center">
//             <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
//               Get Started
//             </h1>
//             <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
//               Create your account to access all features
//             </p>
//           </div>

//           <div className="mt-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//                 >
//                   Email address
//                 </label>
//                 <div className="mt-1 relative">
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
//                   />
//                   <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
//                 </div>
//               </div>

//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//                 >
//                   Password
//                 </label>
//                 <div className="mt-1 relative">
//                   <input
//                     id="password"
//                     name="password"
//                     type="password"
//                     autoComplete="new-password"
//                     required
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
//                   />
//                   <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
//                 </div>
//               </div>

//               {error && (
//                 <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
//                   <AlertCircle className="w-5 h-5 flex-shrink-0" />
//                   <p className="text-sm">{error}</p>
//                 </div>
//               )}

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <>
//                       <LoadingSpinner size="sm" />
//                       <span>Creating Account...</span>
//                     </>
//                   ) : (
//                     <>
//                       <span>Create Account</span>
//                       <ArrowRight className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>

//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Already have an account?{" "}
//                 <button
//                   onClick={handleSignIn}
//                   className="text-indigo-600 hover:text-indigo-700 font-medium"
//                 >
//                   Sign in here
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right side - Benefits */}
//       <div className="hidden lg:block relative flex-1 bg-indigo-600">
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800">
//           <div className="absolute inset-0 bg-indigo-900 opacity-10 pattern-dots"></div>
//         </div>
//         <div className="relative h-full flex flex-col justify-center px-12">
//           <div className="max-w-lg">
//             <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
//               Your Ultimate Audition Co-Pilot
//             </h2>
//             <p className="mt-4 text-lg text-indigo-100">
//               Professional-grade scene partner tool with AI voices, smart script
//               analysis, and perfect timing control.
//             </p>

//             <div className="mt-12 space-y-8">
//               {benefits.map((benefit, index) => (
//                 <div key={index} className="flex items-start gap-4">
//                   <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
//                     {benefit.icon}
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-white">
//                       {benefit.title}
//                     </h3>
//                     <p className="mt-1 text-indigo-100">
//                       {benefit.description}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from "react";
import { useTeleprompterStore } from "../store/teleprompterStore";
import { supabase } from "../lib/supabase";
import {
  Lock,
  Mail,
  ArrowRight,
  Bot,
  Volume2,
  Brain,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: <Bot className="w-5 h-5 text-indigo-600" />,
    title: "AI Scene Partner",
    description: "Practice with realistic AI voices",
  },
  {
    icon: <Volume2 className="w-5 h-5 text-indigo-600" />,
    title: "Voice Synthesis",
    description: "Professional-grade character voices",
  },
  {
    icon: <Brain className="w-5 h-5 text-indigo-600" />,
    title: "Smart Analysis",
    description: "Automatic character detection",
  },
];

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const { setActiveTab, setIsAuthenticated, setText } = useTeleprompterStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingUserError, setExistingUserError] = useState<boolean>(false);

  // Add sign in handler
  const handleSignIn = () => {
    navigate("/signin"); // Redirects to /signin
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExistingUserError(false);

    try {
      // Sign up with Supabase
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

      if (signUpError) {
        // Check if the error is due to user already registered
        if (
          signUpError.message.includes(
            "User already registered, Sign in Instead"
          )
        ) {
          setExistingUserError(true);
          throw new Error("This email is already registered. Sign in instead.");
        } else {
          throw signUpError;
        }
      }

      // Skip sign-in step for now and just set authenticated
      if (signUpData.user) {
        const sampleScript = `INT. RESTAURANT - NIGHT

JJ sits down with his parents: his dad, DR. SHERWIN JAMSHIDI (50s, distinguished and charming) and his mom DR. VANESSA JAMSHIDI (50s, ageless beauty with superhuman discipline). A WAITER is taking their order.

SHERWIN: I'll have the steak, medium rare. And when I say medium-rare, I mean between rare and medium. Pink-ish, not freshly slaughtered.

JJ: Dad, I think he gets it.

SHERWIN: Better to be specific.

VANESSA: The kale salad for me, no pecorino, no croutons, dressing on the side. Thank you.

JJ: Just coffee for me, thanks.

VANESSA: Are you sure, honey? You're looking quite thin. (to the waiter) He'll have the steak, too.

JJ: Mom!

But the waiter nods and takes off.

JJ: I can't stay long. I have track practice.

VANESSA: Well, then you need protein. I can't have my son running around on an empty stomach.

JJ: I'm fine, mom. Do you know I take care of myself 10 months out of the year without you guys, right?

SHERWIN: And look what happens to you when you're left to your own devices. Malnourished and failing biology.

JJ: And here I was worried that you two would be dramatic. (then) It was a C! One time! And I pulled my grade back up with extra credit.

VANESSA: There's no need to shout, Julian.

JJ: I'm not— (gives up) Sorry. It's just -- some parents might be happy that their son got a full ride to UVA. It's a great school, you know.

VANESSA: Of course we are thrilled about that, honey. It has a great pre-med program -- in fact, we should set you up with some of our former colleagues in Virginia. Ken Andersen still runs the cardiology department over there, doesn't he, Sherwin?

SHERWIN: I think he does. But I always saw Julian as more of an orthopedic surgery kind of man, don't you think?

VANESSA: That does tie in with his athletic interests. You know what they say, they're the jocks of the medical field.

Sherwin chuckles. JJ's growing frustration goes unnoticed (or ignored) by both his parents. They look up as he stands.

JJ: I think I might actually be an impediment to this conversation, so, I'm gonna go.

VANESSA: Oh -- you are so sensitive. Sit down. We're going to have a lovely lunch with our son who we never get to see.

JJ hesitates. Then sits back down. Vanessa smiles and pats him on the shoulder.

VANESSA: Now, tell us more about this boyfriend of yours. Is he a good student?

Off JJ, another parental battle lost.`;

        setText(sampleScript);
        setIsAuthenticated(true);
        setActiveTab("editor");
        navigate("/dashboard");
      } else {
        throw new Error("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    setActiveTab("landing");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Get Started
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your account to access all features
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                  <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                  {existingUserError && (
                    <button
                      onClick={handleSignIn}
                      className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={handleSignIn}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:block relative flex-1 bg-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800">
          <div className="absolute inset-0 bg-indigo-900 opacity-10 pattern-dots"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center px-12">
          <div className="max-w-lg">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Your Ultimate Audition Co-Pilot
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Professional-grade scene partner tool with AI voices, smart script
              analysis, and perfect timing control.
            </p>

            <div className="mt-12 space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-indigo-100">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
