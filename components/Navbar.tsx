
import React, { useState, useEffect } from 'react';
import { User, AppTab } from '../types';

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
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onTabChange('questoes')}>
              <span className="text-2xl font-bold text-emerald-600">Farma</span>
              <span className="text-2xl font-bold text-slate-800">Quest</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {['questoes', 'provas', 'simulados'].map((id) => (
                <button
                  key={id}
                  onClick={() => onTabChange(id as AppTab)}
                  className={`${activeTab === id ? 'border-emerald-500 text-gray-900' : 'border-transparent text-gray-500'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors capitalize`}
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
                  <div className="hidden md:flex items-center bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">{timeLeft}</span>
                  </div>
                )}
                {user.isMember && (
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-[10px] font-black uppercase">Premium</span>
                )}
                <button onClick={onLogout} className="text-gray-500 hover:text-gray-700 text-sm font-medium">Sair</button>
              </>
            ) : (
              <button onClick={onLogin} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors">
                Entrar / Assinar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
