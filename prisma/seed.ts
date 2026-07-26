import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const TEMPLATES = [
  {
    name: "Interior Painting — Residential",
    tradeType: "PAINTING" as const,
    isDefault: true,
    items: [
      { description: "Wall prep (patch & sand)", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Prime walls", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "1-coat paint (builder grade)", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Basic cleanup", tierHint: "GOOD" as const, sortOrder: 3 },
      { description: "2-coat paint (mid-grade)", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Cut-in trim", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Move / cover furniture", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Premium paint (Sherwin-Williams)", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Ceilings included", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Full furniture move", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "1-year warranty card", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Exterior Painting — Residential",
    tradeType: "PAINTING" as const,
    isDefault: true,
    items: [
      { description: "Pressure wash surface", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "1-coat paint", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Front & back only", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "2-coat paint", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Trim & soffits", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Scrape peeling paint", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Prime bare wood", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Full caulk & seal", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Deck or garage door included", tierHint: "BEST" as const, sortOrder: 2 },
    ],
  },
  {
    name: "Driveway & Walkways",
    tradeType: "PRESSURE_WASHING" as const,
    isDefault: true,
    items: [
      { description: "Driveway only", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Cold water rinse", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Basic concrete detergent", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Walkways + steps included", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Hot water pressure wash", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Concrete degreaser", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Patio / pool deck included", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Post-treatment sealer application", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Gutter flush", tierHint: "BEST" as const, sortOrder: 2 },
    ],
  },
  {
    name: "House Exterior Soft Wash",
    tradeType: "PRESSURE_WASHING" as const,
    isDefault: true,
    items: [
      { description: "Front of house only", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Soft wash solution", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Single-story", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Full house exterior", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Roof line rinse", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Shutters & trim", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Fence section included", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Driveway included", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Same-day scheduling priority", tierHint: "BEST" as const, sortOrder: 2 },
    ],
  },
];

async function main() {
  console.log("Seeding trade templates...");

  // Clear existing system templates first
  await db.template.deleteMany({ where: { userId: null } });

  for (const template of TEMPLATES) {
    await db.template.create({
      data: {
        name: template.name,
        tradeType: template.tradeType,
        isDefault: template.isDefault,
        userId: null,
        items: {
          create: template.items.map((item) => ({
            description: item.description,
            tierHint: item.tierHint,
            sortOrder: item.sortOrder,
            unitCents: 0,
          })),
        },
      },
    });
    console.log(`  ✓ ${template.name}`);
  }

  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
