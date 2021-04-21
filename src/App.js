import React from "react";
import "./App.scss";
import { StoreProvider } from "./Store";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ManagePage from "./ManagePage";
import Analysis from "./AnalysisPage";
import Header from "./Components/Header";

const App = () => {
  return (
    <StoreProvider>
      <Router>
        <div className="view-container">
          <div className="header-container">
            <Header />
          </div>
          <Switch>
            <Route path="/management" component={ManagePage} />
            <Route path="/analysis" component={Analysis} />
            <Route path="/" component={ManagePage} />
          </Switch>
        </div>
      </Router>
    </StoreProvider>
  );
};

export default App;
