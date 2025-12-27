import { NextResponse } from "next/server";
import { ultravoxService } from "@/lib/ultravox";

// Simple in-memory cache for demo purposes (production should use proper cache)
let voicesCache: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 3600 * 1000; // 1 hour

export async function GET() {
    const now = Date.now();

    if (voicesCache && (now - lastFetchTime < CACHE_TTL)) {
        return NextResponse.json(voicesCache);
    }

    try {
        const voices = await ultravoxService.listVoices();
        voicesCache = voices;
        lastFetchTime = now;
        return NextResponse.json(voices);
    } catch (error) {
        console.error("Error fetching voices:", error);
        return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
    }
}
