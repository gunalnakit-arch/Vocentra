import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Call } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { callId, assistantId, provider } = body;

        if (!callId || !assistantId || !provider) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newCall: Call = {
            id: callId,
            assistantId,
            provider,
            createdAt: new Date(),
        };

        await db.saveCall(newCall);

        return NextResponse.json({ success: true, call: newCall });
    } catch (error: any) {
        console.error("Error saving call:", error);
        return NextResponse.json({ error: error.message || "Failed to save call" }, { status: 500 });
    }
}
