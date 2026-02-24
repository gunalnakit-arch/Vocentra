"use client";
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Call } from "@/lib/types";
import { aggregateCallData } from "@/lib/analytics-utils";
import { db } from "@/lib/db";
import {
    LayoutDashboard,
    RefreshCw,
    ChevronRight,
    Search,
    Filter,
    Mic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Components
import KPICards from "@/components/dashboard/KPICards";
import TrendCharts from "@/components/dashboard/TrendCharts";
import IntentDistribution from "@/components/dashboard/IntentDistribution";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import MasterHistorySidebar from "@/components/dashboard/MasterHistorySidebar";
import CallDetailTabs from "@/components/dashboard/CallDetailTabs";
import { Assistant } from "@/lib/types";
import { useRouter } from "next/navigation";
import { ArrowLeft, User as UserIcon } from "lucide-react";

export default function MasterDashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const assistantId = searchParams.get("assistantId");

    const [assistant, setAssistant] = useState<Assistant | null>(null);
    const [calls, setCalls] = useState<Call[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState<Call | null>(null);
    const [filterType, setFilterType] = useState<string>("all");

    // Redirect if no assistantId
    useEffect(() => {
        if (!assistantId) {
            router.replace("/assistants");
        }
    }, [assistantId, router]);

    // Fetch Assistant Metadata
    const fetchAssistant = async () => {
        if (!assistantId) return;
        try {
            const data = await db.getAssistant(assistantId);
            setAssistant(data);
        } catch (error) {
            console.error("Error fetching assistant:", error);
        }
    };

    // Fetch data from Supabase
    const fetchData = async () => {
        setLoading(true);
        try {
            const callsData = await db.getCalls(assistantId || undefined);
            setCalls(callsData);
        } catch (error) {
            console.error("Error fetching calls:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (assistantId) {
            fetchAssistant();
            fetchData();
        }
    }, [assistantId]);

    // Aggregate stats
    const stats = useMemo(() => aggregateCallData(calls), [calls]);

    // Handle insight click (filters the sidebar/list)
    const handleInsightClick = (filter: string) => {
        setFilterType(filter);
        setSelectedCall(null);
        // Scroll to history list or highlight it
    };

    if (loading || !assistantId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
                    {assistantId ? "Veriler Senkronize Ediliyor" : "Yönlendiriliyorsunuz..."}
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
            {/* LEFT: Master History Sidebar (Command Center List) */}
            <div className="w-80 flex-shrink-0 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <MasterHistorySidebar
                    calls={calls}
                    selectedCall={selectedCall}
                    onSelectCall={setSelectedCall}
                />
            </div>

            {/* MAIN: Global Intelligence or Selected Call Detail */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {selectedCall ? (
                    <div className="h-full flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <button
                                onClick={() => setSelectedCall(null)}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Dashbord'a Dön
                            </button>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-slate-400">SESSION ID:</span>
                                <span className="font-mono text-xs text-slate-800">{selectedCall.id}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <CallDetailTabs call={selectedCall} onUpdate={fetchData} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Selected Assistant Banner */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/20 mb-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LayoutDashboard className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-black uppercase tracking-widest">AKTİF ASİSTAN</span>
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{assistant?.name || "Asistan"}</h2>
                                    <p className="text-indigo-100 text-xs font-bold mt-1 opacity-80">{assistant?.description}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => router.push("/assistants")}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all"
                                    >
                                        Asistan Değiştir
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Global KPI Section */}
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">
                                Performans Özeti
                            </h2>
                            <button
                                onClick={fetchData}
                                className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>

                        {calls.length > 0 ? (
                            <>
                                <KPICards stats={stats} />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <TrendCharts stats={stats} />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <AIInsightPanel stats={stats} onInsightClick={handleInsightClick} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <IntentDistribution data={stats.intentDistribution} title="Intent Dağılımı (AI)" />
                                    <IntentDistribution data={stats.topicDistribution} title="Topic Dağılımı (AI)" />
                                </div>
                            </>
                        ) : (
                            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center">
                                <div className="p-8 bg-white rounded-full shadow-sm mb-6">
                                    <Mic className="w-12 h-12 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">Henüz Kayıtlı Görüşme Yok</h3>
                                <p className="text-slate-500 text-sm font-bold max-w-sm mx-auto mt-2 leading-relaxed uppercase tracking-wider opacity-60">
                                    Bu asistan ile henüz bir görüşme gerçekleştirilmedi. <br />
                                    Hemen bir test araması başlatarak verileri toplamaya başlayın.
                                </p>
                                <button
                                    onClick={() => router.push("/assistants")}
                                    className="mt-8 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                                >
                                    Test Başlat
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
