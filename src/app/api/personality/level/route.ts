/**
 * FeiControl — Agent 等级 API
 * GET  /api/personality/level?agentId=X
 */
import { NextRequest, NextResponse } from 'next/server';
import { getLevel } from '@/lib/personality/growth-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    const level = getLevel(agentId);
    return NextResponse.json({ level });
  } catch (error) {
    console.error('Level GET error:', error);
    return NextResponse.json({ error: 'Failed to get level' }, { status: 500 });
  }
}
