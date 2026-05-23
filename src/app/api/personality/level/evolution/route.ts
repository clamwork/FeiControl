/**
 * FeiControl — Agent 进化里程碑 API
 * GET  /api/personality/level/evolution?agentId=X  获取里程碑状态
 * POST /api/personality/level/evolution             检查并解锁里程碑
 *   body: { agentId, currentLevel }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMilestonesWithStatus, checkEvolutionMilestones } from '@/lib/personality/evolution-engine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    const milestones = getMilestonesWithStatus(agentId);
    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Evolution GET error:', error);
    return NextResponse.json({ error: 'Failed to get evolution milestones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, currentLevel } = body;

    if (!agentId || typeof currentLevel !== 'number') {
      return NextResponse.json({ error: 'Missing agentId or currentLevel' }, { status: 400 });
    }

    const unlocked = checkEvolutionMilestones(agentId, currentLevel);
    return NextResponse.json({
      unlocked,
      milestones: getMilestonesWithStatus(agentId),
    });
  } catch (error) {
    console.error('Evolution POST error:', error);
    return NextResponse.json({ error: 'Failed to check evolution milestones' }, { status: 500 });
  }
}
