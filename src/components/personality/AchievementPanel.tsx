/**
 * AchievementPanel — Agent 成就列表
 * Sprint 1: Growth RPG 系统
 */
'use client';

import React from 'react';
import { useI18n } from '@/i18n';

export interface AchievementData {
  key: string;
  name: string;
  description: string;
  condition: string;
  reward: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface EventCounts {
  tasksCompleted: number;
  messagesSent: number;
  initiativesAdopted: number;
}

interface AchievementPanelProps {
  achievements: AchievementData[];
  eventCounts: EventCounts;
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_task: '🏆',
  hundred_tasks: '🏆',
  thousand_messages: '🏆',
  level_five: '🏆',
  all_skills: '🏆',
  happy_day: '🏆',
  innovator: '🏆',
  champion: '🏆',
};

export default function AchievementPanel({ achievements, eventCounts }: AchievementPanelProps) {
  const { t } = useI18n();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-4">
      {/* 进度总览 */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
        <span className="text-sm text-gray-300">
          🏆 {t('personality.achievements')}
        </span>
        <span className="text-sm font-mono text-amber-400">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      {/* 事件计数 */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-800/30 rounded-lg p-2">
          <div className="text-lg font-bold text-cyan-400">{eventCounts.tasksCompleted}</div>
          <div className="text-[10px] text-gray-500">{t('personality.tasks_done')}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-2">
          <div className="text-lg font-bold text-amber-400">{eventCounts.messagesSent}</div>
          <div className="text-[10px] text-gray-500">{t('personality.messages_sent')}</div>
        </div>
        <div className="bg-gray-800/30 rounded-lg p-2">
          <div className="text-lg font-bold text-rose-400">{eventCounts.initiativesAdopted}</div>
          <div className="text-[10px] text-gray-500">{t('personality.adopted')}</div>
        </div>
      </div>

      {/* 成就列表 */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {achievements.map(a => (
          <div
            key={a.key}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
              a.unlocked
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-gray-700 bg-gray-800/30 opacity-60'
            }`}
          >
            <div className="text-xl mt-0.5">{ACHIEVEMENT_ICONS[a.key] ?? '🏆'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${a.unlocked ? 'text-amber-300' : 'text-gray-400'}`}>
                  {a.name}
                </span>
                {a.unlocked && a.unlockedAt && (
                  <span className="text-[10px] text-gray-500">
                    {new Date(a.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{a.description}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{a.reward}</div>
            </div>
            {a.unlocked && (
              <div className="text-amber-400 text-sm">✅</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
