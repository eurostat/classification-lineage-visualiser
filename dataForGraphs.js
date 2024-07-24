import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessTargets } from "./fetchAndProcessData.js";
import { setNodesAndEdges } from "./nodesAndEdges.js";
import { getCorrespondenceTable } from "./sessionStorage.js";

export let callerId = "";
export let family = "";

const globalNodes = new Set();
const globalEdges = new Set();
const processedNodes = new Set();
const processedEdges = new Set();
const requestQueue = new RequestQueue(5);

export async function composeGraphData(id, kin, iYear, conceptId, conceptLabel) {
  callerId = id;
  family = kin;

  globalNodes.clear();
  globalEdges.clear();
  processedNodes.clear();
  processedEdges.clear();

  await renderBothWaysLineageData(iYear, conceptId, conceptLabel, true);

  if (globalNodes.size === 0) {
    const nodes = [{ id: `${conceptId}-${iYear}`, label: conceptLabel, year: iYear }];
    return { nodes, edges: [] };
  }

  const nodes = Array.from(globalNodes).map(JSON.parse);
  const edges = Array.from(globalEdges).map(JSON.parse);

  console.log("Nodes:", nodes);
  console.log("Edges:", edges);

  return { nodes, edges };
}

async function renderBothWaysLineageData(iYear, conceptId, conceptLabel, directFamily = false) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri, pastYear } = targetItem;

  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear, directFamily);
  }

  if (pastYear) {
    const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === pastYear);
    if (pastTargetItem) {
      await renderBackwardLineageData(pastTargetItem.correspUri, conceptId, iYear, pastYear, directFamily);
    }
  }
}

async function renderForwardLineageData(correspondenceUri, conceptId, conceptLabel, iYear, targetYear, directFamily = false) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  console.log("rhi Node key:", nodeKey, processedNodes);
  if (processedNodes.has(nodeKey)) return;
  
  processedNodes.add(nodeKey);

  const conceptRDFUri = `${correspondenceUri}_${conceptId}`;

  const newTargets = await requestQueue.add(() => fetchAndProcessTargets(conceptRDFUri, conceptId, conceptLabel, iYear, targetYear, directFamily));
  
  if (newTargets.length > 0) {
    console.log("rhi New targets:", newTargets);
    await Promise.all(newTargets.map(target => processForwardLineage(parseInt(target.targetYear), target.targetId, target.targetLabel)));
  }
}

async function processForwardLineage(iYear, conceptId, conceptLabel) {
  const correspondenceTableData = await getCorrespondenceTable();
  const targetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!targetItem) return;

  const { nextYear: forwardYear, correspUri } = targetItem;
  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
  }
}


async function renderBackwardLineageData(correspondenceUri, conceptId, iYear, targetYear, lookForward = false) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}`;
  console.log(nodeKey, processedNodes)
  if (processedNodes.has(nodeKey)) return;

  processedNodes.add(nodeKey);

  const newTargets = await requestQueue.add(() => fetchAndProcessTargets(correspondenceUri, conceptId, '', iYear, targetYear));

  if (newTargets.length > 0) {
    console.log(
			"Backward Look with forward:",
			lookForward,
			nodeKey,
			newTargets.map((target) => target.targetId),
      conceptId,
			newTargets.map((target) => target.targetYear),
      targetYear,
      correspondenceUri,
      iYear

		);
    if (lookForward)
    await Promise.all(
			newTargets.map((target) =>
				requestQueue.add(() =>
					fetchAndProcessTargets( `${correspondenceUri}_${target.targetId}`, target.targetId, target.targetLabel, targetYear, iYear)
				)
			)
		);
await Promise.all(newTargets.map(target => processBackwardLineage(parseInt(target.targetYear), target.targetId)));
  }
}

async function processBackwardLineage(iYear, conceptId) {
  console.log("Process backward", iYear, conceptId)
    
  const correspondenceTableData = await getCorrespondenceTable();
  const pastTargetItem = correspondenceTableData.find(item => parseInt(item.thisYear) === iYear);
  if (!pastTargetItem) return;

  const { correspUri, pastYear } = pastTargetItem;
  if (pastYear) {
    await renderBackwardLineageData(correspUri, conceptId, iYear, pastYear);
  }
}

export function processTargets(data, conceptId, conceptLabel, iYear, targetYear) {
  const bindings = data.results.bindings;
	const result = setNodesAndEdges( bindings, conceptId, conceptLabel, iYear, targetYear, processedEdges);
  result.nodes.forEach(node => globalNodes.add(node));
  result.edges.forEach(edge => globalEdges.add(edge));
  return result.targetIds;
}
