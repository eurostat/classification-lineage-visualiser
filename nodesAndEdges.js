// nodesAndEdges.js
export function createNode(id, year) {
  return {
    id: `${id}-${year}`,
    label: id,
    year: year,
  };
}

export function createEdge(sourceNodeKey, targetNodeKey) {
  return {
    source: sourceNodeKey,
    target: targetNodeKey,
  };
}