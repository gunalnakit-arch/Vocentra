import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const assistant = db.getAssistant(id);

        if (!assistant) {
            return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
        }

        if (!assistant.ultravoxVoiceId) {
            return NextResponse.json({ error: "Assistant has no Ultravox Voice selected" }, { status: 400 });
        }

        // Create Ultravox WebRTC call
        const callConfig: any = {
            systemPrompt: assistant.systemInstruction,
            model: "fixie-ai/ultravox",
            voice: assistant.ultravoxVoiceId.trim(),
            temperature: 0.7,
            medium: {
                webRtc: {}
            }
        };

        // Add selected tools if tool exists
        if (assistant.ultravoxToolId) {
            callConfig.selectedTools = [{
                toolId: assistant.ultravoxToolId
            }];
        }

        const call = await ultravoxService.createCall(callConfig);

        // Return the joinUrl for the frontend to connect
        return NextResponse.json({
            joinUrl: call.joinUrl,
            callId: call.callId
        });

    } catch (error: any) {
        console.error("Error starting test session:", error);
        return NextResponse.json({
            error: error.message || "Failed to start test session",
            details: error.response?.data
        }, { status: 500 });
    }
}
