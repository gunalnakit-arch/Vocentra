import { NextRequest, NextResponse } from "next/server";
import { ultravoxService } from "@/lib/ultravox";
import { anamService } from "@/lib/anam";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        const { callId } = await params;
        const call = await db.getCall(callId);

        if (!call) {
            return NextResponse.json({ error: "Call not found" }, { status: 404 });
        }

        if (call.provider === "voice") {
            const data = await ultravoxService.getCallMessages(callId);
            return NextResponse.json(data);
        } else {
            const data = await anamService.getTranscript(callId);
            return NextResponse.json(data); // Anam returns { messages: [...] }
        }
    } catch (error: any) {
        console.error("Error fetching call messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}
