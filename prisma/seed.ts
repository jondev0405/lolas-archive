import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.person.deleteMany();
  await prisma.person.create({
    data: {
      name: "Lolo Ben",
      relationship: "Grandfather",
      memories: {
        create: [{
          transcript: "My grandfather always made bibingka on Christmas Eve. He would wake up at four in the morning to light the charcoal. He used to say, 'Food is how we say I love you.' He hummed Dahil Sa Iyo while he cooked.",
          summary: "Lolo Ben baked bibingka every Christmas Eve, rising before dawn to light the charcoal.",
          tags: JSON.stringify(["christmas", "cooking", "family tradition"]),
          quotes: JSON.stringify(["Food is how we say I love you."]),
          foods: JSON.stringify(["bibingka"]),
          songs: JSON.stringify(["Dahil Sa Iyo"]),
          places: JSON.stringify([]),
        }],
      },
    },
  });
}
main().finally(() => prisma.$disconnect());