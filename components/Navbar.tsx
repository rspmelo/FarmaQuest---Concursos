
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-emerald-600">Farma</span>
              <span className="text-2xl font-bold text-slate-800">Quest</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <a href="#" className="border-emerald-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Questões
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Provas
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Simulados
              </a>
            </div>
          </div>
          <div className="flex items-center">
            {user.isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Olá, <strong>{user.name}</strong></span>
                {user.isMember && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Membro Premium
                  </span>
                )}
                <button 
                  onClick={onLogout}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
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
