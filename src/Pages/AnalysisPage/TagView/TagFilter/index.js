import React, { useEffect } from "react";
import "./index.scss";
import * as d3 from "d3";
import { useClientRect } from "Hooks";
import { anaSvgPadding } from "Common";

const TagFilter = React.memo(
  ({ title = "title", data = [], setHighTag = () => {} }) => {
    const svgId = `ana-tag-filter-svg-${title}`;
    const svg = d3.select(`#${svgId}`);
    const clientRect = useClientRect({
      svgId: "ana-time-line-svg",
    });
    const { width, height } = clientRect;
    const padding = anaSvgPadding;
    useEffect(() => {}, []);
    useEffect(() => {
      data = data.filter((d) => d.all > 0);
      data = d3.sort(data, (a, b) => a.all - b.all);
      if (data.length === 0 || width === 0 || height === 0) return;
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.label))
        .range([padding.left, width - padding.right])
        .padding(0.2);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.all)])
        .nice()
        .range([height - padding.bottom, padding.top]);

      const xAxis = (g) =>
        g
          .attr(
            "transform",
            "translate(" + 0 + ", " + (height - padding.bottom) + ")"
          )
          .call(d3.axisBottom(x).tickSizeOuter(0));
      const yAxis = (g) =>
        g
          .attr("transform", `translate(${width - padding.right},0)`)
          .call(d3.axisRight(y))
          .call((g) => g.select(".domain").remove());

      svg
        .append("g")
        .attr("class", "bars")
        .attr("fill", "#888")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.all))
        .attr("height", (d) => y(0) - y(d.all))
        .attr("width", x.bandwidth());

      svg.append("g").attr("class", "x-axis").call(xAxis);

      svg.append("g").attr("class", "y-axis").call(yAxis);
    });
    return <svg id={svgId} width="100%" height="100%" />;
  }
);

export default TagFilter;
