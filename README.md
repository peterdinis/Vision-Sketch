# Vision Sketch NOT FINISHED

Turn hand-drawn UI sketches into **responsive React** code with **Tailwind CSS**, powered by OpenAI vision. Upload a sketch, pick optional libraries (Tailwind, Lucide, Framer Motion, shadcn), and get TSX you can copy—with a **live preview** in the browser.

## Tech stack

- **Next.js** 16 (App Router) · **React** 19 · **TypeScript**
- **Tailwind CSS** v4 · **shadcn/ui**-style components
- **OpenAI** (`gpt-4o` + vision) via server actions (**next-safe-action** + **Zod**)
- Optional **Magic Hour** upscaling before vision
- **Biome** (format + lint) · **ESLint** (`npm run lint`)

## Prerequisites

- Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys) with vision-capable model access

## Setup

```bash
npm install
```

### Environment

1. Copy `.env.example` to `.env.local`.
2. Set **`OPENAI_API_KEY`** (required).
3. Optionally set **`MAGIC_HOUR_API_KEY`** for sketch upscaling before analysis.

Variable names must match `.env.example`.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run lint:biome` | Biome check only |
| `npm run format` | Biome format (write) |
| `npm run check:biome` | Biome check + safe fixes |
| `npm run ci:biome` | Biome CI mode (no write) |

Install the [Biome editor extension](https://biomejs.dev/guides/editors/first-party-extensions/) for format-on-save.

## How it works

1. Upload a **PNG / JPEG / WebP / GIF** sketch (size limits enforced client- and server-side).
2. Choose packages to bias the generated code.
3. **Generate** runs a server action: optional Magic Hour upscale → OpenAI returns JSON with a `code` field.
4. Review **Code** and **Preview** tabs; copy TSX into your own app.

## Project layout (high level)

- `src/app/` — routes, `actions.ts` (generation), global styles
- `src/components/` — dashboard, upload, code preview, UI primitives
- `src/lib/` — env helpers, upload validation, utilities

## Deploy

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/docs/frameworks/nextjs)). Set **`OPENAI_API_KEY`** (and optional **`MAGIC_HOUR_API_KEY`**) in the host’s environment variables—never commit secrets.

## License

Private / all rights reserved unless you add an explicit license file.
