import { Assistant } from "./types";

const STORAGE_KEY = "vocentra_assistants";
const SELECTED_ASSISTANT_KEY = "vocentra_selected_assistant";

// Default assistant based on current configuration
export const DEFAULT_ASSISTANT: Assistant = {
    id: "default",
    name: "Vocentra AI",
    description: "Türkçe konuşan doğal ve insani müşteri hizmetleri asistanı",
    systemInstruction: `Sen çok doğal ve insani bir Türkçe konuşan müşteri hizmetleri asistanısın. 

KİŞİLİK ÖZELLİKLERİN:
- Samimi, sıcak ve dostane bir tavırla konuş
- Konuşurken doğal ses tonlamaları kullan (gülme, hafif öksürme, "hmmm", "şey" gibi)
- Komik bir şey duyduğunda gül veya hafifçe kahkaha at
- Düşünürken "hmmm", "şey", "yani" gibi doğal ara sözler kullan
- Empati göster ve duygusal tepkiler ver
- Bazen cümleleri tamamlamadan yeniden başla (gerçek insanlar gibi)

KONUŞMA TARZI:
- Resmi değil, arkadaşça ama profesyonel
- Kısa ve net cümleler kullan
- Kullanıcının duygularına uygun tepki ver
- Şakaları anla ve gül
- Gerektiğinde "vay be!", "harika!", "anladım anladım" gibi doğal tepkiler ver

Her zaman TÜRKÇE konuş ve gerçek bir insan gibi davran!`,
    voice: "Aoede",
    language: "tr-TR",
    files: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

/**
 * Get all assistants from localStorage
 */
export function getAssistants(): Assistant[] {
    if (typeof window === "undefined") return [DEFAULT_ASSISTANT];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Initialize with default assistant
            const assistants = [DEFAULT_ASSISTANT];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(assistants));
            return assistants;
        }

        const assistants = JSON.parse(stored);
        // Parse dates
        return assistants.map((a: any) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            updatedAt: new Date(a.updatedAt),
            files: a.files.map((f: any) => ({
                ...f,
                uploadedAt: new Date(f.uploadedAt)
            }))
        }));
    } catch (error) {
        console.error("Error loading assistants:", error);
        return [DEFAULT_ASSISTANT];
    }
}

/**
 * Get a single assistant by ID
 */
export function getAssistant(id: string): Assistant | null {
    const assistants = getAssistants();
    return assistants.find(a => a.id === id) || null;
}

/**
 * Save an assistant (create or update)
 */
export function saveAssistant(assistant: Assistant): void {
    if (typeof window === "undefined") return;

    try {
        const assistants = getAssistants();
        const index = assistants.findIndex(a => a.id === assistant.id);

        assistant.updatedAt = new Date();

        if (index >= 0) {
            // Update existing
            assistants[index] = assistant;
        } else {
            // Create new
            assistant.createdAt = new Date();
            assistants.push(assistant);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(assistants));
    } catch (error) {
        console.error("Error saving assistant:", error);
        throw error;
    }
}

/**
 * Delete an assistant by ID
 */
export function deleteAssistant(id: string): void {
    if (typeof window === "undefined") return;

    // Don't allow deleting the default assistant
    if (id === "default") {
        throw new Error("Cannot delete default assistant");
    }

    try {
        const assistants = getAssistants();
        const filtered = assistants.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        // If deleted assistant was selected, switch to default
        const selectedId = getSelectedAssistantId();
        if (selectedId === id) {
            setSelectedAssistantId("default");
        }
    } catch (error) {
        console.error("Error deleting assistant:", error);
        throw error;
    }
}

/**
 * Get the currently selected assistant ID
 */
export function getSelectedAssistantId(): string {
    if (typeof window === "undefined") return "default";

    try {
        return localStorage.getItem(SELECTED_ASSISTANT_KEY) || "default";
    } catch {
        return "default";
    }
}

/**
 * Set the currently selected assistant ID
 */
export function setSelectedAssistantId(id: string): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(SELECTED_ASSISTANT_KEY, id);
    } catch (error) {
        console.error("Error setting selected assistant:", error);
    }
}

/**
 * Get the currently selected assistant
 */
export function getSelectedAssistant(): Assistant {
    const id = getSelectedAssistantId();
    return getAssistant(id) || DEFAULT_ASSISTANT;
}
