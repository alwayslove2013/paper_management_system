import React from "react";
import "./index.scss";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";

const DetailView = observer(() => {
  const store = useGlobalStore();
  const { currentSelectedPaper } = store;
  console.log("currentSelectedPaper", currentSelectedPaper);
  return <div className="detail-view">DetailView</div>;
});

export default DetailView;
