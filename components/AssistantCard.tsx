"use client";
import React from "react";
import { Assistant } from "@/lib/types";
import { FileText, Mic, Trash2, Edit, Play, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import TiltedCard from "./TiltedCard";

interface AssistantCardProps {
    assistant: Assistant;
    onEdit: (assistant: Assistant) => void;
    onTest: (assistant: Assistant) => void;
    onDelete: (assistant: Assistant) => void;
    isSelected?: boolean;
}

export function AssistantCard({
    assistant,
    onEdit,
    onTest,
    onDelete,
    isSelected = false
}: AssistantCardProps) {
    return (
        <TiltedCard
            containerHeight="auto"
            containerWidth="100%"
            scaleOnHover={1.03}
            rotateAmplitude={6}
        >
            <div className={`bg-black/40 backdrop-blur-md border ${isSelected ? 'border-purple-500' : 'border-white/10'} rounded-xl p-6 shadow-xl h-full flex flex-col`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            {assistant.provider === "voice" ? (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-purple-500/20">
                                    <Mic className="w-3 h-3" /> Sesli
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/20">
                                    <User className="w-3 h-3" /> Avatar
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            {assistant.name}
                        </h3>
                        <p className="text-zinc-400 text-sm line-clamp-2">
                            {assistant.description}
                        </p>
                    </div>
                    {isSelected && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                            Aktif
                        </span>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-1 mb-4">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5 w-fit">
                        ID: {assistant.providerAssistantId}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onTest(assistant)}
                            className="flex-1 py-3 px-4 bg-white text-black hover:bg-zinc-200 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                        >
                            <Play className="w-4 h-4 fill-black" />
                            Test Et
                        </button>
                        <Link
                            href={`/assistants/${assistant.id}/dashboard`}
                            className="flex-1 py-3 px-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(assistant)}
                            className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Edit className="w-4 h-4" />
                            Düzenle
                        </button>
                        {assistant.id !== "default" && (
                            <button
                                onClick={() => onDelete(assistant)}
                                className="py-2.5 px-4 bg-red-600/10 hover:bg-red-600/20 border border-red-500/10 text-red-500 rounded-xl text-sm font-medium transition-colors active:scale-95"
                                title="Sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </TiltedCard>
    );
}
