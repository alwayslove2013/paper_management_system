import React, { useEffect } from "react";
import "./index.scss";
import { observer } from "mobx-react-lite";
import { useGlobalStore } from "Store";

const ProjectView = observer(() => {
  const store = useGlobalStore();
  useEffect(() => {
    store.tryLda();
  }, [])
  return <div>ProjectView</div>;
});

export default ProjectView;
