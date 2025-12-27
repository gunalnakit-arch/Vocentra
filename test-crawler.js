// Simple test script for crawler
const testUrl = "https://example.com";

async function testCrawler() {
    try {
        const response = await fetch("http://localhost:3000/api/crawl", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: testUrl,
                mode: "single"
            })
        });

        const data = await response.json();
        console.log("Response:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

testCrawler();
