
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <div className="relative flex-shrink-0">
        <svg 
          viewBox="0 0 100 100" 
          className="w-10 h-10 transition-transform duration-500 group-hover:rotate-12"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Fundo Circular com Gradiente - Ajustado para FEIFAR */}
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F79433" /> {/* Brand Orange */}
              <stop offset="100%" stopColor="#212543" /> {/* Brand Navy */}
            </linearGradient>
          </defs>
          
          <circle cx="50" cy="50" r="48" fill="url(#logo-gradient)" fillOpacity="0.1" />
          
          {/* Metade da Pílula (Topo) - Laranja */}
          <path 
            d="M30 45C30 33.9543 38.9543 25 50 25C61.0457 25 70 33.9543 70 45V50H30V45Z" 
            fill="#F79433" 
          />
          
          {/* Metade da Pílula (Base) - Azul Marinho */}
          <path 
            d="M30 55V60C30 71.0457 38.9543 80 50 80C61.0457 80 70 71.0457 70 60V55H30Z" 
            fill="#212543" 
          />
          
          {/* Páginas do Livro no centro da pílula */}
          <path 
            d="M40 42H60M40 48H60M40 54H60" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Pequena Lâmpada/Faísca de ideia no topo - Azul Navy para contraste no laranja */}
          <circle cx="50" cy="25" r="4" fill="#212543" className="animate-pulse" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter text-brand-navy">
          FARMA<span className="text-brand-orange">QUEST</span>
        </span>
        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">CONCURSOS FARMACÊUTICOS</span>
      </div>
    </div>
  );
};

export default Logo;
