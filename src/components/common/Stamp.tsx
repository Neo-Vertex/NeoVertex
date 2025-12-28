import React from 'react';
import { motion } from 'framer-motion';

interface StampProps {
    label?: string;
    subLabel?: string;
    color?: string;
}

const Stamp: React.FC<StampProps> = ({
    label = "ASSOCIADO",
    subLabel = "NEO VERTEX",
    color = "#556B2F" // Moss Green by default
}) => {
    return (
        <motion.div
            initial={{ scale: 2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -0 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 15, // "Thud" effect
                mass: 1.5,
                delay: 0.1
            }}
            className="relative w-48 h-48 flex items-center justify-center z-50 pointer-events-none select-none"
        >
            {/* Outer Ring */}
            <div
                className="absolute inset-0 rounded-full border-[6px] border-double"
                style={{ borderColor: color, opacity: 0.8 }}
            ></div>

            {/* Inner Ring */}
            <div
                className="absolute inset-3 rounded-full border-[2px]"
                style={{ borderColor: color, opacity: 0.6 }}
            ></div>

            {/* Content Container */}
            <div className="text-center transform flex flex-col items-center justify-center -rotate-12">
                {/* Curved Text Effect (Simulated with simple layout for now) */}
                <h2
                    className="text-2xl font-black uppercase tracking-widest leading-none mb-1 text-transparent bg-clip-text"
                    style={{
                        backgroundImage: `linear-gradient(135deg, ${color}, #8B4513)`,
                        WebkitTextStroke: `1px ${color}`,
                        filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))'
                    }}
                >
                    {label}
                </h2>

                {/* Star / Icon */}
                <div className="flex gap-2 my-1 opacity-80" style={{ color: color }}>
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                </div>

                <p
                    className="text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ color: color }}
                >
                    {subLabel}
                </p>
            </div>

            {/* Grunge Texture Overlay (CSS Pattern) */}
            <div
                className="absolute inset-0 rounded-full mix-blend-screen opacity-30 pointer-events-none"
                style={{
                    background: `radial-gradient(circle, transparent 40%, ${color} 120%)`,
                }}
            ></div>

            {/* Noise/Grunge dots */}
            <div className="absolute top-4 left-8 w-2 h-2 rounded-full opacity-40 bg-[var(--color-bg)]"></div>
            <div className="absolute bottom-6 right-10 w-3 h-3 rounded-full opacity-30 bg-[var(--color-bg)]"></div>
        </motion.div>
    );
};

export default Stamp;
