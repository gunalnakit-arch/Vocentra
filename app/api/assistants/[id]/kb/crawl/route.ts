import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { url } = body;

        const assistant = await db.getAssistant(id);

        if (!assistant) {
            return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
        }

        const corpusId = assistant.voiceConfig?.corpusId;
        if (!corpusId) {
            return NextResponse.json({ error: "Assistant has no Corpus ID" }, { status: 400 });
        }

        // Trigger crawl in Ultravox
        // By default 1 depth for single page, could be enhanced
        await ultravoxService.addWebsiteSource(corpusId, url, 1);

        return NextResponse.json({ success: true, message: "Crawl started" });

    } catch (error) {
        console.error("Error starting crawl:", error);
        return NextResponse.json({ error: "Failed to start crawl" }, { status: 500 });
    }
}
