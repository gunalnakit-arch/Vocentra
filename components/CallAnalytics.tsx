"use client";
import React from "react";
import { X, DollarSign, Clock, MessageSquare, FileText } from "lucide-react";

interface CallAnalyticsProps {
    callData: any;
    onClose: () => void;
}

export const CallAnalytics: React.FC<CallAnalyticsProps> = ({ callData, onClose }) => {
    if (!callData) return null;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(4)}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Call Analytics</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-zinc-400">Duration</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {formatDuration(callData.durationSeconds || 0)}
                            </p>
                        </div>

                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                <span className="text-sm text-zinc-400">Cost</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {formatCost(callData.cost || 0)}
                            </p>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-zinc-400">Messages</span>
                            </div>
                            <p className="text-2xl font-bold text-white">
                                {callData.transcript?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    {callData.summary && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-bold text-white">Summary</h3>
                            </div>
                            <p className="text-zinc-300 leading-relaxed">{callData.summary}</p>
                        </div>
                    )}

                    {/* Transcript */}
                    {callData.transcript && callData.transcript.length > 0 && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Full Transcript</h3>
                            <div className="space-y-4">
                                {callData.transcript.map((message: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/10 text-zinc-100'
                                                }`}
                                        >
                                            <p className="text-sm font-medium mb-1 opacity-70">
                                                {message.role === 'user' ? 'You' : 'Assistant'}
                                            </p>
                                            <p className="leading-relaxed">{message.text}</p>
                                            {message.timestamp && (
                                                <p className="text-xs opacity-50 mt-2">
                                                    {new Date(message.timestamp).toLocaleTimeString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Details */}
                    {callData.model && (
                        <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-zinc-400">Model:</span>
                                    <span className="ml-2 text-white font-medium">{callData.model}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Voice:</span>
                                    <span className="ml-2 text-white font-medium">{callData.voice || 'Default'}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Call ID:</span>
                                    <span className="ml-2 text-white font-mono text-xs">{callData.callId}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-400">Status:</span>
                                    <span className="ml-2 text-green-400 font-medium">{callData.status || 'Completed'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
