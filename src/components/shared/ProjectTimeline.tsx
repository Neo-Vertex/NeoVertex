import React from 'react';
import { motion } from 'framer-motion';

interface ProjectTimelineProps {
    steps: string[];
    currentStatus: string;
    onStatusChange?: (status: string) => void;
    readOnly?: boolean;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ steps, currentStatus, onStatusChange, readOnly = false }) => {
    const currentIndex = steps.indexOf(currentStatus);
    const progress = currentIndex >= 0 ? currentIndex / (steps.length - 1) : 0;
    const halfStepPercent = 100 / (steps.length * 2);

    return (
        <div className="py-8 px-4 select-none w-full">
            <div className="relative">
                {/* Fundo da Trilha */}
                <div
                    className="absolute top-[5px] h-1 bg-white/5 rounded-full overflow-hidden z-0"
                    style={{ left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }}
                >
                    {/* Trilha Ativa */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--color-primary-dim)] to-[var(--color-primary)]"
                        initial={{ width: `${progress * 100}%` }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                </div>

                {/* Indicador Knob Ativo (Posição Animada) */}
                <div
                    className="absolute top-[5px] h-1 z-20 pointer-events-none"
                    style={{ left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }}
                >
                    <motion.div
                        animate={{ left: `${progress * 100}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)] flex items-center justify-center z-30"
                    >
                        <div className="w-1.5 h-1.5 bg-[#09090b] rounded-full" />
                    </motion.div>
                </div>

                {/* Contêiner de Passos / Etiquetas */}
                <div className="relative flex justify-between z-10 w-full">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div
                                key={step}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!readOnly && onStatusChange) {
                                        onStatusChange(step);
                                    }
                                }}
                                className={`flex flex-col items-center group/step w-0 flex-1 overflow-visible ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                {/* Alvo de Interação do Ponto */}
                                <div className="relative p-2 -m-2 mb-2 rounded-full hover:bg-white/5 transition-colors">
                                    <div
                                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 bg-[#09090b] z-10
                                            ${isCompleted ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-[#09090b] border-white/20 group-hover/step:border-white/40'}
                                        `}
                                    />
                                </div>

                                {/* Etiqueta */}
                                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors text-center w-[120px] leading-tight block select-none
                                        ${isCompleted ? 'text-white' : 'text-white/20 group-hover/step:text-white/40'}
                                        ${isCurrent ? 'opacity-100' : 'opacity-70'}
                                    `}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectTimeline;
