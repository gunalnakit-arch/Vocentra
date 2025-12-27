import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Remove scripts, styles
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();

        // Get text
        const title = $('title').text() || url;
        const content = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000); // Limit preview size

        return NextResponse.json({
            title,
            content: `Title: ${title}\n\n${content}`,
            pageCount: 1 // simplified
        });

    } catch (error) {
        console.error("Preview scrape error:", error);
        return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 });
    }
}
