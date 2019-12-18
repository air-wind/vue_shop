<template>
<div>
  <!--面包屑导航区-->
  <el-breadcrumb>
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>数据统计</el-breadcrumb-item>
    <el-breadcrumb-item>数据报表</el-breadcrumb-item>
  </el-breadcrumb>
  <!--数据报表卡片区-->
  <el-card>
    <div id="main" style="width: 600px;height:400px;"></div>
  </el-card>
</div>
</template>

<script>
// 引入echarts
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'Report',
  // 当Dom准备好了
  mounted () {
    this.buildChart()
  },
  data () {
    return {
      // 图表的数据
      reportData: [],
      // 需要合并的数据(图表的配置项)
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {
    // 获取折线图数据
    async getReportData () {
      const { data: res } = await this.$http.get('reports/type/1')
      if (res.meta.status !== 200) return this.$message.error('获取数据失败!')
      this.reportData = res.data
    },
    // 生成图表
    async buildChart () {
      await this.getReportData()
      // 基于准备好的dom，初始化echarts实例
      var myChart = echarts.init(document.getElementById('main'))
      // 图表的配置项和数据
      const result = _.merge(this.options, this.reportData)
      console.log(result)
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(result)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
