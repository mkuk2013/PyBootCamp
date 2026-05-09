import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, question, expectedOutput, currentOutput, hintsRevealed } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ 
        message: "AI Mentor is in 'Offline Mode' (API Key missing). I've reviewed your code: it looks like you're on the right track! Try checking your variable names and indentation." 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a friendly and expert Python Mentor for a student at PyBootCamp.
      The student is working on this problem: "${question}"
      Expected Output: "${expectedOutput}"
      Student's Current Code:
      \`\`\`python
      ${code}
      \`\`\`
      Current Output/Error: "${currentOutput}"
      Hints already revealed by the system: ${hintsRevealed}

      Your Goal: Provide a BRIEF, encouraging, and helpful hint. 
      - DO NOT give the full solution.
      - Point out logical errors or syntax issues.
      - Use professional but accessible language.
      - If the code is empty, encourage them on how to start.
      - Keep it under 3 sentences.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("AI Mentor Error:", error);
    return NextResponse.json({ error: "Failed to reach AI Mentor" }, { status: 500 });
  }
}
