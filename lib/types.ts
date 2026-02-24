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

export interface CallAnalytics {
    outcome: string;
    sentimentScore: number;
    qualityScore: number;
    professionalismScore: number;
    empathyScore: number;
    solutionAccuracyScore: number;
    riskFlags: string[];
    complianceFlags: string[];
    classification: {
        intent: string;
        topic: string;
    };
    emotionalTrend: number[];
    insights: string[];
    actionItems: string[];
    expertAssessment: string;
    kpis: {
        avgResponseTime?: string;
        silenceRatio?: string;
        interruptionCount?: number;
    };
}

export interface Call {
    id: string;
    assistantId: string;
    provider: "voice" | "avatar";
    createdAt: Date;
    duration?: number;
    cost?: number;
    summary?: string;
    shortSummary?: string;
    transcript?: any[];
    analytics?: CallAnalytics;
    metadata?: {
        agentName?: string;
        agentId?: string;
        personaName?: string;
        personaId?: string;
        apiKeyLabel?: string;
        location?: string;
        exitStatus?: string;
        endedAt?: Date;
    };
}

export interface Appointment {
    id: string;
    customerName: string;
    phone: string;
    startTime: Date;
    endTime: Date;
    durationMin: number;
    status: "confirmed" | "cancelled";
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
