const fs = require('fs');
const content = [
  'generator client {',
  '  provider = "prisma-client-js"',
  '}',
  '',
  'datasource db {',
  '  provider = "postgresql"',
  '}',
  '',
  'model Note {',
  '  id        String   @id @default(cuid())',
  '  title     String',
  '  content   String',
  '  userId    String',
  '  createdAt DateTime @default(now())',
  '  updatedAt DateTime @updatedAt',
  '}',
  ''
].join('\n');
fs.writeFileSync('prisma/schema.prisma', content, 'utf8');
console.log('Done!');
