"use client";
import React, { useState } from "react";
import { Globe, Loader2, CheckCircle, XCircle, Eye, X } from "lucide-react";

interface WebCrawlerProps {
    onCrawlComplete: (url: string) => void;
}

export function WebCrawler({ onCrawlComplete }: WebCrawlerProps) {
    const [url, setUrl] = useState("");
    const [crawling, setCrawling] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewFilename, setPreviewFilename] = useState<string>("");

    const handlePreview = async () => {
        if (!url.trim()) {
            setError("Please enter a URL");
            return;
        }

        setCrawling(true);
        setError(null);
        setStatus("Fetching preview...");

        try {
            const response = await fetch("/api/preview-scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch preview");
            }

            const data = await response.json();

            setStatus("Preview loaded");
            setPreviewContent(data.content);
            setPreviewFilename(new URL(url).hostname);

        } catch (err) {
            console.error("Preview error:", err);
            setError(err instanceof Error ? err.message : "Preview failed");
        } finally {
            setCrawling(false);
        }
    };

    const handleConfirmUpload = () => {
        onCrawlComplete(url);
        setPreviewContent(null);
        setPreviewFilename("");
        setUrl("");
        setStatus("Added to queue");
    };

    const handleCancelPreview = () => {
        setPreviewContent(null);
        setPreviewFilename("");
    };

    return (
        <>
            <div className="space-y-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold">Web Crawler</h3>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Website URL</label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                            disabled={crawling}
                        />
                    </div>

                    {status && !error && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            {status}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-400">
                            <XCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePreview}
                        disabled={crawling || !url.trim()}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {crawling ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Globe className="w-4 h-4" />
                                Preview & Add
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {previewContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                    Preview Content
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">{previewFilename}</p>
                            </div>
                            <button onClick={handleCancelPreview}>
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-lg border border-white/10">
                                {previewContent}
                            </pre>
                        </div>

                        <div className="flex gap-3 p-4 border-t border-white/10">
                            <button
                                onClick={handleCancelPreview}
                                className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmUpload}
                                className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Add to Knowledge Base
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
