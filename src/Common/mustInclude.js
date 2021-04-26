// List A 必须包括 List B, 同时长度限制在count内

const mustInclude = (list, mustIncludeList, count) => {
  list = list.slice(0, count);
  mustIncludeList.forEach((mustItem) => {
    if (!list.includes(mustItem)) {
      let i = list.length - 1;
      while (mustIncludeList.includes(list[i])) i -= 1;
      list[i] = mustItem;
    }
  });
  return list;
}

export default mustInclude