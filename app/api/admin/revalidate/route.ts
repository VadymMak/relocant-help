import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidatePath('/uk/admin', 'page')
  revalidatePath('/ru/admin', 'page')
  revalidatePath('/en/admin', 'page')
  revalidatePath('/uk/admin/articles', 'page')
  revalidatePath('/ru/admin/articles', 'page')
  revalidatePath('/en/admin/articles', 'page')
  return NextResponse.json({ revalidated: true })
}
