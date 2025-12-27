import fs from 'fs';
import path from 'path';
import { Assistant } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

interface Database {
    assistants: Assistant[];
}

function readDb(): Database {
    if (!fs.existsSync(DB_PATH)) {
        return { assistants: [] };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    try {
        const parsed = JSON.parse(data);
        return {
            ...parsed,
            assistants: parsed.assistants.map((a: any) => ({
                ...a,
                createdAt: new Date(a.createdAt),
                updatedAt: new Date(a.updatedAt),
                files: a.files?.map((f: any) => ({
                    ...f,
                    uploadedAt: new Date(f.uploadedAt)
                })) || []
            }))
        };
    } catch {
        return { assistants: [] };
    }
}

function writeDb(data: Database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const db = {
    getAssistants: (): Assistant[] => {
        return readDb().assistants;
    },

    getAssistant: (id: string): Assistant | null => {
        const assistants = readDb().assistants;
        return assistants.find(a => a.id === id) || null;
    },

    saveAssistant: (assistant: Assistant): void => {
        const data = readDb();
        const index = data.assistants.findIndex(a => a.id === assistant.id);

        const now = new Date();
        const toSave = { ...assistant, updatedAt: now };

        if (index >= 0) {
            data.assistants[index] = toSave;
        } else {
            toSave.createdAt = now;
            data.assistants.push(toSave);
        }
        writeDb(data);
    },

    deleteAssistant: (id: string): void => {
        const data = readDb();
        data.assistants = data.assistants.filter(a => a.id !== id);
        writeDb(data);
    }
};
