/**
 * FeiControl — 性格推断 API
 * POST /api/personality/infer
 * Body: { agentId: string, conversations: Array<{role, content}> }
 */
import { NextRequest, NextResponse } from 'next/server';
import { inferPersonality } from '@/lib/personality/prompt-builder';
import { saveInferredResult } from '@/lib/personality/repository';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, conversations } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agentId' }, { status: 400 });
    }
    if (!Array.isArray(conversations) || conversations.length === 0) {
      return NextResponse.json({ error: 'Missing or empty conversations array' }, { status: 400 });
    }

    const result = inferPersonality({ conversations });
    saveInferredResult(agentId, result);

    return NextResponse.json({
      success: true,
      agentId,
      result,
    });
  } catch (error) {
    console.error('Personality infer error:', error);
    return NextResponse.json({ error: 'Failed to infer personality' }, { status: 500 });
  }
}
