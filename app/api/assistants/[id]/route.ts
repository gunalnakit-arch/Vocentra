import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";
import { anamService } from "@/lib/anam";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const assistant = await db.getAssistant(id);

    if (!assistant) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(assistant);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const assistant = await db.getAssistant(id);

    if (!assistant) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        const body = await req.json();
        const updated = { ...assistant, ...body, updatedAt: new Date() };

        await db.saveAssistant(updated);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating assistant:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await db.deleteAssistant(id);
    return NextResponse.json({ success: true });
}
