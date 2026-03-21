/**
 * Environment variable names are documented in `.env.example`.
 * OpenAI client must use the same key name as in that file.
 */
export const OPENAI_API_KEY_ENV = "OPENAI_API_KEY" as const;

export function requireOpenAiApiKey(): string {
  const key = process.env[OPENAI_API_KEY_ENV];
  if (!key?.trim()) {
    throw new Error(
      `Missing ${OPENAI_API_KEY_ENV}. Copy .env.example to .env.local and add your key from https://platform.openai.com/api-keys`
    );
  }
  return key.trim();
}
