/**
 * LevelBadge — Agent 等级徽章 + XP 进度条
 * Sprint 1: Growth RPG 系统
 */
'use client';

import React from 'react';
import { useI18n } from '@/i18n';

interface LevelBadgeProps {
  level: number;
  xp: number;
  xpToNext: number;
  skillPoints: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function LevelBadge({ level, xp, xpToNext, skillPoints, size = 'md' }: LevelBadgeProps) {
  const { t } = useI18n();
  const progress = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  const sizeClasses = {
    sm: { badge: 'w-8 h-8 text-xs', bar: 'h-1.5', text: 'text-[10px]' },
    md: { badge: 'w-10 h-10 text-sm', bar: 'h-2', text: 'text-xs' },
    lg: { badge: 'w-14 h-14 text-lg', bar: 'h-2.5', text: 'text-sm' },
  };

  const s = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {/* 等级徽章 */}
      <div
        className={`${s.badge} rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center font-bold text-white shadow-lg`}
        title={t('personality.level')}
      >
        {level}
      </div>

      {/* XP 进度条 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={`${s.text} text-gray-400 font-medium`}>
            {t('personality.level')} {level}
          </span>
          <span className={`${s.text} text-gray-500`}>
            XP {xp}/{xpToNext}
          </span>
        </div>
        <div className={`${s.bar} bg-gray-700 rounded-full overflow-hidden`}>
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {skillPoints > 0 && (
          <div className={`${s.text} text-amber-400 mt-0.5`}>
            ✨ {skillPoints} {t('personality.skill_points')}
          </div>
        )}
      </div>
    </div>
  );
}
