// main.js
import { getConnectedNodeIds, getFilteredNodes } from "./data.js";
import { getXScale, getYScale } from "./scales.js";
import { positionNodes } from "./nodes.js";
import { edges } from "./data.js";

const connectedNodeIds = getConnectedNodeIds();
const filteredNodes = getFilteredNodes(connectedNodeIds);

// ... (no changes here)
const svg = d3.select("#visualization"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

const years = Array.from(new Set(filteredNodes.map((d) => d.year))).sort();

const xScale = getXScale(years, width);
const yScale = getYScale(filteredNodes, height);

const nodeMap = positionNodes(years, filteredNodes, xScale, yScale);

// ... (no changes here)
years.forEach((year) => {
	const yearNodes = filteredNodes.filter((node) => node.year === year);
	yearNodes.forEach((node, i) => {
		node.x = xScale(year);
		node.y = yScale(i + 1);
		nodeMap.set(node.id, node);
	});
});

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
	.data(filteredNodes)
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

// Add year labels
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