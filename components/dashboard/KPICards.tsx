"use client";
import React from "react";
import {
    Phone,
    Target,
    Clock,
    DollarSign,
    Smile,
    ShieldCheck,
    TriangleAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AggregatedStats } from "@/lib/analytics-utils";

interface KPICardsProps {
    stats: AggregatedStats;
}

const KPICards = ({ stats }: KPICardsProps) => {
    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}dk ${s}sn`;
    };

    const kpis = [
        {
            label: "Toplam Görüşme",
            value: stats.totalCalls,
            icon: Phone,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            trend: "+12.5%",
            trendUp: true
        },
        {
            label: "Çözüm Oranı",
            value: `%${stats.solutionRate.toFixed(1)}`,
            icon: Target,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            trend: "+4.2%",
            trendUp: true
        },
        {
            label: "Ortalama Süre",
            value: formatDuration(stats.avgDuration),
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
            trend: "-24sn",
            trendUp: true
        },
        {
            label: "Toplam Maliyet",
            value: `$${stats.totalCost.toFixed(3)}`,
            icon: DollarSign,
            color: "text-amber-600",
            bg: "bg-amber-50",
            trend: "+$1.2",
            trendUp: false
        },
        {
            label: "Duygu Skoru",
            value: stats.avgSentiment.toFixed(0),
            icon: Smile,
            color: "text-rose-600",
            bg: "bg-rose-50",
            trend: "+8",
            trendUp: true
        },
        {
            label: "Kalite Skoru",
            value: stats.avgQuality.toFixed(0),
            icon: ShieldCheck,
            color: "text-purple-600",
            bg: "bg-purple-50",
            trend: "+5",
            trendUp: true
        },
        {
            label: "Risk / İhlal",
            value: stats.riskCount + stats.complianceCount,
            icon: TriangleAlert,
            color: "text-rose-600",
            bg: "bg-rose-50",
            trend: "-2",
            trendUp: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-2.5 rounded-xl", kpi.bg)}>
                            <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                        </div>
                        <span className={cn(
                            "text-[10px] font-black px-2 py-1 rounded-lg",
                            kpi.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                            {kpi.trend}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
                            {kpi.label}
                        </p>
                        <p className="text-xl font-black text-slate-800 tracking-tighter">
                            {kpi.value}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPICards;
