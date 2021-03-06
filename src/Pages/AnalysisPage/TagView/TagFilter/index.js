import React, { useEffect } from "react";
import "./index.scss";
import * as d3 from "d3";
import { useClientRect } from "Hooks";
import { anaSvgPadding } from "Common";

const TagFilter = React.memo(
  ({
    label = "label",
    value = "",
    data = [],
    setAnaHighPapersByTag = () => {},
    anaFilterType,
    setAnaFilterType = () => {},
  }) => {
    const svgId = `ana-tag-filter-svg-${label.replaceAll(/\W/g, "")}`;
    const svg = d3.select(`#${svgId}`);
    const clientRect = useClientRect({
      svgId,
    });
    const { width, height } = clientRect;
    const padding = anaSvgPadding;
    useEffect(() => {}, []);
    useEffect(() => {
      if (data.length === 0 || width === 0 || height === 0) return;
      svg.selectAll("*").remove();
      data = data.filter((d) => d.all > 0);
      data = d3.sort(data, (a, b) => a.all - b.all);
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
          .call(d3.axisBottom(x).tickSizeOuter(0))
          .call((g) =>
            g
              .selectAll("text")
              .attr("transform", "rotate(-28)")
              .style("text-anchor", "end")
          );
      const yAxis = (g) =>
        g
          .attr("transform", `translate(${width - padding.right},0)`)
          .call(d3.axisRight(y).ticks(5))
          .call((g) => g.select(".domain").remove());

      svg
        .append("g")
        .classed("non-active-bars", true)
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.label))
        .attr("y", (d) => y(d.all))
        .attr("height", (d) => y(0) - y(d.all))
        .attr("width", x.bandwidth())
        .style("cursor", "pointer")
        .on("click", (e, d) => {
          setAnaFilterType("tag");
          setAnaHighPapersByTag({ anaHighCate: value, anaHighTag: d.label });
        });

      if (anaFilterType !== "none") {
        svg
          .append("g")
          .classed("active-bars", true)
          .selectAll("rect")
          .data(data)
          .join("rect")
          .attr("x", (d) => x(d.label))
          .attr("y", (d) => y(d.highlight))
          .attr("height", (d) => y(0) - y(d.highlight))
          .attr("width", x.bandwidth())
          .style("pointer-events", "none");
      }

      svg.append("g").attr("class", "x-axis").call(xAxis);

      svg.append("g").attr("class", "y-axis").call(yAxis);
    });
    return <svg id={svgId} width="100%" height="100%" />;
  }
);

export default TagFilter;
