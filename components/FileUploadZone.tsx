"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Eye, Loader2 } from "lucide-react";
import { AssistantFile } from "@/lib/types";

interface FileUploadZoneProps {
    files: AssistantFile[];
    onFilesAdded: (files: File[]) => void;
    onFileRemove: (fileId: string) => void;
    maxFiles?: number;
    apiKey: string;
}

export function FileUploadZone({
    files,
    onFilesAdded,
    onFileRemove,
    maxFiles = 10,
    apiKey
}: FileUploadZoneProps) {
    const [previewFile, setPreviewFile] = useState<AssistantFile | null>(null);
    const [previewContent, setPreviewContent] = useState<string>("");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFilesAdded(acceptedFiles);
    }, [onFilesAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: maxFiles - files.length,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'application/json': ['.json'],
            'text/csv': ['.csv'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handlePreview = async (file: AssistantFile) => {
        if (!file.geminiFileUri) {
            setPreviewError("No file URI available");
            return;
        }

        setPreviewFile(file);
        setLoadingPreview(true);
        setPreviewError(null);

        try {
            // Extract file name from URI (format: files/{name})
            const fileName = file.geminiFileUri.split('/').pop();

            // Fetch file metadata from Gemini
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch file from Gemini');
            }

            const fileData = await response.json();

            // For text-based files, show a preview message
            // Note: Gemini File API doesn't provide direct content download
            // We'll show metadata instead
            const content = `# File Information

**Name:** ${file.name}
**Type:** ${file.mimeType}
**Size:** ${formatFileSize(file.size)}
**Uploaded:** ${new Date(file.uploadedAt).toLocaleString()}
**Gemini URI:** ${file.geminiFileUri}

**Status:** ${fileData.state || 'Active'}

---

*Note: This file is stored in Gemini's File API and is being used to ground the assistant's responses. The actual content is not directly accessible for preview, but the assistant can read and use it during conversations.*

**File Metadata:**
\`\`\`json
${JSON.stringify(fileData, null, 2)}
\`\`\`
`;

            setPreviewContent(content);
        } catch (error) {
            console.error('Preview error:', error);
            setPreviewError(error instanceof Error ? error.message : 'Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    };

    const closePreview = () => {
        setPreviewFile(null);
        setPreviewContent("");
        setPreviewError(null);
    };

    return (
        <>
            <div className="space-y-4">
                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                        }`}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                    <p className="text-white font-medium mb-1">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </p>
                    <p className="text-zinc-400 text-sm">
                        or click to browse (PDF, TXT, MD, JSON, CSV, DOC, DOCX)
                    </p>
                    <p className="text-zinc-500 text-xs mt-2">
                        Max 10MB per file • {files.length}/{maxFiles} files
                    </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-300">Uploaded Files</h4>
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white truncate">{file.name}</p>
                                        <p className="text-xs text-zinc-500">
                                            {formatFileSize(file.size)} • {file.mimeType.split('/')[1]}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handlePreview(file)}
                                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 transition-colors flex-shrink-0"
                                        title="Preview file"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onFileRemove(file.id)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors flex-shrink-0"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-400" />
                                    File Preview
                                </h3>
                                <p className="text-sm text-zinc-400 mt-1">{previewFile.name}</p>
                            </div>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-auto p-6">
                            {loadingPreview ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                </div>
                            ) : previewError ? (
                                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                                    {previewError}
                                </div>
                            ) : (
                                <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-black/40 p-4 rounded-lg border border-white/10">
                                    {previewContent}
                                </pre>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end p-4 border-t border-white/10">
                            <button
                                onClick={closePreview}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
