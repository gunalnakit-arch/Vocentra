"use client";
import React, { useState, useEffect } from "react";
import { Assistant } from "@/lib/types";
import { ArrowLeft, Save, Mic, User, Settings, Zap, Search, Loader2, RefreshCw } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface AssistantEditorProps {
    assistant: Assistant;
    onSave: (assistant: Assistant) => void;
    onCancel: () => void;
}

export function AssistantEditor({
    assistant: initialAssistant,
    onSave,
    onCancel
}: AssistantEditorProps) {
    const [assistant, setAssistant] = useState<Assistant>(initialAssistant);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [providerItems, setProviderItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchProviderItems = async (provider: "voice" | "avatar") => {
        setLoading(true);
        setError(null);
        try {
            const endpoint = provider === "voice" ? "/api/providers/agents" : "/api/providers/personas";
            const res = await axios.get(endpoint);

            let data = [];
            if (provider === "voice") {
                // Ultravox returns { results: [...] }
                data = res.data?.results || [];
            } else {
                // Anam returns { data: [...] } or [...]
                data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
            }

            setProviderItems(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch provider items", e);
            setError("Asistan listesi yüklenemedi. Lütfen API anahtarlarınızı kontrol edin.");
            setProviderItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviderItems(assistant.provider);
    }, [assistant.provider]);

    const handleSave = () => {
        if (!assistant.name.trim()) {
            setError("Asistan adı zorunludur");
            return;
        }
        if (!assistant.providerAssistantId) {
            setError("Lütfen bir asistan seçin");
            return;
        }
        onSave(assistant);
    };

    const filteredItems = providerItems.filter(item => {
        const name = (item.name || item.displayName || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const handleSelectItem = (item: any) => {
        const id = item.agentId || item.id;
        const name = item.name || item.displayName || "";
        setAssistant(prev => ({
            ...prev,
            name: name,
            providerAssistantId: id
        }));
    };

    return (
        <div className="w-full h-screen overflow-auto p-8 space-y-8 bg-transparent transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onCancel}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all border border-white/10 group active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            {assistant.id.startsWith("new") ? "Asistan Bağla" : "Asistanı Güncelle"}
                        </h1>
                        <p className="text-zinc-500 text-base font-medium">Panellerinizde oluşturduğunuz asistanları buradan seçip aktifleştirin.</p>
                    </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleSave}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-95"
                    >
                        <Save className="w-5 h-5" />
                        Bağlantıyı Kaydet
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-400 text-sm flex items-center gap-4 animate-in shake duration-500">
                    <span className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center font-bold text-lg">!</span>
                    {error}
                </div>
            )}

            {/* Provider Selection */}
            <div className="flex flex-col items-center gap-4">
                <label className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">Servis Sağlayıcı</label>
                <div className="bg-black/40 backdrop-blur-3xl p-1.5 rounded-[2.5rem] border border-white/5 flex gap-2 shadow-2xl">
                    <button
                        onClick={() => setAssistant(prev => ({ ...prev, provider: "voice" }))}
                        className={cn(
                            "flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black transition-all relative overflow-hidden group",
                            assistant.provider === "voice"
                                ? "bg-purple-600 text-white shadow-[0_0_40px_rgba(147,51,234,0.4)]"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <Mic className={cn("w-5 h-5 transition-transform group-hover:scale-110", assistant.provider === "voice" ? "animate-pulse" : "")} />
                        Sesli Asistan
                    </button>
                    <button
                        onClick={() => setAssistant(prev => ({ ...prev, provider: "avatar" }))}
                        className={cn(
                            "flex items-center gap-3 px-10 py-5 rounded-[2rem] font-black transition-all relative overflow-hidden group",
                            assistant.provider === "avatar"
                                ? "bg-blue-600 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)]"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                        )}
                    >
                        <User className={cn("w-5 h-5 transition-transform group-hover:scale-110", assistant.provider === "avatar" ? "animate-pulse" : "")} />
                        Avatar Asistan
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto pb-32">
                <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-10">
                    {/* Search & Refresh */}
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="flex-1 w-full space-y-3">
                            <label className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">Asistan Arama</label>
                            <div className="relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`${assistant.provider === "voice" ? "Ultravox" : "Anam"} paneli üzerindeki isimle arayın...`}
                                    className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/5 rounded-[2rem] text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 transition-all focus:bg-white/[0.05]"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => fetchProviderItems(assistant.provider)}
                            disabled={loading}
                            className="p-5 bg-white/5 hover:bg-white/10 rounded-[1.5rem] border border-white/5 text-zinc-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-6 h-6", loading ? "animate-spin" : "")} />
                        </button>
                    </div>

                    {/* List of Items */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] ml-2">
                            Mevcut {assistant.provider === "voice" ? "Sesli Ajanlar" : "Avatar Personalar"}
                        </label>

                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                                <p className="font-bold text-lg animate-pulse">Asistanlar Getiriliyor...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredItems.map((item) => {
                                    const id = item.agentId || item.id;
                                    const name = item.name || item.displayName || "İsimsiz Asistan";
                                    const isSelected = assistant.providerAssistantId === id;

                                    return (
                                        <button
                                            key={id}
                                            onClick={() => handleSelectItem(item)}
                                            className={cn(
                                                "p-6 rounded-[2rem] border transition-all text-left flex flex-col gap-2 group",
                                                isSelected
                                                    ? "bg-purple-600/20 border-purple-500 text-white shadow-xl shadow-purple-900/10"
                                                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={cn("font-black text-lg", isSelected ? "text-white" : "text-zinc-200")}>{name}</span>
                                                {isSelected && <Zap className="w-4 h-4 fill-white" />}
                                            </div>
                                            <code className="text-[10px] opacity-40 font-mono truncate">{id}</code>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                                    <Search className="w-8 h-8 text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 font-bold">Asistan bulunamadı.</p>
                                <p className="text-xs text-zinc-600 max-w-sm mx-auto p-4">
                                    Lütfen {assistant.provider === "voice" ? "Ultravox" : "Anam.ai"} panelinizde en az bir asistan oluşturduğunuzdan emin olun.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Meta Info */}
                    {assistant.providerAssistantId && (
                        <div className="pt-8 border-t border-white/5 animate-in fade-in zoom-in duration-500">
                            <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em] mb-4">Seçili Asistan Detayları</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/5">
                                    <span className="block text-[10px] font-black text-zinc-600 uppercase mb-1">Eşleşen İsim</span>
                                    <span className="text-white font-bold">{assistant.name}</span>
                                </div>
                                <div className="bg-white/[0.03] p-6 rounded-[1.5rem] border border-white/5">
                                    <span className="block text-[10px] font-black text-zinc-600 uppercase mb-1">Sağlayıcı Kimliği</span>
                                    <span className="text-white font-mono text-sm">{assistant.providerAssistantId}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
