import { NextRequest, NextResponse } from "next/server";
import { ultravoxService } from "@/lib/ultravox";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        const { callId } = await params;

        const callDetails = await ultravoxService.getCallDetails(callId);

        return NextResponse.json(callDetails);
    } catch (error: any) {
        console.error("Error fetching call details:", error);
        return NextResponse.json({
            error: error.message || "Failed to fetch call details"
        }, { status: 500 });
    }
}
