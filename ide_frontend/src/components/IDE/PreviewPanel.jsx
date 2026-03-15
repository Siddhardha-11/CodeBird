import React from 'react';

const DEVICE_WIDTHS = {
  desktop: '100%',
  tablet: '820px',
  mobile: '390px',
};

const PreviewPanel = ({ previewDocument, refreshKey }) => {
  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-800 bg-[#0b1320]">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Preview</div>
        <div className="mt-2 text-sm text-slate-300">sandbox</div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto rounded-[16px] border border-slate-800 bg-slate-950 p-3">
          <div
            className="mx-auto overflow-hidden rounded-[12px] border border-slate-800 bg-white transition-all duration-300"
            style={{ width: DEVICE_WIDTHS.desktop, minHeight: '620px' }}
          >
            <iframe
              key={refreshKey}
              title="CodeBird Live Preview"
              srcDoc={previewDocument}
              sandbox="allow-scripts allow-same-origin"
              className="h-[620px] w-full bg-white"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PreviewPanel;
