import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight, Sparkles, TrendingUp, Bookmark, Zap } from "lucide-react";
import { useOnboarding } from "./OnboardingProvider";
import { triggerHaptic } from "@/lib/haptic";
import { cn } from "@/lib/utils";

interface Slide {
    id: number;
    icon: React.ReactNode;
    iconBg: string;
    gradientFrom: string;
    gradientTo: string;
    accentColor: string;
    title: string;
    subtitle: string;
    description: string;
}

const slides: Slide[] = [
    {
        id: 1,
        icon: <Sparkles size={36} className="text-blue-600" />,
        iconBg: "bg-blue-50",
        gradientFrom: "from-blue-50/80",
        gradientTo: "to-white",
        accentColor: "bg-blue-500",
        title: "行业情报中心",
        subtitle: "你的第二大脑",
        description: "AI 驱动的深度洞察，穿透信息噪音。获取专属于你的行业简报。",
    },
    {
        id: 2,
        icon: <TrendingUp size={36} className="text-amber-600" />,
        iconBg: "bg-amber-50",
        gradientFrom: "from-amber-50/80",
        gradientTo: "to-white",
        accentColor: "bg-amber-500",
        title: "晨间简报",
        subtitle: "智慧启程",
        description: "每天醒来即获精选情报。左滑忽略，右滑收藏，轻松管理。",
    },
    {
        id: 3,
        icon: <Bookmark size={36} className="text-emerald-600" />,
        iconBg: "bg-emerald-50",
        gradientFrom: "from-emerald-50/80",
        gradientTo: "to-white",
        accentColor: "bg-emerald-500",
        title: "知识库",
        subtitle: "构建你的智库",
        description: "保存洞察、生成海报、构建你的个人知识体系。",
    },
];

// Floating animation for the icon
function FloatingIcon({ children, iconBg }: { children: React.ReactNode; iconBg: string }) {
    const y = useMotionValue(0);
    const rotate = useMotionValue(0);
    const scale = useMotionValue(1);

    useEffect(() => {
        // Floating animation
        const floatAnimation = animate(y, [0, -8, 0], {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        });

        // Subtle rotation
        const rotateAnimation = animate(rotate, [-2, 2, -2], {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
        });

        // Breathing scale
        const scaleAnimation = animate(scale, [1, 1.05, 1], {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
        });

        return () => {
            floatAnimation.stop();
            rotateAnimation.stop();
            scaleAnimation.stop();
        };
    }, [y, rotate, scale]);

    return (
        <motion.div
            style={{ y, rotate, scale }}
            className={cn(
                "w-24 h-24 rounded-[28px] flex items-center justify-center relative",
                iconBg
            )}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/60 to-transparent" />

            {/* Orbiting particles */}
            <motion.div
                className="absolute w-3 h-3 rounded-full bg-blue-200/60"
                animate={{
                    x: [0, 30, 0, -30, 0],
                    y: [-30, 0, 30, 0, -30],
                    scale: [0.8, 1, 0.8],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-amber-200/60"
                animate={{
                    x: [0, -25, 0, 25, 0],
                    y: [25, 0, -25, 0, 25],
                    scale: [1, 0.8, 1],
                    opacity: [0.6, 0.3, 0.6],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {children}
        </motion.div>
    );
}

// Staggered text animation
const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay,
            ease: "easeOut" as const,
        },
    }),
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 200 : -200,
        opacity: 0,
        scale: 0.9,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -200 : 200,
        opacity: 0,
        scale: 0.9,
    }),
};

export function OnboardingCarousel() {
    const { showOnboarding, completeOnboarding } = useOnboarding();
    const [[currentIndex, direction], setPage] = useState([0, 0]);

    if (!showOnboarding) return null;

    const paginate = (newDirection: number) => {
        triggerHaptic("light");
        if (currentIndex + newDirection >= slides.length) {
            completeOnboarding();
            return;
        }
        if (currentIndex + newDirection < 0) return;
        setPage([currentIndex + newDirection, newDirection]);
    };

    const currentSlide = slides[currentIndex];
    const isLastSlide = currentIndex === slides.length - 1;

    // Background gradient opacity based on progress
    const progress = useMotionValue(currentIndex / (slides.length - 1));
    const bgOpacity = useTransform(progress, [0, 1], [0.3, 0.6]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden"
        >
            {/* Animated gradient background */}
            <motion.div
                className={cn(
                    "absolute inset-0 bg-gradient-to-b transition-all duration-700",
                    currentSlide.gradientFrom,
                    currentSlide.gradientTo
                )}
                style={{ opacity: bgOpacity }}
            />

            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/40 to-transparent blur-3xl"
                    animate={{
                        x: [0, 20, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-100/30 to-transparent blur-3xl"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* White base layer */}
            <div className="absolute inset-0 bg-white/90" />

            {/* Skip Button */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-4 right-4 z-10"
            >
                <button
                    onClick={() => {
                        triggerHaptic("light");
                        completeOnboarding();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors active:scale-95"
                >
                    跳过
                </button>
            </motion.div>

            {/* Content Area */}
            <div className="relative flex-1 flex flex-col items-center justify-center px-8 pt-16 pb-8">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentSlide.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.3 },
                        }}
                        className="flex flex-col items-center text-center max-w-sm"
                    >
                        {/* Animated Icon */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
                            className="mb-10"
                        >
                            <FloatingIcon iconBg={currentSlide.iconBg}>
                                {currentSlide.icon}
                            </FloatingIcon>
                        </motion.div>

                        {/* Subtitle with stagger */}
                        <motion.span
                            custom={0.15}
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3"
                        >
                            {currentSlide.subtitle}
                        </motion.span>

                        {/* Title with stagger */}
                        <motion.h1
                            custom={0.25}
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-[32px] font-black text-gray-900 tracking-tight mb-4 leading-tight"
                        >
                            {currentSlide.title}
                        </motion.h1>

                        {/* Description with stagger */}
                        <motion.p
                            custom={0.35}
                            variants={textVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="text-base text-gray-500 leading-relaxed"
                        >
                            {currentSlide.description}
                        </motion.p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative px-8 pb-12 pt-4"
            >
                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {slides.map((slide, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                triggerHaptic("light");
                                setPage([index, index > currentIndex ? 1 : -1]);
                            }}
                            className="relative p-1"
                        >
                            <motion.div
                                animate={{
                                    width: index === currentIndex ? 32 : 8,
                                    height: 8,
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className={cn(
                                    "rounded-full transition-colors duration-300",
                                    index === currentIndex
                                        ? slide.accentColor
                                        : "bg-gray-200 hover:bg-gray-300"
                                )}
                            />
                        </button>
                    ))}
                </div>

                {/* Action Button */}
                <motion.button
                    onClick={() => paginate(1)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300",
                        "bg-gray-900 text-white",
                        "shadow-lg shadow-gray-900/20"
                    )}
                >
                    <span>{isLastSlide ? "开始体验" : "继续"}</span>
                    <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronRight size={20} />
                    </motion.span>
                </motion.button>

                {/* Progress indicator */}
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    <Zap size={12} />
                    <span>{currentIndex + 1} / {slides.length}</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
