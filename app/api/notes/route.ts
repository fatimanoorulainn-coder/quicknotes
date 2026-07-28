import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content } = await request.json()
  const note = await prisma.note.create({
    data: { title, content, userId: user.id },
  })
  return NextResponse.json(note)
}
