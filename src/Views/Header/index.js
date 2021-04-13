import React from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./index.scss";
import userList from "../../Common/userList";
import { useGlobalStore } from "../../Store";
import { observer } from "mobx-react-lite";
import { Select } from "antd";
import { baseUrl } from "../../Server";

const { Option } = Select;

const Header = observer(() => {
  const store = useGlobalStore();
  const handleChange = (userId) => {
    store.setUserId(userId);
  };
  const url = baseUrl + "add_papers";
  const props = {
    action: url,
    // customRequest: (d, t, g) => {
    //   console.log("d", d);
    //   console.log("t", t);
    //   console.log("g", g);
    // },
    beforeUpload: (file, fileList) => {
      console.log("===> file", file);
      console.log("===> fileList", fileList);
      // store.update(file)
      return true;
    },
    onChange: (info) => {
      console.log("===>info", info);
      console.log(info.fileList);
    },
    itemRender: () => <></>,
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
        <Upload {...props}>
          <Button className="add-data" icon={<UploadOutlined />} size="small">
            Upload
          </Button>
        </Upload>
      </div>
    </div>
  );
});

export default Header;
