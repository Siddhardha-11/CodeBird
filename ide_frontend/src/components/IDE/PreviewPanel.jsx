import React from 'react';

const PreviewPanel = ({ workspace }) => {
  return (
    <section className="w-full bg-slate-950 text-xs text-slate-100 lg:w-80 md:text-sm">
      <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400">
        Preview
      </div>
      <div className="space-y-4 p-3 md:p-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-2 text-[11px] uppercase tracking-[0.25em] text-sky-300">Project</div>
          <h3 className="text-lg font-semibold text-white">{workspace.projectName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{workspace.idea}</p>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-slate-500">Stack</div>
          <div className="flex flex-wrap gap-2">
            {workspace.stack.map((item) => (
              <span key={item} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-slate-500">Key Features</div>
          <div className="space-y-3">
            {workspace.features.map((feature) => (
              <div key={feature} className="rounded-xl bg-slate-950/80 p-3 text-sm text-slate-300">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <div className="mb-3 text-[11px] uppercase tracking-[0.25em] text-slate-500">Milestones</div>
          <div className="space-y-2">
            {workspace.milestones.map((step, index) => (
              <div key={step} className="flex gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 text-[11px] text-sky-300">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewPanel;
