"use client";

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import DimensionSlider from './DimensionSlider';
import PresetSelector from './PresetSelector';
import MoodBadge from './MoodBadge';
import type { AgentPersonality, AgentMood } from '@/lib/personality/types';
import type { MoodEntry } from '@/lib/personality/types';
import { inferPersonality } from '@/lib/personality/prompt-builder';

interface PersonalityTabProps {
  agentId: string;
  agentName?: string;
}

const VERBOSITY_OPTIONS = [
  { value: 'brief' },
  { value: 'normal' },
  { value: 'detailed' },
] as const;

const TONE_OPTIONS = [
  { value: 'formal' },
  { value: 'casual' },
  { value: 'warm' },
] as const;

const EMOJI_OPTIONS = [
  { value: 'never' },
  { value: 'occasional' },
  { value: 'frequent' },
] as const;

const DIMENSIONS = ['extraversion', 'conscientiousness', 'humor', 'empathy', 'creativity'] as const;

const DIMENSION_META: Record<string, { left: string; right: string }> = {
  extraversion: { left: 'introvert', right: 'extravert' },
  conscientiousness: { left: 'casual', right: 'rigorous' },
  humor: { left: 'serious', right: 'humorous' },
  empathy: { left: 'direct', right: 'warm' },
  creativity: { left: 'conventional', right: 'innovative' },
};

export default function PersonalityTab({ agentId, agentName }: PersonalityTabProps) {
  const { t } = useI18n();
  const [personality, setPersonality] = useState<AgentPersonality | null>(null);
  const [mood, setMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'presets' | 'mood'>('edit');

  // 加载性格
  useEffect(() => {
    Promise.all([
      fetch(`/api/personality?agentId=${encodeURIComponent(agentId)}`),
      fetch(`/api/personality/mood?agentId=${encodeURIComponent(agentId)}`),
    ]).then(async ([pRes, mRes]) => {
      if (pRes.ok) {
        const data = await pRes.json();
        setPersonality(data.personality);
      }
      if (mRes.ok) {
        const data = await mRes.json();
        setMood(data.mood);
      }
    }).finally(() => setLoading(false));
  }, [agentId]);

  const updateDimension = (key: keyof AgentPersonality, value: number) => {
    if (!personality) return;
    setPersonality({ ...personality, [key]: value });
  };

  const updateTrait = <K extends keyof NonNullable<AgentPersonality['customTraits']>>(
    key: K,
    value: NonNullable<AgentPersonality['customTraits']>[K]
  ) => {
    if (!personality) return;
    setPersonality({
      ...personality,
      customTraits: { ...personality.customTraits, [key]: value },
    });
  };

  const handleSave = async () => {
    if (!personality) return;
    setSaving(true);
    try {
      const res = await fetch('/api/personality', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personality),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = (partial: Partial<AgentPersonality> & { customTraits?: AgentPersonality['customTraits'] }) => {
    if (!personality) return;
    setPersonality({ ...personality, ...partial });
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        {t('personality.loading')}
      </div>
    );
  }

  if (!personality) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        {t('personality.cannot_load')}
      </div>
    );
  }

  const tabs = [
    { key: 'edit', label: t('personality.edit_title') },
    { key: 'presets', label: t('personality.presets_title') },
    { key: 'mood', label: t('personality.mood_title') },
  ] as const;

  return (
    <div style={{ padding: 4 }}>
      {/* 当前心情行 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '8px 12px',
          borderRadius: 8,
          backgroundColor: 'var(--surface-elevated)',
          fontSize: 12,
          color: 'var(--text-secondary)',
        }}
      >
        <span>😀 {t('personality.current_mood')}:</span>
        <MoodBadge mood={mood?.mood} reason={mood?.reason} size="md" />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          {t('personality.last_updated')}: {mood?.updatedAt ? new Date(mood.updatedAt).toLocaleString() : '-'}
        </span>
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 400,
              border: 'none',
              backgroundColor: activeTab === tab.key ? 'var(--accent)' : 'var(--surface-elevated)',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 编辑 Tab */}
      {activeTab === 'edit' && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            {t('personality.adjust_hint', { name: agentName || agentId })}
          </p>

          {DIMENSIONS.map((key) => {
            const meta = DIMENSION_META[key];
            return (
              <div key={key}>
                <DimensionSlider
                  label={t(`personality.dimensions.${key}`)}
                  value={personality[key]}
                  onChange={(v) => updateDimension(key, v)}
                  leftLabel={t(`personality.dimension_left.${meta.left}`)}
                  rightLabel={t(`personality.dimension_right.${meta.right}`)}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -10, marginBottom: 12, paddingLeft: 2 }}>
                  {t(`personality.dimension_descs.${key}`)}
                </p>
              </div>
            );
          })}

          {/* 说话风格 */}
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 20, marginBottom: 12 }}>
            🎙️ {t('personality.speaking_style')}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* 语气 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {t('personality.tone')}
              </label>
              <select
                value={personality.customTraits?.tone || ''}
                onChange={(e) => {
                  const v = e.target.value as '' | 'formal' | 'casual' | 'warm';
                  updateTrait('tone', v || undefined);
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="">{t('personality.default_option')}</option>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(`personality.tone_options.${o.value}`)}</option>
                ))}
              </select>
            </div>

            {/* 回复长度 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {t('personality.verbosity')}
              </label>
              <select
                value={personality.customTraits?.verbosity || ''}
                onChange={(e) => {
                  const v = e.target.value as '' | 'brief' | 'normal' | 'detailed';
                  updateTrait('verbosity', v || undefined);
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="">{t('personality.default_option')}</option>
                {VERBOSITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(`personality.verbosity_options.${o.value}`)}</option>
                ))}
              </select>
            </div>

            {/* Emoji 使用 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                {t('personality.emoji_usage')}
              </label>
              <select
                value={personality.customTraits?.emojiUsage || ''}
                onChange={(e) => {
                  const v = e.target.value as '' | 'never' | 'occasional' | 'frequent';
                  updateTrait('emojiUsage', v || undefined);
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                }}
              >
                <option value="">{t('personality.default_option')}</option>
                {EMOJI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(`personality.emoji_options.${o.value}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              backgroundColor: saved ? 'var(--positive)' : 'var(--accent)',
              color: 'white',
              cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {saving ? t('personality.saving') : saved ? t('personality.saved') : t('personality.save')}
          </button>
        </div>
      )}

      {/* 预设 Tab */}
      {activeTab === 'presets' && (
        <PresetSelector
          currentPersonality={personality}
          onApply={handleApplyPreset}
        />
      )}

      {/* 心情 Tab */}
      {activeTab === 'mood' && (
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            📊 {t('personality.mood_detail')}
          </h4>

          {mood ? (
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                backgroundColor: 'var(--surface-elevated)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <MoodBadge mood={mood.mood} size="lg" showTooltip={false} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {t(`personality.mood_states.${mood.mood}`)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {mood.reason}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {t('personality.updated_at', { time: new Date(mood.updatedAt).toLocaleString() })}
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {t('personality.no_mood_data')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
