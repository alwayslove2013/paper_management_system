const mostCommon = (items, n = 10) => {
  const item2Count = {};
  items.forEach((itemList) => {
    itemList.forEach((item) => {
      if (item) {
        if (item in item2Count) {
          item2Count[item] += 1;
        } else {
          item2Count[item] = 1;
        }
      }
    });
  });
  const itemCountList = [];
  for (let item in item2Count) {
    itemCountList.push({
      item,
      count: item2Count[item],
    });
  }
  itemCountList.sort((a, b) => b.count - a.count);
  return itemCountList.slice(0, n).map(a => a.item);
};

export default mostCommon;
