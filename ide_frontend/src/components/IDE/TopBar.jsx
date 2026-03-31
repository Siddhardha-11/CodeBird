const ACTIONS = [
  {
    key: 'files',
    label: 'Files',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 6h7l2 2h9v10H3z" />
      </svg>
    ),
  },
  {
    key: 'preview',
    label: 'Run Preview',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
  },
  {
    key: 'sandbox',
    label: 'Sandbox',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v14H4z" />
        <path d="M9 9h6" />
        <path d="M9 13h4" />
      </svg>
    ),
  },
  {
    key: 'terminal',
    label: 'Terminal',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 6h16v12H4z" />
        <path d="M7 10l2 2-2 2" />
        <path d="M11 16h6" />
      </svg>
    ),
  },
];

const TopBar = ({
  prompt,
  onAction,
  status,
  isFilesOpen,
  isSandboxOpen,
  isTerminalOpen,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0e1522]">
      <div className="border-b border-slate-800 px-5 py-3">
        <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">Prompt</div>
        <div className="text-sm leading-6 text-slate-300">{prompt}</div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {ACTIONS.map((action) => {
            const pressed =
              (action.key === 'files' && isFilesOpen) ||
              (action.key === 'sandbox' && isSandboxOpen) ||
              (action.key === 'terminal' && isTerminalOpen);

            return (
              <button
                key={action.key}
                type="button"
                onClick={() => onAction(action.key)}
                className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-sm ${
                  pressed
                    ? 'border-slate-500 bg-[#1b2636] text-slate-100'
                    : 'border-slate-700 bg-[#111827] text-slate-300 hover:bg-[#182131]'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => onAction('export')}
            className="inline-flex items-center gap-2 rounded border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-slate-300 hover:bg-[#182131]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 4v10" />
              <path d="M8 10l4 4 4-4" />
              <path d="M5 19h14" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="rounded border border-slate-700 bg-[#111827] px-3 py-2 text-slate-300">
            {status}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
