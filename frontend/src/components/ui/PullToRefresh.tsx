import { useState, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { triggerHaptic } from "@/lib/haptic";

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    disabled?: boolean;
}

const PULL_THRESHOLD = 80; // 触发刷新的下拉距离
const MAX_PULL = 120; // 最大下拉距离

export function PullToRefresh({ children, onRefresh, disabled = false }: PullToRefreshProps) {
    const [refreshing, setRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const isPulling = useRef(false);

    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
    const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
    const scale = useTransform(y, [0, PULL_THRESHOLD / 2, PULL_THRESHOLD], [0.5, 0.8, 1]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled || refreshing) return;

        const container = containerRef.current;
        if (!container) return;

        // 只有在滚动到顶部时才启用下拉刷新
        if (container.scrollTop <= 0) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling.current || disabled || refreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0) {
            // 下拉时阻止默认滚动
            e.preventDefault();
            // 使用阻尼效果，拉得越远阻力越大
            const dampedDiff = Math.min(diff * 0.5, MAX_PULL);
            y.set(dampedDiff);

            // 到达阈值时触发触觉反馈
            const prevY = y.getPrevious() ?? 0;
            if (dampedDiff >= PULL_THRESHOLD && prevY < PULL_THRESHOLD) {
                triggerHaptic("medium");
            }
        }
    };

    const handleTouchEnd = async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        const currentY = y.get();

        if (currentY >= PULL_THRESHOLD && !refreshing) {
            // 触发刷新
            setRefreshing(true);
            triggerHaptic("success");

            // 保持在刷新位置
            animate(y, PULL_THRESHOLD * 0.6, { duration: 0.2 });

            try {
                await onRefresh();
            } finally {
                setRefreshing(false);
                animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
            }
        } else {
            // 未达到阈值，弹回
            animate(y, 0, { type: "spring", stiffness: 400, damping: 30 });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative h-full overflow-y-auto overscroll-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute left-0 right-0 flex items-center justify-center pointer-events-none z-10"
                style={{
                    top: 0,
                    height: y,
                    opacity,
                }}
            >
                <motion.div
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100"
                    style={{ scale }}
                >
                    <motion.div style={{ rotate: refreshing ? undefined : rotate }}>
                        <RefreshCw
                            size={20}
                            className={refreshing ? "animate-spin text-blue-600" : "text-gray-600"}
                        />
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div style={{ y }}>
                {children}
            </motion.div>
        </div>
    );
}
