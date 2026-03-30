export const CHARACTER_IMAGES: Record<string, string> = {
  "The Intern": "/mascots/char-the-intern.png",
  "The Degen": "/mascots/char-the-degen.png",
  "The SBF": "/mascots/char-the-ghost.png",
  "The Sama": "/mascots/char-the-operator.png",
  "The Quant": "/mascots/char-the-quant.png",
  "The Musk": "/mascots/char-the-chaos-agent.png",
  "The Dario": "/mascots/char-the-visionary.png",
  "The Karpathy": "/mascots/char-the-night-shift-engineer.png",
  "Slough Boy": "/mascots/char-the-researcher.png",
};

export function getCharacterImage(name: string): string {
  return CHARACTER_IMAGES[name] ?? "/mascots/character-reveal.png";
}
