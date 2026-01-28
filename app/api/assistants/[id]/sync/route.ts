import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ultravoxService } from "@/lib/ultravox";
import { anamService } from "@/lib/anam";
import { Call } from "@/lib/types";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const assistant = await db.getAssistant(id);

        if (!assistant) {
            return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
        }

        const providerId = assistant.providerAssistantId;
        if (!providerId) {
            // If no external ID is linked, we can't sync history for this assistant
            return NextResponse.json({ message: "No provider ID linked to this assistant. Skipping sync." });
        }

        let syncedCount = 0;

        if (assistant.provider === "voice") {
            const history = await ultravoxService.listCalls(providerId);
            const calls = history.results || [];

            for (const callData of calls) {
                const call: Call = {
                    id: callData.callId,
                    assistantId: assistant.id,
                    provider: "voice",
                    createdAt: new Date(callData.created || Date.now()),
                    duration: callData.duration ? parseFloat(callData.duration) : undefined,
                    cost: callData.cost ? parseFloat(callData.cost) : undefined,
                    summary: callData.summary,
                    shortSummary: callData.shortSummary,
                    metadata: {
                        agentName: assistant.name,
                        agentId: providerId,
                    }
                };
                await db.saveCall(call);
                syncedCount++;
            }
        } else if (assistant.provider === "avatar") {
            // Fetch all sessions to avoid missing any (per user request)
            const history = await anamService.listSessions({});
            const sessions = history.data || [];

            // Map all assistants to identify which session belongs where
            const allAssistants = await db.getAssistants();
            const personaToAssistantMap: Record<string, string> = {};
            allAssistants.forEach(a => {
                if (a.provider === 'avatar' && a.providerAssistantId) {
                    personaToAssistantMap[a.providerAssistantId] = a.id;
                }
            });

            for (const sessionData of sessions) {
                const sessionPersonaId = sessionData.personaConfig?.personaId || sessionData.personaId;
                const targetAssistantId = personaToAssistantMap[sessionPersonaId];

                // Only sync if it matches an assistant we know about
                // and specifically for the current sync scope if we want to be precise, 
                // but user said "sonra dashboard'da persona'ya göre filtrele" so we save them if mapped.
                if (targetAssistantId) {
                    const call: Call = {
                        id: sessionData.id,
                        assistantId: targetAssistantId,
                        provider: "avatar",
                        createdAt: new Date(sessionData.startTime || Date.now()),
                        duration: sessionData.durationMs ? sessionData.durationMs / 1000 :
                            sessionData.sessionLengthMs ? sessionData.sessionLengthMs / 1000 : undefined,
                        metadata: {
                            personaId: sessionPersonaId,
                            personaName: allAssistants.find(a => a.id === targetAssistantId)?.name || assistant.name,
                            apiKeyLabel: sessionData.apiKeyLabel || sessionData.clientLabel || "Web Dashboard",
                            location: sessionData.locationCountry,
                            exitStatus: sessionData.exitStatus,
                            endedAt: sessionData.endTime ? new Date(sessionData.endTime) : undefined,
                        }
                    };
                    await db.saveCall(call);
                    if (targetAssistantId === assistant.id) {
                        syncedCount++;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, syncedCount });
    } catch (error: any) {
        console.error("Error syncing history:", error);
        return NextResponse.json({ error: "Failed to sync history", details: error.message }, { status: 500 });
    }
}
