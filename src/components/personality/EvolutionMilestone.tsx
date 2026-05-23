/**
 * EvolutionMilestone — Agent 进化里程碑动画弹窗
 * Sprint 1: Evolution RPG 系统
 *
 * 特征:
 * - CSS 粒子爆发特效
 * - 里程碑名称 / 称号展示
 * - 视觉效果预览文字
 * - "继续"按钮
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import type { EvolutionMilestone as MilestoneType } from '@/lib/personality/types';

interface EvolutionMilestoneProps {
  milestone: MilestoneType;
  agentName?: string;
  onDismiss: () => void;
}

const MILESTONE_COLORS: Record<number, { primary: string; glow: string; bg: string; particles: string[] }> = {
  10: { primary: '#c0c0c0', glow: 'rgba(192,192,192,0.6)', bg: 'rgba(192,192,192,0.08)', particles: ['#c0c0c0', '#e8e8e8', '#ffffff'] },
  20: { primary: '#ffd700', glow: 'rgba(255,215,0,0.6)', bg: 'rgba(255,215,0,0.08)', particles: ['#ffd700', '#ffec80', '#fff8d0'] },
  30: { primary: '#00e5ff', glow: 'rgba(0,229,255,0.6)', bg: 'rgba(0,229,255,0.08)', particles: ['#00e5ff', '#80f0ff', '#b8f8ff'] },
  40: { primary: '#b388ff', glow: 'rgba(179,136,255,0.6)', bg: 'rgba(179,136,255,0.08)', particles: ['#b388ff', '#d4bfff', '#efe0ff'] },
  50: { primary: '#ff6ec7', glow: 'rgba(255,110,199,0.6)', bg: 'rgba(255,110,199,0.08)', particles: ['#ff6ec7', '#ffa8da', '#ffd6ee'] },
};

const MILESTONE_ICONS: Record<number, string> = {
  10: '🌱',
  20: '🌟',
  30: '⚡',
  40: '🦋',
  50: '👑',
};

export default function EvolutionMilestone({ milestone, agentName, onDismiss }: EvolutionMilestoneProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const colors = MILESTONE_COLORS[milestone.threshold] ?? MILESTONE_COLORS[10];
  const icon = MILESTONE_ICONS[milestone.threshold] ?? '⭐';

  // 粒子列表（静态生成）
  const particles = React.useMemo(() => {
    const items: Array<{ id: number; x: number; y: number; color: string; size: number; delay: number; duration: number; driftX: number }> = [];
    for (let i = 0; i < 40; i++) {
      const colorSet = colors.particles;
      items.push({
        id: i,
        x: Math.random() * 100,
        y: 50 + Math.random() * 50,
        color: colorSet[Math.floor(Math.random() * colorSet.length)],
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 1.5,
        driftX: (Math.random() - 0.5) * 60,
      });
    }
    return items;
  }, [colors]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(onDismiss, 300);
  };

  if (dismissed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        transition: 'background-color 0.4s ease',
        overflow: 'hidden',
      }}
    >
      {/* 粒子容器 */}
      {visible && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                opacity: 0,
                animation: `evolution-particle-burst ${p.duration}s ease-out ${p.delay}s forwards`,
                transform: `translateX(${p.driftX}px)`,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              }}
            />
          ))}
        </div>
      )}

      {/* 弹窗卡片 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 380,
          width: '90%',
          padding: '32px 24px 24px',
          borderRadius: 20,
          backgroundColor: colors.bg,
          border: `1px solid ${colors.primary}44`,
          backdropFilter: 'blur(20px)',
          textAlign: 'center',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(40px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: `0 0 60px ${colors.glow}`,
        }}
      >
        {/* 图标光环 */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            backgroundColor: `${colors.primary}22`,
            border: `2px solid ${colors.primary}66`,
            boxShadow: `0 0 30px ${colors.glow}`,
            animation: visible ? 'evolution-pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {icon}
        </div>

        {/* 等级徽章 */}
        <div
          style={{
            display: 'inline-block',
            padding: '2px 12px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
            color: colors.primary,
            backgroundColor: `${colors.primary}22`,
            marginBottom: 8,
          }}
        >
          Lv.{milestone.threshold}
        </div>

        {/* 标题 */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: colors.primary,
            margin: '4px 0 2px',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {milestone.name}
        </h2>

        {/* 称号 */}
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            margin: '0 0 16px',
          }}
        >
          {t('personality.evolution_title')}: <strong style={{ color: colors.primary }}>{milestone.title}</strong>
        </p>

        {/* 解锁效果列表 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginBottom: 20,
            padding: '12px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('personality.evolution_unlock')}
          </div>
          {milestone.effects.map((effect, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: 'var(--text-primary)',
                animation: visible ? `evolution-slide-in 0.4s ease ${0.3 + i * 0.15}s both` : 'none',
              }}
            >
              <span style={{ color: colors.primary }}>✦</span>
              {effect}
            </div>
          ))}
        </div>

        {/* 继续按钮 */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            backgroundColor: colors.primary,
            color: '#000',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; }}
          onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {t('common.continue') || '继续'}
        </button>
      </div>

      {/* CSS 动画 - 用 style 标签注入 */}
      <style>{`
        @keyframes evolution-particle-burst {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-200px) scale(0.3); }
        }
        @keyframes evolution-pulse {
          0%, 100% { box-shadow: 0 0 30px ${colors.glow}; }
          50% { box-shadow: 0 0 60px ${colors.primary}88; }
        }
        @keyframes evolution-slide-in {
          0% { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
