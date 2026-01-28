import { supabase } from './supabase';
import { Assistant, Call } from './types';

export const db = {
    // Assistants
    getAssistants: async (): Promise<Assistant[]> => {
        const { data, error } = await supabase
            .from('assistants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapAssistant);
    },

    getAssistant: async (id: string): Promise<Assistant | null> => {
        const { data, error } = await supabase
            .from('assistants')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapAssistant(data) : null;
    },

    saveAssistant: async (assistant: Assistant): Promise<void> => {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('assistants')
            .upsert({
                id: assistant.id,
                tenant_id: assistant.tenantId || 'default-tenant',
                name: assistant.name,
                description: assistant.description,
                system_instruction: assistant.systemInstruction,
                voice: assistant.voice,
                language: assistant.language,
                provider: assistant.provider,
                provider_assistant_id: assistant.providerAssistantId,
                files: assistant.files || [],
                voice_config: assistant.voiceConfig || {},
                avatar_config: assistant.avatarConfig || {},
                created_at: assistant.createdAt || now,
                updated_at: now
            });

        if (error) throw error;
    },

    deleteAssistant: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('assistants')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Calls
    getCalls: async (assistantId?: string): Promise<Call[]> => {
        let query = supabase.from('calls').select('*');

        if (assistantId) {
            query = query.eq('assistant_id', assistantId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapCall);
    },

    getCall: async (id: string): Promise<Call | null> => {
        const { data, error } = await supabase
            .from('calls')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? mapCall(data) : null;
    },

    saveCall: async (call: Call): Promise<void> => {
        const { error } = await supabase
            .from('calls')
            .upsert({
                id: call.id,
                assistant_id: call.assistantId,
                provider: call.provider,
                created_at: call.createdAt,
                duration: call.duration,
                cost: call.cost,
                summary: call.summary,
                short_summary: call.shortSummary,
                transcript: call.transcript || [],
                analytics: call.analytics || {},
                metadata: call.metadata || {}
            });

        if (error) throw error;
    }
};

// Mappers to handle snake_case to camelCase and Date objects
function mapAssistant(data: any): Assistant {
    return {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        description: data.description,
        systemInstruction: data.system_instruction,
        voice: data.voice,
        language: data.language,
        provider: data.provider,
        providerAssistantId: data.provider_assistant_id,
        files: data.files,
        voiceConfig: data.voice_config,
        avatarConfig: data.avatar_config,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
    };
}

function mapCall(data: any): Call {
    return {
        id: data.id,
        assistantId: data.assistant_id,
        provider: data.provider,
        createdAt: new Date(data.created_at),
        duration: data.duration,
        cost: data.cost,
        summary: data.summary,
        shortSummary: data.short_summary,
        transcript: data.transcript,
        analytics: data.analytics,
        metadata: data.metadata ? {
            ...data.metadata,
            endedAt: data.metadata.endedAt ? new Date(data.metadata.endedAt) : undefined
        } : undefined
    };
}
