"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CallAnalytics } from "@/components/CallAnalytics";
import { Typewriter } from "@/components/Typewriter";
import { Assistant } from "@/lib/types";
import { Users, Mic, PhoneOff, Loader2, User, ArrowLeft, Settings, Zap, ArrowRight } from "lucide-react";
import axios from "axios";
import { useUltravoxSession } from "@/hooks/useUltravoxSession";
import { cn } from "@/lib/utils";

import { AnamAvatar } from "@/components/AnamAvatar";

export default function TestPage() {
    const router = useRouter();
    const [assistant, setAssistant] = useState<Assistant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<"idle" | "connecting" | "connected" | "finished">("idle");
    const [callId, setCallId] = useState<string | null>(null);
    const [anamSessionToken, setAnamSessionToken] = useState<string | null>(null);

    const { connect, disconnect, isConnected, session, status, error: ultravoxError } = useUltravoxSession();

    useEffect(() => {
        const loadDefault = async () => {
            try {
                const storedId = localStorage.getItem("vocentra_selected_assistant");
                if (storedId) {
                    const res = await axios.get(`/api/assistants/${storedId}`);
                    setAssistant(res.data);
                } else {
                    const res = await axios.get("/api/assistants");
                    if (res.data.length > 0) {
                        setAssistant(res.data[0]);
                    }
                }
            } catch (e) {
                console.error("Failed to load assistant", e);
            } finally {
                setLoading(false);
            }
        };
        loadDefault();
    }, []);

    const handleStartTest = async () => {
        if (!assistant) return;

        setSessionStatus("connecting");
        try {
            if (assistant.provider === "voice") {
                const res = await axios.post(`/api/assistants/${assistant.id}/test-session`, {
                    agentId: assistant.providerAssistantId
                });
                const { joinUrl, callId: newCallId } = res.data;
                setCallId(newCallId);
                await connect(joinUrl);
                setSessionStatus("connected");
            } else {
                // Avatar Session Token
                const res = await axios.post(`/api/assistants/${assistant.id}/session-token`, {
                    personaId: assistant.providerAssistantId
                });
                setAnamSessionToken(res.data.sessionToken);
                setSessionStatus("connected");
            }

        } catch (e: any) {
            console.error("Test session failed", e);
            const msg = e.response?.data?.error || e.message || "Bağlantı kurulamadı";
            alert(`Hata: ${msg}`);
            setSessionStatus("idle");
        }
    };

    const handleEndCall = async () => {
        if (assistant?.provider === "voice") {
            disconnect();
        } else {
            setAnamSessionToken(null);
        }

        setSessionStatus("finished");

        if (callId && assistant) {
            try {
                // Save the call record to our local DB for the dashboard
                await axios.post('/api/calls/save', {
                    callId: callId,
                    assistantId: assistant.id,
                    provider: assistant.provider
                });

                // Redirect to dashboard with the callId selected
                router.push(`/assistants/${assistant.id}/dashboard?callId=${callId}`);
            } catch (e) {
                console.error("Failed to save or fetch call analytics", e);
                router.push(`/assistants/${assistant.id}/dashboard`);
            }
        }
    };

    return (
        <main className="relative w-full min-h-screen text-white bg-black">
            <div className="relative z-10 flex flex-col min-h-screen w-full max-w-6xl mx-auto p-4 md:p-10">

                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {sessionStatus === "idle" && (
                        <div className="animate-in fade-in zoom-in duration-700 text-center w-full max-w-2xl px-6">
                            {loading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                                    <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">Asistan Yükleniyor</p>
                                </div>
                            ) : (
                                <>
                                    {assistant ? (
                                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                            <div className="relative z-10">
                                                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 mx-auto border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                                                    {assistant.provider === "voice" ? <Mic className="w-10 h-10 text-purple-500" /> : <User className="w-10 h-10 text-blue-500" />}
                                                </div>
                                                <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{assistant.name}</h2>
                                                <p className="text-zinc-500 mb-12 text-lg font-medium">Asistanınızla görüşmeyi başlatmak ve performansı test etmek için hazır mısınız?</p>
                                                <button
                                                    onClick={handleStartTest}
                                                    className="px-12 py-5 bg-white text-black rounded-[1.5rem] font-black text-xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto"
                                                >
                                                    {assistant.provider === "voice" ? "Görüşmeyi Başlat" : "Önizlemeyi Başlat"} <ArrowRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] text-center max-w-md mx-auto">
                                            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                                                <Zap className="w-8 h-8 text-zinc-700" />
                                            </div>
                                            <h2 className="text-2xl font-black mb-4">Henüz Asistan Bağlanmadı</h2>
                                            <p className="text-zinc-500 mb-8 text-sm font-bold">Lütfen önce yönetim panelinden bir asistan seçin.</p>
                                            <button
                                                onClick={() => router.push("/assistants")}
                                                className="w-full px-8 py-4 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all active:scale-95"
                                            >
                                                Asistan Bağla
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {sessionStatus === "connecting" && (
                        <div className="flex flex-col items-center gap-8 animate-in zoom-in fade-in duration-500">
                            <div className="relative">
                                <div className="w-24 h-24 border-8 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-purple-500 animate-pulse" />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-4xl font-black text-white tracking-tighter italic">Bağlanıyor</p>
                                <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Güvenli Kanal Kuruluyor...</p>
                            </div>
                        </div>
                    )}

                    {sessionStatus === "connected" && (
                        <div className="w-full h-full flex flex-col items-center justify-center py-8 animate-in fade-in duration-1000">
                            {assistant?.provider === "avatar" && anamSessionToken ? (
                                <div className="w-full max-w-4xl mx-auto mb-10">
                                    <AnamAvatar
                                        sessionToken={anamSessionToken}
                                        onStatusChange={(s) => console.log("Anam Status:", s)}
                                        onSessionId={(sid) => setCallId(sid)}
                                    />
                                </div>
                            ) : (
                                <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center mb-10">
                                    {(status === "listening" || status === "speaking") && (
                                        <div className="absolute inset-0 bg-purple-600/10 rounded-full animate-ping opacity-75 duration-[2000ms]"></div>
                                    )}
                                    <div className="absolute inset-0 border border-white/5 rounded-full animate-pulse"></div>
                                    <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(147,51,234,0.15)] group">
                                        <div className={cn(
                                            "absolute inset-4 rounded-full border border-dashed border-white/5 animate-spin-slow duration-[10000ms]",
                                            status === "speaking" ? "border-purple-500/30" : ""
                                        )} />
                                        <Mic className={cn(
                                            "w-16 h-16 md:w-24 md:h-24 transition-all duration-500",
                                            status === "listening" ? "text-purple-400 scale-110 drop-shadow-[0_0_20px_rgba(147,51,234,0.5)]" :
                                                status === "speaking" ? "text-emerald-400 scale-110" : "text-zinc-700"
                                        )} />
                                    </div>
                                </div>
                            )}

                            <h2 className="text-3xl md:text-5xl font-black mb-4 text-center px-4 tracking-tighter">{assistant?.name}</h2>
                            <div className="flex items-center gap-3 mb-10 px-6 py-2 bg-white/5 border border-white/5 rounded-2xl">
                                <div className={cn("w-2 h-2 rounded-full", (status === "listening" || assistant?.provider === "avatar") ? "bg-purple-500 animate-pulse" : status === "speaking" ? "bg-emerald-500 animate-pulse" : "bg-zinc-700")} />
                                <p className="text-zinc-400 text-sm md:text-lg font-black uppercase tracking-[0.2em]">
                                    {assistant?.provider === "avatar" ? "Görüntülü Görüşme Aktif" : (status === "listening" ? "Sizi Dinliyorum" : status === "thinking" ? "Düşünüyorum" : status === "speaking" ? "Cevap Veriyorum" : "Hazırlanıyor")}
                                </p>
                            </div>

                            <button
                                onClick={handleEndCall}
                                className="bg-red-500 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-red-600 transition-all hover:scale-105 shadow-[0_10px_40px_rgba(239,68,68,0.3)] flex items-center gap-4 text-xl active:scale-95"
                            >
                                <PhoneOff className="w-6 h-6" />
                                Görüşmeyi Bitir
                            </button>
                        </div>
                    )}

                    {sessionStatus === "finished" && (
                        <div className="text-center animate-in zoom-in fade-in duration-700 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-16 md:p-24 rounded-[4rem] shadow-2xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Görüşme Tamamlandı</h2>
                            <p className="text-zinc-500 mb-12 text-lg font-medium">Asistan performansını analiz ettiniz. Başka bir test yapmak ister misiniz?</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => setSessionStatus("idle")}
                                    className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black text-xl hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    Yeniden Test Et
                                </button>
                                <button
                                    onClick={() => router.push("/")}
                                    className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-xl hover:bg-white/10 transition-all active:scale-95"
                                >
                                    Ana Sayfaya Dön
                                </button>
                            </div>
                        </div>
                    )}

                    {ultravoxError && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm p-4 bg-red-500/10 border border-red-500/20 rounded-[1.5rem] text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-bounce">
                            Sunucu Hatası: {ultravoxError.message}
                        </div>
                    )}

                </div>
            </div>

        </main>
    );
}
