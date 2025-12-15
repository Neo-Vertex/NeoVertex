import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'outline';
    children: React.ReactNode;
    icon?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    icon = false,
    className = '',
    style,
    ...props
}) => {
    const baseStyles = "relative px-8 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 overflow-hidden group";

    // Inline styles for vanilla CSS approach with variables
    const internalStyle: React.CSSProperties = variant === 'primary' ? {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-bg)',
        borderRadius: '8px',
    } : {
        border: '1px solid var(--color-primary)',
        color: 'var(--color-primary)',
        background: 'transparent',
        borderRadius: '8px',
    };

    const finalStyle = { ...internalStyle, ...style };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${baseStyles} ${className}`}
            style={finalStyle}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
                {icon && <ArrowRight size={18} />}
            </span>

            {/* Shine effect for primary button */}
            {variant === 'primary' && (
                <div
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out z-0"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                    }}
                />
            )}
        </motion.button>
    );
};

export default Button;
