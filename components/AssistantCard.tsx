"use client";
import React from "react";
import { Assistant } from "@/lib/types";
import { FileText, Mic, Trash2, Edit, Play } from "lucide-react";
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
                        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-purple-400" />
                            {assistant.name}
                        </h3>
                        <p className="text-zinc-400 text-sm line-clamp-2">
                            {assistant.description}
                        </p>
                    </div>
                    {isSelected && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                            Active
                        </span>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                    <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {assistant.files.length} files
                    </span>
                    <span>{assistant.voice}</span>
                    <span>{assistant.language}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onTest(assistant)}
                        className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Play className="w-4 h-4" />
                        Test
                    </button>
                    <button
                        onClick={() => onEdit(assistant)}
                        className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit
                    </button>
                    {assistant.id !== "default" && (
                        <button
                            onClick={() => onDelete(assistant)}
                            className="py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </TiltedCard>
    );
}
