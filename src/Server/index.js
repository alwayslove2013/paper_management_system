import qs from "qs";

const baseUrl = "http://vis.pku.edu.cn/vis4vis/";
const fetchData = (url, params = "") => {
  const getUrl =
    baseUrl + url + (url.includes("?") ? "&" : "?") + qs.stringify(params);
  return new Promise((resolve, reject) => {
    fetch(getUrl)
      .then((res) => res.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err));
  });
};

export const getPublicTags = async () => {
  return await fetchData("get_public_tags");
};

export const getPrivateTags = async ({ uid }) => {
  return await fetchData("get_private_tags", { uid });
};

export const setPublicTags = ({ pid, paper }) => {
  const tags = paper.publicTags;
  fetchData("set_public_tags", { pid, tags: tags.join(",") });
  return "OK";
};

export const setPrivateTags = ({ uid, pid, paper }) => {
  const { privateTags, read } = paper;
  uid &&
    fetchData("set_private_tags", {
      uid,
      pid,
      tags: [...privateTags, read && "read"].filter((a) => a).join(","),
    });
  return "OK";
};
