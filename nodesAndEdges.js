import { processedEdges, globalNodes, globalEdges } from "./globals.js";

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

function addEdgeIfNew(edges, processedEdges, nodeKey1, nodeKey2) {
  const edgeKey = [nodeKey1, nodeKey2].sort().join('-');
  if (!processedEdges.has(edgeKey)) {
    createEdgeAndAddToSet(edges, nodeKey1, nodeKey2);
    processedEdges.add(edgeKey);
  }
}

function setNodesAndEdges( bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges) {

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

// Function to process targets and update global nodes and edges
export function processTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const bindings = data.results.bindings;
  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges);
  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));
  return result.targetIds;
}