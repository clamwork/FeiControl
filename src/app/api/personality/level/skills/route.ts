/**
 * FeiControl — Agent 技能树 API
 * GET  /api/personality/level/skills?agentId=X
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSkills, initSkills, getEffectiveStats } from '@/lib/personality/growth-engine';
import { SKILL_DEFINITIONS } from '@/lib/personality/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    initSkills(agentId);
    const skills = getSkills(agentId);
    const stats = getEffectiveStats(agentId);

    // 组装成带元数据的完整技能树
    const skillTree = SKILL_DEFINITIONS.map(def => {
      const agentSkill = skills.find(s => s.skillKey === def.key);
      return {
        ...def,
        currentLevel: agentSkill?.level ?? 0,
        unlockedAt: agentSkill?.unlockedAt ?? null,
      };
    });

    return NextResponse.json({ skills: skillTree, stats });
  } catch (error) {
    console.error('Skills GET error:', error);
    return NextResponse.json({ error: 'Failed to get skills' }, { status: 500 });
  }
}
