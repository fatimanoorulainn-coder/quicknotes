const fs = require('fs');
const content = [
  "import { PrismaPg } from '@prisma/adapter-pg'",
  "import { PrismaClient } from '@prisma/client'",
  "",
  "const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }",
  "",
  "export const prisma =",
  "  globalForPrisma.prisma ||",
  "  new PrismaClient({",
  "    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),",
  "  })",
  "",
  "if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma",
  ""
].join('\n');
fs.writeFileSync('lib/prisma.ts', content, 'utf8');
console.log('Done!');
