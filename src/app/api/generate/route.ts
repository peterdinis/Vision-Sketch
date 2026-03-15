import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image, packages } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const packageContext = packages && packages.length > 0 
      ? `Ensure you use the following packages in your code: ${packages.join(", ")}.`
      : "Use standard React and Tailwind CSS.";

    const prompt = `
      You are an expert React developer. I am providing you with a sketch of a UI component.
      Your task is to convert this sketch into high-quality, functional, and responsive React code using Tailwind CSS.
      
      Requirements:
      1. Use React (Next.js App Router compatible).
      2. Use Tailwind CSS for styling.
      3. ${packageContext}
      4. Make the component look polished, premium, and as close to the sketch as possible.
      5. Include any necessary state management using React hooks.
      6. Provide ONLY the code for the main component. Do not include imports like 'import React from "react"' unless necessary for hooks.
      7. Return the response as a JSON object with a 'code' field.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image, // This should be the base64 data URL
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate code");
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
