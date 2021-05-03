import React, { memo, useState } from "react";
import "./index.scss";
import { Tabs } from "antd";
import { useClientRect } from "Hooks";
import * as d3 from "d3";
import { anaSvgPadding } from "Common";

const { TabPane } = Tabs;

const TagFilter = memo(({ dataSource, onChange, setChangeType }) => {
  return (
    <Tabs
    // defaultActiveKey={currentTab}
    // onChange={setCurrentTab}
    >
      {dataSource.map((data) => (
        <TabPane key={data.label} tab={data.label}>
          <HorizontalBar {...data} />
        </TabPane>
      ))}
    </Tabs>
  );
});

const HorizontalBar = ({ label, value, data }) => {
  console.log(label, value, data);
  const divId = `tag-filter-${value}`;
  const clientRect = useClientRect({ svgId: divId });
  const { width = 0 } = clientRect;
  const barWidth = width * 0.7;
  const barHeight = width * 0.03;

  data = data.filter((d) => d.all > 0).sort((a, b) => b.all - a.all);
  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.all)])
    .nice()
    .range([0, barWidth]);

  return (
    <div id={divId}>
      {data.map((d) => (
        <div className="tag-bar-row" key={d.label}>
          <div className="tag-label single-row">
            {d.label === "Usa" ? "USA" : d.label}
          </div>
          <div className="tag-bar"></div>
          <div className="tag-count">{d.all}</div>
        </div>
      ))}
    </div>
  );
};

export default TagFilter;
