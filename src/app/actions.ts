"use server";

import { OpenAI } from "openai";
import { revalidatePath, unstable_cache } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import MagicHour from "magic-hour";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const magicHour = new MagicHour({
  token: process.env.MAGIC_HOUR_API_KEY || "dummy",
});

const getGeneratedCode = unstable_cache(
  async (image: string, packages: string[]) => {
    let processedImage = image;

    try {
      if (process.env.MAGIC_HOUR_API_KEY) {
        const upscale = await magicHour.v1.aiImageUpscaler.generate(
          {
            assets: { imageFilePath: image },
            scaleFactor: 2.0,
            style: { enhancement: "Balanced" },
          },
          { waitForCompletion: true }
        );

        if (upscale.downloads && upscale.downloads.length > 0) {
          processedImage = upscale.downloads[0].url;
        }
      }
    } catch (e) {
      console.warn("Magic Hour processing failed, using original image", e);
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
                url: processedImage,
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

    return JSON.parse(content);
  },
  ["code-generation"],
  { revalidate: 3600 }
);

const schema = z.object({
  image: z.string().min(1, "Image is required"),
  packages: z.array(z.string()).optional(),
});

export const generateCode = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { image, packages } }) => {
    try {
      const result = await getGeneratedCode(image, packages || []);
      return { success: true, data: result };
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      throw new Error(error.message || "Internal Server Error");
    }
  });
