import { NextResponse } from "next/server";
import { anamService } from "@/lib/anam";

export async function GET() {
    try {
        const personas = await anamService.listPersonas();
        return NextResponse.json(personas);
    } catch (error) {
        console.error("Failed to list Anam AI personas:", error);
        return NextResponse.json({ error: "Anam asistan listesi alınamadı" }, { status: 500 });
    }
}
