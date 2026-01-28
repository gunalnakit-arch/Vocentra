"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Assistant, Call } from "@/lib/types";
import {
    ArrowLeft,
    LayoutDashboard,
    Clock,
    DollarSign,
    MessageSquare,
    FileText,
    BarChart3,
    ChevronRight,
    Loader2,
    Calendar,
    RefreshCw,
    User,
    Mic,
    Play,
    TrendingUp,
    ShieldCheck,
    Target
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function AssistantDashboard({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callIdParam = searchParams.get("callId");
    const { id } = use(params);
    const [assistant, setAssistant] = useState<Assistant | null>(null);
    const [calls, setCalls] = useState<Call[]>([]);
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [callDetails, setCallDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "transcript" | "analytics">("overview");
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (callIdParam && calls.length > 0 && !selectedCall) {
            const targetCall = calls.find(c => c.id === callIdParam);
            if (targetCall) {
                handleSelectCall(targetCall, "analytics");
            }
        }
    }, [callIdParam, calls, selectedCall]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [assistantRes, callsRes] = await Promise.all([
                axios.get(`/api/assistants/${id}`),
                axios.get(`/api/assistants/${id}/calls`)
            ]);
            setAssistant(assistantRes.data);
            setCalls(callsRes.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await axios.post(`/api/assistants/${id}/sync`);
            await fetchData();
        } catch (error) {
            console.error("Error syncing history:", error);
            alert("Geçmiş senkronize edilirken bir hata oluştu.");
        } finally {
            setSyncing(false);
        }
    };

    const handleSelectCall = async (call: Call, initialTab: "overview" | "transcript" | "analytics" = "overview") => {
        setSelectedCall(call);
        setDetailsLoading(true);
        setActiveTab(initialTab);
        try {
            // Fetch basic call details
            const res = await axios.get(`/api/calls/${call.id}`);

            // Fetch transcript/messages (Lazy load)
            const messagesRes = await axios.get(`/api/calls/${call.id}/messages`);

            // Fetch extras (Recordings, Logs/Events) (Lazy load)
            const extrasRes = await axios.get(`/api/calls/${call.id}/extras`);

            const combinedData = {
                ...res.data,
                ...extrasRes.data,
                messages: messagesRes.data.results || messagesRes.data.messages || []
            };

            setCallDetails(combinedData);
        } catch (error) {
            console.error("Error fetching call details:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleGenerateAnalytics = async () => {
        if (!selectedCall) return;
        setAnalyticsLoading(true);
        try {
            const res = await axios.post(`/api/calls/${selectedCall.id}/analytics`);
            setCallDetails({ ...callDetails, analytics: res.data });
        } catch (error) {
            console.error("Error generating analytics:", error);
            alert("Analiz oluşturulurken bir hata oluştu.");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                    <LayoutDashboard className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Dashboard Yükleniyor</p>
            </div>
        );
    }

    if (!assistant) return <div>Asistan Bulunamadı</div>;

    const analytics = callDetails?.analytics;

    return (
        <main className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-20 border-b border-white/5 bg-zinc-950/50 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push("/assistants")}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black tracking-tight">{assistant.name}</h1>
                            <span className={cn(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                assistant.provider === "voice" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}>
                                {assistant.provider === "voice" ? "Voice AI" : "Avatar AI"}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Stratejik Performans Paneli</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
                        {syncing ? "Senkronize Ediliyor..." : "Geçmişi Senkronize Et"}
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Durum</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-emerald-500">Aktif</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar stays but maybe we can make it more of a summary or just a quick switcher */}
                <aside className="w-80 border-r border-white/5 bg-zinc-950/20 flex flex-col shrink-0">
                    <div className="p-6 border-b border-white/5 bg-zinc-900/10">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Oturum Geçmişi</h2>
                            <span className="bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">{calls.length}</span>
                        </div>
                        <button
                            onClick={() => setSelectedCall(null)}
                            className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Tüm Listeye Dön
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {calls.map((call) => (
                            <button
                                key={call.id}
                                onClick={() => handleSelectCall(call)}
                                className={cn(
                                    "w-full p-4 rounded-2xl text-left transition-all border group relative overflow-hidden",
                                    selectedCall?.id === call.id
                                        ? "bg-white text-black border-transparent shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                        : "bg-transparent border-white/5 hover:bg-white/5 text-zinc-400 hover:text-white text-xs truncate"
                                )}
                            >
                                {new Date(call.createdAt).toLocaleDateString()} - {call.id.slice(0, 8)}...
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content Pipeline */}
                <section className="flex-1 flex flex-col bg-zinc-950/10">
                    {selectedCall ? (
                        <>
                            {/* Detailed View ... (Existing code for tabs and viewport) */}
                            <div className="px-10 pt-10 border-b border-white/5 bg-zinc-950/20">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-3xl font-black tracking-tighter">Görüşme Detayları</h2>
                                        <p className="text-zinc-500 text-sm font-medium">Session ID: <span className="font-mono text-xs">{selectedCall.id}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedCall(null)}
                                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black transition-all"
                                        >
                                            Kapat
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-10">
                                    {[
                                        { id: "overview", label: "Overview", icon: FileText },
                                        { id: "transcript", label: "Transcript", icon: MessageSquare },
                                        { id: "analytics", label: "Analytics", icon: BarChart3 }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={cn(
                                                "flex items-center gap-2 pb-6 text-xs font-black uppercase tracking-[0.2em] transition-all relative",
                                                activeTab === tab.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"
                                            )}
                                        >
                                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-purple-500" : "")} />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full shadow-[0_-5px_20px_rgba(168,85,247,0.5)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                {detailsLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30">
                                        <RefreshCw className="w-12 h-12 animate-spin text-purple-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Veriler Senkronize Ediliyor</p>
                                    </div>
                                ) : (
                                    <div className="max-w-5xl mx-auto">
                                        {/* (Existing tabs content is below this, I'll keep it) */}
                                        {activeTab === "overview" && (
                                            <div className="space-y-10">
                                                {/* Stats Mosaic */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                                        <Clock className="w-6 h-6 text-purple-400 mb-6" />
                                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Duration</p>
                                                        <p className="text-3xl font-black">{callDetails?.durationSeconds ? formatDuration(callDetails.durationSeconds) : formatDuration(selectedCall.duration || 0)}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                                        <DollarSign className="w-6 h-6 text-emerald-400 mb-6" />
                                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Cost</p>
                                                        <p className="text-3xl font-black">${(callDetails?.cost || selectedCall.cost || 0).toFixed(4)}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                                        <ShieldCheck className="w-6 h-6 text-blue-400 mb-6" />
                                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Provider</p>
                                                        <p className="text-xl font-black uppercase tracking-tighter">{selectedCall.provider}</p>
                                                    </div>
                                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                                        <MessageSquare className="w-6 h-6 text-zinc-400 mb-6" />
                                                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Messages</p>
                                                        <p className="text-3xl font-black">{callDetails?.messages?.length || 0}</p>
                                                    </div>
                                                </div>

                                                {/* Summary Card */}
                                                <div className="bg-zinc-900/40 border border-white/5 p-12 rounded-[3.5rem]">
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Summary</h3>
                                                    <p className="text-zinc-400 text-lg leading-relaxed">{callDetails?.summary || selectedCall.summary || "No summary available."}</p>
                                                </div>

                                                {/* Ultravox Events / Recordings */}
                                                {selectedCall.provider === 'voice' && callDetails?.events && (
                                                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                                                        <h4 className="text-sm font-black uppercase tracking-widest mb-4">Call Events / Logs</h4>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-4 text-[10px] font-mono text-zinc-500">
                                                            {(callDetails.events.results || []).map((ev: any, i: number) => (
                                                                <div key={i} className="flex gap-4 border-b border-white/5 py-1">
                                                                    <span className="text-purple-500 shrink-0">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                                                                    <span className="text-zinc-300 font-bold">{ev.type}</span>
                                                                    <span>{JSON.stringify(ev.data)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {activeTab === "transcript" && (
                                            /* Transcript code remains same */
                                            <div className="space-y-6">
                                                {(callDetails?.messages || []).map((m: any, i: number) => (
                                                    <div key={i} className={cn("p-6 rounded-2xl", m.role === 'user' ? "bg-white/5 text-right ml-12" : "bg-purple-600/10 text-left mr-12")}>
                                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-zinc-500">{m.role}</p>
                                                        <p className="text-sm font-medium">{m.text || m.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {activeTab === "analytics" && (
                                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                                                {analytics ? (
                                                    <>
                                                        {/* Top KPI Score Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { label: "Profesyonellik", score: analytics.professionalismScore, color: "text-blue-400", bg: "bg-blue-400/10", icon: ShieldCheck },
                                                                { label: "Empati", score: analytics.empathyScore, color: "text-rose-400", bg: "bg-rose-400/10", icon: User },
                                                                { label: "Çözüm Odaklılık", score: analytics.solutionAccuracyScore, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Target }
                                                            ].map((kpi, idx) => (
                                                                <div key={idx} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2rem] group hover:border-purple-500/30 transition-all">
                                                                    <div className="flex items-start justify-between mb-4">
                                                                        <div className={cn("p-3 rounded-xl", kpi.bg)}>
                                                                            <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                                                                        </div>
                                                                        <span className="text-3xl font-black">{kpi.score}%</span>
                                                                    </div>
                                                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{kpi.label}</p>
                                                                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn("h-full transition-all duration-1000 ease-out", kpi.bg.replace('/10', ''))}
                                                                            style={{ width: `${kpi.score}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Charts Row */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {/* Emotional Trend Chart */}
                                                            {analytics.emotionalTrend && Array.isArray(analytics.emotionalTrend) && (
                                                                <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem]">
                                                                    <div className="flex items-center gap-3 mb-8">
                                                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                                                        <h3 className="text-sm font-black uppercase tracking-widest italic">Duygu Grafiği (Trend)</h3>
                                                                    </div>
                                                                    <div className="h-48 w-full relative group">
                                                                        <svg viewBox="0 0 500 100" className="w-full h-full preserve-3d">
                                                                            <defs>
                                                                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                                                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                                                                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                                                                </linearGradient>
                                                                            </defs>
                                                                            {/* Grid Lines */}
                                                                            {[0, 25, 50, 75, 100].map(y => (
                                                                                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                                                            ))}
                                                                            {/* Area */}
                                                                            <path
                                                                                d={`M 0 100 ${analytics.emotionalTrend.map((v: number, i: number) => `L ${(i / (analytics.emotionalTrend.length - 1)) * 500} ${100 - v}`).join(' ')} L 500 100 Z`}
                                                                                fill="url(#trendGradient)"
                                                                            />
                                                                            {/* Line */}
                                                                            <path
                                                                                d={analytics.emotionalTrend.map((v: number, i: number) => `${i === 0 ? 'M' : 'L'} ${(i / (analytics.emotionalTrend.length - 1)) * 500} ${100 - v}`).join(' ')}
                                                                                fill="none"
                                                                                stroke="#a855f7"
                                                                                strokeWidth="3"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                                                            />
                                                                            {/* Points */}
                                                                            {analytics.emotionalTrend.map((v: number, i: number) => (
                                                                                <circle
                                                                                    key={i}
                                                                                    cx={(i / (analytics.emotionalTrend.length - 1)) * 500}
                                                                                    cy={100 - v}
                                                                                    r="4"
                                                                                    fill="#18181b"
                                                                                    stroke="#a855f7"
                                                                                    strokeWidth="2"
                                                                                    className="hover:r-6 transition-all cursor-pointer"
                                                                                />
                                                                            ))}
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex justify-between mt-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                                                                        <span>Başlangıç</span>
                                                                        <span>Gelişme</span>
                                                                        <span>Sonuç</span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Radar Data / Call Center KPIs */}
                                                            <div className="bg-zinc-900/40 border border-white/5 p-10 rounded-[3rem]">
                                                                <div className="flex items-center gap-3 mb-8">
                                                                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                                                                    <h3 className="text-sm font-black uppercase tracking-widest italic">Performans Metrikleri</h3>
                                                                </div>
                                                                <div className="space-y-6">
                                                                    {[
                                                                        { label: "Ort. Yanıt Süresi", value: analytics.kpis?.avgResponseTime || "-", sub: "hız" },
                                                                        { label: "Sessizlik Oranı", value: analytics.kpis?.silenceRatio || "-", sub: "verimlilik" },
                                                                        { label: "Söz Kesme Sayısı", value: analytics.kpis?.interruptionCount || 0, sub: "dinleme" }
                                                                    ].map((kpi, idx) => (
                                                                        <div key={idx} className="flex items-end justify-between border-b border-white/5 pb-4">
                                                                            <div>
                                                                                <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-1">{kpi.sub}</p>
                                                                                <h4 className="text-zinc-200 font-bold">{kpi.label}</h4>
                                                                            </div>
                                                                            <span className="text-2xl font-black text-white">{kpi.value}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expert Box */}
                                                        <div className="relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-50 group-hover:opacity-100 transition-opacity rounded-[3rem]" />
                                                            <div className="relative bg-zinc-950/80 border border-white/10 p-12 rounded-[3rem] backdrop-blur-xl">
                                                                <div className="flex items-center gap-6 mb-8">
                                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                                                        <Mic className="w-8 h-8 text-purple-400" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-2xl font-black uppercase tracking-tighter">Uzman Değerlendirmesi</h3>
                                                                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{analytics.callQuality}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="text-zinc-300 text-lg leading-relaxed italic font-medium">"{analytics.expertAssessment}"</p>
                                                            </div>
                                                        </div>

                                                        {/* Insights Sections */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 mb-8 flex items-center gap-2">
                                                                    <TrendingUp className="w-4 h-4" />
                                                                    Kritik Insightlar
                                                                </h4>
                                                                <ul className="space-y-4">
                                                                    {analytics.insights?.map((item: string, i: number) => (
                                                                        <li key={i} className="flex gap-4 text-sm text-zinc-400 leading-relaxed capitalize">
                                                                            <span className="text-purple-500 font-black shrink-0">0{i + 1}.</span>
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8 flex items-center gap-2">
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                    Aksiyon Odaklı Öneriler
                                                                </h4>
                                                                <ul className="space-y-4">
                                                                    {analytics.actionItems?.map((item: string, i: number) => (
                                                                        <li key={i} className="flex gap-4 text-sm text-zinc-400 leading-relaxed capitalize">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                                            {item}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-32 text-center group">
                                                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-8 relative">
                                                            <BarChart3 className="w-10 h-10 text-zinc-700 group-hover:text-purple-500 transition-colors" />
                                                            <div className="absolute inset-0 border border-purple-500/0 rounded-full group-hover:border-purple-500/30 scale-125 transition-all duration-500" />
                                                        </div>
                                                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Görüşme Analizi Hazır Değil</h3>
                                                        <p className="text-zinc-500 text-sm max-w-sm mb-10 font-medium">Bu görüşme için henüz yapay zeka analizi oluşturulmadı. Gemini ile detaylı bir rapor hazırlayabilirsiniz.</p>
                                                        <button
                                                            disabled={analyticsLoading}
                                                            onClick={handleGenerateAnalytics}
                                                            className="relative group/btn overflow-hidden px-12 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                            <span className="relative z-10 flex items-center gap-3 group-hover/btn:text-white transition-colors">
                                                                {analyticsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                                                                ANALİZ RAPORU OLUŞTUR
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col p-10 overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black tracking-tighter">Oturum Geçmişi Tablosu</h3>
                                <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">
                                    {assistant.provider === 'voice' ? 'Ultravox Call History' : 'Anam Session History'}
                                </div>
                            </div>

                            <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-zinc-900/80 backdrop-blur-xl z-10">
                                            <tr>
                                                {assistant.provider === 'voice' ? (
                                                    <>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Start Time</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Duration</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Agent</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Call ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Summary</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Session ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Persona</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">API Key</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Start Time</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">End Time</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Duration</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Location</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Exit Status</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Report</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {calls.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} className="px-6 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-4 text-zinc-600">
                                                            <Clock className="w-12 h-12 opacity-20" />
                                                            <p className="font-black uppercase tracking-widest">Henüz görüşme verisi bulunamadı.</p>
                                                            <button onClick={handleSync} className="text-purple-500 hover:text-white transition-colors underline font-bold">Verileri Senkronize Et</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                calls.map((call) => (
                                                    <tr
                                                        key={call.id}
                                                        onClick={() => handleSelectCall(call)}
                                                        className="hover:bg-white/5 cursor-pointer transition-colors group"
                                                    >
                                                        {assistant.provider === 'voice' ? (
                                                            <>
                                                                <td className="px-6 py-4 text-xs font-medium text-zinc-400">{new Date(call.createdAt).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-xs font-black text-white">{call.duration ? formatDuration(call.duration) : "-"}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-purple-400">{call.metadata?.agentName || assistant.name}</td>
                                                                <td className="px-6 py-4 text-xs font-mono text-zinc-500">{call.id}</td>
                                                                <td className="px-6 py-4 text-xs text-zinc-400 truncate max-w-xs">{call.shortSummary || call.summary || "-"}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-6 py-4 text-xs font-mono text-zinc-300">{call.id}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-blue-400">{call.metadata?.personaName || assistant.name}</td>
                                                                <td className="px-6 py-4 text-xs font-medium text-zinc-500">{call.metadata?.apiKeyLabel || "Web Dashboard"}</td>
                                                                <td className="px-6 py-4 text-xs font-medium text-zinc-400">{new Date(call.createdAt).toLocaleString()}</td>
                                                                <td className="px-6 py-4 text-xs font-medium text-zinc-400">{call.metadata?.endedAt ? new Date(call.metadata.endedAt).toLocaleString() : "-"}</td>
                                                                <td className="px-6 py-4 text-xs font-black text-white">{call.duration ? formatDuration(call.duration) : "-"}</td>
                                                                <td className="px-6 py-4 text-xs font-bold text-zinc-500">{call.metadata?.location || "Unknown"}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={cn(
                                                                        "px-2 py-1 rounded-md text-[9px] font-black uppercase",
                                                                        call.metadata?.exitStatus === 'OK' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                                    )}>
                                                                        {call.metadata?.exitStatus || "-"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                                                        <BarChart3 className="w-4 h-4 text-zinc-500 group-hover:text-white" />
                                                                    </div>
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </main>
    );
}
