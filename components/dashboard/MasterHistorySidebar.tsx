"use client";
import React, { useState } from "react";
import { Search, Filter, Clock, AlertCircle, Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Call } from "@/lib/types";

interface MasterHistorySidebarProps {
    calls: Call[];
    selectedCall: Call | null;
    onSelectCall: (call: Call) => void;
}

const MasterHistorySidebar = ({ calls, selectedCall, onSelectCall }: MasterHistorySidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSentiment, setFilterSentiment] = useState<string>("all");

    const filteredCalls = calls.filter(call => {
        const matchesSearch = call.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (call.shortSummary?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Add more filter logic as needed
        return matchesSearch;
    });

    const getSentimentIcon = (score: number) => {
        if (score >= 70) return <Smile className="w-3 h-3 text-emerald-500" />;
        if (score >= 40) return <Meh className="w-3 h-3 text-amber-500" />;
        return <Frown className="w-3 h-3 text-rose-500" />;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
                        Görüşme Geçmişi
                    </h3>
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                        {calls.length}
                    </span>
                </div>

                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Görüşme veya özet ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-100 bg-white text-[9px] font-black text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                        <Filter className="w-2.5 h-2.5" /> FİLTRELE
                    </button>
                    {["Tümü", "Pozitif", "Riskli"].map((f) => (
                        <button key={f} className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white text-[9px] font-black text-slate-400 hover:border-indigo-100 hover:text-slate-600 transition-all whitespace-nowrap">
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filteredCalls.map((call) => {
                    const isActive = selectedCall?.id === call.id;
                    const sentimentScore = call.analytics?.sentimentScore || 50;
                    const hasRisk = (call.analytics?.riskFlags?.length || 0) > 0;

                    return (
                        <button
                            key={call.id}
                            onClick={() => onSelectCall(call)}
                            className={cn(
                                "w-full p-4 rounded-2xl text-left transition-all border group relative overflow-hidden",
                                isActive
                                    ? "bg-white border-indigo-600 ring-2 ring-indigo-500/10 shadow-lg shadow-indigo-600/5"
                                    : "bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50/50"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                    {new Date(call.createdAt).toLocaleDateString("tr-TR")}
                                </span>
                                <div className="flex gap-1">
                                    {getSentimentIcon(sentimentScore)}
                                    {hasRisk && <AlertCircle className="w-3 h-3 text-rose-500" />}
                                </div>
                            </div>

                            <h4 className={cn(
                                "text-xs font-bold truncate mb-1",
                                isActive ? "text-indigo-600" : "text-slate-800"
                            )}>
                                {call.shortSummary || "Özet hazırlanıyor..."}
                            </h4>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <Clock className="w-2.5 h-2.5" />
                                    {Math.floor((call.duration || 0) / 60)}dk {(call.duration || 0) % 60}sn
                                </div>
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                    call.provider === "voice" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {call.provider}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MasterHistorySidebar;
