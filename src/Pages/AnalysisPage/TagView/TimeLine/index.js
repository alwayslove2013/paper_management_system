import React, { useEffect, useState } from "react";
import "./index.scss";
import * as d3 from "d3";

const padding = {
  left: 5,
  right: 25,
  top: 15,
  bottom: 20,
};

const TimeLine = ({ data }) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  // 初始化，确定长宽
  useEffect(() => {
    const svg = d3.select("#ana-time-line-svg");
    svg.selectAll("*").remove();
    const clientRect = svg.node().getClientRects()[0];
    const { width, height } = clientRect;
    setWidth(width);
    setHeight(height);
  }, []);
  useEffect(() => {
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.x))
      .range([padding.left, width - padding.right])
      .padding(0.1);
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

    const svg = d3.select("#ana-time-line-svg");
    svg
      .append("g")
      .attr("class", "bars")
      .attr("fill", "steelblue")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.x))
      .attr("y", (d) => y(d.all))
      .attr("height", (d) => y(0) - y(d.all))
      .attr("width", x.bandwidth());

    svg.append("g").attr("class", "x-axis").call(xAxis);

    svg.append("g").attr("class", "y-axis").call(yAxis);
  });
  return <svg id="ana-time-line-svg" width="100%" height="100%" />;
};

export default TimeLine;
