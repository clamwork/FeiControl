/**
 * FeiControl — Agent 成就 API
 * GET  /api/personality/level/achievements?agentId=X
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAchievementsWithStatus, getEventCount } from '@/lib/personality/achievement-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    const achievements = getAchievementsWithStatus(agentId);
    const eventCounts = {
      tasksCompleted: getEventCount(agentId, 'tasks_completed'),
      messagesSent: getEventCount(agentId, 'messages_sent'),
      initiativesAdopted: getEventCount(agentId, 'initiative_adopted'),
    };

    return NextResponse.json({ achievements, eventCounts });
  } catch (error) {
    console.error('Achievements GET error:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}
