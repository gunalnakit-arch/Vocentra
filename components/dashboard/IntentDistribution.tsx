"use client";
import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface IntentDistributionProps {
    data: Record<string, number>;
    title: string;
}

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#e11d48", "#8b5cf6", "#3b82f6"];

const IntentDistribution = ({ data, title }: IntentDistributionProps) => {
    const chartData = Object.entries(data)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    return (
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm h-full">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest italic mb-8">
                {title}
            </h3>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                            width={80}
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
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default IntentDistribution;
