import React from 'react';

const Editor = ({ file }) => {
  const lines = file.content.split('\n');

  return (
    <section className="min-w-0 flex-1 border-r border-slate-800 bg-slate-950/90 text-xs md:text-sm">
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 text-[11px] text-slate-400">
        <span>{file.path}</span>
        <span className="uppercase tracking-[0.25em] text-slate-500">{file.language}</span>
      </div>
      <div className="grid h-full min-h-[420px] grid-cols-[auto_1fr] overflow-auto font-mono">
        <div className="select-none border-r border-slate-800 bg-slate-950 px-3 py-4 text-right text-slate-600">
          {lines.map((_, index) => (
            <div key={`${file.path}-line-${index + 1}`} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="overflow-auto px-4 py-4 text-slate-100">
          {file.content}
        </pre>
      </div>
    </section>
  );
};

export default Editor;
