
import React, { useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import MainLayout from '../layout/MainLayout.jsx';
import TopBar from '../components/IDE/TopBar.jsx';
import FileExplorer from '../components/IDE/FileExplorer.jsx';
import Editor from '../components/IDE/Editor.jsx';
import PreviewPanel from '../components/IDE/PreviewPanel.jsx';

import { collectFilePaths, getParentPath, insertNode } from '../components/IDE/treeUtils.js';
import {
  createWorkspace,
  getSavedAnswers,
  getSavedIdea,
  generateProjectFromWorkspace,
  startSandbox
} from '../lib/codebird.js';

const STORAGE_KEY = 'codebird.ide.project';
const MIN_FILES_WIDTH = 220;
const MIN_PREVIEW_WIDTH = 280;

function readStoredProject() {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function createBlankFileContent(path) {
  if (path.endsWith('.jsx')) {
    return `export default function Component() {\n  return <div>New component</div>;\n}\n`;
  }

  if (path.endsWith('.html')) {
    return '<!DOCTYPE html>\n<html>\n  <body>\n    <div>New file</div>\n  </body>\n</html>\n';
  }

  if (path.endsWith('.css')) {
    return '/* New stylesheet */\n';
  }

  if (path.endsWith('.json')) {
    return '{\n  "name": "new-file"\n}\n';
  }

  return '// New file\n';
}

const IDE = () => {
  const workspace = createWorkspace(getSavedIdea(), getSavedAnswers());
  console.log("IDE mounted");
console.log("workspace:", workspace);
  const parsedProject = readStoredProject();
  const layoutRef = useRef(null);

 const [tree, setTree] = useState([]);
const [files, setFiles] = useState({});
  const [openFiles, setOpenFiles] = useState(parsedProject?.openFiles || ['src/App.jsx', 'preview/index.html']);
  const [activeFilePath, setActiveFilePath] = useState(parsedProject?.activeFilePath || 'src/App.jsx');
  const [selectedNodePath, setSelectedNodePath] = useState(parsedProject?.selectedNodePath || 'src');
  const [selectedNodeType, setSelectedNodeType] = useState(parsedProject?.selectedNodeType || 'folder');
  const [expandedFolders, setExpandedFolders] = useState(
    parsedProject?.expandedFolders || { src: true, 'src/components': true, 'src/pages': true, public: true, preview: true }
  );
  const [previewKey, setPreviewKey] = useState(0);
  const [status, setStatus] = useState('saved locally');
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [isSandboxOpen, setIsSandboxOpen] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [filePanelWidth, setFilePanelWidth] = useState(276);
  const [previewPanelWidth, setPreviewPanelWidth] = useState(368);
  const [terminalHeight, setTerminalHeight] = useState(170);
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [sandboxState, setSandboxState] = useState('sandbox idle');
  const [isSandboxRefreshing, setIsSandboxRefreshing] = useState(false);
  const [logs, setLogs] = useState([
    '[ui] workspace booted',
    '[preview] iframe ready',
    '[autosave] local session restored',
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tree,
        files,
        openFiles,
        activeFilePath,
        selectedNodePath,
        selectedNodeType,
        expandedFolders,
      })
    );
  }, [tree, files, openFiles, activeFilePath, selectedNodePath, selectedNodeType, expandedFolders]);

  useEffect(() => {
    setPreviewKey((current) => current + 1);
  }, [files]);

  const safeActiveFilePath =
    activeFilePath && openFiles.includes(activeFilePath) && files[activeFilePath]
      ? activeFilePath
      : openFiles.find((path) => files[path]) || '';

  useEffect(() => {
    if (safeActiveFilePath !== activeFilePath) {
      setActiveFilePath(safeActiveFilePath);
    }
  }, [activeFilePath, safeActiveFilePath]);

  const logMessage = (message) => {
    setLogs((current) => [...current, message]);
  };

