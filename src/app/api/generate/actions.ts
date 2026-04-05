"use server";

import MagicHour from "magic-hour";
import { unstable_cache } from "next/cache";
import { OpenAI } from "openai";
import { z } from "zod";
import { requireOpenAiApiKey } from "@/lib/env";
import { actionClient } from "@/lib/safe-action";
import { imageDataUrlSchema } from "@/lib/upload-rules";

const magicHour = new MagicHour({
  token: process.env.MAGIC_HOUR_API_KEY,
});

const SYSTEM_PROMPT = `
You are a world-class Senior UI/UX Engineer and React expert. Your task is to transform a hand-drawn sketch or wireframe into a pixel-perfect, modern, and high-fidelity React component using Tailwind CSS.

## 1. Visual Language & Aesthetics (The "Premium" Feel)
Even if the sketch is rough, the output should feel like a premium, modern SaaS product (think Linear, Stripe, or Vercel).
- **Typography**: Use standard Sans-serif (Inter/system-ui). Vary font sizes and weights (\`font-semibold\` for headings, \`font-medium\` for labels).
- **Colors**: Use a sophisticated palette. Favor \`slate\`, \`zinc\`, or \`stone\` for neutrals. Use a primary brand color (e.g., \`indigo-600\` or \`blue-600\`) consistently but sparingly.
- **Surface & Depth**: Use white or very light gray backgrounds with subtle borders (\`border-slate-200/60\`). Apply soft shadows (\`shadow-sm\` or \`shadow-md\`). For dark mode elements, use high-contrast text.
- **Glassmorphism**: When appropriate, use \`backdrop-blur-md bg-white/70\` for overlays or sidebars.
- **Corners**: Use modern rounding (\`rounded-xl\`, \`rounded-2xl\`, \`rounded-3xl\`).
- **Spacing**: Ensure generous padding and consistent gutters. Use \`gap-4\` to \`gap-8\` for component layout.

## 2. Structural Fidelity
The generated UI must strictly match the SKETCH's layout.
- **No Inventions**: Do not add major features or sections not present in the sketch.
- **Layout Intent**: If the sketch shows a sidebar on the left, implement it. If it shows three columns, implement three columns.
- **Mental Inventory**: Before coding, identify every block, row, column, header, and footer in the sketch.

## 3. Responsive & Interactive
- **Mobile First**: Use responsive Tailwind classes (\`flex-col md:flex-row\`, \`grid-cols-1 md:grid-cols-3\`).
- **Interactive Elements**: Add hover states (\`hover:bg-slate-50\`), focus rings (\`focus-visible:ring-2\`), and smooth transitions (\`transition-all duration-200\`).
- **Touch Targets**: Ensure buttons and links are at least 44px tall on mobile.

## 4. Technical Constraints
- **React**: Functional components only. Use Next.js App Router compatible patterns.
- **Icons**: Use Lucide React icons (\`lucide-react\`). Choose icons that logically match the sketch.
- **Tailwind**: Only use standard Tailwind classes.
- **Clean Code**: Write readable, modular code within a single file. Export a single default component named with PascalCase.
- **No Fences**: Return **only** valid JSON with a "code" key containing the TSX string.
`.trim();

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
          { waitForCompletion: true },
        );

        if (upscale.downloads && upscale.downloads.length > 0) {
          processedImage = upscale.downloads[0].url;
        }
      }
    } catch (e) {
      console.warn("Magic Hour processing failed, using original image", e);
    }

    const packageContext =
      packages && packages.length > 0
        ? `Use these specific packages when they increase fidelity or add value: ${packages.join(", ")}. Ensure you include all necessary imports.`
        : "Use standard React (hooks allowed) and Tailwind CSS.";

    const userMessage = `
Analyze the attached sketch image. It is the single source of truth for the structure, hierarchy, and content.

**Contextual Instructions**:
${packageContext}

**Your Mission**:
1. Scan the sketch for all layout elements (header, main, sidebar, cards, etc.).
2. Generate a high-fidelity React component that matches this structure perfectly.
3. Apply the "Premium Feel" guidelines from your system instructions.
4. Export as a single default function.

Return only a JSON object: { "code": "..." }
    `.trim();

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY. Copy .env.example to .env.local and add your key.");
    }
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
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
  { revalidate: 3600 },
);

const schema = z.object({
  image: imageDataUrlSchema,
  packages: z.array(z.string()).optional(),
});

export const generateCode = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { image, packages } }) => {
    try {
      requireOpenAiApiKey();
      const result = await getGeneratedCode(image, packages || []);
      return { success: true, data: result };
    } catch (error: unknown) {
      console.error("AI Generation Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      throw new Error(message);
    }
  });
