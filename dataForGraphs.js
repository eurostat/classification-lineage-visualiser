import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessData } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";
import { getCorrespondenceTable } from "./sessionStorage.js";

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

// Processes forward lineage
async function processForwardLineage(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return; // Stop if no target item found

  const { nextYear: forwardYear, correspUri: correspondenceUrl} = targetItem;

  // Process forward lineage
  if (forwardYear) {
    await renderGraphData(correspondenceUrl, conceptId, conceptLabel, iYear, forwardYear);
  }
}

// Processes backward lineage
async function processBackwardLineage(iYear, conceptId) {
  const correspondenceTableData = await getCorrespondenceTable();
  const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!pastTargetItem) return; // Additional check if pastYear data is missing

  console.log("Past target item:", pastTargetItem);

  const { correspUri, pastYear } = pastTargetItem;
  await renderBackwardGraphData(correspUri, conceptId, iYear, pastYear);
}

// Main function to render lineage data
async function renderLineageData(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return; // Stop if no target item found

  const { nextYear: forwardYear, correspUri, pastYear } = targetItem;

  // Process forward lineage
  if (forwardYear) {
    await renderGraphData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
  }
  
  // Process backward lineage
  if (pastYear) {
    const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === pastYear);
    if (!pastTargetItem) return; // Additional check if pastYear data is missing

    console.log("Past target item:", pastTargetItem);

    const { correspUri: pastCorrespondenceUrl } = pastTargetItem;
    await renderBackwardGraphData(pastCorrespondenceUrl, conceptId, iYear, pastYear);
  }
}


const requestQueue = new RequestQueue(5); // Limit to 5 concurrent requests

async function renderGraphData(correspondenceUri, conceptId, conceptLabel, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  console.log(`Processing node: ${nodeKey}`);
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

    const conceptRDFUri = `${correspondenceUri}_${conceptId}`;
    const newTargets = await requestQueue.add(() => fetchAndProcessData(conceptRDFUri, conceptId, conceptLabel, iYear, targetYear));
    if (newTargets.length > 0) {
      // Mark the current node as processed before processing children
      processedNodes.add(nodeKey);
      const newPromises = newTargets.map((target) => {
        return processForwardLineage(parseInt(target.targetYear), target.targetId, target.targetLabel);
      });
      await Promise.all(newPromises)
    }
}

async function renderBackwardGraphData(correspondenceUri, conceptId, iYear, targetYear) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`; //FIXME: check if this should be same as forward node key
  console.log(`FIXME? Processing backward node: ${nodeKey}`, correspondenceUri);
  if (processedNodes.has(nodeKey)) return; // Stop if node already processed

  const newSources = await requestQueue.add(() => fetchAndProcessData(correspondenceUri, conceptId, '', iYear, targetYear));
  if (newSources.length > 0) {
    // Mark the current node as processed before processing parents
    console.log(newSources);
    const newPromises = newSources.map((source) => {
      return processBackwardLineage(parseInt(source.sourceYear), source.sourceId);
    });
    await Promise.all(newPromises)
  }
}

export function getTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const isBackward = iYear > targetYear;
  const bindings = data.results.bindings;

  if (isBackward) {
    return getBackwardTargets(bindings, targetYear) 
  }

  const result = setNodesAndEdges(bindings, conceptId, conceptLabel, iYear, targetYear, processedNodes, processedEdges, isBackward);

  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));

  return isBackward ? result.sourceIds : result.targetIds; // Return source IDs for backward, target IDs for forward
}

function getBackwardTargets(bindings, sourceYear) {
  const sourceIds = [];
  bindings.forEach((record) => {
    sourceIds.push({
			sourceId: record.sourceId.value,
			sourceYear: sourceYear,
			sourceLabel: record.sourceLabel.value,
		});
  });
  return sourceIds;
}
