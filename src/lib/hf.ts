import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

export async function askAI(prompt: string, systemPrompt?: string) {
    const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.3',
        messages: [
            ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
            { role: 'user' as const, content: prompt },
        ],
        max_tokens: 1024,
    });
    return response.choices[0]?.message?.content || '';
}
