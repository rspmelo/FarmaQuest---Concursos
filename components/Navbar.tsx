
import React, { useState, useEffect } from 'react';
import { User, AppTab } from '../types';
import Logo from './Logo';

interface NavbarProps {
  user: User;
  onLogin: () => void;
  onLogout: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, activeTab, onTabChange }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (user.trialStartedAt && !user.isMember) {
      const interval = setInterval(() => {
        const diff = (user.trialStartedAt! + 24 * 60 * 60 * 1000) - Date.now();
        if (diff <= 0) {
          setTimeLeft("Teste Expirado");
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${mins}m restantes`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user.trialStartedAt, user.isMember]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => onTabChange('questoes')}>
              <Logo />
            </div>
            <div className="ml-4">
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[9px] font-black rounded border border-slate-200">BETA</span>
            </div>
            
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8 h-full">
              {['questoes', 'provas', 'simulados'].map((id) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id as AppTab)}
                  className={`${activeTab === id ? 'border-emerald-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-emerald-600'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all capitalize tracking-tight`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user.isLoggedIn ? (
              <>
                {!user.isMember && user.trialStartedAt && (
                  <div className="hidden md:flex items-center bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">{timeLeft}</span>
                  </div>
                )}
                {user.isMember && (
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm">
                    Premium
                  </div>
                )}
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <button onClick={onLogout} className="text-slate-400 hover:text-red-500 text-sm font-bold transition-colors">Sair</button>
              </>
            ) : (
              <button 
                onClick={onLogin} 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all active:scale-95"
              >
                COMEÇAR ESTUDOS
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
