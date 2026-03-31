const MainLayout = ({ children, fullWidth = false, contentClassName = '' }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className={`flex items-center justify-between px-4 py-4 ${fullWidth ? '' : 'mx-auto max-w-6xl'}`}>
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 font-bold text-slate-900">
              CB
            </div>
            <span className="text-[1.05rem] font-semibold text-slate-100">CodeBird</span>
          </div>
          <span className="text-xs text-slate-400">AI-powered app builder</span>
        </div>
      </header>

      <main className={`${fullWidth ? 'w-full px-0 py-0' : 'mx-auto max-w-6xl px-4 py-8'} ${contentClassName}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
