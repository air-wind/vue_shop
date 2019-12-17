<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片面板区-->
    <el-card>
      <!--信息提示区-->
      <el-alert
        title="添加商品信息"
        type="info"
        :closable="false"
        center
        show-icon>
      </el-alert>
      <!--步骤条区-->
      <el-steps :space="200" :active="activeStep" finish-status="success" align-center>
        <el-step title="基本参数"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--添加表单-->
      <el-form label-position="top" :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <!--纵向导航区-->
        <el-tabs tab-position="left" @tab-click="switchTab" :before-leave="beforeLeave">
          <el-tab-pane label="基本参数">
            <el-form-item label="商品名称:" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格:" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量:" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量:" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品种类:">
              <el-cascader
                v-model="selectedIds"
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数">
            <el-form-item v-for="item in manyParamsList" :key="item.attr_id" :label="`${item.attr_name}`">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(param, index) in item.attr_vals" :key="index" :label="param" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性">
            <el-form-item v-for="item in onlyParamsList" :key="item.attr_id" :label="`${item.attr_name}`">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(param, index) in item.attr_vals" :key="index" :label="param" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              ref="uploadRef"
              :headers="uploadHeaders"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handlSuccess"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <!--图片预览dialog-->
            <el-dialog :visible.sync="PicturePreviewDialogVisible">
              <img width="100%" :src="priviewPicUrl" alt="">
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="商品内容">
            <!--富文本编辑器-->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Add',
  created () {
    // 获取商品分类列表
    this.getCateList()
  },
  data () {
    return {
      // 激活的步骤
      activeStep: 0,
      // 添加商品表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_cat: '',
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加商品表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '不可为空', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '不可为空', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '不可为空', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '不可为空', trigger: 'blur' }
        ]
      },
      // 商品分类
      cateList: [],
      // 商品分类联级选择id数组
      selectedIds: [],
      // 联级选择配置
      cascaderProps: {
        expandTrigger: 'hover',
        children: 'children',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 动态参数列表
      manyParamsList: [],
      // 静态参数列表
      onlyParamsList: [],
      // 控制图片预览dialog展示
      PicturePreviewDialogVisible: false,
      // 上传文件的请求头
      uploadHeaders: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片地址
      priviewPicUrl: ''
    }
  },
  methods: {
    async switchTab (tab) {
      // 点击taps切花步骤条
      this.activeStep = parseInt(tab.index)
      if (tab.index === '1') {
        // 获取动态/静态 参数列表
        // 有bug,无法获取this.manyParamsList
        // await this.getParamsList('many', this.manyParamsList)
        this.manyParamsList = await this.getParamsList('many')
      } else if (tab.index === '2') {
        this.onlyParamsList = await this.getParamsList('only')
      }
    },
    // 获取商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    },
    // 获取参数列表
    async getParamsList (sel) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: `${sel}` } })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
      })
      return res.data
    },
    // 联级选择变化处理
    handleChange () {
      if (this.selectedIds.length !== 3) {
        this.selectedIds = []
        return this.$message.error('只能选择三级标签')
      }
    },
    // 切换tab前验证
    beforeLeave (activeName, oldActiveName) {
      if ((this.selectedIds.length !== 3) && (oldActiveName === '0')) {
        // 表单验证失败
        this.$message.error('请先选择商品种类')
        return false
      }
    },
    // 处理图片预览
    handlePictureCardPreview (file) {
      this.priviewPicUrl = file.response.data.url
      this.PicturePreviewDialogVisible = true
    },
    // 处理图片移除
    handleRemove (file) {
      const tmpPath = file.response.data.tmp_path
      // 获取index
      const index = this.addForm.pics.findIndex(item => item.pic === tmpPath)
      this.addForm.pics.splice(index, 1)
      console.log(this.addForm)
    },
    // 当图片上传成功时
    handlSuccess (response) {
      if (response.meta.status !== 200) {
        return this.$message.error('上传失败!')
      }
      this.addForm.pics.push({ 'pic': response.data.tmp_path })
      console.log(this.addForm)
      this.$message.success('上传成功!')
    },
    async addGoods () {
      // 验证表单
      const valid = await this.$refs.addFormRef.validate().catch(err => err)
      if (!valid) return this.$message.error('请填写必要的表单项!')
      // 处理分类列表
      this.addForm.goods_cat = this.selectedIds.join(',')
      // 处理动态参数
      this.manyParamsList.forEach(item => {
        this.addForm.attrs.push({
          'attr_id': item.attr_id,
          'attr_value': item.attr_vals.join(' ')
        })
      })
      // 处理静态静态属性
      this.onlyParamsList.forEach(item => {
        this.addForm.attrs.push({
          'attr_id': item.attr_id,
          'attr_value': item.attr_value
        })
      })
      const { data: res } = await this.$http.post('goods', this.addForm)
      if (res.meta.status !== 201) return this.$message.error('添加失败!')
      this.$message.success('添加成功!')
      this.$router.push('/goods')
    }
  },
  computed: {
    // 选中的三级分类id
    cateId () {
      if (this.selectedIds.length === 3) {
        return this.selectedIds[2]
      }
      return 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 15px 15px 0 !important;
}
.el-button{
  margin: 15px 0 0 0;
}
</style>
