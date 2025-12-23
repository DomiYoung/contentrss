/**
 * Haptic Feedback Utility
 * Follows Apple HIG principles for tactile feedback.
 */

type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export const triggerHaptic = (type: HapticType = "light") => {
    if (!window.navigator || !window.navigator.vibrate) return;

    const patterns: Record<HapticType, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 50,
        success: [10, 30, 10],
        warning: [20, 50, 20],
        error: [50, 100, 50, 100],
    };

    try {
        window.navigator.vibrate(patterns[type]);
    } catch (e) {
        // Silently fail if vibrate is not supported or blocked
    }
};
