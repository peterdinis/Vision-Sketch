"use server";

import { OpenAI } from "openai";
import { unstable_cache } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import MagicHour from "magic-hour";
import { requireOpenAiApiKey } from "@/lib/env";
import { imageDataUrlSchema } from "@/lib/upload-rules";

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
      ? `Use these when they help match the sketch (imports allowed): ${packages.join(", ")}. If a package is not needed for fidelity, omit it.`
      : "Use standard React and Tailwind CSS only unless the sketch clearly needs icons or motion.";

    const prompt = `
You are an expert UI engineer. You receive a hand-drawn or wireframe image of a screen or component.

## Primary goal: structural fidelity to the image
The generated UI must match the SKETCH, not a generic pretty template.

Before writing code, mentally inventory the image in reading order (top → bottom, left → right):
- Outer frame / page vs modals / cards
- Every distinct block, column, row, divider, list, table, form, toolbar, header, footer, sidebar
- Approximate hierarchy: what is nested inside what
- Text labels, headings, button captions, placeholder copy (transcribe legible text; if illegible, use neutral placeholders like "Label", "Button", "Search…")
- Icon or image placeholders as simple shapes or Lucide icons only if the user selected lucide
- Rough proportions when obvious (e.g. sidebar width vs main area, stacked vs side-by-side)

Rules:
- **Do not invent** major sections, extra cards, marketing blocks, or navigation that are **not** visible in the sketch.
- **Do not simplify** the layout to a single hero + CTA if the sketch shows multiple panels or steps.
- Preserve **alignment intent**: if two boxes are side-by-side in the sketch, use a responsive row that becomes a column on small screens (see Responsive section).
- Match **density**: sparse sketch → breathable spacing; dense sketch → tighter gaps but still readable.
- Use Tailwind for colors and borders that **approximate** the sketch (wireframe = neutral grays + clear borders; color markers = similar hues).

## Responsive (mandatory — every output)
Implement **mobile-first** responsive behavior for the whole component:
- Root wrapper: \`w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8\` (or \`max-w-full\` for full-bleed dashboards) plus sensible vertical padding.
- Layout: prefer \`flex flex-col\` by default; use \`sm:\` / \`md:\` / \`lg:\` breakpoints to switch to \`flex-row\`, \`grid\`, or multi-column **only when** the sketch implies columns on larger screens.
- Use \`gap-*\`, \`min-w-0\`, and \`flex-1\` to avoid overflow; use \`overflow-x-auto\` for horizontal toolbars or tables on small screens.
- Typography: scale with breakpoints where appropriate (e.g. \`text-2xl md:text-3xl\` for main titles).
- Touch targets: interactive elements at least ~44px hit area on small screens (\`min-h-11\`, padding).
- Images/avatars: \`max-w-full h-auto\`; no fixed widths that break narrow viewports unless the sketch is explicitly fixed-size.

## Technical
1. React only (Next.js App Router compatible). One main component file in the \`code\` string.
2. Tailwind CSS utility classes for all styling.
3. ${packageContext}
4. Use hooks only when the sketch implies interaction (tabs, toggles, inputs, open/close).
5. No markdown fences inside \`code\`. No prose outside the JSON.
6. **export default function PascalCaseName** — named default export (e.g. \`export default function SketchView()\`). Required for live preview.
7. Return **only** valid JSON: \`{ "code": "..." }\` where \`code\` is the full TSX source string.

The sketch image is attached; follow it as the single source of truth for structure and content.
    `.trim();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!.trim(),
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.35,
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
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      throw new Error(error.message || "Internal Server Error");
    }
  });
