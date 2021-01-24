- 操作面板确定哪些tag是active的
  ```shell
  // UserActiveTags
  {
    Country: [
      {
        value: 'China',
        color: 'red'
      }
    ],
    PrivateTag: [
      {
        value: 'graph',
        color: 'green'
      },
      {
        value: 'classic',
        color: 'blue'
      }
    ]
  }
  ```
- 搜索当tag处理

- UnitView为每个论文单元进行分配
  - 给每一个Unit
    - paper属性列表
    - 与active tag的交集
  ```shell
  // viewIsActive 系统是不是有激活状态
  ```
  - 默认状态 - 灰色map引用量
  - 控制面板激活
    - 单元激活
      - opacity 1
      - 颜色方案 1个以上
    - 单元不激活
      - opacity 0.5