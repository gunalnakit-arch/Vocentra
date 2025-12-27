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

    // Calls
    async createCall(config: any) {
        try {
            const response = await client.post('/calls', config);
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
    }

};
