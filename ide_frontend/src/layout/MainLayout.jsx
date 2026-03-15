import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-900 font-bold">
              CB
            </div>
            <span className="text-slate-100 font-semibold">CodeBird</span>
          </div>
          <span className="text-xs text-slate-400">AI-powered app builder</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
