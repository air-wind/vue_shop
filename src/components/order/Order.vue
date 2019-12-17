<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--权限列表卡片区-->
    <el-card>
      <!--搜索框区-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="orderFormInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--订单数据表格区-->
      <el-table
        :data="orderForm"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.order_pay==='0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormate}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            <el-button size="mini" type="success" icon="el-icon-location" @click="showLogisticsialog(scope.row.order_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="orderFormInfo.pagenum"
        :page-sizes="[10, 20, 25, 30]"
        :page-size="orderFormInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--物流dialog展示区-->
    <el-dialog
      title="物流信息:"
      :visible.sync="logisticsDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logisticsData"
          :key="index"
          :timestamp="activity.time">
          <span>{{activity.context}}</span>
          <span>{{activity.time}}</span>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Order',
  created () {
    this.getOrderList()
  },
  data () {
    return {
      // 订单数据查询信息
      orderFormInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单数据
      orderForm: [],
      // 物流信息对话框
      logisticsDialogVisible: false,
      // 物流信息
      logisticsData: []
    }
  },
  methods: {
    // 获取订单数据
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.orderFormInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单失败!')
      this.orderForm = res.data.goods
      this.total = res.data.total
    },
    // 分页功能实现
    handleSizeChange (newSize) {
      this.orderFormInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newPage) {
      this.orderFormInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示物流信息对话框
    async showLogisticsialog (id) {
      const { data: res } = await this.$http.get(`/kuaidi/1106975712662`)
      if (res.meta.status !== 200) return this.$message.error('获取物流信息失败!')
      this.logisticsData = res.data
      this.logisticsDialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>

</style>
