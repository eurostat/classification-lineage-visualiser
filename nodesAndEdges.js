function createNodeAndAddToSet(nodeKey, label, year, nodes) {
  const node = {
    id: nodeKey,
    label: label,
    year: year,
  };
  nodes.add(JSON.stringify(node));
}

function createEdgeAndAddToSet(edges, sourceNodeKey, targetNodeKey) {
  const edge = {
    source: sourceNodeKey,
    target: targetNodeKey,
  };
  edges.add(JSON.stringify(edge));
}

export function setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges) {
  const nodes = new Set();
  const edges = new Set();
  const targetIds = [];

  const sourceNodeKey = `${conceptId}-${iYear}`;

  if (bindings.length === 0) {
    return { nodes, edges, targetIds };
  }

  createNodeAndAddToSet(sourceNodeKey, conceptLabel, iYear, nodes);

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    const targetLabel = record.CODE.value;
    const targetNodeKey = `${targetId}-${targetYear}`;
    createNodeAndAddToSet(targetNodeKey, targetLabel, targetYear, nodes);

    const edgeKey = [sourceNodeKey, targetNodeKey].sort().join('-');
    if (!processedEdges.has(edgeKey)) {
      createEdgeAndAddToSet(edges, sourceNodeKey, targetNodeKey);
      processedEdges.add(edgeKey);
    }

    targetIds.push({ targetId, targetYear, targetLabel });
  });

  return { nodes, edges, targetIds };
}