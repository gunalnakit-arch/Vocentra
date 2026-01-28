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
            // If not in DB, try to fetch from providers to see if it exists
            // This is a safety check
            return NextResponse.json({ error: "Call not found" }, { status: 404 });
        }

        if (call.provider === "voice") {
            const data = await ultravoxService.getCallDetails(callId);
            return NextResponse.json(data);
        } else {
            // Anam doesn't have a single "get session" that returns everything easily in one go 
            // but we can return the call object from our DB plus transcript info if needed.
            // For now, let's return our DB record combined with basic session stats if available.
            return NextResponse.json(call);
        }
    } catch (error: any) {
        console.error("Error fetching call details:", error);
        return NextResponse.json({ error: "Failed to fetch call details" }, { status: 500 });
    }
}
