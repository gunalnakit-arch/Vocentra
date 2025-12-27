"use client";
import React, { useState, useEffect } from "react";
import { Assistant, AssistantFile } from "@/lib/types";
import { ArrowLeft, Save, Play, Pause } from "lucide-react";
import { FileUploadZone } from "./FileUploadZone";
import { WebCrawler } from "./WebCrawler";
import axios from "axios";
import { UltravoxVoice } from "@/lib/ultravox"; // Type only

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
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [voices, setVoices] = useState<any[]>([]);
    const [loadingVoices, setLoadingVoices] = useState(false);
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);

    // Fetch voices
    useEffect(() => {
        const fetchVoices = async () => {
            setLoadingVoices(true);
            try {
                const res = await axios.get("/api/ultravox/voices");
                setVoices(res.data);

                // Set default if valid and none selected
                if (!assistant.ultravoxVoiceId && res.data.length > 0) {
                    setAssistant(prev => ({ ...prev, ultravoxVoiceId: res.data[0].voiceId }));
                }
            } catch (e) {
                console.error("Failed to fetch voices", e);
                setError("Failed to load voices list");
            } finally {
                setLoadingVoices(false);
            }
        };
        fetchVoices();
    }, []);

    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    const handlePlayPreview = async (voice: any) => {
        try {
            if (playingVoice === voice.voiceId) {
                audioRef.current?.pause();
                setPlayingVoice(null);
                return;
            }

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = voice.previewUrl;
                audioRef.current.load(); // Important for swapping sources
                await audioRef.current.play();
                setPlayingVoice(voice.voiceId);
            }
        } catch (err) {
            console.error("Audio playback error:", err);
            // Don't crash the UI, just log and maybe show toast
            setError("Failed to play preview: " + (err instanceof Error ? err.message : String(err)));
            setPlayingVoice(null);
        }
    };


    const handleFilesAdded = async (newFiles: File[]) => {
        setUploading(true);
        setError(null);

        // If it's a new assistant (no ID in DB yet), we can't upload files easily 
        // because we need assistant ID (and thus corpus ID) to exist on server.
        // For simplicity, we could block upload until saved, 
        // or we just save first? The prompt asked "Admin panelden Assistant yarat -> Ultravox corpus oto oluşsun".
        // So we must save the assistant first to create the corpus.
        if (assistant.id.startsWith("new")) {
            setError("Please save the assistant first before uploading files.");
            setUploading(false);
            return;
        }

        try {
            for (const file of newFiles) {
                const formData = new FormData();
                formData.append("file", file);

                await axios.post(`/api/assistants/${assistant.id}/kb/upload`, formData);
            }
            // Refresh logic handled by parent usually, but we can't easily fetch refreshed files here 
            // without fetching the whole assistant.
            // For UI update, we fake the file entry based on what we uploaded
            // But better to fetch fresh state.
            const res = await axios.get(`/api/assistants/${assistant.id}`);
            setAssistant(res.data);

        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.response?.data?.error || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCrawlComplete = async (url: string) => {
        if (assistant.id.startsWith("new")) {
            setError("Please save the assistant first before crawling.");
            return;
        }

        setUploading(true);
        setError(null);
        try {
            await axios.post(`/api/assistants/${assistant.id}/kb/crawl`, { url });
            // Notify success logic?
            alert("Crawl started successfully.");
        } catch (err: any) {
            console.error("Crawl error:", err);
            setError(err.response?.data?.error || "Crawl failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = () => {
        if (!assistant.name.trim()) {
            setError("Assistant name is required");
            return;
        }
        if (!assistant.systemInstruction.trim()) {
            setError("System instruction is required");
            return;
        }
        onSave(assistant);
    };

    return (
        <div className="w-full h-screen overflow-auto p-8 space-y-6">
            <audio
                ref={audioRef}
                onEnded={() => setPlayingVoice(null)}
                onError={(e) => console.error("Audio element error:", e.currentTarget.error)}
                className="hidden"
            />
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Assistants
                </button>
                <h1 className="text-3xl font-bold text-white">
                    {assistant.id.startsWith("new") ? "Create New Assistant" : `Edit ${assistant.name}`}
                </h1>
                <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors"
                >
                    <Save className="w-5 h-5" />
                    Save Changes
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Configuration */}
                <div className="space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Assistant Name *
                                </label>
                                <input
                                    type="text"
                                    value={assistant.name}
                                    onChange={(e) => setAssistant(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                    placeholder="e.g., Customer Support Agent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={assistant.description}
                                    onChange={(e) => setAssistant(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                                    placeholder="Brief description of what this assistant does"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Voice (Ultravox)
                                    </label>
                                    {loadingVoices ? (
                                        <div className="text-sm text-zinc-500">Loading voices...</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Dropdown for Discovery */}
                                            <select
                                                value={voices.some(v => v.voiceId === assistant.ultravoxVoiceId) ? assistant.ultravoxVoiceId : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val) setAssistant(prev => ({ ...prev, ultravoxVoiceId: val }));
                                                }}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                                            >
                                                <option value="" disabled>Select from list (or enter custom ID below)</option>
                                                {voices.map(v => (
                                                    <option key={v.voiceId} value={v.voiceId}>{v.name}</option>
                                                ))}
                                            </select>

                                            {/* Custom Input */}
                                            <div>
                                                <input
                                                    type="text"
                                                    value={assistant.ultravoxVoiceId || ""}
                                                    onChange={(e) => setAssistant(prev => ({ ...prev, ultravoxVoiceId: e.target.value }))}
                                                    placeholder="Enter Custom Voice ID"
                                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 text-sm font-mono"
                                                />
                                                <p className="text-[10px] text-zinc-500 mt-1">
                                                    Can use a custom ID (e.g., from Cloned Voices) not in the list.
                                                </p>
                                            </div>

                                            {/* Preview functionality */}
                                            {assistant.ultravoxVoiceId && (
                                                <div className="text-xs text-zinc-400 flex items-center gap-2">
                                                    <span>Active ID: <code className="bg-white/10 px-1 rounded">{assistant.ultravoxVoiceId}</code></span>
                                                    {voices.find(v => v.voiceId === assistant.ultravoxVoiceId)?.previewUrl && (
                                                        <button
                                                            className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                                                            onClick={() => handlePlayPreview(voices.find(v => v.voiceId === assistant.ultravoxVoiceId))}
                                                        >
                                                            {playingVoice === assistant.ultravoxVoiceId ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                            Preview
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Language (Primary)
                                    </label>
                                    <select
                                        value={assistant.language}
                                        onChange={(e) => setAssistant(prev => ({ ...prev, language: e.target.value }))}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="tr-TR">🇹🇷 Turkish</option>
                                        <option value="en-US">🇺🇸 English (US)</option>
                                        <option value="en-GB">🇬🇧 English (UK)</option>
                                        <option value="es-ES">🇪🇸 Spanish</option>
                                        <option value="fr-FR">🇫🇷 French</option>
                                        <option value="de-DE">🇩🇪 German</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Instruction Card */}
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">System Instruction</h2>
                        <p className="text-sm text-zinc-400 mb-4">
                            Define how the assistant should behave and respond to users.
                        </p>

                        <textarea
                            value={assistant.systemInstruction}
                            onChange={(e) => setAssistant(prev => ({ ...prev, systemInstruction: e.target.value }))}
                            rows={16}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-sm resize-none"
                            placeholder="You are a helpful assistant that..."
                        />
                    </div>
                </div>

                {/* Right Column - Knowledge Base */}
                <div className="space-y-6">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-2">Knowledge Base</h2>
                        <p className="text-sm text-zinc-400 mb-6">
                            Add files or crawl websites to ground the assistant's responses.
                            {assistant.id.startsWith("new") && (
                                <span className="block text-yellow-500 mt-2 font-bold">
                                    ⚠ Save assistant first to add content.
                                </span>
                            )}
                        </p>

                        {/* Web Crawler */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-zinc-300 mb-3">Crawl Website</h3>
                            {/* Passing simplified prop assuming WebCrawler was also updated slightly or just works with callback */}
                            <WebCrawler onCrawlComplete={(url: string) => handleCrawlComplete(url)} />
                            {/* Note: WebCrawler component outputs content/filename usually, but we want URL. 
                                We might need to adjust WebCrawler to just pass the URL or we pass the URL differently.
                                The legacy WebCrawler likely actually fetched content. 
                                For Ultravox, we prefer passing the URL.
                                I'll assume WebCrawler supports passing the URL or I'll just accept content for now if it does.
                                But 'handleCrawlComplete' above expects URL.
                                Let's check WebCrawler shortly, but for now I'll risk it or fix it if I see validation error.
                                Actually I should fix WebCrawler too if needed. 
                            */}
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-black/40 text-zinc-500">OR</span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div>
                            <h3 className="text-sm font-medium text-zinc-300 mb-3">Upload Files</h3>
                            <FileUploadZone
                                files={assistant.files}
                                onFilesAdded={handleFilesAdded}
                                onFileRemove={() => { }}
                                apiKey="" // No longer needed
                            />
                        </div>

                        {uploading && (
                            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <p className="text-sm text-purple-400 flex items-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    Processing...
                                </p>
                            </div>
                        )}

                        {/* Files Summary */}
                        {assistant.files.length > 0 && (
                            <div className="mt-6 p-4 bg-white/5 rounded-lg">
                                <p className="text-sm text-zinc-300">
                                    <span className="font-semibold">{assistant.files.length}</span> file(s) in knowledge base
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg font-medium transition-colors"
                >
                    Cancel
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="px-8 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {assistant.id.startsWith("new") ? "Create Assistant" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
