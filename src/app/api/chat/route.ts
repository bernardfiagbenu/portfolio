import { HfInference } from '@huggingface/inference';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

const systemPrompt = `You are Bernard Fiagbenu's expert portfolio assistant. Your name is "Portfolio Pro".
Your purpose is to answer questions about Bernard's skills, experience, and projects in a friendly, concise, and professional manner.
Do not answer questions that are not related to Bernard's portfolio.
Here is the context about Bernard Fiagbenu. Use it to answer the user's questions.

---
**CONTEXT**

**Name:** Bernard Fiagbenu
**Role:** Computer Scientist
**Education:** Bachelor of Science in Computer Science from University of the People (Expected Graduation: 2025, GPA: 3.06).
**Experience:** Over 5 years in Software Development.
**Philosophy:** "Simplicity is the ultimate sophistication." - Strives for clarity and impact.
**Key Skills:**
- **Languages:** Python, Java, C++, JavaScript (ES6+), TypeScript, SQL, Go, Swift, Kotlin
- **Web Development:** React, Next.js, HTML5, CSS3, Tailwind CSS, Node.js, Express.js
- **Software Engineering:** Agile, Scrum, Git, GitHub, Design Patterns, SDLC
- **Databases:** MySQL, PostgreSQL, MongoDB
- **AI/ML:** Core AI Concepts, NLP, Computer Vision Basics
- **Cloud/DevOps:** AWS, Azure, GCP concepts, Docker, CI/CD

**Projects:**
1.  **Stress Manager App:** A web app to help users manage stress. Tech: React, JavaScript.
2.  **Fav ico Generator:** A tool to generate favicons for websites. Tech: JavaScript, Netlify.
3.  **Google Play Console Image Formatter:** A tool to format images for the Google Play Store. Tech: JavaScript, Netlify.
4.  **Modern Quiz App:** An interactive quiz application. Tech: React, JavaScript, Netlify.

**Research Interests:**
Artificial General Intelligence (AGI), Quantum Computing, Brain-Computer Interfaces (BCIs), Nanotechnology, Fusion Energy, and many other future technologies. He has written a detailed article on the future use cases of Quantum Computing.
---

Based on the context above, answer the following question.
`;


export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Build conversation for the HF model
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    // Use HF Inference API for chat completion with streaming
    const stream = hf.chatCompletionStream({
      model: 'mistralai/Mistral-7B-Instruct-v0.3',
      messages: conversationMessages,
      max_tokens: 1024,
    });

    // Create a ReadableStream that outputs plain text chunks
    // compatible with the `useChat` hook from the `ai` package
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              // Format as AI SDK data stream protocol: 0:"text"\n
              const formattedChunk = `0:${JSON.stringify(text)}\n`;
              controller.enqueue(textEncoder.encode(formattedChunk));
            }
          }
          // Send finish reason
          controller.enqueue(textEncoder.encode('d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n'));
          controller.close();
        } catch (err: any) {
          console.error('Streaming error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('HuggingFace API Error:', {
      message: error.message,
    });
    return NextResponse.json(
      { error: 'AI response failed', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
