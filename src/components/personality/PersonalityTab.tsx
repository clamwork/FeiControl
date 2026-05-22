"use client";

import React, { useEffect, useState } from 'react';
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
  { value: 'brief', label: '简洁' },
  { value: 'normal', label: '适中' },
  { value: 'detailed', label: '详细' },
] as const;

const TONE_OPTIONS = [
  { value: 'formal', label: '正式' },
  { value: 'casual', label: '随意' },
  { value: 'warm', label: '温暖' },
] as const;

const EMOJI_OPTIONS = [
  { value: 'never', label: '不用 emoji' },
  { value: 'occasional', label: '偶尔使用' },
  { value: 'frequent', label: '经常使用' },
] as const;

const DIMENSION_INFO: Record<string, { label: string; left: string; right: string; desc: string }> = {
  extraversion: {
    label: '外向性',
    left: '内向',
    right: '外向',
    desc: '话多主动 vs 话少被动；外向的 Agent 会主动推荐功能、主动交流',
  },
  conscientiousness: {
    label: '严谨性',
    left: '随性',
    right: '严谨',
    desc: '结构化输出、注意细节、严谨流程 vs 自由发挥、不拘小节',
  },
  humor: {
    label: '幽默感',
    left: '严肃',
    right: '幽默',
    desc: '使用俏皮话、表情、趣味表达 vs 板正认真的回答',
  },
  empathy: {
    label: '同理心',
    left: '直白',
    right: '温暖',
    desc: '先理解感受再回答、表达关心 vs 直接给答案',
  },
  creativity: {
    label: '创造力',
    left: '保守',
    right: '创新',
    desc: '提供新颖的想法、多样的解决方案 vs 按部就班',
  },
};

export default function PersonalityTab({ agentId, agentName }: PersonalityTabProps) {
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
        加载中...
      </div>
    );
  }

  if (!personality) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
        无法加载性格配置
      </div>
    );
  }

  const tabs = [
    { key: 'edit', label: '性格编辑' },
    { key: 'presets', label: '预设模板' },
    { key: 'mood', label: '心情状态' },
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
        <span>😀 当前心情:</span>
        <MoodBadge mood={mood?.mood} reason={mood?.reason} size="md" />
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          最后更新: {mood?.updatedAt ? new Date(mood.updatedAt).toLocaleString('zh-CN') : '暂无'}
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
            调整下方的维度滑块来改变 {agentName || agentId} 的性格特质。
            每个维度从 1（低）到 10（高）。
          </p>

          {(['extraversion', 'conscientiousness', 'humor', 'empathy', 'creativity'] as const).map((key) => {
            const info = DIMENSION_INFO[key];
            return (
              <div key={key}>
                <DimensionSlider
                  label={info.label}
                  value={personality[key]}
                  onChange={(v) => updateDimension(key, v)}
                  leftLabel={info.left}
                  rightLabel={info.right}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -10, marginBottom: 12, paddingLeft: 2 }}>
                  {info.desc}
                </p>
              </div>
            );
          })}

          {/* 说话风格 */}
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 20, marginBottom: 12 }}>
            🎙️ 说话风格
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* 语气 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                语气
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
                <option value="">默认</option>
                {TONE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* 回复长度 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                回复长度
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
                <option value="">默认</option>
                {VERBOSITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Emoji 使用 */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Emoji 使用
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
                <option value="">默认</option>
                {EMOJI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
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
            {saving ? '保存中...' : saved ? '✓ 已保存' : '保存性格配置'}
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
            📊 心情详情
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
                    {mood.mood}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {mood.reason}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                更新于: {new Date(mood.updatedAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              暂无心情数据 — Agent 完成第一个任务后将自动生成
            </div>
          )}
        </div>
      )}
    </div>
  );
}
