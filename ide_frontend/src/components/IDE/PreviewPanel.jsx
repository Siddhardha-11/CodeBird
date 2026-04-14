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

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto rounded-[16px] border border-slate-800 bg-slate-950 p-3">
          <div
            className="mx-auto overflow-hidden rounded-[12px] border border-slate-800 bg-white transition-all duration-300"
            style={{ width: DEVICE_WIDTHS.desktop, minHeight: '620px' }}
          >
        <iframe
  key={refreshKey}
  title="Live App"
  src={sandboxUrl || "about:blank"}
  style={{ width: "100%", height: "100%", border: "none" }}
/>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PreviewPanel;
