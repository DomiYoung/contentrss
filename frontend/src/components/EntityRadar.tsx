import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { EntityRadarData } from '@/lib/api';

interface EntityRadarProps {
    data: EntityRadarData;
    size?: number;
}

const DIMENSIONS = [
    { key: 'sentiment', label: '情绪' },
    { key: 'volume', label: '热度' },
    { key: 'momentum', label: '动能' },
    { key: 'volatility', label: '波动' },
    { key: 'scope', label: '覆盖' },
] as const;

export function EntityRadar({ data, size = 300 }: EntityRadarProps) {
    const center = size / 2;
    const radius = (size / 2) * 0.8;

    // 计算背景网格圈
    const grids = [0.2, 0.4, 0.6, 0.8, 1.0];

    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / DIMENSIONS.length - Math.PI / 2;
        const x = center + radius * (value / 100) * Math.cos(angle);
        const y = center + radius * (value / 100) * Math.sin(angle);
        return { x, y };
    };

    const radarPath = useMemo(() => {
        return DIMENSIONS.map((dim, i) => {
            const { x, y } = getPoint(i, data.dimensions[dim.key]);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';
    }, [data, center, radius]);

    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* 背景网格 */}
                {grids.map((g, i) => (
                    <polygon
                        key={i}
                        points={DIMENSIONS.map((_, idx) => {
                            const p = getPoint(idx, g * 100);
                            return `${p.x},${p.y}`;
                        }).join(' ')}
                        className="fill-none stroke-zinc-100 dark:stroke-white/5"
                        strokeWidth="1"
                    />
                ))}

                {/* 轴线 */}
                {DIMENSIONS.map((_, i) => {
                    const p = getPoint(i, 100);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            className="stroke-zinc-100 dark:stroke-white/5"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* 数据区域 */}
                <motion.path
                    d={radarPath}
                    initial={false}
                    animate={{ d: radarPath }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    className="fill-blue-500/20 stroke-blue-500"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />

                {/* 顶点数据圆点 */}
                {DIMENSIONS.map((dim, i) => {
                    const p = getPoint(i, data.dimensions[dim.key]);
                    return (
                        <motion.circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            initial={false}
                            animate={{ cx: p.x, cy: p.y }}
                            className="fill-white stroke-blue-500"
                            strokeWidth="2"
                        />
                    );
                })}

                {/* 标签 */}
                {DIMENSIONS.map((dim, i) => {
                    const p = getPoint(i, 115);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] font-black fill-zinc-400 uppercase tracking-widest"
                        >
                            {dim.label}
                        </text>
                    );
                })}
            </svg>

            {/* 中心名称 */}
            <div className="mt-4 text-center">
                <h4 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                    {data.name}
                </h4>
                <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    ENTITY PROFILE
                </p>
            </div>
        </div>
    );
}
