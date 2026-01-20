
import React from 'react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden z-[9999]">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
      </div>
      
      <div className="relative perspective-1000 text-center">
        <div className="animate-bounce-slow">
            <Logo size={120} className="mx-auto transform rotate-y-12 transition-transform duration-500 mb-8" />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 brand">
          PROJECT MANAGER
        </h1>
        
        <div className="h-1 w-48 bg-white/10 mx-auto rounded-full overflow-hidden mb-6">
            <div className="h-full bg-indigo-500 animate-[loading_0.8s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>

        <p className="text-slate-400 text-sm font-semibold tracking-[0.3em] uppercase opacity-80">
          Powered by JOI.A.
        </p>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
};
