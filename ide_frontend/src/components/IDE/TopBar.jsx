import React from 'react';

const TopBar = ({ projectName, branchName, appType }) => {
  return (
    <div className="flex min-h-12 flex-col gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="ml-3 text-slate-300">{projectName} / {branchName}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-slate-700 px-2 py-1 text-slate-300">{appType}</span>
        <span>AI workspace</span>
      </div>
    </div>
  );
};

export default TopBar;
