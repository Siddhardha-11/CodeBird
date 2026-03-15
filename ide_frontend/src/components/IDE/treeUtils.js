function cloneNode(node) {
  return {
    ...node,
    children: node.children ? node.children.map(cloneNode) : undefined,
  };
}

export function getParentPath(path) {
  if (!path.includes('/')) {
    return '';
  }

  return path.split('/').slice(0, -1).join('/');
}

export function insertNode(tree, parentPath, node) {
  const nextTree = tree.map(cloneNode);

  if (!parentPath) {
    return [...nextTree, node];
  }

  const appendToParent = (nodes) =>
    nodes.map((item) => {
      if (item.path === parentPath && item.type === 'folder') {
        return {
          ...item,
          children: [...(item.children || []), node],
        };
      }

      if (!item.children) {
        return item;
      }

      return {
        ...item,
        children: appendToParent(item.children),
      };
    });

  return appendToParent(nextTree);
}

export function collectFilePaths(tree) {
  const files = [];

  const walk = (nodes) => {
    nodes.forEach((node) => {
      if (node.type === 'file') {
        files.push(node.path);
      }

      if (node.children?.length) {
        walk(node.children);
      }
    });
  };

  walk(tree);
  return files;
}
