"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuroraBackground } from "@/components/AuroraBackground";
import { Hero } from "@/components/Hero";
import { CallAnalytics } from "@/components/CallAnalytics";
import { Typewriter } from "@/components/Typewriter";
import { Assistant } from "@/lib/types";
import { Users, Mic, PhoneOff, Loader2 } from "lucide-react";
import TrueFocus from "@/components/TrueFocus";
import axios from "axios";
import { useUltravoxSession } from "@/hooks/useUltravoxSession";

export default function Home() {
    const router = useRouter();
    const [assistant, setAssistant] = useState<Assistant | null>(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState<"idle" | "connecting" | "connected" | "finished">("idle");
    const [callId, setCallId] = useState<string | null>(null);
    const [callAnalytics, setCallAnalytics] = useState<any>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const { connect, disconnect, isConnected, session, error: ultravoxError } = useUltravoxSession();

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
            const res = await axios.post(`/api/assistants/${assistant.id}/test-session`);
            const { joinUrl, callId: newCallId } = res.data;

            setCallId(newCallId);
            await connect(joinUrl);
            setSessionStatus("connected");

        } catch (e: any) {
            console.error("Test session failed", e);
            const msg = e.response?.data?.error || e.message || "Failed to start test session";
            alert(`Error: ${msg}`);
            setSessionStatus("idle");
        }
    };

    const handleEndCall = async () => {
        disconnect();
        setSessionStatus("finished");

        // Fetch call analytics
        if (callId) {
            try {
                const res = await axios.get(`/api/calls/${callId}`);
                setCallAnalytics(res.data);
                setShowAnalytics(true);
            } catch (e) {
                console.error("Failed to fetch call analytics", e);
            }
        }
    };

    return (
        <main className="relative w-full min-h-screen text-white">
            <AuroraBackground>
                <div className="relative z-10 flex flex-col min-h-screen w-full max-w-6xl mx-auto p-4 md:p-6">
                    <header className="flex justify-between items-center py-4">
                        <div className="flex flex-col gap-2">
                            <TrueFocus
                                sentence="Vocentra AI"
                                manualMode={false}
                                blurAmount={5}
                                borderColor="rgba(147, 51, 234, 1)"
                                animationDuration={2}
                                pauseBetweenAnimations={1}
                            />
                            {assistant && (
                                <h2 className="text-xl md:text-3xl font-bold italic text-purple-200 truncate max-w-[200px] md:max-w-none">
                                    <Typewriter text={`Testing: ${assistant.name}`} speed={80} />
                                </h2>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push("/assistants")}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                title="Manage Assistants"
                            >
                                <Users className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col items-center justify-center relative">

                        {sessionStatus === "idle" && (
                            <div className="animate-in fade-in zoom-in duration-500 text-center">
                                {loading ? (
                                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-purple-500" />
                                ) : (
                                    <>
                                        {assistant ? (
                                            <Hero onStart={handleStartTest} />
                                        ) : (
                                            <div className="bg-black/40 p-8 rounded-xl border border-white/10">
                                                <h2 className="text-xl font-bold mb-4">No Assistant Found</h2>
                                                <button
                                                    onClick={() => router.push("/assistants")}
                                                    className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
                                                >
                                                    Create Assistant
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {sessionStatus === "connecting" && (
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                                <p className="text-xl font-medium">Connecting to Ultravox...</p>
                            </div>
                        )}

                        {sessionStatus === "connected" && session && (
                            <div className="w-full h-full flex flex-col items-center justify-center py-8">
                                <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-8 md:mb-12">
                                    <div className="absolute inset-0 bg-purple-600/20 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 bg-black/60 backdrop-blur-xl border border-purple-500/50 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.3)]">
                                        <Mic className="w-10 h-10 md:w-16 md:h-16 text-purple-400" />
                                    </div>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center px-4">{assistant?.name}</h2>
                                <p className="text-zinc-400 mb-8 animate-pulse text-sm md:text-base">Listening...</p>

                                <button
                                    onClick={handleEndCall}
                                    className="bg-red-500 text-white px-8 py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg flex items-center gap-3 text-lg"
                                >
                                    <PhoneOff className="w-6 h-6" />
                                    End Call
                                </button>
                            </div>
                        )}

                        {sessionStatus === "finished" && (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-6">Session Ended</h2>
                                <button
                                    onClick={() => setSessionStatus("idle")}
                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                                >
                                    Back to Home
                                </button>
                            </div>
                        )}

                        {ultravoxError && (
                            <div className="absolute bottom-4 left-4 right-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                                Error: {ultravoxError.message}
                            </div>
                        )}

                    </div>
                </div>
            </AuroraBackground>

            {/* Call Analytics Modal */}
            {showAnalytics && callAnalytics && (
                <CallAnalytics
                    callData={callAnalytics}
                    onClose={() => {
                        setShowAnalytics(false);
                        setSessionStatus("idle");
                    }}
                />
            )}
        </main>
    );
}
