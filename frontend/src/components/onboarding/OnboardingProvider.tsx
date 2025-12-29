import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "contentrss_onboarding_completed";

interface OnboardingContextType {
    isCompleted: boolean;
    showOnboarding: boolean;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within OnboardingProvider");
    }
    return context;
}

interface OnboardingProviderProps {
    children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
    const [isCompleted, setIsCompleted] = useState(true); // 默认 true 避免闪烁
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY) === "true";
        setIsCompleted(completed);
        setIsInitialized(true);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsCompleted(true);
    };

    const resetOnboarding = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsCompleted(false);
    };

    // 只有在初始化完成后且未完成引导时才显示
    const showOnboarding = isInitialized && !isCompleted;

    return (
        <OnboardingContext.Provider
            value={{
                isCompleted,
                showOnboarding,
                completeOnboarding,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}
