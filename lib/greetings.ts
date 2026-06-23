/**
 * lib/greetings.ts
 *
 * Config list for multilingual greetings intro sequence.
 */

export interface Greeting {
  text: string;
  accent: boolean;
}

export const GREETINGS: Greeting[] = [
  { text: 'Hello', accent: false },
  { text: 'سلام', accent: false },      // Urdu/Arabic — Salam
  { text: 'नमस्ते', accent: false },     // Hindi — Namaste
  { text: 'Hola', accent: false },      // Spanish
  { text: 'Bonjour', accent: false },   // French
  { text: 'こんにちは', accent: false }, // Japanese — Konnichiwa
  { text: '안녕하세요', accent: false }, // Korean — Annyeonghaseyo
  { text: 'Hello', accent: true },      // signature sign-off — accent color
];
