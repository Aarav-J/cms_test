import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const raw = readFileSync(join(process.cwd(), 'content', 'site-data.json'), 'utf-8');
    return NextResponse.json(JSON.parse(raw));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Read failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
