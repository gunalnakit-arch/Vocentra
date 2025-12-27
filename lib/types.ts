export interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
    timestamp: Date;
}

export interface ConversationStats {
    durationSeconds: number;
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
    summary: string;
}

export interface AssistantFile {
    id: string;
    name: string;
    mimeType: string;
    size: number;
    geminiFileUri?: string; // URI from Gemini File API
    uploadedAt: Date;
}

export interface Assistant {
    id: string;
    tenantId?: string;
    name: string;
    description: string;
    systemInstruction: string;
    voice: string;
    language: string;
    files: AssistantFile[];
    ultravoxCorpusId?: string;
    ultravoxToolId?: string;
    ultravoxVoiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}
