import { Call, CallAnalytics } from "@/lib/types";

export interface AggregatedStats {
    totalCalls: number;
    avgSentiment: number;
    avgQuality: number;
    avgDuration: number;
    totalCost: number;
    solutionRate: number;
    riskCount: number;
    complianceCount: number;
    intentDistribution: Record<string, number>;
    topicDistribution: Record<string, number>;
    trendData: {
        date: string;
        volume: number;
        sentiment: number;
        resolution: number;
        cost: number;
    }[];
}

export function aggregateCallData(calls: Call[]): AggregatedStats {
    const stats: AggregatedStats = {
        totalCalls: calls.length,
        avgSentiment: 0,
        avgQuality: 0,
        avgDuration: 0,
        totalCost: 0,
        solutionRate: 0,
        riskCount: 0,
        complianceCount: 0,
        intentDistribution: {},
        topicDistribution: {},
        trendData: []
    };

    if (calls.length === 0) return stats;

    let sentimentSum = 0;
    let qualitySum = 0;
    let durationSum = 0;
    let costSum = 0;
    let resolvedCount = 0;

    const dailyData: Record<string, { volume: number; sentiment: number; resolution: number; cost: number }> = {};

    calls.forEach(call => {
        const date = new Date(call.createdAt).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = { volume: 0, sentiment: 0, resolution: 0, cost: 0 };
        }

        dailyData[date].volume += 1;
        durationSum += (call.duration || 0);
        costSum += (call.cost || 0);
        dailyData[date].cost += (call.cost || 0);

        if (call.analytics) {
            sentimentSum += (call.analytics.sentimentScore || 0);
            qualitySum += (call.analytics.qualityScore || 0);

            dailyData[date].sentiment += (call.analytics.sentimentScore || 0);

            if (call.analytics.outcome?.toLowerCase().includes("çözüldü") ||
                call.analytics.outcome?.toLowerCase().includes("resolved") ||
                call.analytics.outcome?.toLowerCase().includes("başarılı")) {
                resolvedCount += 1;
                dailyData[date].resolution += 1;
            }

            stats.riskCount += (call.analytics.riskFlags?.length || 0);
            stats.complianceCount += (call.analytics.complianceFlags?.length || 0);

            const intent = call.analytics.classification?.intent;
            const topic = call.analytics.classification?.topic;

            if (intent) stats.intentDistribution[intent] = (stats.intentDistribution[intent] || 0) + 1;
            if (topic) stats.topicDistribution[topic] = (stats.topicDistribution[topic] || 0) + 1;
        }
    });

    stats.avgSentiment = sentimentSum / stats.totalCalls;
    stats.avgQuality = qualitySum / stats.totalCalls;
    stats.avgDuration = durationSum / stats.totalCalls;
    stats.totalCost = costSum;
    stats.solutionRate = (resolvedCount / stats.totalCalls) * 100;

    // Convert dailyData to sorted trendData
    stats.trendData = Object.entries(dailyData)
        .map(([date, data]) => ({
            date,
            volume: data.volume,
            sentiment: data.sentiment / data.volume,
            resolution: (data.resolution / data.volume) * 100,
            cost: data.cost
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return stats;
}
