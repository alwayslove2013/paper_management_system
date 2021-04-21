import React from "react";
import "./index.scss";
import userList from "../../Common/userList";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { Select, Button } from "antd";
const { Option } = Select;

const Header = observer(() => {
  const store = useGlobalStore();
  const handleChange = (userId) => {
    store.setUserId(userId);
  };
  const { currentPage } = store;
  const title = `Literature ${currentPage} System`;
  const switchPage = currentPage === "Analysis" ? "management" : "analysis";
  const SwitchButton = () => (
    <Link to={switchPage} className="switch-button">
      {switchPage}
    </Link>
  );
  return (
    <div className="header">
      <div className="title">{title}</div>
      <div className="user-selector title">
        User: &nbsp;
        <Select
          value={store.userId}
          size="small"
          onChange={handleChange}
          style={{ width: 130 }}
          placeholder="Set User"
        >
          {userList.map((user) => (
            <Option value={user} key={user}>
              {user}
            </Option>
          ))}
        </Select>
        <SwitchButton />
      </div>
    </div>
  );
});

export default Header;
