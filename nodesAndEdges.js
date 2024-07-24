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

export function addEdgeIfNew(edges, processedEdges, nodeKey1, nodeKey2) {
  const edgeKey = [nodeKey1, nodeKey2].sort().join('-');
  if (!processedEdges.has(edgeKey)) {
    createEdgeAndAddToSet(edges, nodeKey1, nodeKey2);
    processedEdges.add(edgeKey);
  }
}

export function setNodesAndEdges( bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges) {

  if (bindings.length === 0) {
    return { nodes: new Set(), edges: new Set(), targetIds: [] };
  }

  const nodes = new Set();
  const edges = new Set();
  const targetIds = [];
  const sourceNodeKey = `${conceptId}-${iYear}`;

  if (conceptLabel) createNodeAndAddToSet(sourceNodeKey, conceptLabel, iYear, nodes);

  bindings.forEach(
		({
			ID: { value: targetId },
			CODE: { value: targetLabel },
		}) => {
			const targetNodeKey = `${targetId}-${targetYear}`;
			createNodeAndAddToSet(targetNodeKey, targetLabel, targetYear, nodes);
			addEdgeIfNew(edges, processedEdges, sourceNodeKey, targetNodeKey);
			targetIds.push({ targetId, targetYear, targetLabel });
		}
	);

  return { nodes, edges, targetIds };
}
