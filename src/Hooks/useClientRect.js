import { useEffect, useState } from "react";
import * as d3 from "d3";

// 初始化，确定长宽
const useClientRect = ({ svgId }) => {
  const [clientRect, setClientRect] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const svg = d3.select(`#${svgId}`);
    svg.selectAll("*").remove();
    const clientRect = svg.node().getClientRects()[0];
    setClientRect(clientRect);
  }, [svgId]);
  return clientRect;
};

export default useClientRect;
