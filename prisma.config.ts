import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'postgresql://postgres.ufszcsszxqpxrwggkjyb:lAwL7wP2abvkr5k4@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres',
  },
})
