import { getYearComparisonURI } from "./uriHelper.js";
import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";

export let callerId = "";
export let category = "";

const globalNodes = new Set();
const globalEdges = new Set();
const processedNodes = new Set();
const processedEdges = new Set();

export async function composeGraphData(id, cat, uri, iYear, conceptId, conceptLabel) {
  callerId = id;
  category = cat;

  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();

  await renderLineageData(uri, iYear, conceptId, conceptLabel)

  const nodes = Array.from(globalNodes).map(node => JSON.parse(node));
  const edges = Array.from(globalEdges).map(edge => JSON.parse(edge));
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  return { nodes, edges };
}


async function renderLineageData(iUri, iYear, conceptId, conceptLabel) {
  let nextTargetYear = iYear + 1;
  let pastTargetYear = iYear - 1;
  if (category === "prodcom") {
    if (iYear === 2019) {
      nextTargetYear = nextTargetYear + 1;
    } else if (iYear === 2021) {
      pastTargetYear = pastTargetYear - 1;
    }
  }
  const positiveUri = getYearComparisonURI(iUri, category, iYear, nextTargetYear);
  const negativeUri = getYearComparisonURI(iUri, category, iYear, pastTargetYear);
  await renderGraphData(positiveUri, conceptId, conceptLabel, iYear, nextTargetYear);
  await renderGraphData(negativeUri, conceptId, conceptLabel, iYear, pastTargetYear);
}

const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

    const newTargets = await requestQueue.add(() => fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear));
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        return renderLineageData(iUri, target.targetYear, target.targetId, target.targetLabel);
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