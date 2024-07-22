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
  if (bindings.length === 0) {
    return { nodes: new Set(), edges: new Set(), targetIds: [] };
  }

  const nodes = new Set();
  const edges = new Set();
  const targetIds = [];
  const sourceNodeKey = `${conceptId}-${iYear}`;

  createNodeAndAddToSet(sourceNodeKey, conceptLabel, iYear, nodes);

  bindings.forEach(
		({
			ID: { value: targetId },
			CODE: { value: targetLabel },
			CLOSE_MATCH_FAMILY: { value: hasChildren },
			CLOSE_MATCH_ID: { value: childId } = {},
			CLOSE_MATCH_CODE: { value: childLabel } = {},
		}) => {
			const targetNodeKey = `${targetId}-${targetYear}`;
			createNodeAndAddToSet(targetNodeKey, targetLabel, targetYear, nodes);
			addEdgeIfNew(edges, processedEdges, sourceNodeKey, targetNodeKey);
			targetIds.push({ targetId, targetYear, targetLabel });

			if (hasChildren === "true") {
				const familyNodeKey = `${childId}-${iYear}`;
				createNodeAndAddToSet(familyNodeKey, childLabel, iYear, nodes);
				addEdgeIfNew(edges, processedEdges, familyNodeKey, targetNodeKey);
			}

		}
	);

  return { nodes, edges, targetIds };
}

function addEdgeIfNew(edges, processedEdges, nodeKey1, nodeKey2) {
  const edgeKey = [nodeKey1, nodeKey2].sort().join('-');
  if (!processedEdges.has(edgeKey)) {
    createEdgeAndAddToSet(edges, nodeKey1, nodeKey2);
    processedEdges.add(edgeKey);
  }
}