/**
 * FeiControl — 增加经验 API
 * POST /api/personality/level/xp  body: { agentId, amount, reason }
 */
import { NextRequest, NextResponse } from 'next/server';
import { addXp, getLevel } from '@/lib/personality/growth-engine';
import { checkAchievements } from '@/lib/personality/achievement-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, amount, reason } = body;

    if (!agentId || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Missing agentId or amount' }, { status: 400 });
    }

    const result = addXp(agentId, amount, reason ?? 'general');

    // 检查是否触发新成就
    const newAchievements = checkAchievements(agentId);

    return NextResponse.json({
      ...result,
      newAchievements,
      level: getLevel(agentId),
    });
  } catch (error) {
    console.error('XP POST error:', error);
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 });
  }
}
