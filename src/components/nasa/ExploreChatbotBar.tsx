"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, HelpCircle, Grip, Send, ArrowRight, X } from "lucide-react";

interface ExploreChatbotBarProps {
  onExploreClick?: () => void;
}

export const ExploreChatbotBar: React.FC<ExploreChatbotBarProps> = ({
  onExploreClick,
}) => {
  const [query, setQuery] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    {
      role: "ai",
      text: "Welcome to ETHIODROUGHT Earth System Intelligence. Ask about Borena pastoral deficits, NASA satellite telemetry, or soil moisture vs. rainfall anomalies.",
    },
  ]);

  const handleSend = (userText?: string) => {
    const textToSend = userText || query;
    if (!textToSend.trim()) return;

    const newMsgs = [...messages, { role: "user" as const, text: textToSend }];
    setMessages(newMsgs);
    setQuery("");
    setChatOpen(true);

    // Contextual Scientific Intelligence response
    setTimeout(() => {
      let reply = "";
      const lower = textToSend.toLowerCase();
      if (lower.includes("borena") || lower.includes("soil")) {
        reply = "Borena Zone root-zone soil moisture (0-100cm) is critically depleted at 0.142 m³/m³ (-2.14 σ below baseline). Despite scattered showers, subterranean water storage has collapsed across 8 pastoral woredas.";
      } else if (lower.includes("rain") || lower.includes("rainfall")) {
        reply = "Precipitation accumulation from NASA GPM IMERG indicates -1.82 σ anomaly (32.4 mm observed vs 74.5 mm climatological average). Consecutive seasonal monsoon failures have compounded the drought.";
      } else if (lower.includes("satellite") || lower.includes("orbit")) {
        reply = "ETHIODROUGHT synthesizes 3 verified satellite constellations: NASA FLDAS Noah LSM (hydrological soil), GPM IMERG V07 (precipitation), and MODIS Terra MOD13A2 (canopy NDVI vigor).";
      } else {
        reply = "Satellite telemetry confirms multi-sensor compound environmental drought stress across southern and eastern Ethiopia. Both soil moisture and vegetation indicators remain below the -1.5 σ severe threshold.";
      }

      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xl mx-auto z-20 pointer-events-auto">
      {/* Centered EXPLORE Pill with Glowing Outer Ring matching reference */}
      <Link href="/explore" className="nasa-glowing-pill cursor-pointer group hover:scale-105 transition-all">
        <div className="nasa-glowing-pill-inner flex items-center gap-2">
          <span>EXPLORE</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-cyan group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Chatbot Prompt Bar matching reference layout */}
      <div className="w-full relative">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#121929]/90 backdrop-blur-2xl border border-[rgba(168,191,220,0.22)] shadow-[0_15px_35px_rgba(0,0,0,0.6)] focus-within:border-accent-cyan transition-all">
          {/* Glowing AI Sparkle Icon Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-8 h-8 rounded-full bg-[#1a243a] border border-accent-cyan/50 flex items-center justify-center text-accent-cyan shrink-0 shadow-[0_0_12px_rgba(40,215,197,0.4)] hover:scale-110 transition-transform"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Prompt Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tell me what you want to know about Ethiopia drought signals..."
            className="w-full bg-transparent text-xs text-[#FBFCFD] placeholder-[#999CA0] font-sans focus:outline-none"
          />

          {/* Right Action Icons: Help (?) and 6-dot Menu */}
          <div className="flex items-center gap-2 shrink-0 text-[#999CA0]">
            <button
              onClick={() => handleSend("Explain current Borena drought status")}
              className="hover:text-white transition-colors"
              title="Help / Quick Query"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className="hover:text-white transition-colors"
              title="Options"
            >
              <Grip className="w-4 h-4" />
            </button>
            {query.trim() && (
              <button
                onClick={() => handleSend()}
                className="w-6 h-6 rounded-full bg-accent-cyan text-[#040507] flex items-center justify-center"
              >
                <Send className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Chat Drawer Popup */}
        {chatOpen && (
          <div className="absolute bottom-16 left-0 right-0 p-4 rounded-3xl bg-[#0e1626]/95 backdrop-blur-2xl border border-accent-cyan/40 shadow-2xl space-y-3 z-50 animate-fade-in-up">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(168,191,220,0.15)] text-xs font-mono">
              <span className="text-accent-cyan flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" /> EARTH INTELLIGENCE AI
              </span>
              <button onClick={() => setChatOpen(false)} className="text-[#999CA0] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                "What is Borena's soil moisture?",
                "Why is rainfall alone not enough?",
                "Which regions are most critical?",
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(pill)}
                  className="px-2.5 py-1 rounded-full bg-[#162036] hover:bg-accent-blue/40 border border-[rgba(168,191,220,0.2)] text-[10px] text-[#A8BFDC] hover:text-white transition-all font-mono"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="max-h-48 overflow-y-auto space-y-2 text-xs font-sans pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl leading-relaxed ${
                    m.role === "ai"
                      ? "bg-[#162036]/80 text-[#FBFCFD] border border-accent-cyan/20"
                      : "bg-accent-blue/30 text-accent-cyan border border-accent-blue/40 ml-6"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
