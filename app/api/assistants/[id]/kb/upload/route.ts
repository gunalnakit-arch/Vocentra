import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";
import mammoth from "mammoth";

export const dynamic = 'force-dynamic';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const assistant = await db.getAssistant(id);
        if (!assistant) {
            return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
        }

        // Extract text
        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type.includes("word") || file.name.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (file.type.includes("text") || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
            text = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type. Please upload .docx, .txt, or .md" }, { status: 400 });
        }

        if (!text.trim()) {
            return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
        }

        // Upload to Ultravox
        const corpusId = assistant.voiceConfig?.corpusId;
        if (!corpusId) {
            return NextResponse.json({ error: "Assistant has no Corpus ID" }, { status: 400 });
        }

        await ultravoxService.addTextSource(corpusId, text, file.name);

        const fileMeta = {
            id: Date.now().toString(),
            name: file.name,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };

        assistant.files.push(fileMeta);
        await db.saveAssistant(assistant);

        return NextResponse.json({ success: true, file: fileMeta });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
