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
    provider: "voice" | "avatar";
    providerAssistantId?: string; // ID on the external provider's system (Ultravox Agent ID or Anam Persona ID)
    files: AssistantFile[];
    // Generic configuration storage for all API parameters
    voiceConfig?: {
        voiceId?: string;
        corpusId?: string;
        toolId?: string;
        medium?: string;
        initialOutputMedium?: string;
        joinTimeout?: string;
        maxDuration?: string;
        recordingEnabled?: boolean;
        firstSpeaker?: "user" | "agent";
        vadSettings?: {
            turnEndpointDelay?: string;
            minimumTurnDuration?: string;
        };
    };
    avatarConfig?: {
        avatarId?: string;
        voiceId?: string;
        personalityPrompt?: string;
        llmModel?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Call {
    id: string; // The external call/session ID (Ultravox callId or Anam sessionId)
    assistantId: string;
    provider: "voice" | "avatar";
    createdAt: Date;
    duration?: number;
    cost?: number;
    summary?: string;
    shortSummary?: string;
    transcript?: any[];
    analytics?: any;
    metadata?: {
        // Ultravox specific
        agentName?: string;
        agentId?: string;
        // Anam specific
        personaName?: string;
        personaId?: string;
        apiKeyLabel?: string;
        location?: string;
        exitStatus?: string;
        endedAt?: Date;
    };
}
