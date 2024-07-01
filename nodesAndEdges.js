function createNode(nodeKey, label, year, nodes) {
  const node = {
    id: nodeKey,
    label: label,
    year: year,
  };
  nodes.add(JSON.stringify(node));
}

function createEdge(edges, sourceNodeKey, targetNodeKey) {
  const edge = {
    source: sourceNodeKey,
    target: targetNodeKey,
  };
  edges.push(edge);
}

export function setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges) {
  const nodes = new Set();
  const edges = [];
  const targetIds = [];

  const sourceNodeKey = `${conceptId}-${iYear}`;
  createNode(sourceNodeKey, conceptLabel, iYear, nodes);

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    const targetLabel = record.CODE.value;
    const targetNodeKey = `${targetId}-${targetYear}`;
    createNode(targetNodeKey, targetLabel, targetYear, nodes);

    const edgeKey = [sourceNodeKey, targetNodeKey].sort().join('-');
    if (!processedEdges.has(edgeKey)) {
      createEdge(edges, sourceNodeKey, targetNodeKey);
      processedEdges.add(edgeKey);
    }

    targetIds.push({ targetId, targetYear, targetLabel });
  });

  return { nodes, edges, targetIds };
}