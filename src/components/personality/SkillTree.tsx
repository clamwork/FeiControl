/**
 * SkillTree — Agent 技能树面板
 * Sprint 1: Growth RPG 系统
 */
'use client';

import React, { useState } from 'react';
import { useI18n } from '@/i18n';

export interface SkillData {
  key: string;
  tree: 'efficiency' | 'creativity' | 'social' | 'learning';
  name: string;
  description: string;
  effectPerLevel: string;
  costPerLevel: number;
  maxLevel: number;
  currentLevel: number;
  unlockedAt: string | null;
}

interface SkillTreeProps {
  skills: SkillData[];
  stats: {
    efficiency: number;
    creativity: number;
    social: number;
    learning: number;
    initiativeBonus: number;
    empathyBonus: number;
  };
  skillPoints: number;
  onUnlock: (skillKey: string) => Promise<void>;
  loading?: boolean;
}

const TREE_ICONS: Record<string, string> = {
  efficiency: '🔧',
  creativity: '💡',
  social: '❤️',
  learning: '🧠',
};

const TREE_COLORS: Record<string, string> = {
  efficiency: 'border-cyan-500 bg-cyan-500/10',
  creativity: 'border-amber-500 bg-amber-500/10',
  social: 'border-rose-500 bg-rose-500/10',
  learning: 'border-emerald-500 bg-emerald-500/10',
};

export default function SkillTree({ skills, stats, skillPoints, onUnlock, loading }: SkillTreeProps) {
  const { t } = useI18n();
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const grouped = skills.reduce<Record<string, SkillData[]>>((acc, s) => {
    if (!acc[s.tree]) acc[s.tree] = [];
    acc[s.tree].push(s);
    return acc;
  }, {});

  const handleUnlock = async (skillKey: string) => {
    setUnlocking(skillKey);
    try {
      await onUnlock(skillKey);
    } finally {
      setUnlocking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计面板 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">{t('personality.efficiency')}</div>
          <div className="text-lg font-bold text-cyan-400">{stats.efficiency}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">{t('personality.initiative')}</div>
          <div className="text-lg font-bold text-rose-400">+{stats.initiativeBonus}%</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-gray-400">{t('personality.empathy_boost')}</div>
          <div className="text-lg font-bold text-emerald-400">+{stats.empathyBonus}%</div>
        </div>
      </div>

      {/* 技能树 */}
      {Object.entries(grouped).map(([tree, treeSkills]) => (
        <div key={tree} className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
            <span>{TREE_ICONS[tree]}</span>
            {t(`personality.skill_tree.${tree}`)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {treeSkills.map(skill => {
              const isMaxed = skill.currentLevel >= skill.maxLevel;
              const canUnlock = skillPoints >= skill.costPerLevel && !isMaxed;
              const isUnlocking = unlocking === skill.key;

              return (
                <div
                  key={skill.key}
                  className={`border ${TREE_COLORS[skill.tree]} rounded-lg p-3 transition-all ${
                    isMaxed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="text-sm font-medium text-gray-200">{skill.name}</div>
                      <div className="text-[11px] text-gray-400">{skill.description}</div>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {Array.from({ length: skill.maxLevel }, (_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < skill.currentLevel ? 'bg-violet-400' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-2">{skill.effectPerLevel}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Lv.{skill.currentLevel}/{skill.maxLevel}
                    </span>
                    {!isMaxed && (
                      <button
                        onClick={() => handleUnlock(skill.key)}
                        disabled={!canUnlock || !!isUnlocking || loading}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                          canUnlock
                            ? 'bg-violet-600 hover:bg-violet-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        } ${isUnlocking ? 'animate-pulse' : ''}`}
                      >
                        {isUnlocking ? '...' : `↑ ${skill.costPerLevel} ${t('personality.pt')}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
