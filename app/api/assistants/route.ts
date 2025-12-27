import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";
import { Assistant } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const assistants = db.getAssistants();
    return NextResponse.json(assistants);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, description, systemInstruction, voice, language, ultravoxVoiceId, tenantId } = body;

        // 1. Create Corpus in Ultravox
        let corpusId;
        let toolId;
        try {
            corpusId = await ultravoxService.createCorpus(name, description || "Assistant Knowledge Base");

            // 2. Register corpus as tool
            toolId = await ultravoxService.registerCorpusTool(corpusId, `${name} Knowledge Base`);
        } catch (e) {
            console.error("Ultravox Corpus/Tool creation failed:", e);
            return NextResponse.json({ error: "Failed to create Ultravox Corpus" }, { status: 500 });
        }

        const newAssistant: Assistant = {
            id: uuidv4(),
            tenantId: tenantId || "default-tenant",
            name,
            description,
            systemInstruction,
            voice, // This might be legacy voice name, kept for compatibility if needed
            language,
            files: [], // Files will be added via KB uploads
            ultravoxCorpusId: corpusId,
            ultravoxToolId: toolId,
            ultravoxVoiceId: ultravoxVoiceId, // Critical: selected Ultravox voice
            createdAt: new Date(),
            updatedAt: new Date()
        };

        db.saveAssistant(newAssistant);

        return NextResponse.json(newAssistant);
    } catch (error) {
        console.error("Error creating assistant:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
