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
  {
    name: "Recurring House Cleaning",
    tradeType: "CLEANING" as const,
    isDefault: true,
    items: [
      { description: "Kitchen wipe-down & sink", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Bathroom sanitize (toilet, sink, tub/shower)", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Vacuum carpets & rugs", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Mop hard floors", tierHint: "GOOD" as const, sortOrder: 3 },
      { description: "Empty trash bins", tierHint: "GOOD" as const, sortOrder: 4 },
      { description: "Dusting all surfaces & baseboards", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Interior window sills wiped", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Make beds (linens not changed)", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Detailed bathroom scrub (grout, mirrors)", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Inside microwave cleaned", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Interior cabinet fronts wiped", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Ceiling fan & light fixture dusting", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Priority same-week scheduling", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Move-Out / Deep Clean",
    tradeType: "CLEANING" as const,
    isDefault: true,
    items: [
      { description: "All rooms swept & mopped", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Kitchen counters & exterior appliances", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Bathrooms scrubbed top to bottom", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Trash removal", tierHint: "GOOD" as const, sortOrder: 3 },
      { description: "Inside oven cleaned", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Inside refrigerator cleaned", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Baseboards & door frames wiped", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Interior windows cleaned", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Inside all cabinets & drawers", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Light fixtures & vents dusted", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Garage sweep", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Move-out touch-up guarantee", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "General Pest Control Treatment",
    tradeType: "FUMIGATION" as const,
    isDefault: true,
    items: [
      { description: "Interior perimeter spray (baseboards, entry points)", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Exterior perimeter treatment", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Exterior cobweb removal", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Interior + exterior full treatment", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Crawl space / attic spot treatment", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Ant & roach bait stations placed", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "30-day re-treatment guarantee", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Rodent bait stations (exterior)", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Quarterly follow-up visits (4x/year)", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Termite pre-inspection included", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "90-day guarantee", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Termite / Pre-Construction Treatment",
    tradeType: "FUMIGATION" as const,
    isDefault: true,
    items: [
      { description: "Visual termite inspection", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Spot chemical treatment (active areas)", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Written inspection report", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Full perimeter soil treatment", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Localized wood treatment (visible damage)", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "1-year termite warranty", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Full structural soil & foundation treatment", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Bait station system installed", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "5-year renewable warranty", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Annual re-inspection included", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "AC / Furnace Tune-Up",
    tradeType: "HVAC" as const,
    isDefault: true,
    items: [
      { description: "Filter inspection & replacement", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Thermostat check", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Visual inspection of unit", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Coil cleaning (evaporator or condenser)", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Refrigerant level check", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Electrical connections tightened", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Condensate drain flush", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Full system diagnostic", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Duct airflow check", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Refrigerant recharge (up to 1 lb, if needed)", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "1-year parts warranty on repairs", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "System Replacement / Install",
    tradeType: "HVAC" as const,
    isDefault: true,
    items: [
      { description: "Single-stage AC or furnace unit", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Standard ductwork connection", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Old unit haul-away", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "2-stage high-efficiency unit", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Line set / basic duct modifications", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Programmable thermostat included", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "5-year manufacturer warranty", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Variable-speed high-efficiency system", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Full duct redesign / sealing", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Smart thermostat + zoning", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "10-year parts & labor warranty", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Lawn Maintenance Plan",
    tradeType: "LANDSCAPING" as const,
    isDefault: true,
    items: [
      { description: "Mow & edge", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Blow off hard surfaces", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Weekly service", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Mow, edge & trim shrubs", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Seasonal fertilization", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Weed control application", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Bi-weekly bed weeding", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Fertilization + pre-emergent program", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Mulch refresh (2x/year)", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Seasonal color rotation", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Irrigation system check", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Landscape Install / Hardscape",
    tradeType: "LANDSCAPING" as const,
    isDefault: true,
    items: [
      { description: "Sod or seed installation (small area)", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Basic mulch bed border", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Site cleanup", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Planting beds with shrubs & perennials", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Steel or paver edging", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Drip irrigation line to beds", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Mulch install", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Full landscape design & install", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Paver patio or walkway", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Small retaining wall", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Landscape lighting + irrigation timer", tierHint: "BEST" as const, sortOrder: 3 },
    ],
  },
  {
    name: "Local Move (Same Day)",
    tradeType: "MOVING_SERVICES" as const,
    isDefault: true,
    items: [
      { description: "Loading & unloading only (you drive truck)", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "2-person crew", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Furniture pads for large items", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Full-service load / transport / unload", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Basic disassembly/reassembly (beds, tables)", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Shrink wrap for upholstered furniture", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "3-4 person crew", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Full disassembly/reassembly, all furniture", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Appliance dolly handling (washer/dryer/fridge)", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Floor & doorway protection", tierHint: "BEST" as const, sortOrder: 3 },
      { description: "Room placement per labels", tierHint: "BEST" as const, sortOrder: 4 },
    ],
  },
  {
    name: "Long-Distance / Packing",
    tradeType: "MOVING_SERVICES" as const,
    isDefault: true,
    items: [
      { description: "Self-packed boxes loaded only", tierHint: "GOOD" as const, sortOrder: 0 },
      { description: "Standard transport (1-3 day window)", tierHint: "GOOD" as const, sortOrder: 1 },
      { description: "Basic inventory list", tierHint: "GOOD" as const, sortOrder: 2 },
      { description: "Partial packing (fragile / kitchen items)", tierHint: "BETTER" as const, sortOrder: 0 },
      { description: "Furniture blankets & shrink wrap", tierHint: "BETTER" as const, sortOrder: 1 },
      { description: "Tracked delivery window", tierHint: "BETTER" as const, sortOrder: 2 },
      { description: "Basic liability coverage", tierHint: "BETTER" as const, sortOrder: 3 },
      { description: "Full-service packing (all rooms)", tierHint: "BEST" as const, sortOrder: 0 },
      { description: "Custom crating for fragile/high-value items", tierHint: "BEST" as const, sortOrder: 1 },
      { description: "Guaranteed delivery date", tierHint: "BEST" as const, sortOrder: 2 },
      { description: "Full-value protection coverage", tierHint: "BEST" as const, sortOrder: 3 },
      { description: "Unpacking & box removal at destination", tierHint: "BEST" as const, sortOrder: 4 },
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
