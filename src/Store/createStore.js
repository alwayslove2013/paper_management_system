const debug = false

const createStore = () => {
  return {
    papers: [],
    setPapers(papers) {
      this.papers = papers
    },
    get paperCount() {
      return this.papers.length
    },
    userId: '',
    setUserId(userId) {
      this.userId = userId
      debug && console.log('change userId', this.userId)
    }
  }
}

export default createStore;