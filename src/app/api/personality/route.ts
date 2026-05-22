/**
 * FeiControl — 人格化系统 API
 * GET  /api/personality?agentId=X  获取性格
 * PUT  /api/personality             更新性格
 * DELETE /api/personality?agentId=X 重置为默认
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getPersonality,
  upsertPersonality,
  resetPersonality,
} from '@/lib/personality/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    const personality = getPersonality(agentId);
    return NextResponse.json({ personality });
  } catch (error) {
    console.error('Personality GET error:', error);
    return NextResponse.json({ error: 'Failed to get personality' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, ...personalityData } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    upsertPersonality({ agentId, ...personalityData });
    return NextResponse.json({ success: true, personality: getPersonality(agentId) });
  } catch (error) {
    console.error('Personality PUT error:', error);
    return NextResponse.json({ error: 'Failed to update personality' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    resetPersonality(agentId);
    return NextResponse.json({ success: true, personality: getPersonality(agentId) });
  } catch (error) {
    console.error('Personality DELETE error:', error);
    return NextResponse.json({ error: 'Failed to reset personality' }, { status: 500 });
  }
}
