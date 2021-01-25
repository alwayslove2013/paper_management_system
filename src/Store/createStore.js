import * as d3 from "d3";

const debug = false;

const createStore = () => {
  return {
    papers: [],
    maxUnitBlockPaperCount: 0,
    doi2paperBlockPos: {},
    setPapers(papers, compareAttr = "CitationCount") {
      papers.forEach((paper, i) => {
        if (paper.DOI === "#") {
          paper.DOI = `tmp-${i}`;
        }
        if (paper.CitationCount === "") {
          paper.CitationCount = 0;
        }
      });
      // 先按引用量排序，再去统计分组的排序，这个时间消耗其实还挺大的。
      papers.sort((a, b) => b[compareAttr] - a[compareAttr]);
      this.papers = papers;

      const unitBlockCount = {};
      let maxUnitBlockPaperCount = 0;
      this.papers.forEach((paper) => {
        const doi = paper.DOI;
        const xAttr = paper[this.unitXAttr];
        const yAttr = paper[this.unitYAttr];
        if (!(xAttr in unitBlockCount)) {
          unitBlockCount[xAttr] = {};
        }
        if (!(yAttr in unitBlockCount[xAttr])) {
          unitBlockCount[xAttr][yAttr] = 0;
        }
        this.doi2paperBlockPos[doi] = unitBlockCount[xAttr][yAttr];

        unitBlockCount[xAttr][yAttr] += 1;
        if (maxUnitBlockPaperCount < unitBlockCount[xAttr][yAttr]) {
          maxUnitBlockPaperCount = unitBlockCount[xAttr][yAttr]
        }
      });
      this.maxUnitBlockPaperCount = maxUnitBlockPaperCount * 0.95;
      // this.maxUnitBlockPaperCount = 90;
    },
    get paperCount() {
      return this.papers.length;
    },

    unitXAttr: "Year",
    setUnitXAttr(attrName) {
      this.unitXAttr = attrName;
    },
    get unitXAttrList() {
      const xAttrSet = new Set();
      this.papers.forEach((paper) => {
        xAttrSet.add(paper[this.unitXAttr]);
      });
      const xAttrList = Array.from(xAttrSet);
      xAttrList.sort((a, b) => b - a);
      return xAttrList;
    },
    unitYAttr: "Conference",
    setUnitYAttr(attrName) {
      this.unitYAttr = attrName;
    },
    get unitYAttrList() {
      return ['SciVis', 'InfoVis', 'VAST', 'PacificVis']
      // const yAttrSet = new Set();
      // this.papers.forEach((paper) => {
      //   yAttrSet.add(paper[this.unitYAttr]);
      // });
      // const yAttrList = Array.from(yAttrSet);
      // yAttrList.sort();
      // return yAttrList;
    },

    userId: "",
    setUserId(userId) {
      this.userId = userId;
      debug && console.log("change userId", this.userId);
    },
  };
};

export default createStore;
