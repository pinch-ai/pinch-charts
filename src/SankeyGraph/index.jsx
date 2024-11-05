import * as d3 from "d3";
import { linkHorizontal } from "d3-shape";
import React, { useEffect, useRef } from "react";
import sankeyGenerator from "./Generator";
import "./styles.css";

function horizontalSource(d) {
	return [d.source.x1 - 10, d.y0];
}

function horizontalTarget(d) {
	return [d.target.x0 + 10, d.y1];
}

function sankeyLinkHorizontal() {
	return linkHorizontal().source(horizontalSource).target(horizontalTarget);
}

function wrapText(textElement, textContent, maxWidth) {
	const words = textContent.split(/\s+/).reverse();
	let word;
	let line = [];
	let lineNumber = 0;
	const lineHeight = 1.1;
	const y = textElement.attr("y");
	const dy = parseFloat(textElement.attr("dy"));
	let tspan = textElement
		.text(null)
		.append("tspan")
		.attr("x", textElement.attr("x"))
		.attr("y", y)
		.attr("dy", dy + "em");

	while ((word = words.pop())) {
		line.push(word);
		tspan.text(line.join(" "));
		if (tspan.node().getComputedTextLength() > maxWidth) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = textElement
				.append("tspan")
				.attr("x", textElement.attr("x"))
				.attr("y", y)
				.attr("dy", ++lineNumber * lineHeight + dy + "em")
				.text(word);
		}
	}
}

function transformData(data) {
	const nodes = [];
	const links = [];

	function traverse(node, parent = null, pIndex = null) {
		if (node) {
			const { id, name, count, tooltip, delta, color, distribution } =
				node;
			const nodePush = nodes.push({
				id,
				name,
				value: count,
				toolTip: `<span>${tooltip}${
					delta ? ` -> ${delta}` : ""
				}</span>`,
				color,
			});
			const index = nodePush - 1;
			if (parent) {
				links.push({ source: pIndex, target: index, value: count });
			}
			distribution?.forEach((child) => traverse(child, node, index));
		}
	}

	traverse(data);
	return { nodes, links };
}

const SankeyChart = ({ data, width = 800, heightMultiplier = 100 }) => {
	const svgRef = useRef();
	const modifiedData = transformData(data);
	const height = Math.max(
		(modifiedData.nodes.length - 4) * heightMultiplier,
		800
	);

	useEffect(() => {
		d3.select(svgRef.current).selectAll("*").remove();
		const sankey = sankeyGenerator()
			.nodeWidth(32)
			.nodePadding(42)
			.extent([
				[0, 0],
				[width, height],
			]);
		const { nodes, links } = sankey(modifiedData);
		const svg = d3
			.select(svgRef.current)
			.attr("width", width)
			.attr("height", height);

		svg.append("g")
			.selectAll("path")
			.data(links)
			.enter()
			.append("path")
			.attr("d", sankeyLinkHorizontal())
			.attr("fill", "none")
			.attr("stroke", "#2763EC")
			.attr("stroke-width", (d) => Math.max(1, d.width))
			.attr("stroke-opacity", 0.08);

		svg.append("g")
			.selectAll("g")
			.data(nodes)
			.enter()
			.append("g")
			.each(function (d) {
				const nodeHeight = d.y1 - d.y0;
				d3.select(this)
					.append("rect")
					.attr("x", d.x0)
					.attr("y", d.y0)
					.attr("width", d.x1 - d.x0)
					.attr("height", nodeHeight)
					.attr("fill", d.color)
					.attr("rx", 8)
					.attr("ry", 8);

				const titleText = d3
					.select(this)
					.append("text")
					.attr("x", (d) => d.x0 - 14)
					.attr(
						"y",
						(d) =>
							d.y0 +
							6 +
							(nodeHeight < 100 ? 0.11 * nodeHeight : 11)
					)
					.attr("dy", "0.35em")
					.attr("text-anchor", "end")
					.attr("fill", "#2A2D3C")
					.attr("class", "sankey-node-title");

				if (d.name) wrapText(titleText, d.name, 120);

				// d3.select(this)
				// 	.append("text")
				// 	.attr("x", d.x0 + 15)
				// 	.attr("y", d.y0 - 18)
				// 	.attr("dy", "0.35em")
				// 	.attr("text-anchor", "middle")
				// 	.text(d.toolTip)
				// 	.attr("fill", "#2A2D3C")
				// 	.attr("class", "sankey-node-tooltip");

				d3.select(this)
					.append("foreignObject")
					.attr("x", d.x0 + 15 - 100)
					.attr("y", d.y0 - 18 - 8)
					.attr("text-anchor", "middle")
					.attr("width", 200)
					.attr("height", 50)
					.append("xhtml:div")
					.attr("class", "sankey-node-tooltip")
					.style("color", "#2A2D3C")
					.style("text-align", "center")
					.html(() => d.toolTip);
			});
	}, [width, height, modifiedData]);

	return (
		<svg
			ref={svgRef}
			style={{
				overflow: "visible",
				margin: "50px 50px 50px 80px",
			}}
		/>
	);
};

export default SankeyChart;
