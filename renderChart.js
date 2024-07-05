import { positionNodes } from "./nodes.js";
import { getXScale } from "./scales.js";

/**
* Calculates unique years and the maximum number of nodes in any year.
* Defines SVG dimensions based on these values.
* Uses positionNodes to position nodes with consistent vertical padding.
*/

export function renderChart(graphData) {
	const { nodes, edges } = graphData;

	// Calculate the years present in the data
	const years = Array.from(new Set(nodes.map((d) => d.year))).sort();

	// Calculate the maximum number of nodes in any single year
	const maxNodesInYear = d3.max(
		years.map((year) => nodes.filter((node) => node.year === year).length)
	);

	// Define the dimensions of the SVG
	const width = years.length * 350; // 350 pixels per year
	const fixedDistance = 60; // Fixed distance between nodes
	const topOffset = 55; // Space for the top nodes to avoid collision with year titles
	const height = (maxNodesInYear + 1) * fixedDistance + topOffset; // SVG height based on the maximum number of nodes in a year

	const svg = d3
		.select("#visualization")
		.attr("width", width)
		.attr("height", height);

	const xScale = getXScale(years, width);

	// Position the nodes with the fixed distance between them and the top offset
	const nodeMap = positionNodes(nodes, xScale, fixedDistance, topOffset);

	const link = svg
		.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(edges)
		.enter()
		.append("line")
		.attr("class", "link")
		.attr("x1", (d) => nodeMap.get(d.source).x)
		.attr("y1", (d) => nodeMap.get(d.source).y)
		.attr("x2", (d) => nodeMap.get(d.target).x)
		.attr("y2", (d) => nodeMap.get(d.target).y);

	const node = svg
		.append("g")
		.attr("class", "nodes")
		.selectAll("g")
		.data(nodes)
		.enter()
		.append("g")
		.attr("class", "node")
		.attr("transform", (d) => `translate(${d.x},${d.y})`)
		.on("click", highlightConnections);

	node
		.append("rect")
		.attr("width", 85)
		.attr("height", 40)
		.attr("rx", 10)
		.attr("ry", 10)
		.attr("x", -42.5)
		.attr("y", -20);

	node
		.append("text")
		.attr("x", 0)
		.attr("y", 0)
		.text((d) => d.label);

	svg
		.append("g")
		.selectAll("text")
		.data(years)
		.enter()
		.append("text")
		.attr("class", "year-label")
		.attr("x", (d) => xScale(d))
		.attr("y", 20)
		.attr("text-anchor", "middle")
		.text((d) => d);

	function highlightConnections(event, d) {
		link
			.classed("highlighted-link", (l) => l.source === d.id || l.target === d.id)
			.classed("link", (l) => !(l.source === d.id || l.target === d.id));
	}
}
