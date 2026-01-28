import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { anamService } from "@/lib/anam";

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
        const personaId = body.personaId || assistant.providerAssistantId;

        if (!personaId) {
            return NextResponse.json({ error: "Bu asistan için geçerli bir Sağlayıcı Kimliği (Persona ID) bulunamadı." }, { status: 400 });
        }

        const sessionToken = await anamService.createSessionToken(personaId);

        return NextResponse.json({ sessionToken });

    } catch (error: any) {
        console.error("Error creating Anam session token:", error);
        return NextResponse.json({
            error: "Anam oturum anahtarı oluşturulamadı. Lütfen asistanın Anam.ai üzerinde aktif olduğundan emin olun.",
            details: error.response?.data
        }, { status: 500 });
    }
}
