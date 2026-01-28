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

        let transcript = "";

        if (call.provider === "voice") {
            const messages = await ultravoxService.getCallMessages(callId);
            transcript = (messages.results || []).map((m: any) => `${m.role}: ${m.text}`).join("\n");
        } else {
            const transcriptData = await anamService.getTranscript(callId);
            transcript = (transcriptData.messages || []).map((m: any) => `${m.role}: ${m.message}`).join("\n");
        }

        if (!transcript) {
            return NextResponse.json({ error: "No transcript available for analysis" }, { status: 400 });
        }

        // Prepare LLM Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `
        Aşağıdaki çağrı merkezi görüşme transkriptini derinlemesine analiz et ve SADECE JSON formatında şu bilgileri üret:
        
        {
          "sentiment": "positive" | "neutral" | "negative",
          "satisfactionScore": 1-10 arası,
          "professionalismScore": 1-100 arası,
          "empathyScore": 1-100 arası,
          "solutionAccuracyScore": 1-100 arası,
          "emotionalTrend": [sayı listesi, görüşme boyuncaki duygu değişimi 1-100 arası, en az 5 nokta],
          "kpis": {
            "avgResponseTime": "ms cinsinden string",
            "silenceRatio": "% cinsinden string",
            "interruptionCount": sayı
          },
          "radarData": {
             "professionalism": 1-100,
             "empathy": 1-100,
             "accuracy": 1-100,
             "speed": 1-100,
             "clarity": 1-100
          },
          "keyPoints": ["madde 1", "madde 2", ...],
          "actionItems": ["aksiyon 1", "aksiyon 2", ...],
          "callQuality": "Görüşme kalitesi hakkında çok kısa (max 10 kelime) teknik yorum",
          "expertAssessment": "Görüşme hakkında detaylı uzman değerlendirmesi ve gelişim önerileri",
          "insights": ["insight 1", "insight 2", ...]
        }

        Transkript:
        ${transcript}

        ÖNEMLİ: Lütfen SADECE geçerli bir JSON döndür. Markdown backticks ( \`\`\`json ) kullanma. Metinler Türkçe olsun.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup for JSON
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const analytics = JSON.parse(cleanJson);

        // Update call with analytics
        call.analytics = analytics;
        await db.saveCall(call);

        return NextResponse.json(analytics);

    } catch (error: any) {
        console.error("Error generating analytics:", error);
        return NextResponse.json({ error: "Failed to generate analytics", details: error.message }, { status: 500 });
    }
}
