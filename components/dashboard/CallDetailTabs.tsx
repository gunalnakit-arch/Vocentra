"use client";
import React, { useState } from "react";
import {
    FileText,
    Mic,
    BarChart3,
    ShieldCheck,
    User,
    Zap,
    Search,
    RefreshCw,
    MessageSquare,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Smile
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Call } from "@/lib/types";
import axios from "axios";

interface CallDetailTabsProps {
    call: Call;
    onUpdate?: () => void;
}

type TabType = "overview" | "transcript" | "analytics" | "quality" | "avatar" | "actions";

const CallDetailTabs = ({ call, onUpdate }: CallDetailTabsProps) => {
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [transcriptSearch, setTranscriptSearch] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [localTranscript, setLocalTranscript] = useState<any[]>(call.transcript || []);
    const [fetchingTranscript, setFetchingTranscript] = useState(false);

    // Fetch transcript if missing
    React.useEffect(() => {
        if (!call.transcript || call.transcript.length === 0) {
            const fetchMessages = async () => {
                setFetchingTranscript(true);
                try {
                    const res = await axios.get(`/api/calls/${call.id}/messages`);
                    const messages = res.data.results || res.data.messages || [];
                    setLocalTranscript(messages);
                } catch (error) {
                    console.error("Failed to fetch transcript fallback:", error);
                } finally {
                    setFetchingTranscript(false);
                }
            };
            fetchMessages();
        } else {
            setLocalTranscript(call.transcript);
        }
    }, [call.id, call.transcript]);

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            await axios.post(`/api/calls/${call.id}/analytics`);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Analiz işlemi başarısız oldu. Lütfen tekrar deneyin.");
        } finally {
            setAnalyzing(false);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: FileText },
        { id: "transcript", label: "Transcript", icon: Mic },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "quality", label: "Quality", icon: ShieldCheck },
        { id: "avatar", label: "Avatar", icon: User },
        { id: "actions", label: "Actions", icon: Zap },
    ];

    const analytics = call.analytics;

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-600" : "text-slate-400")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {(!analytics || localTranscript.length === 0) && (
                            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                                <div className="flex items-center gap-4 text-amber-600">
                                    <AlertCircle className="w-8 h-8 shrink-0" />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Eksik Veri Tespit Edildi</p>
                                        <p className="text-[10px] font-bold opacity-80 uppercase leading-none">Görüşme analizi veya transkript henüz hazır değil.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="px-6 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Zap className={cn("w-3.5 h-3.5", analyzing && "animate-spin")} />
                                    {analyzing ? "ANALİZ EDİLİYOR..." : "HEMEN ANALİZ ET"}
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem]">
                                <Smile className="w-5 h-5 text-indigo-600 mb-4" />
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Duygu Skoru</p>
                                <p className="text-3xl font-black text-slate-800">{analytics?.sentimentScore || 0}%</p>
                            </div>
                            <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem]">
                                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-4" />
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Kalite Skoru</p>
                                <p className="text-3xl font-black text-slate-800">{analytics?.qualityScore || 0}%</p>
                            </div>
                            <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-[2rem]">
                                <AlertCircle className="w-5 h-5 text-rose-600 mb-4" />
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Risk Durumu</p>
                                <p className="text-3xl font-black text-slate-800">{analytics?.riskFlags?.length || 0} Flag</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tighter uppercase italic">Özet & Outcome</h3>
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                        {call.summary || "Özet hazırlanıyor..."}
                                    </p>
                                </div>
                                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Görüşme Sonucu</span>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <p className="text-lg font-black mt-1 uppercase italic tracking-tight">{analytics?.outcome || "Bilinmiyor"}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tighter uppercase italic">Next Best Actions</h3>
                                <div className="space-y-3">
                                    {analytics?.actionItems?.map((action, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all">
                                            <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-[10px]">
                                                {i + 1}
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-normal">{action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "transcript" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-10">
                            <h3 className="text-lg font-black text-slate-800 tracking-tighter uppercase italic">Interactive Transcript</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Transcript içinde ara..."
                                    value={transcriptSearch}
                                    onChange={(e) => setTranscriptSearch(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 pl-9 pr-4 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>
                        </div>

                        {localTranscript.length === 0 ? (
                            <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                                    <Mic className={cn("w-12 h-12 text-slate-300", fetchingTranscript && "animate-pulse")} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">
                                        {fetchingTranscript ? "Transkript Getiriliyor..." : "Transkript Bulunamadı"}
                                    </h4>
                                    <p className="text-xs font-bold text-slate-300 mt-2">
                                        {fetchingTranscript
                                            ? "Görüşme kayıtları buluttan senkronize ediliyor."
                                            : "Bu görüşme henüz ses dosyasından metne dökülmemiş."}
                                    </p>
                                </div>
                                {!fetchingTranscript && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                                    >
                                        <RefreshCw className={cn("w-3.5 h-3.5", analyzing && "animate-spin")} />
                                        {analyzing ? "YÜKLENİYOR..." : "BİLGİLERİ GETİR"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {localTranscript.map((msg, i) => {
                                    const isAgent = msg.role === "assistant" || msg.role === "agent";
                                    return (
                                        <div key={i} className={cn(
                                            "flex gap-4 group",
                                            isAgent ? "" : "flex-row-reverse text-right"
                                        )}>
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-sm",
                                                isAgent ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-600"
                                            )}>
                                                {isAgent ? <Zap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div className={cn(
                                                "max-w-[75%] space-y-1",
                                                isAgent ? "" : "items-end"
                                            )}>
                                                <div className="flex items-center gap-2 mb-1 px-1">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{msg.role}</span>
                                                    <span className="text-[10px] font-bold text-slate-300">12:44:{i < 10 ? `0${i}` : i}</span>
                                                </div>
                                                <div className={cn(
                                                    "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                                                    isAgent ? "bg-white border border-slate-100 text-slate-800" : "bg-indigo-600 text-white"
                                                )}>
                                                    {msg.text || msg.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "analytics" && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-8">Duygu Zaman Çizelgesi</h4>
                                <div className="h-48 w-full flex items-end gap-2 px-2">
                                    {(analytics?.emotionalTrend || [40, 60, 30, 80, 50, 90, 70]).map((score, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div
                                                className="w-full bg-indigo-50 border border-indigo-100 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600"
                                                style={{ height: `${score}%` }}
                                            />
                                            <span className="text-[8px] font-black text-slate-300 uppercase">{i + 1}dk</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                                <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-8">Topic / Intent Segmentasyonu</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                        <div>
                                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Birincil intent</p>
                                            <h5 className="text-slate-800 font-bold uppercase tracking-tight">{analytics?.classification?.intent || "Bilinmiyor"}</h5>
                                        </div>
                                        <span className="text-2xl font-black text-indigo-600 italic">#1</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-slate-50 pb-4">
                                        <div>
                                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Ana Başlık</p>
                                            <h5 className="text-slate-800 font-bold uppercase tracking-tight">{analytics?.classification?.topic || "Bilinmiyor"}</h5>
                                        </div>
                                        <span className="text-2xl font-black text-slate-300 italic">TOPIC</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-32 h-32 text-indigo-400" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-6">Expert AI Assessment</h4>
                                <p className="text-white text-2xl font-black leading-tight tracking-tight italic max-w-2xl group-hover:translate-x-2 transition-transform duration-500">
                                    "{analytics?.expertAssessment || "Niteliksel analiz hazırlanıyor..."}"
                                </p>
                                <div className="mt-8 flex items-center gap-4">
                                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                        SLA: %98.4
                                    </div>
                                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                        Risk: Düşük
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Placeholder for other tabs ... */}
                {(activeTab === "quality" || activeTab === "avatar" || activeTab === "actions") && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                        < Zap className="w-20 h-20 mb-6 text-indigo-600 animate-pulse" />
                        <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-800 uppercase italic">Modül Yükleniyor...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallDetailTabs;
