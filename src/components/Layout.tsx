import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  currentUserName: string;
  activeView: 'dashboard' | 'explore';
  onNavigate: (view: 'dashboard' | 'explore') => void;
  onCreateNew: () => void;
  onLogout: () => void;
  pageTitle: string;
  pageDescription?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUserName, activeView, onNavigate, onCreateNew, onLogout, pageTitle, pageDescription }) => {
  return (
    <div>
      <Navbar 
        currentUserName={currentUserName}
        activeView={activeView}
        onNavigate={onNavigate}
        onCreateNew={onCreateNew}
        onLogout={onLogout}
      />
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
                {pageTitle}
            </h1>
            {pageDescription && <p className="text-zinc-600 mt-2 text-lg">{pageDescription}</p>}
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};
