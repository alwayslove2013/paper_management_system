import React, { useEffect, useState } from "react";
import "./index.scss";
import * as d3 from "d3";

const padding = {
  left: 5,
  right: 25,
  top: 8,
  bottom: 20,
};

const TimeLine = React.memo(
  ({
    data,
    onInput = () => {},
    onChange = () => {},
    setClearBrushTrigger = () => {},
  }) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const initYearRange = [d3.min(data, (d) => d.x), d3.max(data, (d) => d.x)];
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
      if (data.length === 0 || width === 0 || height === 0) return;
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
      const barsG = svg.append("g").attr("class", "bars").attr("fill", "#888");
      const bars = barsG
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => (d.rectX = x(d.x)))
        .attr("y", (d) => y(d.all))
        .attr("height", (d) => y(0) - y(d.all))
        .attr("width", x.bandwidth());

      svg.append("g").attr("class", "x-axis").call(xAxis);

      svg.append("g").attr("class", "y-axis").call(yAxis);

      const brushStart = () => {
        // const brush_go = () => {
        //   d3.brush().move(svg);
        //   bars.classed("active", false);
        // };
        // setClearBrushTrigger(brush_go);
      };

      const brushing = ({ selection }) => {
        bars.classed(
          "active",
          (bar) =>
            bar.rectX + x.bandwidth() > selection[0] && bar.rectX < selection[1]
        );
        const brushYear = data
          .filter(
            (d) =>
              d.rectX + x.bandwidth() > selection[0] && d.rectX < selection[1]
          )
          .map((d) => d.x);
        brushYear.length >= 1
          ? onInput([brushYear[0], brushYear[brushYear.length - 1]])
          : onInput(initYearRange);
      };
      const brushEnd = ({ selection }) => {
        const brushYear = data
          .filter(
            (d) =>
              d.rectX + x.bandwidth() > selection[0] && d.rectX < selection[1]
          )
          .map((d) => d.x);
        brushYear.length >= 1
          ? onChange([brushYear[0], brushYear[brushYear.length - 1]])
          : onChange(initYearRange);
      };
      const brush = d3
        .brushX()
        .extent([
          [padding.left, padding.top * 0.3],
          [width - padding.right, height - padding.bottom],
        ])
        .on("start", brushStart)
        .on("brush", brushing)
        .on("end", brushEnd);

      svg.call(brush);

      setClearBrushTrigger(() => {
        d3.brush().move(svg);
        bars.classed("active", false);
      });
      // console.log("brush_go", brush_go);
    });
    return <svg id="ana-time-line-svg" width="100%" height="100%" />;
  }
);

export default TimeLine;
