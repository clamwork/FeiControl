/**
 * FeiControl — 解锁/升级技能 API
 * POST /api/personality/level/skills/unlock  body: { agentId, skillKey }
 */
import { NextRequest, NextResponse } from 'next/server';
import { applySkill, getSkills, getEffectiveStats } from '@/lib/personality/growth-engine';
import { checkAchievements } from '@/lib/personality/achievement-engine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, skillKey } = body;

    if (!agentId || !skillKey) {
      return NextResponse.json({ error: 'Missing agentId or skillKey' }, { status: 400 });
    }

    const result = applySkill(agentId, skillKey);
    if (!result.success) {
      return NextResponse.json({ error: result.message, ...result }, { status: 400 });
    }

    // 检查成就（可能触发「全能的」）
    const newAchievements = checkAchievements(agentId);

    return NextResponse.json({
      ...result,
      skills: getSkills(agentId),
      stats: getEffectiveStats(agentId),
      newAchievements,
    });
  } catch (error) {
    console.error('Skill unlock POST error:', error);
    return NextResponse.json({ error: 'Failed to unlock skill' }, { status: 500 });
  }
}
