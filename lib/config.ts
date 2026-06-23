/**
 * lib/config.ts
 *
 * Environment variables configuration and validation.
 */

// config verification check helper
function validateConfig(): void {
  const isServer = typeof window === 'undefined';
  if (isServer) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
    const openaiKey = process.env.OPENAI_API_KEY || '';
    
    // checks that either Anthropic or OpenAI API keys are present
    if (!anthropicKey && !openaiKey) {
      throw new Error(
        'MISSING ENV VAR: Either ANTHROPIC_API_KEY or OPENAI_API_KEY must be set in your .env.local file.'
      );
    }
  }
}

export interface Config {
  readonly ANTHROPIC_API_KEY: string;
  readonly OPENAI_API_KEY: string;
  readonly MAX_FILE_SIZE_MB: number;
  readonly NODE_ENV: string;
  readonly GROQ_API_KEY: string;
}

export const CONFIG: Config = {
  get ANTHROPIC_API_KEY(): string {
    validateConfig();
    return process.env.ANTHROPIC_API_KEY || '';
  },
  get OPENAI_API_KEY(): string {
    validateConfig();
    return process.env.OPENAI_API_KEY || '';
  },
  get MAX_FILE_SIZE_MB(): number {
    return Number(process.env.MAX_FILE_SIZE_MB || '5');
  },
  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },
  get GROQ_API_KEY(): string {
    return process.env.GROQ_API_KEY || '';
  },
};
