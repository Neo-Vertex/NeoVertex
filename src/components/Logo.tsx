import React from 'react';
import logoImg from '../assets/logo.png';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img
                src={logoImg}
                alt="NeoVertex Logo"
                className="h-12 md:h-16 lg:h-20 w-auto transition-all duration-300"
            />
        </div>
    );
};

export default Logo;
