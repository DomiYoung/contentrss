import { motion } from "framer-motion";

export function RadarPulse() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-20 select-none">
            {/* Structural Circles */}
            {[600, 450, 300].map((size) => (
                <div
                    key={size}
                    style={{ width: size, height: size }}
                    className="absolute border border-zinc-900/10 rounded-full"
                />
            ))}

            {/* Scanning Beam */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ width: 600, height: 600 }}
                className="absolute rounded-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent origin-center"
            />

            {/* Origin Core */}
            <div className="relative">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <motion.div
                    animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 bg-emerald-500/20 rounded-full"
                />
            </div>

            {/* Background Grid (Optional elite touch) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
    );
}
