
import React from 'react';
import { motion } from 'framer-motion';

interface LiquidTextProps {
    text: string;
    className?: string;
    style?: React.CSSProperties;
    color?: string;
}

const LiquidText: React.FC<LiquidTextProps> = ({ text, className, style, color = '#fff' }) => {
    return (
        <div className={`liquid-text-container ${className}`} style={{ position: 'relative', ...style }}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="liquid-filter">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="liquid"
                        />
                        <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
                    </filter>
                </defs>
            </svg>
            <motion.h1
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                    color: color,
                    filter: "url(#liquid-filter)",
                    mixBlendMode: 'screen',
                    fontWeight: 'bold',
                    letterSpacing: '-2px'
                }}
            >
                {text}
            </motion.h1>
        </div>
    );
};

export default LiquidText;
