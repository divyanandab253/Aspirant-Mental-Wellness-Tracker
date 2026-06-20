/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Heart,
  Brain,
  Clock,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Activity,
  Trash2,
  Bookmark,
  Coffee,
  CheckCircle2,
  ChevronRight,
  Moon,
  Compass
} from "lucide-react";
import { JournalEntryPayload, JournalResponse, SavedJournalLog } from "./types";

// Standard seed data for a competitive exam aspirant to make the trend chart instantly beautiful
const INITIAL_ME_LOGS: SavedJournalLog[] = [
  {
    id: "seed-1",
    text: "Spent 9 hours on UPSC history review. Exhausted but completed the Mughal administration chapter.",
    selected_mood: "🙂",
    detected_mood: "Fatigued yet Resolute",
    intensity_score: 4,
    empathetic_validation: "You showed great resilience by pushing through the Mughal administration chapters despite intense exhaustion.",
    coping_strategy: "Take a strict 20-minute eye break to gaze outside and allow your prefrontal cortex to rest.",
    mindfulness_exercise: "Perform the 4-7-8 breathing cycle three times.",
    is_crisis: false,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seed-2",
    text: "NEET mock practice test scores came out. Got 520, which is far below the government seat cutoffs. Feeling very low.",
    selected_mood: "😔",
    detected_mood: "Discouraged",
    intensity_score: 8,
    empathetic_validation: "A single practice score does not define your medical competence; exam prep is a marathon with varying elevations.",
    coping_strategy: "Segregate errors into 'conceptual matches' vs 'silly errors' to remove self-blame.",
    mindfulness_exercise: "Name 5 solid items around your desk to anchor your sight.",
    is_crisis: false,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "seed-3",
    text: "Late-night CAT QA practice. Could not understand the permutations block. Feeling like I don't belong here.",
    selected_mood: "😢",
    detected_mood: "Uncertain & Anxious",
    intensity_score: 7,
    empathetic_validation: "Permutations trigger heavy cognitive fatigue; hitting a wall is a normal sign that your brain needs restorative sleep.",
    coping_strategy: "Shut the syllabus book for tonight. Set a hard boundary that peace of mind yields better memory integration.",
    mindfulness_exercise: "Slowly tap your collarbones sequentially to calm your central nervous system.",
    is_crisis: false,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function App() {
  // State definitions
  const [journalLogs, setJournalLogs] = useState<SavedJournalLog[]>(() => {
    const saved = localStorage.getItem("aspirant_wellness_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ME_LOGS;
      }
    }
    return INITIAL_ME_LOGS;
  });

  const [journalContent, setJournalContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<JournalResponse | null>(null);
  
  // Custom interactive breathing timer states
  const [breathingPhase, setBreathingPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [breathingCountdown, setBreathingCountdown] = useState(0);

  // Quick preset selections for easy testing
  const presets = [
    {
      label: "UPSC Mock Panic",
      text: "I studied for 13 hours today but failed to review Polity. My family expects me to crack it on this attempt. My chest feels incredibly tight and I'm scared.",
      emoji: "😢"
    },
    {
      label: "NEET Biology Cutoff Anxiety",
      text: "The physics curriculum feels impossible. Scores are stagnant at 540. There are practically zero seats for general category applicants under intense competition. I feel stuck.",
      emoji: "😔"
    },
    {
      label: "CAT Mock DILR Fatigue",
      text: "Got stuck in the mock CAT logic grid again and scored 80 percentile. Everyone on prep forums is claiming it was extremely easy. I feel so inferior and overwhelmed.",
      emoji: "😐"
    },
    {
      label: "Crisis Prevention Trigger (Safety Bypassing)",
      text: "I feel completely hopeless and exhausted. I want to end my life, the stress is too heavy to continue.",
      emoji: "😢"
    }
  ];

  // Save logs to localStorage
  useEffect(() => {
    localStorage.setItem("aspirant_wellness_logs", JSON.stringify(journalLogs));
  }, [journalLogs]);

  // Handle preset clicks
  const applyPreset = (preset: typeof presets[0]) => {
    setJournalContent(preset.text);
    setSelectedMood(preset.emoji);
  };

  // Breathing Guide Loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingPhase !== "idle") {
      if (breathingCountdown > 0) {
        timer = setTimeout(() => {
          setBreathingCountdown(prev => prev - 1);
        }, 1000);
      } else {
        // Switch phases
        if (breathingPhase === "inhale") {
          setBreathingPhase("hold");
          setBreathingCountdown(4);
        } else if (breathingPhase === "hold") {
          setBreathingPhase("exhale");
          setBreathingCountdown(4);
        } else if (breathingPhase === "exhale") {
          setBreathingPhase("inhale");
          setBreathingCountdown(4);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [breathingPhase, breathingCountdown]);

  const startBreathingGuide = () => {
    setBreathingPhase("inhale");
    setBreathingCountdown(4);
  };

  const stopBreathingGuide = () => {
    setBreathingPhase("idle");
    setBreathingCountdown(0);
  };

  // Submit journal entry
  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    const moodToSend = selectedMood || "😐";

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: journalContent,
          selected_mood: moodToSend
        })
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Working under local fallback mode.");
      }

      const data: JournalResponse = await response.json();
      setAnalysisResult(data);

      if (data.is_crisis && data.national_helpline) {
        // Crisis response logged specifically
        const newLog: SavedJournalLog = {
          id: `crisis-${Date.now()}`,
          text: journalContent,
          selected_mood: moodToSend,
          detected_mood: "Severe Crisis Flagged",
          intensity_score: 10,
          empathetic_validation: data.national_helpline.description,
          coping_strategy: data.national_helpline.immediate_action,
          mindfulness_exercise: "Call Kiran Helpline: 1800-599-0019 immediately.",
          is_crisis: true,
          timestamp: new Date().toISOString()
        };
        setJournalLogs(prev => [newLog, ...prev]);
      } else if (data.analysis) {
        const analysis = data.analysis;
        const newLog: SavedJournalLog = {
          id: `log-${Date.now()}`,
          text: journalContent,
          selected_mood: moodToSend,
          detected_mood: analysis.detected_mood,
          intensity_score: analysis.intensity_score,
          empathetic_validation: analysis.empathetic_validation,
          coping_strategy: analysis.actionable_support.coping_strategy,
          mindfulness_exercise: analysis.actionable_support.mindfulness_exercise,
          is_crisis: false,
          timestamp: new Date().toISOString()
        };
        setJournalLogs(prev => [newLog, ...prev]);
        setJournalContent(""); // Reset textarea ONLY on successful mild submission
      }
    } catch (err) {
      console.error(err);
      // Client-side instant offline fallback matching requirement
      const offlineFallback: JournalResponse = {
        is_crisis: false,
        analysis: {
          detected_mood: "Overwhelmed Prep Focus",
          intensity_score: 8,
          empathetic_validation: "Syllabus checkpoints can be ruthless. We understand you are under incredible study stress right now. Take rest knowing that exams do not represent your life value.",
          actionable_support: {
            coping_strategy: "Implement standard 45 minutes of silent desk focus and completely separate from social prep channels for 12 hours.",
            mindfulness_exercise: "The 5-4-3-2-1 Sensory grounding method: Name 5 things you physically see, and 4 things you touch around your mock syllabus stack."
          }
        }
      };
      setAnalysisResult(offlineFallback);
      
      const newLog: SavedJournalLog = {
        id: `offline-${Date.now()}`,
        text: journalContent,
        selected_mood: moodToSend,
        detected_mood: "Burnout Stress",
        intensity_score: 8,
        empathetic_validation: offlineFallback.analysis!.empathetic_validation,
        coping_strategy: offlineFallback.analysis!.actionable_support.coping_strategy,
        mindfulness_exercise: offlineFallback.analysis!.actionable_support.mindfulness_exercise,
        is_crisis: false,
        timestamp: new Date().toISOString()
      };
      setJournalLogs(prev => [newLog, ...prev]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear all logs
  const clearLogs = () => {
    if (confirm("Are you sure you want to clear your local mental wellness log history? This action is offline-safe and permanent.")) {
      setJournalLogs([]);
      localStorage.removeItem("aspirant_wellness_logs");
    }
  };

  // Render SVG mood trend line chart over past entries
  const renderTrendChart = () => {
    const historicalLogs = [...journalLogs].reverse(); // oldest first for chronological line charting
    if (historicalLogs.length === 0) {
      return (
        <div className="h-44 flex flex-col items-center justify-center border border-dashed border-[#d2cbbe] rounded-lg text-slate-500 bg-[#FAF7F2]">
          <Activity className="w-8 h-8 opacity-40 mb-2 stroke-slate-400" />
          <p className="text-xs">No entries log history captured yet.</p>
        </div>
      );
    }

    const maxPoints = Math.min(historicalLogs.length, 6);
    const activeLogs = historicalLogs.slice(-maxPoints);

    // Calculate chart coordinates dynamic scaling
    const width = 500;
    const height = 140;
    const paddingX = 40;
    const paddingY = 20;

    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const points = activeLogs.map((log, index) => {
      const x = paddingX + (index / (maxPoints - 1 || 1)) * chartWidth;
      const intensity = log.intensity_score || 5;
      const y = height - paddingY - ((intensity - 1) / 9) * chartHeight;
      return { x, y, value: intensity, date: new Date(log.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" }), mood: log.selected_mood };
    });

    const dPath = points.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, "");

    return (
      <div className="relative bg-[#faf8f4] border border-[#EBE6DC] rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[#3b4b35] font-semibold text-xs uppercase tracking-wide">
            <Activity className="w-3.5 h-3.5 stroke-[#4C5E48]" />
            Aspirant Stress Intensity Timeline
          </div>
          <span className="text-[10px] font-mono text-[#6A7865] bg-[#EAE4D9] px-2 py-0.5 rounded-full">
            Lower score = Better mental state
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px]">
            {/* Grid references */}
            <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#EBE6DC" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#EBE6DC" strokeDasharray="3 3" />
            <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#EBE6DC" />

            {/* Y axis levels */}
            <text x={paddingX - 10} y={paddingY + 3} className="text-[10px] font-mono fill-[#6A7865]" textAnchor="end">10 (Panic)</text>
            <text x={paddingX - 10} y={height / 2 + 3} className="text-[10px] font-mono fill-[#6A7865]" textAnchor="end">5 (Mid)</text>
            <text x={paddingX - 10} y={height - paddingY + 3} className="text-[10px] font-mono fill-[#6A7865]" textAnchor="end">1 (Calm)</text>

            {/* The line */}
            <path d={dPath} fill="none" stroke="#4C5E48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Points */}
            {points.map((p, idx) => (
              <g key={idx} className="cursor-pointer group">
                <circle cx={p.x} cy={p.y} r="5" fill="#4C5E48" stroke="#faf8f4" strokeWidth="2" className="transition-all hover:r-7" />
                
                {/* Custom tooltip helper */}
                <rect x={p.x - 20} y={p.y - 25} width="40" height="15" rx="3" fill="#2C3527" className="opacity-0 group-hover:opacity-100 transition-opacity fill-[#2C3527]" />
                <text x={p.x} y={p.y - 14} className="opacity-0 group-hover:opacity-100 text-[9px] fill-[#faf8f4] font-mono font-bold font-sans text-center transition-opacity" textAnchor="middle">
                  {p.mood} Score {p.value}
                </text>

                {/* X labels */}
                <text x={p.x} y={height - 5} className="text-[9px] font-sans fill-[#6A7865]" textAnchor="middle">
                  {p.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  // Triggering visual Midnight Panic modal immediately
  const triggerPanicModule = () => {
    setJournalContent("I feel an immense wave of pressure right now. It feels like my chest is tight and I cannot make sense of all these Mock exams and study load.");
    setSelectedMood("😢");
    
    // Auto-fill and evaluate crisis mode locally immediately
    const immediatePanic: JournalResponse = {
      is_crisis: true,
      national_helpline: {
        name: "Kiran National Mental Health Helpline",
        number: "1800-599-0019",
        description: "A secure, confidential national initiative launched by the Ministry of Social Justice and Empowerment, tailored for NEET/UPSC students coping with intense study peer expectations and late-night isolation.",
        immediate_action: "Take a deep breath and dial 1800-599-0019 immediately. Compassionate counselors are waiting to talk through your feelings with zero expectations or mock scorecard thresholds."
      }
    };
    setAnalysisResult(immediatePanic);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2C3527] pb-16 font-sans">
      {/* HEADER SECTION with Soothing Accent */}
      <h1 className="sr-only">Aspirant Mind - Mental Wellness App</h1>
      <header id="header-rail" className="border-b border-[#EAE4D9] bg-[#FAF8F4] py-5 sticky top-0 z-10 transition-shadow">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#4C5E48] text-[#F7F5F0] p-1.5 rounded-lg shadow-sm">
              <Brain className="w-5 h-5 stroke-2" />
            </div>
            <div>
              <div className="font-serif text-lg font-bold tracking-tight text-[#2C3527]">Aspirant Mind</div>
              <p className="text-[10px] text-[#6A7865] uppercase tracking-wider font-semibold">Competitive Stress Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="panic-cta-button"
              onClick={triggerPanicModule}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#80423A] text-[#FDFBF7] hover:bg-[#6C342E] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              Midnight Panic / Crisis Helper
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* APP EXPLANATION HEADER (SOOTHING & EXAM TAILORED) */}
        <div id="welcome-card" className="bg-[#EAE4D9]/80 border border-[#DBD2C5] rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1E251B]">Late-Night Grounding Portal</h2>
              <p className="text-sm text-[#4E5B4B] mt-1 max-w-xl">
                Preparing for NEET, UPSC, or CAT is a monumental task. The isolation of midnight studies can trigger immense fatigue. Express your weight here—our offline filters and custom AI validation will calm your sensory stack without scoring your output.
              </p>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#4C5E48] bg-[#F7F5F0]/80 border border-[#D5CCBE] px-3 py-1.5 rounded-xl self-start md:self-auto shadow-sm">
              <Coffee className="w-3.5 h-3.5 stroke-[#4C5E48]" />
              Safe space • No mock rankings
            </div>
          </div>
        </div>

        {/* INTERACTIVE BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT WING - REFLECTION AND ACTION FORM (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* MAIN FORM CARD */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#EBE6DC] pb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#4C5E48]" />
                  <h3 className="font-serif text-base font-semibold text-[#2C3527]">Today's Stress-Unloading Audit</h3>
                </div>
                <span className="text-[10px] font-mono text-[#6A7865] bg-[#EAE4D9] px-2.5 py-1 rounded-md">
                  No account required • Instant analysis
                </span>
              </div>

              <form onSubmit={handleSubmitEntry} className="space-y-4">
                
                {/* PRESET CHIPS */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6A7865] block mb-2">
                    Or select an indicator preset to quickly test:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-2.5 py-1 text-[11px] text-[#4E5B4B] bg-[#EAE4D9]/50 border border-[#DCD1C4] hover:bg-[#EAE4D9] rounded-lg text-left transition-all max-w-full truncate cursor-pointer"
                      >
                        <span className="mr-1">{preset.emoji}</span>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXT AREA */}
                <div>
                  <label htmlFor="journal-textarea" className="block text-xs font-semibold text-[#6A7865] mb-1.5">
                    Type or paste your thoughts, study fatigue, or mock score stress:
                  </label>
                  <textarea
                    id="journal-textarea"
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write freely... e.g., mock test panic of CAT, NEET biology cutoffs, UPSC study isolation..."
                    rows={6}
                    className="w-full bg-[#FCFAF7] border border-[#DBD2C5] rounded-xl p-3.5 text-sm transition-colors focus:ring-1 focus:ring-[#4C5E48] focus:border-[#4C5E48] outline-none text-[#2C3527] placeholder-stone-400 font-sans"
                  />
                </div>

                {/* RAPID MOOD SELECTOR */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#6A7865]">
                      Rapid State Selector <span className="text-[#80423A] font-normal text-[10px]">(Optional)</span>
                    </span>
                    {selectedMood && (
                      <button
                        type="button"
                        onClick={() => setSelectedMood(null)}
                        className="text-[10px] text-[#80423A] hover:underline cursor-pointer"
                      >
                        Clear selector
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { emoji: "😢", mood: "Screaming/Anxious" },
                      { emoji: "😔", mood: "Dejected/Low" },
                      { emoji: "😐", mood: "Numb/Exhausted" },
                      { emoji: "🙂", mood: "Resolute/Making Progress" },
                      { emoji: "🌟", mood: "Hyper Focused/Steady" }
                    ].map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedMood(item.emoji)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedMood === item.emoji
                            ? "bg-[#4C5E48] border-[#4C5E48] text-white scale-102 font-semibold shadow-sm"
                            : "bg-[#FCFAF7] border-[#DBD2C5] hover:bg-[#EAE4D9]/30 text-stone-700"
                        }`}
                      >
                        <span className="text-xl mb-0.5">{item.emoji}</span>
                        <span className="text-[9px] truncate w-full px-0.5">{item.mood.split("/")[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="pt-3 border-t border-[#EBE6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-[10px] font-mono text-[#6A7865] text-left sm:text-right">
                    Character length: {journalContent.length} {selectedMood && `• Selected Mood: ${selectedMood}`}
                  </span>
                  
                  <button
                    type="submit"
                    disabled={isAnalyzing || !journalContent.trim()}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold text-[#F7F5F0] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                      isAnalyzing
                        ? "bg-[#6A7865] opacity-80 cursor-not-allowed"
                        : !journalContent.trim()
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
                        : "bg-[#4C5E48] hover:bg-[#3E4E3A]"
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#FAF8F4] border-t-transparent rounded-full animate-spin" />
                        Decompressing Text...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Submit Entry to Analyze Coping Strategies
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* REAL-TIME RESPONSIVE BREATHING REGULATORY GUIDE */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-xl p-5 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Compass className="w-4 h-4 text-[#4C5E48]" />
                <h3 className="font-serif text-sm font-semibold text-[#2C3527]">Interactive Late-Night Anchor Guide</h3>
              </div>

              {breathingPhase === "idle" ? (
                <div className="space-y-2">
                  <p className="text-xs text-[#6A7865] max-w-sm mx-auto">
                    Feeling hyper-ventilated about pending mock results or syllabus backlogs? Run a 30-second breathing count calibration to reset.
                  </p>
                  <button
                    onClick={startBreathingGuide}
                    className="px-4 py-1.5 bg-[#4C5E48] text-white hover:bg-[#3E4E3A] text-xs font-semibold rounded-full transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm uppercase tracking-wide"
                  >
                    Launch Box Breath Guides
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 fade-in">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-28 h-28 rounded-full border border-[#DBD2C5] flex flex-col items-center justify-center transition-all duration-1000 ${
                        breathingPhase === "inhale"
                          ? "bg-[#6A7865]/10 scale-108 text-[#4C5E48]"
                          : breathingPhase === "hold"
                          ? "bg-[#80423A]/10 scale-100 text-[#80423A]"
                          : "bg-[#4E5B4B]/10 scale-95 text-[#6A7865]"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-widest font-mono font-bold">
                        {breathingPhase}
                      </span>
                      <span className="text-2xl font-serif font-bold mt-1">
                        {breathingCountdown}s
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#2C3527] italic max-w-sm mx-auto">
                    {breathingPhase === "inhale" && "Inhale deeply. Feel your chest expand slowly..."}
                    {breathingPhase === "hold" && "Hold gracefully. Give your mind permission to stand still."}
                    {breathingPhase === "exhale" && "Exhale slowly. Release all study anxiety from your body..."}
                  </div>
                  <button
                    onClick={stopBreathingGuide}
                    className="px-3 py-1 bg-[#80423A] text-white text-[10px] font-semibold rounded-full transition-all hover:bg-red-800 cursor-pointer"
                  >
                    Hold Breathing Session
                  </button>
                </div>
              )}
            </div>

            {/* LOGS HISTORY - PERMANENTLY VISIBLE IN LEFT WING */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EBE6DC] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#4C5E48]" />
                  <h3 className="font-serif text-sm font-semibold text-[#2C3527]">Your Wellness Logs & History ({journalLogs.length})</h3>
                </div>
                <button
                  onClick={clearLogs}
                  className="text-xs text-[#80423A] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Logs
                </button>
              </div>

              {journalLogs.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <p className="text-xs">No entries log history captured yet.</p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {journalLogs.map((log) => (
                    <div key={log.id} className="bg-[#FAF7F2] border border-[#EBE6DC] p-3.5 rounded-xl text-xs space-y-2 relative shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{log.selected_mood}</span>
                          <span className="font-semibold text-[#2C3527] bg-[#EAE4D9] px-2 py-0.5 rounded-full text-[10px]">
                            {log.detected_mood}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6A7865] font-mono">
                          {new Date(log.timestamp).toLocaleString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                      
                      <p className="text-stone-700 italic border-l-2 border-[#DBD2C5] pl-2 line-clamp-3 leading-relaxed">
                        "{log.text}"
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 pt-2 border-t border-[#EBE6DC]/40">
                        <div className="bg-[#EAE4D9]/40 p-2 rounded-lg border border-[#EBE6DC]">
                          <span className="font-bold text-[#4C5E48]">Coping:</span> {log.coping_strategy}
                        </div>
                        <div className="bg-[#EAE4D9]/40 p-2 rounded-lg border border-[#EBE6DC]">
                          <span className="font-bold text-[#4C5E48]">Mindfulness:</span> {log.mindfulness_exercise}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT WING - LIVE INTERACTION COUNSELOR STATUS SUMMARY (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* STRESS TREND VISUALIZER MAP */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-2xl p-4 shadow-sm">
              <h3 className="font-serif text-sm font-semibold text-[#2C3527] mb-3">Live Analysis Timeline</h3>
              {renderTrendChart()}
            </div>

            {/* REAL-TIME EVALUATED COPE SUMMARY DISPLAY */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-xl p-5 shadow-sm">
              <h3 className="font-serif text-sm font-semibold text-[#2C3527] mb-3 border-b border-[#EBE6DC] pb-2">
                Real-Time Sentiment Feedback & Strategies
              </h3>

              {isAnalyzing ? (
                <div className="py-12 flex flex-col items-center justify-center text-stone-500 space-y-3">
                  <div className="w-8 h-8 border-3 border-[#4C5E48] border-t-transparent rounded-full animate-spin" />
                  <div className="text-xs italic text-[#4E5B4B]">Counseling server decoding stress levels...</div>
                </div>
              ) : analysisResult ? (
                <div className="space-y-4 fade-in">
                  
                  {/* CRISIS ALERT HELPLINE CARD */}
                  {analysisResult.is_crisis && analysisResult.national_helpline ? (
                    <div className="bg-[#80423A]/10 border-2 border-[#80423A] p-4 rounded-xl space-y-3.5">
                      <div className="flex items-center gap-2 text-[#80423A]">
                        <AlertTriangle className="w-5 h-5 animate-bounce stroke-2" />
                        <span className="font-serif text-sm font-extrabold uppercase tracking-wide">
                          Safety Fail-Safe Triggered
                        </span>
                      </div>
                      <div className="border-b border-[#80423A]/20 pb-2">
                        <p className="font-bold text-xs text-[#80423A]">{analysisResult.national_helpline.name}</p>
                        <p className="text-base font-extrabold text-[#80423A] my-1 select-all hover:bg-[#80423A]/20 transition-all px-1.5 py-0.5 rounded inline-block bg-[#80423A]/10 cursor-alias">
                          📞 {analysisResult.national_helpline.number}
                        </p>
                      </div>
                      <p className="text-xs text-[#2C3527] leading-relaxed">
                        {analysisResult.national_helpline.description}
                      </p>
                      <div className="bg-[#FCFAF7] p-3 rounded-lg border border-[#80423A]/30 text-xs font-medium text-[#80423A] leading-normal font-sans">
                        <strong>Immediate Action:</strong> {analysisResult.national_helpline.immediate_action}
                      </div>
                    </div>
                  ) : analysisResult.analysis ? (
                    /* DECOMPRESSED ANALYSIS INFO */
                    <div className="space-y-4">
                      
                      {/* MOOD & INTENSITY SCORE */}
                      <div className="flex items-center justify-between bg-[#EAE4D9]/40 border border-[#EBE6DC] p-3 rounded-xl shadow-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#6A7865]">Detected General Sentiment</span>
                          <p className="font-serif text-lg font-bold text-[#4C5E48] leading-none mt-0.5">
                            {analysisResult.analysis.detected_mood}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-[#6A7865] block">Intensity Score</span>
                          <span className="text-lg font-mono font-black text-[#80423A]">
                            {analysisResult.analysis.intensity_score} <span className="text-xs text-stone-500 font-normal">/10</span>
                          </span>
                        </div>
                      </div>

                      {/* EMPATHETIC VALIDATION */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-[#6A7865] tracking-wider block">Empathetic Validation</span>
                        <p className="text-xs text-[#2C3527] bg-[#FAF7F2] border-l-2 border-[#4C5E48] p-3 rounded-r-lg leading-relaxed italic">
                          "{analysisResult.analysis.empathetic_validation}"
                        </p>
                      </div>

                      {/* COPING STRATEGY CARD */}
                      <div className="space-y-1 bg-[#EEEDE6] border border-[#E1DBCE] p-3.5 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4C5E48] mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Recommended Coping Action:
                        </div>
                        <p className="text-xs text-[#2C3527] leading-relaxed">
                          {analysisResult.analysis.actionable_support.coping_strategy}
                        </p>
                      </div>

                      {/* MINDFULNESS GROUNDING CARD */}
                      <div className="space-y-1 bg-[#4E5B4B]/10 border border-[#4E5B4B]/20 p-3.5 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4C5E48] mb-1">
                          <Compass className="w-3.5 h-3.5" />
                          Mindfulness Anchor Task:
                        </div>
                        <p className="text-xs text-[#2C3527] leading-relaxed italic">
                          {analysisResult.analysis.actionable_support.mindfulness_exercise}
                        </p>
                      </div>

                    </div>
                  ) : null}

                </div>
              ) : (
                /* WELCOME EXAM CARD ON BLANK STATE */
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <div className="w-10 h-10 bg-[#EAE4D9] rounded-full flex items-center justify-center mx-auto text-[#4C5E48]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <p className="text-xs font-semibold text-[#2C3527]">Aspirant Companion Standby</p>
                    <p className="text-[11px] text-[#6A7865]">
                      Write your first journal or select a quick practice template on the left to activate deep stress validation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* INTEGRATION GUIDE & EXTRA SUPPORT SCHEME */}
            <div className="bg-[#FAF8F4] border border-[#EBE6DC] rounded-xl p-4.5 space-y-3 shadow-xs">
              <h4 className="text-[11px] font-bold text-[#6A7865] uppercase tracking-wider flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5" />
                India Student Helplines:
              </h4>
              <div className="text-[11px] space-y-2 text-[#4E5B4B]" id="helpline-footer-stack">
                <div className="border-b border-[#EBE6DC] pb-1.5">
                  <p className="font-semibold text-[#2C3527]">Tele-MANAS Toll-Free (Govt. Initiative)</p>
                  <p className="font-mono text-xs font-bold text-[#80423A]">📞 14416 or 1800-891-4416</p>
                  <p className="text-[10px] leading-relaxed">Available 24/7 across multiple languages for mental support.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#2C3527]">Kiran National Mental Health Support</p>
                  <p className="font-mono text-xs font-bold text-[#80423A]">📞 1800-599-0019</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
