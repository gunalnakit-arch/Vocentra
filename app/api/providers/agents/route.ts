import { NextResponse } from "next/server";
import { ultravoxService } from "@/lib/ultravox";

export async function GET() {
    try {
        const agents = await ultravoxService.listAgents();
        return NextResponse.json(agents);
    } catch (error) {
        console.error("Failed to list Ultravox agents:", error);
        return NextResponse.json({ error: "Ultravox asistan listesi alınamadı" }, { status: 500 });
    }
}
