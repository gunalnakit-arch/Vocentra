import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";
import { anamService } from "@/lib/anam";
import { Assistant } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const assistants = await db.getAssistants();
    return NextResponse.json(assistants);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            name, description, systemInstruction, language, provider,
            providerAssistantId, tenantId
        } = body;

        const newAssistant: Assistant = {
            id: uuidv4(),
            tenantId: tenantId || "default-tenant",
            name,
            description,
            systemInstruction,
            voice: "", // Provider-side voice is now tied to the selected agent/persona
            language: language || "tr-TR",
            provider,
            providerAssistantId,
            files: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.saveAssistant(newAssistant);

        return NextResponse.json(newAssistant);
    } catch (error) {
        console.error("Error creating assistant:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
