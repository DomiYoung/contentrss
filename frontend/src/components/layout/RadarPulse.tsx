import { motion } from "framer-motion";

export function RadarPulse() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
            {/* Radar Lines */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] border border-emerald-500/20 rounded-full"
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute w-[400px] h-[400px] border border-emerald-500/10 rounded-full"
            />

            {/* The Pulse Beam */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent origin-center"
            />

            {/* Scanning Dot */}
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.4, 0.1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 rounded-full bg-emerald-500 blur-sm shadow-lg shadow-emerald-500/50"
            />
        </div>
    );
}
