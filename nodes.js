/**  nodes.js
* The function sorts nodes by year and label.
* A yearNodeCounts map keeps track of the number of nodes already placed in each year.
* Each node's x position is set using xScale.
* Each node's y position is determined by its index within the year multiplied by fixedDistance.
*/
export function positionNodes(filteredNodes, xScale, fixedDistance, topOffset) {
	const nodeMap = new Map();

	// Sort nodes by year and then by label within each year
	const sortedNodes = filteredNodes.sort((a, b) => {
		const yearDiff = a.year - b.year;
		if (yearDiff !== 0) return yearDiff;
		return a.label.localeCompare(b.label);
	});

	const yearNodeCounts = new Map();

	sortedNodes.forEach((node) => {
		if (!yearNodeCounts.has(node.year)) {
			yearNodeCounts.set(node.year, 0);
		}

		const nodeIndex = yearNodeCounts.get(node.year);
		node.x = xScale(node.year);
		node.y = topOffset + nodeIndex * fixedDistance;

		yearNodeCounts.set(node.year, nodeIndex + 1);
		nodeMap.set(node.id, node);
	});

	return nodeMap;
}

