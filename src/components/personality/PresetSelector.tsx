"use client";

import React from 'react';
import { useI18n } from '@/i18n';
import type { AgentPersonality } from '@/lib/personality/types';

interface PresetTemplate {
  key: string;
  emoji: string;
  personality: Partial<AgentPersonality>;
  traits: NonNullable<AgentPersonality['customTraits']>;
}

const PRESETS: PresetTemplate[] = [
  {
    key: 'efficient',
    emoji: '🔧',
    personality: { extraversion: 5, conscientiousness: 9, humor: 2, empathy: 6, creativity: 5 },
    traits: { tone: 'formal', verbosity: 'detailed', emojiUsage: 'never' },
  },
  {
    key: 'creative',
    emoji: '🎨',
    personality: { extraversion: 8, conscientiousness: 3, humor: 6, empathy: 7, creativity: 9 },
    traits: { tone: 'casual', verbosity: 'normal', emojiUsage: 'occasional' },
  },
  {
    key: 'caring',
    emoji: '💝',
    personality: { extraversion: 6, conscientiousness: 7, humor: 5, empathy: 9, creativity: 4 },
    traits: { tone: 'warm', verbosity: 'normal', emojiUsage: 'frequent' },
  },
  {
    key: 'data_expert',
    emoji: '📊',
    personality: { extraversion: 3, conscientiousness: 10, humor: 1, empathy: 4, creativity: 5 },
    traits: { tone: 'formal', verbosity: 'detailed', emojiUsage: 'never' },
  },
  {
    key: 'humorous',
    emoji: '😄',
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
  const { t } = useI18n();

  const handleApply = (preset: PresetTemplate) => {
    setApplying(preset.key);
    onApply({
      ...preset.personality,
      customTraits: preset.traits,
    });
    setTimeout(() => setApplying(null), 600);
  };

  return (
    <div>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
        🎯 {t('personality.presets_title')}
      </h4>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        {t('personality.preset_hint')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRESETS.map((preset) => {
          const isActive = applying === preset.key;
          return (
            <button
              key={preset.key}
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
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t(`personality.preset_names.${preset.key}`)}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{t(`personality.preset_descs.${preset.key}`)}</div>
              </div>
              <span style={{ fontSize: 11, opacity: 0.6, whiteSpace: 'nowrap' }}>
                {isActive ? '✓ ' + t('personality.applied') : t('personality.apply')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
