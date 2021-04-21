import React, { useEffect } from "react";
import { useGlobalStore } from "../Store";

const AnalysisPage = () => {
  const store = useGlobalStore();
  useEffect(() => {
    store.setCurrentPage();
  }, []);
  return <div>AnalysisPage</div>;
};

export default AnalysisPage;
