import React from 'react';
import { LayoutGridIcon, GlobeAltIcon, PencilSquareIcon } from './Icons';

interface NavbarProps {
  currentUserName: string;
  activeView: 'dashboard' | 'explore';
  onNavigate: (view: 'dashboard' | 'explore') => void;
  onCreateNew: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUserName, activeView, onNavigate, onCreateNew, onLogout }) => {
  
  const NavLink: React.FC<{
    view: 'dashboard' | 'explore';
    icon: React.ReactNode;
    label: string;
  }> = ({ view, icon, label }) => {
    const isActive = activeView === view;
    const activeClasses = 'bg-zinc-200/70 text-zinc-900';
    const inactiveClasses = 'text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900';
    
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
      >
        {icon}
        {label}
      </button>
    );
  };
  
  return (
    <header className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-sm border-b border-zinc-200">
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink view="dashboard" icon={<LayoutGridIcon className="w-5 h-5" />} label="Dashboard" />
            <NavLink view="explore" icon={<GlobeAltIcon className="w-5 h-5" />} label="Explore" />
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-medium text-zinc-600">
              Hi, {currentUserName}!
            </span>
            <button
                onClick={onCreateNew}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-50 font-semibold rounded-lg hover:bg-zinc-800 transition-all duration-200 text-sm"
                >
                <PencilSquareIcon className="w-5 h-5" />
                <span className="hidden sm:block">New Dilemma?</span>
            </button>
            <button
                onClick={onLogout}
                className="px-4 py-2 bg-white text-zinc-900 border border-zinc-200 font-semibold rounded-lg hover:bg-zinc-100 transition-colors text-sm"
                >
                Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
