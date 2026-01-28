"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Assistant } from "@/lib/types";
import { AssistantCard } from "@/components/AssistantCard";
import { AssistantEditor } from "@/components/AssistantEditor";
import { Plus, ArrowLeft, LayoutDashboard, Search } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

export default function AssistantsPage() {
    const router = useRouter();
    const [assistants, setAssistants] = useState<Assistant[]>([]);
    const [selectedId, setSelectedId] = useState<string>("default");
    const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAssistants = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/assistants");
            setAssistants(res.data);

            const stored = localStorage.getItem("vocentra_selected_assistant");
            if (stored) setSelectedId(stored);
        } catch (e) {
            console.error("Failed to load assistants", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssistants();
    }, []);

    const handleCreateNew = () => {
        const newAssistant: Assistant = {
            id: "new-" + Date.now(),
            name: "",
            description: "",
            systemInstruction: "",
            voice: "",
            language: "tr-TR",
            provider: "voice",
            files: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setEditingAssistant(newAssistant);
    };

    const handleEdit = (assistant: Assistant) => {
        setEditingAssistant(assistant);
    };

    const handleTest = (assistant: Assistant) => {
        localStorage.setItem("vocentra_selected_assistant", assistant.id);
        setSelectedId(assistant.id);
        router.push("/test");
    };

    const handleDelete = async (assistant: Assistant) => {
        if (confirm(`"${assistant.name}" asistanı ile olan bağlantıyı kesmek istediğinize emin misiniz?`)) {
            await axios.delete(`/api/assistants/${assistant.id}`);
            loadAssistants();
        }
    };

    const handleSave = async (assistant: Assistant) => {
        try {
            if (assistant.id.startsWith("new")) {
                await axios.post("/api/assistants", assistant);
            } else {
                await axios.put(`/api/assistants/${assistant.id}`, assistant);
            }
            loadAssistants();
            setEditingAssistant(null);
        } catch (e) {
            console.error("Failed to save", e);
            alert("Kaydetme işlemi başarısız oldu.");
        }
    };

    const handleCancel = () => {
        setEditingAssistant(null);
    };

    if (editingAssistant) {
        return (
            <main className="relative w-full min-h-screen overflow-auto text-white bg-black">
                <div className="relative z-10">
                    <AssistantEditor
                        assistant={editingAssistant}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="relative w-full min-h-screen overflow-auto text-white bg-black">
            <div className="relative z-10 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                    <div className="w-full md:w-auto flex justify-start">
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-400 hover:text-white transition-all border border-white/10 group active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm tracking-wide">Ana Sayfa</span>
                        </button>
                    </div>

                    <div className="order-first md:order-none scale-110 md:scale-125 origin-center">
                        <h1 className="text-4xl md:text-5xl font-black text-white">
                            Asistanlarım
                        </h1>
                    </div>

                    <div className="w-full md:w-auto flex justify-center md:justify-end">
                        <button
                            onClick={handleCreateNew}
                            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 md:py-3 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Yeni Asistan Bağla</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-2">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Bağlı Asistanlar</p>
                        <p className="text-4xl font-black text-white">{assistants.length}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-2">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Aktif Servisler</p>
                        <p className="text-4xl font-black text-white">2</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-2">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sistem Durumu</p>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-lg font-black text-emerald-500">Çevrimiçi</p>
                        </div>
                    </div>
                </div>

                {/* Assistant Grid */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-500">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 pb-32">
                        {assistants.map((assistant) => (
                            <AssistantCard
                                key={assistant.id}
                                assistant={assistant}
                                isSelected={assistant.id === selectedId}
                                onEdit={handleEdit}
                                onTest={handleTest}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {!loading && assistants.length === 0 && (
                    <div className="text-center py-32 bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] animate-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Search className="w-10 h-10 text-zinc-700" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4">Bağlı Asistan Bulunmuyor</h3>
                        <p className="text-zinc-500 mb-12 max-w-sm mx-auto font-medium">
                            Hemen yeni bir asistan bağlayarak Vocentra deneyimine ilk adımı atın.
                        </p>
                        <button
                            onClick={handleCreateNew}
                            className="px-12 py-5 bg-white text-black rounded-[1.5rem] font-black text-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl shadow-white/5"
                        >
                            Asistan Bağla
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
