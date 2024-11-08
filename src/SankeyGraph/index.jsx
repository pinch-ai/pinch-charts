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
	const lineHeight = 1.1;
	const y = textElement.attr("y");
	const dy = parseFloat(textElement.attr("dy"));
	const maxLines = Math.floor(nodeHeight / (lineHeight * 16)) - 1;
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
		if (tspan.node().getComputedTextLength() > maxWidth) {
			line.pop();
			lineNumber++;
			tspan.text(`${line.join(" ")}${lineNumber >= maxLines ? "..." : ""}`);
			line = [words[i]];

			if (lineNumber >= maxLines) {
				isTruncated = true;
				break;
			}
			tspan = textElement
				.append("tspan")
				.attr("x", textElement.attr("x"))
				.attr("y", y)
				.attr("dy", lineNumber * lineHeight + dy + "em")
				.text(words[i]);
		}
	}

	if (isTruncated) {
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
			const {
				id,
				name,
				count,
				tooltip,
				delta,
				color,
				distribution,
				paddingBottom,
			} = node;
			const nodePush = nodes.push({
				id,
				name,
				value: count,
				toolTip: delta
					? `<div class="sankey-node-tooltip-with-delta"><span class="opacity80">${tooltip}</span> → <span class="delta">${delta}<span></div>`
					: `<div class="sankey-node-tooltip opacity80">${tooltip}</div>`,
				color,
				delta: delta,
				paddingBottom,
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

const SankeyChart = ({ data, width = 800, heightMultiplier = 120 }) => {
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
			.nodePadding(68)
			.extent([
				[0, 0],
				[width, height],
			]);
		const { nodes, links } = sankey(modifiedData);

		nodes.forEach((node) => {
			if (node.value < 5) {
				node.y1 = node.y0 + 5;
			}
		});

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
					.attr("rx", nodeHeight < 20 ? 4 : 8)
					.attr("ry", nodeHeight < 20 ? 4 : 8);

				const titleText = d3
					.select(this)
					.append("text")
					.attr("x", (d) => d.x0 - 14)
					.attr("y", (d) => d.y0 + 6 + (nodeHeight < 100 ? 0.11 * nodeHeight : 11))
					.attr("dy", "0.35em")
					.attr("text-anchor", "end")
					.attr("fill", "#2A2D3C")
					.attr("class", "sankey-node-title");

				if (d.name) wrapTextWithTooltip(titleText, d.name, 180, nodeHeight, svg);

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
				margin: "50px 50px 150px 80px",
			}}
		/>
	);
};

export default SankeyChart;
