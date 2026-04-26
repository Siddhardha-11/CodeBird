const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '820px',
  mobile: '390px',
};

const PreviewPanel = ({
  previewDocument,
  refreshKey,
  sandboxUrl,
  sandboxState,
  isRefreshing,
  onRefresh,
  onClose,
}) => {
  const isLiveSandbox = Boolean(sandboxUrl);

  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-800 bg-[#0b1320]">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Sandbox</div>
            <div className="mt-2 text-sm text-slate-300">
              {isLiveSandbox ? `sandbox live at ${sandboxUrl}` : sandboxState || 'sandbox idle'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label={isRefreshing ? 'Starting sandbox' : 'Refresh sandbox'}
              className="rounded border border-slate-700 bg-[#111827] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#182131] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 11a8 8 0 1 0 2 5.3" />
                <path d="M20 4v7h-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sandbox"
              className="rounded border border-slate-700 bg-[#111827] px-3 py-1.5 text-sm text-slate-300 transition hover:bg-[#182131]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full bg-white relative">
        {isRefreshing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <svg className="h-8 w-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-sm font-medium tracking-wide text-slate-300">Generating Application...</div>
            </div>
          </div>
        )}
        <iframe
          key={refreshKey}
          title="Live App"
          src={sandboxUrl || "about:blank"}
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, border: "none" }}
        />
      </div>
    </aside>
  );
};

export default PreviewPanel;