const refreshSandbox = async () => {
  setIsSandboxOpen(true);
  setIsTerminalOpen(true);
  setIsSandboxRefreshing(true);
  setSandboxState('generating project...');
  setStatus('generating project...');
  logMessage('[sandbox] generating project...');

  try {
    const workspace = createWorkspace(getSavedIdea(), getSavedAnswers());
    console.log("WORKSPACE:", workspace);

    const gen = await generateProjectFromWorkspace(workspace);
    console.log("GEN RESULT:", gen);

    if (!gen || !gen.projectPath) {
      throw new Error("Project generation failed");
    }

    const projectPath = gen.projectPath;

    logMessage(`[sandbox] generated at ${projectPath}`);

    const result = await startSandbox(projectPath);
    console.log("SANDBOX RESULT:", result);

    const nextSandboxUrl = result.frontend?.url || '';
    console.log("SANDBOX URL:", nextSandboxUrl); 
    const backendUrl = result.backend?.url || '';

    setSandboxUrl(nextSandboxUrl);
    setPreviewKey((current) => current + 1);

    setSandboxState(
      nextSandboxUrl
        ? `sandbox live at ${nextSandboxUrl}`
        : 'sandbox started'
    );

    setStatus('sandbox running');

    logMessage(`[sandbox] frontend ${nextSandboxUrl || 'not started'}`);

    if (backendUrl) {
      logMessage(`[sandbox] backend ${backendUrl}`);
    }

  } catch (error) {
    console.error(error);
    setSandboxState('sandbox failed');
    setStatus('sandbox failed');
    logMessage(`[sandbox:error] ${error.message}`);
  } finally {
    setIsSandboxRefreshing(false);
  }
};
  const openFile = (path) => {
    if (!files[path]) {
      return;
    }

    setActiveFilePath(path);
    setSelectedNodePath(path);
    setSelectedNodeType('file');
    setOpenFiles((current) => (current.includes(path) ? current : [...current, path]));
  };

  const toggleFolder = (path) => {
    setExpandedFolders((current) => ({
      ...current,
      [path]: !current[path],
    }));
  };

  const handleSelectNode = (path, type) => {
    setSelectedNodePath(path);
    setSelectedNodeType(type);
  };

  const addNode = (type) => {
    const name = window.prompt(type === 'file' ? 'Enter file name' : 'Enter folder name');

    if (!name) {
      return;
    }

    const parentPath =
      selectedNodeType === 'folder' ? selectedNodePath : getParentPath(selectedNodePath);
    const nextPath = parentPath ? `${parentPath}/${name}` : name;

    if (files[nextPath] || allFilePaths.includes(nextPath)) {
      window.alert('A file or folder with that name already exists.');
      return;
    }

    const nextNode = {
      id: nextPath,
      path: nextPath,
      name,
      type,
      children: type === 'folder' ? [] : undefined,
    };

    setTree((current) => insertNode(current, parentPath, nextNode));
    setSelectedNodePath(nextPath);
    setSelectedNodeType(type);
    setExpandedFolders((current) => ({
      ...current,
      ...(parentPath ? { [parentPath]: true } : {}),
      ...(type === 'folder' ? { [nextPath]: true } : {}),
    }));

    if (type === 'file') {
      setFiles((current) => ({
        ...current,
        [nextPath]: createBlankFileContent(nextPath),
      }));
      setOpenFiles((current) => (current.includes(nextPath) ? current : [...current, nextPath]));
      setActiveFilePath(nextPath);
      logMessage(`[files] created ${nextPath}`);
      return;
    }

    logMessage(`[folders] created ${nextPath}`);
  };

  const handleChange = (path, value) => {
    setFiles((current) => ({
      ...current,
      [path]: value,
    }));
      setStatus('saved locally');
  };

  const handleCloseTab = (path) => {
    setOpenFiles((current) => {
      const nextTabs = current.filter((item) => item !== path);

      if (path === activeFilePath) {
        setActiveFilePath(nextTabs[nextTabs.length - 1] || '');
      }

      return nextTabs;
    });
  };

  const handleToolbarAction = (action) => {
    if (action === 'files') {
      setIsFilesOpen((current) => !current);
      return;
    }

    if (action === 'sandbox') {
      setIsSandboxOpen((current) => !current);
      return;
    }

    if (action === 'terminal') {
      setIsTerminalOpen((current) => !current);
      return;
    }

    if (action === 'preview') {
      setPreviewKey((current) => current + 1);
      setStatus('preview refreshed');
      logMessage('[preview] manual refresh');
      return;
    }

    if (action === 'export') {
      const exportProject = async () => {
        const zip = new JSZip();
        const projectFolder = zip.folder(workspace.projectName.toLowerCase().replace(/\s+/g, '-'));

        Object.entries(files).forEach(([path, content]) => {
          projectFolder.file(path, content);
        });

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workspace.projectName.toLowerCase().replace(/\s+/g, '-')}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
        setStatus('export ready');
        logMessage('[export] downloaded zip archive');
      };

      exportProject();
    }
  };

  const startResize = (panel) => (event) => {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const initialFileWidth = filePanelWidth;
    const initialPreviewWidth = previewPanelWidth;
    const initialTerminalHeight = terminalHeight;
    const layoutWidth = layoutRef.current?.getBoundingClientRect().width || window.innerWidth;
    const layoutHeight = layoutRef.current?.getBoundingClientRect().height || window.innerHeight;

    const handleMove = (moveEvent) => {
      if (panel === 'files') {
        const nextWidth = initialFileWidth + (moveEvent.clientX - startX);
        setFilePanelWidth(Math.min(Math.max(nextWidth, MIN_FILES_WIDTH), layoutWidth * 0.42));
      }

      if (panel === 'preview') {
        const nextWidth = initialPreviewWidth - (moveEvent.clientX - startX);
        setPreviewPanelWidth(Math.min(Math.max(nextWidth, MIN_PREVIEW_WIDTH), layoutWidth * 0.48));
      }

      if (panel === 'terminal') {
        const nextHeight = initialTerminalHeight - (moveEvent.clientY - startY);
        setTerminalHeight(Math.min(Math.max(nextHeight, 120), layoutHeight * 0.45));
      }
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const previewDocument = "";
  const editorMinWidth = useMemo(() => (isFilesOpen || isSandboxOpen ? 0 : '100%'), [isFilesOpen, isSandboxOpen]);

  return (
    <MainLayout fullWidth contentClassName="h-[calc(100vh-61px)]">
      <section className="flex h-full flex-col overflow-hidden border-t border-slate-800 bg-[#0a1019]">
        <TopBar
          prompt={workspace.idea}
          onAction={handleToolbarAction}
          status={status}
          isFilesOpen={isFilesOpen}
          isSandboxOpen={isSandboxOpen}
          isTerminalOpen={isTerminalOpen}
        />

        <div ref={layoutRef} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1">
            {isFilesOpen ? (
              <>
                <div style={{ width: filePanelWidth }} className="min-h-0 shrink-0">
                  <FileExplorer
                    tree={tree}
                    projectName={workspace.projectName}
                    activeFilePath={safeActiveFilePath}
                    selectedNodePath={selectedNodePath}
                    expandedFolders={expandedFolders}
                    onToggleFolder={toggleFolder}
                    onOpenFile={openFile}
                    onAddFile={() => addNode('file')}
                    onAddFolder={() => addNode('folder')}
                    onSelectNode={handleSelectNode}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Resize file explorer"
                  onMouseDown={startResize('files')}
                  className="w-1 shrink-0 cursor-col-resize bg-slate-900 transition hover:bg-slate-700"
                />
              </>
            ) : null}

            <div className="min-h-0 flex-1" style={{ minWidth: editorMinWidth }}>
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1">
                  <Editor
                    activeFilePath={safeActiveFilePath}
                    openFiles={openFiles}
                    files={files}
                    onSelectTab={openFile}
                    onCloseTab={handleCloseTab}
                    onChange={handleChange}
                  />
                </div>

                {isTerminalOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Resize terminal"
                      onMouseDown={startResize('terminal')}
                      className="h-1 w-full shrink-0 cursor-row-resize bg-slate-900 transition hover:bg-slate-700"
                    />
                    <section
                      style={{ height: terminalHeight }}
                      className="shrink-0 border-t border-slate-800 bg-[#050912]"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Terminal</div>
                        <button
                          type="button"
                          onClick={() => setIsTerminalOpen(false)}
                          className="text-sm text-slate-500 transition hover:text-slate-200"
                        >
                          Close
                        </button>
                      </div>
                      <div className="h-full overflow-auto px-4 py-3 font-mono text-[12px] leading-6 text-slate-300">
                        {logs.map((line, index) => (
                          <div key={`${line}-${index}`} className="whitespace-pre-wrap">
                            {line}
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                ) : null}
              </div>
            </div>

            {isSandboxOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Resize sandbox"
                  onMouseDown={startResize('preview')}
                  className="w-1 shrink-0 cursor-col-resize bg-slate-900 transition hover:bg-slate-700"
                />
                <div style={{ width: previewPanelWidth }} className="min-h-0 shrink-0">
                  <PreviewPanel
                    previewDocument={previewDocument}
                    refreshKey={previewKey}
                    sandboxUrl={sandboxUrl}
                    sandboxState={sandboxState}
                    isRefreshing={isSandboxRefreshing}
                    onRefresh={refreshSandbox}
                    onClose={() => setIsSandboxOpen(false)}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default IDE;
