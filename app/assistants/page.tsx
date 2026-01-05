"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Assistant } from "@/lib/types";
import { AssistantCard } from "@/components/AssistantCard";
import { AssistantEditor } from "@/components/AssistantEditor";
import { Plus, ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/AuroraBackground";
import TrueFocus from "@/components/TrueFocus";
import axios from "axios";

export default function AssistantsPage() {
    const router = useRouter();
    const [assistants, setAssistants] = useState<Assistant[]>([]);
    const [selectedId, setSelectedId] = useState<string>("default");
    const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);

    const loadAssistants = async () => {
        try {
            const res = await axios.get("/api/assistants");
            setAssistants(res.data);

            // Just for UI selection state, local is fine or we can fetch from server setting
            // prioritizing usage of this simple list
            const stored = localStorage.getItem("vocentra_selected_assistant");
            if (stored) setSelectedId(stored);
        } catch (e) {
            console.error("Failed to load assistants", e);
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
            voice: "", // Will be selected from dropdown
            language: "tr-TR",
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
        // Save selected to localStorage for the Test Page to pick up default
        // In a real app we'd probably use a User Preference API
        localStorage.setItem("vocentra_selected_assistant", assistant.id);
        setSelectedId(assistant.id);
        router.push("/");
    };

    const handleDelete = async (assistant: Assistant) => {
        if (confirm(`Delete "${assistant.name}"?`)) {
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
            alert("Failed to save assistant");
        }
    };

    const handleCancel = () => {
        setEditingAssistant(null);
    };

    if (editingAssistant) {
        return (
            <main className="relative w-full min-h-screen overflow-auto text-white">
                <AuroraBackground>
                    <div className="relative z-10 py-8">
                        <AssistantEditor
                            assistant={editingAssistant}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    </div>
                </AuroraBackground>
            </main>
        );
    }

    return (
        <main className="relative w-full min-h-screen overflow-auto text-white">
            <AuroraBackground>
                <div className="relative z-10 w-full max-w-6xl mx-auto p-6 space-y-8">
                    {/* Header */}
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                        <div className="w-full md:w-auto flex justify-start">
                            <button
                                onClick={() => router.push("/")}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Back to Test</span>
                            </button>
                        </div>

                        <div className="order-first md:order-none scale-90 md:scale-100">
                            <TrueFocus
                                sentence="AI Assistants"
                                manualMode={false}
                                blurAmount={5}
                                borderColor="rgba(147, 51, 234, 1)"
                                animationDuration={2}
                                pauseBetweenAnimations={1}
                            />
                        </div>

                        <div className="w-full md:w-auto flex justify-center md:justify-end">
                            <button
                                onClick={handleCreateNew}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-purple-900/20"
                            >
                                <Plus className="w-5 h-5" />
                                <span>New Assistant</span>
                            </button>
                        </div>
                    </div>

                    {/* Assistant Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    {assistants.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">No assistants yet</p>
                            <button
                                onClick={handleCreateNew}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Create Your First Assistant
                            </button>
                        </div>
                    )}
                </div>
            </AuroraBackground>
        </main>
    );
}
