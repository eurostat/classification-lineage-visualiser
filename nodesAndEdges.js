function createNode(nodeKey, id, year, nodes) {
  const node = {
    id: nodeKey,
    label: id,
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

export function setNodesAndEdges(bindings, conceptId, iYear, targetYear, processedNodes, processedEdges) {
  const nodes = [];
  const edges = [];
  const targetIds = [];

  const nodeKey = `${conceptId}-${iYear}`;
  if (!processedNodes.has(nodeKey)) {
    createNode(nodeKey, conceptId, iYear, nodes);
    processedNodes.add(nodeKey);
  }

  bindings.forEach((record) => {
    const targetId = record.ID.value;
    const targetNodeKey = `${targetId}-${targetYear}`;
    if (!processedNodes.has(targetNodeKey)) {
      createNode(targetNodeKey, targetId, targetYear, nodes);
      if (processedNodes.size > 10) {
      processedNodes.add(targetNodeKey);
      }
    }

    const edgeKey = [nodeKey, targetNodeKey].sort().join('-');
    if (!processedEdges.has(edgeKey)) {
      createEdge(edges, nodeKey, targetNodeKey);
      processedEdges.add(edgeKey);
    }

    targetIds.push({ targetId, targetYear });
  });

  return { nodes, edges, targetIds };
}