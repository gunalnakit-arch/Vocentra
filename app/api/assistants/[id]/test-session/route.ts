import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const assistant = await db.getAssistant(id);

        if (!assistant) {
            return NextResponse.json({ error: "Asistan bulunamadı" }, { status: 404 });
        }

        const body = await req.json().catch(() => ({}));
        const agentId = body.agentId || assistant.providerAssistantId;

        if (!agentId) {
            return NextResponse.json({ error: "Bu asistan için geçerli bir Sağlayıcı Kimliği (Agent ID) bulunamadı." }, { status: 400 });
        }

        // Use the agent-specific endpoint
        const call = await ultravoxService.createCallWithAgent(agentId);

        return NextResponse.json({
            joinUrl: call.joinUrl,
            callId: call.callId
        });

    } catch (error: any) {
        console.error("Error starting test session:", error);
        return NextResponse.json({
            error: "Görüşme başlatılamadı. Lütfen asistanın Ultravox üzerinde aktif olduğundan emin olun.",
            details: error.response?.data
        }, { status: 500 });
    }
}
