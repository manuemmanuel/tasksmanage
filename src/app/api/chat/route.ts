import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json()

    if (!process.env.GOOGLE_AI_KEY) {
      console.error("GOOGLE_AI_KEY is not set")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    // Initialize the API with the key from env
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!)

    // Use gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Create chat history context
    const contextPrompt = context.length > 0 
      ? "Previous conversation:\n" + 
        context.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n') +
        "\nNow respond to: "
      : ""

    // Generate response with safety settings and context
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: contextPrompt + message }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    })

    const response = await result.response
    const text = response.text()

    return NextResponse.json({ message: text })
  } catch (error: any) {
    console.error("Error in chat API:", {
      message: error.message,
      stack: error.stack,
      details: error.details || "No additional details"
    })
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    )
  }
} 