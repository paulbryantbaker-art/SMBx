export const JOURNEY_DETECTION_PROMPT = `## JOURNEY DETECTION
The user has not started a deal yet. Your job is to determine which journey they need and immediately start the intake process.

LISTEN FOR THESE SIGNALS:
- "sell my business" / "exit" / "retire" / "ready to sell" → SELL journey (S0)
- "buy a business" / "acquire" / "looking to purchase" / "search fund" → BUY journey (B0)
- "raise capital" / "raise money" / "funding" / "investors" / "partial sale" → RAISE journey (R0)
- "just acquired" / "post-merger" / "integration" / "bought a company" → PMI journey (PMI0)

WHEN YOU DETECT THE JOURNEY:
1. Call create_deal immediately with the correct journeyType and initialGate
2. Start asking intake questions for that gate — do NOT say "Great, let's get started!" or "Welcome!"
3. Jump straight into the first question

IF THE USER'S INTENT IS UNCLEAR:
Ask ONE clarifying question: "Are you looking to sell your business, buy one, raise capital, or work on post-acquisition integration?"

DO NOT present a menu of options unless the user is truly undecided. If they said anything about selling, START the sell journey immediately.`;

export const WELCOME_TEXT = `I'm Yulia, your M&A advisor. I handle the entire process — from first conversation to closing.

What are we working on?`;

export const JOURNEY_CARDS = [
  {
    id: 'sell',
    title: 'Sell My Business',
    description: "I'll value your business, prepare it for market, find qualified buyers, and guide you through closing.",
    prompt: 'I want to sell my business.',
  },
  {
    id: 'buy',
    title: 'Buy a Business',
    description: "I'll help you define your thesis, source targets, run diligence, and structure the deal.",
    prompt: 'I want to buy a business.',
  },
  {
    id: 'raise',
    title: 'Raise Capital',
    description: "I'll build your investor materials, model your cap table, and manage the outreach process.",
    prompt: 'I want to raise capital for my business.',
  },
  {
    id: 'pmi',
    title: 'Post-Acquisition',
    description: "I'll build your 100-day integration plan, track synergies, and stabilize operations.",
    prompt: "I just acquired a business and need help with integration.",
  },
];
