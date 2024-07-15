import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";

export let callerId = "";
export let family = "";

const globalNodes = new Set();
const globalEdges = new Set();
const processedNodes = new Set();
const processedEdges = new Set();

export async function composeGraphData(id, kin, iYear, conceptId, conceptLabel) {
  callerId = id;
  family = kin;

  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();


  await renderLineageData(iYear, conceptId, conceptLabel)

  const nodes = Array.from(globalNodes).map(node => JSON.parse(node));
  const edges = Array.from(globalEdges).map(edge => JSON.parse(edge));
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  return { nodes, edges };
}


async function renderLineageData(iYear, conceptId, conceptLabel) {
  const correspondenceTable = JSON.parse(sessionStorage.getItem("correspondence-table"));
  const targetItem = correspondenceTable.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return; // Stop if no target item found
  const { nextYear, comparisonUri } = targetItem;
  await renderGraphData(comparisonUri, conceptId, conceptLabel, iYear, nextYear);
}

const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  console.log(`Processing node: ${nodeKey}`);
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

    const newTargets = await requestQueue.add(() => fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear));
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        return renderLineageData(parseInt(target.targetYear), target.targetId, target.targetLabel);
      });
      await Promise.all(newPromises)
    }
}

export function getTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const bindings = data.results.bindings;

  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges);

  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));

  return result.targetIds; // Return target IDs for further processing
}