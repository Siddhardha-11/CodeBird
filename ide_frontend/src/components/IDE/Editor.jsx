import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function getLanguage(path) {
  if (path.endsWith('.json')) return 'json';
  if (path.endsWith('.css')) return 'css';
  if (path.endsWith('.html')) return 'html';
  if (path.endsWith('.js')) return 'javascript';
  if (path.endsWith('.jsx')) return 'javascript';
  return 'plaintext';
}

const Editor = ({
  activeFilePath,
  openFiles,
  files,
  onSelectTab,
  onCloseTab,
  onChange,
}) => {
  const activeContent = activeFilePath ? files[activeFilePath] : '';

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#0a0f18]">
      <div className="flex min-h-11 items-end overflow-x-auto border-b border-slate-800 bg-[#0f1724]">
        {openFiles.map((path) => {
          const isActive = path === activeFilePath;

          return (
            <div
              key={path}
              className={`flex min-w-[180px] items-center justify-between gap-3 border-r border-slate-800 px-4 py-3 text-sm ${
                isActive ? 'bg-[#0a0f18] text-slate-100' : 'text-slate-400'
              }`}
            >
              <button type="button" onClick={() => onSelectTab(path)} className="truncate text-left">
                {path}
              </button>
              <button
                type="button"
                onClick={() => onCloseTab(path)}
                className="rounded text-slate-500 transition hover:text-slate-200"
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-b border-slate-800 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
        {activeFilePath || 'No file selected'}
      </div>

      <div className="min-h-0 flex-1">
        {activeFilePath ? (
          <MonacoEditor
            height="100%"
            language={getLanguage(activeFilePath)}
            value={activeContent}
            theme="vs-dark"
            onChange={(value) => onChange(activeFilePath, value || '')}
            options={{
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Select a file to start editing
          </div>
        )}
      </div>
    </section>
  );
};

export default Editor;
