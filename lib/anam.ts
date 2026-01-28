import axios from 'axios';

const ANAM_API_KEY = process.env.ANAM_API_KEY;
const BASE_URL = 'https://api.anam.ai/v1';

if (!ANAM_API_KEY) {
    console.warn('ANAM_API_KEY is not set');
}

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${ANAM_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

export interface AnamPersona {
    id: string;
    name: string;
    description?: string;
    avatarId: string;
    avatarModel?: string;
    voiceId: string;
    llmId: string;
    systemPrompt: string;
    skipGreeting?: boolean;
}

export const anamService = {
    // Personas
    async createPersona(config: Partial<AnamPersona>): Promise<string> {
        try {
            const response = await client.post('/personas', config);
            return response.data.id;
        } catch (error: any) {
            console.error('Anam Create Persona Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async updatePersona(id: string, config: Partial<AnamPersona>): Promise<void> {
        try {
            await client.put(`/personas/${id}`, config);
        } catch (error: any) {
            console.error('Anam Update Persona Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async deletePersona(id: string): Promise<void> {
        try {
            await client.delete(`/personas/${id}`);
        } catch (error: any) {
            console.error('Anam Delete Persona Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async getPersona(id: string): Promise<any> {
        try {
            const response = await client.get(`/personas/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Anam Get Persona Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async listPersonas(): Promise<any[]> {
        try {
            const response = await client.get('/personas');
            return response.data;
        } catch (error: any) {
            console.error('Anam List Personas Error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Sessions
    async createSessionToken(personaId: string): Promise<string> {
        try {
            const response = await client.post('/auth/session-token', {
                personaConfig: {
                    personaId: personaId
                }
            });
            return response.data.sessionToken;
        } catch (error: any) {
            console.error('Anam Create Session Token Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async listSessions(params: { personaId?: string; page?: number; perPage?: number } = {}): Promise<any> {
        try {
            const response = await client.get('/sessions', { params });
            return response.data;
        } catch (error: any) {
            console.error('Anam List Sessions Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async getTranscript(sessionId: string): Promise<any> {
        try {
            const response = await client.get(`/sessions/${sessionId}/transcript`);
            return response.data;
        } catch (error: any) {
            console.error('Anam Get Transcript Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async getRecordingUrl(sessionId: string): Promise<string> {
        try {
            const response = await client.get(`/sessions/${sessionId}/recording`);
            return response.data.recordingUrl;
        } catch (error: any) {
            // Anam might return 404 if recording not yet ready or enabled
            console.error('Anam Get Recording URL Error:', error.response?.data || error.message);
            throw error;
        }
    }
};
