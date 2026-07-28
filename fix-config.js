const fs = require('fs');
const content = [
  "import { defineConfig } from 'prisma/config'",
  "",
  "export default defineConfig({",
  "  schema: 'prisma/schema.prisma',",
  "})",
  ""
].join('\n');
fs.writeFileSync('prisma.config.ts', content, 'utf8');
console.log('Done!');
