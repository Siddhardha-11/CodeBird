import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout.jsx';
import TopBar from '../components/IDE/TopBar.jsx';
import FileExplorer from '../components/IDE/FileExplorer.jsx';
import Editor from '../components/IDE/Editor.jsx';
import PreviewPanel from '../components/IDE/PreviewPanel.jsx';
import { createWorkspace, getSavedAnswers, getSavedIdea } from '../lib/codebird.js';

const IDE = () => {
  const workspace = createWorkspace(getSavedIdea(), getSavedAnswers());
  const [activeFilePath, setActiveFilePath] = useState(workspace.files[0].path);
  const activeFile =
    workspace.files.find((file) => file.path === activeFilePath) || workspace.files[0];

  return (
    <MainLayout>
      <div className="mb-6 rounded-[28px] border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-sky-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.35em] text-sky-300">Workspace Ready</div>
            <h1 className="text-3xl font-semibold text-white">{workspace.projectName}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">{workspace.idea}</p>
          </div>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Type</div>
              <div className="mt-2">{workspace.appType}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Audience</div>
              <div className="mt-2">{workspace.audience}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Device</div>
              <div className="mt-2">{workspace.device}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <TopBar
          projectName={workspace.projectName}
          branchName={workspace.branchName}
          appType={workspace.appType}
        />
        <div className="flex flex-col lg:h-[72vh] lg:flex-row">
          <FileExplorer
            files={workspace.files}
            activeFilePath={activeFile.path}
            onSelect={setActiveFilePath}
            projectName={workspace.projectName}
          />
          <Editor file={activeFile} />
          <PreviewPanel workspace={workspace} />
        </div>
      </div>
    </MainLayout>
  );
};

export default IDE;
