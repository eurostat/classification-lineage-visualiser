import { getYearComparisonURI } from "./uriHelper.js";
import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";

const maxYear = 2024;
const minYear = 2017;
export let callerId = "";
export let category = "";
let globalNodes = [];
let globalEdges = [];
let processedNodes = new Set();
let processedEdges = new Set();

export async function composeGraphData(id, cat, uri, iYear, conceptId, conceptLabel) {
  callerId = id;
  category = cat;

  globalNodes = [];
  globalEdges = [];
  processedNodes = new Set();
  processedEdges = new Set();

  // Start positive and negative recursion in parallel
  await renderLineageData(uri, iYear, conceptId, conceptLabel)
  .catch( (error) => {
			console.error("Error:", error.message);
			throw error; // Halting on error
		}
	);

  // Log nodes and edges once all recursion is completed
  logGraphData();
}

async function renderLineageData(iUri, iYear, conceptId, conceptLabel) {
  const positiveUri = getYearComparisonURI(iUri, category, iYear, true);
  const negativeUri = getYearComparisonURI(iUri, category, iYear, false);

  try {
    await renderGraphData(positiveUri, conceptId, conceptLabel, iYear, iYear + 1);
    await renderGraphData(negativeUri, conceptId, conceptLabel, iYear, iYear - 1);
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Halting on error
  };
}

const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(iUri, conceptId, conceptLabel, iYear, targetYear) {
  if (iYear < minYear || iYear > maxYear) return; // Stop recursion based on year bounds

  const nodeKey = `${conceptId}-${iYear}`;
  // console.log(nodeKey.substring(4,8), iUri, "skip next:", processedNodes.has(nodeKey));
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

  try {
    const newTargets = await requestQueue.add(() => fetchAndProcessData(iUri, conceptId, conceptLabel, iYear, targetYear));
    // console.log(nodeKey ,"Targets:", newTargets);
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        // console.log("New concept:", nodeKey, iUri);
        return renderLineageData(iUri, target.targetYear, target.targetId, target.targetLabel);
      });
      await Promise.all(newPromises).catch((error) => {
        console.error("Error:", error.message);
        throw error; // Halting on error
      }); // Wait until all promises are resolved
    }
  } catch (error) {
    console.error("Error:", error.message);
    throw error; // Halting on error
  }
}

export function getTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const bindings = data.results.bindings;

  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges);

  globalNodes = globalNodes.concat(result.nodes);
  globalEdges = globalEdges.concat(result.edges);

  return result.targetIds; // Return target IDs for further processing
}

function logGraphData() {
  console.log("duplicate nodes:", globalNodes.length !== new Set(globalNodes.map((node) => node.id)).size);
  console.log("Global Nodes:", globalNodes);

  console.log("Global Edges:", globalEdges);
  // const occurrences = globalNodes.filter((node) => node.id === "846229000080-2023");
  // console.log("Occurrences:", occurrences);
  // console.log(processedNodes)
  // // check if id is in processedNodes
  //     targetNodeKey === "846229900080-2022" ||
  //     targetNodeKey === "846229100080-2021" ||
  //     targetNodeKey === "846229000080-2023") {
  // console.log(processedNodes.has("846229000080-2023"))
  // console.log(processedNodes.has("846229100080-2021"))
  // console.log(processedNodes.has("846229900080-2022"))

}