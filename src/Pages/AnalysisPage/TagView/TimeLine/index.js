import React, { useEffect } from "react";
import "./index.scss";
import * as d3 from "d3";
import { useClientRect } from "Hooks";
import { anaTimeSvgPadding as padding } from "Common";

const TimeLine = React.memo(
  ({
    data,
    onInput = () => {},
    onChange = () => {},
    setClearBrushTrigger = () => {},
    anaFilterType,
    setAnaFilterType = () => {},
  }) => {
    // const padding = anaTimeSvgPadding;
    const clientRect = useClientRect({
      svgId: "ana-time-line-svg",
    });
    const { width, height } = clientRect;

    const initYearRange = [d3.min(data, (d) => d.x), d3.max(data, (d) => d.x)];
    useEffect(() => {
      onInput(initYearRange);
    }, [data]);

    useEffect(() => {
      if (data.length === 0 || width === 0 || height === 0) return;
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.x))
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
          .call(d3.axisBottom(x).tickValues(d3.range(initYearRange[0], initYearRange[1], 5)).tickSizeOuter(0));
      const yAxis = (g) =>
        g
          .attr("transform", `translate(${width - padding.right},0)`)
          .call(d3.axisRight(y).ticks(6))
          .call((g) => g.select(".domain").remove());

      const svg = d3.select("#ana-time-line-svg");
      // svg.selectAll("*").remove();
      const barsG = svg.append("g").classed("non-active-bars", true);
      const bars = barsG
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => (d.rectX = x(d.x)))
        .attr("y", (d) => y(d.all))
        .attr("height", (d) => y(0) - y(d.all))
        .attr("width", x.bandwidth());

      const highlightBarsG = svg
        .append("g")
        .classed("active-bars", true)
        .classed("highlight-bars", true);

      svg.append("g").attr("class", "x-axis").call(xAxis);

      svg.append("g").attr("class", "y-axis").call(yAxis);

      const brushStart = () => {
        setAnaFilterType("year");
      };

      const brushing = ({ selection }) => {
        bars.classed(
          "active-bars",
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
        if (selection) {
          const brushYear = data
            .filter(
              (d) =>
                d.rectX + x.bandwidth() > selection[0] && d.rectX < selection[1]
            )
            .map((d) => d.x);
          brushYear.length >= 1
            ? onChange([brushYear[0], brushYear[brushYear.length - 1]])
            : onChange(initYearRange);
        } else {
          bars.classed("active-bars", false);
          onInput(initYearRange);
          setAnaFilterType("none");
          onChange(initYearRange);
        }
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
        bars.classed("active-bars", false);
      });
    }, [clientRect]);

    useEffect(() => {
      if (
        width === 0 ||
        height === 0 ||
        anaFilterType === "year" ||
        anaFilterType === "none"
      )
        return;
      const svg = d3.select("#ana-time-line-svg");
      const highlightBarsG = svg.select(".highlight-bars");
      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.x))
        .range([padding.left, width - padding.right])
        .padding(0.2);
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.all)])
        .nice()
        .range([height - padding.bottom, padding.top]);
      const highlightBars = highlightBarsG
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.x))
        .attr("y", (d) => y(d.highlight))
        .attr("height", (d) => y(0) - y(d.highlight))
        .attr("width", x.bandwidth());
    }, [data, anaFilterType]);
    return <svg id="ana-time-line-svg" width="100%" height="100%" />;
  }
);

export default TimeLine;
