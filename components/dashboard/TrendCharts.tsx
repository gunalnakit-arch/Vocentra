"use client";
import React, { useState } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { AggregatedStats } from "@/lib/analytics-utils";
import { cn } from "@/lib/utils";

interface TrendChartsProps {
    stats: AggregatedStats;
}

const TrendCharts = ({ stats }: TrendChartsProps) => {
    const [activeTab, setActiveTab] = useState<"volume" | "sentiment" | "resolution" | "cost">("volume");

    const tabs = [
        { id: "volume", label: "Görüşme Hacmi", color: "rgba(79, 70, 229, 0.5)", stroke: "#4f46e5" },
        { id: "sentiment", label: "Duygu Trendi", color: "rgba(225, 29, 72, 0.5)", stroke: "#e11d48" },
        { id: "resolution", label: "Çözüm Oranı", color: "rgba(16, 185, 129, 0.5)", stroke: "#10b981" },
        { id: "cost", label: "Operasyonel Maliyet", color: "rgba(245, 158, 11, 0.5)", stroke: "#f59e0b" },
    ];

    const currentTab = tabs.find(t => t.id === activeTab)!;

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic">
                    Trend Analizi
                </h3>
                <div className="p-1 bg-slate-50 rounded-xl flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentTab.stroke} stopOpacity={0.1} />
                                <stop offset="95%" stopColor={currentTab.stroke} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "none",
                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                fontSize: "12px",
                                fontWeight: "bold"
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey={activeTab}
                            stroke={currentTab.stroke}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendCharts;
