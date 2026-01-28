import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function list() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data: any = await response.json();
        const supported = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));
        console.log('Models supporting generateContent:', supported.map((m: any) => m.name));
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}
list();
