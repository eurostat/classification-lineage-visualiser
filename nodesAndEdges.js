function createNode(nodeKey, label, year, nodes) {
  const node = {
    id: nodeKey,
    label: label,
    year: year,
  };
  nodes.push(node);
}

function createEdge(edges, sourceNodeKey, targetNodeKey) {
  const edge = {
    source: sourceNodeKey,
    target: targetNodeKey,
  };
  edges.push(edge);
}

export function setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges) {
  const nodes = [];
  const edges = [];
  const targetIds = [];

  const nodeKey = `${conceptId}-${iYear}`;
  if (!processedNodes.has(nodeKey)) {
    createNode(nodeKey, conceptLabel, iYear, nodes);
    processedNodes.add(nodeKey);
  }

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    const targetLabel = record.CODE.value;
    const targetNodeKey = `${targetId}-${iYear}`;
    if (!processedNodes.has(targetNodeKey)) {
      createNode(targetNodeKey, targetLabel, targetYear, nodes);
    }

    const edgeKey = [nodeKey, targetNodeKey].sort().join('-');
    if (!processedEdges.has(edgeKey)) {
      createEdge(edges, nodeKey, targetNodeKey);
      processedEdges.add(edgeKey);
    }

    targetIds.push({ targetId, targetYear, targetLabel });
  });

  return { nodes, edges, targetIds };
}