import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const calls = await db.getCalls(id);

        return NextResponse.json(calls);
    } catch (error: any) {
        console.error("Error fetching assistant calls:", error);
        return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
    }
}
