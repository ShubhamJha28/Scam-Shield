"use client";
import React from 'react';
import './GlitchText.css';

interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ children, speed = 0.5, enableShadows = true, enableOnHover = false, className = '' }) => {
  const inlineStyles = {
    '--after-duration': `${speed * 3}s`,
    '--before-duration': `${speed * 2}s`,
    '--after-shadow': enableShadows ? '-5px 0 red' : 'none',
    '--before-shadow': enableShadows ? '5px 0 cyan' : 'none'
  } as React.CSSProperties;

  const hoverClass = enableOnHover ? 'enable-on-hover' : '';

  return (
    <span className={`glitch inline-block ${hoverClass} ${className}`} style={inlineStyles} data-text={children}>
      {children}
    </span>
  );
};

export default GlitchText;
