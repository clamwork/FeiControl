/**
 * FeiControl — 主动发起设置 API
 * GET  /api/personality/initiative?agentId=X  获取设置
 * PUT  /api/personality/initiative            更新设置
 */
import { NextRequest, NextResponse } from 'next/server';
import { getInitiativeSettings, upsertInitiativeSettings } from '@/lib/personality/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    const settings = getInitiativeSettings(agentId);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Initiative GET error:', error);
    return NextResponse.json({ error: 'Failed to get initiative settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, enabled, frequency } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }

    upsertInitiativeSettings({ agentId, enabled: !!enabled, frequency: frequency || 'low' });
    return NextResponse.json({
      success: true,
      settings: getInitiativeSettings(agentId),
    });
  } catch (error) {
    console.error('Initiative PUT error:', error);
    return NextResponse.json({ error: 'Failed to update initiative settings' }, { status: 500 });
  }
}
