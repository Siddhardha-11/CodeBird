import React from 'react';

const FileExplorer = ({ files, activeFilePath, onSelect, projectName }) => {
  return (
    <aside className="w-full border-r border-slate-800 bg-slate-900/90 text-xs text-slate-300 lg:w-64">
      <div className="px-3 py-2 border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-500">
        {projectName}
      </div>
      <div className="border-b border-slate-800 px-3 py-3 text-[11px] text-slate-500">
        Generated starter files
      </div>
      <div className="max-h-64 space-y-1 overflow-auto p-2 text-[11px] md:max-h-none md:text-xs">
        {files.map((file) => {
          const isActive = file.path === activeFilePath;
          return (
            <button
              key={file.path}
              type="button"
              onClick={() => onSelect(file.path)}
              className={`block w-full rounded-lg px-2 py-2 text-left transition ${
                isActive
                  ? 'bg-sky-500/10 text-sky-100 ring-1 ring-sky-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {file.path}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default FileExplorer;
