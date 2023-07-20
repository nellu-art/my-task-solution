export function isChildOf(node, parent) {
  if (node.parentId === parent.id) {
    return true;
  }

  return parent.children.some((child) => isChildOf(node, child));
}
