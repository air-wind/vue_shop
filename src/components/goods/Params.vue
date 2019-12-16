<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片面板区-->
    <el-card>
      <!--消息提示区-->
      <el-alert
        show-icon
        :closable="false"
        title="注意： 只允许为第三级分类添加相关参数！"
        type="warning">
      </el-alert>
      <!--商品分类选择框-->
      <el-row class="cate_select">
        <el-col :span="12">
          <span>选择商品分类：</span>
          <!--级联选择框-->
          <el-cascader
            v-model="cascaderSlectedIds"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!--tab导航区-->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="buttonIsActive" @click="showAddDialog">添加参数</el-button>
          <!--动态参数表格-->
          <el-table
            border
            :data="manyTableData"
            style="width: 100%">
            <!--展开行-->
            <el-table-column type="expand" >
              <template slot-scope="scope">
                <!--循环渲染所有tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="delAttrValue(i, scope.row)">{{item}}</el-tag>
                <!--添加输入框-->
                <!--enter键盘按下同时会触发blur, 将keyup.enter键执行blur, 解决触发两次的问题-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="addTagInputRef"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            >
            </el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="buttonIsActive" @click="showAddDialog">添加属性</el-button>
          <!--静态属性表格-->
          <el-table
            border
            :data="onlyTableData"
            style="width: 100%">
            <!--展开行-->
            <el-table-column type="expand" >
              <template slot-scope="scope">
                <!--循环渲染所有tag标签-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="delAttrValue(i, scope.row)">{{item}}</el-tag>
                <!--添加输入框-->
                <!--enter键盘按下同时会触发blur, 将keyup.enter键执行blur, 解决触发两次的问题-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="addTagInputRef"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引行-->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            >
            </el-table-column>
            <el-table-column label="操作">
              <template>
                <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加属性/参数对话框-->
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="clearAddDate"
    >
      <el-form label-width="100px" :model="addFormData" ref="addFormDataRef" :rules="addFormDataRules">
        <el-form-item :label="titleText + ':'" prop="attr_name">
          <el-input v-model="addFormData.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addForm">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  created () {
    this.getCateList()
  },
  data () {
    return {
      // 分类数据
      cateList: [],
      // 级联配置项
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择的id数组
      cascaderSlectedIds: [],
      // tab栏激活的选项
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态资源数据
      onlyTableData: [],
      // 添加属性/参数对话框是否显示
      addDialogVisible: false,
      // 添加表单的绑定
      addFormData: {
        attr_name: ''
      },
      // 添加表单的验证规则
      addFormDataRules: {
        attr_name: [
          { required: true, message: '不可为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      this.cateList = res.data
    },
    // 级联选择器选择改变时函数
    handleChange () {
      // 选择的不是三级分类
      if (this.cascaderSlectedIds.length !== 3 && this.cascaderSlectedIds.length !== 0) {
        this.cascaderSlectedIds = []
        this.manyTableData = []
        this.onlyTableData = []
        return this.$message.error('只能选择三级分类！')
      }
      this.getAttributes()
    },
    // 处理tab栏点击事件
    handleClick () {
      this.getAttributes()
    },
    // 获取属性/参数
    async getAttributes () {
      const { data: res } = await this.$http.get(`categories/${this.getChildrenID}/attributes`,
        { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取失败')
      // 将字符串attr_vals转换为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制按钮与输入文本框的切换
        item.inputVisible = false
        // 文本框用户添加的内容
        item.inputValue = ''
      })
      // 分类保存数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    showAddDialog () {
      this.addDialogVisible = true
    },
    clearAddDate () {
      this.$refs.addFormDataRef.resetFields()
    },
    // 增加添加属性/参数
    async addForm () {
      const valid = await this.$refs.addFormDataRef.validate().catch(err => err)
      if (valid) {
        const { data: res } = await this.$http.post(`categories/${this.getChildrenID}/attributes`,
          { attr_name: this.addFormData.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.addDialogVisible = false
        this.getAttributes()
        this.$message.success('添加成功')
      }
      return null
    },
    // 将tag按钮切换为文本框
    showInput (item) {
      item.inputVisible = true
      // 自动获取焦点
      // $nextTick的作用是当文本框渲染完成时触发
      this.$nextTick(_ => {
        // 获取原生bom
        this.$refs.addTagInputRef.$refs.input.focus()
      })
    },
    // 当用户输入完毕时触发
    async handleInputConfirm (item) {
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        this.$message.warning('无效数据!')
        item.inputVisible = false
        return
      }
      item.attr_vals.push(item.inputValue.trim())
      item.inputValue = ''
      item.inputVisible = false
      // 发送请求,保存数据
      this.saveAttrValue()
    },
    async saveAttrValue (item) {
      const { data: res } = await this.$http.put(
        `categories/${this.getChildrenID}/attributes/${item.attr_id}`,
        { attr_name: item.attr_name, attr_sel: this.activeName, attr_vals: item.attr_vals.join(' ') }
      )
      if (res.meta.status !== 200) return this.$message.error('修改失败')
      this.$message.success('修改成功!')
    },
    // 删除参数的可选项
    delAttrValue (index, item) {
      item.attr_vals.splice(index, 1)
      this.saveAttrValue(item)
    }
  },
  computed: {
    // 添加按钮是否激活
    buttonIsActive () {
      if (this.cascaderSlectedIds.length === 3) return false
      return true
    },
    // 获取三级分类id
    getChildrenID () {
      if (this.cascaderSlectedIds.length === 3) {
        return this.cascaderSlectedIds[2]
      }
      return null
    },
    // 动态获取当前添加的属性/参数
    titleText () {
      if (this.activeName === 'many') return '动态参数'
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
  .cate_select{
    margin: 15px 0;
  }
  .el-tag{
    margin: 5px 10px;
  }
  /*添加输入框*/
  .input-new-tag{
    width: 120px;
  }
</style>
