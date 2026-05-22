"use client";

import React from 'react';
import type { AgentPersonality } from '@/lib/personality/types';

interface PresetTemplate {
  name: string;
  emoji: string;
  description: string;
  personality: Partial<AgentPersonality>;
  traits: NonNullable<AgentPersonality['customTraits']>;
}

const PRESETS: PresetTemplate[] = [
  {
    name: '高效助手',
    emoji: '🔧',
    description: '严谨、专业、结构化输出，适合数据分析和技术任务',
    personality: { extraversion: 5, conscientiousness: 9, humor: 2, empathy: 6, creativity: 5 },
    traits: { tone: 'formal', verbosity: 'detailed', emojiUsage: 'never' },
  },
  {
    name: '创意伙伴',
    emoji: '🎨',
    description: '开放、热情、思维活跃，适合头脑风暴和创意写作',
    personality: { extraversion: 8, conscientiousness: 3, humor: 6, empathy: 7, creativity: 9 },
    traits: { tone: 'casual', verbosity: 'normal', emojiUsage: 'occasional' },
  },
  {
    name: '贴心管家',
    emoji: '💝',
    description: '温暖、耐心、有同理心，适合客服和日常陪伴',
    personality: { extraversion: 6, conscientiousness: 7, humor: 5, empathy: 9, creativity: 4 },
    traits: { tone: 'warm', verbosity: 'normal', emojiUsage: 'frequent' },
  },
  {
    name: '数据专家',
    emoji: '📊',
    description: '严谨、冷静、精确，适合数据分析和报告生成',
    personality: { extraversion: 3, conscientiousness: 10, humor: 1, empathy: 4, creativity: 5 },
    traits: { tone: 'formal', verbosity: 'detailed', emojiUsage: 'never' },
  },
  {
    name: '幽默陪聊',
    emoji: '😄',
    description: '搞笑、活泼、轻松，适合日常闲聊和娱乐互动',
    personality: { extraversion: 9, conscientiousness: 2, humor: 10, empathy: 6, creativity: 8 },
    traits: { tone: 'casual', verbosity: 'brief', emojiUsage: 'frequent' },
  },
];

interface PresetSelectorProps {
  currentPersonality: AgentPersonality;
  onApply: (personality: Partial<AgentPersonality> & { customTraits?: AgentPersonality['customTraits'] }) => void;
}

export default function PresetSelector({ currentPersonality, onApply }: PresetSelectorProps) {
  const [applying, setApplying] = React.useState<string | null>(null);

  const handleApply = (preset: PresetTemplate) => {
    setApplying(preset.name);
    onApply({
      ...preset.personality,
      customTraits: preset.traits,
    });
    setTimeout(() => setApplying(null), 600);
  };

  return (
    <div>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
        🎯 预设模板
      </h4>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        一键应用预设性格组合，之后再手动微调每个维度
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRESETS.map((preset) => {
          const isActive = applying === preset.name;
          return (
            <button
              key={preset.name}
              onClick={() => handleApply(preset)}
              disabled={!!applying}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                textAlign: 'left',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                backgroundColor: isActive ? 'var(--accent)' : 'var(--surface)',
                color: isActive ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: applying && !isActive ? 0.5 : 1,
              }}
            >
              <span style={{ fontSize: 24 }}>{preset.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{preset.name}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{preset.description}</div>
              </div>
              <span style={{ fontSize: 11, opacity: 0.6, whiteSpace: 'nowrap' }}>
                {isActive ? '✓ 已应用' : '应用'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
