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

function wrapText(textElement, textContent, maxWidth, nodeHeight) {
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

function wrapTextWithTooltip(
	textElement,
	textContent,
	maxWidth,
	nodeHeight,
	svg
) {
	const words = textContent.split(/\s+/);
	let line = [];
	let lineNumber = 0;
	const lineHeight = 1.1; // em units for line height
	const y = textElement.attr("y");
	const dy = parseFloat(textElement.attr("dy"));
	const maxLines = Math.floor(nodeHeight / (lineHeight * 16)) - 1; // Fit one line less than nodeHeight
	let tspan = textElement
		.text(null)
		.append("tspan")
		.attr("x", textElement.attr("x"))
		.attr("y", y)
		.attr("dy", dy + "em");

	let isTruncated = false;

	for (let i = 0; i < words.length; i++) {
		line.push(words[i]);
		tspan.text(line.join(" "));

		// Check if current line width exceeds maxWidth
		if (tspan.node().getComputedTextLength() > maxWidth) {
			line.pop(); // Remove last word that caused overflow
			tspan.text(line.join(" ")); // Set line without overflow
			line = [words[i]]; // Start a new line with the last word
			lineNumber++;

			// Check if adding this line exceeds maxLines limit
			if (lineNumber >= maxLines) {
				tspan.text(line.join(" ") + "…"); // Add ellipsis to last line
				isTruncated = true;
				break;
			}

			// Add new tspan for the next line
			tspan = textElement
				.append("tspan")
				.attr("x", textElement.attr("x"))
				.attr("y", y)
				.attr("dy", lineNumber * lineHeight + dy + "em")
				.text(words[i]);
		}
	}

	// Tooltip setup if text was truncated
	if (isTruncated) {
		const tooltip = svg
			.append("foreignObject")
			.attr("class", "tooltip")
			.attr("width", 200)
			.attr("height", 50)
			.style("visibility", "hidden");

		const tooltipContent = tooltip
			.append("xhtml:div")
			.style("background", "rgba(0, 0, 0, 0.7)")
			.style("color", "#fff")
			.style("padding", "4px 8px")
			.style("border-radius", "4px")
			.style("font-size", "12px")
			.style("pointer-events", "none")
			.text(textContent);

		// Show tooltip on mouseover
		textElement
			.on("mouseover", function () {
				const { x, y } = textElement.node().getBBox();
				tooltip
					.attr("x", x + 10) // Offset slightly from text
					.attr("y", y - 10)
					.style("visibility", "visible");
			})
			.on("mouseout", function () {
				tooltip.style("visibility", "hidden");
			});
	}
}

function applyEllipsisWithTooltip(textElement, textContent, maxWidth, svg) {
	const tspan = textElement
		.text(textContent)
		.attr("x", textElement.attr("x"))
		.attr("y", textElement.attr("y"))
		.attr("dy", textElement.attr("dy"));

	if (tspan.node().getComputedTextLength() > maxWidth) {
		let truncatedText = textContent;
		while (
			truncatedText.length > 0 &&
			tspan.node().getComputedTextLength() > maxWidth
		) {
			truncatedText = truncatedText.slice(0, -1);
			tspan.text(truncatedText + "…");
		}

		// Append tooltip within the SVG as a `foreignObject`
		const tooltip = svg
			.append("foreignObject")
			.attr("class", "tooltip")
			.attr("width", 200)
			.attr("height", 200)
			.style("pointer-events", "none");

		tooltip
			.append("xhtml:div")
			.style("display", "flex")
			.append("xhtml:div")
			.style("background", "rgba(0, 0, 0, 0.7)")
			.style("color", "#fff")
			.style("padding", "4px 8px")
			.style("border-radius", "4px")
			.style("font-size", "12px")
			.text(textContent);

		textElement
			.on("mouseover", function (event) {
				tooltip
					.attr("x", event.x0 - 110)
					.attr("y", event.y0 + 25)
					.classed("visible", true);
			})
			.on("mouseout", function () {
				tooltip.classed("visible", false);
			});
	}
}

function transformData(data) {
	const nodes = [];
	const links = [];

	function traverse(node, parent = null, pIndex = null) {
		if (node) {
			const { id, name, count, tooltip, delta, color, distribution } = node;
			const nodePush = nodes.push({
				id,
				name,
				value: count,
				toolTip: delta
					? `<div class="sankey-node-tooltip-with-delta"><span class="opacity80">${tooltip}</span> → <span class="delta">${delta}<span></div>`
					: `<div class="sankey-node-tooltip opacity80">${tooltip}</div>`,
				color,
				delta: delta,
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

		svg
			.append("g")
			.selectAll("path")
			.data(links)
			.enter()
			.append("path")
			.attr("d", sankeyLinkHorizontal())
			.attr("fill", "none")
			.attr("stroke", "#2763EC")
			.attr("stroke-width", (d) => Math.max(1, d.width))
			.attr("stroke-opacity", 0.08);

		svg
			.append("g")
			.selectAll("g")
			.data(nodes)
			.enter()
			.append("g")
			.each(function (d) {
				const nodeHeight = d.y1 - d.y0;
				d3
					.select(this)
					.append("rect")
					.attr("x", d.x0)
					.attr("y", d.y0)
					.attr("width", d.x1 - d.x0)
					.attr("height", nodeHeight)
					.attr("fill", d.color)
					.attr("rx", 8)
					.attr("ry", 8);

				// const titleText = d3
				// 	.select(this)
				// 	.append("text")
				// 	.attr("x", (d) => d.x0 - 14)
				// 	.attr("y", (d) => d.y0 + 6 + (nodeHeight < 100 ? 0.11 * nodeHeight : 11))
				// 	.attr("dy", "0.35em")
				// 	.attr("text-anchor", "end")
				// 	.attr("fill", "#2A2D3C")
				// 	.attr("class", "sankey-node-title");

				const titleText = d3
					.select(this)
					.append("text")
					.attr("x", (d) => d.x0 - 14)
					.attr("y", (d) => d.y0 + 6 + (nodeHeight < 100 ? 0.11 * nodeHeight : 11))
					.attr("dy", "0.35em")
					.attr("text-anchor", "end")
					.attr("fill", "#2A2D3C")
					.attr("class", "sankey-node-title");

				if (d.name) {
					applyEllipsisWithTooltip(titleText, d.name, 120, svg);
					// wrapTextWithTooltip(titleText, d.name, 120, nodeHeight, svg);
					// if (nodeHeight < 40) applyEllipsisWithTooltip(titleText, d.name, 120, svg);
					// else wrapText(titleText, d.name, 120);
				}

				// d3.select(this)
				// 	.append("text")
				// 	.attr("x", d.x0 + 15)
				// 	.attr("y", d.y0 - 18)
				// 	.attr("dy", "0.35em")
				// 	.attr("text-anchor", "middle")
				// 	.text(d.toolTip)
				// 	.attr("fill", "#2A2D3C")
				// 	.attr("class", "sankey-node-tooltip");

				d3
					.select(this)
					.append("foreignObject")
					.attr("x", d.x0 - (d.delta ? 85 : 0))
					.attr("y", d.y0 - 26)
					.attr("width", 200)
					.attr("height", 50)
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
