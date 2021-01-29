import React from "react";
import "./index.scss";
import userList from "../../Common/userList";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { Select } from "antd";
const { Option } = Select;

const Header = observer(() => {
  const store = useGlobalStore();
  const handleChange = (userId) => {
    store.setUserId(userId);
  };
  return (
    <div className="header">
      <div className="title">Paper Management System</div>
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
      </div>
    </div>
  );
});

export default Header;
