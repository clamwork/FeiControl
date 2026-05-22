/**
 * FeiControl — 心情系统 API
 * GET  /api/personality/mood?agentId=X          获取当前心情
 * GET  /api/personality/mood/history?agentId=X  获取心情历史
 * POST /api/personality/mood                    更新心情 + 历史
 * Body: { agentId, mood, reason, trigger? }
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getMood,
  updateMood,
  getMoodHistory,
} from '@/lib/personality/repository';
import type { AgentMood } from '@/lib/personality/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    const history = request.nextUrl.searchParams.get('history');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    if (history === 'true') {
      const entries = getMoodHistory(agentId);
      return NextResponse.json({ moodHistory: entries });
    }

    const mood = getMood(agentId);
    return NextResponse.json({ mood });
  } catch (error) {
    console.error('Mood GET error:', error);
    return NextResponse.json({ error: 'Failed to get mood' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, mood, reason, trigger } = body as {
      agentId: string;
      mood: AgentMood;
      reason: string;
      trigger?: string;
    };

    if (!agentId || !mood) {
      return NextResponse.json({ error: 'Missing agentId or mood' }, { status: 400 });
    }

    const validMoods: AgentMood[] = ['happy', 'calm', 'tired', 'sad', 'confused', 'excited'];
    if (!validMoods.includes(mood)) {
      return NextResponse.json({ error: `Invalid mood: ${mood}` }, { status: 400 });
    }

    updateMood(agentId, mood, reason || '', trigger);

    return NextResponse.json({
      success: true,
      mood: getMood(agentId),
    });
  } catch (error) {
    console.error('Mood POST error:', error);
    return NextResponse.json({ error: 'Failed to update mood' }, { status: 500 });
  }
}
