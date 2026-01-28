import axios from 'axios';

const ULTRAVOX_API_KEY = process.env.ULTRAVOX_API_KEY;
const BASE_URL = 'https://api.ultravox.ai/api';

if (!ULTRAVOX_API_KEY) {
    console.warn('ULTRAVOX_API_KEY is not set');
}

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'X-API-Key': ULTRAVOX_API_KEY,
        'Content-Type': 'application/json',
    },
});

export interface UltravoxVoice {
    voiceId: string;
    name: string;
    description?: string;
    previewUrl?: string;
}

export const ultravoxService = {
    // Corpora
    async createCorpus(name: string, description?: string): Promise<string> {
        const response = await client.post('/corpora', { name, description });
        return response.data.corpusId;
    },

    async getCorpus(corpusId: string) {
        const response = await client.get(`/corpora/${corpusId}`);
        return response.data;
    },

    // Sources
    async addWebsiteSource(corpusId: string, url: string, maxDepth: number = 1): Promise<void> {
        try {
            await client.post(`/corpora/${corpusId}/sources`, {
                url: url,
                maxDepth: maxDepth
            });
        } catch (error: any) {
            console.error('Ultravox Add Website Source Error:', error.response?.data);
            throw error;
        }
    },

    async addTextSource(corpusId: string, content: string, title?: string): Promise<void> {
        try {
            await client.post(`/corpora/${corpusId}/sources`, {
                text: content,
                name: title || 'Uploaded Document'
            });
        } catch (error: any) {
            console.error('Ultravox Add Text Source Error:', error.response?.data);
            throw error;
        }
    },

    async listSources(corpusId: string) {
        const response = await client.get(`/corpora/${corpusId}/sources`);
        return response.data.results;
    },

    // Voices
    async listVoices(): Promise<UltravoxVoice[]> {
        const response = await client.get('/voices');
        return response.data.results.map((v: any) => ({
            voiceId: v.voiceId,
            name: v.name,
            description: v.description,
            previewUrl: v.previewUrl
        }));
    },

    // Agents
    async createAgent(config: any) {
        try {
            const response = await client.post('/agents', config);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Create Agent Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async updateAgent(agentId: string, config: any) {
        try {
            const response = await client.patch(`/agents/${agentId}`, config);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Update Agent Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async deleteAgent(agentId: string) {
        try {
            await client.delete(`/agents/${agentId}`);
        } catch (error: any) {
            console.error('Ultravox Delete Agent Error:', error.response?.data || error.message);
            throw error;
        }
    },

    async listAgents() {
        try {
            const response = await client.get('/agents');
            return response.data;
        } catch (error: any) {
            console.error('Ultravox List Agents Error:', error.response?.data || error.message);
            throw error;
        }
    },

    // Calls (Session starting)
    async createCall(config: any) {
        try {
            const response = await client.post('/calls', config);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox API Error:', error.response?.data);
            throw error;
        }
    },

    async createCallWithAgent(agentId: string, config?: any) {
        try {
            const response = await client.post(`/agents/${agentId}/calls`, config || {});
            return response.data;
        } catch (error: any) {
            console.error('Ultravox API Error:', error.response?.data);
            throw error;
        }
    },

    // Tools
    async registerCorpusTool(corpusId: string, name: string) {
        try {
            const response = await client.post('/tools', {
                name: name,
                definition: {
                    corpusId: corpusId
                }
            });
            return response.data.toolId;
        } catch (error: any) {
            console.error('Ultravox Tool Registration Error:', error.response?.data);
            throw error;
        }
    },

    // Call Analytics
    async getCallDetails(callId: string) {
        try {
            const response = await client.get(`/calls/${callId}`);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Get Call Details Error:', error.response?.data);
            throw error;
        }
    },

    async getCallMessages(callId: string, mode: string = 'in_call', pageSize: number = 200) {
        try {
            const response = await client.get(`/calls/${callId}/messages`, {
                params: { mode, pageSize }
            });
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Get Call Messages Error:', error.response?.data);
            throw error;
        }
    },

    async listCalls(agentId?: string, pageSize: number = 50) {
        try {
            const params: any = { pageSize };
            if (agentId) params.agentId = agentId;
            const response = await client.get('/calls', { params });
            return response.data;
        } catch (error: any) {
            console.error('Ultravox List Calls Error:', error.response?.data);
            throw error;
        }
    },

    async getCallEvents(callId: string) {
        try {
            const response = await client.get(`/calls/${callId}/events`);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Get Call Events Error:', error.response?.data);
            throw error;
        }
    },

    async getCallRecording(callId: string) {
        try {
            const response = await client.get(`/calls/${callId}/recording`);
            return response.data;
        } catch (error: any) {
            console.error('Ultravox Get Call Recording Error:', error.response?.data);
            throw error;
        }
    }
};
