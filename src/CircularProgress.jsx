import React from 'react';

const RADIUS = 20;
const STROKE = 6;
const SIZE = 46;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularProgress({ value, color = '#8be9fd' }) {
    const progress = (Math.min(Math.max(value, 0), 100) / 100) * CIRCUMFERENCE;
    return (
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
            {/* background — full circle */}
            <circle
                cx={CENTER} cy={CENTER} r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={STROKE}
                opacity="0.25"
            />
            {/* progress — starts at 12 o'clock, goes clockwise */}
            <circle
                cx={CENTER} cy={CENTER} r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${progress} ${CIRCUMFERENCE - progress}`}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
        </svg>
    );
}
