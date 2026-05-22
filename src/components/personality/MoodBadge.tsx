"use client";

import React from 'react';

/** 心情 → Emoji + 颜色 + 中文标签映射 */
const MOOD_MAP: Record<string, { emoji: string; color: string; label: string }> = {
  happy:    { emoji: '😊', color: '#4ade80', label: '开心' },
  calm:     { emoji: '😌', color: '#60a5fa', label: '平静' },
  tired:    { emoji: '😴', color: '#a78bfa', label: '疲倦' },
  sad:      { emoji: '😢', color: '#93c5fd', label: '难过' },
  confused: { emoji: '😕', color: '#fbbf24', label: '困惑' },
  excited:  { emoji: '🎉', color: '#f472b6', label: '兴奋' },
};

interface MoodBadgeProps {
  mood?: string | null;
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export default function MoodBadge({ mood, reason, size = 'md', showTooltip = true }: MoodBadgeProps) {
  if (!mood || !MOOD_MAP[mood]) return null;

  const info = MOOD_MAP[mood];
  const sizeMap = { sm: 20, md: 28, lg: 36 };
  const px = sizeMap[size];
  const [showTip, setShowTip] = React.useState(false);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
        fontSize: px * 0.6,
        cursor: showTooltip ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      title={reason ? `${info.label}: ${reason}` : info.label}
    >
      {info.emoji}
      {showTip && showTooltip && reason && (
        <span
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 4,
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            whiteSpace: 'nowrap',
            backgroundColor: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {info.label}: {reason}
        </span>
      )}
    </span>
  );
}

/** 根据 Agent ID 获取心情（服务端调用） */
export async function fetchMood(agentId: string): Promise<{ mood: string | null; reason: string } | null> {
  try {
    const res = await fetch(`/api/personality/mood?agentId=${encodeURIComponent(agentId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.mood || null;
  } catch {
    return null;
  }
}
