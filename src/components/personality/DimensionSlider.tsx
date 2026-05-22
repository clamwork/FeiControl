"use client";

import React from 'react';

interface DimensionSliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}

/** 性格维度滑块组件 */
export default function DimensionSlider({
  label,
  value,
  min = 1,
  max = 10,
  onChange,
  leftLabel = '',
  rightLabel = '',
}: DimensionSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* 标签行 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--accent)',
            minWidth: 24,
            textAlign: 'center',
          }}
        >
          {value}
        </span>
      </div>

      {/* 滑块轨道 */}
      <div style={{ position: 'relative', height: 28 }}>
        {/* 背景条 */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 3,
            background: `linear-gradient(to right, var(--surface-elevated) 0%, var(--accent) ${pct}%, var(--surface-elevated) ${pct}%)`,
            opacity: 0.6,
          }}
        />

        {/* 原生滑块 (透明但可交互) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 28,
            margin: 0,
            WebkitAppearance: 'none',
            appearance: 'none',
            background: 'transparent',
            cursor: 'pointer',
            outline: 'none',
          }}
          onMouseDown={(e) => {
            // Custom thumb highlight
            const el = e.currentTarget;
            el.style.filter = 'brightness(1.2)';
          }}
          onMouseUp={(e) => {
            const el = e.currentTarget;
            el.style.filter = '';
          }}
        />

        {/* 自定义滑块圆点 (覆盖) */}
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: `calc(${pct}% - 10px)`,
            width: 18,
            height: 18,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            border: '2px solid var(--card)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            transition: 'left 0.08s ease',
          }}
        />
      </div>

      {/* 两端标签 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
