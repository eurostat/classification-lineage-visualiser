import { RequestQueue } from "./ajaxHelper.js";
import { fetchAndProcessTargets } from "./fetchAndProcessData.js";
import { resetGlobalData, globalEdges, globalNodes, processedNodes } from "./globals.js";
import { getCorrespondenceTable } from "./sessionStorage.js";

const requestQueue = new RequestQueue(5);

// Main function to compose graph data
export async function composeGraphData(callerId, family, iYear, conceptId, conceptLabel) {
  // Clear global sets
  resetGlobalData(callerId, family);

  // Render lineage data both forwards and backwards
  await renderBothWaysLineageData(iYear, conceptId, conceptLabel);

  // If no nodes child or parents were found, return a single node without edges
  if (globalNodes.size === 0) {
    return {
			nodes: [ { id: `${conceptId}-${iYear}`, label: conceptLabel, year: iYear } ],
			edges: [],
		};
  }

  // Convert global sets to arrays and parse JSON strings
  const nodes = Array.from(globalNodes).map(JSON.parse);
  const edges = Array.from(globalEdges).map(JSON.parse);

  // Return the nodes and edges
  return { nodes, edges };
}

// Function to render both forward and backward lineage data
async function renderBothWaysLineageData(iYear, conceptId, conceptLabel) {
  const correspondenceEntry = await getCorrespondenceEntry(iYear);
  if (!correspondenceEntry) return;

  const { nextYear: forwardYear, correspUri, pastYear } = correspondenceEntry;

  // Render forward lineage data if available
  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear, true);
  }

  // Render backward lineage data if available
  if (pastYear) {
    const pastCorrespondenceEntry = await getCorrespondenceEntry(pastYear);
    if (pastCorrespondenceEntry) {
      await renderBackwardLineageData(pastCorrespondenceEntry.correspUri, conceptId, iYear, pastYear, true);
    }
  }
}

// Function to render forward lineage data
async function renderForwardLineageData(correspondenceUri, conceptId, conceptLabel, iYear, targetYear, lookBackwards = false) {
  const nodeKey = `${conceptId}-${iYear}->${targetYear}-${lookBackwards}`;
  if (processedNodes.has(nodeKey)) return;

  processedNodes.add(nodeKey);

  const conceptRDFUri = `${correspondenceUri}_${conceptId}`;
  const newTargets = await requestQueue.add(() => fetchAndProcessTargets(conceptRDFUri, conceptId, conceptLabel, iYear, targetYear));

  // Process each new target recursively
  if (newTargets.length > 0) {
    if (lookBackwards) {

      const correspondenceEntry = await getCorrespondenceEntry(iYear);
			if (correspondenceEntry) {
        await Promise.all(
          newTargets.map((target) =>
            renderBackwardLineageData( correspondenceEntry.correspUri, target.targetId, targetYear, iYear, false, true)
          )
        );
			}
		} 
    await Promise.all(
      newTargets.map((target) =>
        processForwardLineage( parseInt(target.targetYear), target.targetId, target.targetLabel)
      )
    );
  }
}

// Helper function to process forward lineage data recursively
async function processForwardLineage(iYear, conceptId, conceptLabel) {
  const correspondenceEntry = await getCorrespondenceEntry(iYear);
  if (!correspondenceEntry) return;

  const { nextYear: forwardYear, correspUri } = correspondenceEntry;
  if (forwardYear) {
    await renderForwardLineageData(correspUri, conceptId, conceptLabel, iYear, forwardYear);
  }
}

// Function to render backward lineage data
async function renderBackwardLineageData(correspondenceUri, conceptId, iYear, targetYear, lookForward = false, directChild = false) {
  const nodeKey = `${conceptId}-${iYear}-${targetYear}->${lookForward}`;
  if (processedNodes.has(nodeKey)) return;

  processedNodes.add(nodeKey);

  const newTargets = await requestQueue.add(() => fetchAndProcessTargets(correspondenceUri, conceptId, '', iYear, targetYear));

  // Process each new target recursively
  if (newTargets.length > 0) {
    // forward looking is needed for the direct parent in order to find all children
    if (lookForward) {
      await Promise.all(newTargets.map(target =>
        requestQueue.add(() =>
          fetchAndProcessTargets(`${correspondenceUri}_${target.targetId}`, target.targetId, target.targetLabel, targetYear, iYear)
        )
      ));
    }
    // direct child flag is needed to stop backward recursion after the first level
    if (directChild) return;
    // process the next level of backward lineage
    await Promise.all(newTargets.map(target => processBackwardLineage(parseInt(target.targetYear), target.targetId)));
  }
}

// Helper function to process backward lineage data recursively
async function processBackwardLineage(iYear, conceptId) {
  const correspondenceEntry = await getCorrespondenceEntry(iYear);
  if (!correspondenceEntry || !correspondenceEntry.pastYear) return;

  const { pastYear } = correspondenceEntry;
  const nextCorrespondenceEntry = await getCorrespondenceEntry(pastYear);
  if (!nextCorrespondenceEntry || !nextCorrespondenceEntry.correspUri) return;

  const { correspUri } = nextCorrespondenceEntry;
  await renderBackwardLineageData(correspUri, conceptId, iYear, pastYear);
}

async function getCorrespondenceEntry(year) {
  const correspondenceTableData = await getCorrespondenceTable();
  return correspondenceTableData.find(item => parseInt(item.thisYear) === year);
}

