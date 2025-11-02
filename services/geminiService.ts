
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a helpful assistant that generates polite and concise auto-replies for various situations like phone calls, SMS, or WhatsApp messages. 
When a user describes a situation, you should craft an appropriate auto-reply for them. 
Keep the tone friendly and professional. The replies should be relatively short.`;

export function initializeChat(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
}

export async function sendMessageToGemini(chat: Chat, message: string): Promise<string> {
    try {
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to get response from AI.");
    }
}
