/**
 * GrowthHistory — Agent 成长记录时间线
 * Sprint 1: Growth RPG 系统
 */
'use client';

import React from 'react';
import { useI18n } from '@/i18n';

export interface GrowthEvent {
  type: 'level_up' | 'skill_unlock' | 'achievement';
  label: string;
  description: string;
  timestamp: string;
}

interface GrowthHistoryProps {
  events: GrowthEvent[];
}

const EVENT_ICONS: Record<string, string> = {
  level_up: '⬆️',
  skill_unlock: '🔓',
  achievement: '🏆',
};

export default function GrowthHistory({ events }: GrowthHistoryProps) {
  const { t } = useI18n();

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {t('personality.no_growth_history')}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 时间线竖线 */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={i} className="relative flex items-start gap-4 pl-10">
            {/* 时间线节点 */}
            <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-gray-600 border-2 border-gray-800 z-10" />

            {/* 图标 */}
            <div className="text-lg mt-0.5">{EVENT_ICONS[event.type] ?? '📌'}</div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-200">{event.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{event.description}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
