import { createHuggingFace } from '@ai-sdk/huggingface';
import { generateText, streamText } from 'ai';

const huggingface = createHuggingFace({
    apiKey: process.env.HUGGING_FACE_API_KEY,
});

export const hfModel = huggingface('mistralai/Mistral-7B-Instruct-v0.2');

export async function askAI(prompt: string, systemPrompt?: string) {
    const { text } = await generateText({
        model: hfModel,
        system: systemPrompt,
        prompt: prompt,
    });
    return text;
}
