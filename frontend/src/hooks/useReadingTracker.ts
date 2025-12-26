/**
 * 阅读时间追踪 Hook
 * 追踪用户在文章详情页的实际阅读时长
 */

import { useEffect, useRef, useCallback } from 'react';

// 获取或生成设备 ID
const getDeviceId = (): string => {
    const key = 'contentrss_device_id';
    let deviceId = localStorage.getItem(key);

    if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem(key, deviceId);
    }

    return deviceId;
};

// 格式化阅读时长
export const formatReadingDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
        return remainingSeconds > 0 ? `${minutes} 分 ${remainingSeconds} 秒` : `${minutes} 分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} 小时 ${remainingMinutes} 分钟`;
};

interface UseReadingTrackerOptions {
    articleId: string;
    onComplete?: () => void;
}

export function useReadingTracker({ articleId, onComplete }: UseReadingTrackerOptions) {
    const startTimeRef = useRef<number>(Date.now());
    const accumulatedTimeRef = useRef<number>(0);
    const isActiveRef = useRef<boolean>(true);
    const hasSavedRef = useRef<boolean>(false);

    // 保存阅读记录
    const saveReadingRecord = useCallback(async (completed: boolean = false) => {
        if (hasSavedRef.current) return;

        const now = Date.now();
        const currentSession = isActiveRef.current ? (now - startTimeRef.current) / 1000 : 0;
        const totalSeconds = Math.round(accumulatedTimeRef.current + currentSession);

        if (totalSeconds < 3) return; // 少于3秒不记录

        hasSavedRef.current = true;

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';
            await fetch(`${apiBase}/api/reading-record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    article_id: articleId,
                    device_id: getDeviceId(),
                    duration_seconds: totalSeconds,
                    completed
                })
            });

            if (completed && onComplete) {
                onComplete();
            }
        } catch (error) {
            console.warn('Failed to save reading record:', error);
            hasSavedRef.current = false; // 允许重试
        }
    }, [articleId, onComplete]);

    useEffect(() => {
        // 重置状态
        startTimeRef.current = Date.now();
        accumulatedTimeRef.current = 0;
        isActiveRef.current = true;
        hasSavedRef.current = false;

        // 页面可见性变化处理
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // 切后台，累计当前阅读时间
                if (isActiveRef.current) {
                    accumulatedTimeRef.current += (Date.now() - startTimeRef.current) / 1000;
                    isActiveRef.current = false;
                }
            } else {
                // 回到前台，重新开始计时
                startTimeRef.current = Date.now();
                isActiveRef.current = true;
            }
        };

        // 页面关闭/离开处理
        const handleBeforeUnload = () => {
            saveReadingRecord(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // 组件卸载时保存记录
            saveReadingRecord(false);
        };
    }, [articleId, saveReadingRecord]);

    // 手动标记完成阅读
    const markCompleted = useCallback(() => {
        saveReadingRecord(true);
    }, [saveReadingRecord]);

    // 获取当前阅读时长
    const getCurrentDuration = useCallback((): number => {
        const currentSession = isActiveRef.current ? (Date.now() - startTimeRef.current) / 1000 : 0;
        return Math.round(accumulatedTimeRef.current + currentSession);
    }, []);

    return {
        deviceId: getDeviceId(),
        markCompleted,
        getCurrentDuration,
        formatDuration: formatReadingDuration
    };
}

// 导出设备 ID 获取函数
export { getDeviceId };
