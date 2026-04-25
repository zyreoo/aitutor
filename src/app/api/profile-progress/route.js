import { NextResponse } from 'next/server'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function POST(request) {
  try {
    const body = await request.json()
    const username = String(body?.username || '').trim()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const docId = username.toLowerCase()
    await setDoc(
      doc(db, 'learner_profile_progress', docId),
      {
        username,
        profile: body?.profile || {},
        responses: body?.responses || [],
        completeness: Number(body?.completeness || 0),
        status: body?.status || 'in_progress',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Could not save profile progress' }, { status: 500 })
  }
}
