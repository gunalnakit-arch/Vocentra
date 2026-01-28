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

        const extras: any = {};

        if (call.provider === "voice") {
            const [recording, events] = await Promise.allSettled([
                ultravoxService.getCallRecording(callId),
                ultravoxService.getCallEvents(callId)
            ]);

            if (recording.status === "fulfilled") extras.recording = recording.value;
            if (events.status === "fulfilled") extras.events = events.value;
        } else {
            const recording = await anamService.getRecordingUrl(callId).catch(() => null);
            if (recording) extras.recordingUrl = recording;
        }

        return NextResponse.json(extras);
    } catch (error: any) {
        console.error("Error fetching call extras:", error);
        return NextResponse.json({ error: "Failed to fetch extras" }, { status: 500 });
    }
}
