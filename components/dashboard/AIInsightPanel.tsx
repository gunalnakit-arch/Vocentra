"use client";
import React from "react";
import { AlertCircle, ShieldAlert, Zap, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AggregatedStats } from "@/lib/analytics-utils";

interface AIInsightPanelProps {
    stats: AggregatedStats;
    onInsightClick: (filter: string) => void;
}

const AIInsightPanel = ({ stats, onInsightClick }: AIInsightPanelProps) => {
    const insights = [
        {
            id: "risk",
            title: "Yüksek Riskli Görüşmeler",
            count: stats.riskCount,
            description: "Güvenlik veya churn sinyali içeren kritik çağrılar.",
            icon: ShieldAlert,
            color: "text-rose-600",
            bg: "bg-rose-50",
            borderColor: "border-rose-100"
        },
        {
            id: "compliance",
            title: "Compliance İhlalleri",
            count: stats.complianceCount,
            description: "Yasal mevzuat veya script dışı kalan görüşmeler.",
            icon: AlertCircle,
            color: "text-amber-600",
            bg: "bg-amber-50",
            borderColor: "border-amber-100"
        },
        {
            id: "quality",
            title: "Düşük Kaliteli Segment",
            count: 12, // Placeholder for aggregation logic
            description: "Kalite skoru %60'ın altında kalan performans sorunları.",
            icon: TrendingDown,
            color: "text-purple-600",
            bg: "bg-purple-50",
            borderColor: "border-purple-100"
        },
        {
            id: "avatar",
            title: "Avatar Fallback Anomalileri",
            count: 4, // Placeholder
            description: "Avatarın yanıt veremediği ve fallback'e düştüğü anlar.",
            icon: Zap,
            color: "text-blue-600",
            bg: "bg-blue-50",
            borderColor: "border-blue-100"
        }
    ];

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-full">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic mb-8">
                AI Operasyonel Briefing
            </h3>

            <div className="space-y-4">
                {insights.map((insight) => (
                    <button
                        key={insight.id}
                        onClick={() => onInsightClick(insight.id)}
                        className={cn(
                            "w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all group hover:scale-[1.02] active:scale-100 shadow-sm hover:shadow-md",
                            insight.bg,
                            insight.borderColor
                        )}
                    >
                        <div className={cn("p-2 rounded-lg bg-white shrink-0 shadow-sm")}>
                            <insight.icon className={cn("w-5 h-5", insight.color)} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-tight">
                                    {insight.title}
                                </h4>
                                <span className={cn("text-xs font-black", insight.color)}>
                                    {insight.count} vaka
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-tight">
                                {insight.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIInsightPanel;
