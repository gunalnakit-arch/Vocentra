"use client";
import React from "react";
import { ConversationStats } from "@/lib/types";
import { Play, FileText, DollarSign, Clock, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import TiltedCard from "./TiltedCard";

interface DashboardProps {
  stats: ConversationStats;
  audioUrl: string | null;
  onShowTranscript: () => void;
}

export const Dashboard = ({ stats, audioUrl, onShowTranscript }: DashboardProps) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      {/* Summary Card */}
      <div className="md:col-span-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Last Call Summary
        </h3>
        <p className="text-zinc-300 text-sm leading-relaxed">
          {stats.summary || "No summary available yet."}
        </p>
      </div>

      {/* Cost & Usage */}
      <TiltedCard
        containerHeight="auto"
        containerWidth="100%"
        scaleOnHover={1.05}
        rotateAmplitude={8}
      >
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl h-full">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Usage & Cost
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Duration</span>
              <span className="text-white font-mono">{formatDuration(stats.durationSeconds)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Input Tokens</span>
              <span className="text-white font-mono">{stats.inputTokens}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Output Tokens</span>
              <span className="text-white font-mono">{stats.outputTokens}</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 font-medium">Total Cost</span>
              <span className="text-green-400 font-bold font-mono">${stats.totalCost.toFixed(6)}</span>
            </div>
          </div>
        </div>
      </TiltedCard>

      {/* Recording */}
      <TiltedCard
        containerHeight="auto"
        containerWidth="100%"
        scaleOnHover={1.05}
        rotateAmplitude={8}
      >
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl h-full">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-red-400" />
            Recording
          </h3>
          {audioUrl ? (
            <audio controls className="w-full h-10 rounded-lg opacity-90 hover:opacity-100 transition-opacity" src={audioUrl} />
          ) : (
            <div className="text-zinc-500 text-sm italic">No recording available</div>
          )}
        </div>
      </TiltedCard>

      {/* View Transcript */}
      <div className="md:col-span-2">
        <TiltedCard
          containerHeight="auto"
          containerWidth="100%"
          scaleOnHover={1.05}
          rotateAmplitude={8}
        >
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
            <button
              onClick={onShowTranscript}
              className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-zinc-300 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Full Transcript
            </button>
          </div>
        </TiltedCard>
      </div>
    </div>
  );
};
