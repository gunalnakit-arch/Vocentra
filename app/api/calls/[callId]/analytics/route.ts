import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ultravoxService } from "@/lib/ultravox";
import { anamService } from "@/lib/anam";
import { db } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ callId: string }> }
) {
    try {
        const { callId } = await params;
        const call = await db.getCall(callId);

        if (!call) {
            return NextResponse.json({ error: "Call not found in database" }, { status: 404 });
        }

        let transcriptArray: any[] = [];
        let transcriptString = "";

        if (call.provider === "voice") {
            const messages = await ultravoxService.getCallMessages(callId);
            transcriptArray = messages.results || [];
            transcriptString = transcriptArray.map((m: any) => `${m.role}: ${m.text}`).join("\n");
        } else {
            const transcriptData = await anamService.getTranscript(callId);
            transcriptArray = transcriptData.messages || [];
            transcriptString = transcriptArray.map((m: any) => `${m.role}: ${m.message}`).join("\n");
        }

        if (!transcriptString) {
            return NextResponse.json({ error: "No transcript available for analysis" }, { status: 400 });
        }

        // Prepare LLM Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
        Aşağıdaki çağrı merkezi görüşme transkriptini analiz et ve SADECE JSON formatında şu bilgileri üret:
        
        {
          "outcome": "Success" | "Failure" | "Escalated" | "Need Callback",
          "sentimentScore": 0-100 arası (sayı),
          "qualityScore": 0-100 arası (sayı),
          "professionalismScore": 0-100 arası (sayı),
          "empathyScore": 0-100 arası (sayı),
          "solutionAccuracyScore": 0-100 arası (sayı),
          "riskFlags": ["risk 1", "risk 2", ...],
          "complianceFlags": ["ihlali 1", ...],
          "classification": {
            "intent": "Müşteri isteği/amacı",
            "topic": "Görüşme ana başlığı"
          },
          "emotionalTrend": [sayı listesi, 0-100 arası, çağrı boyunca değişimi gösteren 7 elemanlı dizi],
          "insights": ["aksiyona dökülebilir içgörü 1", "içgörü 2", ...],
          "actionItems": ["yapılması gereken 1", "aksiyon 2", ...],
          "expertAssessment": "Görüşme hakkında teknik uzman değerlendirmesi (1-2 cümle)",
          "agentPerformance": {
            "overallScore": 0-100 arası (sayı),
            "tone": "Kullanılan ses tonu (örn: Profesyonel, Empatik, Aceleci)",
            "adaptability": "Müşterinin durumuna uyum sağlama değerlendirmesi",
            "strengths": ["güçlü yön 1", "güçlü yön 2"],
            "areasForImprovement": ["gelişim alanı 1", "gelişim alanı 2"]
          },
          "kpis": {
            "avgResponseTime": "ms",
            "silenceRatio": "%",
            "interruptionCount": 0
          }
        }

        Transkript:
        ${transcriptString}

        ÖNEMLİ: Sadece geçerli JSON döndür. Markdown backticks kullanma. Metinler Türkçe olsun.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // More robust cleanup for JSON
        let cleanJson = text.trim();
        if (cleanJson.includes("```json")) {
            cleanJson = cleanJson.split("```json")[1].split("```")[0].trim();
        } else if (cleanJson.includes("```")) {
            cleanJson = cleanJson.split("```")[1].split("```")[0].trim();
        }

        const analytics = JSON.parse(cleanJson);

        // Update call with analytics AND ensure transcript is saved
        call.analytics = analytics;
        call.transcript = transcriptArray;

        // Also update summaries if not present
        if (!call.shortSummary || !call.summary) {
            call.shortSummary = analytics.classification?.topic || "Görüşme Analizi";
            call.summary = analytics.expertAssessment;
        }

        await db.saveCall(call);

        return NextResponse.json(analytics);

    } catch (error: any) {
        console.error("Error generating analytics:", error);
        return NextResponse.json({ error: "Failed to generate analytics", details: error.message }, { status: 500 });
    }
}
