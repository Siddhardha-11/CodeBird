function TreeNode({
  node,
  depth,
  expandedFolders,
  activePath,
  selectedPath,
  onToggleFolder,
  onOpenFile,
  onSelectNode,
}) {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders[node.path];
  const isActive = activePath === node.path;
  const isSelected = selectedPath === node.path;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelectNode(node.path, node.type);

          if (isFolder) {
            onToggleFolder(node.path);
            return;
          }

          onOpenFile(node.path);
        }}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
          isActive
            ? 'bg-[#12314a] text-slate-100'
            : isSelected
              ? 'bg-[#172030] text-slate-100'
              : 'text-slate-300 hover:bg-[#141c2b]'
        }`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
      >
        <span className="w-4 text-center text-slate-500">{isFolder ? (isExpanded ? 'v' : '>') : '.'}</span>
        <span className={isFolder ? 'text-slate-200' : ''}>{node.name}</span>
      </button>

      {isFolder && isExpanded && node.children?.length ? (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              activePath={activePath}
              selectedPath={selectedPath}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const FileExplorer = ({
  tree,
  projectName,
  activeFilePath,
  selectedNodePath,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
  onAddFile,
  onAddFolder,
  onSelectNode,
}) => {
  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-800 bg-[#0b1120]">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Explorer</div>
        <div className="mt-2 text-sm font-semibold text-slate-200">{projectName}</div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-3">
        <button
          type="button"
          onClick={onAddFile}
          className="rounded-md border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs text-slate-200 hover:bg-[#182131]"
        >
          + file
        </button>
        <button
          type="button"
          onClick={onAddFolder}
          className="rounded-md border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs text-slate-200 hover:bg-[#182131]"
        >
          + folder
        </button>
      </div>

      <div className="border-b border-slate-800 px-4 py-2 text-[11px] text-slate-500">
        selected: {selectedNodePath || 'root'}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            expandedFolders={expandedFolders}
            activePath={activeFilePath}
            selectedPath={selectedNodePath}
            onToggleFolder={onToggleFolder}
            onOpenFile={onOpenFile}
            onSelectNode={onSelectNode}
          />
        ))}
      </div>
    </aside>
  );
};

export default FileExplorer;
