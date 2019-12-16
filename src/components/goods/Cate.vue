<template>
<div>
  <!--面包屑导航区-->
  <el-breadcrumb>
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!--卡片视图区-->
  <el-card>
    <!--添加分类按钮-->
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!--表格区-->
    <tree-table
      class="treeTable"
      :data="cateList"
      :columns="columns"
      show-index
      index-text=""
      :selection-type="false"
      :expand-type="false"
      border
      :show-row-hover="false"
    >
      <template slot="isActive" slot-scope="scope">
        <i style="color: lightgreen" class="el-icon-success" v-if="scope.row.cat_deleted === false"></i>
        <i style="color: red" class="el-icon-error" v-else></i>
      </template>
      <template slot="order" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
        <el-tag type="warning" v-else-if="scope.row.cat_level === 1">二级</el-tag>
        <el-tag type="info" v-else>三级</el-tag>
      </template>
      <template slot="operation">
        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
      </template>
    </tree-table>
    <!--分页区-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[4, 5, 6, 7]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>
  <!--添加分类dialog区-->
  <el-dialog
    title="添加分类"
    :visible.sync="addCateVisible"
    width="50%"
    @close="clearAddedCate"
  >
    <el-form
      :model="addCateForm"
      :rules="addCateRules"
      ref="addCateRef"
      label-width="100px"
    >
      <el-form-item label="分类名称：" prop="cat_name">
        <el-input v-model="addCateForm.cat_name"></el-input>
      </el-form-item>
      <el-form-item label="分类父级：">
        <!--级联选择框-->
        <el-cascader
          v-model="cascaderSlectedIds"
          :options="parentCateList"
          :props="cascaderProps"
          clearable
          @change="handleChange"
        >
        </el-cascader>
      </el-form-item>
    </el-form>
    <span slot="footer" class="addCate-footer">
      <el-button @click="addCateVisible = false">取 消</el-button>
      <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
  </el-dialog>

</div>
</template>

<script>
export default {
  name: 'Cate',
  created () {
    this.getCateList()
  },
  data () {
    return {
      cateList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // cateList总数(分页)
      total: 0,
      // tree-tablel列表数据配置项
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isActive'
        },
        {
          label: '是否有效',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      // 添加分类dialog是否展示
      addCateVisible: false,
      // 添加分类Form绑定的数据
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类Form验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器绑定的id数组
      cascaderSlectedIds: [],
      // 级联配置项
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      }
    }
  },
  methods: {
    // 获取全部分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.total = res.data.total
      this.cateList = res.data.result
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 打开添加分类对话框
    showAddCateDialog () {
      this.getParentCateList()
      this.addCateVisible = true
    },
    // 获取父级分类
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.parentCateList = res.data
    },
    // 级联选择器选择改变时
    handleChange (cascaderSlectedIds) {
      this.addCateForm.cat_level = cascaderSlectedIds.length
      if (cascaderSlectedIds.length === 0) {
        this.addCateForm.cat_pid = 0
      } else {
        this.addCateForm.cat_pid = cascaderSlectedIds[cascaderSlectedIds.length - 1]
      }
    },
    // 添加分类
    async addCate () {
      const { data: res } = await this.$http.post('categories', this.addCateForm)
      if (res.meta.status !== 201) return this.$message.error('添加失败')
      this.addCateVisible = false
      this.$message.success('添加成功')
      this.getCateList()
    },
    // 清除上次添加数据
    clearAddedCate () {
      this.cascaderSlectedIds = []
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
</style>
